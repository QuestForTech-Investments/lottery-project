/**
 * GroupConfiguration Component
 *
 * Main group configuration view with tabs for prizes, commissions, and footer.
 */

import { useState, useCallback, useEffect, type SyntheticEvent, type FormEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

// Types and constants
import type { PrizesData, CommissionsData, FooterData } from './types';
import {
  TABS_STYLE,
  TAB_INDICATOR_PROPS,
  INITIAL_PRIZES_DATA,
  INITIAL_COMMISSIONS_DATA,
  INITIAL_FOOTER_DATA,
  PRIZE_FIELDS_CONFIG,
} from './constants';

// Components
import {
  PrizesSubTab,
  CommissionsSubTab,
  AllowedValuesTab,
  FooterTab,
} from './components';

import { getGroupDefaults, saveGroupDefaults, getAllowedValues, saveAllowedValues, getFooterDefaults, saveFooterDefaults, getBpDefaults, saveBpDefaults, type GroupDefaultConfig, type AllowedValuesGroup, type FooterLine, type BpDefaultsMap } from '@/services/groupConfigService';
import useUserPermissions from '@/hooks/useUserPermissions';
import ConfigurationTab from '@components/features/betting-pools/CreateBettingPool/tabs/ConfigurationTab';
import type { AllowedValuesMap } from './components/AllowedValuesTab';

// ============================================================================
// Mapping helpers: UI (PrizesData/CommissionsData) ↔ API (GroupDefaultConfig[])
// Uses positional mapping: field[i] ↔ prizePayment{i+1}
// ============================================================================

const prizeFieldsByGameType = Object.fromEntries(
  PRIZE_FIELDS_CONFIG.map(c => [c.gameType, Object.keys(c.fields)])
);

const toConfigs = (prizes: PrizesData, commissions: CommissionsData): GroupDefaultConfig[] => {
  return PRIZE_FIELDS_CONFIG.map((c): GroupDefaultConfig => {
    const fields = prizeFieldsByGameType[c.gameType];
    const prizeEntry = prizes[c.gameType] as Record<string, string>;
    const toNum = (v?: string) => v !== undefined && v !== '' ? parseFloat(v) : null;
    return {
      gameType: c.gameType,
      prizePayment1: toNum(prizeEntry?.[fields[0]]),
      prizePayment2: toNum(prizeEntry?.[fields[1]]),
      prizePayment3: toNum(prizeEntry?.[fields[2]]),
      prizePayment4: toNum(prizeEntry?.[fields[3]]),
      prizePayment5: toNum(prizeEntry?.[fields[4]]),
      prizePayment6: toNum(prizeEntry?.[fields[5]]),
      commission1: toNum(commissions[c.gameType]),
    };
  });
};

// Boolean-typed BP config keys (the rest are stored as strings)
const BP_BOOLEAN_KEYS = new Set([
  'enableTemporaryBalance', 'controlWinningTickets', 'allowJackpot',
  'printEnabled', 'printTicketCopy', 'smsOnly', 'enableRecharges',
  'printRechargeReceipt', 'allowPasswordChange', 'useCentralLogo',
  'enableAutoLogout', 'showStatsPanel',
  'statCredit', 'statSales', 'statPercentage', 'statPrize', 'statNet',
  'statDiscount', 'statFinal', 'statBalance', 'statFall', 'statAccumulatedFall',
]);

// Keys that are banca-specific and never part of group defaults
const BP_EXCLUDED_KEYS = new Set(['isActive', 'bettingPoolId']);

const mapToFormData = (map: BpDefaultsMap): Record<string, string | boolean | null> => {
  const result: Record<string, string | boolean | null> = {};
  Object.entries(map).forEach(([k, v]) => {
    if (BP_EXCLUDED_KEYS.has(k)) return;
    result[k] = BP_BOOLEAN_KEYS.has(k) ? v === 'true' : v;
  });
  return result;
};

const formDataToMap = (fd: Record<string, string | boolean | null>): BpDefaultsMap => {
  const result: BpDefaultsMap = {};
  Object.entries(fd).forEach(([k, v]) => {
    if (BP_EXCLUDED_KEYS.has(k)) return;
    if (v === null || v === undefined) return;
    result[k] = typeof v === 'boolean' ? String(v) : String(v);
  });
  return result;
};

const fromConfigs = (configs: GroupDefaultConfig[]): { prizes: PrizesData; commissions: CommissionsData } => {
  const prizes: PrizesData = JSON.parse(JSON.stringify(INITIAL_PRIZES_DATA));
  const commissions: CommissionsData = { ...INITIAL_COMMISSIONS_DATA };

  configs.forEach(cfg => {
    const fields = prizeFieldsByGameType[cfg.gameType];
    if (!fields) return;
    const slots = [cfg.prizePayment1, cfg.prizePayment2, cfg.prizePayment3, cfg.prizePayment4, cfg.prizePayment5, cfg.prizePayment6];
    const target = (prizes as unknown as Record<string, Record<string, string>>)[cfg.gameType];
    if (!target) return;
    fields.forEach((fieldName, i) => {
      if (slots[i] != null) target[fieldName] = String(slots[i]);
    });
    if (cfg.commission1 != null) {
      commissions[cfg.gameType] = String(cfg.commission1);
    }
  });

  return { prizes, commissions };
};

// ============================================================================
// Main Component
// ============================================================================

const GroupConfiguration = (): React.ReactElement => {
  const { hasPermission, loading: permLoading } = useUserPermissions();
  const canManage = hasPermission('MANAGE_MY_GROUP');
  const [activeMainTab, setActiveMainTab] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<number>(0);

  // State for prizes, commissions, and footer
  const [prizesData, setPrizesData] = useState<PrizesData>(INITIAL_PRIZES_DATA);
  const [commissionsData, setCommissionsData] = useState<CommissionsData>(INITIAL_COMMISSIONS_DATA);
  const [footerData, setFooterData] = useState<FooterData>(INITIAL_FOOTER_DATA);
  const [allowedValues, setAllowedValues] = useState<AllowedValuesMap>({});
  const [bpConfig, setBpConfig] = useState<Record<string, string | boolean | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    (async () => {
      try {
        const [configs, allowed, footerLines, bpDefaults] = await Promise.all([
          getGroupDefaults(),
          getAllowedValues(),
          getFooterDefaults(),
          getBpDefaults(),
        ]);
        if (configs.length > 0) {
          const { prizes, commissions } = fromConfigs(configs);
          setPrizesData(prizes);
          setCommissionsData(commissions);
        }
        const map: AllowedValuesMap = {};
        allowed.forEach(g => {
          if (!map[g.gameType]) map[g.gameType] = {};
          map[g.gameType][g.fieldKey] = g.values;
        });
        setAllowedValues(map);

        if (footerLines.length > 0) {
          const nextFooter: FooterData = { ...INITIAL_FOOTER_DATA };
          footerLines.forEach(l => {
            if (l.lineNumber >= 1 && l.lineNumber <= 6) {
              const key = `line${l.lineNumber}` as keyof FooterData;
              nextFooter[key] = l.lineText || '';
            }
          });
          setFooterData(nextFooter);
        }

        setBpConfig(mapToFormData(bpDefaults || {}));
      } catch (err) {
        console.error('Error loading group config:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAllowedValuesChange = useCallback((gameType: string, fieldKey: string, values: number[]): void => {
    setAllowedValues(prev => ({
      ...prev,
      [gameType]: { ...(prev[gameType] || {}), [fieldKey]: values }
    }));
  }, []);

  // Handlers
  const handlePrizeChange = useCallback((gameType: keyof PrizesData, field: string, value: string): void => {
    setPrizesData(prev => ({
      ...prev,
      [gameType]: {
        ...prev[gameType],
        [field]: value
      }
    }));
  }, []);

  const handleCommissionChange = useCallback((gameType: string, value: string): void => {
    setCommissionsData(prev => {
      if (gameType === 'general') {
        // Shortcut: propagate to all game type commissions
        const next: CommissionsData = { ...prev, general: value };
        Object.keys(next).forEach(k => {
          if (k !== 'general') next[k] = value;
        });
        return next;
      }
      return { ...prev, [gameType]: value };
    });
  }, []);

  const handleMainTabChange = useCallback((_event: SyntheticEvent, newValue: number): void => {
    setActiveMainTab(newValue);
    setActiveSubTab(0);
  }, []);

  const handleSubTabChange = useCallback((_event: SyntheticEvent, newValue: number): void => {
    setActiveSubTab(newValue);
  }, []);

  const handleFooterChange = useCallback((field: keyof FooterData, value: string): void => {
    setFooterData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      const allowedGroups: AllowedValuesGroup[] = [];
      Object.entries(allowedValues).forEach(([gt, fields]) => {
        Object.entries(fields).forEach(([fk, vals]) => {
          allowedGroups.push({ gameType: gt, fieldKey: fk, values: vals });
        });
      });

      const footerLines: FooterLine[] = ([1, 2, 3, 4, 5, 6] as const).map(n => ({
        lineNumber: n,
        lineText: footerData[`line${n}` as keyof FooterData] || ''
      }));

      await Promise.all([
        saveGroupDefaults(toConfigs(prizesData, commissionsData)),
        saveAllowedValues(allowedGroups),
        saveFooterDefaults(footerLines),
        saveBpDefaults(formDataToMap(bpConfig)),
      ]);
      setSnack({ open: true, message: 'Configuración actualizada', severity: 'success' });
    } catch (err) {
      console.error('Error saving group config:', err);
      setSnack({ open: true, message: 'Error al guardar. Intente nuevamente.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, [prizesData, commissionsData, allowedValues, footerData, bpConfig]);

  if (!permLoading && !canManage) {
    return (
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
          <Alert severity="error">
            No tiene permiso para acceder a esta sección. Se requiere el permiso <strong>MANAGE_MY_GROUP</strong>.
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
        Actualizar grupo
      </Typography>

      <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <CardContent>
          {/* Main Tabs */}
          <Tabs
            value={activeMainTab}
            onChange={handleMainTabChange}
            sx={TABS_STYLE}
            TabIndicatorProps={TAB_INDICATOR_PROPS}
          >
            <Tab label="Premios y Comisiones Predeterminados" />
            <Tab label="Valores permitidos" />
            <Tab label="Configuración Predeterminada" />
            <Tab label="Pie de Página" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Tab: Premios y Comisiones Predeterminados */}
            {activeMainTab === 0 && (
              <Box>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 2, fontSize: '18px', fontWeight: 600 }}>
                  Premios y comisiones predeterminados
                </Typography>

                {/* Sub-tabs */}
                <Tabs
                  value={activeSubTab}
                  onChange={handleSubTabChange}
                  sx={TABS_STYLE}
                  TabIndicatorProps={TAB_INDICATOR_PROPS}
                >
                  <Tab label="Premios" />
                  <Tab label="Comisiones" />
                </Tabs>

                {/* Sub-tab: Premios */}
                {activeSubTab === 0 && (
                  <PrizesSubTab
                    prizesData={prizesData}
                    onPrizeChange={handlePrizeChange}
                  />
                )}

                {/* Sub-tab: Comisiones */}
                {activeSubTab === 1 && (
                  <CommissionsSubTab
                    commissionsData={commissionsData}
                    onCommissionChange={handleCommissionChange}
                  />
                )}
              </Box>
            )}

            {/* Tab: Valores permitidos */}
            {activeMainTab === 1 && (
              <AllowedValuesTab
                allowedValues={allowedValues}
                onChange={handleAllowedValuesChange}
              />
            )}

            {/* Tab: Configuración Predeterminada */}
            {activeMainTab === 2 && (
              <Box>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 2, fontSize: '18px', fontWeight: 600 }}>
                  Configuración predeterminada
                </Typography>
                <ConfigurationTab
                  formData={bpConfig as unknown as Parameters<typeof ConfigurationTab>[0]['formData']}
                  handleChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    const name = target.name;
                    const value = target.type === 'checkbox' ? target.checked : target.value;
                    setBpConfig(prev => ({ ...prev, [name]: value }));
                  }}
                />
              </Box>
            )}

            {/* Tab: Footer */}
            {activeMainTab === 3 && (
              <FooterTab
                footerData={footerData}
                onFooterChange={handleFooterChange}
              />
            )}

            {/* Submit Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || loading}
                startIcon={saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
                  color: 'white',
                  px: 5,
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: 'Montserrat, sans-serif',
                  textTransform: 'uppercase'
                }}
              >
                {saving ? 'GUARDANDO…' : 'ACTUALIZAR'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GroupConfiguration;
