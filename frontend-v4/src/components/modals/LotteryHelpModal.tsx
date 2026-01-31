import React, { useState, type SyntheticEvent } from 'react'
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

export default function LotteryHelpModal({ isOpen, onClose }: LotteryHelpModalProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<number>(0)

  const shortcuts: Shortcut[] = [
    { key: '↑', function: '(Arriba) Limpiar campos de jugada y Monto.' },
    { key: 'L', function: '(Ele) Cancelar el ticket y limpiar la pantalla.' },
    { key: '/', function: '(Slash) Cambiar de lotería.' },
    { key: '*', function: '(Asterisco) Imprimir el ticket.' },
    { key: 'c', function: 'Duplicar ticket.' },
    { key: 'P', function: 'Marcar ticket como pagado.' },
    { key: 'q', function: 'Sólo para Cash 3 y Play 4. Digitar la jugada seguida de q (Ej.: 123q) para generar todas la combinaciones del número.' },
    { key: '.', function: '(Punto) sólo para Directo, Palé y Tripleta. Digitar la jugada seguida de un punto (Ej.: 1234.) para generar todas las combinaciones del número.' },
    { key: 'd', function: 'Sólo para Directo. Ingresar una jugada inicial de dos dígitos iguales seguidos de la letra d y luego dos dígitos iguales para la jugada final (Ej.: 33d66) para generar una secuencia de pares iguales desde la jugada inicial has la jugada final.' },
    { key: '-10', function: 'Sólo Para Cash 3. Ingresar una jugada de tres dígitos seguidos de -10 (Ej.: 123-10) para generar todas las combinaciones que contienen los últimos dos dígitos aumentando en 100 cada valor.' },
    { key: '+xyz', function: 'Sólo Para Cash 3 Straight. Ingresar una jugada de tres dígitos seguido del signo + y otra jugada de tres dígitos (Ej.: 345+348) para generar una secuencia de straight: 345, 346, 347.' }
  ]

  const gameInstructions: GameInstruction[] = [
    {
      title: 'Para jugar Directo',
      steps: [
        'Ingresar en la jugada un número de dos dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pale',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Tripleta',
      steps: [
        'Ingresar en la jugada un número de seis dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Straight',
      steps: [
        'Ingresar en la jugada un número de tres dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Box',
      steps: [
        'Ingresar en la jugada un número de tres dígitos seguido del signo + (Ej.: 123+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Play4 Straight',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos seguido del signo - (Ej.: 1234-) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Play4 Box',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos seguido del signo + (Ej.: 1234+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Super Pale',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Bolita',
      steps: [
        'Ingresar en la jugada un número de dos dígitos seguido del signo de +, seguido del rango (1 o 2) (Ej.: 12+1) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Singulación',
      steps: [
        'Ingresar en la jugada un número de un dígitos seguido del signo de -, seguido del rango (1, 2 o 3) (Ex.: 1-2) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick5 Straight',
      steps: [
        'Ingresar en la jugada un número de cinco dígitos seguido del signo - (Ej.: 12345-) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick5 Box',
      steps: [
        'Ingresar en la jugada un número de cinco dígitos seguido del signo + (Ej.: 12345+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick Two',
      steps: [
        'Ingresar en la jugada un número de dos dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Front Straight',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra F y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Front Box',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra F seguido del signo + (Ej.: 123F+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Back Straight',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra B y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Cash3 Back Box',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra B seguido del signo + (Ej.: 123B+) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick Two Front',
      steps: [
        'Ingresar en la jugada un número de dos dígitos, la letra F y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick Two Back',
      steps: [
        'Ingresar en la jugada un número de dos dígitos, la letra B y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Pick Two Middle',
      steps: [
        'Ingresar en la jugada un número de dos dígitos seguido del signo de - y el rango (3) (Ej.: 10-3) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    },
    {
      title: 'Para jugar Panamá',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos seguido del signo - (Ej.: 1234-) y presionar enter.',
        'Ingresar el monto y presionar enter.'
      ]
    }
  ];

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
          Ayuda
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
          <Tab label="Teclas" />
          <Tab label="¿Cómo jugar?" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, height: 500, overflowY: 'auto' }}>
        {activeTab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Tecla</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Función</TableCell>
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
                  {game.steps.map((step, stepIndex) => (
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
          Cerrar
        </Button>
      </Box>
    </Dialog>
  )
}
