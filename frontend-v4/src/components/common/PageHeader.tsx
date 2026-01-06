import { memo, type FC, type ReactNode } from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';

/**
 * Props for PageHeader component
 */
export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Actions to display on the right */
  actions?: ReactNode;
  /** Center the title */
  centered?: boolean;
  /** Custom styles */
  sx?: SxProps<Theme>;
}

/**
 * Consistent page header component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PageHeader title="Monitor de tickets" />
 *
 * // With subtitle
 * <PageHeader
 *   title="Usuarios"
 *   subtitle="Administre los usuarios del sistema"
 * />
 *
 * // With actions
 * <PageHeader
 *   title="Bancas"
 *   actions={
 *     <Button variant="contained">Crear nueva</Button>
 *   }
 * />
 *
 * // Centered
 * <PageHeader title="Dashboard" centered />
 * ```
 */
export const PageHeader: FC<PageHeaderProps> = memo(({
  title,
  subtitle,
  actions,
  centered = false,
  sx,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: centered ? 'column' : 'row',
        alignItems: centered ? 'center' : 'flex-start',
        justifyContent: centered ? 'center' : 'space-between',
        mb: 4,
        ...sx,
      }}
    >
      <Box sx={{ textAlign: centered ? 'center' : 'left' }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            color: '#1976d2',
            fontWeight: 400,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && !centered && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {actions}
        </Box>
      )}
      {actions && centered && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;
