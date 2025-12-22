import { useState, useCallback, useMemo } from 'react'

const TIMEZONE_KEY = 'userTimezone'
const DEFAULT_TIMEZONE = 'America/Santo_Domingo'

/**
 * Hook for managing user timezone preferences and date/time formatting
 * Stores preference in localStorage, defaults to America/Santo_Domingo
 */
export function useTimezone() {
  const [timezone, setTimezoneState] = useState(() => {
    try {
      return localStorage.getItem(TIMEZONE_KEY) || DEFAULT_TIMEZONE
    } catch {
      return DEFAULT_TIMEZONE
    }
  })

  const setTimezone = useCallback((tz: string) => {
    try {
      localStorage.setItem(TIMEZONE_KEY, tz)
    } catch {
      // Ignore storage errors
    }
    setTimezoneState(tz)
  }, [])

  /**
   * Format a date as a date string (e.g., "14/12/2025")
   */
  const formatDate = useCallback(
    (date: string | Date) => {
      try {
        return new Intl.DateTimeFormat('es-ES', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(date))
      } catch {
        return String(date)
      }
    },
    [timezone],
  )

  /**
   * Format a date as a date+time string (e.g., "14/12/2025, 10:30")
   */
  const formatDateTime = useCallback(
    (date: string | Date) => {
      try {
        return new Intl.DateTimeFormat('es-ES', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(date))
      } catch {
        return String(date)
      }
    },
    [timezone],
  )

  /**
   * Format a date as a time string (e.g., "10:30")
   */
  const formatTime = useCallback(
    (date: string | Date) => {
      try {
        return new Intl.DateTimeFormat('es-ES', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(date))
      } catch {
        return String(date)
      }
    },
    [timezone],
  )

  /**
   * Format a date as full date+time with seconds (e.g., "14/12/2025, 10:30:45")
   */
  const formatFullDateTime = useCallback(
    (date: string | Date) => {
      try {
        return new Intl.DateTimeFormat('es-ES', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date(date))
      } catch {
        return String(date)
      }
    },
    [timezone],
  )

  /**
   * Get the current time in the selected timezone
   */
  const getCurrentTime = useCallback(() => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date())
  }, [timezone])

  /**
   * Get a friendly label for the current timezone
   */
  const timezoneLabel = useMemo(() => {
    // Extract city name from timezone (e.g., "America/Santo_Domingo" -> "Santo Domingo")
    const parts = timezone.split('/')
    const city = parts[parts.length - 1].replace(/_/g, ' ')
    return city
  }, [timezone])

  return {
    timezone,
    setTimezone,
    formatDate,
    formatDateTime,
    formatTime,
    formatFullDateTime,
    getCurrentTime,
    timezoneLabel,
    DEFAULT_TIMEZONE,
  }
}

/**
 * Get all available timezones, grouped by region
 */
export function getTimezoneOptions() {
  try {
    const timezones = Intl.supportedValuesOf('timeZone')
    const grouped: Record<string, { value: string; label: string }[]> = {}

    for (const tz of timezones) {
      const [region, ...rest] = tz.split('/')
      const city = rest.join('/').replace(/_/g, ' ')

      if (!grouped[region]) {
        grouped[region] = []
      }

      grouped[region].push({
        value: tz,
        label: city || tz,
      })
    }

    return grouped
  } catch {
    // Fallback for older browsers
    return {
      America: [
        { value: 'America/Santo_Domingo', label: 'Santo Domingo' },
        { value: 'America/New_York', label: 'New York' },
        { value: 'America/Chicago', label: 'Chicago' },
        { value: 'America/Denver', label: 'Denver' },
        { value: 'America/Los_Angeles', label: 'Los Angeles' },
        { value: 'America/Mexico_City', label: 'Mexico City' },
        { value: 'America/Bogota', label: 'Bogota' },
        { value: 'America/Lima', label: 'Lima' },
        { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
        { value: 'America/Sao_Paulo', label: 'Sao Paulo' },
      ],
      Europe: [
        { value: 'Europe/London', label: 'London' },
        { value: 'Europe/Paris', label: 'Paris' },
        { value: 'Europe/Madrid', label: 'Madrid' },
        { value: 'Europe/Berlin', label: 'Berlin' },
        { value: 'Europe/Rome', label: 'Rome' },
      ],
      Asia: [
        { value: 'Asia/Tokyo', label: 'Tokyo' },
        { value: 'Asia/Shanghai', label: 'Shanghai' },
        { value: 'Asia/Dubai', label: 'Dubai' },
        { value: 'Asia/Singapore', label: 'Singapore' },
      ],
      UTC: [{ value: 'UTC', label: 'UTC' }],
    }
  }
}

/**
 * Get a flat list of all timezone options for autocomplete
 */
export function getAllTimezones(): { value: string; label: string; region: string }[] {
  const grouped = getTimezoneOptions()
  const result: { value: string; label: string; region: string }[] = []

  for (const [region, timezones] of Object.entries(grouped)) {
    for (const tz of timezones) {
      result.push({
        ...tz,
        region,
      })
    }
  }

  return result.sort((a, b) => a.value.localeCompare(b.value))
}
