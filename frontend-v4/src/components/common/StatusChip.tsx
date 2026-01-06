import { memo, type FC } from 'react';
import { Chip, type ChipProps } from '@mui/material';

/**
 * Status to color mapping
 */
export type StatusColorMap = Record<string, ChipProps['color']>;

/**
 * Default status color mapping for ticket states
 */
export const DEFAULT_STATUS_COLORS: StatusColorMap = {
  // Spanish labels
  'Ganador': 'success',
  'Cancelado': 'error',
  'Pendiente': 'warning',
  'Perdedor': 'default',
  'Pagado': 'info',
  // English labels
  'winner': 'success',
  'cancelled': 'error',
  'pending': 'warning',
  'loser': 'default',
  'paid': 'info',
  // Generic
  'active': 'success',
  'inactive': 'default',
  'error': 'error',
  'success': 'success',
  'warning': 'warning',
  'info': 'info',
};

/**
 * Props for StatusChip component
 */
export interface StatusChipProps {
  /** Status value to display */
  status: string;
  /** Custom color mapping (merged with defaults) */
  colorMap?: StatusColorMap;
  /** Chip size */
  size?: ChipProps['size'];
  /** Chip variant */
  variant?: ChipProps['variant'];
  /** Additional chip props */
  chipProps?: Omit<ChipProps, 'label' | 'color' | 'size' | 'variant'>;
}

/**
 * Display a status chip with automatic color based on status value
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StatusChip status="Ganador" />
 *
 * // Custom color map
 * <StatusChip
 *   status="Activo"
 *   colorMap={{ 'Activo': 'success', 'Inactivo': 'default' }}
 * />
 *
 * // Different size
 * <StatusChip status="Pendiente" size="small" />
 * ```
 */
export const StatusChip: FC<StatusChipProps> = memo(({
  status,
  colorMap,
  size = 'small',
  variant = 'filled',
  chipProps,
}) => {
  const mergedColorMap = { ...DEFAULT_STATUS_COLORS, ...colorMap };
  const color = mergedColorMap[status] || 'default';

  return (
    <Chip
      label={status}
      color={color}
      size={size}
      variant={variant}
      {...chipProps}
    />
  );
});

StatusChip.displayName = 'StatusChip';

export default StatusChip;
