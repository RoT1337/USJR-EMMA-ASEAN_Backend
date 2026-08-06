import { useState } from 'react'
import { ROLES, ROLE_MAP } from '../roles'

export default function LoginScreen({ onLogin }) {
  const [roleId, setRoleId] = useState('drrmo')
  const [username, setUsername] = useState(ROLE_MAP.drrmo.user)
  const [password, setPassword] = useState('emma2026')

  function pickRole(id) {
    setRoleId(id)
    setUsername(ROLE_MAP[id].user)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onLogin(roleId)
  }

  const role = ROLE_MAP[roleId]

  return (
    <div className="login-root">
      <div className="intro-bg-glow intro-bg-glow-1" />
      <div className="intro-bg-glow intro-bg-glow-2" />

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-head">
          <span className="app-logo">EMMA</span>
          <div className="login-badge">AAIH 2026 · ASEAN</div>
        </div>
        <div className="login-brand-sub">Evacuation Management &amp; Monitoring Assistants</div>

        <p className="login-lead">Sign in to your coordination dashboard.</p>

        {/* ── Credentials ─────────────────────────────────────── */}
        <div className="login-fields">
          <label className="login-field">
            <span className="login-label">Username</span>
            <input
              className="ops-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="login-field">
            <span className="login-label">Password</span>
            <input
              className="ops-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="off"
            />
          </label>
        </div>

        {/* ── Role selector ───────────────────────────────────── */}
        <span className="login-label login-label-block">Role</span>
        <div className="login-roles">
          {ROLES.map(r => {
            const active = r.id === roleId
            return (
              <button
                type="button"
                key={r.id}
                className={`login-role ${active ? 'login-role-active' : ''}`}
                style={active ? { borderColor: r.agent.accent, background: r.agent.accentBg } : undefined}
                onClick={() => pickRole(r.id)}
              >
                <span className="login-role-icon">{r.agent.icon}</span>
                <span className="login-role-body">
                  <span className="login-role-name">{r.name}</span>
                  <span className="login-role-org">{r.org}</span>
                </span>
                <span
                  className="login-role-tier"
                  style={active ? { color: r.agent.accent, borderColor: r.agent.accent } : undefined}
                >
                  {r.tier}
                </span>
              </button>
            )
          })}
        </div>

        <button className="login-submit" type="submit" style={{ background: role.agent.accent }}>
          Sign in as {role.name}
          <span className="intro-cta-arrow">→</span>
        </button>

        <div className="login-foot">
          Demonstration environment · University of San Jose-Recoletos
        </div>
      </form>
    </div>
  )
}
