/**
 * Card Component
 * Wrapper for Material-UI Card with consistent styling
 */

import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
} from '@mui/material';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
  sx?: Record<string, unknown>;
}

const Card: React.FC<CardProps> = React.memo(({
  title,
  subtitle,
  actions,
  children,
  noPadding = false,
  sx,
}) => {
  return (
    <MuiCard
      sx={{
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: 2,
        ...sx,
      }}
    >
      {(title || subtitle) && (
        <CardHeader
          title={
            title && (
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )
          }
          subheader={subtitle}
          sx={{
            borderBottom: '1px solid #f0f0f0',
          }}
        />
      )}

      <CardContent sx={{ p: noPadding ? 0 : 3 }}>
        {children}
      </CardContent>

      {actions && (
        <CardActions sx={{ borderTop: '1px solid #f0f0f0', p: 2 }}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
});

Card.displayName = 'Card';

export default Card;
