export const supplychainScenario = {
  id: 'supplychain',
  industry: 'Supply Chain & High-Tech Manufacturing',
  approvalRole: 'Operations Executive',
  humanTeamLabel: 'Operations Team',
  clock: {
    p0: '04:00:00 ICT',
    p1: '04:02:15 ICT',
    p2: '04:06:30 ICT',
    p3: '04:09:12 ICT',
    p4: '04:09:45 ICT',
    p5: '04:14:20 ICT'
  },
  countdown: null,
  money: {
    atRiskLabel: 'Min. Orders At Risk',
    atRiskValue: '$47M',
    recoveredLabel: 'Capital Recovered / Saved',
    recoveredValue: '$44M recovered · 2-day delay avoided',
    currency: 'USD'
  },
  nodes: [
    {
      id: 'laemchabang',
      label: 'Laem Chabang Port',
      coords: [100.8800, 13.0800],
      role: 'Tier-1 Semiconductor Supplier'
    },
    {
      id: 'hochiminh',
      label: 'Ho Chi Minh Hub',
      coords: [106.6297, 10.8231],
      role: 'Reroute Logistics Hub'
    },
    {
      id: 'singapore',
      label: 'Singapore Hub',
      coords: [103.8198, 1.3521],
      role: 'Primary Air & Sea Freight Hub'
    },
    {
      id: 'hongkong',
      label: 'Hong Kong Facility',
      coords: [114.1694, 22.3193],
      role: 'Surplus Component Storage'
    },
    {
      id: 'newyork',
      label: 'New York Facility',
      coords: [-74.0060, 40.7128],
      role: 'Destination Manufacturing Line'
    }
  ],
  disruptedNodeId: 'laemchabang',
  rerouteNodeIds: ['hochiminh', 'singapore'],
  timing: {
    typeSpeedMs: 25,
    lineDelayMs: 600
  },
  agents: [
    {
      id: 'sentinel',
      name: 'Sentinel-01',
      role: 'Global Telemetry Monitor',
      accent: '#00FF80',
      script: [
        'Scanning Gulf of Thailand maritime telemetry and weather feeds...',
        'ALERT: Tropical Depression Severe Cell detected 30nm off Laem Chabang coast.',
        'Laem Chabang Port container terminal operations reported halted as of 03:45 UTC.',
        'Impacting 142 container units with critical chipsets bound for NY assembly line.'
      ],
      dataResult: {
        label: 'Telemetry Anomaly Detected',
        value: 'Laem Chabang Port Offline (Severe Weather Grid Lock)'
      }
    },
    {
      id: 'sourcing',
      name: 'Sourcing Engine',
      role: 'Supplier Inventory & Capacity Allocation',
      accent: '#4285F4',
      script: [
        'Cross-referencing regional buffer stock across Tier-1 and Tier-2 partner hubs...',
        'Located surplus allocation at Vietnam electronics cluster (Ho Chi Minh).',
        'Checking alternative inventory at Hong Kong surplus repository...',
        'Inventory verified: 45,000 unit batch meets technical specifications.'
      ],
      dataResult: {
        label: 'Alternative Stock Identified',
        value: '45,000 units verified in Ho Chi Minh & Hong Kong'
      }
    },
    {
      id: 'logistics',
      name: 'Logistics Router',
      role: 'Freight Dynamic Rerouting',
      accent: '#FFB800',
      script: [
        'Evaluating secondary transit corridors: SGN -> SIN air charter priority.',
        'Calculating ETA shift: Standard sea freight +6 days vs. Air charter +1.8 days.',
        'Securing reserved cargo slots with regional air carriers...',
        'Transit corridor validated. Transit latency within tolerance.'
      ],
      dataResult: {
        label: 'Optimal Transit Corridor',
        value: 'Air Charter via Ho Chi Minh -> Singapore Hub'
      }
    },
    {
      id: 'finance',
      name: 'Capital Sentinel',
      role: 'Margin Impact & Treasury Approval',
      accent: '#00FF80',
      script: [
        'Estimating expedite freight cost: +$3.2M premium.',
        'Comparing penalty vs expedite: Line stoppage downtime cost = $12M/day.',
        'APAC liquidity confirmed: $210M available for immediate disbursement.',
        'Net loss prevention calculated: $44M capital preserved.'
      ],
      dataResult: {
        label: 'APAC Liquidity Confirmed',
        value: '$210M liquidity available · $3.2M expedite pre-approved'
      }
    },
    {
      id: 'comms',
      name: 'Stakeholder Relay',
      role: 'Executive Briefing & Supplier Notification',
      accent: '#A855F7',
      script: [
        'Drafting automated dispatch orders for Ho Chi Minh fulfillment team.',
        'Preparing executive summary for Operations Executive wake-up alert...',
        'Generating audit log for regulatory compliance and carrier notice.',
        'Reroute package staged. Ready for human authorization.'
      ],
      dataResult: {
        label: 'Communication Protocol Staged',
        value: 'Automated Brief Ready · Dispatch Pending Sign-Off'
      }
    }
  ],
  dialogue: {
    p0: 'It is 04:00 ICT (GMT+7). Global operations are quiet, and human engineering teams are asleep. Sentinel Agent monitors global supply lines.',
    p1: 'At 04:02 ICT, Sentinel Agent picks up a severe storm anomaly near the Gulf of Thailand.',
    p2: 'By 04:06 ICT, Laem Chabang Port goes completely dark. $47 Million in critical chipset orders are stranded.',
    p3: 'The AI Swarm springs into action. Specialists analyze global inventory, calculate air freight routes, and verify treasury liquidity concurrently.',
    p4: 'At 04:09 ICT, the system pauses and triggers an urgent wake-up approval request to the Operations Executive.',
    p5: 'Approval received! Expedite logistics executed automatically. $44M saved and assembly downtime prevented before dawn.'
  },
  resolutionBadges: ['Supply Restored', '2-Day Delay Avoided', 'Downtime Prevented'],
  outro: {
    title: 'INCIDENT RESOLVED · ZERO LINE STOPPAGE',
    body: 'Autonomous agents re-routed $47M in critical inventory, booking air charter capacity across APAC in 9 minutes while human teams slept.',
    footer: 'Agentic Operations Engine · Autonomous Supply Resilience'
  }
};
