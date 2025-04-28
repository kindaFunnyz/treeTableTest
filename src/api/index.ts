import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Добавьте интерсепторы при необходимости
api.interceptors.request.use(
  (config) => {
    // Можно добавить токен авторизации и т.д.
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Обработка ошибок
    return Promise.reject(error)
  }
)

export default api
