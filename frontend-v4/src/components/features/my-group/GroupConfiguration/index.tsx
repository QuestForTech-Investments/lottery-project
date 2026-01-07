/**
 * GroupConfiguration Component
 *
 * Main group configuration view with tabs for prizes, commissions, and footer.
 */

import { useState, useCallback, type SyntheticEvent, type FormEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
} from '@mui/material';

// Types and constants
import type { PrizesData, CommissionsData, FooterData } from './types';
import {
  TABS_STYLE,
  TAB_INDICATOR_PROPS,
  INITIAL_PRIZES_DATA,
  INITIAL_COMMISSIONS_DATA,
  INITIAL_FOOTER_DATA,
} from './constants';

// Components
import {
  PrizesSubTab,
  CommissionsSubTab,
  AllowedValuesTab,
  FooterTab,
} from './components';

// ============================================================================
// Main Component
// ============================================================================

const GroupConfiguration = (): React.ReactElement => {
  const [activeMainTab, setActiveMainTab] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<number>(0);

  // State for prizes, commissions, and footer
  const [prizesData, setPrizesData] = useState<PrizesData>(INITIAL_PRIZES_DATA);
  const [commissionsData, setCommissionsData] = useState<CommissionsData>(INITIAL_COMMISSIONS_DATA);
  const [footerData, setFooterData] = useState<FooterData>(INITIAL_FOOTER_DATA);

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
    setCommissionsData(prev => ({
      ...prev,
      [gameType]: value
    }));
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

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    alert('Configuracion actualizada (mockup)\n\nEsto enviara los datos al backend cuando este conectado.');
  }, []);

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
            <Tab label="Valores by default" />
            <Tab label="Valores permitidos" />
            <Tab label="Footer" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Tab: Valores by default */}
            {activeMainTab === 0 && (
              <Box>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 2, fontSize: '18px', fontWeight: 600 }}>
                  Comisiones y premios by default
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
                prizesData={prizesData}
                onPrizeChange={handlePrizeChange}
              />
            )}

            {/* Tab: Footer */}
            {activeMainTab === 2 && (
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
                ACTUALIZAR
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GroupConfiguration;
