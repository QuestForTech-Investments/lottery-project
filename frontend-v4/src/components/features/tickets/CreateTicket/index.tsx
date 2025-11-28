import React, { useState, useEffect, memo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Grid,
  Card,
  CardContent,
  type SelectChangeEvent
} from '@mui/material';
import { Plus, Trash2, RotateCcw, Receipt } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import api from '../../../../services/api';
import TicketPrinter from '../TicketPrinter';
import TicketPrintTemplate from '../TicketPrintTemplate';

interface Draw {
  drawId: number;
  drawName: string;
  lotteryName: string;
  drawTime?: string;
}

interface BetType {
  betTypeId: number;
  betTypeName: string;
}

interface TicketLine {
  drawId: number;
  drawName: string;
  lotteryName: string;
  betNumber: string;
  betTypeId: number;
  betTypeName: string;
  betAmount: number;
  multiplier: number;
}

interface TicketLineForApi {
  lineId: number;
  lineNumber: number;
  lotteryId: number;
  lotteryName: string;
  drawId: number;
  drawName: string;
  drawDate: string;
  drawTime: string;
  betNumber: string;
  betTypeId: number;
  betTypeName: string;
  betAmount: number;
  multiplier: number;
  subtotal: number;
  totalWithMultiplier: number;
  discountAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  netAmount: number;
  isWinner: boolean;
  prizeAmount: number;
}

interface MockTicket {
  ticketId: number;
  ticketCode: string;
  barcode: string;
  status: string;
  bettingPoolId: number;
  bettingPoolName: string;
  userId: number;
  userName: string;
  customerName: string;
  customerPhone: string;
  totalBetAmount: number;
  totalDiscount: number;
  totalCommission: number;
  totalNet: number;
  grandTotal: number;
  createdAt: string;
  notes: string;
  lines: TicketLineForApi[];
}

interface Totals {
  totalBet: number | string;
  totalCommission: number | string;
  grandTotal: number | string;
}

/**
 * Componente para Crear Tickets (Material-UI Version)
 * Con vista previa en tiempo real del ticket
 */
