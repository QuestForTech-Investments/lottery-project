import React, { useState, useEffect } from 'react'
import { permissionService } from '@/services'
import * as logger from '@/utils/logger'

/**
 * Test Component for Permissions API
 * Shows all permissions from API with a button for each one
 */
const TestPermissions = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [permissionCategories, setPermissionCategories] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [apiResponse, setApiResponse] = useState(null)

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      logger.info('TEST_PERMISSIONS', 'Testing API: GET /permissions/categories')
      
      const response = await permissionService.getPermissionCategories()
      
      setApiResponse(response)
      
      logger.success('TEST_PERMISSIONS', 'API Response received', {
        success: response.success,
        categoriesCount: response.data?.length,
        fullResponse: response
      })

      if (response.success && response.data) {
        setPermissionCategories(response.data)
        
        // Count total permissions
        const totalPermissions = response.data.reduce((sum, cat) => 
          sum + (cat.permissions?.length || 0), 0
        )
        
        logger.success('TEST_PERMISSIONS', `✅ Loaded ${totalPermissions} permissions in ${response.data.length} categories`)
      } else {
        const errorMsg = 'API returned success=false or no data'
        setError(errorMsg)
        logger.error('TEST_PERMISSIONS', errorMsg, response)
      }
    } catch (err) {
      const errorMsg = err.message || 'Unknown error'
      setError(errorMsg)
      logger.error('TEST_PERMISSIONS', 'Failed to load permissions', {
        error: errorMsg,
        stack: err.stack,
        response: err.response
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionClick = (permission) => {
    const permissionId = permission.permissionId
    
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId))
      logger.debug('TEST_PERMISSIONS', `Deselected: ${permission.name}`, { permissionId })
    } else {
      setSelectedPermissions(prev => [...prev, permissionId])
      logger.info('TEST_PERMISSIONS', `Selected: ${permission.name}`, { permissionId })
    }
  }

  const getTotalPermissions = () => {
    return permissionCategories.reduce((sum, cat) => 
      sum + (cat.permissions?.length || 0), 0
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '30px', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '10px', color: '#333' }}>
          🧪 Permissions API Test
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Testing: GET /api/permissions/categories
        </p>

        {/* API Status */}
        <div style={{
          padding: '15px',
          backgroundColor: loading ? '#fff3cd' : error ? '#f8d7da' : '#d4edda',
          border: `1px solid ${loading ? '#ffc107' : error ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>
            {loading ? '⏳ Loading...' : error ? '❌ Error' : '✅ Success'}
          </strong>
          {error && <div style={{ marginTop: '10px', color: '#721c24' }}>{error}</div>}
          {!loading && !error && (
            <div style={{ marginTop: '10px' }}>
              <div>Categories: {permissionCategories.length}</div>
              <div>Total Permissions: {getTotalPermissions()}</div>
              <div>Selected: {selectedPermissions.length}</div>
            </div>
          )}
        </div>

        {/* Raw API Response */}
        {apiResponse && (
          <details style={{ marginBottom: '20px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              📄 Raw API Response (click to expand)
            </summary>
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '10px'
            }}>
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </details>
        )}

        {/* Permissions Grid */}
        {!loading && !error && permissionCategories.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
              Permissions by Category (Click to select)
            </h3>

            {permissionCategories.map((category, catIndex) => (
              <div 
                key={catIndex}
                style={{
                  marginBottom: '30px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <h4 style={{ 
                  marginBottom: '15px',
                  color: '#495057',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {category.category}
                  <span style={{ 
                    marginLeft: '10px',
                    fontSize: '14px',
                    color: '#6c757d',
                    fontWeight: 'normal'
                  }}>
                    ({category.permissions?.length || 0} permissions)
                  </span>
                </h4>

                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '10px' 
                }}>
                  {category.permissions && category.permissions.map((permission) => {
                    const isSelected = selectedPermissions.includes(permission.permissionId)
                    
                    return (
                      <button
                        key={permission.permissionId}
                        onClick={() => handlePermissionClick(permission)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '20px',
                          border: isSelected ? '2px solid #51cbce' : '2px solid #51cbce',
                          backgroundColor: isSelected ? '#51cbce' : 'transparent',
                          color: isSelected ? '#fff' : '#666',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textTransform: 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.target.style.backgroundColor = '#51cbce'
                            e.target.style.color = '#fff'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.target.style.backgroundColor = 'transparent'
                            e.target.style.color = '#666'
                          }
                        }}
                      >
                        {permission.name || permission.permissionName}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Selected Permissions Summary */}
            {selectedPermissions.length > 0 && (
              <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#e7f5ff',
                borderRadius: '8px',
                border: '1px solid #339af0'
              }}>
                <h4 style={{ marginBottom: '10px', color: '#1971c2' }}>
                  ✅ Selected Permissions ({selectedPermissions.length})
                </h4>
                <div style={{ fontSize: '14px', color: '#495057' }}>
                  Permission IDs: [{selectedPermissions.join(', ')}]
                </div>
                <button
                  onClick={() => {
                    logger.info('TEST_PERMISSIONS', 'Selected permissions:', {
                      permissionIds: selectedPermissions,
                      count: selectedPermissions.length
                    })
                    alert(`Selected ${selectedPermissions.length} permissions\nIDs: [${selectedPermissions.join(', ')}]`)
                  }}
                  style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    backgroundColor: '#339af0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Show Selected in Console
                </button>
              </div>
            )}
          </div>
        )}

        {/* Retry Button */}
        {error && (
          <button
            onClick={loadPermissions}
            style={{
              padding: '10px 20px',
              backgroundColor: '#51cbce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Retry
          </button>
        )}
      </div>
    </div>
  )
}

export default TestPermissions

