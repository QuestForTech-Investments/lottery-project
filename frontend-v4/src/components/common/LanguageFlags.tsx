/**
 * Inline SVG flag components.
 *
 * Windows' Segoe UI Emoji deliberately omits regional-indicator flags, so
 * the 🇪🇸 / 🇺🇸 / 🇫🇷 / 🇭🇹 code points render as the bare letters
 * "ES"/"US"/"FR"/"HT" in Edge. Using SVG keeps the visual identical across
 * every browser and avoids a CDN/font dependency.
 *
 * Default visual size is 22×16 (3:2 ratio, matching the chips/menus we
 * render in); pass `size` to override.
 */
import type { FC } from 'react'

interface FlagProps {
  size?: number
}

const dims = (size: number) => ({ width: Math.round(size * 1.375), height: size })

export const FlagES: FC<FlagProps> = ({ size = 16 }) => (
  <svg {...dims(size)} viewBox="0 0 9 6" aria-hidden="true">
    <rect width="9" height="6" fill="#aa151b" />
    <rect y="1.5" width="9" height="3" fill="#f1bf00" />
  </svg>
)

export const FlagUS: FC<FlagProps> = ({ size = 16 }) => (
  <svg {...dims(size)} viewBox="0 0 26 14" aria-hidden="true">
    <rect width="26" height="14" fill="#b22234" />
    {[1, 3, 5, 7, 9, 11].map((y) => (
      <rect key={y} y={y} width="26" height="1" fill="#fff" />
    ))}
    <rect width="11" height="7" fill="#3c3b6e" />
  </svg>
)

export const FlagFR: FC<FlagProps> = ({ size = 16 }) => (
  <svg {...dims(size)} viewBox="0 0 9 6" aria-hidden="true">
    <rect width="3" height="6" fill="#0055a4" />
    <rect x="3" width="3" height="6" fill="#fff" />
    <rect x="6" width="3" height="6" fill="#ef4135" />
  </svg>
)

export const FlagHT: FC<FlagProps> = ({ size = 16 }) => (
  <svg {...dims(size)} viewBox="0 0 9 6" aria-hidden="true">
    <rect width="9" height="3" fill="#00209f" />
    <rect y="3" width="9" height="3" fill="#d21034" />
  </svg>
)
