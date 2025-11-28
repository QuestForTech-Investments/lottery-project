/**
 * PrizesTab Component with Sub-tabs and Draw Tabs
 * 3-Level Structure:
 * - Level 1: Main tab "Premios & Comisiones"
 * - Level 2: Sub-tabs (Premios, Comisiones, Comisiones 2)
 * - Level 3: Draw tabs (General + ~70 draws)
 * TypeScript version with full type safety
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Grid,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Button,
  Snackbar,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ChevronLeft,
  ChevronRight,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { getAllBetTypesWithFields } from '@/services/prizeService'
import type { BettingPoolFormData } from '../hooks/useCreateBettingPoolForm'
import type { Draw } from '@/types'

interface PrizesTabProps {
  formData: BettingPoolFormData
  handleChange: (event: { target: { name: string; value: any } }) => void
  draws: Draw[]
  loadingDraws: boolean
  bettingPoolId?: number | null
  loadDrawSpecificValues?: ((drawId: number, bettingPoolId: number) => Promise<Record<string, any>>) | null
  onSavePrizeConfig?: ((activeDraw: string) => Promise<void>) | null
}

interface BetType {
  betTypeId: number
  betTypeName: string
  betTypeCode: string
  description?: string
  prizeFields?: PrizeField[]
}

interface PrizeField {
  prizeTypeId: number
  fieldName: string
  fieldCode: string
  defaultMultiplier: number
  minMultiplier?: number
  maxMultiplier?: number
}

interface DrawItem {
  id: string
  name: string
  drawId?: number
}

/**
 * Orden específico de los sorteos según V1
 */
const DRAW_ORDER = [
  'LA PRIMERA',
  'NEW YORK DAY',
  'NEW YORK NIGHT',
  'FLORIDA AM',
  'FLORIDA PM',
  'GANA MAS',
  'NACIONAL',
  'QUINIELA PALE',
  'REAL',
  'LOTEKA',
  'FL PICK2 AM',
  'FL PICK2 PM',
  'GEORGIA-MID AM',
  'GEORGIA EVENING',
  'GEORGIA NIGHT',
  'NEW JERSEY AM',
  'NEW JERSEY PM',
  'CONNECTICUT AM',
  'CONNECTICUT PM',
  'CALIFORNIA AM',
  'CALIFORNIA PM',
  'CHICAGO AM',
  'CHICAGO PM',
  'PENN MIDDAY',
  'PENN EVENING',
  'INDIANA MIDDAY',
  'INDIANA EVENING',
  'DIARIA 11AM',
  'DIARIA 3PM',
  'DIARIA 9PM',
  'SUPER PALE TARDE',
  'SUPER PALE NOCHE',
  'SUPER PALE NY-FL AM',
  'SUPER PALE NY-FL PM',
  'TEXAS MORNING',
  'TEXAS DAY',
  'TEXAS EVENING',
  'TEXAS NIGHT',
  'VIRGINIA AM',
  'VIRGINIA PM',
  'SOUTH CAROLINA AM',
  'SOUTH CAROLINA PM',
  'MARYLAND MIDDAY',
  'MARYLAND EVENING',
  'MASS AM',
  'MASS PM',
  'LA SUERTE',
  'NORTH CAROLINA AM',
  'NORTH CAROLINA PM',
  'LOTEDOM',
  'NY AM 6x1',
  'NY PM 6x1',
  'FL AM 6X1',
  'FL PM 6X1',
  'King Lottery AM',
  'King Lottery PM',
  'L.E. PUERTO RICO 2PM',
  'L.E. PUERTO RICO 10PM',
  'DELAWARE AM',
  'DELAWARE PM',
  'Anguila 1pm',
  'Anguila 6PM',
  'Anguila 9pm',
  'Anguila 10am',
  'LA CHICA',
  'LA PRIMERA 8PM',
  'PANAMA MIERCOLES',
  'PANAMA DOMINGO',
  'LA SUERTE 6:00pm',
]

