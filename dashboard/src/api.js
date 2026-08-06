/* ─────────────────────────────────────────────────────────────────────────────
   API layer — the only place the dashboard talks to a backend.

   Two services:
     laravel  :8000  — situation reports, audit log
     agents   :8001  — the five-agent LangGraph pipeline

   Built for live-demo debugging. When something breaks on stage you need to know
   WHICH service, at WHAT url, and WHY, without reading a stack trace:

     · every request/response is logged with timing and a service tag
     · failures are normalised into a message that names the service and the fix
     · window.EMMA.probe() in the browser console pings both services at once

   The four exported call signatures are unchanged from the original — views that
   use them need no edits.
   ──────────────────────────────────────────────────────────────────────────── */

import axios from 'axios'

const LARAVEL_URL = import.meta.env.VITE_LARAVEL_BASE_URL   ?? 'http://localhost:8000'
const AGENTS_URL  = import.meta.env.VITE_PYTHON_SERVICE_URL ?? 'http://localhost:8001'

/* Agent calls run a 5-agent LLM pipeline — they legitimately take a while. */
const TIMEOUTS = { laravel: 15_000, agents: 120_000 }

/* On in dev by default; set VITE_DEBUG_API=false to silence. */
const DEBUG = (import.meta.env.VITE_DEBUG_API ?? String(import.meta.env.DEV)) !== 'false'

const laravel = axios.create({ baseURL: LARAVEL_URL, timeout: TIMEOUTS.laravel })
const agents  = axios.create({ baseURL: AGENTS_URL,  timeout: TIMEOUTS.agents  })

/* ── Logging + error normalisation ────────────────────────────────────────── */

const TAG = { laravel: ['laravel', '#7C3AED'], agents: ['agents ', '#0284C7'] }

function attach(client, service) {
  const [label, color] = TAG[service]

  client.interceptors.request.use(config => {
    config.meta = { startedAt: performance.now() }
    if (DEBUG) {
      console.log(
        `%c[${label}]%c → ${config.method.toUpperCase()} ${config.url}`,
        `color:${color};font-weight:700`, 'color:inherit',
        config.data ?? '',
      )
    }
    return config
  })

  client.interceptors.response.use(
    res => {
      const ms = Math.round(performance.now() - res.config.meta.startedAt)
      if (DEBUG) {
        console.log(
          `%c[${label}]%c ← ${res.status} ${res.config.url} %c${ms}ms`,
          `color:${color};font-weight:700`, 'color:inherit', 'color:#8FA3BA',
          res.data,
        )
      }
      return res
    },
    err => Promise.reject(normalise(err, service)),
  )
}

/* Turns an axios error into one that says which service failed and what to do
   about it. Keeps err.response intact so existing `err.response?.data?.message`
   handling still works. */
function normalise(err, service) {
  const url  = `${service === 'laravel' ? LARAVEL_URL : AGENTS_URL}${err.config?.url ?? ''}`
  const port = service === 'laravel' ? '8000' : '8001'
  const ms   = err.config?.meta ? Math.round(performance.now() - err.config.meta.startedAt) : null

  let message
  if (err.code === 'ECONNABORTED') {
    message = `${service} timed out after ${ms}ms — ${url}`
  } else if (err.code === 'ERR_NETWORK' || !err.response) {
    message = `cannot reach ${service} at ${url} — is the service running on :${port}? (also check CORS)`
  } else {
    const body = err.response.data
    const detail = body?.message ?? body?.detail ?? err.response.statusText
    message = `${service} returned ${err.response.status} — ${detail} (${url})`
  }

  if (DEBUG) {
    console.error(`%c[${TAG[service][0]}]%c ✗ ${message}`, `color:#DC2626;font-weight:700`, 'color:inherit', err)
  }

  err.service = service
  err.url = url
  err.status = err.response?.status ?? null
  err.message = message
  return err
}

attach(laravel, 'laravel')
attach(agents, 'agents')

/* ── Calls ────────────────────────────────────────────────────────────────── */

export async function checkHealth() {
  const res = await agents.get('/health')
  return res.data
}

export async function createSituationReport(payload) {
  const res = await laravel.post('/api/situation-reports', payload)
  return res.data
}

export async function processReport(payload) {
  const res = await agents.post('/process', payload)
  return res.data
}

export async function logDecision(payload) {
  const res = await laravel.post('/api/agent-logs', payload)
  return res.data
}

/* ── Pre-flight probe ─────────────────────────────────────────────────────── */

/* Pings both services and reports reachability + latency. Run this before going
   on stage — the health banner only covers the agent service, so a dead Laravel
   would otherwise surface mid-demo on the first submit.

   Any HTTP status counts as reachable: a 404 still proves the server answered.

   Laravel is probed on a real API route rather than `/` — the welcome page can
   500 for reasons that have nothing to do with the endpoints we call, which reads
   as a failure when nothing is actually wrong. */
export async function probeConnections() {
  const targets = [
    { service: 'laravel', url: `${LARAVEL_URL}/api/families`, note: 'situation reports + audit log' },
    { service: 'agents',  url: `${AGENTS_URL}/health`,        note: '5-agent pipeline' },
  ]

  const results = await Promise.all(targets.map(async t => {
    const started = performance.now()
    try {
      const res = await axios.get(t.url, { timeout: 5000, validateStatus: () => true })
      return { ...t, ok: true, status: res.status, ms: Math.round(performance.now() - started) }
    } catch (err) {
      return { ...t, ok: false, status: null, ms: Math.round(performance.now() - started), error: err.code ?? err.message }
    }
  }))

  console.table(results.map(r => ({
    service: r.service,
    reachable: r.ok ? 'yes' : 'NO',
    status: r.status ?? '—',
    ms: r.ms,
    url: r.url,
    problem: r.ok ? '' : r.error,
  })))

  return results
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.EMMA = {
    probe: probeConnections,
    urls: { laravel: LARAVEL_URL, agents: AGENTS_URL },
  }
  console.log(
    '%c[EMMA]%c backend debug ready — run window.EMMA.probe() to ping both services',
    'color:#EA580C;font-weight:700', 'color:#8FA3BA',
  )
}
