/* Icon vocabulary — the maps only.
   Kept free of JSX so this file exports data, not components (fast refresh
   requires a module to be one or the other). The RoleGlyph component lives in
   RoleGlyph.jsx.

   Emoji were the previous iconography. They render differently on every OS and
   would not have matched the projector, so everything routes through lucide here
   instead. One module so the set stays consistent and swaps are a one-line edit.

   Sizes follow the type scale rather than being chosen per call site:
   12 for inline/table, 14 for chrome, 16 for panel headers. */

import {
  ShieldAlert, PackageCheck, Map, Target,
  Radio, Users, Boxes, Route, BarChart3, CheckSquare,
  CloudRain, CloudDrizzle, Cloud, CloudSun, Sun, Wind,
  ArrowUp, ArrowRight, Check, Pencil, X, TrendingUp, TrendingDown, Minus,
  ChevronRight, ChevronDown, Search, LogOut, CircleAlert,
} from 'lucide-react'

/* Role / local agent marks — EMMA-Warn, EMMA-Care, EMMA-Plan, ASEAN pipeline */
export const ROLE_ICONS = {
  drrmo: ShieldAlert,
  dswd:  PackageCheck,
  lgu:   Map,
  asean: Target,
}

/* The five ASEAN pipeline agents plus the handoff coordinator */
export const AGENT_ICONS = {
  intake:        Radio,
  vulnerability: Users,
  resource:      Boxes,
  routing:       Route,
  pattern:       BarChart3,
  handoff:       CheckSquare,
}

/* Forecast conditions, keyed by the `condition` string in mockData */
export const WEATHER_ICONS = {
  'Typhoon':       CloudRain,
  'Heavy rain':    CloudRain,
  'Rain showers':  CloudDrizzle,
  'Cloudy':        Cloud,
  'Partly cloudy': CloudSun,
  'Fair':          Sun,
  'Windy':         Wind,
}

export const UI_ICONS = {
  up: ArrowUp,
  right: ArrowRight,
  check: Check,
  edit: Pencil,
  reject: X,
  trendUp: TrendingUp,
  trendDown: TrendingDown,
  trendFlat: Minus,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  search: Search,
  signOut: LogOut,
  alert: CircleAlert,
}
