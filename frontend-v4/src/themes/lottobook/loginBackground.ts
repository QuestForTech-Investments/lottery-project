import src from '@/assets/images/login-background.jpg'
import type { TenantLoginBackground } from '../../tenant.types'

// Lottobook keeps its current static background. The image lives under
// src/assets/images/ (shared with legacy code) — re-exporting here lets new
// tenants override without touching shared paths.
const loginBackground: TenantLoginBackground = { type: 'image', src }
export default loginBackground
