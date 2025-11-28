/**
 * TimePickerMUI Component
 * Material-UI compatible time picker dropdown
 * Two-column design: Hours and Minutes
 * Displays times in 12-hour format with AM/PM
 * TypeScript version with full type safety
 */

import React, { useState, useEffect, useRef } from 'react'
import { Box, Paper, List, ListItemButton, Button, ClickAwayListener } from '@mui/material'

interface TimePickerMUIProps {
  value: string
  onChange: (value: string) => void
  onClose: () => void
  anchorEl: HTMLElement | null
}

interface HourOption {
  display: string
  hour24: number
}

const TimePickerMUI: React.FC<TimePickerMUIProps> = ({ value, onChange, onClose, anchorEl }) => {
  const [selectedHour, setSelectedHour] = useState('12 AM')
  const [selectedMinute, setSelectedMinute] = useState('00')

  const hourListRef = useRef<HTMLUListElement>(null)
  const minuteListRef = useRef<HTMLUListElement>(null)

  // Generate hour options in 12-hour format
  const generateHourOptions = (): HourOption[] => {
    const hours: HourOption[] = []

    // 12 AM
    hours.push({ display: '12 AM', hour24: 0 })

    // 01 AM - 11 AM
    for (let i = 1; i <= 11; i++) {
      hours.push({
        display: `${String(i).padStart(2, '0')} AM`,
        hour24: i,
      })
    }

    // 12 PM
    hours.push({ display: '12 PM', hour24: 12 })

    // 01 PM - 11 PM
    for (let i = 1; i <= 11; i++) {
      hours.push({
        display: `${String(i).padStart(2, '0')} PM`,
        hour24: i + 12,
      })
    }

    return hours
  }

  // Generate minute options (00-59)
  const generateMinuteOptions = (): string[] => {
    const minutes: string[] = []
    for (let i = 0; i < 60; i++) {
      minutes.push(String(i).padStart(2, '0'))
    }
    return minutes
  }

  const hourOptions = generateHourOptions()
  const minuteOptions = generateMinuteOptions()

  useEffect(() => {
    // Parse 12-hour format with AM/PM (e.g., "02:30 PM")
    if (value) {
      const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
      if (match) {
        const hour = match[1].padStart(2, '0')
        const minute = match[2]
        const period = match[3].toUpperCase()
        setSelectedHour(`${hour} ${period}`)
        setSelectedMinute(minute)
      }
    }
  }, [value])

  // Scroll to selected items on mount
  useEffect(() => {
    if (hourListRef.current && selectedHour) {
      const selectedIndex = hourOptions.findIndex((h) => h.display === selectedHour)
      if (selectedIndex !== -1) {
        const listItem = hourListRef.current.children[selectedIndex] as HTMLElement
        if (listItem) {
          listItem.scrollIntoView({ block: 'center', behavior: 'auto' })
        }
      }
    }

    if (minuteListRef.current && selectedMinute) {
      const selectedIndex = minuteOptions.findIndex((m) => m === selectedMinute)
      if (selectedIndex !== -1) {
        const listItem = minuteListRef.current.children[selectedIndex] as HTMLElement
        if (listItem) {
          listItem.scrollIntoView({ block: 'center', behavior: 'auto' })
        }
      }
    }
  }, [])

  // Close picker when scrolling anywhere in the page (except inside the picker itself)
  useEffect(() => {
    const handleScroll = (event: Event) => {
      // Don't close if scrolling inside the picker's lists
      if (
        hourListRef.current?.contains(event.target as Node) ||
        minuteListRef.current?.contains(event.target as Node)
      ) {
        return
      }
      onClose()
    }

    // Listen to scroll events on window and any scrollable containers
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  const handleHourSelect = (hourOption: HourOption) => {
    setSelectedHour(hourOption.display)
  }

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute)
  }

  const handleConfirm = () => {
    const selectedHourObj = hourOptions.find((h) => h.display === selectedHour)
    if (selectedHourObj) {
      // Return 12-hour format with AM/PM (e.g., "02:30 PM")
      const [hour, period] = selectedHour.split(' ')
      const finalTime = `${hour}:${selectedMinute} ${period}`
      onChange(finalTime)
    }
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  // Calculate position based on anchor element
  const getPosition = () => {
    if (!anchorEl) return { top: 100, left: 100 }

    const rect = anchorEl.getBoundingClientRect()
    return {
      top: rect.bottom + 4, // 4px gap below the input
      left: rect.left,
    }
  }

  const position = getPosition()

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: 220,
          maxHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1300,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
          {/* Hour Column */}
          <List
            ref={hourListRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 0,
              maxHeight: 320,
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-track': {
                background: '#f5f5f5',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c0c0c0',
                borderRadius: 3,
                '&:hover': {
                  background: '#909090',
                },
              },
            }}
          >
            {hourOptions.map((hourOption) => (
              <ListItemButton
                key={hourOption.display}
                selected={selectedHour === hourOption.display}
                onClick={() => handleHourSelect(hourOption)}
                sx={{
                  py: 1,
                  px: 1.5,
                  justifyContent: 'center',
                  fontSize: '13px',
                  minHeight: 36,
                  '&.Mui-selected': {
                    backgroundColor: '#51cbce',
                    color: 'white',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#45b8bb',
                    },
                  },
                }}
              >
                {hourOption.display}
              </ListItemButton>
            ))}
          </List>

          {/* Minute Column */}
          <List
            ref={minuteListRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 0,
              maxHeight: 320,
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-track': {
                background: '#f5f5f5',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c0c0c0',
                borderRadius: 3,
                '&:hover': {
                  background: '#909090',
                },
              },
            }}
          >
            {minuteOptions.map((minute) => (
              <ListItemButton
                key={minute}
                selected={selectedMinute === minute}
                onClick={() => handleMinuteSelect(minute)}
                sx={{
                  py: 1,
                  px: 1.5,
                  justifyContent: 'center',
                  fontSize: '13px',
                  minHeight: 36,
                  '&.Mui-selected': {
                    backgroundColor: '#51cbce',
                    color: 'white',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#45b8bb',
                    },
                  },
                }}
              >
                {minute}
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            p: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: '#fafafa',
          }}
        >
          <Button
            size="small"
            onClick={handleCancel}
            sx={{
              textTransform: 'lowercase',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            cancelar
          </Button>
          <Button
            size="small"
            onClick={handleConfirm}
            sx={{
              textTransform: 'lowercase',
              color: '#51cbce',
              fontWeight: 600,
            }}
          >
            confirmar
          </Button>
        </Box>
      </Paper>
    </ClickAwayListener>
  )
}

export default TimePickerMUI
