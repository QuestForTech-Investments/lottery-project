import React, { useState, useRef, useEffect } from 'react'
import '../../assets/css/react-multiselect.css'

const LotteryMultiselect = ({
  lotteries = [],
  value = [],
  onChange,
  placeholder = "Seleccionar loterías...",
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredLotteries = lotteries.filter(lottery =>
    (lottery.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedLotteries = lotteries.filter(lottery => value.includes(lottery.id))

  const handleToggleLottery = (lotteryId) => {
    let newValue
    if (value.includes(lotteryId)) {
      newValue = value.filter(id => id !== lotteryId)
    } else {
      newValue = [...value, lotteryId]
    }
    onChange(newValue)
  }

  const handleRemoveLottery = (lotteryId, e) => {
    e.stopPropagation()
    const newValue = value.filter(id => id !== lotteryId)
    onChange(newValue)
  }

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const handleSelectAll = () => {
    const allLotteryIds = filteredLotteries.map(lottery => lottery.id)
    onChange(allLotteryIds)
  }

  const handleClearAll = () => {
    onChange([])
  }

  const isAllSelected = filteredLotteries.length > 0 && filteredLotteries.every(lottery => value.includes(lottery.id))
  const isSomeSelected = filteredLotteries.some(lottery => value.includes(lottery.id))

  return (
    <div className="react-multiselect-container" ref={dropdownRef}>
      <div
        className={`react-multiselect ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={handleToggleDropdown}
      >
        {/* Selected lotteries as tags */}
        <div className="react-multiselect__tags">
          {selectedLotteries.map(lottery => (
            <span key={lottery.id} className="react-multiselect__tag">
              <span className="react-multiselect__tag-text">
                {lottery.name}
              </span>
              <button
                type="button"
                className="react-multiselect__tag-remove"
                onClick={(e) => handleRemoveLottery(lottery.id, e)}
                disabled={disabled}
              >
                <i className="fas fa-times"></i>
              </button>
            </span>
          ))}

          {/* Search input */}
          <input
            ref={inputRef}
            type="text"
            className="react-multiselect__input"
            placeholder={selectedLotteries.length === 0 ? placeholder : ''}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>

        {/* Dropdown arrow */}
        <div className="react-multiselect__arrow">
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </div>
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div className="react-multiselect__content">
          {/* Action buttons */}
          {filteredLotteries.length > 0 && (
            <div className="react-multiselect__actions">
              <button
                type="button"
                className="react-multiselect__action-btn"
                onClick={handleSelectAll}
                disabled={isAllSelected}
              >
                <i className="fas fa-check-double"></i>
                {isAllSelected ? 'Todas seleccionadas' : 'Seleccionar todas'}
              </button>
              <button
                type="button"
                className="react-multiselect__action-btn"
                onClick={handleClearAll}
                disabled={!isSomeSelected}
              >
                <i className="fas fa-times"></i>
                Limpiar todo
              </button>
            </div>
          )}

          {filteredLotteries.length === 0 ? (
            <div className="react-multiselect__no-options">
              <i className="fas fa-search"></i>
              {searchTerm ? 'No se encontraron loterías' : 'No hay loterías disponibles'}
            </div>
          ) : (
            <ul className="react-multiselect__options">
              {filteredLotteries.map(lottery => (
                <li
                  key={lottery.id}
                  className={`react-multiselect__option ${
                    value.includes(lottery.id) ? 'is-selected' : ''
                  }`}
                  onClick={() => handleToggleLottery(lottery.id)}
                >
                  <div className="react-multiselect__option-content">
                    <div className="react-multiselect__option-title">
                      {lottery.name}
                    </div>
                  </div>
                  {value.includes(lottery.id) && (
                    <div className="react-multiselect__option-check">
                      <i className="fas fa-check"></i>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Summary */}
      {value.length > 0 && (
        <div className="react-multiselect__summary">
          <small className="text-muted">
            <i className="fas fa-info-circle"></i>
            {value.length} lotería{value.length !== 1 ? 's' : ''} seleccionada{value.length !== 1 ? 's' : ''}
          </small>
        </div>
      )}
    </div>
  )
}

export default LotteryMultiselect
