import type { TenantConfig } from '../../tenant.types'

const config: TenantConfig = {
  tenantCode: 'lottobook',
  systemName: 'Lottobook',
  versionLabel: 'Lottobook Version 777',
  // Per-tenant copy for the login screen — La Central will override these
  // without needing its own Login.tsx component.
  login: {
    logoAlt: 'Lottobook',
  },
  // Feature flags. Default ON for everything Lottobook currently has.
  // La Central's config can mirror or differ.
  features: {
    externalTenantsAdmin: true,
  },
}

export default config
