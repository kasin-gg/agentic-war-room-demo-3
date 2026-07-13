export const bankingScenario = {
  id: 'banking',
  industry: 'Global Treasury & FX Operations',
  approvalRole: 'Treasurer',
  humanTeamLabel: 'Treasury Desk',
  clock: {
    p0: '04:00:00 ICT',
    p1: '04:01:45 ICT',
    p2: '04:05:10 ICT',
    p3: '04:08:30 ICT',
    p4: '04:09:00 ICT',
    p5: '04:12:15 ICT'
  },
  countdown: {
    label: 'Settlement Cutoff 06:00 ICT',
    startRemaining: '1h 54m'
  },
  money: {
    atRiskLabel: 'Liquidity Shortfall',
    atRiskValue: '$180M',
    recoveredLabel: 'Settlement Executed',
    recoveredValue: '$180M settled · breach avoided',
    currency: 'USD'
  },
  nodes: [
    {
      id: 'london',
      label: 'London Treasury Hub',
      coords: [-0.1276, 51.5074],
      role: 'Surplus Treasury Hub'
    },
    {
      id: 'hongkong',
      label: 'Hong Kong Treasury',
      coords: [114.1694, 22.3193],
      role: 'Surplus Clearing Hub'
    },
    {
      id: 'singapore',
      label: 'Singapore Settlement Desk',
      coords: [103.8198, 1.3521],
      role: 'Disrupted Clearing Desk'
    },
    {
      id: 'newyork',
      label: 'New York Treasury',
      coords: [-74.0060, 40.7128],
      role: 'Federal Reserve Clearing Node'
    },
    {
      id: 'tokyo',
      label: 'Tokyo Clearing Desk',
      coords: [139.6503, 35.6762],
      role: 'Reserve Liquidity Desk'
    }
  ],
  disruptedNodeId: 'singapore',
  rerouteNodeIds: ['london', 'hongkong'],
  timing: {
    typeSpeedMs: 25,
    lineDelayMs: 600
  },
  agents: [
    {
      id: 'sentinel',
      name: 'Liquidity Sentinel',
      role: 'Real-time Position Monitor',
      accent: '#00FF80',
      script: [
        'Monitoring interbank clearing streams and settlement queues...',
        'ALERT: Correspondent bank frozen credit facility of $180M due to unannounced technical window.',
        'Impacting 06:00 ICT batch settlement cutoff for interbank obligation.',
        'Immediate regulatory default risk flagged if unresolved by cutoff.'
      ],
      dataResult: {
        label: 'Clearing Anomaly',
        value: 'Singapore Credit Line Frozen ($180M Shortfall)'
      }
    },
    {
      id: 'liquidity',
      name: 'Liquidity Agent',
      role: 'Intraday Liquidity Optimization',
      accent: '#4285F4',
      script: [
        'Scanning global nostro balances across London, HK, and Tokyo branches...',
        'Unallocated balance identified in London GBP/USD pool ($120M equivalent).',
        'Unallocated liquidity in HK Treasury desk ($80M equivalent).',
        'Total global surplus pool: $200M available for rapid transfer.'
      ],
      dataResult: {
        label: 'Global Liquidity Mapped',
        value: '$200M combined surplus in London & HK'
      }
    },
    {
      id: 'markets',
      name: 'Markets Agent',
      role: 'FX Swap & Cross-Currency Routing',
      accent: '#FFB800',
      script: [
        'Structuring intraday FX swap strategy: GBP/USD swap via London + HKD/USD swap via HK.',
        'Simulating execution slippage and spread cost (<0.4 bps).',
        'Optimizing multi-leg transfer path to Singapore settlement account...',
        'Swap structure finalized with minimal market impact.'
      ],
      dataResult: {
        label: 'Swap Strategy Formulated',
        value: '$120M London Swap + $60M HK Swap'
      }
    },
    {
      id: 'compliance',
      name: 'Risk & Compliance Agent',
      role: 'Regulatory Limits & Counterparty Risk',
      accent: '#00FF80',
      script: [
        'Checking MAS interbank exposure ceilings and intraday credit thresholds...',
        'Validating counterparty risk metrics for intra-group transfer...',
        'Verifying regulatory reporting requirements for FX swap leg...',
        'Within counterparty limits · MAS-compliant.'
      ],
      dataResult: {
        label: 'Regulatory Audit',
        value: 'Within counterparty limits · MAS-compliant'
      }
    },
    {
      id: 'comms',
      name: 'Stakeholder Relay',
      role: 'Treasury Desk Briefing & Payment Queueing',
      accent: '#A855F7',
      script: [
        'Preparing payment instructions for RTGS priority release.',
        'Formatting Treasurer authorization package with cryptographic proof.',
        'Audited transaction trail staged for instant execution.',
        'Awaiting Treasurer confirmation to release funds.'
      ],
      dataResult: {
        label: 'Execution Staged',
        value: 'Payment Batch Staged · Awaiting Treasurer Approval'
      }
    }
  ],
  dialogue: {
    p0: 'It is 04:00 ICT (GMT+7). Night desk monitoring active. Human Treasury Desk is off-duty.',
    p1: 'At 04:01 ICT, Liquidity Sentinel flags an abrupt credit line suspension at Singapore desk.',
    p2: 'By 04:05 ICT, $180M interbank obligation is at risk with 06:00 ICT regulatory deadline approaching.',
    p3: 'Autonomous agents scan global balance sheets in London and Hong Kong to construct multi-currency intraday FX swaps.',
    p4: 'At 04:09 ICT, an urgent high-value approval notification is routed to the Treasurer.',
    p5: 'Treasurer approves! $180M intra-group swaps execute instantly, securing regulatory settlement 1h 48m ahead of cutoff.'
  },
  resolutionBadges: ['Within limits', 'MAS-compliant', 'Audited'],
  outro: {
    title: 'SETTLEMENT COMPLETE · ZERO PENALTY BREACH',
    body: 'Autonomous agents restructured $180M intraday FX swaps across London and HK desks to cover Singapore cutoff with 1h 48m to spare.',
    footer: 'Agentic Financial Core · Autonomous Treasury Resilience'
  }
};
