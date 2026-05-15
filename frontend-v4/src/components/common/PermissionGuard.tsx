import { ReactNode } from 'react'
import useUserPermissions from '@/hooks/useUserPermissions'
import AccessDenied from './AccessDenied'

interface PermissionGuardProps {
  /**
   * Permission requirement. Either a single code or an array of codes (any-of).
   */
  permission: string | string[]
  children: ReactNode
  /** Optional override of the "no access" message. */
  message?: string
}

/**
 * Wraps a route's children and renders <AccessDenied/> if the current user
 * doesn't hold the required permission. Returns null while permissions are
 * loading to avoid a flash of the "no access" panel.
 */
const PermissionGuard = ({ permission, children, message }: PermissionGuardProps) => {
  const { hasPermission, loading } = useUserPermissions()

  if (loading) return null

  const allowed = Array.isArray(permission)
    ? permission.some(p => hasPermission(p))
    : hasPermission(permission)

  if (!allowed) {
    return <AccessDenied message={message} />
  }

  return <>{children}</>
}

export default PermissionGuard
