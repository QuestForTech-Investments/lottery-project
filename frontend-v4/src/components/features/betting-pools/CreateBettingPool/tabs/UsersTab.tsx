import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '@services/api';
import * as userService from '@services/userService';
import TempCredentialDialog from '@components/modals/TempCredentialDialog';
import ConfirmActionDialog from '@components/modals/ConfirmActionDialog';

interface BettingPoolUser {
  userId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive: boolean;
}

interface UsersTabProps {
  formData: {
    users?: BettingPoolUser[];
    [key: string]: unknown;
  };
  handleChange: (e: { target: { name: string; value: unknown } }) => void;
  bettingPoolId?: number;
}

interface CreateUserDto {
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  user?: BettingPoolUser;
  temporaryPassword?: string;
}

/**
 * UsersTab Component
 * Manages POS users associated with a betting pool
 * - In create mode: manages local list of users to be created
 * - In edit mode: fetches and manages real users from API
 */
const UsersTab: React.FC<UsersTabProps> = ({ formData, handleChange, bettingPoolId }) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [apiUsers, setApiUsers] = useState<BettingPoolUser[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<BettingPoolUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Temporary credential dialog (shown after create or generate)
  const [tempDialog, setTempDialog] = useState<{ open: boolean; username: string; password: string }>({
    open: false,
    username: '',
    password: '',
  });
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);
  const [confirmGenerate, setConfirmGenerate] = useState<BettingPoolUser | null>(null);

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Determine if we're in edit mode (have a bettingPoolId)
  const isEditMode = !!bettingPoolId;

  // For create mode, use local users from formData
  const localUsers = formData.users || [];

  // Use API users in edit mode, local users in create mode
  const users = isEditMode ? apiUsers : localUsers;

  /**
   * Fetch users from API (edit mode only)
   */
  const fetchUsers = useCallback(async () => {
    if (!bettingPoolId) return;

    setLoadingUsers(true);
    try {
      const response = await api.get<BettingPoolUser[]>(`/betting-pools/${bettingPoolId}/users`);
      setApiUsers(response || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('createBettingPool.users.errorLoading'));
    } finally {
      setLoadingUsers(false);
    }
  }, [bettingPoolId, t]);

  // Load users on mount (edit mode only)
  useEffect(() => {
    if (isEditMode) {
      fetchUsers();
    }
  }, [isEditMode, fetchUsers]);

  const handleOpenDialog = () => {
    setNewUser({ username: '', fullName: '', email: '' });
    setError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewUser({ username: '', fullName: '', email: '' });
    setError(null);
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  /**
   * Validate user input. Password is auto-generated server-side.
   */
  const validateUser = (): boolean => {
    if (!newUser.username.trim()) {
      setError(t('createBettingPool.users.errorRequiredUsername'));
      return false;
    }

    if (newUser.username.trim().length < 3) {
      setError(t('createBettingPool.users.errorMinLength'));
      return false;
    }

    const existingUser = users.find(
      u => u.username.toLowerCase() === newUser.username.trim().toLowerCase()
    );
    if (existingUser) {
      setError(t('createBettingPool.users.errorDuplicate'));
      return false;
    }

    return true;
  };

  /**
   * Add user (API call in edit mode, local in create mode)
   */
  const handleAddUser = async () => {
    if (!validateUser()) return;

    if (isEditMode && bettingPoolId) {
      // Edit mode: call API to create user (password auto-generated server-side)
      setLoading(true);
      try {
        const dto: CreateUserDto = {
          username: newUser.username.trim(),
          fullName: newUser.fullName.trim() || undefined,
          email: newUser.email.trim() || undefined,
        };

        const response = await api.post<ApiResponse>(`/betting-pools/${bettingPoolId}/users`, dto);

        if (response && response.success && response.user) {
          setApiUsers(prev => [...prev, response.user!]);
          handleCloseDialog();
          if (response.temporaryPassword) {
            setTempDialog({
              open: true,
              username: response.user.username,
              password: response.temporaryPassword,
            });
          } else {
            setSuccessMessage(t('createBettingPool.users.successCreated', { value: dto.username }));
          }
        } else {
          setError(response?.message || t('createBettingPool.users.errorCreateUser'));
        }
      } catch (err: unknown) {
        console.error('Error creating user:', err);
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj?.response?.data?.message || t('createBettingPool.users.errorCreateUser'));
      } finally {
        setLoading(false);
      }
    } else {
      // Create mode: add to local list (password generated by backend on banca create)
      const updatedUsers = [
        ...localUsers,
        {
          userId: Date.now(), // Temporary ID
          username: newUser.username.trim(),
          fullName: newUser.fullName.trim() || undefined,
          email: newUser.email.trim() || undefined,
          isActive: true,
        } as BettingPoolUser,
      ];

      handleChange({
        target: {
          name: 'users',
          value: updatedUsers,
        },
      });

      handleCloseDialog();
    }
  };

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteClick = (user: BettingPoolUser) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  /**
   * Close delete confirmation dialog
   */
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  /**
   * Delete user (API call in edit mode, local in create mode)
   */
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (isEditMode && bettingPoolId) {
      // Edit mode: call API to remove user
      setDeletingUser(true);
      try {
        const response = await api.delete<ApiResponse>(
          `/betting-pools/${bettingPoolId}/users/${userToDelete.userId}`
        );

        if (response && response.success) {
          setApiUsers(prev => prev.filter(u => u.userId !== userToDelete.userId));
          handleCloseDeleteConfirm();
          setSuccessMessage(t('createBettingPool.users.successDeleted', { value: userToDelete.username }));
        } else {
          setError(response?.message || t('createBettingPool.users.errorDeleteUser'));
        }
      } catch (err: unknown) {
        console.error('Error deleting user:', err);
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj?.response?.data?.message || t('createBettingPool.users.errorDeleteUser'));
      } finally {
        setDeletingUser(false);
      }
    } else {
      // Create mode: remove from local list
      const updatedUsers = localUsers.filter(u => u.username !== userToDelete.username);
      handleChange({
        target: {
          name: 'users',
          value: updatedUsers,
        },
      });
      handleCloseDeleteConfirm();
    }
  };

  // ========== Generate Temporary Password ==========

  const handleConfirmGenerate = async () => {
    if (!confirmGenerate) return;
    const user = confirmGenerate;
    setGeneratingFor(user.userId);
    try {
      const res = await userService.generateTempPassword(user.userId);
      setTempDialog({
        open: true,
        username: res.username,
        password: res.temporaryPassword,
      });
      setConfirmGenerate(null);
    } catch (err: unknown) {
      console.error('Error generating temp password:', err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj?.response?.data?.message || t('createBettingPool.users.errorGenerateTemp'));
      setConfirmGenerate(null);
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('createBettingPool.users.title')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isEditMode
          ? t('createBettingPool.users.subtitleEdit')
          : t('createBettingPool.users.subtitleCreate')}
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            bgcolor: '#8b5cf6',
            '&:hover': { bgcolor: '#7c3aed' },
          }}
        >
          {t('createBettingPool.users.addUserButton')}
        </Button>

        {isEditMode && (
          <Button
            variant="outlined"
            startIcon={loadingUsers ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={fetchUsers}
            disabled={loadingUsers}
          >
            {t('createBettingPool.users.refreshButton')}
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Current Users */}
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        {t('createBettingPool.users.currentUsersTitle')}
      </Typography>

      {loadingUsers ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('createBettingPool.users.noUsers')}
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#e3e3e3' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('createBettingPool.users.colUsername')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('createBettingPool.users.colName')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('createBettingPool.users.colEmail')}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>{t('createBettingPool.users.colActions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.userId || index} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.firstName || '-'}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      {isEditMode && (
                        <Tooltip title={t('createBettingPool.users.tooltipGenerateTemp')}>
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={generatingFor === user.userId}
                              onClick={() => setConfirmGenerate(user)}
                            >
                              {generatingFor === user.userId
                                ? <CircularProgress size={16} />
                                : <KeyIcon fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      <Tooltip title={t('createBettingPool.users.tooltipDelete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('createBettingPool.users.addDialogTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label={t('createBettingPool.users.usernameField')}
              name="username"
              value={newUser.username}
              onChange={handleNewUserChange}
              autoFocus
              helperText={t('createBettingPool.users.usernameHelper')}
              autoComplete="off"
            />

            <TextField
              fullWidth
              label={t('createBettingPool.users.fullNameField')}
              name="fullName"
              value={newUser.fullName}
              onChange={handleNewUserChange}
            />

            <TextField
              fullWidth
              label={t('createBettingPool.users.emailField')}
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleNewUserChange}
            />

            <Alert severity="info">
              {t('createBettingPool.users.tempPasswordInfo')}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit" disabled={loading}>
            {t('createBettingPool.cancel')}
          </Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            sx={{
              bgcolor: '#8b5cf6',
              '&:hover': { bgcolor: '#7c3aed' },
            }}
          >
            {loading ? t('createBettingPool.users.creating') : t('createBettingPool.users.addUserButton')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>{t('createBettingPool.users.deleteDialogTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('createBettingPool.users.deleteConfirmText')}{' '}
            <strong>{userToDelete?.username}</strong>?
          </Typography>
          {isEditMode && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('createBettingPool.users.deleteEditNote')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteConfirm} color="inherit" disabled={deletingUser}>
            {t('createBettingPool.cancel')}
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={deletingUser}
            startIcon={deletingUser ? <CircularProgress size={16} /> : null}
          >
            {deletingUser ? t('createBettingPool.users.deleting') : t('createBettingPool.users.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm dialog for generating temp password */}
      <ConfirmActionDialog
        isOpen={!!confirmGenerate}
        title={t('createBettingPool.users.confirmGenerateTitle')}
        message={t('createBettingPool.users.confirmGenerateMessage', { value: confirmGenerate?.username ?? '' })}
        confirmLabel={t('createBettingPool.users.confirmGenerateLabel')}
        severity="warning"
        loading={!!generatingFor}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setConfirmGenerate(null)}
      />

      {/* Temporary credential dialog (shown after create or generate) */}
      <TempCredentialDialog
        isOpen={tempDialog.open}
        username={tempDialog.username}
        password={tempDialog.password}
        onClose={() => setTempDialog({ open: false, username: '', password: '' })}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
          icon={<CheckCircleIcon />}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(UsersTab);
