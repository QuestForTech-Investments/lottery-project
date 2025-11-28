import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import useEditBettingPoolForm from './hooks/useEditBettingPoolForm';

interface FormErrors {
  submit?: string | null;
  [key: string]: string | null | undefined;
}

// Reuse tabs from CreateBettingPool
import GeneralTab from '@components/features/betting-pools/CreateBettingPool/tabs/GeneralTab';
import ConfigurationTab from '@components/features/betting-pools/CreateBettingPool/tabs/ConfigurationTab';
import FootersTab from '@components/features/betting-pools/CreateBettingPool/tabs/FootersTab';
import PrizesTab from '@components/features/betting-pools/CreateBettingPool/tabs/PrizesTab';
import SchedulesTab from '@components/features/betting-pools/CreateBettingPool/tabs/SchedulesTab';
import DrawsTab from '@components/features/betting-pools/CreateBettingPool/tabs/DrawsTab';
import StylesTab from '@components/features/betting-pools/CreateBettingPool/tabs/StylesTab';
import AutoExpensesTab from '@components/features/betting-pools/CreateBettingPool/tabs/AutoExpensesTab';

/**
 * EditBettingPoolMUI Component
 * Modern Material-UI version of EditBanca with ALL 168 fields
 */
const EditBettingPoolMUI: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get bettingPoolId from URL

  const {
    formData,
    loading,
    loadingBasicData, // ⚡ PROGRESSIVE LOADING: Basic data (General tab)
    loadingPrizes, // ⚡ PROGRESSIVE LOADING: Prize data (background)
    loadingZones,
    loadingDraws, // ⚡ PERFORMANCE: Draws loading state
    errors,
    successMessage,
    zones,
    draws, // ⚡ PERFORMANCE: Draws for DrawsTab (loaded once)
    prizesDraws, // ⚡ PERFORMANCE: Formatted draws for PrizesTab (loaded once)
    activeTab,
    handleChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll,
    loadDrawSpecificValues, // 🔥 NEW: Load draw-specific prize values
    savePrizeConfigForSingleDraw, // 🔥 NEW: Save prize config for single draw
    clearSuccessMessage, // 🔔 SNACKBAR: Clear success message
    clearErrors, // 🔔 SNACKBAR: Clear error message
  } = useEditBettingPoolForm();

  // Handlers for Snackbar close
  const handleCloseSuccess = (): void => {
    clearSuccessMessage();
  };

  const handleCloseError = (): void => {
    clearErrors();
  };

  /**
   * Render loading screen ONLY while loading basic data
   * ⚡ PROGRESSIVE LOADING: Shows immediately after basic data loads
   */
  if (loadingBasicData) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando datos de la banca...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Solo un momento...
          </Typography>
        </Box>
      </Box>
    );
  }

  /**
   * Render main form
   */
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" align="center">
            Editar Banca
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {formData.bettingPoolName} ({formData.branchCode})
          </Typography>
        </Box>

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
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Premios & Comisiones
                    {/* ⚡ PROGRESSIVE LOADING: Show loading indicator on tab */}
                    {loadingPrizes && (
                      <CircularProgress size={16} thickness={4} />
                    )}
                  </Box>
                }
              />
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
              <>
                {/* ⚡ PROGRESSIVE LOADING: Show loading indicator while prizes load */}
                {loadingPrizes && (
                  <Box sx={{ p: 2, mb: 2 }}>
                    <Alert severity="info" icon={<CircularProgress size={20} />}>
                      <Typography variant="body2">
                        Cargando datos de premios y comisiones en segundo plano...
                      </Typography>
                    </Alert>
                  </Box>
                )}
                <PrizesTab
                  formData={formData as unknown as Parameters<typeof PrizesTab>[0]['formData']}
                  handleChange={handleChange as unknown as Parameters<typeof PrizesTab>[0]['handleChange']}
                  bettingPoolId={id ? parseInt(id) : undefined}
                  draws={prizesDraws as unknown as Parameters<typeof PrizesTab>[0]['draws']}
                  loadingDraws={loadingDraws}
                  loadDrawSpecificValues={loadDrawSpecificValues as unknown as Parameters<typeof PrizesTab>[0]['loadDrawSpecificValues']}
                  onSavePrizeConfig={savePrizeConfigForSingleDraw as unknown as Parameters<typeof PrizesTab>[0]['onSavePrizeConfig']}
                />
              </>
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
                draws={draws as unknown as Parameters<typeof DrawsTab>[0]['draws']}
                loadingDraws={loadingDraws}
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
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Info Note */}
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> Los cambios se aplicarán inmediatamente después de guardar.
            Asegúrate de revisar todos los campos antes de actualizar la banca.
          </Typography>
        </Alert>
      </Box>

      {/* 🔔 SUCCESS SNACKBAR - Fixed position, always visible */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          icon={<CheckCircleIcon />}
          sx={{
            width: '100%',
            fontSize: '1rem',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* 🔔 ERROR SNACKBAR - Fixed position, manual dismiss */}
      <Snackbar
        open={!!(errors as FormErrors).submit}
        autoHideDuration={null}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          icon={<ErrorIcon />}
          sx={{
            width: '100%',
            fontSize: '1rem',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {(errors as FormErrors).submit}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditBettingPoolMUI;
