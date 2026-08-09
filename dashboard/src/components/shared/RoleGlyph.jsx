import { ROLE_ICONS, AGENT_ICONS, WEATHER_ICONS } from './icons'
import { CircleAlert } from 'lucide-react'

/* Render a role's mark. This is a component rather than a `roleIcon(id)` lookup
   returning a component, because assigning a component to a local inside render
   trips react-hooks/static-components — and the component form reads better at
   the call site anyway. */
export function RoleGlyph({ roleId, size = 14, strokeWidth = 2, ...rest }) {
  const Glyph = ROLE_ICONS[roleId] ?? CircleAlert
  return <Glyph size={size} strokeWidth={strokeWidth} {...rest} />
}

/* The five pipeline agents plus the handoff coordinator. */
export function AgentGlyph({ agentKey, size = 14, strokeWidth = 2, ...rest }) {
  const Glyph = AGENT_ICONS[agentKey] ?? CircleAlert
  return <Glyph size={size} strokeWidth={strokeWidth} {...rest} />
}

/* Forecast conditions, keyed by the condition string in mockData rather than by
   an icon field on the data — weather data should not carry presentation. */
export function WeatherGlyph({ condition, size = 16, strokeWidth = 1.75, ...rest }) {
  const Glyph = WEATHER_ICONS[condition] ?? CircleAlert
  return <Glyph size={size} strokeWidth={strokeWidth} {...rest} />
}
