import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  TableSortLabel
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';

const DrawsList = () => {
  const [quickFilter, setQuickFilter] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  // Mockup data - 70+ draws/lotteries
  const [draws, setDraws] = useState([
    { id: 1, index: 1, name: 'Anguila 10am', abbreviation: 'AG AM', color: '#FF5733' },
    { id: 2, index: 2, name: 'REAL', abbreviation: 'RL', color: '#33FF57' },
    { id: 3, index: 3, name: 'GANA MAS', abbreviation: 'GM', color: '#3357FF' },
    { id: 4, index: 4, name: 'LA PRIMERA', abbreviation: 'LP', color: '#F333FF' },
    { id: 5, index: 5, name: 'NEW YORK 10am', abbreviation: 'NY 10A', color: '#FF33A1' },
    { id: 6, index: 6, name: 'NEW YORK 12pm', abbreviation: 'NY 12P', color: '#A1FF33' },
    { id: 7, index: 7, name: 'NEW YORK 7pm', abbreviation: 'NY 7P', color: '#33A1FF' },
    { id: 8, index: 8, name: 'FLORIDA 1pm', abbreviation: 'FL 1P', color: '#FFA133' },
    { id: 9, index: 9, name: 'FLORIDA 7pm', abbreviation: 'FL 7P', color: '#A133FF' },
    { id: 10, index: 10, name: 'GEORGIA 12pm', abbreviation: 'GA 12P', color: '#33FFA1' },
    { id: 11, index: 11, name: 'GEORGIA 7pm', abbreviation: 'GA 7P', color: '#FF3333' },
    { id: 12, index: 12, name: 'TEXAS 10am', abbreviation: 'TX 10A', color: '#3333FF' },
    { id: 13, index: 13, name: 'TEXAS 12pm', abbreviation: 'TX 12P', color: '#FF33FF' },
    { id: 14, index: 14, name: 'TEXAS 7pm', abbreviation: 'TX 7P', color: '#FFFF33' },
    { id: 15, index: 15, name: 'CALIFORNIA AM', abbreviation: 'CA AM', color: '#33FFFF' },
    { id: 16, index: 16, name: 'CALIFORNIA PM', abbreviation: 'CA PM', color: '#FF6633' },
    { id: 17, index: 17, name: 'LOTEKA', abbreviation: 'LTK', color: '#66FF33' },
    { id: 18, index: 18, name: 'LOTEDOM', abbreviation: 'LTD', color: '#3366FF' },
    { id: 19, index: 19, name: 'LOTERIA NACIONAL', abbreviation: 'LN', color: '#FF3366' },
    { id: 20, index: 20, name: 'LOTERIA REAL', abbreviation: 'LR', color: '#66FFFF' },
    { id: 21, index: 21, name: 'LA SUERTE DOMINICANA', abbreviation: 'LSD', color: '#FF66FF' },
    { id: 22, index: 22, name: 'QUINIELA PALE', abbreviation: 'QP', color: '#FFFF66' },
    { id: 23, index: 23, name: 'SUPER PALE (RD)', abbreviation: 'SP RD', color: '#66FF66' },
    { id: 24, index: 24, name: 'SUPER PALE (USA)', abbreviation: 'SP USA', color: '#6666FF' },
    { id: 25, index: 25, name: 'KING LOTTERY', abbreviation: 'KL', color: '#FF6666' },
    { id: 26, index: 26, name: 'PANAMA LNB', abbreviation: 'PA LNB', color: '#FFAA33' },
    { id: 27, index: 27, name: 'DIARIA HONDURAS', abbreviation: 'DH', color: '#33AAFF' },
    { id: 28, index: 28, name: 'LA CHICA', abbreviation: 'LC', color: '#AA33FF' },
    { id: 29, index: 29, name: 'PENNSYLVANIA', abbreviation: 'PA', color: '#FFAA66' },
    { id: 30, index: 30, name: 'MARYLAND', abbreviation: 'MD', color: '#66AAFF' },
    { id: 31, index: 31, name: 'MASSACHUSETTS', abbreviation: 'MA', color: '#AA66FF' },
    { id: 32, index: 32, name: 'VIRGINIA', abbreviation: 'VA', color: '#FFAAAA' },
    { id: 33, index: 33, name: 'NORTH CAROLINA', abbreviation: 'NC', color: '#AAFFAA' },
    { id: 34, index: 34, name: 'SOUTH CAROLINA', abbreviation: 'SC', color: '#AAAAFF' },
    { id: 35, index: 35, name: 'CONNECTICUT', abbreviation: 'CT', color: '#FFDD33' },
    { id: 36, index: 36, name: 'DELAWARE', abbreviation: 'DE', color: '#33DDFF' },
    { id: 37, index: 37, name: 'NEW JERSEY', abbreviation: 'NJ', color: '#DD33FF' },
    { id: 38, index: 38, name: 'INDIANA', abbreviation: 'IN', color: '#FFDDAA' },
    { id: 39, index: 39, name: 'CHICAGO', abbreviation: 'CHI', color: '#AADDFF' },
    { id: 40, index: 40, name: 'L.E. PUERTO RICO', abbreviation: 'LE PR', color: '#DDAAFF' },
    { id: 41, index: 41, name: 'NEW YORK 6x1', abbreviation: 'NY 6x1', color: '#FF9933' },
    { id: 42, index: 42, name: 'FLORIDA 6x1', abbreviation: 'FL 6x1', color: '#33FF99' },
    { id: 43, index: 43, name: 'FLORIDA PICK2', abbreviation: 'FL P2', color: '#9933FF' },
    { id: 44, index: 44, name: 'ANGUILA QUINIELA', abbreviation: 'AQ', color: '#FF9966' },
    { id: 45, index: 45, name: 'Anguila 1pm', abbreviation: 'AG 1P', color: '#66FF99' },
    { id: 46, index: 46, name: 'Anguila 7pm', abbreviation: 'AG 7P', color: '#9966FF' },
    { id: 47, index: 47, name: 'Pega 3 NY', abbreviation: 'P3 NY', color: '#FFCC33' },
    { id: 48, index: 48, name: 'Pega 3 FL', abbreviation: 'P3 FL', color: '#33CCFF' },
    { id: 49, index: 49, name: 'Pega 3 GA', abbreviation: 'P3 GA', color: '#CC33FF' },
    { id: 50, index: 50, name: 'Pega 4 NY', abbreviation: 'P4 NY', color: '#FFCCAA' },
    { id: 51, index: 51, name: 'Pega 4 FL', abbreviation: 'P4 FL', color: '#AACCFF' },
    { id: 52, index: 52, name: 'Pega 4 GA', abbreviation: 'P4 GA', color: '#CCAAFF' },
    { id: 53, index: 53, name: 'Tripleta NY', abbreviation: 'TR NY', color: '#FF8833' },
    { id: 54, index: 54, name: 'Tripleta FL', abbreviation: 'TR FL', color: '#33FF88' },
    { id: 55, index: 55, name: 'Tripleta GA', abbreviation: 'TR GA', color: '#8833FF' },
    { id: 56, index: 56, name: 'Pick Two NY', abbreviation: 'P2 NY', color: '#FF8866' },
    { id: 57, index: 57, name: 'Pick Two FL', abbreviation: 'P2 FL', color: '#66FF88' },
    { id: 58, index: 58, name: 'Pick Two GA', abbreviation: 'P2 GA', color: '#8866FF' },
    { id: 59, index: 59, name: 'Quiniela NY', abbreviation: 'Q NY', color: '#FFBB33' },
    { id: 60, index: 60, name: 'Quiniela FL', abbreviation: 'Q FL', color: '#33BBFF' },
    { id: 61, index: 61, name: 'Quiniela GA', abbreviation: 'Q GA', color: '#BB33FF' },
    { id: 62, index: 62, name: 'Pale NY', abbreviation: 'PL NY', color: '#FFBBAA' },
    { id: 63, index: 63, name: 'Pale FL', abbreviation: 'PL FL', color: '#AABBFF' },
    { id: 64, index: 64, name: 'Pale GA', abbreviation: 'PL GA', color: '#BBAAFF' },
    { id: 65, index: 65, name: 'Directo NY', abbreviation: 'DR NY', color: '#FF7733' },
    { id: 66, index: 66, name: 'Directo FL', abbreviation: 'DR FL', color: '#33FF77' },
    { id: 67, index: 67, name: 'Directo GA', abbreviation: 'DR GA', color: '#7733FF' },
    { id: 68, index: 68, name: 'Super Pale NY', abbreviation: 'SP NY', color: '#FF7766' },
    { id: 69, index: 69, name: 'Super Pale FL', abbreviation: 'SP FL', color: '#66FF77' },
    { id: 70, index: 70, name: 'Super Pale GA', abbreviation: 'SP GA', color: '#7766FF' }
  ]);

  const filteredDraws = draws.filter(d =>
    d.name.toLowerCase().includes(quickFilter.toLowerCase()) ||
    d.abbreviation.toLowerCase().includes(quickFilter.toLowerCase())
  );

  const sortedDraws = [...filteredDraws].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleColorChange = (id, newColor) => {
    setDraws(draws.map(d => d.id === id ? { ...d, color: newColor } : d));
  };

  const handleEdit = (id) => {
    console.log('Edit draw:', id);
    alert(`Editar sorteo ${id} (mockup)`);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (dragIndex === dropIndex) return;

    const newDraws = [...draws];
    const [draggedDraw] = newDraws.splice(dragIndex, 1);
    newDraws.splice(dropIndex, 0, draggedDraw);

    // Update indices
    const reindexed = newDraws.map((d, idx) => ({ ...d, index: idx + 1 }));
    setDraws(reindexed);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Título */}
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontSize: '24px',
              fontWeight: 500,
              color: '#2c2c2c'
            }}
          >
            Lista de sorteos
          </Typography>

          {/* Quick Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              placeholder="Filtrado rápido"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              size="small"
              sx={{ width: '300px' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
                sx: { fontSize: '14px' }
              }}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878', width: '50px' }}>Index</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Nombre
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>
                    <TableSortLabel
                      active={sortBy === 'abbreviation'}
                      direction={sortBy === 'abbreviation' ? sortOrder : 'asc'}
                      onClick={() => handleSort('abbreviation')}
                    >
                      Abreviación
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878', width: '100px' }}>Color</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878', textAlign: 'center', width: '100px' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDraws.length > 0 ? (
                  sortedDraws.map((draw, idx) => (
                    <TableRow
                      key={draw.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      hover
                      sx={{ cursor: 'move' }}
                    >
                      <TableCell sx={{ fontSize: '14px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DragIndicatorIcon sx={{ color: '#999', fontSize: '20px' }} />
                          {draw.index}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{draw.name}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{draw.abbreviation}</TableCell>
                      <TableCell>
                        <input
                          type="color"
                          value={draw.color}
                          onChange={(e) => handleColorChange(draw.id, e.target.value)}
                          style={{
                            width: '50px',
                            height: '30px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(draw.id)}
                          sx={{ color: '#51cbce' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#999', py: 3 }}>
                      No hay entradas disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#999', mt: 2 }}>
            Mostrando {sortedDraws.length} de {draws.length} entradas
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DrawsList;
