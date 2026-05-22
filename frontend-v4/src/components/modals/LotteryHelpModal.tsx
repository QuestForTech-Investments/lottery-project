import React, { useState, useMemo, type SyntheticEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

interface LotteryHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  key: string;
  function: string;
}

interface GameInstruction {
  title: string;
  steps: string[];
}

const SHORTCUT_KEYS = [
  'arrowUp', 'l', 'slash', 'asterisk', 'c', 'p', 'q', 'dot', 'd', 'minus10', 'plusXyz'
] as const;

const GAME_KEYS = [
  'directo', 'pale', 'tripleta', 'cash3Straight', 'cash3Box',
  'play4Straight', 'play4Box', 'superPale', 'bolita', 'singulacion',
  'pick5Straight', 'pick5Box', 'pickTwo', 'cash3FrontStraight', 'cash3FrontBox',
  'cash3BackStraight', 'cash3BackBox', 'pickTwoFront', 'pickTwoBack',
  'pickTwoMiddle', 'panama'
] as const;

export default function LotteryHelpModal({ isOpen, onClose }: LotteryHelpModalProps): React.ReactElement {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<number>(0)

  const shortcuts: Shortcut[] = useMemo(() => SHORTCUT_KEYS.map((k) => ({
    key: t(`modals.lotteryHelp.shortcuts.${k}.key`),
    function: t(`modals.lotteryHelp.shortcuts.${k}.function`)
  })), [t]);

  const gameInstructions: GameInstruction[] = useMemo(() => GAME_KEYS.map((k) => ({
    title: t(`modals.lotteryHelp.games.${k}.title`),
    steps: t(`modals.lotteryHelp.games.${k}.steps`, { returnObjects: true }) as unknown as string[]
  })), [t]);

  const primaryColor = '#8b5cf6'

  const handleTabChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue)
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {t('modals.lotteryHelp.title')}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              color: primaryColor,
              '&.Mui-selected': {
                color: '#000'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: primaryColor
            }
          }}
        >
          <Tab label={t('modals.lotteryHelp.tabs.keys')} />
          <Tab label={t('modals.lotteryHelp.tabs.howToPlay')} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, height: 500, overflowY: 'auto' }}>
        {activeTab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{t('modals.lotteryHelp.columnKey')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{t('modals.lotteryHelp.columnFunction')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shortcuts.map((shortcut, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { bgcolor: 'grey.50' },
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: primaryColor
                      }}
                    >
                      {shortcut.key}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {shortcut.function}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {gameInstructions.map((game, index) => (
              <Box
                key={index}
                sx={{
                  pb: 2,
                  borderBottom: index < gameInstructions.length - 1 ? 1 : 0,
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {game.title}
                </Typography>
                <Box component="ol" sx={{ pl: 2.5, m: 0 }}>
                  {(Array.isArray(game.steps) ? game.steps : []).map((step, stepIndex) => (
                    <Typography
                      key={stepIndex}
                      component="li"
                      variant="body2"
                      sx={{ color: 'text.secondary', mb: 0.5 }}
                    >
                      {step}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <Box sx={{
        bgcolor: 'grey.50',
        px: 3,
        py: 2,
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: primaryColor,
            color: 'white',
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            lineHeight: '1.35em',
            px: 2.75,
            py: 0.625,
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#7c3aed'
            }
          }}
        >
          {t('common.close')}
        </Button>
      </Box>
    </Dialog>
  )
}
