/**
 * CreateTicket Component
 *
 * Form for creating lottery tickets with live preview.
 */

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import JsBarcode from 'jsbarcode';
import api from '../../../../services/api';
import TicketPrinter from '../TicketPrinter';

// Types and constants
import type { Draw, BetType, TicketLine, MockTicket, Totals } from './types';
import { COMMISSION_RATE } from './constants';

// Components
import {
  AddLineSection,
  LinesTable,
  AdditionalDataSection,
  TicketSummary,
  TicketPreview,
} from './components';

// ============================================================================
// Main Component
// ============================================================================

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();

  // Parameter state
  const [draws, setDraws] = useState<Draw[]>([]);
  const [betTypes, setBetTypes] = useState<BetType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [selectedDraw, setSelectedDraw] = useState<string>('');
  const [betNumber, setBetNumber] = useState<string>('');
  const [selectedBetType, setSelectedBetType] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [multiplier, setMultiplier] = useState<string>('1.00');

  // Additional data
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [globalMultiplier, setGlobalMultiplier] = useState<string>('1.00');
  const [globalDiscount, setGlobalDiscount] = useState<string>('0.00');

  // Ticket lines
  const [lines, setLines] = useState<TicketLine[]>([]);

  // Created ticket state
  const [createdTicket, setCreatedTicket] = useState<MockTicket | null>(null);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);

  // Calculate totals
  const totals = useMemo<Totals>(() => {
    const discount = parseFloat(globalDiscount) || 0;
    const mult = parseFloat(globalMultiplier) || 1;

    let totalBet = 0;
    let totalCommission = 0;

    lines.forEach(line => {
      const amount = line.betAmount * line.multiplier * mult;
      const discountAmount = amount * (discount / 100);
      const afterDiscount = amount - discountAmount;
      const commission = afterDiscount * COMMISSION_RATE;

      totalBet += amount;
      totalCommission += commission;
    });

    const grandTotal = totalBet - (totalBet * (discount / 100));

    return {
      totalBet: totalBet.toFixed(2),
      totalCommission: totalCommission.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  }, [lines, globalDiscount, globalMultiplier]);

  // Generate mock ticket for preview
  const mockTicketData = useMemo<MockTicket | null>(() => {
    if (lines.length === 0) return null;

    return {
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
  }, [lines, customerName, customerPhone, notes, totals, globalMultiplier]);

  // Load parameters on mount
  useEffect(() => {
    const loadParams = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await api.get('/tickets/params/create', {
          headers: { Authorization: `Bearer ${token}` }
        }) as { draws?: Draw[]; betTypes?: BetType[] };

        setDraws(response.draws || []);
        setBetTypes(response.betTypes || []);
      } catch (error) {
        alert('Error al cargar parameters de creacion');
      } finally {
        setLoading(false);
      }
    };
    loadParams();
  }, []);

  // Generate barcode for preview
  useEffect(() => {
    if (lines.length > 0) {
      setTimeout(() => {
        const barcodeElement = document.getElementById('barcode-preview-ticket');
        if (barcodeElement) {
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
    }
  }, [lines]);

  // Handlers
  const handleAddLine = useCallback(() => {
    if (!selectedDraw || !betNumber || !selectedBetType || !betAmount) {
      alert('Por favor complete todos los campos de la linea');
      return;
    }

    const draw = draws.find(d => d.drawId === parseInt(selectedDraw));
    const betType = betTypes.find(bt => bt.betTypeId === parseInt(selectedBetType));

    if (!draw || !betType) {
      alert('Sorteo o bet type no validos');
      return;
    }

    const newLine: TicketLine = {
      drawId: draw.drawId,
      drawName: draw.drawName,
      lotteryName: draw.lotteryName,
      betNumber: betNumber,
      betTypeId: betType.betTypeId,
      betTypeName: betType.betTypeName,
      betAmount: parseFloat(betAmount),
      multiplier: parseFloat(multiplier) || 1.00
    };

    setLines(prev => [...prev, newLine]);
    setBetNumber('');
    setBetAmount('');
  }, [selectedDraw, betNumber, selectedBetType, betAmount, multiplier, draws, betTypes]);

  const handleRemoveLine = useCallback((index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCreateTicket = useCallback(async () => {
    if (lines.length === 0) {
      alert('Debe agregar al menos una linea al ticket');
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

      setCreatedTicket(response);
      setShowPrintView(true);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = error.response?.data?.message || error.message || 'Error al crear ticket';
      alert(`Error: ${errorMsg}`);
    }
  }, [lines, globalMultiplier, globalDiscount, customerName, customerPhone, notes]);

  const resetForm = useCallback(() => {
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
  }, []);

  // Print view
  if (showPrintView && createdTicket) {
    return (
      <TicketPrinter
        ticketData={createdTicket}
        onAfterPrint={() => {
          const createAnother = window.confirm('Desea crear otro ticket?');
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

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center' }}>
        Crear Ticket
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Left Column: Form */}
        <Box sx={{ flex: 1, minWidth: '500px' }}>
          <AddLineSection
            draws={draws}
            betTypes={betTypes}
            selectedDraw={selectedDraw}
            betNumber={betNumber}
            selectedBetType={selectedBetType}
            betAmount={betAmount}
            multiplier={multiplier}
            onDrawChange={setSelectedDraw}
            onBetNumberChange={setBetNumber}
            onBetTypeChange={setSelectedBetType}
            onBetAmountChange={setBetAmount}
            onMultiplierChange={setMultiplier}
            onAddLine={handleAddLine}
          />

          <LinesTable lines={lines} onRemoveLine={handleRemoveLine} />

          <AdditionalDataSection
            customerName={customerName}
            customerPhone={customerPhone}
            globalMultiplier={globalMultiplier}
            globalDiscount={globalDiscount}
            notes={notes}
            onCustomerNameChange={setCustomerName}
            onCustomerPhoneChange={setCustomerPhone}
            onGlobalMultiplierChange={setGlobalMultiplier}
            onGlobalDiscountChange={setGlobalDiscount}
            onNotesChange={setNotes}
          />

          <TicketSummary
            linesCount={lines.length}
            totals={totals}
            onCreateTicket={handleCreateTicket}
            onReset={resetForm}
          />
        </Box>

        {/* Right Column: Preview */}
        <TicketPreview
          mockTicketData={mockTicketData}
          linesCount={lines.length}
          totals={totals}
          customerName={customerName}
        />
      </Box>
    </Box>
  );
};

export default memo(CreateTicket);
