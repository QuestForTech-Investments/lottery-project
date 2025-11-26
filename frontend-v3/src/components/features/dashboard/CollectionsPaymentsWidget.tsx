/**
 * CollectionsPaymentsWidget Component
 * Widget for managing collections and payments (Cobros & Pagos)
 * Created for frontend-v3 (matches v2 Dashboard functionality)
 */

import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import useDashboard from '@/hooks/useDashboard';

const CollectionsPaymentsWidget: React.FC = () => {
  const {
    bancaCodes,
    bancos,
    activeMode,
    selectedBancaCode,
    selectedBanco,
    cobroPagoMonto,
    setSelectedBancaCode,
    setSelectedBanco,
    setCobroPagoMonto,
    handleModeChange,
    handleCreateCobroPago,
  } = useDashboard();

  return (
    <Paper elevation={3} sx={{ overflow: 'hidden' }}>
      <Box sx={{ bgcolor: 'grey.100', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Cobros & Pagos
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Toggle between Cobro and Pago */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ToggleButtonGroup
            value={activeMode}
            exclusive
            onChange={(_, value) => value && handleModeChange(value)}
            size="small"
            sx={{
              width: '100%',
              '& .MuiToggleButton-root': {
                flex: 1,
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '0.75rem',
              },
            }}
          >
            <ToggleButton value="cobro" sx={{ color: 'success.main' }}>
              Cobro
            </ToggleButton>
            <ToggleButton value="pago" sx={{ color: 'error.main' }}>
              Pago
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Banca</InputLabel>
            <Select
              value={selectedBancaCode}
              onChange={(e: SelectChangeEvent) => setSelectedBancaCode(e.target.value)}
              label="Banca"
            >
              <MenuItem value="">Seleccione...</MenuItem>
              {bancaCodes.map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Banco</InputLabel>
            <Select
              value={selectedBanco}
              onChange={(e: SelectChangeEvent) => setSelectedBanco(e.target.value)}
              label="Banco"
            >
              <MenuItem value="">Seleccione...</MenuItem>
              {bancos.map((banco) => (
                <MenuItem key={banco} value={banco}>
                  {banco}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="Monto"
            type="number"
            value={cobroPagoMonto}
            onChange={(e) => setCobroPagoMonto(e.target.value)}
            InputProps={{
              startAdornment: <MoneyIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Box>
      </Box>

      {/* Footer with Create Button */}
      <Box sx={{ p: 2, bgcolor: 'grey.100', borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleCreateCobroPago}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textTransform: 'uppercase',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #63418b 100%)',
            },
          }}
        >
          Crear {activeMode === 'cobro' ? 'Cobro' : 'Pago'}
        </Button>
      </Box>
    </Paper>
  );
};

export default CollectionsPaymentsWidget;
