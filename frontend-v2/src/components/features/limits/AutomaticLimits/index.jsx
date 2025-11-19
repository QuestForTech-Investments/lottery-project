import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const AutomaticLimits = () => {
  const [activeTab, setActiveTab] = useState(0);

  const [generalNumberControls, setGeneralNumberControls] = useState({
    enableDirecto: false,
    montoDirecto: 0,
    enablePale: false,
    montoPale: 0,
    enableSuperPale: false,
    montoSuperPale: 0
  });

  const [lineControls, setLineControls] = useState({
    enableDirecto: false,
    montoDirecto: 0,
    enablePale: false,
    montoPale: 0,
    enableSuperPale: false,
    montoSuperPale: 0
  });

  const [selectedDraws, setSelectedDraws] = useState([]);
  const [selectedBanca, setSelectedBanca] = useState('');
  const [palesToBlock, setPalesToBlock] = useState('');

  const draws = [
    'Anguila 10am', 'REAL', 'GANA MAS', 'LA PRIMERA', 'LA SUERTE', 'LOTEDOM',
    'TEXAS MORNING', 'TEXAS EVENING', 'TEXAS DAY', 'TEXAS NIGHT', 'King Lottery AM',
    'Anguila 1pm', 'NEW YORK DAY', 'FLORIDA AM', 'INDIANA MIDDAY', 'INDIANA EVENING',
    'GEORGIA-MID AM', 'NEW JERSEY AM', 'L.E. PUERTO RICO 2PM', 'DIARIA 11AM'
  ];

  const handleDrawToggle = (draw) => {
    setSelectedDraws(prev =>
      prev.includes(draw) ? prev.filter(d => d !== draw) : [...prev, draw]
    );
  };

  const handleSaveGeneral = () => {
    console.log('Saving general controls:', { generalNumberControls, lineControls });
    alert('Configuración guardada exitosamente');
  };

  const handleUpdateBlocking = () => {
    if (selectedDraws.length === 0 || !selectedBanca || !palesToBlock) {
      alert('Por favor complete todos los campos');
      return;
    }
    console.log('Updating random blocking:', { selectedDraws, selectedBanca, palesToBlock });
    alert('Bloqueo actualizado exitosamente');
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontSize: '24px', fontWeight: 500, color: '#2c2c2c' }}>
        Límites automáticos
      </Typography>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 2,
            borderColor: '#51cbce',
            '& .MuiTab-root': { fontSize: '14px' },
            '& .Mui-selected': { color: '#51cbce' }
          }}
          TabIndicatorProps={{ style: { backgroundColor: '#51cbce' } }}
        >
          <Tab label="General" />
          <Tab label="Bloqueo Aleatorio" />
        </Tabs>

        <CardContent sx={{ p: 4 }}>
          {/* Tab General */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, mb: 3, color: '#2c2c2c' }}>
                Controles automáticos generales por número
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 4 }}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalNumberControls.enableDirecto}
                        onChange={(e) => setGeneralNumberControls({...generalNumberControls, enableDirecto: e.target.checked})}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar directo (día)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={generalNumberControls.montoDirecto}
                    onChange={(e) => setGeneralNumberControls({...generalNumberControls, montoDirecto: e.target.value})}
                    placeholder="Monto directo"
                    disabled={!generalNumberControls.enableDirecto}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalNumberControls.enablePale}
                        onChange={(e) => setGeneralNumberControls({...generalNumberControls, enablePale: e.target.checked})}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar pale (día-mes)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={generalNumberControls.montoPale}
                    onChange={(e) => setGeneralNumberControls({...generalNumberControls, montoPale: e.target.value})}
                    placeholder="Monto pale directo"
                    disabled={!generalNumberControls.enablePale}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalNumberControls.enableSuperPale}
                        onChange={(e) => setGeneralNumberControls({...generalNumberControls, enableSuperPale: e.target.checked})}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar super pale (día-mes)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={generalNumberControls.montoSuperPale}
                    onChange={(e) => setGeneralNumberControls({...generalNumberControls, montoSuperPale: e.target.value})}
                    placeholder="Monto super pale"
                    disabled={!generalNumberControls.enableSuperPale}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, mt: 4, mb: 3, color: '#2c2c2c' }}>
                Controles automáticos de línea para bancas
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 4 }}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={lineControls.enableDirecto}
                        onChange={(e) => setLineControls({...lineControls, enableDirecto: e.target.checked})}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar directo (día)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={lineControls.montoDirecto}
                    onChange={(e) => setLineControls({...lineControls, montoDirecto: e.target.value})}
                    placeholder="Monto directo"
                    disabled={!lineControls.enableDirecto}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={lineControls.enablePale}
                        onChange={(e) => setLineControls({...lineControls, enablePale: e.target.checked})}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar pale (día-mes)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={lineControls.montoPale}
                    onChange={(e) => setLineControls({...lineControls, montoPale: e.target.value})}
                    placeholder="Monto pale directo"
                    disabled={!lineControls.enablePale}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={lineControls.enableSuperPale}
                        onChange={(e) => setLineControls({...lineControls, enableSuperPale: e.target.checked})}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar super pale (día-mes)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={lineControls.montoSuperPale}
                    onChange={(e) => setLineControls({...lineControls, montoSuperPale: e.target.value})}
                    placeholder="Monto super pale"
                    disabled={!lineControls.enableSuperPale}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveGeneral}
                  sx={{
                    bgcolor: '#51cbce',
                    color: 'white',
                    '&:hover': { bgcolor: '#45b8bb' },
                    fontSize: '14px',
                    px: 5,
                    py: 1.5,
                    textTransform: 'none'
                  }}
                >
                  GUARDAR
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab Bloqueo Aleatorio */}
          {activeTab === 1 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#787878', mb: 1 }}>
                  Sorteos *
                </Typography>
                <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', p: 1, borderRadius: '4px', bgcolor: 'white' }}>
                  {draws.map(draw => (
                    <FormControlLabel
                      key={draw}
                      control={
                        <Checkbox
                          checked={selectedDraws.includes(draw)}
                          onChange={() => handleDrawToggle(draw)}
                          size="small"
                        />
                      }
                      label={draw}
                      sx={{ display: 'block', mb: 1, '& .MuiFormControlLabel-label': { fontSize: '13px' } }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ fontSize: '12px' }}>Bancas *</InputLabel>
                  <Select
                    value={selectedBanca}
                    onChange={(e) => setSelectedBanca(e.target.value)}
                    label="Bancas *"
                    sx={{ fontSize: '14px' }}
                  >
                    <MenuItem value=""><em>Seleccione</em></MenuItem>
                    <MenuItem value="1" sx={{ fontSize: '14px' }}>Banca 1</MenuItem>
                    <MenuItem value="2" sx={{ fontSize: '14px' }}>Banca 2</MenuItem>
                    <MenuItem value="3" sx={{ fontSize: '14px' }}>Banca 3</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  type="number"
                  label="# de pales a bloquear *"
                  fullWidth
                  value={palesToBlock}
                  onChange={(e) => setPalesToBlock(e.target.value)}
                  placeholder="0"
                  InputLabelProps={{ sx: { fontSize: '12px' } }}
                />
              </Box>

              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleUpdateBlocking}
                  sx={{
                    bgcolor: '#51cbce',
                    color: 'white',
                    '&:hover': { bgcolor: '#45b8bb' },
                    fontSize: '14px',
                    px: 5,
                    py: 1.5,
                    textTransform: 'none'
                  }}
                >
                  ACTUALIZAR
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AutomaticLimits;
