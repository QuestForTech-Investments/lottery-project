import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getZoneById, updateZone } from '@services/zoneService'
import './CreateZone.css'

/**
 * EditZone Component
 * Form to edit an existing zone with tabs for General info and Contacts
 */
const EditZone = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  // Tab state
  const [activeTab, setActiveTab] = useState('general')

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
        setTimeout(() => setError(null), 5000)
        setLoading(false)
      }
    }

    if (id) {
      loadZone()
    }
  }, [id])

  /**
   * Handle add contact
   */
  const handleAddContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      setError('Por favor complete nombre y teléfono del contacto')
      setTimeout(() => setError(null), 3000)
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
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  /**
   * Handle delete contact
   */
  const handleDeleteContact = (contactId) => {
    setContacts(contacts.filter(c => c.id !== contactId))
    setSuccessMessage('Contacto eliminado')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!zoneName.trim()) {
      setError('El nombre de la zona es requerido')
      setTimeout(() => setError(null), 3000)
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
        setTimeout(() => setError(null), 5000)
      }

      setLoading(false)
    } catch (err) {
      setError(err.message || 'Error al actualizar la zona')
      setTimeout(() => setError(null), 5000)
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
  if (loading && !zoneName) {
    return (
      <div className="create-zone-container">
        <div className="card">
          <div className="card-body text-center p-5">
            <div className="spinner-border" role="status">
              <span className="sr-only">Cargando...</span>
            </div>
            <p className="mt-3">Cargando zona...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-zone-container">
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <h2>Editar Zona</h2>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success m-3" role="alert">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-danger m-3" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-zone-form">
          {/* Tabs */}
          <div className="tabs tabs-content">
            <ul className="nav nav-tabs" role="tablist">
              <li className="nav-item general-tab">
                <a
                  className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                  href="#general"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveTab('general')
                  }}
                  role="tab"
                  aria-selected={activeTab === 'general'}
                >
                  General
                </a>
              </li>
              <li className="nav-item contacts-tab">
                <a
                  className={`nav-link ${activeTab === 'contacts' ? 'active' : ''}`}
                  href="#contacts"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveTab('contacts')
                  }}
                  role="tab"
                  aria-selected={activeTab === 'contacts'}
                >
                  Contactos
                </a>
              </li>
            </ul>

            <div className="tab-content">
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="tab-pane active" role="tabpanel">
                  <div className="form-zone row align-items-center mt-3">
                    <label htmlFor="name" className="col-sm-2 offset-sm-2 col-form-label">
                      Nombre
                    </label>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Nombre"
                          value={zoneName}
                          onChange={(e) => setZoneName(e.target.value)}
                          autoFocus
                          className="form-control form-field-custom"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contacts Tab */}
              {activeTab === 'contacts' && (
                <div className="tab-pane active" role="tabpanel">
                  <div className="row mt-3 justify-content-center">
                    <div className="col-6">
                      <div className="card">
                        <div className="card-body">
                          {/* Add Contact Button */}
                          <div className="form-row justify-content-center">
                            <div className="col-sm-6 col-lg-4 col-12">
                              <button
                                type="button"
                                className="btn btn-round btn-block btn-info form-button"
                                onClick={() => setShowContactForm(!showContactForm)}
                              >
                                Agregar contacto
                              </button>
                            </div>
                          </div>

                          {/* Contact Form */}
                          {showContactForm && (
                            <div className="contact-form-section mt-3 p-3 border rounded">
                              <div className="row">
                                <div className="col-md-6">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nombre"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Teléfono"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="row mt-2">
                                <div className="col text-right">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-secondary mr-2"
                                    onClick={() => setShowContactForm(false)}
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={handleAddContact}
                                  >
                                    Agregar
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          <hr />

                          {/* Contacts List */}
                          <div className="form-row justify-content-center">
                            <h3 className="text-center">Lista de contactos</h3>
                          </div>

                          <div className="table-responsive">
                            <table className="table table-striped contacts-table" id="contacts-table">
                              <thead>
                                <tr>
                                  <th>Nombre</th>
                                  <th>Teléfono</th>
                                  <th className="text-center">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {contacts.length === 0 ? (
                                  <tr>
                                    <td colSpan="3" className="text-center py-4">
                                      <span className="text-muted">No hay entradas</span>
                                    </td>
                                  </tr>
                                ) : (
                                  contacts.map((contact) => (
                                    <tr key={contact.id}>
                                      <td>{contact.name}</td>
                                      <td>{contact.phone}</td>
                                      <td className="text-center">
                                        <button
                                          type="button"
                                          className="btn btn-link btn-sm text-danger"
                                          onClick={() => handleDeleteContact(contact.id)}
                                          title="Eliminar contacto"
                                        >
                                          <i className="nc-icon nc-simple-remove"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-zone margin-left-right-auto mt-4">
            <div className="row">
              <div className="col-md-4 offset-md-4">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-round btn-block"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-round btn-block btn-info form-button"
                    disabled={loading}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditZone
