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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
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
  const [templateSectionOpen, setTemplateSectionOpen] = React.useState(false);

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
    // Template copy functionality
    templateBettingPools,
    loadingTemplates,
    selectedTemplateId,
    templateFields,
    loadingTemplateData,
    handleTemplateSelect,
    handleTemplateFieldChange,
    applyTemplate,
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

          {/* Copy From Template Section - Bottom of form */}
          <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: 1, borderColor: 'divider' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mb: templateSectionOpen ? 2 : 0,
              }}
              onClick={() => setTemplateSectionOpen(!templateSectionOpen)}
            >
              <ContentCopyIcon sx={{ mr: 1, color: '#667eea' }} />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
                Copiar de banca plantilla
              </Typography>
              {templateSectionOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={templateSectionOpen}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Template Selection Dropdown */}
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Banca
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel id="template-select-label">Seleccione</InputLabel>
                    <Select
                      labelId="template-select-label"
                      value={selectedTemplateId || ''}
                      onChange={(e) => handleTemplateSelect(e.target.value ? Number(e.target.value) : null)}
                      label="Seleccione"
                      disabled={loadingTemplates}
                    >
                      <MenuItem value="">
                        <em>Seleccione</em>
                      </MenuItem>
                      {templateBettingPools.map((pool) => (
                        <MenuItem key={pool.bettingPoolId} value={pool.bettingPoolId}>
                          {pool.bettingPoolName} ({pool.bettingPoolCode})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {loadingTemplates && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Cargando bancas...
                    </Typography>
                  )}
                </Box>

                {/* Template Fields Checkboxes */}
                <Box sx={{ flex: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Campos de plantilla
                  </Typography>
                  <FormGroup row sx={{ flexWrap: 'wrap', gap: 0 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={templateFields.configuration}
                          onChange={(e) => handleTemplateFieldChange('configuration', e.target.checked)}
                          size="small"
                          sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }}
                        />
                      }
                      label={<Typography variant="body2">CONFIGURACIÓN</Typography>}
                      sx={{ minWidth: 150 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={templateFields.footers}
                          onChange={(e) => handleTemplateFieldChange('footers', e.target.checked)}
                          size="small"
                          sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }}
                        />
                      }
                      label={<Typography variant="body2">PIES DE PÁGINA</Typography>}
                      sx={{ minWidth: 150 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={templateFields.prizesAndCommissions}
                          onChange={(e) => handleTemplateFieldChange('prizesAndCommissions', e.target.checked)}
                          size="small"
                          sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }}
                        />
                      }
                      label={<Typography variant="body2">PREMIOS & COMISIONES</Typography>}
                      sx={{ minWidth: 180 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={templateFields.drawSchedules}
                          onChange={(e) => handleTemplateFieldChange('drawSchedules', e.target.checked)}
                          size="small"
                          sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }}
                        />
                      }
                      label={<Typography variant="body2">HORARIOS DE SORTEOS</Typography>}
                      sx={{ minWidth: 180 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={templateFields.draws}
                          onChange={(e) => handleTemplateFieldChange('draws', e.target.checked)}
                          size="small"
                          sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }}
                        />
                      }
                      label={<Typography variant="body2">SORTEOS</Typography>}
                      sx={{ minWidth: 120 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={templateFields.styles}
                          onChange={(e) => handleTemplateFieldChange('styles', e.target.checked)}
                          size="small"
                          sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }}
                        />
                      }
                      label={<Typography variant="body2">ESTILOS</Typography>}
                      sx={{ minWidth: 120 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={templateFields.rules}
                          onChange={(e) => handleTemplateFieldChange('rules', e.target.checked)}
                          size="small"
                          sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }}
                        />
                      }
                      label={<Typography variant="body2">REGLAS</Typography>}
                      sx={{ minWidth: 120 }}
                    />
                  </FormGroup>
                </Box>

                {/* Apply Template Button */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={applyTemplate}
                    disabled={!selectedTemplateId || loadingTemplateData}
                    startIcon={loadingTemplateData ? <CircularProgress size={16} /> : <ContentCopyIcon />}
                    sx={{
                      bgcolor: '#667eea',
                      '&:hover': { bgcolor: '#5a67d8' },
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {loadingTemplateData ? 'Copiando...' : 'Aplicar plantilla'}
                  </Button>
                </Box>
              </Box>
            </Collapse>
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
              type="button"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
              sx={{ minWidth: 200 }}
              onClick={() => {
                const form = document.querySelector('form');
                if (form) {
                  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
              }}
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
