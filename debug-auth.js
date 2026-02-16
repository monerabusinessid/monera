// Debug script untuk mengecek status authentication
// Jalankan di browser console: node debug-auth.js

console.log('=== DEBUG AUTH STATUS ===')

// Check cookies
console.log('1. Cookies:')
if (typeof document !== 'undefined') {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {})
  console.log('  - auth-token:', cookies['auth-token'] ? 'present' : 'missing')
  console.log('  - All cookies:', Object.keys(cookies))
} else {
  console.log('  - Running in Node.js, cannot check document.cookie')
}

// Check localStorage
console.log('2. LocalStorage:')
if (typeof localStorage !== 'undefined') {
  console.log('  - token:', localStorage.getItem('token') ? 'present' : 'missing')
  console.log('  - All keys:', Object.keys(localStorage))
} else {
  console.log('  - LocalStorage not available')
}

// Check sessionStorage
console.log('3. SessionStorage:')
if (typeof sessionStorage !== 'undefined') {
  console.log('  - oauth_user:', sessionStorage.getItem('oauth_user') ? 'present' : 'missing')
  console.log('  - All keys:', Object.keys(sessionStorage))
} else {
  console.log('  - SessionStorage not available')
}

// Test API endpoint
console.log('4. Testing /api/auth/me endpoint...')
if (typeof fetch !== 'undefined') {
  fetch('/api/auth/me', {
    credentials: 'include'
  })
  .then(response => {
    console.log('  - Status:', response.status)
    return response.json()
  })
  .then(data => {
    console.log('  - Response:', data)
    if (data.success && data.data) {
      console.log('  - User ID:', data.data.id)
      console.log('  - User Role:', data.data.role)
      console.log('  - User Email:', data.data.email)
    }
  })
  .catch(error => {
    console.log('  - Error:', error.message)
  })
} else {
  console.log('  - Fetch not available, cannot test API')
}

console.log('=== END DEBUG ===')