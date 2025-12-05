import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface BettingPoolUser {
  id?: number;
  username: string;
  password?: string;
}

interface UsersTabProps {
  formData: {
    users?: BettingPoolUser[];
    [key: string]: unknown;
  };
  handleChange: (e: { target: { name: string; value: unknown } }) => void;
  bettingPoolId?: number;
}

/**
 * UsersTab Component
 * Manages users associated with a betting pool
 */
const UsersTab: React.FC<UsersTabProps> = ({ formData, handleChange, bettingPoolId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);

  const users = formData.users || [];

  const handleOpenDialog = () => {
    setNewUser({ username: '', password: '', confirmPassword: '' });
    setError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewUser({ username: '', password: '', confirmPassword: '' });
    setError(null);
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleAddUser = () => {
    // Validation
    if (!newUser.username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }

    if (!newUser.password) {
      setError('La contraseña es requerida');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newUser.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Check for duplicate username
    const existingUser = users.find(
      u => u.username.toLowerCase() === newUser.username.trim().toLowerCase()
    );
    if (existingUser) {
      setError('Ya existe un usuario con ese nombre');
      return;
    }

    // Add user to the list
    const updatedUsers = [
      ...users,
      {
        username: newUser.username.trim(),
        password: newUser.password,
      },
    ];

    handleChange({
      target: {
        name: 'users',
        value: updatedUsers,
      },
    });

    handleCloseDialog();
  };

  const handleDeleteUser = (username: string) => {
    const updatedUsers = users.filter(u => u.username !== username);
    handleChange({
      target: {
        name: 'users',
        value: updatedUsers,
      },
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Usuarios de la Banca
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gestione los usuarios que tienen acceso a esta banca.
      </Typography>

      {/* Add User Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenDialog}
        sx={{
          mb: 3,
          bgcolor: '#51cbce',
          '&:hover': { bgcolor: '#45b8bb' },
        }}
      >
        Añadir usuario
      </Button>

      <Divider sx={{ mb: 3 }} />

      {/* Current Users */}
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        Usuarios actuales
      </Typography>

      {users.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay usuarios asociados a esta banca.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id || index} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user.username)}
                      title="Eliminar usuario"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Añadir usuario</DialogTitle>
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
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={newUser.password}
              onChange={handleNewUserChange}
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
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
            }}
          >
            Añadir usuario
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(UsersTab);
