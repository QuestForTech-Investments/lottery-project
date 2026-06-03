/**
 * ExternalTenantsAdmin
 *
 * CRUD for the partner registry that powers the "Grupo" dropdown in Ventas
 * del Día and the bidirectional result sync. Each row has:
 *   • api_base_url + api_key  → how we call the partner
 *   • can_view_today_sales    → expose the partner in the Grupo dropdown
 *   • share_results           → bidirectional result sync is enabled
 *
 * The api_key is write-only (we only show its last 4 chars). To change it,
 * use the "Rotar key" action — confirmation required.
 *
 * Page is gated by tenantConfig.features.externalTenantsAdmin so it's hidden
 * in tenants that don't pair with anyone.
 */

import { useState, useEffect, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box, Card, CardContent, Typography, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Chip, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
  Autorenew as RotateIcon,
} from '@mui/icons-material'
import {
  listExternalTenants,
  createExternalTenant,
  updateExternalTenant,
  deleteExternalTenant,
  rotateExternalTenantKey,
  type ExternalTenantDto,
  type CreateExternalTenantDto,
  type UpdateExternalTenantDto,
} from '@services/externalTenantsService'

type DialogMode = 'create' | 'edit' | null

interface FormState {
  tenantCode: string
  displayName: string
  apiBaseUrl: string
  apiKey: string
  logoUrl: string
  sortOrder: number
  isActive: boolean
  canViewTodaySales: boolean
  shareResults: boolean
}

const EMPTY_FORM: FormState = {
  tenantCode: '',
  displayName: '',
  apiBaseUrl: '',
  apiKey: '',
  logoUrl: '',
  sortOrder: 0,
  isActive: true,
  canViewTodaySales: false,
  shareResults: false,
}

