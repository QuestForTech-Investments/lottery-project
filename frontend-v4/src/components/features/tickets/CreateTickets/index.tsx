import React, { useState, useEffect, useRef, memo, type KeyboardEvent } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl,
  Typography, Paper, Switch, IconButton, Autocomplete,
  CircularProgress, Dialog, DialogContent
} from '@mui/material';
import { Trash2 } from 'lucide-react';
import api from '@services/api';
import HelpModal from './HelpModal';
import TicketPrinter from '../TicketPrinter';

interface Banca {
  bettingPoolId: number;
  bettingPoolName: string;
}

interface Sorteo {
  id: number;
  name: string;
  color: string;
  disabled: boolean;
  lotteryId?: number;
}

interface Jugada {
  id: number;
  sorteo: string;
  sorteoId: number;
  numero: string;
  monto: number;
  tipo?: { name: string };
}

interface TipoJugada {
  id: string;
  name: string;
}

interface TicketLine {
  lineId: number;
  lotteryName: string;
  drawName: string;
  betNumber: string;
  betTypeName: string;
  betAmount: number;
  netAmount: number;
}

interface TicketData {
  ticketId: number;
  ticketCode: string;
  barcode: string;
  status: string;
  bettingPoolId: number;
  bettingPoolName: string;
  userName: string;
  createdAt: string;
  totalBetAmount: number;
  totalCommission: number;
  grandTotal: number;
  lines: TicketLine[];
}

type ColumnaType = 'directo' | 'pale' | 'cash3' | 'play4';

/**
 * Crear Tickets - Replica exacta de la aplicación Vue.js original
 * Estructura:
 * - Selector de banca + imagen sorteo actual
 * - Grid de ~69 loterías/sorteos
 * - Stats: Jugadas del día, Vendido en grupo, Vendido en banca
 * - Toggles: Desc, Mult. lot
 * - Campos: Jugada, N/A, Monto
 * - 4 columnas: Directo, Pale & Tripleta, Cash 3, Play 4 & Pick 5
 * - Botones: Duplicar, Crear ticket, Ayuda
 */