const CreateTicket: React.FC = () => {
  const navigate = useNavigate();

  // Estados para parameters
  const [draws, setDraws] = useState<Draw[]>([]);
  const [betTypes, setBetTypes] = useState<BetType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados del formulario
  const [selectedDraw, setSelectedDraw] = useState<string>('');
  const [betNumber, setBetNumber] = useState<string>('');
  const [selectedBetType, setSelectedBetType] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [multiplier, setMultiplier] = useState<string>('1.00');

  // Estados para datos adicionales
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [globalMultiplier, setGlobalMultiplier] = useState<string>('1.00');
  const [globalDiscount, setGlobalDiscount] = useState<string>('0.00');

  // Estado de ticket lines
  const [lines, setLines] = useState<TicketLine[]>([]);

  // State for ticket creado
  const [createdTicket, setCreatedTicket] = useState<MockTicket | null>(null);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);

  // State for totales calculados
  const [totals, setTotals] = useState<Totals>({
    totalBet: 0,
    totalCommission: 0,
    grandTotal: 0
  });

  // Load parameters on mount
  useEffect(() => {
    loadParams();
  }, []);

  // Recalculate totales when changed lines
  useEffect(() => {
    calculateTotals();
  }, [lines, globalDiscount, globalMultiplier]);

  // Generate barcode for preview
  useEffect(() => {
    if (lines.length > 0) {
      generatePreviewBarcode();
    }
  }, [lines]);

  // Generate ticket mock for preview
  const generateMockTicket = (): MockTicket | null => {
    if (lines.length === 0) {
      return null;
    }

    const mockTicket = {
      ticketId: 0,
      ticketCode: 'PREVIEW-TICKET',
      barcode: 'PREVIEW-TICKET',
      status: 'pending',
      bettingPoolId: 9,
      bettingPoolName: 'admin',
      userId: 11,
      userName: 'Cajero',
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      totalBetAmount: parseFloat(String(totals.totalBet)) || 0,
      totalDiscount: 0,
      totalCommission: parseFloat(String(totals.totalCommission)) || 0,
      totalNet: parseFloat(String(totals.grandTotal)) || 0,
      grandTotal: parseFloat(String(totals.grandTotal)) || 0,
      createdAt: new Date().toISOString(),
      notes: notes || '',
      lines: lines.map((line, index) => ({
        lineId: index + 1,
        lineNumber: index + 1,
        lotteryId: 0,
        lotteryName: line.lotteryName,
        drawId: line.drawId,
        drawName: line.drawName,
        drawDate: new Date().toISOString().split('T')[0],
        drawTime: '12:00:00',
        betNumber: line.betNumber,
        betTypeId: line.betTypeId,
        betTypeName: line.betTypeName,
        betAmount: line.betAmount,
        multiplier: line.multiplier,
        subtotal: line.betAmount * line.multiplier,
        totalWithMultiplier: line.betAmount * line.multiplier * (parseFloat(globalMultiplier) || 1),
        discountAmount: 0,
        commissionPercentage: 10.00,
        commissionAmount: (line.betAmount * line.multiplier * 0.10),
        netAmount: line.betAmount * line.multiplier * 0.90,
        isWinner: false,
        prizeAmount: 0.00
      }))
    };

    return mockTicket;
  };

  // Generate barcode for preview
  const generatePreviewBarcode = (): void => {
    try {
      setTimeout(() => {
        const barcodeElement = document.getElementById('barcode-preview-ticket');
        if (barcodeElement && lines.length > 0) {
          JsBarcode(barcodeElement, 'PREVIEW', {
            format: 'CODE128',
            width: 2,
            height: 50,
            displayValue: false,
            margin: 0,
            background: '#ffffff',
            lineColor: '#000000'
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error generando barcode preview:', error);
    }
  };

  const loadParams = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await api.get('/tickets/params/create', {
        headers: { Authorization: `Bearer ${token}` }
      }) as { draws?: Draw[]; betTypes?: BetType[] };

      setDraws(response.draws || []);
      setBetTypes(response.betTypes || []);
    } catch (error) {
      console.error('Error loading parameters:', error);
      alert('Error al cargar parameters de creación');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const calculateTotals = (): void => {
    const discount = parseFloat(globalDiscount) || 0;
    const multiplier = parseFloat(globalMultiplier) || 1;
    const commissionRate = 0.10; // 10%

    let totalBet = 0;
    let totalCommission = 0;

    lines.forEach(line => {
      const amount = line.betAmount * line.multiplier * multiplier;
      const discountAmount = amount * (discount / 100);
      const afterDiscount = amount - discountAmount;
      const commission = afterDiscount * commissionRate;

      totalBet += amount;
      totalCommission += commission;
    });

    const grandTotal = totalBet - totalCommission - (totalBet * (discount / 100));

    setTotals({
      totalBet: totalBet.toFixed(2),
      totalCommission: totalCommission.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    });
  };

  // Add line
  const handleAddLine = (): void => {
    if (!selectedDraw || !betNumber || !selectedBetType || !betAmount) {
      alert('Por favor complete todos los campos de la línea');
      return;
    }

    const draw = draws.find(d => d.drawId === parseInt(selectedDraw));
    const betType = betTypes.find(bt => bt.betTypeId === parseInt(selectedBetType));

    if (!draw || !betType) {
      alert('Sorteo o bet type no válidos');
      return;
    }

    const newLine = {
      drawId: draw.drawId,
      drawName: draw.drawName,
      lotteryName: draw.lotteryName,
      betNumber: betNumber,
      betTypeId: betType.betTypeId,
      betTypeName: betType.betTypeName,
      betAmount: parseFloat(betAmount),
      multiplier: parseFloat(multiplier) || 1.00
    };

    setLines([...lines, newLine]);

    // Clear line fields
    setBetNumber('');
    setBetAmount('');
  };

  // Delete line
  const handleRemoveLine = (index: number): void => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  // Create ticket
  const handleCreateTicket = async (): Promise<void> => {
    if (lines.length === 0) {
      alert('Debe agregar al menos una línea al ticket');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const userId = parseInt(localStorage.getItem('userId') || '11');
      const bettingPoolId = parseInt(localStorage.getItem('bettingPoolId') || '9');

      const payload = {
        bettingPoolId,
        userId,
        lines: lines.map(line => ({
          drawId: line.drawId,
          betNumber: line.betNumber,
          betTypeId: line.betTypeId,
          betAmount: line.betAmount,
          multiplier: line.multiplier
        })),
        globalMultiplier: parseFloat(globalMultiplier) || 1.00,
        globalDiscount: parseFloat(globalDiscount) || 0.00,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        notes: notes || null
      };

      const response = await api.post('/tickets', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }) as MockTicket;

      console.log('Ticket creado:', response);

      setCreatedTicket(response);
      setShowPrintView(true);
    } catch (err) {
      console.error('Error creando ticket:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = error.response?.data?.message || error.message || 'Error al crear ticket';
      alert(`Error: ${errorMsg}`);
    }
  };

  // Reset formulario
  const resetForm = (): void => {
    setLines([]);
    setSelectedDraw('');
    setBetNumber('');
    setSelectedBetType('');
    setBetAmount('');
    setMultiplier('1.00');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setGlobalMultiplier('1.00');
    setGlobalDiscount('0.00');
    setCreatedTicket(null);
    setShowPrintView(false);
  };

  // Print view
  if (showPrintView && createdTicket) {
    return (
      <TicketPrinter
        ticketData={createdTicket}
        onAfterPrint={() => {
          const createAnother = window.confirm('¿Desea crear otro ticket?');
          if (createAnother) {
            resetForm();
          } else {
            navigate('/tickets/list');
          }
        }}
      />
    );
  }

  if (loading) {
    return (
      <Box sx={{ padding: 3, textAlign: 'center' }}>
        <Typography>Cargando parameters...</Typography>
      </Box>
    );
  }

  // Generate ticket mock for preview
  const mockTicketData = generateMockTicket();

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center' }}>
        🎫 Crear Ticket
      </Typography>

      {/* LAYOUT DE DOS COLUMNAS */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <Box sx={{ flex: 1, minWidth: '500px' }}>
          {/* SECCIÓN 1: AGREGAR LÍNEA */}
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ marginBottom: 2, color: '#51cbce' }}>
                ➕ Agregar Línea
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Sorteo</InputLabel>
                    <Select
                      value={selectedDraw}
                      label="Sorteo"
                      onChange={(e) => setSelectedDraw(e.target.value)}
                    >
                      <MenuItem value="">Seleccione sorteo...</MenuItem>
                      {draws.map(draw => (
                        <MenuItem key={draw.drawId} value={draw.drawId}>
                          {draw.lotteryName} - {draw.drawName} ({draw.drawTime})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número"
                    placeholder="Ej: 25, 123, etc."
                    value={betNumber}
                    onChange={(e) => setBetNumber(e.target.value)}
                    inputProps={{ maxLength: 20 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Jugada</InputLabel>
                    <Select
                      value={selectedBetType}
                      label="Tipo de Jugada"
                      onChange={(e) => setSelectedBetType(e.target.value)}
                    >
                      <MenuItem value="">Seleccione tipo...</MenuItem>
                      {betTypes.map(bt => (
                        <MenuItem key={bt.betTypeId} value={bt.betTypeId}>
                          {bt.betTypeName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Monto"
                    placeholder="$0.00"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    inputProps={{ min: 1, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Multiplicador"
                    value={multiplier}
                    onChange={(e) => setMultiplier(e.target.value)}
                    inputProps={{ min: 1, max: 100, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={handleAddLine}
                    sx={{
                      bgcolor: '#28a745',
                      '&:hover': { bgcolor: '#218838' }
                    }}
                  >
                    AGREGAR LÍNEA
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* SECCIÓN 2: LÍNEAS AGREGADAS */}
          {lines.length > 0 && (
            <Card sx={{ marginBottom: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ marginBottom: 2, color: '#51cbce' }}>
                  📋 Líneas del Ticket ({lines.length})
                </Typography>

                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#51cbce' }}>
                      <TableCell sx={{ color: '#fff' }}>#</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Sorteo</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Número</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Tipo</TableCell>
                      <TableCell sx={{ color: '#fff', textAlign: 'right' }}>Monto</TableCell>
                      <TableCell sx={{ color: '#fff', textAlign: 'center' }}>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{line.lotteryName} - {line.drawName}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{line.betNumber}</TableCell>
                        <TableCell>{line.betTypeName}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>${line.betAmount.toFixed(2)}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveLine(index)}
                            sx={{ color: '#dc3545' }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* SECCIÓN 3: DATOS ADICIONALES */}
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ marginBottom: 2, color: '#51cbce' }}>
                📝 Datos Adicionales (Opcional)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Cliente"
                    placeholder="Juan Pérez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    inputProps={{ maxLength: 100 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    placeholder="809-555-1234"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    inputProps={{ maxLength: 20 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Multiplicador Global"
                    value={globalMultiplier}
                    onChange={(e) => setGlobalMultiplier(e.target.value)}
                    inputProps={{ min: 1, max: 100, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Descuento Global (%)"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(e.target.value)}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notas"
                    placeholder="Notas adicionales..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    inputProps={{ maxLength: 500 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* SECCIÓN 4: RESUMEN Y CREAR */}
          <Paper sx={{ padding: 3, bgcolor: '#e9ecef' }}>
            <Typography variant="h6" sx={{ marginBottom: 2, color: '#51cbce' }}>
              💰 Resumen del Ticket
            </Typography>

            <Box sx={{ marginBottom: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                <Typography><strong>Total Líneas:</strong></Typography>
                <Typography>{lines.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                <Typography><strong>Total Apostado:</strong></Typography>
                <Typography>${totals.totalBet}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                <Typography><strong>Comisión (10%):</strong></Typography>
                <Typography sx={{ color: '#dc3545' }}>-${totals.totalCommission}</Typography>
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 2,
                borderTop: '2px solid #51cbce'
              }}>
                <Typography variant="h6"><strong>TOTAL A COBRAR:</strong></Typography>
                <Typography variant="h6" sx={{ color: '#51cbce', fontWeight: 'bold' }}>
                  ${totals.grandTotal}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Receipt size={20} />}
                onClick={handleCreateTicket}
                disabled={lines.length === 0}
                sx={{
                  bgcolor: lines.length > 0 ? '#51cbce' : '#ccc',
                  '&:hover': { bgcolor: lines.length > 0 ? '#45b8bb' : '#ccc' }
                }}
              >
                CREAR TICKET
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<RotateCcw size={20} />}
                onClick={resetForm}
                sx={{
                  color: '#6c757d',
                  borderColor: '#6c757d',
                  '&:hover': {
                    borderColor: '#5a6268',
                    bgcolor: 'rgba(108, 117, 125, 0.04)'
                  }
                }}
              >
                LIMPIAR
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* COLUMNA DERECHA: VISTA PREVIA DEL TICKET */}
        <Box sx={{
          flex: '0 0 350px',
          position: 'sticky',
          top: 20,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <Paper sx={{
            border: '2px dashed #51cbce',
            padding: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ marginBottom: 2, color: '#51cbce' }}>
              📋 Vista Previa del Ticket
            </Typography>

            {mockTicketData ? (
              <Box>
                <TicketPrintTemplate ticketData={mockTicketData} />
                <Paper sx={{
                  marginTop: 2,
                  padding: 1.5,
                  bgcolor: '#f8f9fa',
                  fontSize: '12px',
                  textAlign: 'left'
                }}>
                  <div><strong>Líneas:</strong> {lines.length}</div>
                  <div><strong>Total:</strong> ${totals.grandTotal}</div>
                  {customerName && <div><strong>Cliente:</strong> {customerName}</div>}
                </Paper>
              </Box>
            ) : (
              <Box sx={{ padding: 5, color: '#999' }}>
                <Typography variant="h1" sx={{ fontSize: '48px' }}>🎫</Typography>
                <Typography>Agrega líneas para ver</Typography>
                <Typography>la vista previa del ticket</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(CreateTicket);
