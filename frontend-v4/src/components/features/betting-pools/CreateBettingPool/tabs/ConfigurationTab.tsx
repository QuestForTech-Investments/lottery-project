import React, { useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  TextField,
  FormControl,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Divider,
  RadioGroup,
  Radio,
  FormLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  type SelectChangeEvent,
} from '@mui/material';
import { DeleteSweep as DeleteSweepIcon } from '@mui/icons-material';
import { clearContactsByBettingPool } from '@services/contactService';
import { FlagES, FlagUS, FlagFR, FlagHT } from '@components/common/LanguageFlags';

interface ConfigFormData {
  fallType: string;
  fallPercentage: string;
  deactivationBalance: string;
  dailySaleLimit: string;
  dailyBalanceLimit: string;
  enableTemporaryBalance: boolean;
  temporaryAdditionalBalance: string;
  isActive: boolean;
  controlWinningTickets: boolean;
  allowJackpot: boolean;
  printEnabled: boolean;
  printTicketCopy: boolean;
  smsOnly: boolean;
  minutesToCancelTicket: string;
  ticketsToCancelPerDay: string;
  maximumCancelTicketAmount: string;
  enableRecharges: boolean;
  printRechargeReceipt: boolean;
  dailyPhoneRechargeLimit: string;
  allowPasswordChange: boolean;
  allowViewCommission: boolean;
  maxTicketAmount: string;
  printerType: string;
  discountMode: string;
  discountAmount: string;
  discountPerEvery: string;
  limitPreference: string | null;
  futureSalesMode: string;
  maxFutureDays: string;
  useCentralLogo: boolean;
  enableAutoLogout: boolean;
  autoLogoutMinutes: string;
  showStatsPanel: boolean;
  statCredit: boolean;
  statSales: boolean;
  statPercentage: boolean;
  statPrize: boolean;
  statNet: boolean;
  statDiscount: boolean;
  statFinal: boolean;
  statBalance: boolean;
  statFall: boolean;
  statAccumulatedFall: boolean;
  defaultLanguage: string;
  [key: string]: string | boolean | null;
}

interface ConfigTabProps {
  formData: ConfigFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  bettingPoolId?: number;
}

/**
 * ConfigurationTab Component
 * Contains ALL configuration fields from V1 with Material-UI styling
 */
