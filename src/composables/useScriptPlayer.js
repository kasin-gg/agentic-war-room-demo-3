import { ref, reactive } from 'vue';

export function useScriptPlayer() {
  const activeAgentIds = ref([]);
  const agentStates = reactive({});
  const activeTimers = new Set();

  function initAgents(agentsList) {
    resetPlayback();
    agentsList.forEach(agent => {
      agentStates[agent.id] = {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        accent: agent.accent,
        script: agent.script || [],
        dataResult: agent.dataResult || null,
        active: false,
        revealedThoughts: [],
        dataResultRevealed: false,
        isComplete: false
      };
    });
  }

  function clearAllTimers() {
    activeTimers.forEach(timer => clearTimeout(timer));
    activeTimers.clear();
  }

  function safeTimeout(fn, delayMs) {
    const timer = setTimeout(() => {
      activeTimers.delete(timer);
      fn();
    }, delayMs);
    activeTimers.add(timer);
    return timer;
  }

  function startPlayback(targetAgentIds, timing = { typeSpeedMs: 25, lineDelayMs: 600 }) {
    activeAgentIds.value = targetAgentIds;

    targetAgentIds.forEach(id => {
      const state = agentStates[id];
      if (!state) return;
      
      state.active = true;
      state.revealedThoughts = [];
      state.dataResultRevealed = false;
      state.isComplete = false;

      playAgentScript(id, timing);
    });
  }

  function playAgentScript(agentId, timing) {
    const state = agentStates[agentId];
    if (!state || !state.script.length) return;

    const { typeSpeedMs, lineDelayMs } = timing;
    let lineIdx = 0;
    let charIdx = 0;

    function typeChar() {
      if (lineIdx >= state.script.length) {
        state.isComplete = true;
        // Reveal hardcoded data result shortly after final line finishes
        if (state.dataResult) {
          safeTimeout(() => {
            state.dataResultRevealed = true;
          }, lineDelayMs);
        }
        return;
      }

      const fullLine = state.script[lineIdx];
      
      if (charIdx === 0) {
        state.revealedThoughts.push('');
      }

      charIdx++;
      state.revealedThoughts[lineIdx] = fullLine.substring(0, charIdx);

      if (charIdx < fullLine.length) {
        safeTimeout(typeChar, typeSpeedMs);
      } else {
        // Line finished, wait lineDelayMs before starting next line
        lineIdx++;
        charIdx = 0;
        safeTimeout(typeChar, lineDelayMs);
      }
    }

    typeChar();
  }

  function resetPlayback() {
    clearAllTimers();
    Object.keys(agentStates).forEach(id => {
      const state = agentStates[id];
      state.active = false;
      state.revealedThoughts = [];
      state.dataResultRevealed = false;
      state.isComplete = false;
    });
    activeAgentIds.value = [];
  }

  function skipPlayback() {
    clearAllTimers();
    activeAgentIds.value.forEach(id => {
      const state = agentStates[id];
      if (state) {
        state.active = true;
        state.revealedThoughts = [...state.script];
        state.dataResultRevealed = true;
        state.isComplete = true;
      }
    });
  }

  return {
    agentStates,
    activeAgentIds,
    initAgents,
    startPlayback,
    resetPlayback,
    skipPlayback
  };
}
