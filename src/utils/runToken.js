// getRandomValues remains available on HTTP origins where randomUUID is absent.
// This opaque channel token must use secure randomness, never Math.random.
export function createRunToken(cryptoSource = globalThis.crypto) {
  if (typeof cryptoSource?.getRandomValues !== 'function') {
    throw new Error('Secure random numbers are unavailable')
  }
  const bytes = new Uint8Array(16)
  cryptoSource.getRandomValues(bytes)
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
}
