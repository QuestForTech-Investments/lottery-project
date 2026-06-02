// Shape every tenant's config must implement. New flags/strings are added
// here so that TypeScript flags any tenant whose config.ts is out of date.

export interface TenantFeatureFlags {
  /**
   * Whether this tenant exposes the "Sistemas Externos" admin page where the
   * superadmin manages partner tenants (for cross-tenant sales view and
   * bidirectional result sync). All V1 tenants set this to true so they can
   * pair with La Central.
   */
  externalTenantsAdmin: boolean
}

export interface TenantLoginConfig {
  /** alt text for the logo on the login screen */
  logoAlt: string
}

export interface TenantConfig {
  /** Stable, lowercase code used to derive build dirs, DB names, etc. */
  tenantCode: string
  /** Human-readable name shown in headers, titles, copy. */
  systemName: string
  /** String rendered at the bottom of the login screen. */
  versionLabel: string
  login: TenantLoginConfig
  features: TenantFeatureFlags
}
