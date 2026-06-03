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
  /**
   * When true, the login screen drops the card chrome (background image,
   * border, shadow) and the welcome heading. Just the logo + inputs sit
   * over the page background — useful for tenants whose background is the
   * focal point (e.g. La Central's video).
   */
  bareLayout?: boolean
}

export interface TenantSidebarConfig {
  /** Big title in the sidebar header (defaults to systemName uppercased). */
  title?: string
  /** Small subtitle under the title. */
  subtitle: string
}

/** Source descriptor for the full-page login background — image or looping video. */
export type TenantLoginBackground =
  | { type: 'image', src: string }
  | { type: 'video', src: string, poster?: string }

export interface TenantConfig {
  /** Stable, lowercase code used to derive build dirs, DB names, etc. */
  tenantCode: string
  /** Human-readable name shown in headers, titles, copy. */
  systemName: string
  /**
   * Browser tab title. When unset, falls back to <see cref="systemName"/>.
   * Use this when the full product name (e.g. "X Lottery System") reads
   * better in the tab than the short brand name used elsewhere in the UI.
   */
  documentTitle?: string
  /** Primary line rendered at the bottom-right of the login screen. */
  versionLabel: string
  /**
   * Optional second line under <see cref="versionLabel"/>, styled smaller
   * (used as a tagline). When unset, only the primary line shows.
   */
  versionSubLabel?: string
  /**
   * Optional external URL. When set, the version block becomes a clickable
   * chip (matching the Printer/Android buttons) that opens this URL in a
   * new tab. When unset, it stays as plain text.
   */
  versionLink?: string
  /**
   * Default UI language for first-time visitors (the login screen and
   * anyone without a saved preference in localStorage). Falls back to
   * 'es' if unset. The user can always switch and the choice is cached.
   */
  defaultLanguage?: 'es' | 'en' | 'fr' | 'ht'
  login: TenantLoginConfig
  sidebar: TenantSidebarConfig
  features: TenantFeatureFlags
}
