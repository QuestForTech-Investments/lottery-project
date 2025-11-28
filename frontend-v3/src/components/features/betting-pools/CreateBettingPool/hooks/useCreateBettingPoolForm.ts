/**
 * useCreateBettingPoolForm Hook
 * Complete TypeScript hook for creating betting pools with all 8 tabs
 * Uses React Query for data fetching and includes form validation
 */

import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllZones } from '@/services/zoneService'
import { drawsApi } from '@/services/api/draws'
import {
  createBettingPoolWithConfig,
  getNextBettingPoolCode,
} from '@/services/bettingPoolService'
import type { CreateBettingPoolWithConfigDto } from '@/types/bettingPool'
import type { Zone } from '@/types/zone'
import type { Draw } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

export interface BettingPoolFormData {
  // General
  bettingPoolName: string
  bettingPoolCode: string
  username: string
  password: string
  confirmPassword: string
  location: string
  reference: string
  comment: string
  zoneId: string

  // Configuration
  fallType: string
  deactivationBalance: string
  dailySaleLimit: string
  dailyBalanceLimit: string
  enableTemporaryBalance: boolean
  temporaryAdditionalBalance: string
  isActive: boolean
  controlWinningTickets: boolean
  allowJackpot: boolean
  printEnabled: boolean
  printTicketCopy: boolean
  smsOnly: boolean
  minutesToCancelTicket: string
  ticketsToCancelPerDay: string
  maximumCancelTicketAmount: string
  maxTicketAmount: string
  enableRecharges: boolean
  printRechargeReceipt: boolean
  dailyPhoneRechargeLimit: string
  allowPasswordChange: boolean
  printerType: string
  discountProvider: string
  discountMode: string
  limitPreference: string | null

  // Footers
  autoFooter: boolean
  footerText1: string
  footerText2: string
  footerText3: string
  footerText4: string
  showBranchInfo: boolean
  showDateTime: boolean

  // Schedules
  domingoInicio: string
  domingoFin: string
  lunesInicio: string
  lunesFin: string
  martesInicio: string
  martesFin: string
  miercolesInicio: string
  miercolesFin: string
  juevesInicio: string
  juevesFin: string
  viernesInicio: string
  viernesFin: string
  sabadoInicio: string
  sabadoFin: string

  // Draws
  selectedDraws: number[]
  anticipatedClosing: string
  anticipatedClosingDraws: number[]

  // Styles
  sellScreenStyles: string
  ticketPrintStyles: string

  // Auto Expenses
  autoExpenses: any[]
}

export interface FormErrors {
  [key: string]: string | undefined
}

// ============================================================================
// INITIAL FORM DATA
// ============================================================================

const getInitialFormData = (bettingPoolCode = ''): BettingPoolFormData => ({
  // General
  bettingPoolName: '',
  bettingPoolCode,
  username: '',
  password: '',
  confirmPassword: '',
  location: '',
  reference: '',
  comment: '',
  zoneId: '',

  // Configuration
  fallType: '1',
  deactivationBalance: '',
  dailySaleLimit: '',
  dailyBalanceLimit: '',
  enableTemporaryBalance: false,
  temporaryAdditionalBalance: '',
  isActive: true,
  controlWinningTickets: false,
  allowJackpot: true,
  printEnabled: true,
  printTicketCopy: true,
  smsOnly: false,
  minutesToCancelTicket: '30',
  ticketsToCancelPerDay: '',
  maximumCancelTicketAmount: '',
  maxTicketAmount: '',
  enableRecharges: true,
  printRechargeReceipt: true,
  dailyPhoneRechargeLimit: '',
  allowPasswordChange: true,
  printerType: '1',
  discountProvider: '2',
  discountMode: '1',
  limitPreference: null,

  // Footers
  autoFooter: false,
  footerText1: '',
  footerText2: '',
  footerText3: '',
  footerText4: '',
  showBranchInfo: true,
  showDateTime: true,

  // Schedules
  domingoInicio: '12:00 AM',
  domingoFin: '11:59 PM',
  lunesInicio: '12:00 AM',
  lunesFin: '11:59 PM',
  martesInicio: '12:00 AM',
  martesFin: '11:59 PM',
  miercolesInicio: '12:00 AM',
  miercolesFin: '11:59 PM',
  juevesInicio: '12:00 AM',
  juevesFin: '11:59 PM',
  viernesInicio: '12:00 AM',
  viernesFin: '11:59 PM',
  sabadoInicio: '12:00 AM',
  sabadoFin: '11:59 PM',

  // Draws
  selectedDraws: [],
  anticipatedClosing: '',
  anticipatedClosingDraws: [],

  // Styles
  sellScreenStyles: 'estilo1',
  ticketPrintStyles: 'original',

  // Auto Expenses
  autoExpenses: [],
})

