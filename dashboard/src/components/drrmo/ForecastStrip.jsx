import { WeatherGlyph } from '../shared/RoleGlyph'
/* 7-day outlook — sits above the weather map, mirroring the old EMMA layout.
   Today's column is highlighted; rainfall drives the small bar under each day. */

export default function ForecastStrip({ forecast, location }) {
  const peak = Math.max(...forecast.map(d => d.rainfall), 1)

  return (
    <div className="forecast-strip">
      <div className="forecast-lead">
        <WeatherGlyph condition={forecast[0].condition} size={26} className="forecast-lead-icon" />
        <div>
          <div className="forecast-lead-place">{location}</div>
          <div className="forecast-lead-cond">{forecast[0].condition}</div>
        </div>
        <div className="forecast-lead-temp">{forecast[0].high}°</div>
      </div>

      <div className="forecast-days">
        {forecast.map((d, i) => (
          <div key={d.day} className={`forecast-day ${i === 0 ? 'forecast-day-now' : ''}`}>
            <div className="forecast-day-label">{d.label}</div>
            <WeatherGlyph condition={d.condition} size={16} className="forecast-day-icon" />
            <div className="forecast-day-temps">
              <span className="forecast-hi">{d.high}°</span>
              <span className="forecast-lo">{d.low}°</span>
            </div>
            <div className="forecast-rain-track">
              <div
                className="forecast-rain-fill"
                style={{ height: `${(d.rainfall / peak) * 100}%` }}
              />
            </div>
            <div className="forecast-rain-mm">{d.rainfall}mm</div>
          </div>
        ))}
      </div>
    </div>
  )
}
