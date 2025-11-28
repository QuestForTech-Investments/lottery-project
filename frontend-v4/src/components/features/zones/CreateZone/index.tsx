import React, { useState, useCallback, type ChangeEvent, type FormEvent, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { createZone } from '@/services/zoneService'
import './CreateZoneMUI.css'

interface Contact {
  id: number;
  name: string;
  phone: string;
}

interface ZoneResponse {
  zoneId?: number;
  message?: string;
}

/**
 * CreateZoneMUI Component
 * Form to create a new zone with tabs for General info and Contacts
 */
const CreateZoneMUI = (): React.ReactElement => {
  const navigate = useNavigate()

  // Tab state
  const [activeTab, setActiveTab] = useState<number>(0)

  // Form state
  const [zoneName, setZoneName] = useState<string>('')
  const [contacts, setContacts] = useState<Contact[]>([])

  // Contact form state
  const [contactName, setContactName] = useState<string>('')
  const [contactPhone, setContactPhone] = useState<string>('')
  const [showContactForm, setShowContactForm] = useState<boolean>(false)

  // UI state
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>('')

  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }, [])

  const handleAddContact = useCallback(() => {
    if (!contactName.trim() || !contactPhone.trim()) {
      setError('Por favor complete nombre y teléfono del contacto')
      return
    }

    const newContact: Contact = {
      id: Date.now(),
      name: contactName.trim(),
      phone: contactPhone.trim()
    }

    setContacts(prev => [...prev, newContact])
    setContactName('')
    setContactPhone('')
    setShowContactForm(false)
    setSuccessMessage('Contacto agregado correctamente')
  }, [contactName, contactPhone])

  const handleDeleteContact = useCallback((contactId: number) => {
    setContacts(prev => prev.filter(c => c.id !== contactId))
    setSuccessMessage('Contacto eliminado')
  }, [])

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!zoneName.trim()) {
      setError('El nombre de la zona es requerido')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const zoneData = {
        zoneName: zoneName.trim(),
        isActive: true
      }

      const response = await createZone(zoneData) as ZoneResponse

      if (response && response.zoneId) {
        setSuccessMessage('Zona creada exitosamente')
        setTimeout(() => {
          navigate('/zones/list')
        }, 1500)
      } else {
        setError(response?.message || 'Error al crear la zona')
      }

      setLoading(false)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Error al crear la zona')
      console.error('Error creating zone:', err)
      setLoading(false)
    }
  }, [zoneName, navigate])

  const handleCancel = useCallback(() => {
    navigate('/zones/list')
  }, [navigate])

  return (
    <Box className="create-zone-container" sx={{ p: 3 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1">Crear Nueva Zona</Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="zone form tabs">
              <Tab label="General" className="general-tab" />
              <Tab label="Contactos" className="contacts-tab" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Box className="form-zone">
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, maxWidth: 800, mx: 'auto' }}>
                  <Typography component="label" htmlFor="name" sx={{ width: '150px', fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}>
                    Nombre
                  </Typography>
                  <TextField
                    id="name"
                    name="name"
                    placeholder="Nombre"
                    value={zoneName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setZoneName(e.target.value)}
                    autoFocus
                    fullWidth
                    className="form-field-custom"
                    sx={{
                      '& .MuiInputBase-input': { fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif', fontSize: '14px', padding: '10px', color: 'rgb(102, 97, 91)' },
                      '& .MuiOutlinedInput-root': { borderRadius: '4px', '& fieldset': { borderColor: 'rgb(221, 221, 221)', borderWidth: '1.15px' }, '&:hover fieldset': { borderColor: 'rgb(180, 180, 180)' }, '&.Mui-focused fieldset': { borderColor: 'rgb(81, 188, 218)' } },
                    }}
                  />
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box className="contacts-section" sx={{ mt: 3 }}>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Button
                      variant="contained"
                      className="btn-add-contact"
                      onClick={() => setShowContactForm(!showContactForm)}
                      sx={{ backgroundColor: 'rgb(81, 188, 218)', color: 'white', borderRadius: '30px', padding: '11px 23px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif', '&:hover': { backgroundColor: 'rgb(61, 168, 198)' } }}
                    >
                      <AddIcon sx={{ mr: 1 }} />
                      Agregar contacto
                    </Button>
                  </Box>

                  {showContactForm && (
                    <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField label="Nombre" value={contactName} onChange={(e: ChangeEvent<HTMLInputElement>) => setContactName(e.target.value)} fullWidth size="small" />
                        <TextField label="Teléfono" value={contactPhone} onChange={(e: ChangeEvent<HTMLInputElement>) => setContactPhone(e.target.value)} fullWidth size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" onClick={() => setShowContactForm(false)}>Cancelar</Button>
                        <Button size="small" variant="contained" onClick={handleAddContact}>Agregar</Button>
                      </Box>
                    </Box>
                  )}

                  <hr />

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" align="center" sx={{ mb: 2 }}>Lista de contactos</Typography>
                    <TableContainer>
                      <Table size="small" className="contacts-table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {contacts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">No hay entradas</Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            contacts.map((contact) => (
                              <TableRow key={contact.id} hover>
                                <TableCell>{contact.name}</TableCell>
                                <TableCell>{contact.phone}</TableCell>
                                <TableCell align="center">
                                  <IconButton size="small" color="error" onClick={() => handleDeleteContact(contact.id)}><DeleteIcon fontSize="small" /></IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          <Box className="form-zone" sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ maxWidth: 400, mx: 'auto', display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={handleCancel} fullWidth disabled={loading} sx={{ borderRadius: '30px', padding: '11px 23px', textTransform: 'uppercase', fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif' }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" fullWidth disabled={loading} className="btn-submit" sx={{ backgroundColor: 'rgb(81, 188, 218)', color: 'white', borderRadius: '30px', padding: '11px 23px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif', '&:hover': { backgroundColor: 'rgb(61, 168, 198)' } }}>
                {loading ? 'Creando...' : 'Crear'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>{successMessage}</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
    </Box>
  )
}

export default CreateZoneMUI
