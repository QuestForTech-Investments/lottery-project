import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, MenuItem, ListItemIcon, ListItemText, Box, IconButton } from '@mui/material'
import { Language as LanguageIcon, ArrowDropDown } from '@mui/icons-material'

const languages = [
  { code: 'es', name: 'language.spanish', flag: '🇪🇸' },
  { code: 'en', name: 'language.english', flag: '🇬🇧' },
  { code: 'fr', name: 'language.french', flag: '🇫🇷' },
  { code: 'ht', name: 'language.creole', flag: '🇭🇹' }
]

export default function LanguageSelector({ isHovered, isActive, onMouseEnter, onMouseLeave, onActiveChange }) {
  const { i18n, t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
    onActiveChange(true)
  }

  const handleClose = () => {
    setAnchorEl(null)
    onActiveChange(false)
  }

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode)
    handleClose()
  }

  const activeColor = '#4dd4d4'
  const defaultColor = '#66615b'
  const isActiveState = isHovered || isActive || open

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        title="Change language / Cambiar idioma / Changer la langue / Chanje lang"
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <LanguageIcon sx={{ fontSize: 16, color: isActiveState ? activeColor : defaultColor }} />
        <Box
          component="span"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            color: isActiveState ? activeColor : defaultColor
          }}
        >
          {i18n.language}
        </Box>
        <ArrowDropDown
          sx={{
            fontSize: 16,
            color: isActiveState ? activeColor : defaultColor
          }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            sx={{
              backgroundColor: i18n.language === lang.code ? 'rgba(77, 212, 212, 0.1)' : 'transparent',
              color: i18n.language === lang.code ? '#4dd4d4' : '#66615b',
              '&:hover': {
                backgroundColor: 'rgba(77, 212, 212, 0.1)',
                color: '#4dd4d4'
              }
            }}
          >
            <ListItemIcon>
              <span style={{ fontSize: '18px' }}>{lang.flag}</span>
            </ListItemIcon>
            <ListItemText>{t(lang.name)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

