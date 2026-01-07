/**
 * CreateTicketsAdvanced Component
 *
 * Advanced ticket creation form replicating the Vue.js original.
 *
 * Features:
 * - Clickable draws grid (multi-select)
 * - Automatic bet type detection by format
 * - Keyboard-driven (ENTER to advance, global shortcuts)
 * - 4 sections (DIRECTO, PALE & TRIPLETA, CASH 3, PLAY 4 & PICK 5)
 * - Automatic generators (q, ., d, -10, +xyz)
 */

import React, { memo } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import BetSection from '../BetSection';
import { useCreateTicketsAdvanced } from './hooks/useCreateTicketsAdvanced';
import { DrawsGrid, BetInputForm, TicketSummary, ActionButtons } from './components';
import { COLORS, SECTION_NAMES } from './constants';
import type { SectionName } from './types';

const CreateTicketsAdvanced: React.FC = () => {
  const {
    playNumberRef,
    playAmountRef,
    draws,
    loading,
    selectedDraws,
    playNumber,
    playAmount,
    customerName,
    lines,
    validationError,
    discountEnabled,
    multiplierEnabled,
    betInfo,
    groupedLines,
    sectionTotals,
    grandTotal,
    setPlayNumber,
    setPlayAmount,
    setCustomerName,
    setDiscountEnabled,
    setMultiplierEnabled,
    handleDrawToggle,
    handlePlayNumberKeyDown,
    handlePlayAmountKeyDown,
    handleDeleteLine,
    handleDeleteSection,
    handleCreateTicket,
    resetForm,
    duplicateTicket,
  } = useCreateTicketsAdvanced();

  if (loading) {
    return (
      <Box sx={{ padding: 3, textAlign: 'center' }}>
        <Typography>Cargando sorteos...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, maxWidth: '1400px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center', color: COLORS.primary }}>
        Crear Ticket
      </Typography>

      <DrawsGrid
        draws={draws}
        selectedDraws={selectedDraws}
        onDrawToggle={handleDrawToggle}
      />

      <BetInputForm
        playNumberRef={playNumberRef}
        playAmountRef={playAmountRef}
        playNumber={playNumber}
        playAmount={playAmount}
        customerName={customerName}
        discountEnabled={discountEnabled}
        multiplierEnabled={multiplierEnabled}
        betInfo={betInfo}
        validationError={validationError}
        onPlayNumberChange={setPlayNumber}
        onPlayAmountChange={setPlayAmount}
        onCustomerNameChange={setCustomerName}
        onDiscountEnabledChange={setDiscountEnabled}
        onMultiplierEnabledChange={setMultiplierEnabled}
        onPlayNumberKeyDown={handlePlayNumberKeyDown}
        onPlayAmountKeyDown={handlePlayAmountKeyDown}
      />

      <TicketSummary
        lineCount={lines.length}
        grandTotal={grandTotal}
        selectedDraws={selectedDraws}
      />

      {/* 4 Bet Sections */}
      <Grid container spacing={2} sx={{ marginBottom: 3 }}>
        {SECTION_NAMES.map((section) => (
          <Grid item xs={12} md={6} key={section}>
            <BetSection
              title={section}
              lines={groupedLines[section]}
              total={sectionTotals[section] || 0}
              onDeleteAll={() => handleDeleteSection(section)}
              onDeleteLine={handleDeleteLine}
            />
          </Grid>
        ))}
      </Grid>

      <ActionButtons
        hasLines={lines.length > 0}
        onDuplicate={duplicateTicket}
        onCreate={handleCreateTicket}
        onReset={resetForm}
        onHelp={() => alert('Modal de ayuda (por implementar)')}
      />
    </Box>
  );
};

export default memo(CreateTicketsAdvanced);