const ExternalTenantsAdmin = (): React.ReactElement => {
  const { t } = useTranslation()
  const [rows, setRows] = useState<ExternalTenantDto[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [rotatingId, setRotatingId] = useState<number | null>(null)
  const [rotateKey, setRotateKey] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listExternalTenants()
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[ExternalTenantsAdmin] load failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setDialogMode('create')
  }

  const openEdit = (row: ExternalTenantDto) => {
    setForm({
      tenantCode: row.tenantCode,
      displayName: row.displayName,
      apiBaseUrl: row.apiBaseUrl,
      apiKey: '', // never pre-fill — edit doesn't change key
      logoUrl: row.logoUrl ?? '',
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      canViewTodaySales: row.canViewTodaySales,
      shareResults: row.shareResults,
    })
    setEditingId(row.externalTenantId)
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      if (dialogMode === 'create') {
        const dto: CreateExternalTenantDto = {
          tenantCode: form.tenantCode.trim(),
          displayName: form.displayName.trim(),
          apiBaseUrl: form.apiBaseUrl.trim(),
          apiKey: form.apiKey,
          logoUrl: form.logoUrl.trim() || null,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
          canViewTodaySales: form.canViewTodaySales,
          shareResults: form.shareResults,
        }
        await createExternalTenant(dto)
      } else if (dialogMode === 'edit' && editingId != null) {
        const dto: UpdateExternalTenantDto = {
          displayName: form.displayName.trim(),
          apiBaseUrl: form.apiBaseUrl.trim(),
          logoUrl: form.logoUrl.trim() || null,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
          canViewTodaySales: form.canViewTodaySales,
          shareResults: form.shareResults,
        }
        await updateExternalTenant(editingId, dto)
      }
      await load()
      closeDialog()
    } catch (err) {
      console.error('[ExternalTenantsAdmin] submit failed:', err)
      alert(t('common.errorGeneric', { defaultValue: 'Operación fallida' }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (row: ExternalTenantDto) => {
    if (!confirm(t('externalTenants.confirmDelete', {
      name: row.displayName,
      defaultValue: '¿Eliminar el partner "{{name}}"?',
    }))) return
    try {
      await deleteExternalTenant(row.externalTenantId)
      await load()
    } catch (err) {
      console.error('[ExternalTenantsAdmin] delete failed:', err)
    }
  }

  const handleRotate = async () => {
    if (rotatingId == null) return
    if (rotateKey.trim().length < 16) {
      alert(t('externalTenants.keyTooShort', { defaultValue: 'La key debe tener al menos 16 caracteres' }))
      return
    }
    try {
      await rotateExternalTenantKey(rotatingId, rotateKey.trim())
      await load()
      setRotatingId(null)
      setRotateKey('')
    } catch (err) {
      console.error('[ExternalTenantsAdmin] rotate failed:', err)
    }
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              {t('externalTenants.title', { defaultValue: 'Sistemas Externos' })}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              {t('externalTenants.addPartner', { defaultValue: 'Agregar partner' })}
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('externalTenants.code', { defaultValue: 'Código' })}</TableCell>
                    <TableCell>{t('externalTenants.displayName', { defaultValue: 'Nombre' })}</TableCell>
                    <TableCell>{t('externalTenants.apiUrl', { defaultValue: 'API URL' })}</TableCell>
                    <TableCell align="center">{t('externalTenants.canViewSales', { defaultValue: 'Ver ventas' })}</TableCell>
                    <TableCell align="center">{t('externalTenants.shareResults', { defaultValue: 'Sync resultados' })}</TableCell>
                    <TableCell align="center">{t('externalTenants.status', { defaultValue: 'Estado' })}</TableCell>
                    <TableCell align="center">{t('externalTenants.apiKey', { defaultValue: 'API Key' })}</TableCell>
                    <TableCell align="right">{t('common.actions', { defaultValue: 'Acciones' })}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        {t('externalTenants.empty', { defaultValue: 'No hay partners configurados' })}
                      </TableCell>
                    </TableRow>
                  ) : rows.map(r => (
                    <TableRow key={r.externalTenantId} hover>
                      <TableCell><code>{r.tenantCode}</code></TableCell>
                      <TableCell>{r.displayName}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{r.apiBaseUrl}</TableCell>
                      <TableCell align="center">
                        {r.canViewTodaySales ? <Chip size="small" label="ON" color="success" /> : <Chip size="small" label="OFF" />}
                      </TableCell>
                      <TableCell align="center">
                        {r.shareResults ? <Chip size="small" label="ON" color="primary" /> : <Chip size="small" label="OFF" />}
                      </TableCell>
                      <TableCell align="center">
                        {r.isActive ? <Chip size="small" label="Activo" color="success" variant="outlined" /> : <Chip size="small" label="Inactivo" variant="outlined" />}
                      </TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {r.apiKeyHint}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('externalTenants.rotateKey', { defaultValue: 'Rotar key' })}>
                          <IconButton size="small" onClick={() => { setRotatingId(r.externalTenantId); setRotateKey('') }}>
                            <RotateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(r)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
            {t('externalTenants.bidirectionalHint', {
              defaultValue: 'Para que la sincronización funcione, el partner también debe agregar a este tenant en SU sistema con el mismo flag activo.',
            })}
          </Typography>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={dialogMode !== null} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create'
            ? t('externalTenants.addPartner', { defaultValue: 'Agregar partner' })
            : t('externalTenants.editPartner', { defaultValue: 'Editar partner' })}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('externalTenants.code', { defaultValue: 'Código' })}
              value={form.tenantCode}
              onChange={(e) => setForm(f => ({ ...f, tenantCode: e.target.value }))}
              disabled={dialogMode === 'edit'}
              required
              fullWidth
              size="small"
              helperText={t('externalTenants.codeHint', { defaultValue: 'Slug único, ej. "lottobook"' })}
            />
            <TextField
              label={t('externalTenants.displayName', { defaultValue: 'Nombre' })}
              value={form.displayName}
              onChange={(e) => setForm(f => ({ ...f, displayName: e.target.value }))}
              required fullWidth size="small"
            />
            <TextField
              label={t('externalTenants.apiUrl', { defaultValue: 'API URL' })}
              value={form.apiBaseUrl}
              onChange={(e) => setForm(f => ({ ...f, apiBaseUrl: e.target.value }))}
              required fullWidth size="small"
              placeholder="https://api.partner.com"
            />
            {dialogMode === 'create' && (
              <TextField
                label={t('externalTenants.apiKey', { defaultValue: 'API Key del partner' })}
                value={form.apiKey}
                onChange={(e) => setForm(f => ({ ...f, apiKey: e.target.value }))}
                required fullWidth size="small"
                type="password"
                helperText={t('externalTenants.keyHint', { defaultValue: 'La key inbound del partner. Mínimo 16 chars.' })}
              />
            )}
            <TextField
              label={t('externalTenants.logoUrl', { defaultValue: 'Logo URL (opcional)' })}
              value={form.logoUrl}
              onChange={(e) => setForm(f => ({ ...f, logoUrl: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label={t('externalTenants.sortOrder', { defaultValue: 'Orden' })}
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
              fullWidth size="small"
            />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} />}
              label={t('externalTenants.active', { defaultValue: 'Activo' })}
            />
            <FormControlLabel
              control={<Switch checked={form.canViewTodaySales} onChange={(e) => setForm(f => ({ ...f, canViewTodaySales: e.target.checked }))} />}
              label={t('externalTenants.canViewSalesLabel', { defaultValue: 'Permitir ver ventas del día del partner' })}
            />
            <FormControlLabel
              control={<Switch checked={form.shareResults} onChange={(e) => setForm(f => ({ ...f, shareResults: e.target.checked }))} />}
              label={t('externalTenants.shareResultsLabel', { defaultValue: 'Sync bidireccional de resultados' })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>{t('common.cancel', { defaultValue: 'Cancelar' })}</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : t('common.save', { defaultValue: 'Guardar' })}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rotate key dialog */}
      <Dialog open={rotatingId !== null} onClose={() => setRotatingId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyIcon /> {t('externalTenants.rotateKey', { defaultValue: 'Rotar key' })}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {t('externalTenants.rotateHint', {
              defaultValue: 'Reemplaza la key que enviamos al partner. Asegúrate de coordinarlo — si la cambias aquí pero el partner aún espera la vieja, los pushes fallarán.',
            })}
          </Typography>
          <TextField
            label={t('externalTenants.newKey', { defaultValue: 'Nueva API key' })}
            value={rotateKey}
            onChange={(e) => setRotateKey(e.target.value)}
            type="password"
            fullWidth size="small"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRotatingId(null)}>{t('common.cancel', { defaultValue: 'Cancelar' })}</Button>
          <Button onClick={handleRotate} variant="contained" color="warning">
            {t('externalTenants.rotateConfirm', { defaultValue: 'Rotar' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default memo(ExternalTenantsAdmin)
