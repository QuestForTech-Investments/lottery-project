import { useState, type SyntheticEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface KeyboardShortcut {
  key: string;
  description: string;
}

interface GameInstruction {
  title: string;
  steps: string[];
}

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  const keyboardShortcuts: KeyboardShortcut[] = [
    { key: '↑', description: '(Arriba) Limpiar campos de jugada y Monto.' },
    { key: 'L', description: '(Ele) Cancelar el ticket y limpiar la pantalla.' },
    { key: '/', description: '(Slash) Cambiar de lotería.' },
    { key: '*', description: '(Asterisco) Imprimir el ticket.' },
    { key: 'c', description: 'Duplicar ticket.' },
    { key: 'P', description: 'Marcar ticket como pagado.' },
    { key: 'q', description: 'Sólo para Cash 3 y Play 4. Digitar la jugada seguida de q (Ej.: 123q) para generar todas la combinaciones del número.' },
    { key: '.', description: '(Punto) sólo para Directo, Palé y Tripleta. Digitar la jugada seguida de un punto (Ej.: 1234.) para generar todas las combinaciones del número.' },
    { key: 'd', description: 'Sólo para Directo. Ingresar una jugada inicial de dos dígitos iguales seguidos de la letra d y luego dos dígitos iguales para la jugada final (Ej.: 33d66) para generar una secuencia de pares iguales desde la jugada inicial has la jugada final.' },
    { key: '-10', description: 'Sólo Para Cash 3. Ingresar una jugada de tres dígitos seguidos de -10 (Ej.: 123-10) para generar todas las combinaciones que contienen los últimos dos dígitos aumentando en 100 cada valor.' },
    { key: '+xyz', description: 'Sólo Para Cash 3 Straight. Ingresar una jugada de tres dígitos seguido del signo + y otra jugada de tres dígitos (Ej.: 345+348) para generar una secuencia de straight: 345, 346, 347.' },
  ];

  const gameInstructions: GameInstruction[] = [
    {
      title: 'Para jugar Directo',
      steps: [
        'Ingresar en la jugada un número de dos dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Pale',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Tripleta',
      steps: [
        'Ingresar en la jugada un número de seis dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Cash3 Straight',
      steps: [
        'Ingresar en la jugada un número de tres dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Cash3 Box',
      steps: [
        'Ingresar en la jugada un número de tres dígitos seguido del signo + (Ej.: 123+) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Play4 Straight',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos seguido del signo - (Ej.: 1234-) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Play4 Box',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos seguido del signo + (Ej.: 1234+) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Super Pale',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Bolita',
      steps: [
        'Ingresar en la jugada un número de dos dígitos seguido del signo de +, seguido del rango (1 o 2) (Ej.: 12+1) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Singulación',
      steps: [
        'Ingresar en la jugada un número de un dígitos seguido del signo de -, seguido del rango (1, 2 o 3) (Ex.: 1-2) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Pick5 Straight',
      steps: [
        'Ingresar en la jugada un número de cinco dígitos seguido del signo - (Ej.: 12345-) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Pick5 Box',
      steps: [
        'Ingresar en la jugada un número de cinco dígitos seguido del signo + (Ej.: 12345+) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Pick Two',
      steps: [
        'Ingresar en la jugada un número de dos dígitos y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Cash3 Front Straight',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra F y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Cash3 Front Box',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra F seguido del signo + (Ej.: 123F+) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Cash3 Back Straight',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra B y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Cash3 Back Box',
      steps: [
        'Ingresar en la jugada un número de tres dígitos luego la letra B seguido del signo + (Ej.: 123B+) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Pick Two Front',
      steps: [
        'Ingresar en la jugada un número de dos dígitos, la letra F y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Pick Two Back',
      steps: [
        'Ingresar en la jugada un número de dos dígitos, la letra B y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Pick Two Middle',
      steps: [
        'Ingresar en la jugada un número de dos dígitos seguido del signo de - y el rango (3) (Ej.: 10-3) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
    {
      title: 'Para jugar Panamá',
      steps: [
        'Ingresar en la jugada un número de cuatro dígitos seguido del signo - (Ej.: 1234-) y presionar enter.',
        'Ingresar el monto y presionar enter.',
      ],
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" component="span">
          Ayuda
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Teclas" />
          <Tab label="¿Cómo jugar?" />
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ minHeight: 400, maxHeight: 500 }}>
        {activeTab === 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Tecla</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Función</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keyboardShortcuts.map((shortcut, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                      {shortcut.key}
                    </TableCell>
                    <TableCell>{shortcut.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          <Box>
            {gameInstructions.map((instruction, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {instruction.title}
                </Typography>
                <Box component="ol" sx={{ pl: 2, m: 0 }}>
                  {instruction.steps.map((step, stepIndex) => (
                    <Typography component="li" key={stepIndex} sx={{ mb: 0.5 }}>
                      {step}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#51cbce', '&:hover': { bgcolor: '#45b8bb' } }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpModal;