/**
 * Commission field definitions for "Comisiones" tab
 */
const COMMISSION_FIELDS = [
  { id: 'commissionDiscount1', name: 'Comisión Descuento 1', fieldCode: 'COMMISSION_DISCOUNT_1' },
  { id: 'commissionDiscount2', name: 'Comisión Descuento 2', fieldCode: 'COMMISSION_DISCOUNT_2' },
  { id: 'commissionDiscount3', name: 'Comisión Descuento 3', fieldCode: 'COMMISSION_DISCOUNT_3' },
  { id: 'commissionDiscount4', name: 'Comisión Descuento 4', fieldCode: 'COMMISSION_DISCOUNT_4' },
]

/**
 * Commission 2 field definitions for "Comisiones 2" tab
 */
const COMMISSION_2_FIELDS = [
  { id: 'commission2Discount1', name: 'Comisión 2 Descuento 1', fieldCode: 'COMMISSION_2_DISCOUNT_1' },
  { id: 'commission2Discount2', name: 'Comisión 2 Descuento 2', fieldCode: 'COMMISSION_2_DISCOUNT_2' },
  { id: 'commission2Discount3', name: 'Comisión 2 Descuento 3', fieldCode: 'COMMISSION_2_DISCOUNT_3' },
  { id: 'commission2Discount4', name: 'Comisión 2 Descuento 4', fieldCode: 'COMMISSION_2_DISCOUNT_4' },
]

