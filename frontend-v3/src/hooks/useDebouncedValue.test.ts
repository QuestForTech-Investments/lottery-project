import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('test', 500))
    expect(result.current).toBe('test')
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated' })
    expect(result.current).toBe('initial') // Still old value

    // Fast forward time
    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(result.current).toBe('updated') // Now updated
    })
  })

  it('should reset debounce timer on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } }
    )

    // Rapid changes (typing)
    rerender({ value: 'a' })
    vi.advanceTimersByTime(100)
    rerender({ value: 'ab' })
    vi.advanceTimersByTime(100)
    rerender({ value: 'abc' })

    // Value should still be initial (debounce not completed)
    expect(result.current).toBe('initial')

    // Wait full debounce time from last change
    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(result.current).toBe('abc')
    })
  })

  it('should use custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 1000), // 1 second
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    // After 500ms, should still be old value
    vi.advanceTimersByTime(500)
    expect(result.current).toBe('initial')

    // After 1000ms total, should be updated
    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })
})
