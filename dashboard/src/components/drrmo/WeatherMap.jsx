import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* Live weather overlay for the DRRMO view.

   OpenWeatherMap tile layers straight over an OSM base map — no proxy, no backend.
   The key is a third-party CDN credential in VITE_OPENWEATHER_API_KEY, not one of
   our services, so this does not violate the "no backend calls in local views" rule.

   Markers are divIcons rather than Leaflet's default PNG pins: the default icon
   URLs break under bundlers, and this way the pin colour can encode occupancy. */

const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

/* Basemap is CartoDB Dark Matter. OpenWeatherMap's raster tiles are pale, low
   contrast, and semi-transparent — on a light basemap (OSM or Positron) they wash
   out to near-invisible, which is the "map looks broken" problem. On a dark
   basemap the same tiles glow, which is exactly why every radar and ops weather
   display is dark. This is a map surface, not UI chrome, so it does not conflict
   with the light design system around it. No key needed. */
const BASEMAP = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
}

/* Ordered by how reliably they show SOMETHING, because an empty overlay reads as
   a broken map even when it is behaving correctly:
     clouds  — cloud cover exists essentially always
     temp    — a full colour field over every pixel, never blank
     wind    — near-always present offshore
     rain    — the most on-narrative, but blank when it is not raining
   Default is clouds, not rain, for that reason. */
const LAYERS = [
  { id: 'clouds_new',        label: 'Clouds' },
  { id: 'temp_new',          label: 'Temp' },
  { id: 'wind_new',          label: 'Wind' },
  { id: 'precipitation_new', label: 'Rain' },
]

/* OpenWeatherMap tiles are a coarse global raster. Past roughly zoom 8 a single
   tile covers the whole viewport, so it renders as flat colour or nothing at all
   — which is why the overlay looks dead at barangay zoom. Default scope is
   therefore Philippines, where the weather system actually has shape.
   Alcoy sits at zoom 10 rather than 11 to keep some of that structure visible. */
const SCOPES = [
  { id: 'ph',     label: 'Philippines', center: [12.8797, 121.7740], zoom: 6  },
  { id: 'asean',  label: 'ASEAN',       center: [8.0, 115.0],        zoom: 4  },
  { id: 'alcoy',  label: 'Alcoy',       center: [9.7167, 123.5167],  zoom: 10 },
]

const OVERLAY_OPACITY = 0.8

/* Occupancy drives the pin colour, same thresholds as the LGU occupancy bars. */
function pinColor(center) {
  if (center.status !== 'ACTIVE') return '#8FA3BA'
  const pct = center.capacity ? (center.occupied / center.capacity) * 100 : 0
  if (pct >= 90) return '#DC2626'
  if (pct >= 60) return '#D97706'
  return '#059669'
}

function pinIcon(center) {
  return L.divIcon({
    className: 'ec-pin-wrap',
    html: `<span class="ec-pin" style="background:${pinColor(center)}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  })
}

/* Imperative view changes need the map instance, which only children can reach. */
function ScopeController({ scope }) {
  const map = useMap()

  useEffect(() => {
    const s = SCOPES.find(x => x.id === scope)
    map.flyTo(s.center, s.zoom, { duration: 0.8 })
  }, [scope, map])

  return null
}

export default function WeatherMap({ centers, height = 320 }) {
  const [layer, setLayer] = useState(LAYERS[0].id)
  const [scope, setScope] = useState(SCOPES[0].id)

  const initial = SCOPES[0]

  return (
    <div className="weather-map-card">
      <div className="weather-map-head">
        <span className="data-table-title">Hazard &amp; Weather Map</span>

        <div className="map-controls">
          <div className="map-toggle">
            {LAYERS.map(l => (
              <button
                key={l.id}
                className={`map-toggle-btn ${layer === l.id ? 'map-toggle-active' : ''}`}
                onClick={() => setLayer(l.id)}
                disabled={!OWM_KEY}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="map-toggle">
            {SCOPES.map(s => (
              <button
                key={s.id}
                className={`map-toggle-btn ${scope === s.id ? 'map-toggle-active' : ''}`}
                onClick={() => setScope(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="weather-map-body" style={{ height }}>
        <MapContainer
          center={initial.center}
          zoom={initial.zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer url={BASEMAP.url} attribution={BASEMAP.attribution} />

          {OWM_KEY && (
            <TileLayer
              key={layer}
              url={`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`}
              opacity={OVERLAY_OPACITY}
              attribution="&copy; OpenWeatherMap"
            />
          )}

          {centers.map(c => (
            <Marker key={c.id} position={[c.lat, c.lng]} icon={pinIcon(c)}>
              <Popup>
                <strong>{c.name}</strong><br />
                {c.barangay} · {c.status}<br />
                {c.occupied} / {c.capacity} occupied
              </Popup>
            </Marker>
          ))}

          <ScopeController scope={scope} />
        </MapContainer>

        {!OWM_KEY && (
          <div className="map-nokey">
            Weather overlay unavailable — <code>VITE_OPENWEATHER_API_KEY</code> not set.
            Base map and evacuation centers still shown.
          </div>
        )}
      </div>

      <div className="weather-map-legend">
        <span className="map-legend-item"><span className="ec-pin" style={{ background: '#059669' }} /> under 60%</span>
        <span className="map-legend-item"><span className="ec-pin" style={{ background: '#D97706' }} /> 60–89%</span>
        <span className="map-legend-item"><span className="ec-pin" style={{ background: '#DC2626' }} /> 90%+ full</span>
        <span className="map-legend-item"><span className="ec-pin" style={{ background: '#8FA3BA' }} /> standby</span>
        <span className="map-legend-src">{OWM_KEY ? 'OpenWeatherMap live tiles' : 'no weather key'}</span>
      </div>
    </div>
  )
}
