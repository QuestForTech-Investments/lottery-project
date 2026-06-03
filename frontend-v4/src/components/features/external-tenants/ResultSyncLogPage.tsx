/**
 * ResultSyncLogPage
 *
 * Two-tab admin page for cross-tenant result sync:
 *   • Log        — every outbound push / inbound receive with status
 *   • Conflictos — partner pushed a number that differs from local;
 *                   operator chooses to keep local, accept partner, or
 *                   just mark reviewed.
 *
 * Page gated by feature flag `externalTenantsAdmin` (admin route) and the
 * VIEW_RESULT_SYNC permission server-side.
 */

import { useState, useEffect, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Tooltip,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  SyncProblem as ConflictIcon,
} from '@mui/icons-material'
import {
  listSyncLog,
  listSyncConflicts,
  resolveConflict,
  type SyncLogRow,
  type ConflictRow,
  type ConflictResolution,
} from '@services/resultSyncService'

const STATUS_COLOR: Record<SyncLogRow['status'], 'success' | 'default' | 'warning' | 'error'> = {
  sent: 'success',
  received: 'success',
  noop: 'default',
  conflict: 'warning',
  failed: 'error',
}

const ResultSyncLogPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const [tab, setTab] = useState<number>(0)

  // Log tab state
  const [logRows, setLogRows] = useState<SyncLogRow[]>([])
  const [logLoading, setLogLoading] = useState<boolean>(true)

  // Conflicts tab state
  const [conflictRows, setConflictRows] = useState<ConflictRow[]>([])
  const [conflictLoading, setConflictLoading] = useState<boolean>(true)
  const [resolveDialog, setResolveDialog] = useState<{ row: ConflictRow, resolution: ConflictResolution } | null>(null)
  const [resolveNotes, setResolveNotes] = useState<string>('')

  const loadLog = useCallback(async () => {
    setLogLoading(true)
    try { setLogRows(await listSyncLog({ limit: 200 })) }
    catch (err) { console.error('[SyncLog] load log failed:', err) }
    finally { setLogLoading(false) }
  }, [])

  const loadConflicts = useCallback(async () => {
    setConflictLoading(true)
    try { setConflictRows(await listSyncConflicts('pending')) }
    catch (err) { console.error('[SyncLog] load conflicts failed:', err) }
    finally { setConflictLoading(false) }
  }, [])

  useEffect(() => {
    loadLog()
    loadConflicts()
  }, [loadLog, loadConflicts])

  const openResolve = (row: ConflictRow, resolution: ConflictResolution) => {
    setResolveDialog({ row, resolution })
    setResolveNotes('')
  }

  const confirmResolve = async () => {
    if (!resolveDialog) return
    try {
      await resolveConflict(resolveDialog.row.conflictId, resolveDialog.resolution, resolveNotes || undefined)
      setResolveDialog(null)
      await loadConflicts()
      await loadLog()
    } catch (err) {
      console.error('[SyncLog] resolve failed:', err)
      alert(t('common.errorGeneric', { defaultValue: 'Operación fallida' }))
    }
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              {t('resultSync.title', { defaultValue: 'Sincronización de Resultados' })}
            </Typography>
            <IconButton onClick={() => { loadLog(); loadConflicts() }}><RefreshIcon /></IconButton>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label={t('resultSync.tabLog', { defaultValue: 'Log' })} />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{t('resultSync.tabConflicts', { defaultValue: 'Conflictos' })}</span>
                  {conflictRows.length > 0 && (
                    <Chip size="small" color="warning" label={conflictRows.length} />
                  )}
                </Box>
              }
            />
          </Tabs>

          {tab === 0 && (
            logLoading ? (
              <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('resultSync.when', { defaultValue: 'Fecha' })}</TableCell>
                      <TableCell>{t('resultSync.direction', { defaultValue: 'Dirección' })}</TableCell>
                      <TableCell>{t('resultSync.partner', { defaultValue: 'Partner' })}</TableCell>
                      <TableCell>{t('resultSync.draw', { defaultValue: 'Sorteo' })}</TableCell>
                      <TableCell>{t('resultSync.resultDate', { defaultValue: 'Fecha sorteo' })}</TableCell>
                      <TableCell align="center">{t('resultSync.status', { defaultValue: 'Estado' })}</TableCell>
                      <TableCell>{t('resultSync.error', { defaultValue: 'Error' })}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          {t('resultSync.logEmpty', { defaultValue: 'Sin actividad de sync' })}
                        </TableCell>
                      </TableRow>
                    ) : logRows.map(r => (
                      <TableRow key={r.syncLogId} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={r.direction === 'outbound' ? '→' : '←'} />
                        </TableCell>
                        <TableCell><code>{r.partnerCode}</code></TableCell>
                        <TableCell><code>{r.lotteryCode}/{r.drawCode}</code></TableCell>
                        <TableCell>{r.resultDate.slice(0, 10)}</TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'error.main' }}>{r.errorMessage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}

          {tab === 1 && (
            conflictLoading ? (
              <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('resultSync.when', { defaultValue: 'Detectado' })}</TableCell>
                      <TableCell>{t('resultSync.partner', { defaultValue: 'Partner' })}</TableCell>
                      <TableCell>{t('resultSync.draw', { defaultValue: 'Sorteo' })}</TableCell>
                      <TableCell>{t('resultSync.resultDate', { defaultValue: 'Fecha' })}</TableCell>
                      <TableCell>{t('resultSync.localValue', { defaultValue: 'Local' })}</TableCell>
                      <TableCell>{t('resultSync.partnerValue', { defaultValue: 'Partner' })}</TableCell>
                      <TableCell align="right">{t('common.actions', { defaultValue: 'Acciones' })}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conflictRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          {t('resultSync.conflictsEmpty', { defaultValue: 'No hay conflictos pendientes' })}
                        </TableCell>
                      </TableRow>
                    ) : conflictRows.map(r => {
                      const local = [r.localNum1, r.localNum2].filter(Boolean).join(' - ')
                      const partner = [r.partnerNum1, r.partnerNum2].filter(Boolean).join(' - ')
                      return (
                        <TableRow key={r.conflictId} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</TableCell>
                          <TableCell><code>{r.partnerCode}</code></TableCell>
                          <TableCell><code>{r.lotteryCode}/{r.drawCode}</code></TableCell>
                          <TableCell>{r.resultDate.slice(0, 10)}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{local}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{partner}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={t('resultSync.keepLocal', { defaultValue: 'Mantener local' })}>
                              <IconButton size="small" color="primary" onClick={() => openResolve(r, 'kept_local')}>
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('resultSync.acceptPartner', { defaultValue: 'Aceptar del partner' })}>
                              <IconButton size="small" color="warning" onClick={() => openResolve(r, 'accepted_partner')}>
                                <ConflictIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('resultSync.markReviewed', { defaultValue: 'Marcar revisado' })}>
                              <IconButton size="small" onClick={() => openResolve(r, 'reviewed')}>
                                <ErrorIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={resolveDialog !== null} onClose={() => setResolveDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {resolveDialog && t(`resultSync.confirmResolution.${resolveDialog.resolution}`, {
            defaultValue: 'Confirmar resolución',
          })}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {resolveDialog?.resolution === 'accepted_partner'
              ? t('resultSync.acceptPartnerWarning', {
                  defaultValue: 'Esto SOBREESCRIBE el resultado local con el del partner. Asegúrate de re-procesar los tickets ganadores manualmente si es necesario.',
                })
              : t('resultSync.markResolvedHint', {
                  defaultValue: 'Marca este conflicto como resuelto sin cambiar datos.',
                })}
          </Typography>
          <TextField
            label={t('resultSync.notes', { defaultValue: 'Notas (opcional)' })}
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            fullWidth size="small" multiline rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialog(null)}>{t('common.cancel', { defaultValue: 'Cancelar' })}</Button>
          <Button
            onClick={confirmResolve}
            variant="contained"
            color={resolveDialog?.resolution === 'accepted_partner' ? 'warning' : 'primary'}
          >
            {t('common.confirm', { defaultValue: 'Confirmar' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default memo(ResultSyncLogPage)
