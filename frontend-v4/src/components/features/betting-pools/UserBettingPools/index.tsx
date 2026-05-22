import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  Toolbar,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  VpnKey as KeyIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import useUserBettingPools from './hooks/useUserBettingPools';

interface _User {
  id: string;
  bettingPool: string;
  reference: string;
  requiresPasswordChange: boolean;
}

/**
 * UserBancasMUI Component
 * Modern Material-UI version of UserBancas
 */
const UserBancasMUI: React.FC = () => {
  const { t } = useTranslation();
  const {
    users,
    totalUsers,
    zones,
    selectedZones,
    searchText,
    page,
    rowsPerPage,
    passwordModalOpen,
    selectedUsername,
    loading,
    error,
    handleZoneChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePasswordClick,
    handleClosePasswordModal,
    refreshData,
  } = useUserBettingPools();

  // Local state for password change
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  /**
   * Handle save password
   */
  const handleSavePassword = (): void => {
    // Validate password length
    if (newPassword.length < 6) {
      alert(t('bettingPoolsAdmin.passwordMinLength'));
      return;
    }

    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(newPassword)) {
      alert(t('bettingPoolsAdmin.passwordMustHaveLetter'));
      return;
    }

    // Must contain at least one number
    if (!/\d/.test(newPassword)) {
      alert(t('bettingPoolsAdmin.passwordMustHaveNumber'));
      return;
    }

    // Passwords must match
    if (newPassword !== confirmPassword) {
      alert(t('bettingPoolsAdmin.passwordsDoNotMatch'));
      return;
    }

    // TODO: Call API to update password
    setNewPassword('');
    setConfirmPassword('');
    handleClosePasswordModal();
  };

  /**
   * Handle close modal and reset password fields
   */
  const handleClose = (): void => {
    setNewPassword('');
    setConfirmPassword('');
    handleClosePasswordModal();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, py: 2 }}>
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            component="div"
          >
            {t('bettingPoolsAdmin.userBettingPoolsTitle')}
          </Typography>
          <IconButton
            onClick={refreshData}
            disabled={loading}
            title={t('bettingPoolsAdmin.refreshData')}
            sx={{ mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Zone Filter */}
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>{t('common.zones')}</InputLabel>
              <Select
                multiple
                value={selectedZones}
                onChange={handleZoneChange}
                label={t('common.zones')}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.length === zones.length ? (
                      <Chip size="small" label={t('bettingPoolsAdmin.allZones')} />
                    ) : (
                      <Chip size="small" label={t('bettingPoolsAdmin.selectedCount', { count: selected.length })} />
                    )}
                  </Box>
                )}
              >
                <MenuItem value="all">
                  <Checkbox checked={selectedZones.length === zones.length} />
                  <ListItemText primary={t('bettingPoolsAdmin.selectAll')} />
                </MenuItem>
                {zones.map((zone) => (
                  <MenuItem key={zone} value={zone}>
                    <Checkbox checked={selectedZones.includes(zone)} />
                    <ListItemText primary={zone} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search Filter */}
            <TextField
              placeholder={t('bettingPoolsAdmin.quickSearchPlaceholder')}
              value={searchText}
              onChange={handleSearchChange}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>{t('bettingPoolsAdmin.userTableUser')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('bettingPoolsAdmin.userTableBettingPool')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('bettingPoolsAdmin.userTableReference')}</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>{t('bettingPoolsAdmin.userTableRequiresPasswordChange')}</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>{t('bettingPoolsAdmin.userTableActions')}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary">
                        {t('bettingPoolsAdmin.loadingUsers')}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      {t('bettingPoolsAdmin.noUsersFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, _index) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.bettingPool}</TableCell>
                    <TableCell>{user.reference}</TableCell>
                    <TableCell align="center">
                      {user.requiresPasswordChange && (
                        <CheckIcon color="success" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handlePasswordClick(user.id)}
                        title={t('bettingPoolsAdmin.changePassword')}
                      >
                        <KeyIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('bettingPoolsAdmin.rowsPerPageLabel')}
          labelDisplayedRows={({ from, to, count }) =>
            count !== -1
              ? t('bettingPoolsAdmin.fromToOfTotal', { from, to, total: count })
              : t('bettingPoolsAdmin.fromToMoreThan', { from, to })
          }
        />
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={passwordModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('bettingPoolsAdmin.changePasswordTitle', { username: selectedUsername })}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label={t('bettingPoolsAdmin.newPasswordLabel')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText={t('bettingPoolsAdmin.passwordHelper')}
              sx={{ mb: 2 }}
              autoComplete="new-password"
            />
            <TextField
              fullWidth
              type="password"
              label={t('bettingPoolsAdmin.confirmPasswordLabel')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={newPassword !== confirmPassword && confirmPassword !== ''}
              helperText={
                newPassword !== confirmPassword && confirmPassword !== ''
                  ? t('bettingPoolsAdmin.passwordsDoNotMatch')
                  : ''
              }
              autoComplete="new-password"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSavePassword}
            variant="contained"
            disabled={
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              newPassword.length < 6 ||
              !/[a-zA-Z]/.test(newPassword) ||
              !/\d/.test(newPassword)
            }
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/**
 * Memoize UserBancasMUI to prevent unnecessary re-renders
 * Component only re-renders when usuarios data or filters change
 */
export default memo(UserBancasMUI);
