import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { getActiveLocale } from '@/utils/formatters';

interface ExcessValues {
  general: string;
  directo: string;
  pale: string;
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
  pick5Straight: string;
  pick5Box: string;
  pickTwo: string;
  cash3FrontStraight: string;
  cash3FrontBox: string;
  cash3BackStraight: string;
  cash3BackBox: string;
  pickTwoFront: string;
  pickTwoBack: string;
  pickTwoMiddle: string;
  panama: string;
  tripleta: string;
}

interface SavedExcess {
  id: number;
  draw: string;
  betType: string;
  excess: number;
  date: string;
  user: string;
}

interface Draw {
  id: number;
  name: string;
}

type FieldKey = keyof ExcessValues;

const ManageExcesses = (): React.ReactElement => {
  const { t } = useTranslation();
  // Dropdown de sorteos
  const [selectedDraw, setSelectedDraw] = useState<string>('General');

  // 25 campos numéricos para los diferentes tipos de excedentes
  const [excessValues, setExcessValues] = useState<ExcessValues>({
    general: '',
    directo: '',
    pale: '',
    cash3Straight: '',
    cash3Box: '',
    play4Straight: '',
    play4Box: '',
    superPale: '',
    bolita1: '',
    bolita2: '',
    singulacion1: '',
    singulacion2: '',
    singulacion3: '',
    pick5Straight: '',
    pick5Box: '',
    pickTwo: '',
    cash3FrontStraight: '',
    cash3FrontBox: '',
    cash3BackStraight: '',
    cash3BackBox: '',
    pickTwoFront: '',
    pickTwoBack: '',
    pickTwoMiddle: '',
    panama: '',
    tripleta: ''
  });

  // Lista de excedentes guardados
  const [savedExcesses, setSavedExcesses] = useState<SavedExcess[]>([]);

  // Mockup data de sorteos
  const draws: Draw[] = [
    { id: 0, name: 'General' },
    { id: 1, name: 'Anguila 10am' },
    { id: 2, name: 'NY 12pm' },
    { id: 3, name: 'FL 1pm' },
    { id: 4, name: 'GA 7pm' },
    { id: 5, name: 'REAL' },
    { id: 6, name: 'GANA MAS' },
    { id: 7, name: 'LA PRIMERA' }
  ];

  // Mapeo de campos para mostrar en UI
  const fieldLabels: Record<FieldKey, string> = useMemo(() => ({
    general: t('excessesAdmin.fields.general'),
    directo: t('excessesAdmin.fields.directo'),
    pale: t('excessesAdmin.fields.pale'),
    cash3Straight: t('excessesAdmin.fields.cash3Straight'),
    cash3Box: t('excessesAdmin.fields.cash3Box'),
    play4Straight: t('excessesAdmin.fields.play4Straight'),
    play4Box: t('excessesAdmin.fields.play4Box'),
    superPale: t('excessesAdmin.fields.superPale'),
    bolita1: t('excessesAdmin.fields.bolita1'),
    bolita2: t('excessesAdmin.fields.bolita2'),
    singulacion1: t('excessesAdmin.fields.singulacion1'),
    singulacion2: t('excessesAdmin.fields.singulacion2'),
    singulacion3: t('excessesAdmin.fields.singulacion3'),
    pick5Straight: t('excessesAdmin.fields.pick5Straight'),
    pick5Box: t('excessesAdmin.fields.pick5Box'),
    pickTwo: t('excessesAdmin.fields.pickTwo'),
    cash3FrontStraight: t('excessesAdmin.fields.cash3FrontStraight'),
    cash3FrontBox: t('excessesAdmin.fields.cash3FrontBox'),
    cash3BackStraight: t('excessesAdmin.fields.cash3BackStraight'),
    cash3BackBox: t('excessesAdmin.fields.cash3BackBox'),
    pickTwoFront: t('excessesAdmin.fields.pickTwoFront'),
    pickTwoBack: t('excessesAdmin.fields.pickTwoBack'),
    pickTwoMiddle: t('excessesAdmin.fields.pickTwoMiddle'),
    panama: t('excessesAdmin.fields.panama'),
    tripleta: t('excessesAdmin.fields.tripleta')
  }), [t]);

  const handleFieldChange = useCallback((fieldName: FieldKey, value: string): void => {
    // Solo allow números y decimales
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setExcessValues(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  }, []);

  const handleClearAll = useCallback((): void => {
    const emptyValues = Object.keys(excessValues).reduce((acc, key) => {
      acc[key as FieldKey] = '';
      return acc;
    }, {} as ExcessValues);
    setExcessValues(emptyValues);
  }, [excessValues]);

  const handleCreate = useCallback((): void => {
    // Recopilar solo campos con valores
    const filledFields = Object.entries(excessValues)
      .filter(([_key, value]) => value !== '')
      .map(([key, value]) => ({
        draw: selectedDraw,
        betType: fieldLabels[key as FieldKey],
        excess: parseFloat(value as string),
        date: new Date().toLocaleDateString(getActiveLocale()),
        user: 'admin'
      }));

    if (filledFields.length === 0) {
      alert(t('excessesAdmin.validationMustEnterValue'));
      return;
    }

    // Add a la lista de guardados
    const newExcesses: SavedExcess[] = filledFields.map((field, index) => ({
      id: savedExcesses.length + index + 1,
      ...field
    }));

    setSavedExcesses([...newExcesses, ...savedExcesses]);

    // Clear formulario después de crear
    handleClearAll();

    alert(t('excessesAdmin.createdSuccess', { count: filledFields.length }));
  }, [excessValues, selectedDraw, fieldLabels, savedExcesses, handleClearAll, t]);

  const handleDelete = useCallback((id: number): void => {
    if (window.confirm(t('excessesAdmin.confirmDelete'))) {
      setSavedExcesses(savedExcesses.filter(item => item.id !== id));
    }
  }, [savedExcesses, t]);

  // Organizar campos en grupos de 3 para el grid
  const fieldKeys = Object.keys(excessValues) as FieldKey[];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* Título */}
      <Typography
        variant="h4"
        component="h3"
        sx={{
          textAlign: 'center',
          mb: { xs: 2, sm: 3 },
          color: '#2c2c2c',
          fontWeight: 600,
          fontSize: { xs: '18px', sm: '24px' },
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        {t('excessesAdmin.manageTitle')}
      </Typography>

      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 4 } }}>
          {/* Filtro de Sorteo y Botón Borrar Todo */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, mb: 3, gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <FormControl sx={{ minWidth: { xs: '100%', sm: 300 }, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel sx={{ fontSize: '14px' }}>{t('excessesAdmin.draw')}</InputLabel>
                <Select
                  value={selectedDraw}
                  onChange={(e) => setSelectedDraw(e.target.value)}
                  label={t('excessesAdmin.draw')}
                  size="small"
                  sx={{ fontSize: '14px' }}
                >
                  {draws.map(draw => (
                    <MenuItem key={draw.id} value={draw.name} sx={{ fontSize: '14px' }}>
                      {draw.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Button
              variant="contained"
              onClick={handleClearAll}
              sx={{
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
                color: 'white',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                px: 3
              }}
            >
              {t('excessesAdmin.clearAll')}
            </Button>
          </Box>

          {/* Formulario de 25 campos en grid de 3 columnas */}
          <Box sx={{ background: '#f5f5f5', p: 3, borderRadius: 1, mb: 3 }}>
            <Grid container spacing={1.5}>
              {fieldKeys.map(fieldKey => (
                <Grid item xs={12} sm={6} md={4} key={fieldKey}>
                  <TextField
                    fullWidth
                    size="small"
                    label={fieldLabels[fieldKey]}
                    value={excessValues[fieldKey]}
                    onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                    placeholder="0.00"
                    InputLabelProps={{
                      sx: { fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }
                    }}
                    InputProps={{
                      sx: {
                        fontSize: '14px',
                        fontFamily: 'Montserrat, sans-serif',
                        '& input': { textAlign: 'right' }
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Botón CREAR */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
                color: 'white',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                py: 1.2
              }}
            >
              {t('excessesAdmin.createButton')}
            </Button>
          </Box>

          {/* Título de la tabla */}
          <Typography
            variant="h4"
            component="h3"
            sx={{
              textAlign: 'center',
              mt: 5,
              mb: 3,
              color: '#2c2c2c',
              fontWeight: 600,
              fontSize: '24px',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            {t('excessesAdmin.listTitle')}
          </Typography>

          {/* Tabla de excedentes guardados */}
          {savedExcesses.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>{t('excessesAdmin.draw')}</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>{t('excessesAdmin.betType')}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600 }}>{t('excessesAdmin.excess')}</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>{t('common.date')}</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>{t('common.user')}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600 }}>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedExcesses.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontSize: '14px' }}>{index + 1}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{item.draw}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{item.betType}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '14px' }}>
                        ${item.excess.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{item.date}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{item.user}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleDelete(item.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                p: 5,
                color: '#6c757d',
                fontSize: '14px',
                background: '#f8f9fa',
                borderRadius: 1
              }}
            >
              {t('excessesAdmin.noneYet')}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ManageExcesses;
