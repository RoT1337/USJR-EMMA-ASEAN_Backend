import { useState } from 'react'
import { ROLE_MAP } from './roles'
import LoginScreen from './components/LoginScreen'
import DrrmoView from './views/DrrmoView'
import DswdView from './views/DswdView'
import LguView from './views/LguView'
import AseanView from './views/AseanView'

const VIEWS = {
  drrmo: DrrmoView,
  dswd:  DswdView,
  lgu:   LguView,
  asean: AseanView,
}

function App() {
  /* null = signed out. Role state is the router — no URL routing needed for the demo. */
  const [roleId, setRoleId] = useState(null)

  if (!roleId) {
    return <LoginScreen onLogin={setRoleId} />
  }

  const role = ROLE_MAP[roleId]
  const View = VIEWS[roleId]

  /* keyed on roleId so switching roles remounts the view with clean state */
  return <View key={roleId} role={role} onSwitchRole={() => setRoleId(null)} />
}

export default App
