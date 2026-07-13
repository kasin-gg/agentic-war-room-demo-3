import { ref, computed, reactive, watch, onUnmounted } from 'vue';
import { getActiveScenario } from '../config/index.js';
import { useScriptPlayer } from './useScriptPlayer.js';

export function useDemoDirector() {
  const scenario = getActiveScenario();
  const scriptPlayer = useScriptPlayer();

  const phase = ref(0); // 0..5
  const isRejected = ref(false);
  const awaitingApproval = ref(false);

  // Time & Countdown management
  const countdownRemaining = ref('');
  let countdownInterval = null;

  // Initialize nodes state reactively from scenario
  const nodeStatuses = reactive({});
  
  function resetNodeStatuses() {
    scenario.nodes.forEach(node => {
      nodeStatuses[node.id] = {
        id: node.id,
        label: node.label,
        coords: node.coords,
        role: node.role,
        status: 'quiet' // quiet | warning | critical | reroute | recovered | grey
      };
    });
  }

  // Reactive Arcs computed from phase and node statuses
  const arcs = computed(() => {
    const list = [];
    const disruptedNode = scenario.nodes.find(n => n.id === scenario.disruptedNodeId);
    
    if (!disruptedNode) return list;

    // Normal ambient traffic in Phase 0-1
    if (phase.value <= 1) {
      scenario.nodes.forEach(n => {
        if (n.id !== scenario.disruptedNodeId) {
          list.push({
            from: disruptedNode.coords,
            to: n.coords,
            status: 'normal',
            color: [0, 255, 128, 150]
          });
        }
      });
    } else if (phase.value >= 2) {
      // Disrupted flow (red)
      scenario.nodes.forEach(n => {
        if (!scenario.rerouteNodeIds.includes(n.id) && n.id !== scenario.disruptedNodeId) {
          list.push({
            from: disruptedNode.coords,
            to: n.coords,
            status: phase.value >= 5 ? 'grey' : 'critical',
            color: phase.value >= 5 ? [100, 116, 139, 100] : [255, 40, 40, 200]
          });
        }
      });

      // Reroute candidate arcs (Phases 3-4 = dashed/warning, Phase 5 = solid green/recovered)
      scenario.rerouteNodeIds.forEach(rerouteId => {
        const rerouteNode = scenario.nodes.find(n => n.id === rerouteId);
        if (rerouteNode) {
          list.push({
            from: rerouteNode.coords,
            to: disruptedNode.coords,
            status: phase.value === 5 ? 'recovered' : 'candidate',
            color: phase.value === 5 ? [0, 255, 128, 255] : [255, 184, 0, 180]
          });
        }
      });
    }

    return list;
  });

  // Current clock time string
  const clockString = computed(() => {
    return scenario.clock[`p${phase.value}`] || scenario.clock.p0;
  });

  // Speaker dialogue for presenter view
  const currentDialogue = computed(() => {
    return scenario.dialogue[`p${phase.value}`] || '';
  });

  // Money HUD state
  const moneyState = computed(() => {
    if (phase.value < 2) {
      return { visible: false, label: '', value: '', status: 'normal' };
    }
    if (phase.value < 5) {
      return {
        visible: true,
        label: scenario.money.atRiskLabel,
        value: scenario.money.atRiskValue,
        status: 'at-risk'
      };
    }
    return {
      visible: true,
      label: scenario.money.recoveredLabel,
      value: scenario.money.recoveredValue,
      status: 'recovered'
    };
  });

  // Countdown timer setup for Banking scenario
  function initCountdown() {
    stopCountdown();
    if (scenario.countdown && scenario.countdown.startRemaining) {
      countdownRemaining.value = scenario.countdown.startRemaining;
    }
  }

  function startCountdownTimer() {
    if (!scenario.countdown) return;
    stopCountdown();
    
    // Parse initial time e.g. "1h 54m" or "1h54m" -> total seconds
    let totalSeconds = 114 * 60; // 1h 54m = 6840 seconds
    
    countdownInterval = setInterval(() => {
      if (phase.value === 5) {
        // Freeze countdown on resolution
        stopCountdown();
        return;
      }
      if (totalSeconds > 0) {
        totalSeconds--;
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        countdownRemaining.value = `${hours}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
      }
    }, 1000);
  }

  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  // Update node visual health statuses according to current phase
  function updateNodeHealth() {
    const p = phase.value;
    const disruptedId = scenario.disruptedNodeId;
    const rerouteIds = scenario.rerouteNodeIds;

    scenario.nodes.forEach(node => {
      const state = nodeStatuses[node.id];
      if (!state) return;

      if (p === 0) {
        state.status = 'quiet';
      } else if (p === 1) {
        if (node.id === disruptedId) {
          state.status = 'warning';
        } else {
          state.status = 'quiet';
        }
      } else if (p === 2) {
        if (node.id === disruptedId) {
          state.status = 'critical';
        } else if (rerouteIds.includes(node.id)) {
          state.status = 'warning';
        } else {
          state.status = 'quiet';
        }
      } else if (p === 3 || p === 4) {
        if (node.id === disruptedId) {
          state.status = 'critical';
        } else if (rerouteIds.includes(node.id)) {
          state.status = 'reroute';
        } else {
          state.status = 'quiet';
        }
      } else if (p === 5) {
        if (node.id === disruptedId) {
          state.status = 'grey';
        } else if (rerouteIds.includes(node.id)) {
          state.status = 'recovered';
        } else {
          state.status = 'recovered';
        }
      }
    });
  }

  // State Machine Phase Transition Handler
  function setPhase(newPhase) {
    if (newPhase < 0 || newPhase > 5) return;
    phase.value = newPhase;
    isRejected.value = false;
    updateNodeHealth();

    // Trigger phase-specific script animations and actions
    if (newPhase === 0) {
      awaitingApproval.value = false;
      scriptPlayer.resetPlayback();
      initCountdown();
    } else if (newPhase === 1) {
      // Sentinel agent picks up signal
      const sentinel = scenario.agents.find(a => a.id === 'sentinel') || scenario.agents[0];
      scriptPlayer.startPlayback([sentinel.id], scenario.timing);
    } else if (newPhase === 2) {
      // Incident active, start countdown if applicable
      startCountdownTimer();
    } else if (newPhase === 3) {
      // Full swarm activated! Play all agents script concurrently
      const allAgentIds = scenario.agents.map(a => a.id);
      scriptPlayer.startPlayback(allAgentIds, scenario.timing);
    } else if (newPhase === 4) {
      // Pause for human approval
      awaitingApproval.value = true;
      scriptPlayer.skipPlayback(); // Ensure all agent analysis is fully visible
    } else if (newPhase === 5) {
      // Resolved!
      awaitingApproval.value = false;
      stopCountdown();
    }
  }

  function advancePhase() {
    if (phase.value < 4) {
      setPhase(phase.value + 1);
    } else if (phase.value === 4 && awaitingApproval.value) {
      // Require explicit Y/K input in phase 4
    }
  }

  function approve() {
    if (phase.value === 4) {
      setPhase(5);
    }
  }

  function reject() {
    if (phase.value === 4) {
      isRejected.value = true;
      awaitingApproval.value = false;
    }
  }

  function reset() {
    setPhase(0);
  }

  // Initialize
  scriptPlayer.initAgents(scenario.agents);
  resetNodeStatuses();
  updateNodeHealth();
  initCountdown();

  onUnmounted(() => {
    stopCountdown();
    scriptPlayer.resetPlayback();
  });

  return {
    scenario,
    phase,
    isRejected,
    awaitingApproval,
    clockString,
    currentDialogue,
    nodeStatuses,
    arcs,
    moneyState,
    countdownRemaining,
    agentStates: scriptPlayer.agentStates,
    activeAgentIds: scriptPlayer.activeAgentIds,
    setPhase,
    advancePhase,
    approve,
    reject,
    reset
  };
}
