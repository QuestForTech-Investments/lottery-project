import { useState, useEffect, useRef } from 'react'
import '../assets/css/TimePicker.css'

interface TimePickerPosition {
  top: number
  left: number
}

interface TimePickerProps {
  value?: string
  onChange: (value: string) => void
  onClose: () => void
  position: TimePickerPosition
}

const TimePicker = ({ value, onChange, onClose, position }: TimePickerProps) => {
  const [selectedHour, setSelectedHour] = useState('12 AM')
  const [selectedMinute, setSelectedMinute] = useState('00')

  const pickerRef = useRef<HTMLDivElement | null>(null)
  const hourColumnRef = useRef<HTMLDivElement | null>(null)
  const minuteColumnRef = useRef<HTMLDivElement | null>(null)

  // Generate opciones de horas en formato "HH AM/PM"
  const generateHourOptions = () => {
    const hours: string[] = []

    // 12 AM
    hours.push('12 AM')

    // 01 AM - 11 AM
    for (let i = 1; i <= 11; i++) {
      hours.push(`${String(i).padStart(2, '0')} AM`)
    }

    // 12 PM
    hours.push('12 PM')

    // 01 PM - 11 PM
    for (let i = 1; i <= 11; i++) {
      hours.push(`${String(i).padStart(2, '0')} PM`)
    }

    return hours
  }

  // Generate opciones de minutos (00-59)
  const generateMinuteOptions = () => {
    const minutes: string[] = []
    for (let i = 0; i < 60; i++) {
      minutes.push(String(i).padStart(2, '0'))
    }
    return minutes
  }

  const hourOptions = generateHourOptions()
  const minuteOptions = generateMinuteOptions()

  useEffect(() => {
    // Parsear el valor actual para separar hora y minuto
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

  // Auto scroll to selected option
  useEffect(() => {
    if (hourColumnRef.current && selectedHour) {
      const selectedElement = hourColumnRef.current.querySelector<HTMLElement>('.timepicker-option.selected')
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
    if (minuteColumnRef.current && selectedMinute) {
      const selectedElement = minuteColumnRef.current.querySelector<HTMLElement>('.timepicker-option.selected')
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [selectedHour, selectedMinute])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (pickerRef.current && target && !pickerRef.current.contains(target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleConfirm = () => {
    // Construir el valor final: "HH:MM AM/PM"
    const [hour, period] = selectedHour.split(' ')
    const finalTime = `${hour}:${selectedMinute} ${period}`
    onChange(finalTime)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour)
  }

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute)
  }

  return (
    <div className="timepicker-overlay" onClick={onClose}>
      <div
        className="timepicker-container"
        ref={pickerRef}
        style={{
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="timepicker-two-columns">
          {/* Columna de Horas */}
          <div className="timepicker-column" ref={hourColumnRef}>
            {hourOptions.map((hour) => (
              <div
                key={hour}
                className={`timepicker-option ${selectedHour === hour ? 'selected' : ''}`}
                onClick={() => handleHourSelect(hour)}
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Columna de Minutos */}
          <div className="timepicker-column" ref={minuteColumnRef}>
            {minuteOptions.map((minute) => (
              <div
                key={minute}
                className={`timepicker-option ${selectedMinute === minute ? 'selected' : ''}`}
                onClick={() => handleMinuteSelect(minute)}
              >
                {minute}
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="timepicker-buttons">
          <button type="button" className="timepicker-button cancel" onClick={handleCancel}>
            cancel
          </button>
          <button type="button" className="timepicker-button confirm" onClick={handleConfirm}>
            confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimePicker
