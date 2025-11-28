import React, { useState, useCallback, type ChangeEvent, type FormEvent, type SyntheticEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Chip
} from '@mui/material';

// Types for prizes and commissions data
type GameType = 'directo' | 'pale' | 'tripleta' | 'cash3Straight' | 'cash3Box' | 'play4Straight' | 'play4Box' | 'superPale' | 'bolita1' | 'bolita2' | 'singulacion1' | 'singulacion2' | 'singulacion3' | 'pickTwo' | 'pick5Straight';

interface DirectoPrizes {
  primerPago: string;
  segundoPago: string;
  tercerPago: string;
  dobles: string;
}

interface PalePrizes {
  todosSecuencia: string;
  primerPago: string;
  segundoPago: string;
  tercerPago: string;
}

interface PrizesData {
  directo: DirectoPrizes;
  pale: PalePrizes;
  tripleta: { primerPago: string; segundoPago: string };
  cash3Straight: { todosSecuencia: string; triples: string };
  cash3Box: { threeWay: string; sixWay: string };
  play4Straight: { todosSecuencia: string; dobles: string };
  play4Box: { twentyFourWay: string; twelveWay: string; sixWay: string; fourWay: string };
  superPale: { primerPago: string };
  bolita1: { primerPago: string };
  bolita2: { primerPago: string };
  singulacion1: { primerPago: string };
  singulacion2: { primerPago: string };
  singulacion3: { primerPago: string };
  pickTwo: { primerPago: string; dobles: string };
  pick5Straight: { todosSecuencia: string; dobles: string };
}

interface CommissionsData {
  general: string;
  directo: string;
  pale: string;
  tripleta: string;
  cash3Straight: string;
  cash3Box: string;
  play4Straight: string;
  play4Box: string;
  superPale: string;
  bolita1: string;
  bolita2: string;
  singulacion1: string;
  singulacion2: string;
  singulacion3: string;
  pickTwo: string;
  pick5Straight: string;
  [key: string]: string;
}

interface FooterData {
  primerPie: string;
  segundoPie: string;
  tercerPie: string;
  cuartoPie: string;
}

interface AllowedValuesType {
  directo: {
    primerPago: string[];
    segundoPago: string[];
    tercerPago: string[];
    dobles: string[];
  };
  pale: {
    todosSecuencia: string[];
    primerPago: string[];
    segundoPago: string[];
    tercerPago: string[];
  };
  pickTwo: {
    primerPago: string[];
    dobles: string[];
  };
}

interface ValueChipProps {
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

// Allowed values (outside component to avoid recreation)
const ALLOWED_VALUES: AllowedValuesType = {
  directo: {
    primerPago: ['56', '70', '75', '72', '65', '60', '55', '50', '80'],
    segundoPago: ['12', '15', '8', '20'],
    tercerPago: ['4', '10'],
    dobles: ['56', '60', '55', '70', '75', '65', '72', '50', '80']
  },
  pale: {
    todosSecuencia: ['1200', '1300', '1100', '800', '700', '1400', '1500', '1000', '2000', '900', '1800'],
    primerPago: ['1200', '1000', '1500', '800', '900', '700', '1300', '1100', '1400', '2000', '1800'],
    segundoPago: ['1200', '1000', '1500', '900', '800', '700', '1300', '1100', '1400', '2000', '1800'],
    tercerPago: ['200', '1200', '1000', '800', '900', '700', '100', '1100', '1500', '1300']
  },
  pickTwo: {
    primerPago: ['80', '75', '60', '66', '65'],
    dobles: ['80', '75', '60', '66', '65']
  }
};

// Estilos memoizados para tabs
const TABS_STYLE = {
  borderBottom: 1,
  borderColor: 'divider',
  mb: 2,
  '& .MuiTab-root': {
    fontSize: '14px',
    textTransform: 'none',
    fontFamily: 'Montserrat, sans-serif'
  },
  '& .Mui-selected': {
    color: '#6366f1'
  }
};

const TAB_INDICATOR_PROPS = {
  style: { backgroundColor: '#6366f1' }
};

// Componente Chip memoizado para mejor performance
const ValueChip = React.memo(({ value, isSelected, onClick }: ValueChipProps): React.ReactElement => (
  <Chip
    label={value}
    onClick={onClick}
    sx={{
      fontSize: '12px',
      height: '28px',
      bgcolor: isSelected ? '#6366f1' : 'white',
      color: isSelected ? 'white' : '#6366f1',
      border: '1px solid #6366f1',
      cursor: 'pointer',
      '&:hover': {
        bgcolor: isSelected ? '#5568d3' : '#eef2ff'
      }
    }}
  />
));

ValueChip.displayName = 'ValueChip';

const GroupConfiguration = (): React.ReactElement => {
  const [activeMainTab, setActiveMainTab] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<number>(0);

  // State for tab Premios (15 tipos principales)
  const [prizesData, setPrizesData] = useState<PrizesData>({
    directo: { primerPago: '56', segundoPago: '12', tercerPago: '4', dobles: '56' },
    pale: { todosSecuencia: '1200', primerPago: '1200', segundoPago: '1200', tercerPago: '200' },
    tripleta: { primerPago: '10000', segundoPago: '100' },
    cash3Straight: { todosSecuencia: '700', triples: '700' },
    cash3Box: { threeWay: '232', sixWay: '116' },
    play4Straight: { todosSecuencia: '5000', dobles: '5000' },
    play4Box: { twentyFourWay: '200', twelveWay: '400', sixWay: '800', fourWay: '1200' },
    superPale: { primerPago: '2000' },
    bolita1: { primerPago: '80' },
    bolita2: { primerPago: '80' },
    singulacion1: { primerPago: '9' },
    singulacion2: { primerPago: '9' },
    singulacion3: { primerPago: '9' },
    pickTwo: { primerPago: '80', dobles: '80' },
    pick5Straight: { todosSecuencia: '30000', dobles: '30000' }
  });

  // State for tab Comisiones
  const [commissionsData, setCommissionsData] = useState<CommissionsData>({
    general: '',
    directo: '20',
    pale: '30',
    tripleta: '30',
    cash3Straight: '20',
    cash3Box: '20',
    play4Straight: '20',
    play4Box: '20',
    superPale: '30',
    bolita1: '20',
    bolita2: '20',
    singulacion1: '10',
    singulacion2: '10',
    singulacion3: '10',
    pickTwo: '20',
    pick5Straight: '20'
  });

  // State for Footer
  const [footerData, setFooterData] = useState<FooterData>({
    primerPie: 'Revise su Ticket Al Recibirlo',
    segundoPie: 'Jugadas Combinada se Paga una sola vez',
    tercerPie: 'Buena Suerte en sus Jugadas !',
    cuartoPie: 'LACENTRALRD.COM'
  });

  // Handlers memoizados para evitar re-renders
  const handlePrizeChange = useCallback((gameType: keyof PrizesData, field: string, value: string): void => {
    setPrizesData(prev => ({
      ...prev,
      [gameType]: {
        ...prev[gameType],
        [field]: value
      }
    }));
  }, []);

  const handleCommissionChange = useCallback((gameType: string, value: string): void => {
    setCommissionsData(prev => ({
      ...prev,
      [gameType]: value
    }));
  }, []);

  // Handler para cambio de tab principal (resetear sub-tab)
  const handleMainTabChange = useCallback((_event: SyntheticEvent, newValue: number): void => {
    setActiveMainTab(newValue);
    setActiveSubTab(0); // Reset sub-tab al cambiar main tab
  }, []);

  const handleSubTabChange = useCallback((_event: SyntheticEvent, newValue: number): void => {
    setActiveSubTab(newValue);
  }, []);

  const handleFooterChange = useCallback((field: keyof FooterData, value: string): void => {
    setFooterData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    alert('Configuración actualizada (mockup)\\n\\nEsto enviará los datos al backend cuando esté conectado.');
  }, []);

  const renderPrizesFields = (title: string, gameType: keyof PrizesData, fields: Record<string, string>): React.ReactElement => {
    const prizeData = prizesData[gameType] as Record<string, string>;
    return (
      <Box key={gameType} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mb: 1, color: '#2c2c2c' }}>
          {title}
        </Typography>
        <Grid container spacing={1.5}>
          {Object.entries(fields).map(([fieldKey, fieldLabel]) => (
            <Grid item xs={12} sm={6} md={4} key={fieldKey}>
              <TextField
                fullWidth
                label={fieldLabel}
                value={prizeData?.[fieldKey] || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handlePrizeChange(gameType, fieldKey, e.target.value)}
                placeholder="0"
                size="small"
                InputProps={{
                  sx: { textAlign: 'right' }
                }}
                sx={{
                  '& input': { textAlign: 'right' }
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderCommissionField = (label: string, gameType: string): React.ReactElement => {
    return (
      <Grid item xs={12} sm={6} md={4} key={gameType}>
        <TextField
          fullWidth
          label={label}
          value={commissionsData[gameType] || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleCommissionChange(gameType, e.target.value)}
          placeholder="0"
          size="small"
          InputProps={{
            sx: { textAlign: 'right' }
          }}
          sx={{
            '& input': { textAlign: 'right' }
          }}
        />
      </Grid>
    );
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
        Actualizar grupo
      </Typography>

      <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <CardContent>
          {/* Tabs Principales */}
          <Tabs
            value={activeMainTab}
            onChange={handleMainTabChange}
            sx={TABS_STYLE}
            TabIndicatorProps={TAB_INDICATOR_PROPS}
          >
            <Tab label="Valores by default" />
            <Tab label="Valores permitidos" />
            <Tab label="Footer" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Tab: Valores by default */}
            {activeMainTab === 0 && (
              <Box>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 2, fontSize: '18px', fontWeight: 600 }}>
                  Comisiones y premios by default
                </Typography>

                {/* Sub-tabs */}
                <Tabs
                  value={activeSubTab}
                  onChange={handleSubTabChange}
                  sx={TABS_STYLE}
                  TabIndicatorProps={TAB_INDICATOR_PROPS}
                >
                  <Tab label="Premios" />
                  <Tab label="Comisiones" />
                </Tabs>

                {/* Sub-tab: Premios */}
                {activeSubTab === 0 && (
                  <Box>
                    {renderPrizesFields('Directo', 'directo', { primerPago: 'Primer Pago', segundoPago: 'Segundo Pago', tercerPago: 'Tercer Pago', dobles: 'Dobles' })}
                    {renderPrizesFields('Pale', 'pale', { todosSecuencia: 'Todos en secuencia', primerPago: 'Primer Pago', segundoPago: 'Segundo Pago', tercerPago: 'Tercer Pago' })}
                    {renderPrizesFields('Tripleta', 'tripleta', { primerPago: 'Primer Pago', segundoPago: 'Segundo Pago' })}
                    {renderPrizesFields('Cash3 Straight', 'cash3Straight', { todosSecuencia: 'Todos en secuencia', triples: 'Triples' })}
                    {renderPrizesFields('Cash3 Box', 'cash3Box', { threeWay: '3-Way: 2 identicos', sixWay: '6-Way: 3 unicos' })}
                    {renderPrizesFields('Play4 Straight', 'play4Straight', { todosSecuencia: 'Todos en secuencia', dobles: 'Dobles' })}
                    {renderPrizesFields('Play4 Box', 'play4Box', { twentyFourWay: '24-Way: 4 unicos', twelveWay: '12-Way: 2 identicos', sixWay: '6-Way: 2 identicos', fourWay: '4-Way: 3 identicos' })}
                    {renderPrizesFields('Super Pale', 'superPale', { primerPago: 'Primer Pago' })}
                    {renderPrizesFields('Bolita 1', 'bolita1', { primerPago: 'Primer Pago' })}
                    {renderPrizesFields('Bolita 2', 'bolita2', { primerPago: 'Primer Pago' })}
                    {renderPrizesFields('Singulación 1', 'singulacion1', { primerPago: 'Primer Pago' })}
                    {renderPrizesFields('Singulación 2', 'singulacion2', { primerPago: 'Primer Pago' })}
                    {renderPrizesFields('Singulación 3', 'singulacion3', { primerPago: 'Primer Pago' })}
                    {renderPrizesFields('Pick Two', 'pickTwo', { primerPago: 'Primer Pago', dobles: 'Dobles' })}
                    {renderPrizesFields('Pick5 Straight', 'pick5Straight', { todosSecuencia: 'Todos en secuencia', dobles: 'Dobles' })}
                  </Box>
                )}

                {/* Sub-tab: Comisiones */}
                {activeSubTab === 1 && (
                  <Grid container spacing={2}>
                    {renderCommissionField('General', 'general')}
                    {renderCommissionField('Directo', 'directo')}
                    {renderCommissionField('Pale', 'pale')}
                    {renderCommissionField('Tripleta', 'tripleta')}
                    {renderCommissionField('Cash3 Straight', 'cash3Straight')}
                    {renderCommissionField('Cash3 Box', 'cash3Box')}
                    {renderCommissionField('Play4 Straight', 'play4Straight')}
                    {renderCommissionField('Play4 Box', 'play4Box')}
                    {renderCommissionField('Super Pale', 'superPale')}
                    {renderCommissionField('Bolita 1', 'bolita1')}
                    {renderCommissionField('Bolita 2', 'bolita2')}
                    {renderCommissionField('Singulación 1', 'singulacion1')}
                    {renderCommissionField('Singulación 2', 'singulacion2')}
                    {renderCommissionField('Singulación 3', 'singulacion3')}
                    {renderCommissionField('Pick Two', 'pickTwo')}
                    {renderCommissionField('Pick5 Straight', 'pick5Straight')}
                  </Grid>
                )}
              </Box>
            )}

            {/* Tab: Valores permitidos */}
            {activeMainTab === 1 && (
              <Box>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontSize: '18px', fontWeight: 600 }}>
                  Valores permitidos
                </Typography>

                <Box sx={{ p: 3 }}>
                  {/* Directo */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#2c2c2c' }}>
                      Directo
                    </Typography>

                    {/* Primer Pago */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Primer Pago
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.directo?.primerPago || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.directo.primerPago.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.directo?.primerPago === value}
                            onClick={() => handlePrizeChange('directo', 'primerPago', value)}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Segundo Pago */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Segundo Pago
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.directo?.segundoPago || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.directo.segundoPago.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.directo?.segundoPago === value}
                            onClick={() => handlePrizeChange('directo', 'segundoPago', value)}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Tercer Pago */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Tercer Pago
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.directo?.tercerPago || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.directo.tercerPago.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.directo?.tercerPago === value}
                            onClick={() => handlePrizeChange('directo', 'tercerPago', value)}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Dobles */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Dobles
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.directo?.dobles || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.directo.dobles.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.directo?.dobles === value}
                            onClick={() => handlePrizeChange('directo', 'dobles', value)}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {/* Pale */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#2c2c2c' }}>
                      Pale
                    </Typography>

                    {/* Todos en secuencia */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Todos en secuencia
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.pale?.todosSecuencia || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.pale.todosSecuencia.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.pale?.todosSecuencia === value}
                            onClick={() => handlePrizeChange('pale', 'todosSecuencia', value)}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Primer Pago */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Primer Pago
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.pale?.primerPago || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.pale.primerPago.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.pale?.primerPago === value}
                            onClick={() => handlePrizeChange('pale', 'primerPago', value)}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Segundo Pago */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Segundo Pago
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.pale?.segundoPago || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.pale.segundoPago.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.pale?.segundoPago === value}
                            onClick={() => handlePrizeChange('pale', 'segundoPago', value)}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Tercer Pago */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Tercer Pago
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.pale?.tercerPago || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.pale.tercerPago.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.pale?.tercerPago === value}
                            onClick={() => handlePrizeChange('pale', 'tercerPago', value)}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {/* Pick Two */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#2c2c2c' }}>
                      Pick Two
                    </Typography>

                    {/* Primer Pago */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Primer Pago
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.pickTwo?.primerPago || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.pickTwo.primerPago.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.pickTwo?.primerPago === value}
                            onClick={() => handlePrizeChange('pickTwo', 'primerPago', value)}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Dobles */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
                        Dobles
                      </Typography>
                      <TextField
                        size="small"
                        value={prizesData.pickTwo?.dobles || ''}
                        placeholder="0"
                        sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {ALLOWED_VALUES.pickTwo.dobles.map((value) => (
                          <ValueChip
                            key={value}
                            value={value}
                            isSelected={prizesData.pickTwo?.dobles === value}
                            onClick={() => handlePrizeChange('pickTwo', 'dobles', value)}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#666', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', mt: 4 }}>
                    Nota: Haga clic en un valor para seleccionarlo. El valor se aplicará al campo correspondiente.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Tab: Footer */}
            {activeMainTab === 2 && (
              <Box>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontSize: '18px', fontWeight: 600 }}>
                  Footer
                </Typography>

                {/* Botones de atajos */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 1 }}>
                    {['1RA [1]', '2DA [2]', '3RA [3]', 'DOBLES [4]', 'PALE [5]', 'SUPER PALE [6]'].map((label) => (
                      <Button
                        key={label}
                        variant="contained"
                        size="small"
                        onClick={() => alert(`Atajo: ${label}`)}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
                          color: 'white',
                          textTransform: 'none',
                          fontSize: '12px',
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 500
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {['TRIPLETA [7]', 'CASH 3 [8]', 'TRIPLES [9]', 'PLAY 4 [10]', 'PICK 5 [11]', 'PICK 2 [12]'].map((label) => (
                      <Button
                        key={label}
                        variant="contained"
                        size="small"
                        onClick={() => alert(`Atajo: ${label}`)}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
                          color: 'white',
                          textTransform: 'none',
                          fontSize: '12px',
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 500
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {/* Campos de pie de página */}
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                  <TextField
                    fullWidth
                    label="Primer pie de pagina"
                    value={footerData.primerPie}
                    onChange={(e) => handleFooterChange('primerPie', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Segundo pie de pagina"
                    value={footerData.segundoPie}
                    onChange={(e) => handleFooterChange('segundoPie', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Tercer pie de pagina"
                    value={footerData.tercerPie}
                    onChange={(e) => handleFooterChange('tercerPie', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Cuarto pie de pagina"
                    value={footerData.cuartoPie}
                    onChange={(e) => handleFooterChange('cuartoPie', e.target.value)}
                    size="small"
                  />
                </Box>
              </Box>
            )}

            {/* Botón Actualizar */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
                  color: 'white',
                  px: 5,
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: 'Montserrat, sans-serif',
                  textTransform: 'uppercase'
                }}
              >
                ACTUALIZAR
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GroupConfiguration;
