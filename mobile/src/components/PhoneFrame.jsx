import { Signal, Wifi, BatteryFull } from 'lucide-react'

/* A phone-shaped container so this reads as a handset the instant it hits a
   projector. 390x844 is iPhone logical resolution.

   Nothing is rendered around it — no caption, no chrome. The frame is the whole
   presentation surface. */

export default function PhoneFrame({ children }) {
  return (
    <div className="stage">
      <div className="phone">
        <div className="phone-screen">
          <div className="status-bar">
            <span className="status-time">9:41</span>
            <span className="status-icons">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <BatteryFull size={16} strokeWidth={2} />
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
