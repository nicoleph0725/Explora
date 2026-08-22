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

/**
 * Fetch all scrapbook journals for logged-in user
 * GET /journals/
 */
export async function getJournals() {
  const response = await api.get('/journals/')
  return response.data
}

/**
 * Fetch single journal with all pages
 * GET /journals/{journalId}
 */
export async function getJournal(journalId) {
  const response = await api.get(`/journals/${journalId}`)
  return response.data
}

/**
 * Create a new scrapbook journal
 * POST /journals/
 */
export async function createJournal(journalData) {
  const response = await api.post('/journals/', journalData)
  return response.data
}

/**
 * Update journal metadata (title, destination, description, cover)
 * PUT /journals/{journalId}
 */
export async function updateJournal(journalId, updateData) {
  const response = await api.put(`/journals/${journalId}`, updateData)
  return response.data
}

/**
 * Autosave & sync all pages + canvas elements to the database
 * PUT /journals/{journalId}/pages
 */
export async function saveJournalPages(journalId, { title, pages }) {
  const response = await api.put(`/journals/${journalId}/pages`, {
    title,
    pages,
  })
  return response.data
}

/**
 * Delete a journal
 * DELETE /journals/{journalId}
 */
export async function deleteJournal(journalId) {
  const response = await api.delete(`/journals/${journalId}`)
  return response.data
}

export default api
