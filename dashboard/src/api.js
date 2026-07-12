import axios from 'axios'

const laravel = axios.create({
  baseURL: import.meta.env.VITE_LARAVEL_BASE_URL ?? 'http://localhost:8000',
})

const python = axios.create({
  baseURL: import.meta.env.VITE_PYTHON_SERVICE_URL ?? 'http://localhost:8001',
})

export async function checkHealth() {
  const res = await python.get('/health')
  return res.data
}

export async function createSituationReport(payload) {
  const res = await laravel.post('/api/situation-reports', payload)
  return res.data
}

export async function processReport(payload) {
  const res = await python.post('/process', payload)
  return res.data
}

export async function logDecision(payload) {
  const res = await laravel.post('/api/agent-logs', payload)
  return res.data
}
