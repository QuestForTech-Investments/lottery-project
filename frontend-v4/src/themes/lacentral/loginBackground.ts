import src from './assets/login-background.mp4'
import type { TenantLoginBackground } from '../../tenant.types'

// La Central uses a looping video of lottery balls. The Login component
// renders a <video autoPlay muted loop playsInline> when type === 'video'
// and falls back to the gradient overlay as before.
const loginBackground: TenantLoginBackground = { type: 'video', src }
export default loginBackground
