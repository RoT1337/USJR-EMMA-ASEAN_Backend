import { useState } from 'react'
import { ROLE_MAP } from './roles'
import LoginScreen from './components/LoginScreen'
import DrrmoView from './views/DrrmoView'
import DswdView from './views/DswdView'
import LguView from './views/LguView'
import AseanView from './views/AseanView'
import ArchitectureView from './views/ArchitectureView'

const VIEWS = {
  drrmo: DrrmoView,
  dswd:  DswdView,
  lgu:   LguView,
  asean: AseanView,
}

/* ?view=architecture renders the standalone diagram for the 0:15 segment. Kept
   out of the role router because it is a presentation asset, not a seat. */
const isArchitecture = () =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('view') === 'architecture'

function App() {
  /* null = signed out. Role state is the router — no URL routing needed for the demo. */
  const [roleId, setRoleId] = useState(null)

  /* Phase 4: the escalation payload the LGU hands upward. Lifted here so it
     survives the role switch. Demo state, not workflow state. */
  const [escalation, setEscalation] = useState(null)

  /* Which seats have been opened this session, and which one was open last.
     Two jobs: the login screen returns you to what you had open instead of
     resetting to DRRMO, and the reporting chain remembers seats you already
     visited so walking back a tier does not un-fill the strip. */
  const [visited, setVisited] = useState([])
  const [lastRole, setLastRole] = useState(null)

  function openRole(id) {
    setRoleId(id)
    setVisited(prev => (prev.includes(id) ? prev : [...prev, id]))
  }

  if (isArchitecture()) return <ArchitectureView />

  if (!roleId) {
    return <LoginScreen onLogin={openRole} visited={visited} initialRole={lastRole} />
  }

  const role = ROLE_MAP[roleId]
  const View = VIEWS[roleId]

  /* Submitting the SITREP carries it up the chain and moves the operator with it. */
  function handleEscalate(payload) {
    setEscalation(payload)
    openRole('asean')
  }

  function handleSwitchRole() {
    setLastRole(roleId)
    setRoleId(null)
  }

  /* Keyed on roleId so switching roles remounts the view with clean state.
     Escalation and visited deliberately live outside that key. */
  return (
    <View
      key={roleId}
      role={role}
      onSwitchRole={handleSwitchRole}
      escalation={escalation}
      onEscalate={handleEscalate}
      visited={visited}
    />
  )
}

export default App
