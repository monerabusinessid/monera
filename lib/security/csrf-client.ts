'use client'

// Client-side CSRF token helper
// This fetches the CSRF token from the server and includes it in requests

let csrfToken: string | null = null
let tokenPromise: Promise<string> | null = null

export async function getCSRFToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken
  }

  // Return existing promise if already fetching
  if (tokenPromise) {
    return tokenPromise
  }

  // Fetch new token
  tokenPromise = fetch('/api/csrf-token', {
    credentials: 'include',
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.token) {
        csrfToken = data.token
        return data.token
      }
      throw new Error('Failed to get CSRF token')
    })
    .finally(() => {
      tokenPromise = null
    })

  return tokenPromise
}

export function getCSRFTokenSync(): string | null {
  return csrfToken
}

export function clearCSRFToken(): void {
  csrfToken = null
  tokenPromise = null
}
