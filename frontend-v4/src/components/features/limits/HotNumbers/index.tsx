import React, { useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Tabs, Tab, Checkbox, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

const HotNumbers = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([10, 22]);

  const numbers = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));

  const toggleNumber = useCallback((num: string): void => {
    setSelectedNumbers(prev => prev.includes(parseInt(num)) ? prev.filter(n => n !== parseInt(num)) : [...prev, parseInt(num)]);
  }, []);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontSize: '24px', fontWeight: 500, color: '#2c2c2c' }}>
        Números calientes
      </Typography>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 2,
            borderColor: '#6366f1',
            '& .MuiTab-root': { fontSize: '14px' },
            '& .Mui-selected': { color: '#6366f1' }
          }}
          TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}
        >
          <Tab label="Números calientes" />
          <Tab label="Límites" />
        </Tabs>

        <CardContent sx={{ p: 4 }}>
          {activeTab === 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 1 }}>
              {numbers.map(num => (
                <Box
                  key={num}
                  onClick={() => toggleNumber(num)}
                  sx={{
                    textAlign: 'center',
                    p: 1.5,
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    bgcolor: selectedNumbers.includes(parseInt(num)) ? '#6366f1' : 'white',
                    color: selectedNumbers.includes(parseInt(num)) ? 'white' : '#333',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: selectedNumbers.includes(parseInt(num)) ? '#5568d3' : '#f5f5f5' }
                  }}
                >
                  <Checkbox
                    checked={selectedNumbers.includes(parseInt(num))}
                    onChange={() => {}}
                    size="small"
                    sx={{ p: 0, mr: 0.5 }}
                  />
                  <Typography component="span" sx={{ fontSize: '14px' }}>{num}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Table sx={{ mb: 3 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#e3e3e3' }}>
                    <TableCell sx={{ fontSize: '12px' }}>Sorteos</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>Directo</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>Pale 1 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>Pale 2 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>Tripleta 1 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>Tripleta 2 caliente</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>Tripleta 3 caliente</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', fontSize: '13px', color: '#999', py: 3 }}>
                      No hay información disponible
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => alert('Límites guardados')}
                  sx={{
                    bgcolor: '#6366f1',
                    color: 'white',
                    '&:hover': { bgcolor: '#5568d3' },
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default HotNumbers;
