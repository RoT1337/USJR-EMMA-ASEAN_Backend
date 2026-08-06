import { useEffect, useState } from 'react'
import { getDashboardData } from './dataSource'

/* Reads a role's dashboard data through the dataSource seam.

   It's async today only because the mock getters are async — which is the point:
   when dataSource swaps to a real fetch, this hook and every view stay exactly as
   they are, and the loading/error states below start doing real work.

   No synchronous reset when roleId changes: App.jsx keys each view on roleId, so
   switching roles remounts rather than re-running this effect. */
export default function useDashboardData(roleId) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false

    getDashboardData(roleId)
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }) })
      .catch(err => { if (!cancelled) setState({ data: null, loading: false, error: err.message }) })

    return () => { cancelled = true }
  }, [roleId])

  return state
}
