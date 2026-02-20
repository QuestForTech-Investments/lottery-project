/**
 * useUserPermissions Hook
 *
 * Fetches the current user's permissions and exposes a
 * hasPermission(code) helper for permission-gated UI.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@services/api';
import { getCurrentUser } from '@services/authService';

interface PermissionRecord {
  permissionCode?: string;
  PermissionCode?: string;
  code?: string;
}

export const useUserPermissions = () => {
  const [permissionCodes, setPermissionCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const userId = useMemo(() => getCurrentUser()?.id, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        const response = await api.get(`/users/${userId}/permissions`) as PermissionRecord[];
        const codes = (response || []).map(
          (p) => p.permissionCode || p.PermissionCode || p.code || ''
        ).filter(Boolean);
        setPermissionCodes(new Set(codes));
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        setPermissionCodes(new Set());
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  const hasPermission = useCallback(
    (code: string): boolean => permissionCodes.has(code),
    [permissionCodes]
  );

  return { hasPermission, loading, permissionCodes };
};

export default useUserPermissions;
