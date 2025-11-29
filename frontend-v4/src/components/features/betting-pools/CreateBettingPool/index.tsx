import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import useCompleteBettingPoolForm from './hooks/useCompleteBettingPoolForm';
import GeneralTab from './tabs/GeneralTab';
import ConfigurationTab from './tabs/ConfigurationTab';
import FootersTab from './tabs/FootersTab';
import PrizesTab from './tabs/PrizesTab';
import SchedulesTab from './tabs/SchedulesTab';
import DrawsTab from './tabs/DrawsTab';
import StylesTab from './tabs/StylesTab';
import AutoExpensesTab from './tabs/AutoExpensesTab';

/**
 * CreateBettingPoolMUI Component
 * Modern Material-UI version of CreateBanca with ALL 168 fields
 */
const CreateBettingPoolMUI: React.FC = () => {
  const navigate = useNavigate();

  const {
    formData,
    loading,
    loadingZones,
    errors,
    success,
    zones,
    activeTab,
    handleChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll: _copyScheduleToAll,
  } = useCompleteBettingPoolForm();


  /**
   * Render main form
   */
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" align="center">
            Crear Nueva Banca
          </Typography>
        </Box>

        {/* Success Alert */}
        {success && (
          <Box sx={{ p: 2 }}>
            <Alert severity="success">
              Banca creada exitosamente. El formulario ha sido reseteado para una nueva entrada.
            </Alert>
          </Box>
        )}

        {/* Submit Error Alert */}
        {errors.submit && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" onClose={() => {}}>
              {errors.submit}
            </Alert>
          </Box>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="General" />
              <Tab label="Configuración" />
              <Tab label="Pies de Página" />
              <Tab label="Premios & Comisiones" />
              <Tab label="Horarios" />
              <Tab label="Sorteos" />
              <Tab label="Estilos" />
              <Tab label="Gastos Automáticos" />
            </Tabs>
          </Box>

          {/* Tab Panels - Using type assertions for form data since each tab knows its own subset */}
          <Box>
            {activeTab === 0 && (
              <GeneralTab
                formData={formData as unknown as Parameters<typeof GeneralTab>[0]['formData']}
                errors={errors as unknown as Parameters<typeof GeneralTab>[0]['errors']}
                zones={zones as unknown as Parameters<typeof GeneralTab>[0]['zones']}
                loadingZones={loadingZones}
                handleChange={handleChange as unknown as Parameters<typeof GeneralTab>[0]['handleChange']}
              />
            )}

            {activeTab === 1 && (
              <ConfigurationTab
                formData={formData as unknown as Parameters<typeof ConfigurationTab>[0]['formData']}
                handleChange={handleChange as unknown as Parameters<typeof ConfigurationTab>[0]['handleChange']}
              />
            )}

            {activeTab === 2 && (
              <FootersTab
                formData={formData as unknown as Parameters<typeof FootersTab>[0]['formData']}
                handleChange={handleChange as unknown as Parameters<typeof FootersTab>[0]['handleChange']}
              />
            )}

            {activeTab === 3 && (
              <PrizesTab
                formData={formData as unknown as Parameters<typeof PrizesTab>[0]['formData']}
                handleChange={handleChange as unknown as Parameters<typeof PrizesTab>[0]['handleChange']}
              />
            )}

            {activeTab === 4 && (
              <SchedulesTab
                formData={formData as unknown as Parameters<typeof SchedulesTab>[0]['formData']}
                handleChange={handleChange as unknown as Parameters<typeof SchedulesTab>[0]['handleChange']}
              />
            )}

            {activeTab === 5 && (
              <DrawsTab
                formData={formData as unknown as Parameters<typeof DrawsTab>[0]['formData']}
                handleChange={handleChange as unknown as Parameters<typeof DrawsTab>[0]['handleChange']}
              />
            )}

            {activeTab === 6 && (
              <StylesTab
                formData={formData as unknown as Parameters<typeof StylesTab>[0]['formData']}
                handleChange={handleChange as unknown as Parameters<typeof StylesTab>[0]['handleChange']}
              />
            )}

            {activeTab === 7 && (
              <AutoExpensesTab
                formData={formData as unknown as Parameters<typeof AutoExpensesTab>[0]['formData']}
                handleChange={handleChange as unknown as Parameters<typeof AutoExpensesTab>[0]['handleChange']}
              />
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/bettingPools/list')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Creando...' : 'Crear Banca'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Info Note */}
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> Este formulario incluye todos los campos de configuración de la banca.
            Completa al menos los campos requeridos en la pestaña "General" para crear la banca.
            Las demás configuraciones son opcionales y pueden ajustarse después de la creación.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default CreateBettingPoolMUI;
