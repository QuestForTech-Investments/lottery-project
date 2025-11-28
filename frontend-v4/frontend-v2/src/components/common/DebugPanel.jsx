import React, { useState, useEffect } from 'react'
import { getLogs, clearLogs, exportLogs, getLogsSummary } from '@/utils/logger'

/**
 * Debug Panel Component
 * Shows real-time logs for debugging
 */
const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadLogs()
      const interval = setInterval(loadLogs, 1000)
      return () => clearInterval(interval)
    }
  }, [isOpen, filter])

  const loadLogs = () => {
    const allLogs = getLogs()
    const filteredLogs = filter === 'ALL' 
      ? allLogs 
      : allLogs.filter(log => log.level === filter)
    
    setLogs(filteredLogs.slice(-50).reverse()) // Show last 50 logs
    setSummary(getLogsSummary())
  }

  const handleClear = () => {
    if (window.confirm('¿Está seguro de eliminar todos los logs?')) {
      clearLogs()
      loadLogs()
    }
  }

  const getLevelColor = (level) => {
    const colors = {
      INFO: '#2196F3',
      SUCCESS: '#4CAF50',
      WARNING: '#FF9800',
      ERROR: '#F44336',
      DEBUG: '#9E9E9E'
    }
    return colors[level] || '#666'
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 9998,
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        🐛 Debug
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '600px',
      maxHeight: '500px',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      borderRadius: '8px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 15px',
        backgroundColor: '#252526',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>🐛 Debug Panel</span>
          {summary && (
            <span style={{ fontSize: '11px', color: '#888' }}>
              ({summary.total} logs)
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#d4d4d4',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 5px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Filters */}
      <div style={{
        padding: '10px 15px',
        backgroundColor: '#2d2d30',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center',
        borderBottom: '1px solid #333'
      }}>
        {['ALL', 'ERROR', 'WARNING', 'SUCCESS', 'INFO', 'DEBUG'].map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: filter === level ? '#0e639c' : '#3e3e42',
              color: 'white',
              fontWeight: filter === level ? 'bold' : 'normal'
            }}
          >
            {level}
            {summary && level !== 'ALL' && (
              <span style={{ marginLeft: '5px', opacity: 0.7 }}>
                ({summary.byLevel[level]})
              </span>
            )}
          </button>
        ))}
        <button
          onClick={handleClear}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#c73e1d',
            color: 'white',
            marginLeft: 'auto'
          }}
        >
          Clear
        </button>
        <button
          onClick={exportLogs}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#0e639c',
            color: 'white'
          }}
        >
          Export
        </button>
      </div>

      {/* Logs List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '10px 15px'
      }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            No logs available
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid #333'
              }}
            >
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: getLevelColor(log.level),
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>
                  {log.level}
                </span>
                <span style={{ color: '#888', fontSize: '10px', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span style={{ 
                  color: '#569cd6', 
                  fontWeight: 'bold',
                  fontSize: '11px'
                }}>
                  {log.category}
                </span>
              </div>
              <div style={{ 
                marginTop: '4px',
                marginLeft: '8px',
                color: '#d4d4d4',
                wordBreak: 'break-word'
              }}>
                {log.message}
              </div>
              {log.data && (
                <pre style={{
                  marginTop: '6px',
                  marginLeft: '8px',
                  padding: '8px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '4px',
                  fontSize: '10px',
                  overflow: 'auto',
                  maxHeight: '150px',
                  color: '#ce9178'
                }}>
                  {log.data}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DebugPanel

