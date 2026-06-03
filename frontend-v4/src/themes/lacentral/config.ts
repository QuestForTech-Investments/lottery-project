import type { TenantConfig } from '../../tenant.types'

const config: TenantConfig = {
  tenantCode: 'lacentral',
  systemName: 'La Central',
  versionLabel: 'La Central v1.0',
  login: {
    logoAlt: 'La Central',
  },
  sidebar: {
    title: 'LA CENTRAL',
    subtitle: 'LOTTERY SYSTEM',
  },
  features: {
    // La Central is the V1 hub that pairs with Lottobook — both visibility
    // into partner sales and bidirectional result sync are on by default.
    externalTenantsAdmin: true,
  },
}

export default config
