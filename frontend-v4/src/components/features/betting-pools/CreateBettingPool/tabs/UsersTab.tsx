import React, { useState, useEffect, useCallback } from 'react';
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
  password: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  user?: BettingPoolUser;
}

/**
 * UsersTab Component
 * Manages POS users associated with a betting pool
 * - In create mode: manages local list of users to be created
 * - In edit mode: fetches and manages real users from API
 */
const UsersTab: React.FC<UsersTabProps> = ({ formData, handleChange, bettingPoolId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
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

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<BettingPoolUser | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
      setError('Error al cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  }, [bettingPoolId]);

  // Load users on mount (edit mode only)
  useEffect(() => {
    if (isEditMode) {
      fetchUsers();
    }
  }, [isEditMode, fetchUsers]);

  const handleOpenDialog = () => {
    setNewUser({ username: '', password: '', confirmPassword: '', fullName: '', email: '' });
    setError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewUser({ username: '', password: '', confirmPassword: '', fullName: '', email: '' });
    setError(null);
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  /**
   * Validate user input
   */
  const validateUser = (): boolean => {
    if (!newUser.username.trim()) {
      setError('El nombre de usuario es requerido');
      return false;
    }

    if (newUser.username.trim().length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }

    if (!newUser.password) {
      setError('La contraseña es requerida');
      return false;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (newUser.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!/[a-zA-Z]/.test(newUser.password)) {
      setError('La contraseña debe contener al menos una letra');
      return false;
    }

    if (!/\d/.test(newUser.password)) {
      setError('La contraseña debe contener al menos un número');
      return false;
    }

    // Check for duplicate username in current list
    const existingUser = users.find(
      u => u.username.toLowerCase() === newUser.username.trim().toLowerCase()
    );
    if (existingUser) {
      setError('Ya existe un usuario con ese nombre');
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
      // Edit mode: call API to create user
      setLoading(true);
      try {
        const dto: CreateUserDto = {
          username: newUser.username.trim(),
          password: newUser.password,
          fullName: newUser.fullName.trim() || undefined,
          email: newUser.email.trim() || undefined,
        };

        const response = await api.post<ApiResponse>(`/betting-pools/${bettingPoolId}/users`, dto);

        if (response.success && response.user) {
          setApiUsers(prev => [...prev, response.user!]);
          handleCloseDialog();
          setSuccessMessage(`Usuario ${dto.username} creado exitosamente`);
        } else {
          setError(response.message || 'Error al crear el usuario');
        }
      } catch (err: unknown) {
        console.error('Error creating user:', err);
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj?.response?.data?.message || 'Error al crear el usuario');
      } finally {
        setLoading(false);
      }
    } else {
      // Create mode: add to local list
      const updatedUsers = [
        ...localUsers,
        {
          userId: Date.now(), // Temporary ID
          username: newUser.username.trim(),
          password: newUser.password,
          fullName: newUser.fullName.trim() || undefined,
          email: newUser.email.trim() || undefined,
          isActive: true,
        } as BettingPoolUser & { password?: string },
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

        if (response.success) {
          setApiUsers(prev => prev.filter(u => u.userId !== userToDelete.userId));
          handleCloseDeleteConfirm();
          setSuccessMessage(`Usuario ${userToDelete.username} eliminado exitosamente`);
        } else {
          setError(response.message || 'Error al eliminar el usuario');
        }
      } catch (err: unknown) {
        console.error('Error deleting user:', err);
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj?.response?.data?.message || 'Error al eliminar el usuario');
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

  // ========== Password Change Functions ==========

  /**
   * Open password change dialog
   */
  const handlePasswordClick = (user: BettingPoolUser) => {
    setUserToChangePassword(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordError(null);
    setPasswordDialogOpen(true);
  };

  /**
   * Close password change dialog
   */
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setUserToChangePassword(null);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordError(null);
  };

  /**
   * Handle password form change
   */
  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError(null);
  };

  /**
   * Validate password
   */
  const validatePassword = (): boolean => {
    if (!passwordForm.newPassword) {
      setPasswordError('La nueva contraseña es requerida');
      return false;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!/[a-zA-Z]/.test(passwordForm.newPassword)) {
      setPasswordError('La contraseña debe contener al menos una letra');
      return false;
    }

    if (!/\d/.test(passwordForm.newPassword)) {
      setPasswordError('La contraseña debe contener al menos un número');
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  /**
   * Change user password via API
   */
  const handleChangePassword = async () => {
    if (!validatePassword() || !userToChangePassword) return;

    setChangingPassword(true);
    try {
      await api.put(`/users/${userToChangePassword.userId}/password/admin-reset`, {
        newPassword: passwordForm.newPassword,
      });

      handleClosePasswordDialog();
      setSuccessMessage(`Contraseña de ${userToChangePassword.username} cambiada exitosamente`);
    } catch (err: unknown) {
      console.error('Error changing password:', err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setPasswordError(errorObj?.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Usuarios de la Banca
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isEditMode
          ? 'Gestione los usuarios POS que tienen acceso a esta banca.'
          : 'Añada los usuarios que tendrán acceso a la banca. Serán creados cuando guarde.'}
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
          Añadir usuario
        </Button>

        {isEditMode && (
          <Button
            variant="outlined"
            startIcon={loadingUsers ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={fetchUsers}
            disabled={loadingUsers}
          >
            Actualizar
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Current Users */}
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        Usuarios actuales
      </Typography>

      {loadingUsers ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay usuarios asociados a esta banca.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#e3e3e3' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
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
                        <Tooltip title="Cambiar contraseña">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handlePasswordClick(user)}
                          >
                            <KeyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Eliminar usuario">
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
        <DialogTitle>Añadir usuario POS</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Usuario"
              name="username"
              value={newUser.username}
              onChange={handleNewUserChange}
              autoFocus
              helperText="Mínimo 3 caracteres"
            />

            <TextField
              fullWidth
              label="Nombre completo"
              name="fullName"
              value={newUser.fullName}
              onChange={handleNewUserChange}
            />

            <TextField
              fullWidth
              label="Email (opcional)"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleNewUserChange}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={newUser.password}
              onChange={handleNewUserChange}
              helperText="Mínimo 6 caracteres, al menos una letra y un número"
            />

            <TextField
              fullWidth
              label="Confirmación"
              name="confirmPassword"
              type="password"
              value={newUser.confirmPassword}
              onChange={handleNewUserChange}
              helperText="Repita la contraseña para confirmar"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit" disabled={loading}>
            Cancelar
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
            {loading ? 'Creando...' : 'Añadir usuario'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar al usuario{' '}
            <strong>{userToDelete?.username}</strong>?
          </Typography>
          {isEditMode && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              El usuario será desactivado y no podrá acceder al sistema.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteConfirm} color="inherit" disabled={deletingUser}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={deletingUser}
            startIcon={deletingUser ? <CircularProgress size={16} /> : null}
          >
            {deletingUser ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cambiar contraseña de {userToChangePassword?.username}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {passwordError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordFormChange}
              autoFocus
              helperText="Mínimo 6 caracteres, al menos una letra y un número"
            />

            <TextField
              fullWidth
              label="Confirmar contraseña"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFormChange}
              helperText="Repita la contraseña para confirmar"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClosePasswordDialog} color="inherit" disabled={changingPassword}>
            Cancelar
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={changingPassword}
            startIcon={changingPassword ? <CircularProgress size={16} /> : <KeyIcon />}
            sx={{
              bgcolor: '#8b5cf6',
              '&:hover': { bgcolor: '#7c3aed' },
            }}
          >
            {changingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
          </Button>
        </DialogActions>
      </Dialog>

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
