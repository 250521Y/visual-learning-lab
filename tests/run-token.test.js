import test from 'node:test'
import assert from 'node:assert/strict'
import { createRunToken } from '../src/utils/runToken.js'

test('preview tokens use 16 random bytes without depending on randomUUID', () => {
  const cryptoSource = {
    getRandomValues(bytes) {
      assert.equal(this, cryptoSource)
      assert.ok(bytes instanceof Uint8Array)
      assert.equal(bytes.length, 16)
      bytes.forEach((_, index) => (bytes[index] = index))
      return bytes
    },
    randomUUID() {
      throw new Error('randomUUID must not be called')
    }
  }
  assert.equal(createRunToken(cryptoSource), '000102030405060708090a0b0c0d0e0f')
})

test('each preview token requests fresh random bytes', () => {
  let calls = 0
  const cryptoSource = { getRandomValues: (bytes) => bytes.fill(++calls) }
  assert.equal(createRunToken(cryptoSource), '01'.repeat(16))
  assert.equal(createRunToken(cryptoSource), '02'.repeat(16))
  assert.equal(calls, 2)
})

test('unavailable secure randomness is rejected instead of using a weak fallback', () => {
  for (const cryptoSource of [null, {}, { getRandomValues: 'unavailable' }]) {
    assert.throws(() => createRunToken(cryptoSource), /Secure random numbers are unavailable/)
  }
})

test('random-source failures propagate so the workbench can show an error', () => {
  const error = new Error('Random source failed')
  assert.throws(
    () =>
      createRunToken({
        getRandomValues: () => {
          throw error
        }
      }),
    (actual) => actual === error
  )
})
