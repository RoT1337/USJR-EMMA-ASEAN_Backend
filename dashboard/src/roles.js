/* Role registry — drives the login screen, routing, each view's header and its
   sidebar nav tree.

   Accent colours come from the existing AgentCard palette so the four dashboards
   read as one product. Nav trees are transcribed from the old EMMA screenshots in
   docs/picture_references/ — they are cosmetic (nothing is clickable), present to
   reproduce the original information architecture. */

export const ROLES = [
  {
    id: 'drrmo',
    name: 'DRRMO Officer',
    displayName: 'James Avaceña',
    org: 'Municipal DRRMO · Alcoy, Cebu',
    breadcrumb: 'Alcoy, Cebu — DRRMO',
    tier: 'Local',
    user: 'j.avacena',
    dashboard: 'Hazard Monitoring & Early Warning',
    agent: {
      name: 'EMMA-Warn',
      tagline: 'The Sentinel',
      accent: '#EA580C',
      accentBg: '#FFF4EE',
    },
    activeNav: 'Typhoons',
    nav: [
      {
        label: 'Disaster Monitoring',
        items: ['Typhoons', 'Earthquakes', 'Volcanic Eruptions', 'Floods', 'Landslides', 'Tsunamis', 'Fire'],
      },
      { label: 'Evacuation Stat' },
      { label: 'Response Teams' },
      { label: 'Resource and Supply' },
      { label: 'Risk and Damage' },
      { label: 'Weather' },
      { label: 'Coordinations' },
    ],
  },
  {
    id: 'dswd',
    name: 'DSWD / MSWD Officer',
    displayName: 'Shiela Monteverde',
    org: 'MSWD Alcoy · DSWD Field Office VII',
    breadcrumb: 'Alcoy, Cebu — DSWD',
    tier: 'Local',
    user: 's.monteverde',
    dashboard: 'Welfare & Beneficiary Management',
    agent: {
      name: 'EMMA-Care',
      tagline: 'The Welfare Manager',
      accent: '#7C3AED',
      accentBg: '#F5F3FF',
    },
    activeNav: 'Families',
    nav: [
      {
        label: 'Beneficiary Mngt',
        items: ['Families', 'Senior Citizens', 'PWD', 'Individuals', 'Pregnant Women'],
      },
      {
        label: 'Rations Distribution',
        items: ['Scheduling', 'Allocation', 'Inventory', 'Delivery Tracking'],
      },
      {
        label: 'Logistics Distribution',
        items: ['Vehicle Dispatch', 'Route Planning', 'Warehouse Management'],
      },
      { label: 'Assistance Requests' },
      { label: 'Missing Persons' },
    ],
  },
  {
    id: 'lgu',
    name: 'LGU Executive',
    displayName: 'Jason Matias',
    org: 'Office of the Mayor · Alcoy, Cebu',
    breadcrumb: 'Alcoy, Cebu — LGU',
    tier: 'Local',
    user: 'j.matias',
    dashboard: 'Resource Planning & Approvals',
    agent: {
      name: 'EMMA-Plan',
      tagline: 'The Planner',
      accent: '#059669',
      accentBg: '#ECFDF5',
    },
    activeNav: 'All Centers',
    nav: [
      {
        label: 'Evac Center Mngt',
        items: ['All Centers', 'Add Center', 'Update Center', 'Center Status'],
      },
      {
        label: 'Communications Hub',
        items: ['Alerts', 'Messages', 'Meetings'],
      },
      { label: 'Resources Mngt' },
      { label: 'Transpo and Routing' },
      { label: 'Volunteers' },
      { label: 'Incidents and Damage' },
    ],
  },
  {
    id: 'asean',
    name: 'ASEAN Regional Coordinator',
    displayName: 'AHA Centre Operations',
    org: 'AHA Centre · AADMER Operations',
    breadcrumb: 'ASEAN Region — AHA Centre',
    tier: 'Regional',
    user: 'aha.ops',
    dashboard: 'Cross-Border Coordination',
    agent: {
      name: '5-Agent Pipeline',
      tagline: 'Live LangGraph Service',
      accent: '#DC2626',
      accentBg: '#FEF2F2',
    },
    activeNav: 'Incident Queue',
    /* Cosmetic, like the other three. Without it the AHA Centre read as a
       different application rather than a different seat. Only shown while idle:
       once the pipeline runs, AgentNav takes the left rail because the agents
       are then the relevant navigation. */
    nav: [
      {
        label: 'AADMER Operations',
        items: ['Incident Queue', 'Member States', 'Deployments', 'Reports'],
      },
      { label: 'Regional Pattern' },
      { label: 'Resource Registry' },
      { label: 'Audit Trail' },
    ],
  },
]

export const ROLE_MAP = Object.fromEntries(ROLES.map(r => [r.id, r]))
