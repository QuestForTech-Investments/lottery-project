import { memo } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Lock as LockIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import useDashboard from './hooks/useDashboard';
import CollectionsPaymentsWidget from '../components/features/dashboard/CollectionsPaymentsWidget';

/**
 * DashboardMUI Component
 * Modern Material-UI version of Dashboard
 */
const DashboardMUI = () => {
  const {
    sortitions,
    playTypes,
    quickPublishSortitions,
    bancasVendiendo,
    selectedSortition,
    jugadas,
    selectedQuickPublish,
    selectedBloqueoSortition,
    selectedPlayType,
    jugadaInput,
    blockedNumbers,
    setSelectedQuickPublish,
    setSelectedBloqueoSortition,
    setSelectedPlayType,
    setJugadaInput,
    handleSortitionChange,
    handleQuickPublish,
    handleAddNumberToBlock,
    handleRemoveBlockedNumber,
    handleBlockNumbers,
    handleNavigateToDashboard,
    handleNavigateToDashboardOperativo,
  } = useDashboard();

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.100', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Grid de 4 columnas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>

          {/* Card 1: Cobros & Pagos */}
          <Grid item xs={12} md={6} lg={3}>
            <CollectionsPaymentsWidget />
          </Grid>

          {/* Card 2: Jugadas por sorteo */}
          <Grid item xs={12} md={6} lg={3}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 2 }}>
                Jugadas por sorteo
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Sorteo</InputLabel>
                <Select
                  value={selectedSortition}
                  onChange={handleSortitionChange}
                  label="Sorteo"
                >
                  {sortitions.map((sortition) => (
                    <MenuItem key={sortition} value={sortition}>{sortition}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', p: 1 }}>
                        Tipo de jugada
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', p: 1 }}>
                        Jugada
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', p: 1 }}>
                        Monto
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jugadas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No se encontraron jugadas
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      jugadas.map((jugada, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ p: 1, fontSize: '0.875rem' }}>{jugada.tipo}</TableCell>
                          <TableCell sx={{ p: 1, fontSize: '0.875rem' }}>{jugada.numero}</TableCell>
                          <TableCell sx={{ p: 1, fontSize: '0.875rem' }}>${jugada.monto}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Card 3: Publicación rápida */}
          <Grid item xs={12} md={6} lg={3}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 2 }}>
                Publicación rápida de resultados
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sorteo</InputLabel>
                  <Select
                    value={selectedQuickPublish}
                    onChange={(e) => setSelectedQuickPublish(e.target.value)}
                    label="Sorteo"
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {quickPublishSortitions.map((sortition) => (
                      <MenuItem key={sortition} value={sortition}>{sortition}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleQuickPublish}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '25px',
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #63418b 100%)',
                      },
                    }}
                  >
                    Publicar
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Card 4: Bloqueo rápido */}
          <Grid item xs={12} md={6} lg={3}>
            <Paper elevation={3} sx={{ overflow: 'hidden' }}>
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Bloqueo rápido de números
                </Typography>
              </Box>

              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sorteo</InputLabel>
                    <Select
                      value={selectedBloqueoSortition}
                      onChange={(e) => setSelectedBloqueoSortition(e.target.value)}
                      label="Sorteo"
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="Todos">Todos</MenuItem>
                      {sortitions.map((sortition) => (
                        <MenuItem key={sortition} value={sortition}>{sortition}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de jugada</InputLabel>
                    <Select
                      value={selectedPlayType}
                      onChange={(e) => setSelectedPlayType(e.target.value)}
                      label="Tipo de jugada"
                    >
                      <MenuItem value="">Seleccione uno...</MenuItem>
                      {playTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    size="small"
                    label="Jugada"
                    value={jugadaInput}
                    onChange={(e) => setJugadaInput(e.target.value)}
                  />
                </Box>

                {/* Blocked numbers list */}
                {blockedNumbers.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {blockedNumbers.map((num) => (
                      <Chip
                        key={num.id}
                        label={`${num.number} (${num.playType})`}
                        size="small"
                        onDelete={() => handleRemoveBlockedNumber(num.id)}
                        color="primary"
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <Box sx={{ p: 2, bgcolor: 'grey.100', borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-around' }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddNumberToBlock}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #63418b 100%)',
                      },
                    }}
                  >
                    Agregar
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    startIcon={<LockIcon />}
                    onClick={handleBlockNumbers}
                    disabled={blockedNumbers.length === 0}
                  >
                    Bloquear
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Bancas vendiendo */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1" align="center" sx={{ fontWeight: 500 }}>
            Bancas vendiendo:{' '}
            Martes: <Box component="span" sx={{ color: '#4dd4d4', fontWeight: 'bold' }}>{bancasVendiendo.martes}</Box>,
            {' '}Miércoles: <Box component="span" sx={{ color: '#4dd4d4', fontWeight: 'bold' }}>{bancasVendiendo.miercoles}</Box>,
            {' '}hoy: <Box component="span" sx={{ color: '#4dd4d4', fontWeight: 'bold' }}>{bancasVendiendo.hoy}</Box>
          </Typography>
        </Paper>

        {/* Botones Dashboard */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<DashboardIcon />}
              onClick={handleNavigateToDashboard}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                py: 2,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63418b 100%)',
                },
              }}
            >
              Dashboard
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<AssessmentIcon />}
              onClick={handleNavigateToDashboardOperativo}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                py: 2,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63418b 100%)',
                },
              }}
            >
              Dashboard Operativo
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default memo(DashboardMUI);
