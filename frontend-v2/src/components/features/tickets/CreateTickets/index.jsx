import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Autocomplete,
  TextField,
  Typography,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Help as HelpIcon,
  ContentCopy as CopyIcon,
  Sms as SmsIcon,
} from '@mui/icons-material';
import useCreateTickets from './hooks/useCreateTickets';
import PlayTable from './components/PlayTable';

/**
 * CreateTicketsMUI Component
 * Modern Material-UI version of CreateTickets
 */
const CreateTicketsMUI = () => {
  const {
    selectedBanca,
    setSelectedBanca,
    selectedSortition,
    setSelectedSortition,
    discountEnabled,
    setDiscountEnabled,
    multiLotteryEnabled,
    setMultiLotteryEnabled,
    sendSmsEnabled,
    setSendSmsEnabled,
    digits,
    setDigits,
    amount,
    setAmount,
    todayPlays,
    groupSold,
    bancaSold,
    directoPlays,
    paleTripletaPlays,
    cash3Plays,
    play4Pick5Plays,
    helpModalOpen,
    setHelpModalOpen,
    getTotals,
    getCurrentSortition,
    handleAddPlay,
    handleDeletePlay,
    handleDeleteAllPlays,
    handleCreateTicket,
    bancasList,
    sortitions,
  } = useCreateTickets();

  const { totalPlays, totalAmount } = getTotals();
  const currentSortition = getCurrentSortition();

  /**
   * Handle key press in digits field (Enter to add play)
   */
  const handleDigitsKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('amount-input').focus();
    }
  };

  /**
   * Handle key press in amount field (Enter to add play)
   */
  const handleAmountKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPlay();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          {/* Header with Banca and Current Sortition */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={bancasList}
                value={selectedBanca}
                onChange={(event, newValue) => setSelectedBanca(newValue || '')}
                onInputChange={(event, newInputValue) => setSelectedBanca(newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Banca"
                    placeholder="Seleccionar banca"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {currentSortition.name}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Sortitions Grid */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Sorteos Disponibles
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {sortitions.map((sortition) => (
                <Chip
                  key={sortition.id}
                  label={sortition.name}
                  onClick={() => setSelectedSortition(sortition.id)}
                  sx={{
                    bgcolor: sortition.id === selectedSortition ? sortition.color : 'grey.300',
                    color: sortition.id === selectedSortition ? 'white' : 'text.primary',
                    fontWeight: sortition.id === selectedSortition ? 'bold' : 'normal',
                    '&:hover': {
                      bgcolor: sortition.color,
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Statistics and Settings */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Jugadas del día"
                value={todayPlays}
                disabled
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Vendido en grupo"
                value={groupSold}
                disabled
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Vendido en banca"
                value={bancaSold}
                disabled
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={discountEnabled}
                      onChange={(e) => setDiscountEnabled(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Descuento"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={multiLotteryEnabled}
                      onChange={(e) => setMultiLotteryEnabled(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Multi-lotería"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={sendSmsEnabled}
                      onChange={(e) => setSendSmsEnabled(e.target.checked)}
                      size="small"
                      icon={<SmsIcon fontSize="small" />}
                      checkedIcon={<SmsIcon fontSize="small" />}
                    />
                  }
                  label="Enviar SMS"
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Play Input Area */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                id="digits-input"
                label="Jugada"
                placeholder="Ingrese números"
                value={digits}
                onChange={(e) => setDigits(e.target.value)}
                onKeyPress={handleDigitsKeyPress}
                fullWidth
                autoFocus
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Disponibilidad"
                value="N/A"
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  id="amount-input"
                  label="Monto"
                  placeholder="$0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyPress={handleAmountKeyPress}
                  type="number"
                  fullWidth
                  inputProps={{ step: "0.01", min: "0" }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddPlay}
                  sx={{ minWidth: '100px' }}
                  disabled={!digits || !amount}
                >
                  <AddIcon />
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Total Statistics */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3, justifyContent: 'center' }}>
            <Chip
              label={`Jugadas: ${totalPlays}`}
              color="primary"
              sx={{ fontSize: '1rem', py: 2.5, px: 2 }}
            />
            <Chip
              label={`Total: $${totalAmount.toFixed(2)}`}
              color="secondary"
              sx={{ fontSize: '1rem', py: 2.5, px: 2 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Play Tables */}
          <Box sx={{ mb: 3 }}>
            <PlayTable
              title="Directo"
              plays={directoPlays}
              type="directo"
              onDeletePlay={handleDeletePlay}
              onDeleteAll={handleDeleteAllPlays}
            />
            <PlayTable
              title="Pale & Tripleta"
              plays={paleTripletaPlays}
              type="pale"
              onDeletePlay={handleDeletePlay}
              onDeleteAll={handleDeleteAllPlays}
            />
            <PlayTable
              title="Cash 3"
              plays={cash3Plays}
              type="cash3"
              onDeletePlay={handleDeletePlay}
              onDeleteAll={handleDeleteAllPlays}
            />
            <PlayTable
              title="Play 4 & Pick 5"
              plays={play4Pick5Plays}
              type="play4"
              onDeletePlay={handleDeletePlay}
              onDeleteAll={handleDeleteAllPlays}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              disabled
            >
              Duplicar
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleCreateTicket}
              disabled={totalPlays === 0}
              sx={{ minWidth: 200 }}
            >
              Crear Ticket
            </Button>
            <Button
              variant="outlined"
              startIcon={<HelpIcon />}
              onClick={() => setHelpModalOpen(true)}
            >
              Ayuda
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateTicketsMUI;
