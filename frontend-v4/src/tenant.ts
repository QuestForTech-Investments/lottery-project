// Single entry point for tenant-specific config and theme. The `@tenant`
// alias in vite.config.ts resolves to the folder src/themes/<VITE_TENANT>/,
// so importing from here gives TS autocompletion AND a stable import path
// that doesn't change when we add new tenants.

import config from '@tenant/config'
import theme from '@tenant/theme'

export const tenantConfig = config
export const tenantTheme = theme
export type { TenantConfig, TenantFeatureFlags, TenantLoginConfig } from './tenant.types'
