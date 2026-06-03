import type { TenantConfig } from '../../tenant.types'

const config: TenantConfig = {
  tenantCode: 'lacentral',
  systemName: 'La Central',
  documentTitle: 'La Central - Lottery System',
  versionLabel: 'La Central',
  versionSubLabel: 'Lottery System',
  versionLink: 'https://lacentralrd.com',
  defaultLanguage: 'en',
  login: {
    logoAlt: 'La Central',
    // Bare layout: video shows through; no card chrome, no welcome heading.
    bareLayout: true,
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
