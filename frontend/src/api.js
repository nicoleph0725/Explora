import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

// Automatically attach Authorization Header if token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Sign Up a new user
 * POST /auth/signup
 */
export async function signUpUser(fullName, email, password) {
  const response = await api.post('/auth/signup', {
    full_name: fullName,
    email: email,
    password: password,
  })
  return response.data
}

/**
 * Log In an existing user
 * POST /auth/token (OAuth2 form-urlencoded format)
 */
export async function loginUser(email, password) {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)

  const response = await api.post('/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.data
}

/**
 * Fetch currently logged in user profile
 * GET /auth/users/me/
 */
export async function getCurrentUser() {
  const response = await api.get('/auth/users/me/')
  return response.data
}

export default api
