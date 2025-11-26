/**
 * Button Component
 * Styled button with lottery system design
 */

import React from 'react';
import { Button as MuiButton } from '@mui/material';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  fullWidth?: boolean;
  type?: 'submit' | 'button' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  sx?: Record<string, unknown>;
  startIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = React.memo(({
  variant = 'primary',
  fullWidth = false,
  type,
  disabled,
  onClick,
  children,
  sx,
  startIcon,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bgcolor: '#51cbce',
          '&:hover': { bgcolor: '#45b8bb' },
          color: 'white',
        };
      case 'secondary':
        return {
          bgcolor: '#f5f5f5',
          '&:hover': { bgcolor: '#e0e0e0' },
          color: '#2c2c2c',
        };
      case 'success':
        return {
          bgcolor: '#28a745',
          '&:hover': { bgcolor: '#218838' },
          color: 'white',
        };
      case 'danger':
        return {
          bgcolor: '#dc3545',
          '&:hover': { bgcolor: '#c82333' },
          color: 'white',
        };
      default:
        return {};
    }
  };

  return (
    <MuiButton
      variant="contained"
      fullWidth={fullWidth}
      type={type}
      disabled={disabled}
      onClick={onClick}
      startIcon={startIcon}
      sx={{
        ...getVariantStyles(),
        textTransform: 'none',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 500,
        ...sx,
      }}
    >
      {children}
    </MuiButton>
  );
});

Button.displayName = 'Button';

export default Button;