const CreateTickets: React.FC = () => {
  // State para banca seleccionada
  const [selectedBanca, setSelectedBanca] = useState<Banca | null>(null);
  const [bancas, setBancas] = useState<Banca[]>([]);

  // State para sorteo seleccionado
  const [selectedSorteo, setSelectedSorteo] = useState<Sorteo | null>(null);

  // State para sorteos desde API
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [loadingSorteos, setLoadingSorteos] = useState<boolean>(true);

  // Stats
  const [jugadasDelDia] = useState<number>(0);
  const [vendidoEnGrupo] = useState<string>('');
  const [vendidoEnBanca] = useState<string>('');

  // Toggles
  const [descuentoActivo, setDescuentoActivo] = useState<boolean>(true);
  const [multiplicadorLoteria, setMultiplicadorLoteria] = useState<boolean>(false);

  // Campos de entrada
  const [jugada, setJugada] = useState<string>('');
  const [monto, setMonto] = useState<string>('');
  const [tipoJugadaSeleccionado, setTipoJugadaSeleccionado] = useState<string>('');

  // Jugadas agregadas por columna
  const [jugadasDirecto, setJugadasDirecto] = useState<Jugada[]>([]);
  const [jugadasPale, setJugadasPale] = useState<Jugada[]>([]);
  const [jugadasCash3, setJugadasCash3] = useState<Jugada[]>([]);
  const [jugadasPlay4, setJugadasPlay4] = useState<Jugada[]>([]);

  // State para modal de ayuda
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

  // State para modal de ticket
  const [ticketModalOpen, setTicketModalOpen] = useState<boolean>(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // Ref para el campo de jugada (para navegación por teclado)
  const jugadaInputRef = useRef<HTMLInputElement>(null);

  // Tipos de jugada para el dropdown
  const tiposJugada: TipoJugada[] = [
    { id: 'directo', name: 'Directo' },
    { id: 'pale', name: 'Pale' },
    { id: 'tripleta', name: 'Tripleta' },
    { id: 'cash3-straight', name: 'Cash3 Straight' },
    { id: 'cash3-box', name: 'Cash3 Box' },
    { id: 'play4-straight', name: 'Play4 Straight' },
    { id: 'play4-box', name: 'Play4 Box' },
    { id: 'pick5', name: 'Pick 5' },
  ];

  // Load bancas
  useEffect(() => {
    const loadBancas = async () => {
      try {
        const response = await api.get('/betting-pools') as { items?: Banca[] } | Banca[];
        const bancaList: Banca[] = Array.isArray(response) ? response : (response.items || []);
        setBancas(bancaList);
        if (bancaList.length > 0) {
          setSelectedBanca(bancaList[0]);
        }
      } catch (error) {
        console.error('Error cargando bancas:', error);
        // Mockup bancas
        setBancas([{ bettingPoolId: 9, bettingPoolName: 'admin' }]);
        setSelectedBanca({ bettingPoolId: 9, bettingPoolName: 'admin' });
      }
    };
    loadBancas();
  }, []);

  // Load sorteos desde API (colores vienen de la base de datos)
  useEffect(() => {
    interface DrawApiResponse {
      drawId: number;
      drawName?: string;
      name?: string;
      displayColor?: string;
      lotteryColour?: string;
      isActive?: boolean;
      lotteryId?: number;
    }

    const loadSorteos = async () => {
      setLoadingSorteos(true);
      try {
        // Usar pageSize=1000 para cargar TODOS los sorteos (no solo los primeros 50)
        const response = await api.get('/draws?pageSize=1000') as { items?: DrawApiResponse[] } | DrawApiResponse[];
        const items = (response && 'items' in response ? response.items : response) || [];

        // Mapear sorteos con colores de la base de datos
        // Prioridad: displayColor (draw) > lotteryColour (lottery) > gris by default
        const sorteosFormatted = (items as DrawApiResponse[]).map((draw) => ({
          id: draw.drawId,
          name: draw.drawName || draw.name || '',
          color: draw.displayColor || draw.lotteryColour || '#9e9e9e',
          disabled: !draw.isActive,
          lotteryId: draw.lotteryId,
        }));

        setSorteos(sorteosFormatted);
      } catch (error) {
        console.error('Error cargando sorteos:', error);
        // Fallback mockup si falla la API
        setSorteos([
          { id: 1, name: 'ANGUILA 10AM', color: '#4caf50', disabled: false },
          { id: 2, name: 'NY 12PM', color: '#f44336', disabled: false },
          { id: 3, name: 'FL 1PM', color: '#2196f3', disabled: false },
        ]);
      } finally {
        setLoadingSorteos(false);
      }
    };
    loadSorteos();
  }, []);

  // Calculate totals por columna
  const calcularTotal = (jugadas: Jugada[]): string => {
    return jugadas.reduce((sum, j) => sum + (j.monto || 0), 0).toFixed(2);
  };

  // Handlesr draw selection
  const handleSorteoClick = (sorteo: Sorteo): void => {
    if (sorteo.disabled) return;
    setSelectedSorteo(sorteo);
  };

  // Add jugada
  const handleAgregarJugada = (): void => {
    if (!jugada || !monto || !selectedSorteo) return;

    const nuevaJugada = {
      id: Date.now(),
      sorteo: selectedSorteo.name,
      sorteoId: selectedSorteo.id,
      numero: jugada,
      monto: parseFloat(monto) || 0,
    };

    // Determinar a qué columna agregar según el tipo de jugada o número
    const numLength = jugada.replace(/[^0-9]/g, '').length;

    if (tipoJugadaSeleccionado === 'directo' || numLength === 2) {
      setJugadasDirecto([...jugadasDirecto, nuevaJugada]);
    } else if (tipoJugadaSeleccionado === 'pale' || tipoJugadaSeleccionado === 'tripleta' || numLength === 4 || numLength === 6) {
      setJugadasPale([...jugadasPale, nuevaJugada]);
    } else if (tipoJugadaSeleccionado?.includes('cash3') || numLength === 3) {
      setJugadasCash3([...jugadasCash3, nuevaJugada]);
    } else if (tipoJugadaSeleccionado?.includes('play4') || tipoJugadaSeleccionado === 'pick5' || numLength >= 4) {
      setJugadasPlay4([...jugadasPlay4, nuevaJugada]);
    } else {
      setJugadasDirecto([...jugadasDirecto, nuevaJugada]);
    }

    // Clear campos
    setJugada('');
    setMonto('');

    // Reenfocar el campo de jugada para continuar (flujo optimizado de teclado)
    setTimeout(() => {
      if (jugadaInputRef.current) {
        jugadaInputRef.current.focus();
      }
    }, 0);
  };

  // Delete jugada
  const handleEliminarJugada = (columna: ColumnaType, id: number): void => {
    switch (columna) {
      case 'directo':
        setJugadasDirecto(jugadasDirecto.filter(j => j.id !== id));
        break;
      case 'pale':
        setJugadasPale(jugadasPale.filter(j => j.id !== id));
        break;
      case 'cash3':
        setJugadasCash3(jugadasCash3.filter(j => j.id !== id));
        break;
      case 'play4':
        setJugadasPlay4(jugadasPlay4.filter(j => j.id !== id));
        break;
    }
  };

  // Delete todas las jugadas de una columna
  const handleEliminarTodas = (columna: ColumnaType): void => {
    switch (columna) {
      case 'directo':
        setJugadasDirecto([]);
        break;
      case 'pale':
        setJugadasPale([]);
        break;
      case 'cash3':
        setJugadasCash3([]);
        break;
      case 'play4':
        setJugadasPlay4([]);
        break;
    }
  };

  // Create ticket
  const handleCrearTicket = async (): Promise<void> => {
    const todasLasJugadas: Jugada[] = [
      ...jugadasDirecto,
      ...jugadasPale,
      ...jugadasCash3,
      ...jugadasPlay4
    ];

    if (todasLasJugadas.length === 0) {
      alert('Debe agregar al menos una jugada');
      return;
    }

    try {
      // Create objeto de ticket mock for preview
      const now = new Date();
      const ticketCode = `${now.getDate()}-${selectedBanca?.bettingPoolName?.toUpperCase()}-${selectedBanca?.bettingPoolId}-${Math.random().toString(36).substring(2, 15)}`;

      // Calcular total como número
      const totalAmount = parseFloat(calcularTotalGeneral());

      const mockTicket = {
        ticketId: Math.floor(Math.random() * 10000),
        ticketCode: ticketCode,
        barcode: btoa(ticketCode),
        status: 'pending',
        bettingPoolId: selectedBanca?.bettingPoolId || 9,
        bettingPoolName: selectedBanca?.bettingPoolName || 'admin',
        userName: 'Admin User',
        createdAt: now.toISOString(),
        totalBetAmount: totalAmount,
        totalCommission: totalAmount * 0.1,
        grandTotal: totalAmount,
        lines: todasLasJugadas.map((jugada, index) => ({
          lineId: index + 1,
          lotteryName: jugada.sorteo || 'Lottery',
          drawName: jugada.sorteo || 'Draw',
          betNumber: jugada.numero,
          betTypeName: jugada.tipo?.name || 'Directo',
          betAmount: jugada.monto || 0,
          netAmount: jugada.monto || 0
        }))
      };

      // Show el ticket en modal
      setTicketData(mockTicket);
      setTicketModalOpen(true);

      // Clear el formulario
      setJugadasDirecto([]);
      setJugadasPale([]);
      setJugadasCash3([]);
      setJugadasPlay4([]);
    } catch (error) {
      console.error('Error creando ticket:', error);
      alert('Error al crear el ticket');
    }
  };

  // Duplicar última jugada
  const handleDuplicar = (): void => {
    // TODO: Implementar lógica de duplicar
    alert('Función de duplicar pendiente de implementar');
  };

  // Calcular total general
  const calcularTotalGeneral = (): string => {
    const total = parseFloat(calcularTotal(jugadasDirecto)) +
                  parseFloat(calcularTotal(jugadasPale)) +
                  parseFloat(calcularTotal(jugadasCash3)) +
                  parseFloat(calcularTotal(jugadasPlay4));
    return total.toFixed(2);
  };

  // Total de jugadas
  const totalJugadas: number = jugadasDirecto.length + jugadasPale.length + jugadasCash3.length + jugadasPlay4.length;

  // Handlesr Enter en campos (navegación por teclado mejorada)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAgregarJugada();
    }
  };

  return (
    <Box sx={{ bgcolor: '#c8e6c9', minHeight: '100vh', p: 2 }}>
      {/* HEADER: Selector de Banca + Imagen sorteo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ color: '#666', fontSize: '14px' }}>Banca</Typography>
          <Autocomplete
            size="small"
            options={bancas}
            getOptionLabel={(option) => option.bettingPoolName || ''}
            value={selectedBanca}
            onChange={(e, newValue) => setSelectedBanca(newValue)}
            sx={{ width: 200, bgcolor: 'white' }}
            renderInput={(params) => <TextField {...params} variant="outlined" />}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#ddd',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🎰
          </Box>
          <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
            {selectedSorteo?.name || 'Seleccione un sorteo'}
          </Typography>
        </Box>
      </Box>

      {/* GRID DE SORTEOS */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          mb: 2,
          p: 1,
          bgcolor: 'rgba(255,255,255,0.5)',
          borderRadius: 1,
          minHeight: 60,
          alignItems: loadingSorteos ? 'center' : 'flex-start',
          justifyContent: loadingSorteos ? 'center' : 'flex-start',
        }}
      >
        {loadingSorteos ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: '#51cbce' }} />
            <Typography sx={{ fontSize: '12px', color: '#666' }}>Cargando sorteos...</Typography>
          </Box>
        ) : sorteos.length === 0 ? (
          <Typography sx={{ fontSize: '12px', color: '#666' }}>No hay sorteos disponibles</Typography>
        ) : (
          sorteos.map((sorteo) => (
            <Box
              key={sorteo.id}
              onClick={() => handleSorteoClick(sorteo)}
              sx={{
                px: 2,
                py: 1,
                bgcolor: selectedSorteo?.id === sorteo.id ? '#51cbce' : sorteo.color,
                color: 'white',
                fontSize: '13px',
                fontWeight: 'bold',
                borderRadius: '4px',
                cursor: sorteo.disabled ? 'not-allowed' : 'pointer',
                opacity: sorteo.disabled ? 0.5 : 1,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  opacity: sorteo.disabled ? 0.5 : 0.8,
                },
              }}
            >
              {sorteo.name}
            </Box>
          ))
        )}
      </Box>

      {/* STATS ROW */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Jugadas del dia</Typography>
          <TextField
            size="medium"
            value={jugadasDelDia}
            disabled
            sx={{
              width: 100,
              bgcolor: 'white',
              '& input': {
                textAlign: 'center',
                py: 1,
                fontSize: '16px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Vendido en grupo</Typography>
          <TextField
            size="medium"
            value={vendidoEnGrupo}
            disabled
            sx={{
              width: 180,
              bgcolor: 'white',
              '& input': {
                py: 1,
                fontSize: '16px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Vendido en banca</Typography>
          <TextField
            size="medium"
            value={vendidoEnBanca}
            disabled
            sx={{
              width: 180,
              bgcolor: 'white',
              '& input': {
                py: 1,
                fontSize: '16px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Desc.</Typography>
          <Switch
            checked={descuentoActivo}
            onChange={(e) => setDescuentoActivo(e.target.checked)}
            sx={{
              transform: 'scale(1.3)',
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4caf50' },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Mult. lot</Typography>
          <Switch
            checked={multiplicadorLoteria}
            onChange={(e) => setMultiplicadorLoteria(e.target.checked)}
            sx={{
              transform: 'scale(1.3)',
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#f44336' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#f44336' },
            }}
          />
        </Box>
      </Box>

      {/* INPUT ROW: Jugada, N/A, Monto */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="JUGADA"
          value={jugada}
          onChange={(e) => setJugada(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!selectedSorteo}
          autoFocus={!!selectedSorteo}
          inputRef={jugadaInputRef}
          inputProps={{ tabIndex: 1 }}
          sx={{
            flex: 1,
            bgcolor: 'white',
            '& input': {
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              py: 2,
              color: selectedSorteo ? '#333' : '#ccc',
            },
            '& input::placeholder': {
              color: '#ccc',
              opacity: 1,
            },
          }}
        />
        <TextField
          value="N/A"
          disabled
          sx={{
            width: 150,
            bgcolor: 'white',
            '& input': {
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              py: 2,
              color: '#333',
            },
          }}
        />
        <TextField
          placeholder="MONTO"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!selectedSorteo}
          type="number"
          inputProps={{ tabIndex: 2 }}
          sx={{
            flex: 1,
            bgcolor: 'white',
            '& input': {
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              py: 2,
              color: selectedSorteo ? '#333' : '#ccc',
            },
            '& input::placeholder': {
              color: '#ccc',
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* DROPDOWN + CONTADOR */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
          <Select
            value={tipoJugadaSeleccionado}
            onChange={(e) => setTipoJugadaSeleccionado(e.target.value)}
            displayEmpty
            disabled={!selectedSorteo}
          >
            <MenuItem value="">Seleccione...</MenuItem>
            {tiposJugada.map((tipo) => (
              <MenuItem key={tipo.id} value={tipo.id}>{tipo.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton
          onClick={handleAgregarJugada}
          disabled={!jugada || !monto || !selectedSorteo}
          sx={{ bgcolor: '#51cbce', color: 'white', '&:hover': { bgcolor: '#45b8bb' } }}
          title="Agregar jugada (o presione Enter)"
        >
          ➕
        </IconButton>
        <Typography sx={{ fontSize: '14px', color: '#666' }}>
          <strong>Jugadas:</strong> {totalJugadas}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#666' }}>
          <strong>Total:</strong> ${calcularTotalGeneral()}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#888', fontStyle: 'italic', ml: 'auto' }}>
          💡 Use Tab para navegar, Enter para agregar
        </Typography>
      </Box>

      {/* 4 COLUMNAS DE JUGADAS */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {/* COLUMNA DIRECTO */}
        <Paper sx={{ flex: 1, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#51cbce', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold' }}>
            DIRECTO
          </Box>
          <Box sx={{ bgcolor: '#e0f2f1', px: 1, py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span>LOT</span>
            <span>NUM</span>
            <span>$</span>
            <IconButton size="small" onClick={() => handleEliminarTodas('directo')}>
              <Trash2 size={14} />
            </IconButton>
          </Box>
          <Box sx={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', bgcolor: 'white' }}>
            {jugadasDirecto.map((j) => (
              <Box key={j.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, py: 0.5, borderBottom: '1px solid #eee', fontSize: '12px' }}>
                <span style={{ width: '40%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.sorteo}</span>
                <span style={{ fontWeight: 'bold' }}>{j.numero}</span>
                <span>${j.monto.toFixed(2)}</span>
                <IconButton size="small" onClick={() => handleEliminarJugada('directo', j.id)}>
                  <Trash2 size={12} color="#f44336" />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Box sx={{ bgcolor: '#51cbce', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            TOTAL: ${calcularTotal(jugadasDirecto)}
          </Box>
        </Paper>

        {/* COLUMNA PALE & TRIPLETA */}
        <Paper sx={{ flex: 1, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#3d9970', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold' }}>
            PALE & TRIPLETA
          </Box>
          <Box sx={{ bgcolor: '#e8f5e9', px: 1, py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span>LOT</span>
            <span>NUM</span>
            <span>$</span>
            <IconButton size="small" onClick={() => handleEliminarTodas('pale')}>
              <Trash2 size={14} />
            </IconButton>
          </Box>
          <Box sx={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', bgcolor: 'white' }}>
            {jugadasPale.map((j) => (
              <Box key={j.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, py: 0.5, borderBottom: '1px solid #eee', fontSize: '12px' }}>
                <span style={{ width: '40%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.sorteo}</span>
                <span style={{ fontWeight: 'bold' }}>{j.numero}</span>
                <span>${j.monto.toFixed(2)}</span>
                <IconButton size="small" onClick={() => handleEliminarJugada('pale', j.id)}>
                  <Trash2 size={12} color="#f44336" />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Box sx={{ bgcolor: '#3d9970', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            TOTAL: ${calcularTotal(jugadasPale)}
          </Box>
        </Paper>

        {/* COLUMNA CASH 3 */}
        <Paper sx={{ flex: 1, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#51cbce', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold' }}>
            CASH 3
          </Box>
          <Box sx={{ bgcolor: '#e0f2f1', px: 1, py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span>LOT</span>
            <span>NUM</span>
            <span>$</span>
            <IconButton size="small" onClick={() => handleEliminarTodas('cash3')}>
              <Trash2 size={14} />
            </IconButton>
          </Box>
          <Box sx={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', bgcolor: 'white' }}>
            {jugadasCash3.map((j) => (
              <Box key={j.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, py: 0.5, borderBottom: '1px solid #eee', fontSize: '12px' }}>
                <span style={{ width: '40%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.sorteo}</span>
                <span style={{ fontWeight: 'bold' }}>{j.numero}</span>
                <span>${j.monto.toFixed(2)}</span>
                <IconButton size="small" onClick={() => handleEliminarJugada('cash3', j.id)}>
                  <Trash2 size={12} color="#f44336" />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Box sx={{ bgcolor: '#51cbce', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            TOTAL: ${calcularTotal(jugadasCash3)}
          </Box>
        </Paper>

        {/* COLUMNA PLAY 4 & PICK 5 */}
        <Paper sx={{ flex: 1, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#3d9970', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold' }}>
            PLAY 4 & PICK 5
          </Box>
          <Box sx={{ bgcolor: '#e8f5e9', px: 1, py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span>LOT</span>
            <span>NUM</span>
            <span>$</span>
            <IconButton size="small" onClick={() => handleEliminarTodas('play4')}>
              <Trash2 size={14} />
            </IconButton>
          </Box>
          <Box sx={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', bgcolor: 'white' }}>
            {jugadasPlay4.map((j) => (
              <Box key={j.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, py: 0.5, borderBottom: '1px solid #eee', fontSize: '12px' }}>
                <span style={{ width: '40%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.sorteo}</span>
                <span style={{ fontWeight: 'bold' }}>{j.numero}</span>
                <span>${j.monto.toFixed(2)}</span>
                <IconButton size="small" onClick={() => handleEliminarJugada('play4', j.id)}>
                  <Trash2 size={12} color="#f44336" />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Box sx={{ bgcolor: '#3d9970', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            TOTAL: ${calcularTotal(jugadasPlay4)}
          </Box>
        </Paper>
      </Box>

      {/* BOTONES DE ACCIÓN */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Box
          component="button"
          onClick={handleDuplicar}
          disabled={totalJugadas === 0}
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: totalJugadas === 0 ? '#ccc' : '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: totalJugadas === 0 ? 'not-allowed' : 'pointer',
            '&:hover': {
              bgcolor: totalJugadas === 0 ? '#ccc' : '#757575',
            },
          }}
        >
          DUPLICAR
        </Box>
        <Box
          component="button"
          onClick={handleCrearTicket}
          disabled={totalJugadas === 0}
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: totalJugadas === 0 ? '#ccc' : '#51cbce',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: totalJugadas === 0 ? 'not-allowed' : 'pointer',
            '&:hover': {
              bgcolor: totalJugadas === 0 ? '#ccc' : '#45b8bb',
            },
          }}
        >
          CREAR TICKET
        </Box>
        <Box
          component="button"
          onClick={() => setHelpModalOpen(true)}
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#388e3c',
            },
          }}
        >
          AYUDA
        </Box>
      </Box>

      {/* Modal de Ayuda */}
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />

      {/* Modal de Vista Previa del Ticket */}
      <Dialog
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: '500px',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {ticketData && (
            <TicketPrinter
              ticketData={ticketData}
              onClose={() => {
                setTicketModalOpen(false);
                setTicketData(null);
              }}
              onAfterPrint={() => {
                setTicketModalOpen(false);
                setTicketData(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default memo(CreateTickets);
