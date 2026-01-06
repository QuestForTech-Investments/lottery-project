import { memo, type FC } from 'react';
import { Typography, type TypographyProps } from '@mui/material';
import { formatCurrency } from '../../utils/formatCurrency';
import { colors } from '../../constants';

/**
 * Props for CurrencyDisplay component
 */
export interface CurrencyDisplayProps {
  /** Amount to display */
  amount: number;
  /** Show + or - sign */
  showSign?: boolean;
  /** Color based on positive/negative value */
  colorize?: boolean;
  /** Typography variant */
  variant?: TypographyProps['variant'];
  /** Additional typography props */
  typographyProps?: Omit<TypographyProps, 'variant'>;
  /** Custom positive color */
  positiveColor?: string;
  /** Custom negative color */
  negativeColor?: string;
}

/**
 * Display formatted currency with optional coloring
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CurrencyDisplay amount={1234.56} />
 *
 * // With sign and colors
 * <CurrencyDisplay amount={-500} showSign colorize />
 *
 * // Custom variant
 * <CurrencyDisplay amount={1000} variant="h6" />
 * ```
 */
export const CurrencyDisplay: FC<CurrencyDisplayProps> = memo(({
  amount,
  showSign = false,
  colorize = false,
  variant = 'body1',
  typographyProps,
  positiveColor = colors.status.success,
  negativeColor = colors.status.error,
}) => {
  const formattedAmount = formatCurrency(Math.abs(amount));
  const isNegative = amount < 0;
  const isPositive = amount > 0;

  let displayValue = formattedAmount;
  if (showSign) {
    if (isPositive) displayValue = `+${formattedAmount}`;
    if (isNegative) displayValue = `-${formattedAmount}`;
  } else if (isNegative) {
    displayValue = `-${formattedAmount}`;
  }

  let color: string | undefined;
  if (colorize) {
    if (isPositive) color = positiveColor;
    if (isNegative) color = negativeColor;
  }

  return (
    <Typography
      variant={variant}
      component="span"
      sx={{ color, ...typographyProps?.sx }}
      {...typographyProps}
    >
      {displayValue}
    </Typography>
  );
});

CurrencyDisplay.displayName = 'CurrencyDisplay';

export default CurrencyDisplay;
