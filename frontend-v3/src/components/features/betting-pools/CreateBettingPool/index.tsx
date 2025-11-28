/**
 * CreateBettingPool Component
 * Create new betting pool with 8 tabs covering all configuration
 * TypeScript version of frontend-v2 CreateBettingPool with full integration
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
} from '@mui/material'
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useCreateBettingPoolForm } from './hooks/useCreateBettingPoolForm'
import GeneralTab from './tabs/GeneralTab'
import ConfigurationTab from './tabs/ConfigurationTab'
import FootersTab from './tabs/FootersTab'
import PrizesTab from './tabs/PrizesTab'
import SchedulesTab from './tabs/SchedulesTab'
import DrawsTab from './tabs/DrawsTab'
import StylesTab from './tabs/StylesTab'
import AutoExpensesTab from './tabs/AutoExpensesTab'

/**
 * CreateBettingPool Component
 */
const CreateBettingPool: React.FC = () => {
  const navigate = useNavigate()

  // Use the hook for all form logic
  const {
    formData,
    errors,
    activeTab,
    success,
    loading,
    loadingZones,
    zones,
    draws,
    loadingDraws,
    handleChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll,
  } = useCreateBettingPoolForm()

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

        {/* Error Alert */}
        {errors.submit && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">
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
              <PrizesTab
                formData={formData}
                handleChange={handleChange}
              />
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
          <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/betting-pools/list')}
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
  )
}

export default CreateBettingPool
