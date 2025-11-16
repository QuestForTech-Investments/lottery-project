import React, { useState, useEffect } from 'react'
import { roleService } from '@/services'

/**
 * Role Selector Component
 * Dropdown to select a role with permission preview
 */
const RoleSelector = ({ value, onChange, onRoleDetailsChange }) => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const response = await roleService.getActiveRoles()
      
      if (response.success && response.data) {
        setRoles(response.data)
      }
    } catch (err) {
      console.error('Error loading roles:', err)
      setError('Error al cargar los roles')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = async (e) => {
    const roleId = parseInt(e.target.value)
    onChange(roleId)

    // Load role details with permissions if callback provided
    if (roleId && onRoleDetailsChange) {
      try {
        const roleDetails = await roleService.getRoleById(roleId)
        onRoleDetailsChange(roleDetails.data)
      } catch (err) {
        console.error('Error loading role details:', err)
      }
    } else if (!roleId && onRoleDetailsChange) {
      onRoleDetailsChange(null)
    }
  }

  if (loading) {
    return (
      <select className="form-control" disabled>
        <option>Cargando roles...</option>
      </select>
    )
  }

  if (error) {
    return (
      <select className="form-control" disabled>
        <option>{error}</option>
      </select>
    )
  }

  return (
    <select
      className="form-control"
      value={value || ''}
      onChange={handleChange}
      required
    >
      <option value="">Seleccione un rol</option>
      {roles.map(role => (
        <option key={role.roleId} value={role.roleId}>
          {role.name || role.roleName}
        </option>
      ))}
    </select>
  )
}

export default RoleSelector

