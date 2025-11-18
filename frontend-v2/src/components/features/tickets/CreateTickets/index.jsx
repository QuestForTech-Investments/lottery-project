import React from 'react';
import {
  Box,
  Paper,
  Autocomplete,
  TextField,
  Typography,
  Button,
  Switch,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';
import useCreateTickets from './hooks/useCreateTickets';
import PlayTable from './components/PlayTable';

/**
 * CreateTicketsMUI Component
 * Matches V1 layout exactly - horizontal distribution
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

  const handleDigitsKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('amount-input').focus();
    }
  };

  const handleAmountKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPlay();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={3}
        sx={{
          backgroundImage: 'linear-gradient(135deg, rgba(55, 185, 249, 0.1) 0%, rgba(55, 185, 249, 0.05) 100%)',
          backgroundColor: 'rgba(55, 185, 249, 0.05)'
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header: Banca selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, minWidth: '250px' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 50 }}>Banca</Typography>
            <Autocomplete
              freeSolo
              options={bancasList}
              value={selectedBanca}
              onChange={(event, newValue) => setSelectedBanca(newValue || '')}
              onInputChange={(event, newInputValue) => setSelectedBanca(newInputValue)}
              size="small"
              sx={{ flex: 1, minWidth: '180px', maxWidth: '300px' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Seleccionar banca"
                  size="small"
                />
              )}
            />
          </Box>

          {/* Current Sortition Display - Centered */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{
              width: '24px',
              height: '24px',
              bgcolor: currentSortition.color || '#555555',
              borderRadius: '3px',
            }} />
            <Typography
              component="span"
              sx={{
                fontWeight: 600,
                color: '#333',
                fontSize: '12px',
                textTransform: 'uppercase'
              }}
            >
              {currentSortition.name}
            </Typography>
          </Box>

          {/* Sortitions Grid - Colored Buttons */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              '& > *': {
                fontSize: '11px',
                padding: '5px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontWeight: 600,
                textTransform: 'uppercase',
                border: '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 2
                }
              }
            }}>
              {sortitions.map((sortition) => (
                <Box
                  key={sortition.id}
                  onClick={() => setSelectedSortition(sortition.id)}
                  sx={{
                    bgcolor: sortition.color,
                    color: sortition.textColor || 'white',
                    border: sortition.id === selectedSortition ? '2px solid #000' : '2px solid transparent',
                    fontStyle: sortition.closed ? 'italic' : 'normal',
                    opacity: sortition.closed ? 0.6 : 1,
                  }}
                >
                  {sortition.name}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Statistics and Settings - ALL INLINE */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            flexWrap: 'wrap',
            '& > *': { flexShrink: 0 }
          }}>
            <Box sx={{ minWidth: '120px' }}>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5, fontSize: '11px' }}>
                Jugadas del dia
              </Typography>
              <TextField
                value={todayPlays}
                disabled
                size="small"
                sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'center', padding: '6px' } }}
              />
            </Box>
            <Box sx={{ minWidth: '120px' }}>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5, fontSize: '11px' }}>
                Vendido en grupo
              </Typography>
              <TextField
                value={groupSold}
                disabled
                size="small"
                sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'center', padding: '6px' } }}
              />
            </Box>
            <Box sx={{ minWidth: '120px' }}>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5, fontSize: '11px' }}>
                Vendido en banca
              </Typography>
              <TextField
                value={bancaSold}
                disabled
                size="small"
                sx={{ width: '100%', '& .MuiInputBase-input': { textAlign: 'center', padding: '6px' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>Desc.</Typography>
              <Switch
                checked={discountEnabled}
                onChange={(e) => setDiscountEnabled(e.target.checked)}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>Mult. lot</Typography>
              <Switch
                checked={multiLotteryEnabled}
                onChange={(e) => setMultiLotteryEnabled(e.target.checked)}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SendIcon sx={{ fontSize: 14 }} />
              <Switch
                checked={sendSmsEnabled}
                onChange={(e) => setSendSmsEnabled(e.target.checked)}
                size="small"
              />
            </Box>
          </Box>

          {/* Play Input Area - 3 Fields INLINE */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              id="digits-input"
              placeholder="Jugada"
              value={digits}
              onChange={(e) => setDigits(e.target.value)}
              onKeyPress={handleDigitsKeyPress}
              size="small"
              autoFocus
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  backgroundColor: '#fff',
                },
                '& .MuiInputBase-input': {
                  fontSize: '18px',
                  textAlign: 'center',
                  padding: '12px'
                }
              }}
            />
            <TextField
              placeholder="N/A"
              value="N/A"
              disabled
              size="small"
              sx={{
                flex: 1,
                '& .MuiInputBase-input': {
                  fontSize: '18px',
                  textAlign: 'center',
                  padding: '12px'
                }
              }}
            />
            <TextField
              id="amount-input"
              placeholder="Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={handleAmountKeyPress}
              type="number"
              size="small"
              inputProps={{ step: "0.01", min: "0" }}
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  backgroundColor: '#fff',
                },
                '& .MuiInputBase-input': {
                  fontSize: '18px',
                  textAlign: 'center',
                  padding: '12px'
                }
              }}
            />
          </Box>

          {/* Quick Actions and Stats Row - INLINE */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              <TextField
                select
                disabled
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="">Tickets recientes</option>
              </TextField>
              <Button variant="outlined" size="small" disabled sx={{ minWidth: 40 }}>
                🗑️
              </Button>
            </Box>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              bgcolor: '#f5f5f5',
              p: 1,
              borderRadius: 1,
              fontSize: '14px',
              fontWeight: 500
            }}>
              Jugadas: <span style={{ color: '#1976d2' }}>{totalPlays}</span>
            </Box>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              bgcolor: '#f5f5f5',
              p: 1,
              borderRadius: 1,
              fontSize: '14px',
              fontWeight: 500
            }}>
              Total: <span style={{ color: '#1976d2' }}>${totalAmount.toFixed(2)}</span>
            </Box>
          </Box>

          {/* Play Tables - 4 columns side by side */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 2,
            mb: 3
          }}>
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
              variant="contained"
              disabled
              sx={{
                bgcolor: '#37b9f9',
                color: '#fff',
                '&:hover': { bgcolor: '#2da8e8' },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(55, 185, 249, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)'
                },
                textTransform: 'uppercase',
                borderRadius: '4px',
                px: 4
              }}
            >
              DUPLICAR
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateTicket}
              disabled={totalPlays === 0}
              sx={{
                bgcolor: '#37b9f9',
                color: '#fff',
                '&:hover': { bgcolor: '#2da8e8' },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(55, 185, 249, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)'
                },
                textTransform: 'uppercase',
                borderRadius: '4px',
                px: 4
              }}
            >
              CREAR TICKET
            </Button>
            <Button
              variant="contained"
              onClick={() => setHelpModalOpen(true)}
              sx={{
                bgcolor: '#37b9f9',
                color: '#fff',
                '&:hover': { bgcolor: '#2da8e8' },
                textTransform: 'uppercase',
                borderRadius: '4px',
                px: 4
              }}
            >
              AYUDA
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateTicketsMUI;
