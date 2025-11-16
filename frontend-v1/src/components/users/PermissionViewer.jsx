import React from 'react'

/**
 * Permission Viewer Component
 * Displays permissions associated with a selected role
 */
const PermissionViewer = ({ roleDetails }) => {
  if (!roleDetails) {
    return (
      <div className="alert alert-info text-center">
        <i className="nc-icon nc-alert-circle-i mr-2"></i>
        Seleccione un rol para ver los permisos asociados
      </div>
    )
  }

  // Group permissions by category if available
  const groupedPermissions = roleDetails.permissions?.reduce((acc, perm) => {
    const category = perm.category || 'Otros'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(perm)
    return acc
  }, {}) || {}

  const totalPermissions = roleDetails.permissions?.length || 0

  return (
    <div className="permission-viewer">
      <div className="card" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="nc-icon nc-badge mr-2"></i>
            {roleDetails.name || roleDetails.roleName}
          </h5>
          
          {roleDetails.description && (
            <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
              {roleDetails.description}
            </p>
          )}

          <div className="mb-3">
            <span className="badge badge-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              {totalPermissions} {totalPermissions === 1 ? 'Permiso' : 'Permisos'}
            </span>
          </div>

          {totalPermissions > 0 ? (
            <div className="permissions-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {Object.keys(groupedPermissions).map((category, idx) => (
                <div key={idx} className="mb-3">
                  <h6 className="text-uppercase" style={{ fontSize: '11px', fontWeight: '600', color: '#666' }}>
                    {category}
                  </h6>
                  <div className="row">
                    {groupedPermissions[category].map((permission, permIdx) => (
                      <div key={permIdx} className="col-md-6 mb-2">
                        <div 
                          className="permission-item" 
                          style={{ 
                            fontSize: '12px',
                            padding: '4px 8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <i className="nc-icon nc-check-2 mr-1" style={{ color: '#51cbce' }}></i>
                          {permission.name || permission.permissionName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-warning mb-0">
              <i className="nc-icon nc-simple-remove mr-2"></i>
              Este rol no tiene permisos asignados
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PermissionViewer

