import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { tokenStorage } from '~/lib/tokenStorage.js'

const KEY = 'auth.token'

afterEach(() => {
  vi.unstubAllGlobals()
})

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('tokenStorage', () => {
  it('returns null when empty', () => {
    expect(tokenStorage.get()).toBeNull()
    expect(tokenStorage.isRemembered()).toBe(false)
  })

  it('remember=true uses localStorage', () => {
    tokenStorage.set('a', true)
    expect(localStorage.getItem(KEY)).toBe('a')
    expect(sessionStorage.getItem(KEY)).toBeNull()
    expect(tokenStorage.get()).toBe('a')
    expect(tokenStorage.isRemembered()).toBe(true)
  })

  it('default uses sessionStorage', () => {
    tokenStorage.set('b')
    expect(sessionStorage.getItem(KEY)).toBe('b')
    expect(localStorage.getItem(KEY)).toBeNull()
    expect(tokenStorage.get()).toBe('b')
    expect(tokenStorage.isRemembered()).toBe(false)
  })

  it('set replaces a token stored in the other storage', () => {
    tokenStorage.set('a', true)
    tokenStorage.set('b', false)
    expect(localStorage.getItem(KEY)).toBeNull()
    expect(tokenStorage.get()).toBe('b')
  })

  it('clear removes both', () => {
    localStorage.setItem(KEY, 'x')
    sessionStorage.setItem(KEY, 'y')
    tokenStorage.clear()
    expect(tokenStorage.get()).toBeNull()
  })

  it('does not throw when storage is unavailable (private mode)', () => {
    const boom = () => { throw new Error('SecurityError') }
    const broken = { getItem: boom, setItem: boom, removeItem: boom }
    vi.stubGlobal('localStorage', broken)
    vi.stubGlobal('sessionStorage', broken)
    expect(() => tokenStorage.set('a', true)).not.toThrow()
    expect(tokenStorage.get()).toBeNull()
    expect(tokenStorage.isRemembered()).toBe(false)
    expect(() => tokenStorage.clear()).not.toThrow()
  })
})
