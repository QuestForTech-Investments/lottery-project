import { useState, memo } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  VpnKey as KeyIcon,
  Replay as ReplayIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import useUserAdministrators from './hooks/useUserAdministrators';

/**
 * UserAdministratorsMUI Component
 * Modern Material-UI version of UserAdministrators
 */
const UserAdministratorsMUI = () => {
  const { t } = useTranslation();
  const {
    administradores,
    totalAdministradores,
    searchText,
    page,
    rowsPerPage,
    passwordModalOpen,
    selectedUsername,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePasswordClick,
    handleClosePasswordModal,
    handleResetPassword,
  } = useUserAdministrators();

  // Local state for password change
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  /**
   * Handle save password
   */
  const handleSavePassword = () => {
    // Validate password length
    if (newPassword.length < 6) {
      alert(t('usersAdmin.passwordMinLength'));
      return;
    }

    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(newPassword)) {
      alert(t('usersAdmin.passwordMustContainLetter'));
      return;
    }

    // Must contain at least one number
    if (!/\d/.test(newPassword)) {
      alert(t('usersAdmin.passwordMustContainNumber'));
      return;
    }

    // Passwords must match
    if (newPassword !== confirmPassword) {
      alert(t('usersAdmin.passwordMustMatch'));
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
  const handleClose = () => {
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
            {t('usersAdmin.administrators')}
          </Typography>
        </Toolbar>

        {/* Search Filter */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            placeholder={t('usersAdmin.searchPlaceholder')}
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

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>{t('usersAdmin.usernameColumn')}</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>{t('usersAdmin.requiresPasswordChange')}</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>{t('usersAdmin.actions')}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {administradores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      {t('usersAdmin.noAdminsFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                administradores.map((admin, _index) => (
                  <TableRow
                    key={admin.username}
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <TableCell>{admin.username}</TableCell>
                    <TableCell align="center">
                      {admin.requiereCambio && (
                        <CheckIcon color="success" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handlePasswordClick(admin.userId, admin.username)}
                          title={t('usersAdmin.changePassword')}
                        >
                          <KeyIcon />
                        </IconButton>
                        {admin.tieneRestablecimiento && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ReplayIcon />}
                            onClick={() => handleResetPassword(admin.username)}
                            title={t('usersAdmin.resetPassword')}
                          >
                            {t('usersAdmin.resetPasswordShort')}
                          </Button>
                        )}
                      </Box>
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
          count={totalAdministradores}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('usersAdmin.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) =>
            count !== -1
              ? t('usersAdmin.fromTo', { from, to, total: count })
              : t('usersAdmin.fromToMoreThan', { from, to })
          }
        />
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={passwordModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('usersAdmin.changePasswordTitle', { username: selectedUsername })}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label={t('usersAdmin.newPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText={t('usersAdmin.newPasswordHint')}
              sx={{ mb: 2 }}
              autoComplete="new-password"
            />
            <TextField
              fullWidth
              type="password"
              label={t('usersAdmin.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={newPassword !== confirmPassword && confirmPassword !== ''}
              helperText={
                newPassword !== confirmPassword && confirmPassword !== ''
                  ? t('usersAdmin.passwordMustMatch')
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
            {t('usersAdmin.savePassword')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(UserAdministratorsMUI);
