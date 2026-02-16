// Script untuk membersihkan semua session dan storage
// Jalankan di browser console untuk membersihkan session yang bermasalah

console.log('=== CLEANING AUTH SESSION ===')

// Clear all cookies
if (typeof document !== 'undefined') {
  console.log('1. Clearing cookies...')
  const cookies = document.cookie.split(';')
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    document.cookie = `${name}=; path=/; domain=.localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
  })
  console.log('  ✅ Cookies cleared')
} else {
  console.log('  ❌ Cannot clear cookies (not in browser)')
}

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  console.log('2. Clearing localStorage...')
  localStorage.clear()
  console.log('  ✅ LocalStorage cleared')
} else {
  console.log('  ❌ LocalStorage not available')
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  console.log('3. Clearing sessionStorage...')
  sessionStorage.clear()
  console.log('  ✅ SessionStorage cleared')
} else {
  console.log('  ❌ SessionStorage not available')
}

// Call logout API
if (typeof fetch !== 'undefined') {
  console.log('4. Calling logout API...')
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  })
  .then(response => {
    console.log('  ✅ Logout API called, status:', response.status)
    console.log('5. Redirecting to login...')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  })
  .catch(error => {
    console.log('  ⚠️ Logout API error:', error.message)
    console.log('5. Redirecting to login anyway...')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  })
} else {
  console.log('  ❌ Cannot call logout API (fetch not available)')
}

console.log('=== CLEANUP COMPLETE ===')
console.log('You will be redirected to login page in 1 second...')