import { useState, useMemo, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
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

// Match the order/keys already defined under `modals.lotteryHelp` in the locale files.
const SHORTCUT_KEYS = [
  'arrowUp', 'l', 'slash', 'asterisk', 'c', 'p', 'q', 'dot', 'd', 'minus10', 'plusXyz',
] as const;

const GAME_KEYS = [
  'directo', 'pale', 'tripleta', 'cash3Straight', 'cash3Box',
  'play4Straight', 'play4Box', 'superPale', 'bolita', 'singulacion',
  'pick5Straight', 'pick5Box', 'pickTwo', 'cash3FrontStraight', 'cash3FrontBox',
  'cash3BackStraight', 'cash3BackBox', 'pickTwoFront', 'pickTwoBack',
  'pickTwoMiddle', 'panama',
] as const;

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  const keyboardShortcuts: KeyboardShortcut[] = useMemo(() => SHORTCUT_KEYS.map((k) => ({
    key: t(`modals.lotteryHelp.shortcuts.${k}.key`),
    description: t(`modals.lotteryHelp.shortcuts.${k}.function`),
  })), [t]);

  const gameInstructions: GameInstruction[] = useMemo(() => GAME_KEYS.map((k) => ({
    title: t(`modals.lotteryHelp.games.${k}.title`),
    steps: t(`modals.lotteryHelp.games.${k}.steps`, { returnObjects: true }) as unknown as string[],
  })), [t]);

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
          {t('tickets.create.help')}
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
          <Tab label={t('tickets.create.tabKeys')} />
          <Tab label={t('tickets.create.tabHowToPlay')} />
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ minHeight: 400, maxHeight: 500 }}>
        {activeTab === 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>{t('tickets.create.key')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('tickets.create.function')}</TableCell>
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
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpModal;
