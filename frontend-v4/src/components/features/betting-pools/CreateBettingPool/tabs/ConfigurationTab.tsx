import React, { type ChangeEvent } from 'react';
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
} from '@mui/material';

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
  discountProvider: string;
  discountMode: string;
  limitPreference: string | null;
  allowFutureSales: boolean;
  maxFutureDays: string;
  useCentralLogo: boolean;
  [key: string]: string | boolean | null;
}

interface ConfigTabProps {
  formData: ConfigFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * ConfigurationTab Component
 * Contains ALL configuration fields from V1 with Material-UI styling
 */
const ConfigurationTab: React.FC<ConfigTabProps> = ({ formData, handleChange }) => {
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

        {/* Print & Discount Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Impresión y Descuentos
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Printer Type - Radio Group */}
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Modo de Impresión</FormLabel>
            <RadioGroup
              row
              name="printerType"
              value={formData.printerType}
              onChange={handleChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel value="1" control={<Radio />} label="DRIVER" />
              <FormControlLabel value="2" control={<Radio />} label="GENÉRICO" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Discount Provider - Radio Group */}
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Proveedor de Descuento</FormLabel>
            <RadioGroup
              row
              name="discountProvider"
              value={formData.discountProvider}
              onChange={handleChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel value="1" control={<Radio />} label="GRUPO" />
              <FormControlLabel value="2" control={<Radio />} label="RIFERO" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Discount Mode - Radio Group */}
        <Grid item xs={12}>
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
              <FormControlLabel value="2" control={<Radio />} label="EFECTIVO" />
              <FormControlLabel value="3" control={<Radio />} label="TICKET GRATIS" />
            </RadioGroup>
          </FormControl>
        </Grid>

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
          <FormControlLabel
            control={
              <Switch
                checked={formData.allowFutureSales}
                onChange={handleChange}
                name="allowFutureSales"
              />
            }
            label="Permitir Ventas Futuras"
          />
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
            disabled={!formData.allowFutureSales}
            helperText="Cantidad de días en el futuro que se pueden vender tickets (1-7)"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Custom comparison function for ConfigurationTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: ConfigTabProps, nextProps: ConfigTabProps): boolean => {
  // Check if handleChange changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false;
  }

  // Check only the form fields this tab uses
  const configFields = [
    'fallType', 'deactivationBalance', 'dailySaleLimit', 'dailyBalanceLimit',
    'enableTemporaryBalance', 'temporaryAdditionalBalance', 'isActive',
    'controlWinningTickets', 'allowJackpot', 'printEnabled', 'printTicketCopy',
    'smsOnly', 'minutesToCancelTicket', 'ticketsToCancelPerDay', 'enableRecharges',
    'printRechargeReceipt', 'allowPasswordChange', 'printerType', 'discountProvider',
    'discountMode', 'maximumCancelTicketAmount', 'maxTicketAmount',
    'dailyPhoneRechargeLimit', 'limitPreference', 'allowFutureSales', 'maxFutureDays',
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
