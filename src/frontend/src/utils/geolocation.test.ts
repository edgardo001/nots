import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentPosition } from './geolocation'

function mockGeolocation(impl: typeof navigator.geolocation) {
  Object.defineProperty(navigator, 'geolocation', {
    value: impl,
    configurable: true,
    writable: true,
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getCurrentPosition', () => {
  it('returns position when geolocation succeeds', async () => {
    mockGeolocation({
      getCurrentPosition(success: PositionCallback) {
        success({ coords: { latitude: 19.4326, longitude: -99.1332 } } as GeolocationPosition)
      },
    } as Geolocation)

    const result = await getCurrentPosition()
    expect(result).toEqual({ lat: 19.4326, lng: -99.1332 })
  })

  it('returns null when permission is denied', async () => {
    mockGeolocation({
      getCurrentPosition(_success: PositionCallback, error?: PositionErrorCallback | null) {
        error?.(new GeolocationPositionError())
      },
    } as Geolocation)

    const result = await getCurrentPosition()
    expect(result).toBeNull()
  })

  it('returns null when geolocation is not available', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    })

    const result = await getCurrentPosition()
    expect(result).toBeNull()
  })

  it('returns null on timeout', async () => {
    mockGeolocation({
      getCurrentPosition(_success: PositionCallback, error?: PositionErrorCallback | null) {
        const err = { code: 3, message: 'Timeout', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError
        error?.(err)
      },
    } as Geolocation)

    const result = await getCurrentPosition(1)
    expect(result).toBeNull()
  })
})
