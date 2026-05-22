import { useState, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, MenuItem, ListItemIcon, ListItemText, Box, IconButton } from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'
import { updateMyPreferredLanguage } from '@services/userService'
import { isAuthenticated } from '@services/authService'
import { FlagES, FlagUS, FlagFR, FlagHT } from './LanguageFlags'

const languages = [
  { code: 'es', name: 'language.spanish', Flag: FlagES },
  { code: 'en', name: 'language.english', Flag: FlagUS },
  { code: 'fr', name: 'language.french', Flag: FlagFR },
  { code: 'ht', name: 'language.creole', Flag: FlagHT },
]

interface LanguageSelectorProps {
  isHovered?: boolean
  isActive?: boolean
  onMouseEnter?: (event: MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLButtonElement>) => void
  onActiveChange?: (active: boolean) => void
}

export default function LanguageSelector({
  isHovered = false,
  isActive = false,
  onMouseEnter,
  onMouseLeave,
  onActiveChange,
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    onActiveChange?.(true)
  }

  const handleClose = () => {
    setAnchorEl(null)
    onActiveChange?.(false)
  }

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    handleClose()
    // Best-effort persistence — if the user is logged in, sync their preference
    // to the server so it survives across devices. Swallow failures: the local
    // i18n change still works via localStorage.
    if (isAuthenticated()) {
      const lang = languageCode as 'es' | 'en' | 'fr' | 'ht'
      updateMyPreferredLanguage(lang).catch(() => { /* non-fatal */ })
    }
  }

  const activeColor = '#4dd4d4'
  const defaultColor = '#66615b'
  const isActiveState = isHovered || isActive || open
  const currentLang = languages.find(l => l.code === i18n.language) ?? languages[0]

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
          px: 0.75,
          py: 0.5,
          borderRadius: 1,
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}>
          <currentLang.Flag />
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: isActiveState ? activeColor : defaultColor
          }}
        >
          {currentLang.code}
        </Box>
        <ArrowDropDown
          sx={{
            fontSize: 18,
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
            <ListItemIcon sx={{ minWidth: 32, display: 'flex', alignItems: 'center' }}>
              <lang.Flag />
            </ListItemIcon>
            <ListItemText>{t(lang.name)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
