import { describe, it, expect } from 'vitest'
import apiClient from '@/lib/api-client'

/**
 * Signature Feature Test
 *
 * To run this test, ensure your local backend is running at http://localhost:3000
 * and it has implemented the signature verification logic.
 */
describe.skip('API Signature Feature Test (Live)', () => {
  const TEST_ENDPOINT = '/api/test/signature'

  it('successfully sends a signed GET request', async () => {
    try {
      const response = await apiClient.get(TEST_ENDPOINT)

      // If the signature is correct, the backend should return 200
      expect(response.status).toBe(200)
      expect(response.data.message).toContain('verification successful')
      expect(response.data.data.method).toBe('GET')

      console.log('✅ Signed GET verification successful:', response.data)
    } catch (error: any) {
      if (error.response) {
        console.error(
          '❌ GET failed with status:',
          error.response.status,
          error.response.data,
        )
        throw new Error(
          `GET failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        )
      } else {
        console.error('❌ GET failed to connect:', error.message)
        throw error
      }
    }
  })

  it('successfully sends a signed POST request with body', async () => {
    const testData = {
      test: 'ping',
      timestamp: Date.now(),
      nested: {
        foo: 'bar',
      },
    }

    try {
      const response = await apiClient.post(TEST_ENDPOINT, testData)

      // If the signature is correct, the backend should return 200
      expect(response.status).toBe(200)
      expect(response.data.message).toContain('verification successful')
      expect(response.data.data.method).toBe('POST')

      console.log('✅ Signed POST verification successful:', response.data)
    } catch (error: any) {
      if (error.response) {
        console.error(
          '❌ POST failed with status:',
          error.response.status,
          error.response.data,
        )
        throw new Error(
          `POST failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        )
      } else {
        console.error('❌ POST failed to connect:', error.message)
        throw error
      }
    }
  })

  it('successfully sends a signed GET request with query parameters', async () => {
    const params = {
      id: 123,
      sort: 'name',
      order: 'asc',
      filter: 'active',
    }

    try {
      const response = await apiClient.get(TEST_ENDPOINT, { params })

      // If the signature is correct, the backend should return 200
      expect(response.status).toBe(200)
      expect(response.data.message).toContain('verification successful')
      expect(response.data.data.method).toBe('GET')

      console.log(
        '✅ Signed GET (with params) verification successful:',
        response.data,
      )
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status
        const data = error.response.data
        console.error('❌ GET with params failed with status:', status, data)

        // If it's a signature error, log the backend URL for comparison
        throw new Error(
          `GET with params failed: ${status} - ${JSON.stringify(data)}`,
        )
      } else {
        console.error('❌ GET with params failed to connect:', error.message)
        throw error
      }
    }
  })
})