// ============================================================================
// HOOK
// ============================================================================

export const useCreateBettingPoolForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  // Form state
  const [formData, setFormData] = useState<BettingPoolFormData>(getInitialFormData())
  const [errors, setErrors] = useState<FormErrors>({})
  const [activeTab, setActiveTab] = useState(0)
  const [success, setSuccess] = useState(false)

  // Fetch zones using React Query
  const {
    data: zonesResponse,
    isLoading: loadingZones,
    error: zonesError,
  } = useQuery({
    queryKey: ['zones', 'active'],
    queryFn: async () => {
      const response = await getAllZones({ isActive: true })
      return response
    },
  })

  const zones: Zone[] = zonesResponse?.data || []

  // Fetch draws using React Query
  const {
    data: draws,
    isLoading: loadingDraws,
    error: drawsError,
  } = useQuery({
    queryKey: ['draws'],
    queryFn: () => drawsApi.getAll(),
  })

  // Fetch next betting pool code
  const { data: nextCodeResponse } = useQuery({
    queryKey: ['betting-pools', 'next-code'],
    queryFn: getNextBettingPoolCode,
  })

  // Update form data when next code is available
  useEffect(() => {
    if (nextCodeResponse?.data) {
      setFormData((prev) => ({ ...prev, bettingPoolCode: nextCodeResponse.data }))
    }
  }, [nextCodeResponse])

  // Regenerate code when navigating back to page
  useEffect(() => {
    if (location.pathname === '/betting-pools/new') {
      queryClient.invalidateQueries({ queryKey: ['betting-pools', 'next-code'] })
    }
  }, [location.pathname, queryClient])

  // Create betting pool mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateBettingPoolWithConfigDto) => {
      const response = await createBettingPoolWithConfig(data)
      return response.data
    },
    onSuccess: async () => {
      setSuccess(true)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['betting-pools'] })
      queryClient.invalidateQueries({ queryKey: ['betting-pools', 'next-code'] })

      // Reset form with new code
      const newCodeResponse = await getNextBettingPoolCode()
      if (newCodeResponse?.data) {
        setFormData(getInitialFormData(newCodeResponse.data))
      } else {
        setFormData(getInitialFormData())
      }

      setActiveTab(0)
      setErrors({})

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    },
    onError: (error: any) => {
      console.error('Error creating betting pool:', error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear la banca. Por favor intente nuevamente.'
      setErrors({ submit: errorMessage })
    },
  })

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
      const target = e.target as HTMLInputElement
      const name = target.name
      const value = target.type === 'checkbox' ? target.checked : target.value

      if (!name) return

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }))
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value === '' && name === 'limitPreference' ? null : value,
      }))
    },
    [errors]
  )

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }, [])

  const copyScheduleToAll = useCallback((day: string) => {
    const inicioKey = `${day}Inicio` as keyof BettingPoolFormData
    const finKey = `${day}Fin` as keyof BettingPoolFormData

    setFormData((prev) => {
      const inicioValue = prev[inicioKey] as string
      const finValue = prev[finKey] as string

      return {
        ...prev,
        domingoInicio: inicioValue,
        domingoFin: finValue,
        lunesInicio: inicioValue,
        lunesFin: finValue,
        martesInicio: inicioValue,
        martesFin: finValue,
        miercolesInicio: inicioValue,
        miercolesFin: finValue,
        juevesInicio: inicioValue,
        juevesFin: finValue,
        viernesInicio: inicioValue,
        viernesFin: finValue,
        sabadoInicio: inicioValue,
        sabadoFin: finValue,
      }
    })
  }, [])

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.bettingPoolName.trim()) {
      newErrors.bettingPoolName = 'El nombre de la banca es requerido'
    }

    if (!formData.bettingPoolCode.trim()) {
      newErrors.bettingPoolCode = 'El código de la banca es requerido'
    }

    if (!formData.zoneId) {
      newErrors.zoneId = 'Debe seleccionar una zona'
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (formData.password && !formData.username) {
      newErrors.username = 'El usuario es requerido si se proporciona una contraseña'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      // Transform form data to API format
      const payload: CreateBettingPoolWithConfigDto = {
        bettingPoolName: formData.bettingPoolName,
        zoneId: parseInt(formData.zoneId),
        location: formData.location || null,
        reference: formData.reference || null,
        comment: formData.comment || null,
        username: formData.username || null,
        password: formData.password || null,
        isActive: formData.isActive,

        config: {
          fallType: formData.fallType as any,
          deactivationBalance: formData.deactivationBalance
            ? parseFloat(formData.deactivationBalance)
            : null,
          dailySaleLimit: formData.dailySaleLimit ? parseFloat(formData.dailySaleLimit) : null,
          dailyBalanceLimit: formData.dailyBalanceLimit
            ? parseFloat(formData.dailyBalanceLimit)
            : null,
          temporaryAdditionalBalance: formData.temporaryAdditionalBalance
            ? parseFloat(formData.temporaryAdditionalBalance)
            : null,
          enableTemporaryBalance: formData.enableTemporaryBalance,
          controlWinningTickets: formData.controlWinningTickets,
          allowJackpot: formData.allowJackpot,
          enableRecharges: formData.enableRecharges,
          allowPasswordChange: formData.allowPasswordChange,
          cancelMinutes: formData.minutesToCancelTicket
            ? parseInt(formData.minutesToCancelTicket)
            : 30,
          dailyCancelTickets: formData.ticketsToCancelPerDay
            ? parseInt(formData.ticketsToCancelPerDay)
            : null,
          maxCancelAmount: formData.maximumCancelTicketAmount ? parseFloat(formData.maximumCancelTicketAmount) : null,
          maxTicketAmount: formData.maxTicketAmount ? parseFloat(formData.maxTicketAmount) : null,
          maxDailyRecharge: formData.dailyPhoneRechargeLimit
            ? parseFloat(formData.dailyPhoneRechargeLimit)
            : null,
          paymentMode: formData.limitPreference as any,
        },

        printConfig: {
          printMode: formData.printerType as any,
          enablePrinting: formData.printEnabled,
          numberOfCopies: formData.printTicketCopy ? 2 : 1,
          printReceipts: formData.printRechargeReceipt,
          sendSMS: formData.smsOnly,
        },

        discountConfig: {
          providerMode: formData.discountProvider as any,
          discountMode: formData.discountMode as any,
        },

        footer: {
          useAutoFooter: formData.autoFooter,
          line1: formData.footerText1 || null,
          line2: formData.footerText2 || null,
          line3: formData.footerText3 || null,
          line4: formData.footerText4 || null,
        },
      }

      createMutation.mutate(payload)
    },
    [formData, validateForm, createMutation]
  )

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Form data
    formData,
    setFormData,

    // UI state
    errors,
    activeTab,
    success,
    loading: createMutation.isPending,
    loadingZones,
    loadingDraws,

    // Data
    zones,
    draws: draws || [],

    // Handlers
    handleChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll,
  }
}
