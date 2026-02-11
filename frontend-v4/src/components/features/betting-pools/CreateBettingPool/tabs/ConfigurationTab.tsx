import React, { useState, type ChangeEvent } from 'react';
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
} from '@mui/material';
import { DeleteSweep as DeleteSweepIcon } from '@mui/icons-material';
import { clearContactsByBettingPool } from '@services/contactService';

interface ConfigFormData {
  fallType: string;
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
  maxTicketAmount: string;
  printerType: string;
  discountMode: string;
  discountAmount: string;
  discountPerEvery: string;
  limitPreference: string | null;
  futureSalesMode: string;
  maxFutureDays: string;
  useCentralLogo: boolean;
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
      setClearResult({ type: 'error', message: 'Error al limpiar la lista de contactos' });
    } finally {
      setClearing(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Configuración
      </Typography>

      <Grid container spacing={3}>
        {/* Sistema Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Configuración del Sistema
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Tipo de Caída - Radio Group */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Tipo de caída</FormLabel>
            <RadioGroup
              row
              name="fallType"
              value={formData.fallType}
              onChange={handleChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel value="1" control={<Radio />} label="OFF" />
              <FormControlLabel value="2" control={<Radio />} label="COBRO" />
              <FormControlLabel value="3" control={<Radio />} label="DIARIA" />
              <FormControlLabel value="4" control={<Radio />} label="MENSUAL" />
              <FormControlLabel value="5" control={<Radio />} label="SEMANAL CON ACUMULADO" />
              <FormControlLabel value="6" control={<Radio />} label="SEMANAL SIN ACUMULADO" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Financial Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Configuración Financiera
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Balance de Desactivación"
            name="deactivationBalance"
            value={formData.deactivationBalance}
            onChange={handleChange}
            inputProps={{ step: "0.01" }}
            helperText="Balance mínimo para desactivar"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Límite de Venta Diaria"
            name="dailySaleLimit"
            value={formData.dailySaleLimit}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0" }}
            helperText="Límite máximo de venta por día"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Balance Límite al Día"
            name="dailyBalanceLimit"
            value={formData.dailyBalanceLimit}
            onChange={handleChange}
            inputProps={{ step: "0.01" }}
            helperText="Límite de balance por día"
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
            label="Habilitar Balance Temporal Adicional"
          />
          {formData.enableTemporaryBalance && (
            <TextField
              fullWidth
              type="number"
              label="Valor de Balance Temporal Adicional"
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
            Opciones Generales
          </Typography>
          <Divider sx={{ mb: 2 }} />
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
            label="Activa"
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
            label="Control de Tickets Ganadores"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.allowJackpot}
                onChange={handleChange}
                name="allowJackpot"
              />
            }
            label="Permitir Pasar Bote"
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
            label="Imprimir"
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
            label="Imprimir Copia de Ticket"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.smsOnly}
                onChange={handleChange}
                name="smsOnly"
              />
            }
            label="Sólo SMS"
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
            label="Usar Logo Central"
          />
        </Grid>

        {/* Ticket Cancellation Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Cancelación de Tickets
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Minutos para Cancelar Tickets"
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
            label="Tickets a Cancelar por Día"
            name="ticketsToCancelPerDay"
            value={formData.ticketsToCancelPerDay}
            onChange={handleChange}
            inputProps={{ min: "0" }}
            helperText="Cantidad máxima de tickets que se pueden cancelar por día"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Monto Máximo para Cancelar Ticket"
            name="maximumCancelTicketAmount"
            value={formData.maximumCancelTicketAmount}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0" }}
            helperText="Monto máximo permitido para cancelación"
          />
        </Grid>

        {/* Recharge Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Configuración de Recargas
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.enableRecharges}
                onChange={handleChange}
                name="enableRecharges"
              />
            }
            label="Habilitar Recargas"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.printRechargeReceipt}
                onChange={handleChange}
                name="printRechargeReceipt"
              />
            }
            label="Imprimir Recibo de Recargas"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Monto Máximo Diario de Recargas"
            name="dailyPhoneRechargeLimit"
            value={formData.dailyPhoneRechargeLimit}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0" }}
            helperText="Límite diario para recargas telefónicas"
          />
        </Grid>

        {/* Other Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Otras Configuraciones
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
            label="Permitir Cambiar Contraseña"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Monto Máximo de Tickets"
            name="maxTicketAmount"
            value={formData.maxTicketAmount}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0" }}
            helperText="Monto máximo permitido por ticket"
          />
        </Grid>

        {/* Discount Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Descuentos
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Discount Mode - Radio Group */}
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Modo de Descuento</FormLabel>
            <RadioGroup
              row
              name="discountMode"
              value={formData.discountMode}
              onChange={handleChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel value="1" control={<Radio />} label="OFF" />
              <FormControlLabel value="2" control={<Radio />} label="GRUPO" />
              <FormControlLabel value="3" control={<Radio />} label="RIFERO" />
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
                label="Descontar"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleChange}
                inputProps={{ step: "0.01", min: "0" }}
                helperText="Monto a descontar"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="De cada"
                name="discountPerEvery"
                value={formData.discountPerEvery}
                onChange={handleChange}
                inputProps={{ step: "1", min: "1" }}
                helperText="De cada X $"
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
            Modo de Pago de Tickets
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Limit Preference - Radio Group */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Modo de Pago de Tickets</FormLabel>
            <RadioGroup
              row
              name="limitPreference"
              value={formData.limitPreference || ''}
              onChange={handleChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel value="1" control={<Radio />} label="BANCA" />
              <FormControlLabel value="3" control={<Radio />} label="GRUPO" />
              <FormControlLabel value="2" control={<Radio />} label="ZONA" />
              <FormControlLabel value="" control={<Radio />} label="USAR PREFERENCIA DE GRUPO" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Future Sales Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Ventas Futuras
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Modo de Ventas Futuras</FormLabel>
            <RadioGroup
              name="futureSalesMode"
              value={formData.futureSalesMode}
              onChange={handleChange}
            >
              <FormControlLabel value="OFF" control={<Radio />} label="No permitir ventas futuras" />
              <FormControlLabel value="WEEK" control={<Radio />} label="Hasta el domingo de esta semana" />
              <FormControlLabel value="DAYS" control={<Radio />} label="Cantidad de días específicos" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Días Máximos de Venta Futura"
            name="maxFutureDays"
            value={formData.maxFutureDays}
            onChange={handleChange}
            inputProps={{ min: "1", max: "7" }}
            disabled={formData.futureSalesMode !== 'DAYS'}
            helperText="Cantidad de días en el futuro que se pueden vender tickets (1-7)"
          />
        </Grid>

        {/* Clear Contacts - Only in edit mode */}
        {bettingPoolId && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                Lista de Contactos
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
                Limpiar Lista de Contactos
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                Elimina todos los contactos asignados a esta banca
              </Typography>
            </Grid>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  ¿Está seguro que desea eliminar todos los contactos de esta banca? Esta acción no se puede deshacer.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmOpen(false)} disabled={clearing}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleClearContacts}
                  color="error"
                  variant="contained"
                  disabled={clearing}
                  startIcon={clearing ? <CircularProgress size={18} /> : undefined}
                >
                  {clearing ? 'Eliminando...' : 'Eliminar Todos'}
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
    'useCentralLogo'
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
