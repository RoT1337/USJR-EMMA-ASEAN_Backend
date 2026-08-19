import { useState } from 'react'
import PhoneFrame from './components/PhoneFrame'
import Drawer from './components/Drawer'
import ChatScreen from './screens/ChatScreen'
import EvacuationScreen from './screens/EvacuationScreen'
import HomeScreen from './screens/HomeScreen'
import FamilyScreen from './screens/FamilyScreen'
import VolunteerScreen from './screens/VolunteerScreen'

/* One `screen` state variable — the same pattern the dashboard uses for roles.
   No router: this is a five-screen prototype, not an application.

   Nothing renders outside the handset. Navigation lives in the in-phone drawer,
   because a switcher bolted above the frame made this look like a prototype
   viewer rather than a phone. */

const VIEWS = {
  chat: ChatScreen,
  evac: EvacuationScreen,
  home: HomeScreen,
  family: FamilyScreen,
  volunteer: VolunteerScreen,
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const View = VIEWS[screen]

  return (
    <PhoneFrame>
      <View
        onNavigate={setScreen}
        onMenu={() => setMenuOpen(true)}
        onBack={() => setScreen('home')}
      />
      <Drawer
        open={menuOpen}
        current={screen}
        onNavigate={setScreen}
        onClose={() => setMenuOpen(false)}
      />
    </PhoneFrame>
  )
}
