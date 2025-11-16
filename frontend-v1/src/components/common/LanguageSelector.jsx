import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'

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

  return (
    <div className="relative group">
      <button 
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors relative"
        title="Change language / Cambiar idioma / Changer la langue / Chanje lang"
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Globe className="w-3 h-3" style={{ color: (isHovered || isActive || open) ? '#4dd4d4' : '#66615b' }} />
        <span className="text-sm font-medium uppercase" style={{ color: (isHovered || isActive || open) ? '#4dd4d4' : '#66615b' }}>
          {i18n.language}
        </span>
        <span className="font-bold" style={{ fontSize: '8px', position: 'absolute', top: '50%', right: '-1px', transform: 'translateY(-50%)', color: (isHovered || isActive || open) ? '#4dd4d4' : '#66615b' }}>▼</span>
      </button>
      
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
    </div>
  )
}

