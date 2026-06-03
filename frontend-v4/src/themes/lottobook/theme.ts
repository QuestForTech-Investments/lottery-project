import { theme } from '../../theme'

// Lottobook reuses the base MUI theme defined in src/theme/index.ts.
// Per-tenant overrides (primary color, button gradients, etc.) can be
// applied here by merging into the base theme — for V1 Lottobook keeps
// the exact look it has today, so we re-export as-is.
export const tenantTheme = theme
export default tenantTheme
