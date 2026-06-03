import { createTheme } from '@mui/material/styles'
import { theme as lottobookTheme } from '../../theme'

// ────────────────────────────────────────────────────────────────────────
// La Central — palette derived from the logo (navy shield + red stripes
// + white). Intentionally muted: a deep navy primary and a brick-toned
// red secondary, not saturated brand reds.
//
// To FALL BACK to Lottobook's exact look:
//   export const tenantTheme = lottobookTheme
//   export default tenantTheme
// ────────────────────────────────────────────────────────────────────────

const LACENTRAL_PRIMARY = '#2C3E70'   // deep navy from the logo shield
const LACENTRAL_PRIMARY_LT = '#4A5D94'
const LACENTRAL_PRIMARY_DK = '#1E2C4D'

const LACENTRAL_SECONDARY = '#B83341' // muted brick-red from the stripes
const LACENTRAL_SECONDARY_LT = '#D45867'
const LACENTRAL_SECONDARY_DK = '#8E2531'

// Re-use the entire Lottobook MUI theme as the base — typography, button
// shapes, drawer styles, etc. all stay consistent — then override only the
// palette and the component bits that hard-code primary colors.
export const tenantTheme = createTheme({
  ...lottobookTheme,
  palette: {
    ...lottobookTheme.palette,
    primary: {
      main: LACENTRAL_PRIMARY,
      light: LACENTRAL_PRIMARY_LT,
      dark: LACENTRAL_PRIMARY_DK,
      contrastText: '#ffffff',
    },
    secondary: {
      main: LACENTRAL_SECONDARY,
      light: LACENTRAL_SECONDARY_LT,
      dark: LACENTRAL_SECONDARY_DK,
      contrastText: '#ffffff',
    },
  },
  components: {
    ...lottobookTheme.components,
    MuiButton: {
      ...lottobookTheme.components?.MuiButton,
      styleOverrides: {
        ...lottobookTheme.components?.MuiButton?.styleOverrides,
        // Lottobook uses an indigo→purple gradient on contained primary; swap
        // to navy→deeper-navy for a calmer, brand-consistent look.
        containedPrimary: {
          background: `linear-gradient(135deg, ${LACENTRAL_PRIMARY} 0%, ${LACENTRAL_PRIMARY_DK} 100%)`,
          backgroundSize: '200% 200%',
          '&:hover': {
            background: `linear-gradient(135deg, ${LACENTRAL_PRIMARY_DK} 0%, #15203A 100%)`,
            backgroundPosition: 'right center',
          },
        },
      },
    },
    MuiAppBar: {
      ...lottobookTheme.components?.MuiAppBar,
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, rgba(44, 62, 112, 0.15) 0%, rgba(184, 51, 65, 0.10) 100%)`,
          backdropFilter: 'blur(20px) saturate(180%)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          color: '#1e293b',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        },
      },
    },
  },
})

export default tenantTheme