const ConfigurationTab: React.FC<ConfigTabProps> = ({ formData, handleChange, bettingPoolId }) => {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleClearContacts = async () => {
    if (!bettingPoolId) return;
    setClearing(true);
    setClearResult(null);
    try {
      const result = await clearContactsByBettingPool(bettingPoolId);
      setClearResult({ type: 'success', message: result.message });
    } catch {
      setClearResult({ type: 'error', message: t('createBettingPool.config.clearContactsError') });
    } finally {
      setClearing(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('createBettingPool.config.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Sistema Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.systemConfigTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Tipo de Caída - Radio Group */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>{t('createBettingPool.config.fallTypeLabel')}</FormLabel>
            <RadioGroup
              row
              name="fallType"
              value={formData.fallType}
              onChange={handleChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel value="1" control={<Radio />} label={t('createBettingPool.config.fallTypeOff')} />
              <FormControlLabel value="2" control={<Radio />} label={t('createBettingPool.config.fallTypeCollection')} />
              <FormControlLabel value="3" control={<Radio />} label={t('createBettingPool.config.fallTypeDaily')} />
              <FormControlLabel value="4" control={<Radio />} label={t('createBettingPool.config.fallTypeMonthly')} />
              <FormControlLabel value="5" control={<Radio />} label={t('createBettingPool.config.fallTypeWeeklyCumulative')} />
              <FormControlLabel value="6" control={<Radio />} label={t('createBettingPool.config.fallTypeWeeklyNonCumulative')} />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Porcentaje de Caída */}
        {formData.fallType !== '1' && (
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label={t('createBettingPool.config.fallPercentage')}
              name="fallPercentage"
              type="number"
              value={formData.fallPercentage}
              onChange={handleChange}
              size="small"
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />
          </Grid>
        )}

        {/* Financial Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.financialTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('createBettingPool.config.deactivationBalance')}
            name="deactivationBalance"
            value={formData.deactivationBalance}
            onChange={handleChange}
            inputProps={{ step: "0.01" }}
            helperText={t('createBettingPool.config.deactivationBalanceHelper')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('createBettingPool.config.dailySaleLimit')}
            name="dailySaleLimit"
            value={formData.dailySaleLimit}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0" }}
            helperText={t('createBettingPool.config.dailySaleLimitHelper')}
          />
        </Grid>

        {/* Enable Temporary Balance Toggle + Conditional Input */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.enableTemporaryBalance}
                onChange={handleChange}
                name="enableTemporaryBalance"
              />
            }
            label={t('createBettingPool.config.enableTemporaryBalance')}
          />
          {formData.enableTemporaryBalance && (
            <TextField
              fullWidth
              type="number"
              label={t('createBettingPool.config.temporaryAdditionalBalance')}
              name="temporaryAdditionalBalance"
              value={formData.temporaryAdditionalBalance}
              onChange={handleChange}
              inputProps={{ step: "0.01", min: "0" }}
              sx={{ mt: 2 }}
            />
          )}
        </Grid>

        {/* Toggle Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.generalOptionsTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Idioma Default */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="default-language-label">{t('createBettingPool.config.defaultLanguage')}</InputLabel>
            <Select
              labelId="default-language-label"
              label={t('createBettingPool.config.defaultLanguage')}
              name="defaultLanguage"
              value={formData.defaultLanguage || ''}
              onChange={(e: SelectChangeEvent) =>
                handleChange({
                  target: { name: 'defaultLanguage', value: e.target.value, type: 'text', checked: false },
                } as unknown as ChangeEvent<HTMLInputElement>)
              }
            >
              <MenuItem value="es">
                <Box component="span" sx={{ mr: 1, display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}><FlagES size={18} /></Box> {t('createBettingPool.config.langSpanish')}
              </MenuItem>
              <MenuItem value="en">
                <Box component="span" sx={{ mr: 1, display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}><FlagUS size={18} /></Box> {t('createBettingPool.config.langEnglish')}
              </MenuItem>
              <MenuItem value="fr">
                <Box component="span" sx={{ mr: 1, display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}><FlagFR size={18} /></Box> {t('createBettingPool.config.langFrench')}
              </MenuItem>
              <MenuItem value="ht">
                <Box component="span" sx={{ mr: 1, display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}><FlagHT size={18} /></Box> {t('createBettingPool.config.langCreole')}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange}
                name="isActive"
              />
            }
            label={t('createBettingPool.config.isActive')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.controlWinningTickets}
                onChange={handleChange}
                name="controlWinningTickets"
              />
            }
            label={t('createBettingPool.config.controlWinningTickets')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.printEnabled}
                onChange={handleChange}
                name="printEnabled"
              />
            }
            label={t('createBettingPool.config.printEnabled')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.printTicketCopy}
                onChange={handleChange}
                name="printTicketCopy"
              />
            }
            label={t('createBettingPool.config.printTicketCopy')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.useCentralLogo}
                onChange={handleChange}
                name="useCentralLogo"
              />
            }
            label={t('createBettingPool.config.useCentralLogo')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.enableAutoLogout}
                onChange={handleChange}
                name="enableAutoLogout"
              />
            }
            label={t('createBettingPool.config.autoLogout')}
          />
          {formData.enableAutoLogout && (
            <TextField
              fullWidth
              type="number"
              label={t('createBettingPool.config.autoLogoutMinutes')}
              name="autoLogoutMinutes"
              value={formData.autoLogoutMinutes}
              onChange={handleChange}
              inputProps={{ min: 1, max: 60, step: 1 }}
              size="small"
              sx={{ mt: 1 }}
              helperText={t('createBettingPool.config.autoLogoutHelper')}
            />
          )}
        </Grid>

        {/* Ticket Cancellation Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.ticketCancelTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('createBettingPool.config.minutesToCancel')}
            name="minutesToCancelTicket"
            value={formData.minutesToCancelTicket}
            onChange={handleChange}
            inputProps={{ min: "0" }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('createBettingPool.config.ticketsToCancelPerDay')}
            name="ticketsToCancelPerDay"
            value={formData.ticketsToCancelPerDay}
            onChange={handleChange}
            inputProps={{ min: "0" }}
            helperText={t('createBettingPool.config.ticketsToCancelHelper')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('createBettingPool.config.maxCancelAmount')}
            name="maximumCancelTicketAmount"
            value={formData.maximumCancelTicketAmount}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0" }}
            helperText={t('createBettingPool.config.maxCancelAmountHelper')}
          />
        </Grid>

        {/* Recharge Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.rechargesTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" icon={false} sx={{ bgcolor: '#f0f4ff', border: '1px solid #d0d9f0' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#555' }}>
              {t('createBettingPool.config.comingSoon')}
            </Typography>
          </Alert>
        </Grid>

        {/* Other Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.otherSettingsTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.allowPasswordChange}
                onChange={handleChange}
                name="allowPasswordChange"
              />
            }
            label={t('createBettingPool.config.allowPasswordChange')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.allowViewCommission}
                onChange={handleChange}
                name="allowViewCommission"
              />
            }
            label={t('createBettingPool.config.allowViewCommission')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('createBettingPool.config.maxTicketAmount')}
            name="maxTicketAmount"
            value={formData.maxTicketAmount}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0" }}
            helperText={t('createBettingPool.config.maxTicketAmountHelper')}
          />
        </Grid>

        {/* Discount Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.discountsTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Discount Mode - Radio Group */}
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>{t('createBettingPool.config.discountMode')}</FormLabel>
            <RadioGroup
              row
              name="discountMode"
              value={formData.discountMode}
              onChange={handleChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel value="1" control={<Radio />} label={t('createBettingPool.config.discountOff')} />
              <FormControlLabel value="2" control={<Radio />} label={t('createBettingPool.config.discountGroup')} />
              <FormControlLabel value="3" control={<Radio />} label={t('createBettingPool.config.discountSeller')} />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Discount Amount & Per Every - Conditional fields */}
        {(formData.discountMode === '2' || formData.discountMode === '3') && (
          <>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label={t('createBettingPool.config.discountAmount')}
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleChange}
                inputProps={{ step: "0.01", min: "0" }}
                helperText={t('createBettingPool.config.discountAmountHelper')}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label={t('createBettingPool.config.discountPerEvery')}
                name="discountPerEvery"
                value={formData.discountPerEvery}
                onChange={handleChange}
                inputProps={{ step: "1", min: "1" }}
                helperText={t('createBettingPool.config.discountPerEveryHelper')}
                error={
                  !!formData.discountPerEvery &&
                  !!formData.discountAmount &&
                  parseInt(formData.discountPerEvery) <= parseFloat(formData.discountAmount)
                }
              />
            </Grid>
          </>
        )}

        {/* Payment Mode Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.ticketPaymentTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Limit Preference - Radio Group */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>{t('createBettingPool.config.ticketPaymentTitle')}</FormLabel>
            <RadioGroup
              row
              name="limitPreference"
              value={formData.limitPreference || ''}
              onChange={handleChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel value="1" control={<Radio />} label={t('createBettingPool.config.paymentBettingPool')} />
              <FormControlLabel value="3" control={<Radio />} label={t('createBettingPool.config.paymentGroup')} />
              <FormControlLabel value="2" control={<Radio />} label={t('createBettingPool.config.paymentZone')} />
              <FormControlLabel value="" control={<Radio />} label={t('createBettingPool.config.paymentUseGroupPreference')} />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Future Sales Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.futureSalesTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">{t('createBettingPool.config.futureSalesMode')}</FormLabel>
            <RadioGroup
              name="futureSalesMode"
              value={formData.futureSalesMode}
              onChange={handleChange}
            >
              <FormControlLabel value="OFF" control={<Radio />} label={t('createBettingPool.config.futureSalesOff')} />
              <FormControlLabel value="WEEK" control={<Radio />} label={t('createBettingPool.config.futureSalesWeek')} />
              <FormControlLabel value="DAYS" control={<Radio />} label={t('createBettingPool.config.futureSalesDays')} />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('createBettingPool.config.maxFutureDays')}
            name="maxFutureDays"
            value={formData.maxFutureDays}
            onChange={handleChange}
            inputProps={{ min: "1", max: "7" }}
            disabled={formData.futureSalesMode !== 'DAYS'}
            helperText={t('createBettingPool.config.maxFutureDaysHelper')}
          />
        </Grid>

        {/* Stats Panel Configuration */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            {t('createBettingPool.config.statsPanelTitle')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.showStatsPanel}
                onChange={handleChange}
                name="showStatsPanel"
              />
            }
            label={t('createBettingPool.config.showStatsPanel')}
          />
        </Grid>

        {formData.showStatsPanel && (
          <Grid item xs={12}>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t('createBettingPool.config.selectVisibleStats')}
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={parseFloat(formData.deactivationBalance || '0') > 0 && formData.statCredit}
                        onChange={handleChange}
                        name="statCredit"
                        size="small"
                        disabled={!(parseFloat(formData.deactivationBalance || '0') > 0)}
                      />
                    }
                    label={t('createBettingPool.config.statCredit')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={<Switch checked={formData.statSales} onChange={handleChange} name="statSales" size="small" />}
                    label={t('createBettingPool.config.statSales')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={<Switch checked={formData.statPercentage} onChange={handleChange} name="statPercentage" size="small" />}
                    label={t('createBettingPool.config.statPercentage')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={<Switch checked={formData.statPrize} onChange={handleChange} name="statPrize" size="small" />}
                    label={t('createBettingPool.config.statPrize')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={<Switch checked={formData.statNet} onChange={handleChange} name="statNet" size="small" />}
                    label={t('createBettingPool.config.statNet')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={<Switch checked={formData.statDiscount} onChange={handleChange} name="statDiscount" size="small" />}
                    label={t('createBettingPool.config.statDiscount')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={<Switch checked={formData.statFinal} onChange={handleChange} name="statFinal" size="small" />}
                    label={t('createBettingPool.config.statFinal')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={<Switch checked={formData.statBalance} onChange={handleChange} name="statBalance" size="small" />}
                    label={t('createBettingPool.config.statBalance')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={<Switch checked={formData.statFall} onChange={handleChange} name="statFall" size="small" />}
                    label={t('createBettingPool.config.statFall')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <FormControlLabel
                    control={<Switch checked={formData.statAccumulatedFall} onChange={handleChange} name="statAccumulatedFall" size="small" />}
                    label={t('createBettingPool.config.statAccumulatedFall')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}

        {/* Clear Contacts - Only in edit mode */}
        {bettingPoolId && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                {t('createBettingPool.config.contactsTitle')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              {clearResult && (
                <Alert
                  severity={clearResult.type}
                  onClose={() => setClearResult(null)}
                  sx={{ mb: 2 }}
                >
                  {clearResult.message}
                </Alert>
              )}
              <Button
                variant="outlined"
                color="error"
                startIcon={clearing ? <CircularProgress size={18} /> : <DeleteSweepIcon />}
                onClick={() => setConfirmOpen(true)}
                disabled={clearing}
              >
                {t('createBettingPool.config.clearContacts')}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                {t('createBettingPool.config.clearContactsHint')}
              </Typography>
            </Grid>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
              <DialogTitle>{t('createBettingPool.config.confirmDeleteTitle')}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {t('createBettingPool.config.clearContactsConfirm')}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmOpen(false)} disabled={clearing}>
                  {t('createBettingPool.cancel')}
                </Button>
                <Button
                  onClick={handleClearContacts}
                  color="error"
                  variant="contained"
                  disabled={clearing}
                  startIcon={clearing ? <CircularProgress size={18} /> : undefined}
                >
                  {clearing ? t('createBettingPool.config.deleting') : t('createBettingPool.config.deleteAll')}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Grid>
    </Box>
  );
};

/**
 * Custom comparison function for ConfigurationTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: ConfigTabProps, nextProps: ConfigTabProps): boolean => {
  // Check if handleChange or bettingPoolId changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false;
  }
  if (prevProps.bettingPoolId !== nextProps.bettingPoolId) {
    return false;
  }

  // Check only the form fields this tab uses
  const configFields = [
    'fallType', 'deactivationBalance', 'dailySaleLimit', 'dailyBalanceLimit',
    'enableTemporaryBalance', 'temporaryAdditionalBalance', 'isActive',
    'controlWinningTickets', 'allowJackpot', 'printEnabled', 'printTicketCopy',
    'smsOnly', 'minutesToCancelTicket', 'ticketsToCancelPerDay', 'enableRecharges',
    'printRechargeReceipt', 'allowPasswordChange', 'printerType',
    'discountMode', 'discountAmount', 'discountPerEvery', 'maximumCancelTicketAmount', 'maxTicketAmount',
    'dailyPhoneRechargeLimit', 'limitPreference', 'futureSalesMode', 'maxFutureDays',
    'useCentralLogo', 'showStatsPanel', 'statCredit', 'statSales', 'statPercentage',
    'statPrize', 'statNet', 'statDiscount', 'statFinal', 'statBalance', 'statFall', 'statAccumulatedFall'
  ];

  for (const field of configFields) {
    if (prevProps.formData[field] !== nextProps.formData[field]) {
      return false;
    }
  }

  // No relevant changes, skip re-render
  return true;
};

export default React.memo(ConfigurationTab, arePropsEqual);
