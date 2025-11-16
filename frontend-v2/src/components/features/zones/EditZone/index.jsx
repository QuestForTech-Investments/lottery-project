import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  CircularProgress,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { getZoneById, updateZone } from '@/services/zoneService'
import '../CreateZone/CreateZoneMUI.css'

/**
 * EditZoneMUI Component
 * Form to edit an existing zone with tabs for General info and Contacts
 */
const EditZoneMUI = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  // Tab state
  const [activeTab, setActiveTab] = useState(0)

  // Loading state
  const [loading, setLoading] = useState(true)

  // Form state
  const [zoneName, setZoneName] = useState('')
  const [contacts, setContacts] = useState([])

  // Contact form state
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)

  // UI state
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  /**
   * Load zone data on mount
   */
  useEffect(() => {
    const loadZone = async () => {
      try {
        setLoading(true)
        const zone = await getZoneById(id)
        setZoneName(zone.zoneName || '')
        setLoading(false)
      } catch (err) {
        setError(`Error al cargar la zona: ${err.message}`)
        setLoading(false)
      }
    }

    if (id) {
      loadZone()
    }
  }, [id])

  /**
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  /**
   * Handle add contact
   */
  const handleAddContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      setError('Por favor complete nombre y teléfono del contacto')
      return
    }

    const newContact = {
      id: Date.now(),
      name: contactName.trim(),
      phone: contactPhone.trim()
    }

    setContacts([...contacts, newContact])
    setContactName('')
    setContactPhone('')
    setShowContactForm(false)
    setSuccessMessage('Contacto agregado correctamente')
  }

  /**
   * Handle delete contact
   */
  const handleDeleteContact = (contactId) => {
    setContacts(contacts.filter(c => c.id !== contactId))
    setSuccessMessage('Contacto eliminado')
  }

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!zoneName.trim()) {
      setError('El nombre de la zona es requerido')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const zoneData = {
        zoneName: zoneName.trim()
      }

      const response = await updateZone(id, zoneData)

      // Check if response has zoneId (successful update)
      if (response && response.zoneId) {
        setSuccessMessage('Zona actualizada exitosamente')
        setTimeout(() => {
          navigate('/zones/list')
        }, 1500)
      } else {
        setError(response?.message || 'Error al actualizar la zona')
      }

      setLoading(false)
    } catch (err) {
      setError(err.message || 'Error al actualizar la zona')
      console.error('Error updating zone:', err)
      setLoading(false)
    }
  }

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    navigate('/zones/list')
  }

  // Show loading state while fetching zone data
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cargando zona...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="create-zone-container" sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1">
            Editar Zona
          </Typography>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="zone form tabs">
              <Tab label="General" className="general-tab" />
              <Tab label="Contactos" className="contacts-tab" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ p: 3 }}>
            {/* General Tab */}
            {activeTab === 0 && (
              <Box className="form-zone">
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, maxWidth: 800, mx: 'auto' }}>
                  <Typography
                    component="label"
                    htmlFor="name"
                    sx={{
                      width: '150px',
                      fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                      fontWeight: 400
                    }}
                  >
                    Nombre
                  </Typography>
                  <TextField
                    id="name"
                    name="name"
                    placeholder="Nombre"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    autoFocus
                    fullWidth
                    className="form-field-custom"
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                        fontSize: '14px',
                        padding: '10px',
                        color: 'rgb(102, 97, 91)',
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                        '& fieldset': {
                          borderColor: 'rgb(221, 221, 221)',
                          borderWidth: '1.15px',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgb(180, 180, 180)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgb(81, 188, 218)',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Contacts Tab */}
            {activeTab === 1 && (
              <Box className="contacts-section" sx={{ mt: 3 }}>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                  {/* Add Contact Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Button
                      variant="contained"
                      className="btn-add-contact"
                      onClick={() => setShowContactForm(!showContactForm)}
                      sx={{
                        backgroundColor: 'rgb(81, 188, 218)',
                        color: 'white',
                        borderRadius: '30px',
                        padding: '11px 23px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                        transition: '0.15s linear',
                        '&:hover': {
                          backgroundColor: 'rgb(61, 168, 198)',
                        },
                      }}
                    >
                      <AddIcon sx={{ mr: 1 }} />
                      Agregar contacto
                    </Button>
                  </Box>

                  {/* Contact Form */}
                  {showContactForm && (
                    <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                          label="Nombre"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          fullWidth
                          size="small"
                        />
                        <TextField
                          label="Teléfono"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" onClick={() => setShowContactForm(false)}>
                          Cancelar
                        </Button>
                        <Button size="small" variant="contained" onClick={handleAddContact}>
                          Agregar
                        </Button>
                      </Box>
                    </Box>
                  )}

                  <hr />

                  {/* Contacts List */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                      Lista de contactos
                    </Typography>

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
                                <Typography color="text.secondary">
                                  No hay entradas
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            contacts.map((contact) => (
                              <TableRow key={contact.id} hover>
                                <TableCell>{contact.name}</TableCell>
                                <TableCell>{contact.phone}</TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteContact(contact.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
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

          {/* Submit Button */}
          <Box className="form-zone" sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ maxWidth: 400, mx: 'auto', display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: '30px',
                  padding: '11px 23px',
                  textTransform: 'uppercase',
                  fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="btn-submit"
                sx={{
                  backgroundColor: 'rgb(81, 188, 218)',
                  color: 'white',
                  borderRadius: '30px',
                  padding: '11px 23px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                  transition: '0.15s linear',
                  '&:hover': {
                    backgroundColor: 'rgb(61, 168, 198)',
                  },
                }}
              >
                Actualizar
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EditZoneMUI
