import axios from 'axios'
import { ApiError } from '@/types'
import { isBackendResponse } from '@/services/response'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const API_ORIGIN = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Store the unauthorized handler so it can be removed
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function isForbiddenError(error: unknown): boolean {
  if (error instanceof Error && 'status' in error) {
    return (error as { status?: number }).status === 403
  }
  return false
}

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    if (
      response.config.responseType !== 'blob' &&
      isBackendResponse(response.data)
    ) {
      response.data = response.data.data
    }

    return response
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    if (status === 401) {
      localStorage.removeItem('token')
      if (unauthorizedHandler) {
        unauthorizedHandler()
      }
    }

    return Promise.reject(new ApiError(message, status || 500))
  }
)
