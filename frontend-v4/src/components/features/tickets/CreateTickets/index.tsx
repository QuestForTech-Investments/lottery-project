/**
 * CreateTickets Component
 *
 * Refactored component with modular architecture.
 * - Types extracted to ./types.ts
 * - State/logic extracted to ./hooks/useCreateTicketsState.ts
 * - Constants extracted to ./constants.ts
 * - UI components extracted to ./components/
 */

import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, TextField, Typography, Autocomplete, Chip,
  Dialog, DialogContent, Snackbar, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import { Dices } from 'lucide-react';
import HelpModal from './HelpModal';
import TicketPrinter from '../TicketPrinter';

// Internal imports
import { useCreateTicketsState } from './hooks/useCreateTicketsState';
import { useUserPermissions } from '@hooks/useUserPermissions';
import { COLUMN_COLORS, COLUMN_TITLES } from './constants';
import { BetCardColumn, UnifiedBetsTable, DrawsGrid, StatsRow, BetInputRow, TicketsDropdown, ConvertPlaysModal } from './components';
import type { TicketDateMode } from './types';

/**
 * CreateTickets - Exact replica of the original Vue.js application
 */
const CreateTickets: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  // Phones replace the 4-column bet grid with a single "Jugadas" table.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    betNumberInputRef,
    amountInputRef,
    selectedPool,
    pools,
    setSelectedPool,
    selectedDraw,
    selectedDraws,
    draws,
    loadingDraws,
    loadingAllowedDraws,
    allowedDrawIds,
    dailyBets,
    soldInGroup,
    soldInPool,
    discountActive,
    multiLotteryMode,
    setDiscountActive,
    setMultiLotteryMode,
    betNumber,
    amount,
    betError,
    betWarning,
    setBetNumber,
    setAmount,
    directBets,
    paleBets,
    cash3Bets,
    play4Bets,
    helpModalOpen,
    ticketModalOpen,
    ticketData,
    successMessage,
    setHelpModalOpen,
    setTicketModalOpen,
    setTicketData,
    setSuccessMessage,
    visibleColumns,
    bgColor,
    directTotal,
    paleTotal,
    cash3Total,
    play4Total,
    grandTotal,
    totalBets,
    handleDrawClick,
    handleAddBet,
    handleDeleteBet,
    handleDeleteAll,
    handleCreateTicket,
    handleDuplicate,
    handleBetNumberKeyDown,
    handleAmountKeyDown,
    ticketDateMode,
    selectedFutureDate,
    effectiveTicketDate,
    handleTogglePreviousDay,
    handleToggleFutureDate,
    handleFutureDateChange,
    creatingTicket,
    cancelMinutes,
    allowSplitAmount,
    limitAvailable,
    limitChecking,
    signalRConnected,
    handleBetNumberBlur,
    playStats,
    isCompoundPlay,
    convertModalOpen,
    setConvertModalOpen,
    handleConvertPlays,
    selectedDrawGameTypes,
  } = useCreateTicketsState();

  const { hasPermission } = useUserPermissions();

  return (
    <Box sx={{ bgcolor: bgColor, minHeight: '100vh', p: { xs: 1, md: 2 }, transition: 'background-color 0.3s ease' }}>
      {/* Header: Pool Selector + Draw Preview — stacks vertically on phones */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1.5, md: 3 },
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <Typography sx={{ color: '#666', fontSize: '14px', flexShrink: 0 }}>{t('common.bettingPool')}</Typography>
          <Autocomplete
            size="small"
            options={pools}
            getOptionLabel={(option) =>
              option.bettingPoolCode
                ? `${option.bettingPoolCode}${option.reference ? ` (${option.reference})` : ''}`
                : ''
            }
            filterOptions={(options, { inputValue }) => {
              const filterValue = inputValue.toLowerCase();
              return options.filter(option =>
                option.bettingPoolName?.toLowerCase().includes(filterValue) ||
                option.bettingPoolCode?.toLowerCase().includes(filterValue) ||
                String(option.bettingPoolId).includes(filterValue) ||
                (option.reference && option.reference.toLowerCase().includes(filterValue))
              );
            }}
            value={selectedPool}
            onChange={(_, newValue) => setSelectedPool(newValue)}
            sx={{ width: { xs: '100%', md: 280 }, bgcolor: 'white' }}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder={t('tickets.create.searchBettingPool')} />}
          />
        </Box>

        {/* Selected draw preview */}
        <DrawPreview
          selectedDraw={selectedDraw}
          selectedDraws={selectedDraws}
          multiLotteryMode={multiLotteryMode}
        />
      </Box>

      {/* Draws Grid */}
      <DrawsGrid
        draws={draws}
        selectedDraw={selectedDraw}
        selectedDraws={selectedDraws}
        selectedPool={selectedPool}
        multiLotteryMode={multiLotteryMode}
        loadingDraws={loadingDraws}
        loadingAllowedDraws={loadingAllowedDraws}
        allowedDrawIds={allowedDrawIds}
        onDrawClick={handleDrawClick}
      />

      {/* Stats Row */}
      <StatsRow
        dailyBets={playStats?.playCount ?? dailyBets}
        soldInGroup={playStats ? `$${playStats.soldInGroup.toFixed(2)}` : soldInGroup}
        soldInPool={playStats ? `$${playStats.soldInPool.toFixed(2)}` : soldInPool}
        discountActive={discountActive}
        multiLotteryMode={multiLotteryMode}
        onDiscountChange={setDiscountActive}
        onMultiLotteryChange={setMultiLotteryMode}
      />

      {/* Bet Input Row */}
      <BetInputRow
        betNumber={betNumber}
        amount={amount}
        betError={betError}
        betWarning={betWarning}
        selectedDraw={selectedDraw}
        totalBets={totalBets}
        grandTotal={grandTotal}
        betNumberInputRef={betNumberInputRef}
        amountInputRef={amountInputRef}
        onBetNumberChange={setBetNumber}
        onAmountChange={setAmount}
        onAddBet={handleAddBet}
        onBetNumberKeyDown={handleBetNumberKeyDown}
        onAmountKeyDown={handleAmountKeyDown}
        onBetNumberBlur={handleBetNumberBlur}
        limitAvailable={limitAvailable}
        limitChecking={limitChecking}
        compoundMode={isCompoundPlay}
        allowSplitAmount={allowSplitAmount}
        onOpenConvertModal={() => setConvertModalOpen(true)}
        ticketsDropdown={<TicketsDropdown selectedPool={selectedPool} cancelMinutes={cancelMinutes} />}
      />

      {/* Bet display — phones get a single consolidated "Jugadas" table;
          larger screens keep the 4-column grid (one column per bet type). */}
      {isMobile ? (
        <UnifiedBetsTable
          directBets={directBets}
          paleBets={paleBets}
          cash3Bets={cash3Bets}
          play4Bets={play4Bets}
          directTotal={directTotal}
          paleTotal={paleTotal}
          cash3Total={cash3Total}
          play4Total={play4Total}
          onDeleteBet={handleDeleteBet}
          onDeleteAll={handleDeleteAll}
        />
      ) : (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {visibleColumns.directo && (
            <BetCardColumn
              title={COLUMN_TITLES.directo}
              headerColor={COLUMN_COLORS.directo.headerColor}
              headerBgColor={COLUMN_COLORS.directo.headerBgColor}
              bets={directBets}
              columnType="directo"
              onDeleteBet={handleDeleteBet}
              onDeleteAll={handleDeleteAll}
              total={directTotal}
            />
          )}
          {visibleColumns.pale && (
            <BetCardColumn
              title={COLUMN_TITLES.pale}
              headerColor={COLUMN_COLORS.pale.headerColor}
              headerBgColor={COLUMN_COLORS.pale.headerBgColor}
              bets={paleBets}
              columnType="pale"
              onDeleteBet={handleDeleteBet}
              onDeleteAll={handleDeleteAll}
              total={paleTotal}
            />
          )}
          {visibleColumns.cash3 && (
            <BetCardColumn
              title={COLUMN_TITLES.cash3}
              headerColor={COLUMN_COLORS.cash3.headerColor}
              headerBgColor={COLUMN_COLORS.cash3.headerBgColor}
              bets={cash3Bets}
              columnType="cash3"
              onDeleteBet={handleDeleteBet}
              onDeleteAll={handleDeleteAll}
              total={cash3Total}
            />
          )}
          {visibleColumns.play4 && (
            <BetCardColumn
              title={COLUMN_TITLES.play4}
              headerColor={COLUMN_COLORS.play4.headerColor}
              headerBgColor={COLUMN_COLORS.play4.headerBgColor}
              bets={play4Bets}
              columnType="play4"
              onDeleteBet={handleDeleteBet}
              onDeleteAll={handleDeleteAll}
              total={play4Total}
            />
          )}
        </Box>
      )}

      {/* Action Buttons */}
      <ActionButtonsRow
        totalBets={totalBets}
        creatingTicket={creatingTicket}
        ticketDateMode={ticketDateMode}
        selectedFutureDate={selectedFutureDate}
        effectiveTicketDate={effectiveTicketDate}
        canPreviousDay={hasPermission('TICKET_PREVIOUS_DAY_SALE')}
        canFutureDate={hasPermission('TICKET_FUTURE_SALE')}
        onTogglePreviousDay={handleTogglePreviousDay}
        onToggleFutureDate={handleToggleFutureDate}
        onFutureDateChange={handleFutureDateChange}
        onDuplicate={handleDuplicate}
        onCreate={handleCreateTicket}
        onHelp={() => setHelpModalOpen(true)}
      />

      {/* Modals */}
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />

      <ConvertPlaysModal
        open={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        allBets={[...directBets, ...paleBets, ...cash3Bets, ...play4Bets]}
        selectedDrawId={selectedDraw?.id ?? null}
        allowedGameTypes={selectedDrawGameTypes}
        onConvert={handleConvertPlays}
      />

      <Dialog
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, maxWidth: '500px' } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {ticketData && (
            <TicketPrinter
              ticketData={ticketData}
              onClose={() => { setTicketModalOpen(false); setTicketData(null); }}
              onAfterPrint={() => { setTicketModalOpen(false); setTicketData(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          variant="filled"
          sx={{ width: '100%', fontSize: '16px' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Helper sub-components for cleaner JSX

interface DrawPreviewProps {
  selectedDraw: { id: number; name: string; color: string; imageUrl?: string } | null;
  selectedDraws: Array<{ id: number; name: string; color: string; imageUrl?: string }>;
  multiLotteryMode: boolean;
}

const DrawPreview = memo<DrawPreviewProps>(({ selectedDraw, selectedDraws, multiLotteryMode }) => {
  const { t } = useTranslation();
  return (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    {multiLotteryMode && selectedDraws.length > 1 ? (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {selectedDraws.slice(0, 4).map((draw) => (
          <Box
            key={draw.id}
            sx={{
              width: 35, height: 35,
              bgcolor: draw.color || '#ddd',
              borderRadius: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid rgba(0,0,0,0.1)',
            }}
          >
            {draw.imageUrl ? (
              <Box component="img" src={draw.imageUrl} alt={draw.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Dices size={18} color="white" />
            )}
          </Box>
        ))}
        {selectedDraws.length > 4 && (
          <Box sx={{
            width: 35, height: 35, bgcolor: '#666', borderRadius: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '12px', fontWeight: 'bold',
          }}>
            +{selectedDraws.length - 4}
          </Box>
        )}
      </Box>
    ) : (
      <Box sx={{
        width: 50, height: 50,
        bgcolor: selectedDraw?.color || '#ddd',
        borderRadius: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        border: '2px solid rgba(0,0,0,0.1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        {selectedDraw?.imageUrl ? (
          <Box component="img" src={selectedDraw.imageUrl} alt={selectedDraw.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Dices size={28} color="white" />
        )}
      </Box>
    )}
    <Typography sx={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
      {multiLotteryMode && selectedDraws.length > 1
        ? t('tickets.create.drawsSelected', { count: selectedDraws.length })
        : selectedDraw?.name || t('tickets.create.selectDraw')}
    </Typography>
  </Box>
  );
});

DrawPreview.displayName = 'DrawPreview';

interface ActionButtonsRowProps {
  totalBets: number;
  creatingTicket: boolean;
  ticketDateMode: TicketDateMode;
  selectedFutureDate: string;
  effectiveTicketDate: string | null;
  canPreviousDay: boolean;
  canFutureDate: boolean;
  onTogglePreviousDay: () => void;
  onToggleFutureDate: () => void;
  onFutureDateChange: (date: string) => void;
  onDuplicate: () => void;
  onCreate: () => void;
  onHelp: () => void;
}

const ActionButtonsRow = memo<ActionButtonsRowProps>(({
  totalBets, creatingTicket, ticketDateMode, selectedFutureDate, effectiveTicketDate,
  canPreviousDay, canFutureDate,
  onTogglePreviousDay, onToggleFutureDate, onFutureDateChange,
  onDuplicate, onCreate, onHelp,
}) => {
  const { t } = useTranslation();
  // Compute min/max for the future date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const isPreviousDayActive = ticketDateMode === 'previousDay';
  const isFutureDateActive = ticketDateMode === 'futureDate';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {canPreviousDay && (
          <Box
            component="button"
            onClick={onTogglePreviousDay}
            sx={{
              px: 3, py: 1.5,
              bgcolor: isPreviousDayActive ? '#e65100' : '#607d8b',
              color: 'white', border: 'none', borderRadius: '4px',
              fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
              outline: isPreviousDayActive ? '2px solid #bf360c' : 'none',
              '&:hover': { bgcolor: isPreviousDayActive ? '#bf360c' : '#455a64' },
            }}
          >
            {t('tickets.create.previousDaySale')}
          </Box>
        )}
        {canFutureDate && (
          <>
            <Box
              component="button"
              onClick={onToggleFutureDate}
              sx={{
                px: 3, py: 1.5,
                bgcolor: isFutureDateActive ? '#1565c0' : '#607d8b',
                color: 'white', border: 'none', borderRadius: '4px',
                fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                outline: isFutureDateActive ? '2px solid #0d47a1' : 'none',
                '&:hover': { bgcolor: isFutureDateActive ? '#0d47a1' : '#455a64' },
              }}
            >
              {t('tickets.create.futureSale')}
            </Box>
            {isFutureDateActive && (
              <TextField
                type="date"
                size="small"
                value={selectedFutureDate}
                onChange={(e) => onFutureDateChange(e.target.value)}
                inputProps={{ min: minDateStr, max: maxDateStr }}
                sx={{ width: 170, bgcolor: 'white', borderRadius: '4px' }}
              />
            )}
          </>
        )}
        <Box
          component="button"
          onClick={onDuplicate}
          disabled={totalBets === 0}
          sx={{
            px: 4, py: 1.5,
            bgcolor: totalBets === 0 ? '#ccc' : '#9e9e9e',
            color: 'white', border: 'none', borderRadius: '4px',
            fontSize: '14px', fontWeight: 'bold',
            cursor: totalBets === 0 ? 'not-allowed' : 'pointer',
            '&:hover': { bgcolor: totalBets === 0 ? '#ccc' : '#757575' },
          }}
        >
          {t('tickets.create.duplicate')}
        </Box>
        <Box
          component="button"
          onClick={onCreate}
          disabled={totalBets === 0 || creatingTicket}
          sx={{
            px: 4, py: 1.5,
            bgcolor: (totalBets === 0 || creatingTicket) ? '#ccc' : '#8b5cf6',
            color: 'white', border: 'none', borderRadius: '4px',
            fontSize: '14px', fontWeight: 'bold',
            cursor: (totalBets === 0 || creatingTicket) ? 'not-allowed' : 'pointer',
            '&:hover': { bgcolor: (totalBets === 0 || creatingTicket) ? '#ccc' : '#7c3aed' },
          }}
        >
          {creatingTicket ? t('tickets.create.creating') : t('tickets.create.createTicket')}
        </Box>
        <Box
          component="button"
          onClick={onHelp}
          sx={{
            px: 4, py: 1.5,
            bgcolor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px',
            fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
            '&:hover': { bgcolor: '#388e3c' },
          }}
        >
          {t('tickets.create.help')}
        </Box>
      </Box>
      {/* Indicator chips */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        {effectiveTicketDate && (
          <Chip
            label={
              isPreviousDayActive
                ? t('tickets.create.drawDatePrevious', { date: effectiveTicketDate })
                : t('tickets.create.drawDateFuture', { date: effectiveTicketDate })
            }
            color={isPreviousDayActive ? 'warning' : 'info'}
            variant="filled"
            sx={{ fontWeight: 'bold', fontSize: '13px' }}
          />
        )}
      </Box>
    </Box>
  );
});

ActionButtonsRow.displayName = 'ActionButtonsRow';

export default memo(CreateTickets);
