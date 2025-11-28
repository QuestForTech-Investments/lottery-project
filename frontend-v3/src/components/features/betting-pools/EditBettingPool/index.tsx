/**
 * EditBettingPool Component
 * Edit existing betting pool with 8 tabs covering all configuration
 * TypeScript version - REUSES all tabs from CreateBettingPool (like V2)
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Typography,
  Alert,
  Divider,
  CircularProgress,
  Snackbar,
} from '@mui/material'
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { useEditBettingPoolForm } from './hooks/useEditBettingPoolForm'
// ✅ REUSE tabs from CreateBettingPool (like V2 does)
import GeneralTab from '@/components/features/betting-pools/CreateBettingPool/tabs/GeneralTab'
import ConfigurationTab from '@/components/features/betting-pools/CreateBettingPool/tabs/ConfigurationTab'
import FootersTab from '@/components/features/betting-pools/CreateBettingPool/tabs/FootersTab'
import PrizesTab from '@/components/features/betting-pools/CreateBettingPool/tabs/PrizesTab'
import SchedulesTab from '@/components/features/betting-pools/CreateBettingPool/tabs/SchedulesTab'
import DrawsTab from '@/components/features/betting-pools/CreateBettingPool/tabs/DrawsTab'
import StylesTab from '@/components/features/betting-pools/CreateBettingPool/tabs/StylesTab'
import AutoExpensesTab from '@/components/features/betting-pools/CreateBettingPool/tabs/AutoExpensesTab'

/**
 * EditBettingPool Component
 * Modern Material-UI version with ALL functionality from V2
 */
const EditBettingPool: React.FC = () => {
  const navigate = useNavigate()

  const {
    formData,
    loading,
    loadingBasicData, // ⚡ PROGRESSIVE LOADING: Basic data (shows loading screen)
    loadingPrizes, // ⚡ PROGRESSIVE LOADING: Prize data (shows indicator in tabs)
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
  } = useEditBettingPoolForm()

  // Handlers for Snackbar close
  const handleCloseSuccess = () => {
    clearSuccessMessage()
  }

  const handleCloseError = () => {
    clearErrors()
  }

  /**
   * Render loading screen ONLY while loading basic data
   * ⚡ PROGRESSIVE LOADING: Shows immediately after basic data loads
   */
  if (loadingBasicData) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#51cbce' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando datos de la banca...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Solo un momento...
          </Typography>
        </Box>
      </Box>
    )
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
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 1, fontWeight: 600 }}>
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
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 48,
                },
              }}
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
                      <CircularProgress size={16} thickness={4} sx={{ color: '#51cbce' }} />
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

          {/* Tab Panels */}
          <Box>
            {activeTab === 0 && (
              <GeneralTab
                formData={formData}
                errors={errors}
                zones={zones}
                loadingZones={loadingZones}
                handleChange={handleChange}
              />
            )}

            {activeTab === 1 && (
              <ConfigurationTab
                formData={formData}
                errors={errors}
                handleChange={handleChange}
              />
            )}

            {activeTab === 2 && (
              <FootersTab
                formData={formData}
                handleChange={handleChange}
              />
            )}

            {activeTab === 3 && (
              <>
                {/* ⚡ PROGRESSIVE LOADING: Show loading indicator while prizes load */}
                {loadingPrizes && (
                  <Box sx={{ p: 2, mb: 2 }}>
                    <Alert severity="info" icon={<CircularProgress size={20} sx={{ color: '#51cbce' }} />}>
                      <Typography variant="body2">
                        Cargando datos de premios y comisiones en segundo plano...
                      </Typography>
                    </Alert>
                  </Box>
                )}
                <PrizesTab
                  formData={formData}
                  handleChange={handleChange}
                  bettingPoolId={formData.bettingPoolId}
                  draws={prizesDraws}
                  loadingDraws={loadingDraws}
                  loadDrawSpecificValues={loadDrawSpecificValues}
                  onSavePrizeConfig={savePrizeConfigForSingleDraw}
                />
              </>
            )}

            {activeTab === 4 && (
              <SchedulesTab
                formData={formData}
                handleChange={handleChange}
                copyScheduleToAll={copyScheduleToAll}
              />
            )}

            {activeTab === 5 && (
              <DrawsTab
                formData={formData}
                handleChange={handleChange}
                draws={draws}
                loadingDraws={loadingDraws}
              />
            )}

            {activeTab === 6 && (
              <StylesTab
                formData={formData}
                handleChange={handleChange}
              />
            )}

            {activeTab === 7 && (
              <AutoExpensesTab
                formData={formData}
                handleChange={handleChange}
              />
            )}
          </Box>

          {/* Action Buttons */}
          <Divider />
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/betting-pools/list')}
              disabled={loading}
              sx={{
                textTransform: 'none',
                borderColor: '#51cbce',
                color: '#51cbce',
                '&:hover': {
                  borderColor: '#45b8bb',
                  bgcolor: 'rgba(81, 203, 206, 0.04)',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                textTransform: 'none',
                minWidth: 200,
              }}
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
        open={!!errors.submit}
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
          {errors.submit}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EditBettingPool