const PrizesTab: React.FC<PrizesTabProps> = ({
  formData,
  handleChange,
  draws: propDraws = [],
  loadingDraws: propLoadingDraws = false,
  bettingPoolId = null,
  loadDrawSpecificValues = null,
  onSavePrizeConfig = null,
}) => {
  const [betTypes, setBetTypes] = useState<BetType[]>([])
  const [activeSubTab, setActiveSubTab] = useState(0) // 0=Premios, 1=Comisiones, 2=Comisiones 2
  const [activeDraw, setActiveDraw] = useState('general')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const drawTabsRef = useRef<HTMLDivElement>(null)

  // Save state for ACTUALIZAR button
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Estado para valores "general" (usados como fallback)
  const [generalValues, setGeneralValues] = useState<Record<string, any>>({})

  // Format draws for tabs
  const drawItems: DrawItem[] = React.useMemo(() => {
    const apiDraws = propDraws.map((draw) => ({
      id: `draw_${draw.drawId}`,
      name: draw.drawName,
      drawId: draw.drawId,
    }))

    const sortedDraws = DRAW_ORDER.map((orderName) => apiDraws.find((draw) => draw.name === orderName)).filter(
      (draw): draw is DrawItem => draw !== undefined
    )

    const unorderedDraws = apiDraws.filter((draw) => !DRAW_ORDER.includes(draw.name))

    return [{ id: 'general', name: 'General' }, ...sortedDraws, ...unorderedDraws]
  }, [propDraws])

  /**
   * Load bet types when draw changes
   */
  useEffect(() => {
    loadBetTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDraw])

  /**
   * Load draw-specific values when switching to a draw tab
   */
  useEffect(() => {
    if (bettingPoolId && loadDrawSpecificValues && activeDraw !== 'general' && activeDraw.startsWith('draw_')) {
      const drawId = parseInt(activeDraw.split('_')[1])
      console.log(`Tab changed to draw ${drawId}, loading specific values...`)

      loadDrawSpecificValues(drawId, bettingPoolId)
        .then((drawValues) => {
          if (Object.keys(drawValues).length > 0) {
            console.log(`Loaded draw values, updating form data...`)
            // Merge draw-specific values into formData
            Object.keys(drawValues).forEach((key) => {
              handleChange({
                target: {
                  name: key,
                  value: drawValues[key],
                },
              })
            })
          }
        })
        .catch((error) => {
          console.error(`Error loading draw-specific values:`, error)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDraw, bettingPoolId])

  /**
   * Load "general" values once (for fallback)
   */
  useEffect(() => {
    const loadGeneralDefaults = async () => {
      try {
        console.log('[FALLBACK] Loading general values for fallback...')
        const allBetTypes = await getAllBetTypesWithFields()

        if (allBetTypes && Array.isArray(allBetTypes)) {
          const generalVals: Record<string, any> = {}

          allBetTypes.forEach((betType: BetType) => {
            const betTypeCode = betType.betTypeCode
            const prizeFields = betType.prizeFields || []

            prizeFields.forEach((field) => {
              const fieldCode = field.fieldCode
              const defaultValue = field.defaultMultiplier

              if (fieldCode && defaultValue !== undefined && betTypeCode) {
                const key = `general_${betTypeCode}_${fieldCode}`
                generalVals[key] = defaultValue
              }
            })
          })

          console.log(`[FALLBACK] General values loaded: ${Object.keys(generalVals).length} fields`)
          setGeneralValues(generalVals)
        }
      } catch (error) {
        console.error('[FALLBACK] Error loading general values:', error)
      }
    }

    loadGeneralDefaults()
  }, [])

  /**
   * Load bet types based on active draw
   */
  const loadBetTypes = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Loading all bet types for ${activeDraw}`)
      const betTypesData = await getAllBetTypesWithFields()

      console.log(`Loaded ${betTypesData.length} bet types for ${activeDraw}`)
      setBetTypes(betTypesData)
    } catch (err) {
      console.error('Error loading bet types:', err)
      setError((err as Error).message || 'Error al cargar tipos de premios')
      setBetTypes([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle sub-tab change
   */
  const handleSubTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveSubTab(newValue)
  }

  /**
   * Scroll tabs left
   */
  const scrollLeft = () => {
    if (drawTabsRef.current) {
      drawTabsRef.current.scrollBy({
        left: -300,
        behavior: 'smooth',
      })
    }
  }

  /**
   * Scroll tabs right
   */
  const scrollRight = () => {
    if (drawTabsRef.current) {
      drawTabsRef.current.scrollBy({
        left: 300,
        behavior: 'smooth',
      })
    }
  }

  /**
   * Generate field name for formData
   * Format: {drawId}_{betTypeCode}_{fieldCode}
   */
  const getFieldName = (betTypeCode: string, prizeField: PrizeField): string => {
    return `${activeDraw}_${betTypeCode}_${prizeField.fieldCode}`
  }

  /**
   * Get field value from formData with fallback logic
   */
  const getFieldValue = (betTypeCode: string, prizeField: PrizeField): string | number => {
    const fieldKey = getFieldName(betTypeCode, prizeField)
    const currentValue = (formData as any)[fieldKey]

    // Si es "general", usar el valor directamente
    if (activeDraw === 'general') {
      if (currentValue !== undefined && currentValue !== null) {
        return currentValue
      }
      return prizeField.defaultMultiplier || ''
    }

    // Si es sorteo específico: usar fallback
    if (currentValue !== undefined && currentValue !== null) {
      return currentValue
    }

    // Fallback to "general" value
    const generalKey = `general_${betTypeCode}_${prizeField.fieldCode}`
    const generalValue = generalValues[generalKey] || (formData as any)[generalKey]

    if (generalValue !== undefined && generalValue !== null && generalValue !== '') {
      return generalValue
    }

    // Último fallback: defaultMultiplier
    return prizeField.defaultMultiplier || ''
  }

  /**
   * Handle field change
   */
  const handleFieldChange = (betTypeCode: string, prizeField: PrizeField) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fieldKey = getFieldName(betTypeCode, prizeField)
    const value = event.target.value

    // Allow empty value
    if (value === '') {
      handleChange({
        target: {
          name: fieldKey,
          value: '',
        },
      })
      return
    }

    // Only allow numbers and one decimal point
    const numberRegex = /^-?\d*\.?\d*$/
    if (numberRegex.test(value)) {
      handleChange({
        target: {
          name: fieldKey,
          value: value,
        },
      })
    }
  }

  /**
   * Handle save for current draw
   */
  const handleSave = async () => {
    if (!onSavePrizeConfig || !bettingPoolId) {
      console.warn('Cannot save: onSavePrizeConfig or bettingPoolId is missing')
      setSaveError('No se puede guardar: falta configuración')
      return
    }

    try {
      setSaving(true)
      setSaveError(null)
      console.log(`Saving prize config for draw: ${activeDraw}`)

      await onSavePrizeConfig(activeDraw)

      setSaveSuccess(true)
      console.log(`Prize config saved successfully for ${activeDraw}`)

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error(`Error saving prize config:`, error)
      setSaveError((error as Error).message || 'Error al guardar configuración de premios')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Generate commission field name for formData
   */
  const getCommissionFieldName = (betTypeCode: string, fieldCode: string): string => {
    return `${activeDraw}_COMMISSION_${betTypeCode}_${fieldCode}`
  }

  /**
   * Get commission field value from formData with fallback logic
   */
  const getCommissionFieldValue = (betTypeCode: string, fieldCode: string): string | number => {
    const fieldKey = getCommissionFieldName(betTypeCode, fieldCode)
    const currentValue = (formData as any)[fieldKey]

    if (activeDraw === 'general') {
      if (currentValue !== undefined && currentValue !== null) {
        return currentValue
      }
      return ''
    }

    if (currentValue !== undefined && currentValue !== null) {
      return currentValue
    }

    const generalKey = `general_COMMISSION_${betTypeCode}_${fieldCode}`
    const generalValue = (formData as any)[generalKey]

    if (generalValue !== undefined && generalValue !== null && generalValue !== '') {
      return generalValue
    }

    return ''
  }

  /**
   * Handle commission field change
   */
  const handleCommissionFieldChange = (betTypeCode: string, fieldCode: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fieldKey = getCommissionFieldName(betTypeCode, fieldCode)
    const value = event.target.value

    if (value === '') {
      handleChange({
        target: {
          name: fieldKey,
          value: '',
        },
      })
      return
    }

    const numberRegex = /^-?\d*\.?\d*$/
    if (numberRegex.test(value)) {
      handleChange({
        target: {
          name: fieldKey,
          value: value,
        },
      })
    }
  }

  /**
   * Generate commission 2 field name for formData
   */
  const getCommission2FieldName = (betTypeCode: string, fieldCode: string): string => {
    return `${activeDraw}_COMMISSION2_${betTypeCode}_${fieldCode}`
  }

  /**
   * Get commission 2 field value from formData with fallback logic
   */
  const getCommission2FieldValue = (betTypeCode: string, fieldCode: string): string | number => {
    const fieldKey = getCommission2FieldName(betTypeCode, fieldCode)
    const currentValue = (formData as any)[fieldKey]

    if (activeDraw === 'general') {
      if (currentValue !== undefined && currentValue !== null) {
        return currentValue
      }
      return ''
    }

    if (currentValue !== undefined && currentValue !== null) {
      return currentValue
    }

    const generalKey = `general_COMMISSION2_${betTypeCode}_${fieldCode}`
    const generalValue = (formData as any)[generalKey]

    if (generalValue !== undefined && generalValue !== null && generalValue !== '') {
      return generalValue
    }

    return ''
  }

  /**
   * Handle commission 2 field change
   */
  const handleCommission2FieldChange = (betTypeCode: string, fieldCode: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fieldKey = getCommission2FieldName(betTypeCode, fieldCode)
    const value = event.target.value

    if (value === '') {
      handleChange({
        target: {
          name: fieldKey,
          value: '',
        },
      })
      return
    }

    const numberRegex = /^-?\d*\.?\d*$/
    if (numberRegex.test(value)) {
      handleChange({
        target: {
          name: fieldKey,
          value: value,
        },
      })
    }
  }

  /**
   * Render Premios content
   */
  const renderPremiosContent = () => {
    return (
      <>
        {betTypes.map((betType, index) => (
          <Accordion key={betType.betTypeId} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {betType.betTypeName}
                </Typography>
                {betType.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', flex: 1 }}>
                    {betType.description}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {betType.prizeFields && betType.prizeFields.length > 0 ? (
                  betType.prizeFields.map((field) => {
                    const fieldKey = getFieldName(betType.betTypeCode, field)
                    const currentValue = (formData as any)[fieldKey]
                    const generalKey = `general_${betType.betTypeCode}_${field.fieldCode}`
                    const generalValue = generalValues[generalKey] || (formData as any)[generalKey]

                    const isCustomValue =
                      activeDraw !== 'general' &&
                      currentValue !== undefined &&
                      currentValue !== null &&
                      currentValue !== ''

                    const placeholderText =
                      activeDraw === 'general'
                        ? field.defaultMultiplier?.toString() || '0'
                        : `${generalValue || field.defaultMultiplier || 0} (general)`

                    return (
                      <Grid item xs={12} md={6} key={field.prizeTypeId}>
                        <TextField
                          fullWidth
                          type="text"
                          label={field.fieldName}
                          name={fieldKey}
                          value={getFieldValue(betType.betTypeCode, field)}
                          onChange={handleFieldChange(betType.betTypeCode, field)}
                          placeholder={placeholderText}
                          inputProps={{
                            step: '0.01',
                            min: field.minMultiplier || 0,
                            max: field.maxMultiplier || 10000,
                          }}
                          helperText={
                            activeDraw === 'general'
                              ? `Default: ${field.defaultMultiplier || 0} | Rango: ${field.minMultiplier || 0} - ${
                                  field.maxMultiplier || 10000
                                }`
                              : isCustomValue
                                ? `✓ Valor personalizado | Rango: ${field.minMultiplier || 0} - ${
                                    field.maxMultiplier || 10000
                                  }`
                                : `Usando valor de "General": ${generalValue || field.defaultMultiplier || 0} | Rango: ${
                                    field.minMultiplier || 0
                                  } - ${field.maxMultiplier || 10000}`
                          }
                          FormHelperTextProps={{
                            sx: {
                              fontSize: '0.7rem',
                              color: isCustomValue ? 'primary.main' : 'text.secondary',
                            },
                          }}
                        />
                      </Grid>
                    )
                  })
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      No hay campos de premios configurados para este tipo de juego
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {bettingPoolId && onSavePrizeConfig && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                color: 'white',
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {saving ? 'Guardando...' : 'ACTUALIZAR'}
            </Button>
          </Box>
        )}
      </>
    )
  }

  /**
   * Render Comisiones content
   */
  const renderComisionesContent = () => {
    return (
      <>
        {betTypes.map((betType, index) => (
          <Accordion key={`commission-${betType.betTypeId}`} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {betType.betTypeName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', flex: 1 }}>
                  Comisiones de descuento
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {COMMISSION_FIELDS.map((field) => {
                  const fieldKey = getCommissionFieldName(betType.betTypeCode, field.fieldCode)
                  const currentValue = (formData as any)[fieldKey]
                  const generalKey = `general_COMMISSION_${betType.betTypeCode}_${field.fieldCode}`
                  const generalValue = (formData as any)[generalKey]

                  const isCustomValue =
                    activeDraw !== 'general' &&
                    currentValue !== undefined &&
                    currentValue !== null &&
                    currentValue !== ''

                  const placeholderText = activeDraw === 'general' ? '0' : `${generalValue || 0} (general)`

                  return (
                    <Grid item xs={12} sm={6} md={3} key={field.id}>
                      <TextField
                        fullWidth
                        type="text"
                        label={field.name}
                        name={fieldKey}
                        value={getCommissionFieldValue(betType.betTypeCode, field.fieldCode)}
                        onChange={handleCommissionFieldChange(betType.betTypeCode, field.fieldCode)}
                        placeholder={placeholderText}
                        InputProps={{
                          endAdornment: <Typography variant="caption">%</Typography>,
                        }}
                        inputProps={{
                          step: '0.01',
                          min: 0,
                          max: 100,
                        }}
                        helperText={
                          activeDraw === 'general'
                            ? 'Rango: 0 - 100%'
                            : isCustomValue
                              ? '✓ Valor personalizado'
                              : `Usando valor de "General": ${generalValue || 0}%`
                        }
                        FormHelperTextProps={{
                          sx: {
                            fontSize: '0.7rem',
                            color: isCustomValue ? 'primary.main' : 'text.secondary',
                          },
                        }}
                      />
                    </Grid>
                  )
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {bettingPoolId && onSavePrizeConfig && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                color: 'white',
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {saving ? 'Guardando...' : 'ACTUALIZAR'}
            </Button>
          </Box>
        )}
      </>
    )
  }

  /**
   * Render Comisiones 2 content
   */
  const renderComisiones2Content = () => {
    return (
      <>
        {betTypes.map((betType, index) => (
          <Accordion key={`commission2-${betType.betTypeId}`} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {betType.betTypeName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', flex: 1 }}>
                  Comisiones 2 de descuento
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {COMMISSION_2_FIELDS.map((field) => {
                  const fieldKey = getCommission2FieldName(betType.betTypeCode, field.fieldCode)
                  const currentValue = (formData as any)[fieldKey]
                  const generalKey = `general_COMMISSION2_${betType.betTypeCode}_${field.fieldCode}`
                  const generalValue = (formData as any)[generalKey]

                  const isCustomValue =
                    activeDraw !== 'general' &&
                    currentValue !== undefined &&
                    currentValue !== null &&
                    currentValue !== ''

                  const placeholderText = activeDraw === 'general' ? '0' : `${generalValue || 0} (general)`

                  return (
                    <Grid item xs={12} sm={6} md={3} key={field.id}>
                      <TextField
                        fullWidth
                        type="text"
                        label={field.name}
                        name={fieldKey}
                        value={getCommission2FieldValue(betType.betTypeCode, field.fieldCode)}
                        onChange={handleCommission2FieldChange(betType.betTypeCode, field.fieldCode)}
                        placeholder={placeholderText}
                        InputProps={{
                          endAdornment: <Typography variant="caption">%</Typography>,
                        }}
                        inputProps={{
                          step: '0.01',
                          min: 0,
                          max: 100,
                        }}
                        helperText={
                          activeDraw === 'general'
                            ? 'Rango: 0 - 100%'
                            : isCustomValue
                              ? '✓ Valor personalizado'
                              : `Usando valor de "General": ${generalValue || 0}%`
                        }
                        FormHelperTextProps={{
                          sx: {
                            fontSize: '0.7rem',
                            color: isCustomValue ? 'primary.main' : 'text.secondary',
                          },
                        }}
                      />
                    </Grid>
                  )
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {bettingPoolId && onSavePrizeConfig && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                color: 'white',
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {saving ? 'Guardando...' : 'ACTUALIZAR'}
            </Button>
          </Box>
        )}
      </>
    )
  }

  /**
   * Render sub-tab content based on active sub-tab
   */
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 0:
        return renderPremiosContent()
      case 1:
        return renderComisionesContent()
      case 2:
        return renderComisiones2Content()
      default:
        return renderPremiosContent()
    }
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          {activeDraw === 'general'
            ? 'Cargando todos los tipos de premios...'
            : `Cargando tipos de premios para ${drawItems.find((l) => l.id === activeDraw)?.name}...`}
        </Typography>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          No se pudieron cargar los tipos de premios. Por favor, verifica que el backend esté corriendo y vuelve a
          intentar.
        </Typography>
      </Box>
    )
  }

  // Empty state
  if (betTypes.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No hay tipos de premios configurados en el sistema.</Alert>
      </Box>
    )
  }

  // Main content
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Premios y Comisiones
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configura los pagos de premios y comisiones para cada tipo de juego de lotería.
      </Typography>

      {/* Level 2: Sub-tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeSubTab}
          onChange={handleSubTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
              fontSize: '0.95rem',
            },
          }}
        >
          <Tab label="Premios" />
          <Tab label="Comisiones" />
          <Tab label="Comisiones 2" />
        </Tabs>
      </Box>

      {/* Level 3: Draw Tabs */}
      <Box sx={{ mb: 3, position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={scrollLeft}
          disabled={propLoadingDraws}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ChevronLeft />
        </IconButton>

        <Box
          ref={drawTabsRef}
          sx={{
            flex: 1,
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'action.hover',
              borderRadius: 1,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'primary.main',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          }}
        >
          {propLoadingDraws ? (
            <Chip label="Cargando sorteos..." variant="outlined" />
          ) : (
            drawItems.map((draw) => (
              <Chip
                key={draw.id}
                label={draw.name}
                onClick={() => setActiveDraw(draw.id)}
                color={activeDraw === draw.id ? 'primary' : 'default'}
                variant={activeDraw === draw.id ? 'filled' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  fontWeight: activeDraw === draw.id ? 'bold' : 'normal',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                }}
              />
            ))
          )}
        </Box>

        <IconButton
          onClick={scrollRight}
          disabled={propLoadingDraws}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Info Chips */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={`${betTypes.length} tipos de juegos`} color="success" size="small" />
        <Chip
          label={`Sorteo: ${drawItems.find((l) => l.id === activeDraw)?.name || 'General'}`}
          color="primary"
          size="small"
        />
        <Chip
          label={activeSubTab === 0 ? 'Premios' : activeSubTab === 1 ? 'Comisiones' : 'Comisiones 2'}
          color="secondary"
          size="small"
        />
      </Box>

      {/* Sub-tab Content */}
      <Box>{renderSubTabContent()}</Box>

      {/* Info box */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> El tab "General" contiene valores por defecto que se copian automáticamente al
            seleccionar un sorteo específico por primera vez. Puedes modificar los valores de cada sorteo de forma
            independiente en cada sub-tab (Premios, Comisiones, Comisiones 2).
          </Typography>
        </Alert>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }} icon={<CheckCircleIcon />}>
          Configuración guardada exitosamente para {drawItems.find((l) => l.id === activeDraw)?.name || activeDraw}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSaveError(null)} severity="error" sx={{ width: '100%' }}>
          {saveError || 'Error al guardar configuración'}
        </Alert>
      </Snackbar>
    </Box>
  )
}

/**
 * Custom comparison function for PrizesTab
 */
const arePropsEqual = (prevProps: PrizesTabProps, nextProps: PrizesTabProps): boolean => {
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false
  }

  if (prevProps.bettingPoolId !== nextProps.bettingPoolId) {
    return false
  }

  if (prevProps.draws !== nextProps.draws) {
    return false
  }

  if (prevProps.loadingDraws !== nextProps.loadingDraws) {
    return false
  }

  // Deep comparison of prize-related fields
  const prevKeys = Object.keys(prevProps.formData || {}).filter((key) => key.includes('_'))
  const nextKeys = Object.keys(nextProps.formData || {}).filter((key) => key.includes('_'))

  if (prevKeys.length !== nextKeys.length) {
    return false
  }

  for (const key of nextKeys) {
    if ((prevProps.formData as any)[key] !== (nextProps.formData as any)[key]) {
      return false
    }
  }

  return true
}

export default React.memo(PrizesTab, arePropsEqual)
