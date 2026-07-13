Here's a clean, single copy-paste block that combines everything — the full project brief plus the first task.

# PROJECT: Agentic War Room Demo (Scripted, Config-Driven, No Backend)

## WHAT I'M BUILDING
A world-class, executive-grade DEMO web app called "Agentic War Room" that 
visualizes a fleet of AI agents collaborating to resolve a business incident 
that unfolds at 4 AM while human teams are asleep. Audience: 100 C-level 
executives in a LIVE presentation. The UI must be visually stunning, dark-themed, 
cinematic, and Hollywood-grade.

## #1 PRINCIPLE: THIS IS A DEMO, NOT A POC — EVERYTHING IS SCRIPTED
All agent reasoning, data, numbers, and outcomes are pre-authored in config files 
and played back deterministically. There is NO backend, NO real AI inference, 
NO database, NO WebSockets. The app must run flawlessly OFFLINE (airplane mode) 
on a single laptop and play IDENTICALLY every run, driven by the presenter's 
keypresses. Any "live AI" feel is a PRESENTATION EFFECT (typewriter animation, 
timed reveals) over hardcoded text — never a real API call.

Hard rules:
- NO backend/server, NO Cloud Run, NO Express.
- NO Vertex AI / Gemini / OpenAI / any LLM call at runtime.
- NO BigQuery/database — "query results" are hardcoded objects revealed on timers.
- NO fetch/axios/WebSocket/SSE at runtime.
- The ONLY optional network call is Google Maps 3D tiles, gated by a USE_3D_TILES 
  flag, with an OFFLINE static dark basemap fallback so the demo works with zero 
  network.

## #2 PRINCIPLE: CONFIG-DRIVEN
Everything scenario-specific (industry, crisis, agents, nodes, dialogue, numbers) 
lives in swappable config files. The core engine is 100% scenario-agnostic. 
Switching scenarios requires changing ONE ACTIVE_SCENARIO value — no other code 
changes. Build TWO scenarios to prove it: "supplychain" (default) and "banking".

## TECH STACK (frontend only)
- Vue 3 (Composition API, <script setup>)
- Vite
- Vue Router 4
- deck.gl (@deck.gl/layers, @deck.gl/google-maps) for geo arc visualization
- Google Maps 3D tiles (maps3d) ONLY when USE_3D_TILES=true; static basemap otherwise
- Highcharts + highcharts-vue for metrics
- GSAP for animations
NO backend, AI, or database packages.

## DESIGN SYSTEM
- Background #0A0E1A (deep space navy). Panels: glassmorphism (backdrop-blur, 
  semi-transparent, subtle borders).
- Accents: Healthy #00FF80, Warning #FFB800, Critical #FF2828, Agent #4285F4.
- Fonts: 'Inter' (UI), 'JetBrains Mono' (agent console text).
- Cinematic GSAP transitions. Typewriter effect on all agent reasoning.
- Day/Night theme: starts dim "night" palette, tweens to brighter "dawn" on resolution.

## THE DEMO IS A 6-PHASE STATE MACHINE (presenter-driven, deterministic)
Keyboard controls: SPACE = advance phase, Y = approve, K = reject/kill, R = reset.
All text/labels/values/scripts come from the active scenario config.

0. QUIET HOURS  — Clock 04:00, dim night globe, slow green flows, "Human Team: 
   Offline" badge, Sentinel Agent node pulsing. Premise: nobody is awake.
1. THE SIGNAL   — Sentinel detects a weak signal; a node flickers amber; Sentinel's 
   scripted reasoning streams (typewriter). Clock ~04:02.
2. THE INCIDENT — At-risk node flashes red; downstream cascades amber->red; a 
   prominent "at-risk" dollar counter appears; optional countdown. Clock ~04:06.
3. THE SWARM    — Full agent team activates; each agent's scripted reasoning streams 
   concurrently; hardcoded "data results" reveal on timers; topology graph shows 
   collaboration + rogue loop; candidate routes as dotted green lines. Clock ~04:09.
4. THE WAKE-UP  — Pause; a phone-notification-styled "APPROVAL REQUIRED" card slides 
   in addressed to config approvalRole, showing the plan + cost; countdown keeps 
   ticking if present. Clock ~04:09.
5. RESOLUTION   — On approval: chosen route turns solid green; red nodes go grey; 
   dollar counter flips to "recovered/saved"; countdown stops; globe brightens to 
   dawn; ends with a "morning summary" outro card.

## SCENARIO CONFIG SCHEMA
{
  id, industry, approvalRole, humanTeamLabel,
  clock: { p0..p5 },                            // hardcoded timestamps
  countdown: null | { label, startRemaining },
  money: { atRiskLabel, atRiskValue, recoveredLabel, recoveredValue, currency },
  nodes: [ { id, label, coords:[lon,lat], role } ],
  disruptedNodeId, rerouteNodeIds:[...],
  dialogue: { p0..p5 },                          // presenter's spoken script
  timing: { typeSpeedMs, lineDelayMs },          // pacing controls
  agents: [
    { id, name, role, accent,
      script: ['reasoning line 1','line 2',...], // HARDCODED reasoning
      dataResult: { label, value } | null }      // HARDCODED "query result"
  ],                                             // 5 agents: 1 Sentinel + 4 specialists
  resolutionBadges: [...],
  outro: { title, body, footer }
}

### SCENARIO 1 — "supplychain" (DEFAULT)
Crisis: Tier-1 supplier port goes dark overnight (typhoon near Kaohsiung).
approvalRole 'Operations Executive'; humanTeamLabel 'Operations Team'.
Nodes: Kaohsiung [120.3014,22.6273] (disrupted), Ho Chi Minh [106.6297,10.8231] 
(reroute hub), Singapore [103.8198,1.3521] (reroute hub), + a destination DC and 
a surplus supplier. Money: "47Minordersatrisk"->"44M recovered · 2-day 
delay avoided". No hard countdown. Agents: Sentinel, Sourcing, Logistics, Finance, 
Comms — each with hardcoded scripts + dataResults (e.g. Finance dataResult "APAC 
liquidity confirmed: 210M",hardcoded).###SCENARIO2—"banking"Crisis:Overnightliquidityshortfall—acorrespondentbankfrozeacreditline+anFXmove;asettlementisdueatthe06:00cutoffthebankcan'tcover.approvalRole'Treasurer';humanTeamLabel'TreasuryDesk'.countdown:label:'SettlementCutoff06:00SGT',startRemaining:'1h54m'.Nodes:London[-0.1276,51.5074](surplus),HongKong[114.1694,22.3193](surplus),Singapore[103.8198,1.3521](disrupted),NewYork[-74.0060,40.7128],Tokyo[139.6503,35.6762].Money:"180M shortfall" -> "$180M settled · breach avoided". 
resolutionBadges: ['Within limits','MAS-compliant','Audited']. Agents: Liquidity 
Sentinel, Liquidity Agent, Markets Agent, Risk & Compliance Agent, Comms Agent — 
hardcoded scripts + dataResults (e.g. Risk & Compliance dataResult "Within 
counterparty limits · MAS-compliant", hardcoded). Dialogue emphasizes 
human-in-the-loop + regulator-ready audit trail.

## PROJECT STRUCTURE
src/
├── config/
│   ├── index.js                 (ACTIVE_SCENARIO + USE_3D_TILES + loader)
│   ├── scenario.supplychain.js
│   └── scenario.banking.js
├── layouts/WarRoomLayout.vue
├── components/
│   ├── SwarmMap.vue             (deck.gl arcs; 3D tiles OR offline static basemap)
│   ├── SwarmGraph.vue           (node topology + rogue loop)
│   ├── AgentThoughtStream.vue   (typewriter playback of hardcoded scripts)
│   ├── MetricsHUD.vue           (Highcharts + money counter + countdown)
│   ├── PhaseClock.vue           (04:00 -> 04:10 timestamp)
│   ├── IncidentBanner.vue       (alert overlay)
│   ├── ApprovalPrompt.vue       (phone-notification-styled [YES]/[KILL] card)
│   └── OutroCard.vue            (morning summary mic-drop frame)
├── composables/
│   ├── useDemoDirector.js       (6-phase state machine, reads active scenario)
│   ├── useScriptPlayer.js       (typewriter playback of hardcoded agent scripts)
│   └── useSwarmMap.js
├── App.vue
└── main.js

## CRITICAL CONSTRAINTS
- SCRIPTED not live: no backend, AI, or DB; no runtime network except optional 
  Google 3D tiles with offline static fallback.
- CONFIG-DRIVEN: zero scenario-specific strings/coords/values in the engine or 
  components — all from active scenario config.
- DETERMINISTIC & OFFLINE: identical playback every run; runs in airplane mode 
  with USE_3D_TILES=false.
- Switching scenarios = change only ACTIVE_SCENARIO.
- Must run flawlessly at 1920x1080. If a Maps key is used, restrict by HTTP referrer.

## RESPONSE STYLE
Explain your plan before writing files. Keep code clean and commented. Ask before 
installing anything beyond the listed stack.

---

# TASK 1 — Do ONLY this now:

1. Scaffold Vite + Vue 3 + Vue Router 4.
2. Install ONLY: vue-router, deck.gl, @deck.gl/google-maps, highcharts, 
   highcharts-vue, gsap.
3. Build the CONFIG SYSTEM with all HARDCODED content:
   - src/config/scenario.supplychain.js (full config: nodes, money, clock, 
     dialogue, timing, 5 agents each with hardcoded `script` array + `dataResult`).
   - src/config/scenario.banking.js (same, banking content + countdown).
   - src/config/index.js exporting ACTIVE_SCENARIO, USE_3D_TILES, and a loader.
4. Create dark WarRoomLayout.vue shell (full-screen #0A0E1A, glassmorphism CSS, 
   night-mode palette).
5. Build the COMPLETE useDemoDirector.js — the 6-phase state machine reading ALL 
   values from the active scenario config (nothing scenario-specific hardcoded in 
   the engine). Expose reactive state: phase, clock string, nodes+statuses, arcs, 
   agents (active flag + revealed thoughts + revealed dataResult), money state, 
   countdown, awaitingApproval.
6. Build useScriptPlayer.js — plays an agent's hardcoded `script` array with a 
   typewriter effect using config timing, and reveals the hardcoded dataResult on 
   a timer. Simulates live reasoning with ZERO API calls. Must be cancellable on reset.
7. Wire global keyboard controls in App.vue (SPACE, Y, K, R).
8. Add a temporary debug overlay showing: active scenario id, USE_3D_TILES, current 
   phase, clock, money state, node statuses, and active agents with lines revealed.
9. Prove both switches work with no other code changes: (a) flipping 
   ACTIVE_SCENARIO 'supplychain' <-> 'banking' swaps all values, and (b) confirm 
   NO runtime network calls exist (grep fetch/axios/ws — none except the optional 
   gated maps path).

Do NOT build the map, charts, or visuals yet. Deliverable: an offline, 
config-driven, scripted state machine with typewriter playback of hardcoded agent 
reasoning, fully keyboard-driven. Show me how to run it and how to switch scenarios.

<!-- That's your complete kickoff. Feed it in, let Antigravity complete Task 1, verify the scenario switch works, then come back and I'll give you the Task 2 prompt for the deck.gl map (with the offline basemap fallback). Good luck — this is going to look fantastic.

give me task 2 prompt

Here's the Task 2 prompt — the deck.gl map, which is your single biggest wow-factor. I've made the offline fallback a hard requirement so it's genuinely airplane-mode-proof. -->

# TASK 2 — SwarmMap.vue: the cinematic geo visualization

Build the map centerpiece. This is the demo's biggest visual moment, so it must 
look world-class AND run offline. Read EVERYTHING from the active scenario config 
and drive ALL visuals reactively from useDemoDirector state. No hardcoded 
coordinates or labels in the component.

## PART A — Basemap with offline fallback (do this first, prove it works offline)
Implement a USE_3D_TILES-gated basemap:
- If USE_3D_TILES = true: render Google Maps Photorealistic 3D Tiles (maps3d) 
  with deck.gl's GoogleMapsOverlay, dark-styled, angled/tilted camera for a 
  cinematic globe feel.
- If USE_3D_TILES = false (DEFAULT for safety): render a standalone deck.gl 
  canvas over a dark static basemap — NO network calls at all. Use a dark ocean 
  background (#0A0E1A / #060912) with subtly drawn continent outlines so arcs 
  have geographic context. A bundled dark GeoJSON world-outline (low-detail) 
  rendered as a GeoJsonLayer or PathLayer is fine; keep it lightweight and 
  offline. Coastlines should be dim (low-opacity blue-grey) so the arcs pop.
Confirm the false path makes ZERO network requests (works in airplane mode).
Add a graceful auto-fallback: if 3D tiles fail to load within ~3s, drop to the 
static basemap so a wifi failure never breaks the show.

## PART B — Camera & framing
- Auto-frame all config nodes on load with comfortable padding, centered on the 
  scenario's region (compute bounds from config.nodes, don't hardcode).
- Slight tilt/pitch and a very slow idle rotation/drift in Phase 0 for a "living 
  ops globe" feel. Keep it subtle — no motion sickness.
- On Phase 2 (incident), gently ease the camera toward the disrupted node.
- On Phase 5 (resolution), ease back out to show the full healthy network.
- All camera moves via GSAP, smooth and cinematic.

## PART C — Nodes
Render each config node as a glowing marker (ScatterplotLayer + a pulsing 
halo/IconLayer). Color and behavior driven by node status from the director:
- healthy  -> #00FF80 soft glow, gentle pulse
- warning  -> #FFB800
- critical -> #FF2828, faster/urgent pulse
- offline/grey -> desaturated grey, no pulse
- the Sentinel/hub node -> #4285F4 accent
Show each node's config label on/near the marker (clean, legible, JetBrains Mono 
or Inter). Labels must stay readable at 1920x1080 projector resolution.

## PART D — Arcs (the star of the show), all reactive to phase
Use deck.gl ArcLayer(s), styled per phase from director state:
- Phase 0 (steady): healthy green (#00FF80) transaction arcs looping between the 
  network's healthy nodes — animated flow (dashed/traveling gradient or an 
  animated offset), slow and calm.
- Phase 2 (incident): the arcs into the disrupted node turn red (#FF2828) and 
  break/fade; downstream arcs shift amber. If the scenario has an "attack" 
  concept, red arcs aimed at a protected node that FADE on arrival (bounce-off 
  effect via target color fading to transparent).
- Phase 3 (swarm): candidate reroute paths appear as DOTTED/dashed green arcs 
  (dim, "proposed" look) from the reroute source nodes toward the destination — 
  read source/target from config.rerouteNodeIds and disruptedNodeId.
- Phase 5 (resolution): the chosen reroute becomes a SOLID bright green arc with 
  strong flow animation; the disrupted node's arcs go grey. Everything else 
  settles back to calm healthy green.
Use requestAnimationFrame (or a GSAP ticker) to animate arc flow smoothly. Keep 
it performant — target 60fps at 1920x1080.

## PART E — Day/Night palette tween
The map participates in the night->dawn transition:
- Phases 0–4: dim, cool, "night" palette (darker basemap, cooler arc tints, lower 
  overall brightness).
- Phase 5: GSAP-tween the whole scene to a brighter "dawn" palette (slightly 
  warmer, higher contrast, arcs brighter) to make the room FEEL the crisis lift.
Drive this from a single reactive "palette" value tied to phase so it's one clean 
transition, not many scattered ones.

## PART F — Integration & cleanup
- SwarmMap.vue mounts inside WarRoomLayout as the main background/centerpiece; 
  HUD/agent panels overlay on top (glassmorphism) without blocking the map.
- Subscribe reactively to useDemoDirector state (phase, nodes, arcs). When the 
  director changes phase, the map updates via deck.setProps — no full re-init.
- On reset (R): cleanly return camera, palette, nodes, and arcs to Phase 0 state. 
  Cancel any running animations/tickers. No leaks, no leftover arcs.
- Properly dispose deck.gl instance and any tickers on unmount.

## CONSTRAINTS (unchanged, enforce them)
- Config-driven: zero scenario-specific coords/labels/colors-per-node in the 
  component; all from config + director state.
- Offline-first: with USE_3D_TILES=false the entire map runs in airplane mode.
- Deterministic: same visuals every run for a given phase sequence.
- Must switch cleanly between the 'supplychain' and 'banking' scenarios by 
  changing only ACTIVE_SCENARIO (different nodes/regions auto-frame correctly).
- 60fps target at 1920x1080.

## DELIVERABLE
A working SwarmMap.vue where, driving the demo with SPACE/Y/K/R, I can watch: 
calm green flows -> red incident + broken arcs -> dotted candidate reroutes -> 
solid green resolution + dawn palette — all over either the 3D globe or the 
offline static basemap. Show me how to toggle USE_3D_TILES and confirm the 
offline path makes no network calls. Verify it still works after switching 
ACTIVE_SCENARIO to 'banking'.

Do NOT build the Highcharts HUD, agent panels, approval card, or outro yet — 
those are later tasks. Focus only on the map. Explain your plan before writing code.

<!-- A couple of tips as you run this one:
Test the offline path first. Before you get seduced by the 3D tiles, confirm USE_3D_TILES=false looks great and makes zero network calls. That's your safety net on stage — the 3D globe is a bonus, not a dependency.
The arcs are the moment. If Antigravity's first pass at arc animation looks flat, push it: "make the flow animation more pronounced and cinematic, with a traveling gradient." That single effect is what makes the room lean forward.
Verify the scenario switch again at the end — different regions (Asia supply chain vs. global financial centers) should auto-frame correctly, proving the config architecture held up.
When Task 2 looks good, come back and I'll give you Task 3 (the agent thought-stream panels with the typewriter effect — where the "swarm intelligence" really comes alive).
give me task 3
Here's Task 3 — the agent thought-stream panels. This is where the "swarm intelligence" becomes visible and believable. The typewriter effect over your hardcoded scripts is what makes 100 executives believe they're watching agents think in real time. -->

# TASK 3 — AgentThoughtStream.vue: the swarm reasoning panels

Build the agent reasoning UI — the panels where each agent "thinks out loud" via 
typewriter playback of its hardcoded script. This is what makes the swarm feel 
alive. Everything reads from config.agents and is driven by useDemoDirector + 
useScriptPlayer. No hardcoded agent names, colors, or text in the component.

## PART A — Layout
- Render one panel per agent from config.agents (5 agents: 1 Sentinel + 4 
  specialists). Use a clean grid/column of glassmorphism panels overlaid on the 
  map (backdrop-blur, semi-transparent, subtle border), positioned so they don't 
  cover the map's key nodes/arcs.
- Each panel header shows: the agent's name, its role (smaller/dimmer), and a 
  status indicator dot. Use the agent's config accent color for its header 
  accent/border-glow so agents are visually distinct.
- Panel body is a scrolling console area using 'JetBrains Mono' for reasoning 
  lines (terminal/ops-console aesthetic). Auto-scroll to the newest line as text 
  streams in.
- Panels must remain legible at 1920x1080 projector resolution — generous font 
  size, high contrast.

## PART B — Agent lifecycle states (driven by director)
Each agent panel visually reflects its state from useDemoDirector:
- DORMANT: dim/greyed, low opacity, status dot grey. (Before the agent activates.)
- ACTIVE / THINKING: full opacity, accent glow, status dot pulsing in the agent's 
  accent color, reasoning streaming via typewriter.
- DONE: text fully revealed, status dot solid green (#00FF80), a subtle 
  "complete" checkmark or label. Panel stays lit but calm.
Transitions between states should be smooth (GSAP fade/scale, no hard jumps).

## PART C — Phase-driven activation sequence
Wire activation to the demo phases:
- Phase 0–1 (Quiet Hours / Signal): only the SENTINEL agent is ACTIVE. It streams 
  its script (the "I detected the signal at 04:02" reasoning). All other agents 
  are DORMANT.
- Phase 3 (The Swarm): the four specialist agents activate. Stagger their start 
  slightly (e.g. 150–300ms apart) so they don't all pop at once — it should feel 
  like a coordinated mobilization, not a simultaneous flash. Each streams its own 
  script concurrently via useScriptPlayer.
- Their reasoning lines type in char-by-char using config.timing (typeSpeedMs, 
  lineDelayMs) with a blinking cursor at the active line. Multiple agents can 
  type at once.

## PART D — The "data result" reveal (fake query, real drama)
For agents whose config has a dataResult (e.g. Finance: "APAC liquidity confirmed: 
$210M" / Risk & Compliance: "Within counterparty limits · MAS-compliant"):
- After that agent finishes streaming its script, reveal the dataResult as a 
  distinct, highlighted "result" block inside the panel — styled to look like a 
  returned query/lookup (e.g. a bordered chip or a "> RESULT:" line with the 
  value emphasized in the accent or healthy-green color).
- Add a brief "querying..." shimmer/spinner for ~800ms–1.2s BEFORE the result 
  appears, so it feels like the agent went and fetched something. (It's hardcoded 
  — this is pure theater, no API call.) Timing configurable.
- The value should visually "land" (small GSAP pop/scale) — this is a moment the 
  presenter will point at.

## PART E — Reasoning line styling for impact
Make the reasoning read like a sharp ops console, not a chatbot:
- Prefix or subtly style key action lines so they scan fast on stage.
- Optionally support simple inline emphasis in scripts (e.g. wrap a value so it 
  renders in the accent color) — but keep it robust; plain strings must still 
  render fine. If you add markup support, keep the config authoring simple.
- A blinking monospace cursor on the currently-typing line.

## PART F — Integration & reset
- AgentThoughtStream.vue subscribes reactively to useDemoDirector (which agents 
  are active, current phase) and uses useScriptPlayer to drive the typewriter for 
  each active agent.
- On reset (R): instantly clear all revealed text, cancel all in-flight 
  typewriter/timers via useScriptPlayer, return every panel to DORMANT. No 
  leftover text, no orphaned timers, no double-playback if the demo is re-run.
- Ensure re-running the full sequence (R then SPACE through again) plays 
  identically every time — deterministic.
- Clean up all timers/tickers on unmount.

## CONSTRAINTS (enforce)
- SCRIPTED: no API/network calls; all reasoning and dataResults come from 
  config.agents. The "querying" shimmer is a visual effect only.
- CONFIG-DRIVEN: agent names, roles, accent colors, scripts, dataResults, and 
  timing all read from config — nothing agent-specific hardcoded in the component.
- DETERMINISTIC & CANCELLABLE: identical playback each run; fully resettable mid-stream.
- Must render correctly for BOTH scenarios by changing only ACTIVE_SCENARIO 
  (supplychain agents vs. banking agents — different names/scripts/dataResults).
- 60fps; smooth even with 5 panels typing concurrently at 1920x1080.

## DELIVERABLE
Working AgentThoughtStream.vue where, driving the demo: in early phases only the 
Sentinel streams its reasoning; on Phase 3 the four specialists mobilize in a 
staggered cascade, each typing its scripted reasoning concurrently, with 
data-result agents showing a "querying..." shimmer then a highlighted result that 
pops. Pressing R cleanly resets all panels to dormant with no leftover state. 
Confirm it works identically after switching ACTIVE_SCENARIO to 'banking'.

Do NOT build the Highcharts HUD, approval card, topology graph, or outro yet — 
those are later tasks. Focus only on the agent panels. Explain your plan before 
writing code.

<!-- A few tips for this one:
The stagger is the magic. When Antigravity first builds Phase 3, the four agents may all activate at the exact same instant. Push it to stagger them 150–300ms apart — that tiny detail transforms it from "four boxes lit up" into "a swarm mobilizing." It reads as coordination.


The "querying..." shimmer sells the data grounding. That fake spinner before a hardcoded result is what makes a CTO believe the agent actually hit BigQuery. It's the highest-impact-per-effort trick in the whole demo. Make sure the result value pops (a small scale animation) so the presenter can point at it and say "there — it confirmed the funds."


Test concurrent typing performance. Five monospace panels typing at once can stutter if implemented naively (e.g. re-rendering the whole string every character). If it's janky, tell Antigravity to optimize the typewriter to avoid full re-renders per character.


Re-run determinism is critical. Before you move on, hit R and play through 2–3 times. If any panel double-plays, shows leftover text, or drifts in timing, fix it now — you'll be re-running this live and possibly rehearsing dozens of times.


When Task 3 looks good, come back for Task 4 (the MetricsHUD + PhaseClock + money counter + countdown + incident banner — the numbers layer that gives the C-suite something quantitative to anchor on).
give me task 4
Here's Task 4 — the numbers layer. This is what the CFO and CRO anchor on. The money counter flipping from red to green and the countdown ticking toward a deadline are the two most visceral, quantitative moments in the whole demo. -->

# TASK 4 — The metrics & status layer (HUD, clock, money counter, countdown, banner)

Build the quantitative overlay that gives executives numbers to anchor on. This 
is the layer the CFO/CRO watch. All values come from the active scenario config 
and update reactively from useDemoDirector. No hardcoded numbers/labels in the 
components. This task covers FOUR components: PhaseClock.vue, MetricsHUD.vue 
(incl. the money counter + countdown), and IncidentBanner.vue.

## COMPONENT 1 — PhaseClock.vue
- A prominent timestamp display (top corner) showing the current phase's clock 
  value from config.clock (04:00 -> 04:02 -> 04:06 -> 04:09 -> 04:09 -> 04:10).
- On each phase advance, animate the time change: the old digits tick/roll to the 
  new value (GSAP digit roll or a quick flip), so the audience SEES time barely 
  moving across the whole crisis (the "8 minutes total" point).
- Include a small "local time" / timezone label from config if present.
- In Phase 0, show a subtle "Human Team: Offline — On Call" badge next to the 
  clock using config.humanTeamLabel (e.g. "Operations Team: Offline" / "Treasury 
  Desk: Offline"). This badge disappears/flips to "Online" at resolution.
- Monospace, high-contrast, legible at 1920x1080.

## COMPONENT 2 — MetricsHUD.vue (money counter + countdown + charts)

### 2a. The money counter (the star number)
- A large, always-visible counter (top-center) that tells the whole story in one 
  number, driven by config.money and current phase:
  - Phases 0–1: neutral/calm (or hidden until the incident, your call — but it 
    must be present and prominent by Phase 2).
  - Phase 2 (incident): show the "at-risk" state in CRITICAL red — 
    config.money.atRiskLabel (e.g. "47Minordersatrisk"/"180M shortfall"). 
    Add a subtle pulse to convey urgency.
  - Phase 5 (resolution): FLIP to the "recovered/saved" state in HEALTHY green — 
    config.money.recoveredLabel (e.g. "44Mrecovered·2-daydelayavoided"/"180M settled · breach avoided").
- Animate the flip: GSAP count-up/count-down on the numeric value 
  (atRiskValue -> recoveredValue) plus a color transition red->green and a small 
  scale "pop" on landing. This transition is a designed HERO MOMENT — make it 
  feel decisive and satisfying.

### 2b. The countdown (config-driven, may be null)
- If config.countdown exists (banking scenario: "Settlement Cutoff 06:00 SGT", 
  starting "1h 54m"), render a live-ticking countdown that starts on Phase 2 and 
  keeps decrementing through Phases 3–4 to build tension.
  - Style it as an urgent deadline (amber, then red as it gets lower).
  - It must decrement on a real timer BUT stay deterministic and resettable 
    (start value from config; pure display tension — nothing depends on the exact 
    remaining time).
  - On Phase 5 (resolution), STOP the countdown and show a "SETTLED / RESOLVED" 
    state (green), freezing the remaining time.
- If config.countdown is null (supplychain scenario), render nothing here — the 
  layout must look clean and intentional without it.

### 2c. Live operational charts (Highcharts)
- A compact metrics strip using highcharts-vue showing 1–2 operational KPIs that 
  react to phase. Values are hardcoded/synthetic per phase (NO real data). 
  Suggested:
  - Latency / response-time line: single-digit-flat in Phase 0, SPIKES hard in 
    Phase 2, returns to healthy in Phase 5.
  - Throughput / transaction-volume: steady in Phase 0, DROPS in Phase 2, 
    recovers in Phase 5.
- Style Highcharts to match the design system: dark theme, no chart chrome/clutter, 
  accent colors (#00FF80 healthy, #FF2828 critical), thin lines, glassmorphism 
  panel behind. Charts should read as "live telemetry," clean and premium — not a 
  business report.
- Drive the chart data transitions from phase changes via GSAP/animated series 
  updates so the spike and recovery are smooth and dramatic.

## COMPONENT 3 — IncidentBanner.vue
- A phase-driven alert overlay/banner:
  - Phase 0–1: none (or a subtle "ALL SYSTEMS NOMINAL" in dim green).
  - Phase 1 (signal): a small AMBER "EARLY SIGNAL DETECTED" notice.
  - Phase 2 (incident): a prominent RED "CRITICAL INCIDENT" banner with the 
    scenario's crisis summary (derive from config — e.g. the disrupted node label 
    + industry framing). Urgent but not screen-blocking; slides in via GSAP.
  - Phase 3 (swarm): shifts to a BLUE/agent-accent "SWARM RESPONDING" state.
  - Phase 5 (resolution): flips to GREEN "INCIDENT RESOLVED" and then eases out.
- Never obscure the map's key nodes/arcs or the money counter. Position and size 
  it as a slim, cinematic status strip.

## INTEGRATION & RESET
- All four components subscribe reactively to useDemoDirector (phase, money state, 
  countdown, node statuses). No component holds scenario-specific constants.
- On reset (R): PhaseClock returns to 04:00 + "Offline" badge; money counter 
  returns to its Phase 0/neutral state; countdown resets to config.startRemaining 
  and stops; charts reset to Phase 0 healthy baselines; banner clears. Cancel all 
  timers/tickers — no leaks, no double-running countdowns on re-run.
- Deterministic: full R -> SPACE-through replay looks identical every time.
- Clean up all Highcharts instances and timers on unmount.

## CONSTRAINTS (enforce)
- SCRIPTED: no API/network/DB. All KPI values, money figures, and countdown 
  starts are hardcoded/synthetic in config or per-phase constants.
- CONFIG-DRIVEN: money labels/values, countdown, clock, humanTeamLabel all from 
  config — nothing scenario-specific hardcoded in components.
- Must render correctly for BOTH scenarios by changing only ACTIVE_SCENARIO:
  - supplychain: NO countdown, "$47M -> 44M","OperationsTeam".-banking:countdownpresent("Cutoff06:00SGT"),"180M -> $180M settled", 
    "Treasury Desk", resolutionBadges shown.
- Layout must look clean and intentional whether or not a countdown exists.
- 60fps; smooth chart/counter animations at 1920x1080.

## DELIVERABLE
Driving the demo: the clock ticks 04:00->04:10 across phases (barely moving); at 
Phase 2 a red at-risk money counter appears (and, in banking, a countdown starts 
ticking toward the cutoff); charts spike (latency up, throughput down); a red 
CRITICAL banner slides in; at Phase 3 the banner shifts to SWARM RESPONDING; at 
Phase 5 the money counter flips red->green with a count animation, the countdown 
freezes to RESOLVED, charts recover, and the banner turns green. Pressing R 
cleanly resets everything with no leftover timers. Confirm it works identically 
after switching ACTIVE_SCENARIO to 'banking'.

Do NOT build the ApprovalPrompt card, SwarmGraph topology, or OutroCard yet — 
those are later tasks. Focus only on the clock, HUD, and banner. Explain your 
plan before writing code.
<!-- 
A few tips for this one:
The money counter flip is your hero moment — protect it. When Antigravity first builds it, the red-to-green transition may be abrupt. Push for the full choreography: the number counts (GSAP count-up), the color transitions, and it pops on landing. This is the single frame the presenter will pause on and the room will remember. Worth iterating 2–3 times to get right.


The countdown is pure theater — keep it decoupled. Make sure nothing in the demo logic actually depends on the remaining time (it's display-only tension). If the presenter lingers on Phase 3 for two minutes while answering a question, the countdown should keep ticking harmlessly, and resolution should still freeze it cleanly whenever they hit Y.


Keep the charts restrained. Highcharts defaults look like a corporate quarterly report. Tell Antigravity explicitly to strip all chrome — no gridlines clutter, no title, no legend, thin glowing lines on dark glass. It should read as "mission control telemetry," not "PowerPoint." If the first pass looks busy, say "make it more minimal, more premium, less like a business chart."


Verify the empty-countdown layout. The supplychain scenario has no countdown. Make sure the HUD doesn't leave an awkward gap where it would be — the layout should look deliberately clean in both configurations. This is a common config-driven-UI trap.


When Task 4 looks good, come back for Task 5 (the ApprovalPrompt phone-notification card + the OutroCard morning-summary — the human-in-the-loop moment and your mic-drop closing frame).
give me task 5
Here's Task 5 — the human-in-the-loop moment and your closing frame. The approval card is the single most important strategic beat in the demo: it's the answer to every executive's unspoken question, "but does the AI act on its own?" And the outro is your mic-drop. -->

# TASK 5 — ApprovalPrompt.vue (the human-in-the-loop moment) + OutroCard.vue (the mic-drop)

Build the two narrative payoff moments: the phone-notification approval card (the 
"it wakes ME up" beat that reassures a risk-averse room) and the morning-summary 
outro (the closing frame the presenter ends on). Both read from the active 
scenario config and are driven by useDemoDirector. No hardcoded scenario text.

## COMPONENT 1 — ApprovalPrompt.vue (Phase 4: THE WAKE-UP)

This is the demo's most important STRATEGIC moment — it proves agents don't act 
autonomously on high-stakes decisions. It must feel personal, urgent, and 
premium, like a real push notification waking the executive at 4 AM.

### Trigger & behavior
- Appears when useDemoDirector reaches Phase 4 (awaitingApproval = true). 
  Everything else on screen should visually "pause"/dim slightly so all attention 
  goes to the card (a subtle dark scrim over the map/panels, but keep them faintly 
  visible behind).
- Slides in with a cinematic GSAP entrance — mimic a phone push notification 
  arriving: slide down from top or in from the side, a subtle bounce/settle, 
  optionally a soft glow. It should feel like a phone lighting up in a dark room.
- Consider framing it inside a subtle phone/device mockup (rounded corners, a 
  notification "app" header) to reinforce "this arrived on my phone at 4 AM." 
  Keep it tasteful and premium, not gimmicky.

### Content (all from config)
- Addressed to the config.approvalRole (e.g. "Treasurer" / "Operations Executive") 
  — e.g. a header like "APPROVAL REQUIRED — [approvalRole]".
- A concise recommended-action summary derived from config (the reroute plan): 
  what the swarm proposes to do, the source(s) and destination (from 
  rerouteNodeIds / disruptedNodeId + labels), and the cost/impact figure from 
  config.money.
- If config.countdown exists, show the LIVE-ticking remaining time inside the card 
  ("Cutoff in 1h 4m") to amplify the pressure of the decision.
- If config.resolutionBadges exist (banking: 'Within limits','MAS-compliant',
  'Audited'), show them as small reassurance chips ON the card, pre-approval — 
  i.e. "the swarm has already validated this is compliant/within limits," so the 
  human is approving a pre-vetted action. This is a key trust message.
- A 4 AM timestamp from config.clock.p4.

### Actions
- Two clear buttons: an APPROVE (primary, healthy-green) and a REJECT/HOLD 
  (secondary, muted) — visually mapped to the Y and K keys. Show the keyboard 
  hints on the buttons (e.g. "Approve [Y]" / "Hold [K]").
- APPROVE (Y): triggers director.approve() -> advances to Phase 5 (resolution). 
  The card should give satisfying feedback (green confirm state / checkmark 
  animation) then ease out as resolution begins.
- REJECT/HOLD (K): triggers director.kill()/reject path. Keep this graceful — 
  show a brief "Holding — swarm preparing alternate plan" state. (Per the master 
  spec K is optional; implement it as a clean, safe branch that doesn't break the 
  demo. If a full Plan B isn't built, have it clearly hold and allow the presenter 
  to then press Y to proceed, OR simply re-arm. Make the behavior obvious and 
  non-fragile — this must never leave the demo stuck on stage.)
- Buttons must be clickable AND keyboard-driven (Y/K already wired globally — 
  ensure the card responds to both without double-firing).

### Reset
- On reset (R): the card fully clears and any countdown-in-card stops. Re-running 
  the demo re-shows it cleanly at Phase 4 with no leftover state.

## COMPONENT 2 — OutroCard.vue (end of Phase 5: THE MIC-DROP)

The final frame the presenter lands on. It should feel calm, resolved, and 
quietly powerful — the emotional inverse of the 4 AM alarm.

### Trigger & behavior
- Appears a beat AFTER resolution completes in Phase 5 (let the map turn green, 
  the money counter flip, and the dawn palette settle first — THEN ease the outro 
  in). Use a short GSAP delay so it doesn't step on the resolution hero moment.
- Styled like a clean morning message/summary (email or team-message aesthetic) — 
  the "your team reads about it when they wake up" payoff. Calm, bright, premium.

### Content (all from config.outro)
- config.outro.title (e.g. "08:00 SGT — Treasury Desk Online" / 
  "08:00 — Operations Team Online").
- config.outro.body (the resolved summary: incident resolved, figure saved, cost, 
  timestamp of resolution).
- config.outro.footer (the kicker, e.g. "No action required.").
- If config.resolutionBadges exist, show them here too as final reassurance chips 
  (compliant / within limits / audited) — reinforcing the audit-trail message for 
  banking.
- Include the resolved money figure (config.money.recoveredLabel) prominently.

### Behavior
- The outro can coexist with the resolved map behind it (faint), or take a gentle 
  focus scrim — presenter's choice; make it look intentional either way.
- On reset (R): outro clears completely and returns to Phase 0 with everything else.

## INTEGRATION & RESET (both components)
- Both subscribe reactively to useDemoDirector (awaitingApproval, phase). No 
  scenario-specific constants in either component — all from config.
- Ensure the Y/K global keyboard handlers and the on-card buttons drive the SAME 
  director actions without conflicts or double-firing.
- On reset (R): both components fully clear, all in-card timers cancelled, no 
  leftover state; full replay (R -> SPACE-through -> Y) works identically every time.
- Clean up timers/tweens on unmount.

## CONSTRAINTS (enforce)
- SCRIPTED: no API/network. All plan text, figures, badges, and outro content 
  come from config.
- CONFIG-DRIVEN: approvalRole, plan summary, money, countdown, resolutionBadges, 
  and outro all from the active scenario — nothing hardcoded in components. Must 
  render correctly for BOTH scenarios by changing only ACTIVE_SCENARIO:
  - supplychain: "Operations Executive", "47M/44M", no countdown-in-card, no/empty 
    badges — card and outro must still look clean and complete.
  - banking: "Treasurer", "$180M", live cutoff countdown in card, compliance 
    badges shown on both card and outro.
- ROBUST ON STAGE: the K/reject path must never leave the demo stuck. Approve (Y) 
  must always cleanly advance to resolution.
- DETERMINISTIC & RESETTABLE.
- Premium and legible at 1920x1080.

## DELIVERABLE
Driving the demo: at Phase 4 the screen dims and a cinematic phone-style APPROVAL 
card slides in, addressed to the config role, showing the swarm's proposed plan + 
cost (+ live cutoff countdown and compliance chips in banking); pressing Y (or 
clicking Approve) confirms with satisfying feedback and advances to resolution; 
pressing K holds gracefully without breaking. After resolution settles (green map, 
flipped counter, dawn palette), a calm morning-summary OutroCard eases in with the 
saved figure and "No action required." Pressing R resets everything cleanly. 
Confirm it works identically after switching ACTIVE_SCENARIO to 'banking'.

Do NOT build the SwarmGraph topology yet — that's the next task. Focus only on the 
approval card and outro. Explain your plan before writing code.

A few tips for this one:
The approval card is your strategic centerpiece — not just a button. Its entire job is to answer "does the AI act on its own?" before anyone asks. The pre-approval compliance chips ("the swarm has already validated this is within limits") are the key detail — they tell the room the agents did the diligence and the human just confirms. In a banking room, this single card is what turns a skeptical CRO into a believer. Iterate on it until it feels genuinely reassuring, not just functional.


Make it feel like a phone at 4 AM. The push-notification framing is doing narrative work. If Antigravity's first pass looks like a generic web modal, push it: "make it look like a real phone notification arriving in a dark room — device framing, slide-in with a settle, soft glow." The presenter's line is "it wakes ME up, on MY phone" — the visual has to earn that line.


Bulletproof the K path — this is a stage-safety issue. The reject branch is the most likely thing to break live and leave you stranded in front of 100 people. Be explicit that K must never deadlock the demo, and that Y must always work afterward. Personally, I'd keep the K path minimal (a graceful "holding..." state that then lets you press Y) rather than building a full Plan B — less to go wrong on stage. Test it hard: press K, then Y, then R, in every order.


Don't let the outro step on the resolution. The Phase 5 money-counter flip (from Task 4) is a hero moment. The outro should arrive a beat after it lands, not simultaneously — otherwise they compete. The short GSAP delay matters. Watch the sequence end-to-end and tune the timing so it breathes: green map → counter flips → pause → calm outro eases in.


Verify the empty-badges / no-countdown case again. Supply chain has no in-card countdown and possibly no badges. Make sure the card and outro look deliberately complete in that configuration, not like something's missing.


When Task 5 looks good, come back for Task 6 (the SwarmGraph topology — the node-and-connection visualization showing the agents collaborating and the recursive rogue loop, which adds the "you can see them working together" dimension).
give me task 6
Here's Task 6 — the SwarmGraph topology. This is the "you can literally see them collaborating" dimension. Where the map shows geography and the panels show reasoning, this shows the swarm as a living system — agents talking to each other, and the rogue loop that has to be caught.

# TASK 6 — SwarmGraph.vue: the live swarm topology (agents collaborating + the rogue loop)

Build the node-and-connection graph that visualizes the agent swarm as a living 
system — agents activating, communicating with each other, and the recursive rogue 
loop that must be detected and isolated. This adds the "you can see them working 
together" dimension that map + panels alone don't convey. Everything reads from 
config.agents and is driven by useDemoDirector. No hardcoded agent names/positions.

## PART A — Graph structure & layout
- Render a node-link graph (use D3-force, or a lightweight canvas/SVG layout — 
  pick the most performant option and tell me your choice; avoid heavyweight 
  dependencies if a simple approach works). ASK before adding any new dependency 
  beyond the approved stack.
- One node per agent from config.agents, plus a central hub/orchestrator node 
  (the Sentinel acts as the coordinating core — position it centrally, specialists 
  around it).
- Use each agent's config accent color for its node. Node labels use config names 
  (short — abbreviate to fit if needed, full name on the panel side).
- Layout must be STABLE and deterministic — the same graph shape every run (seed 
  the layout or use fixed positions so it doesn't jitter differently each time). 
  It should look designed, not randomly scattered.
- Compact panel, glassmorphism, positioned so it complements (not competes with) 
  the map and agent panels at 1920x1080.

## PART B — Phase-driven state & connections
The graph animates through the phases, driven by useDemoDirector:
- Phase 0–1 (Quiet Hours / Signal): only the Sentinel/hub node is lit and gently 
  pulsing. Specialist nodes are DORMANT (dim). No active connections yet — a calm, 
  sleeping swarm.
- Phase 3 (The Swarm): specialist nodes light up (staggered, matching the agent 
  panel activation cadence from Task 3). Connection lines animate OUT from the hub 
  to each specialist and BETWEEN collaborating specialists — with visible 
  "message" pulses traveling along the edges (small dots flowing along the links) 
  to convey live inter-agent communication. This is the key visual: a swarm 
  wiring itself up and talking.
- Phase 4–5: connections settle into a stable, coordinated mesh; on resolution, 
  the whole graph glows healthy green (calm, "mission accomplished" state).

## PART C — The rogue loop (the drama)
Visualize a recursive rogue loop that the swarm detects and isolates — this is the 
"threat inside the system" beat:
- During Phase 3, introduce a rogue element: e.g. a distinct RED node (or a red 
  self-referencing/recursive edge on one node) that shows a tight looping 
  animation — message pulses cycling back on themselves rapidly (the "recursive 
  loop" visual), clearly abnormal vs. the healthy directed flows.
- The rogue loop should read as WRONG at a glance — red, frantic, cycling — 
  against the calm blue/green coordinated swarm.
- Make which node/edge is "rogue" config-drivable if reasonable (e.g. a 
  config.rogueLoop flag or a designated node id), but a sensible default is fine. 
  Keep it robust for both scenarios.
- On RESOLUTION (Phase 5, after approval): the rogue loop is ISOLATED — the red 
  looping node/edge goes GREY and its cycling animation stops (severed/quarantined), 
  while the healthy swarm turns green around it. This visually delivers the 
  "isolate the rogue thread" narrative beat.
- If the K/kill path is triggered, the [KILL] action can map thematically to 
  severing the rogue loop — but keep it non-fragile and consistent with the 
  approve path ultimately reaching resolution.

## PART D — Motion & polish
- Edge "message pulses": small glowing dots traveling hub->specialist and 
  specialist<->specialist, on a smooth ticker (requestAnimationFrame or GSAP 
  ticker). Speed/density should feel alive but not chaotic.
- Node states: DORMANT (dim), ACTIVE (accent glow + gentle pulse), DONE/RESOLVED 
  (healthy green), ROGUE (red, frantic cycling).
- All transitions via GSAP — smooth fades/scales, no hard pops.
- Keep it readable on a projector: don't over-crowd with edges; a clean, legible 
  mesh beats a dense hairball.

## INTEGRATION & RESET
- SwarmGraph.vue subscribes reactively to useDemoDirector (phase, which agents are 
  active, rogue-loop state). No scenario-specific constants in the component — 
  agents/colors/names from config.
- Activation cadence should visually align with the agent panels (Task 3) so the 
  two views feel like one coordinated system mobilizing.
- On reset (R): all nodes return to DORMANT, all edges/pulses clear, rogue loop 
  removed, animations/tickers cancelled. Full replay looks identical every time.
- Clean up the layout simulation, tickers, and tweens on unmount. No leaks.

## CONSTRAINTS (enforce)
- SCRIPTED: no API/network/DB. Topology, connections, and rogue loop are all 
  driven by config + phase state — pure visualization.
- CONFIG-DRIVEN: agent nodes/names/colors from config.agents; nothing 
  scenario-specific hardcoded. Must render correctly for BOTH scenarios by 
  changing only ACTIVE_SCENARIO (different agent sets: supplychain vs. banking).
- DETERMINISTIC: stable layout + identical animation sequence every run.
- PERFORMANT: 60fps at 1920x1080 with all nodes active, edges pulsing, and the 
  rogue loop cycling simultaneously (alongside the map + agent panels already 
  running). If it competes for frame budget with the map, tell me and propose the 
  lightest approach.
- ROBUST ON STAGE: never leaves the graph in a broken/stuck state on reset or on 
  the K path.

## DELIVERABLE
Driving the demo: in early phases the swarm graph shows only the Sentinel hub 
pulsing calmly; at Phase 3 the specialists light up in a staggered cascade and 
connection lines animate out with message pulses flowing between agents (a swarm 
wiring itself up), while a red recursive rogue loop cycles frantically; at 
resolution the rogue loop is severed to grey and the whole swarm settles into a 
calm healthy-green coordinated mesh. Pressing R cleanly resets to a dormant hub. 
Confirm it works identically after switching ACTIVE_SCENARIO to 'banking', at 
60fps alongside the map and agent panels.

This is the last major visual component. After this, explain your plan before 
writing code — and once it's working, remind me to do a full end-to-end pass: 
R -> SPACE through all 6 phases -> Y -> outro, in BOTH scenarios, checking 
determinism, performance, and the offline (USE_3D_TILES=false) path.

A few tips for this one:
Watch your total frame budget. This is the moment where you now have three animated systems running at once — the deck.gl map (arcs flowing), five typewriter panels, and this force graph with pulsing edges. That's where jank creeps in. If it stutters, the graph is usually the cheapest to simplify: reduce edge-pulse density, use fixed positions instead of a live force simulation, or render to canvas instead of SVG. Tell Antigravity performance is non-negotiable and it should propose the lightest approach rather than the fanciest.


The rogue loop must read as "wrong" instantly. Its whole job is to be visually alarming against the calm swarm — red, frantic, cycling back on itself. Don't let it get lost in the mesh. If Antigravity's first pass is too subtle, push it: "make the rogue loop unmistakably abnormal — faster, redder, clearly cycling — so a viewer 30 feet away sees something is wrong." Then the severing-to-grey at resolution becomes a satisfying payoff.


Sync the cascade with the panels. The graph nodes lighting up should feel like the same event as the agent panels activating in Task 3 — same stagger, same rhythm. If they fire on different timings it'll feel like two disconnected widgets instead of one swarm mobilizing. Watch them side by side and tune until they feel unified.


Consider whether you even need the force simulation. Honestly, for a deterministic demo, fixed hand-placed node positions often look better and more designed than a physics layout — and they're far more performant and reliable. A live force sim can settle into a slightly different shape each run, which fights your determinism goal. I'd lean toward fixed positions with animated edges. Let Antigravity weigh in, but don't be afraid to overrule it toward the simpler, stabler approach.


This is your last big build — then it's all polish. After Task 6, the remaining work is integration and rehearsal, not new features. Resist the urge to add more components; the demo is complete. The next phase is making the six pieces feel like one cinematic experience.



When Task 6 works, do the full end-to-end pass I flagged in the prompt. Then come back and I'll give you a final "Task 7 — Polish & Stage-Hardening" prompt: unifying the timing across all components, the master GSAP sequence, a pre-flight checklist, the offline dry-run, and the one-key-reset rehearsal loop. That's the difference between "it works on my machine" and "it's flawless in front of 100 executives."
give me task 7
Here's Task 7 — the polish and stage-hardening pass. This is the task that separates "impressive prototype" from "flawless in front of 100 executives." No new features — just making the six pieces feel like one cinematic experience and bulletproofing it for the room.

# TASK 7 — Polish & Stage-Hardening (NO new features)

The six components are built. This task is about making them feel like ONE 
cinematic experience and making the demo bulletproof for a live presentation to 
100 C-level executives. Do NOT add new features or components. Only unify, refine, 
harden, and verify. Work through the sections below in order.

## PART A — Unify timing into one master sequence
Right now each component reacts to phase changes on its own timing. Make each 
phase transition feel like a single choreographed beat:
- Create a single source of choreography (e.g. a phase-transition orchestrator in 
  useDemoDirector or a dedicated composable) so that when a phase advances, all 
  components animate in a coordinated, intentional order — not simultaneously and 
  not randomly staggered.
- Define a clear beat order per transition. Example for Phase 2 (incident): 
  banner slides in -> node flashes red -> arcs break -> money counter appears -> 
  charts spike -> countdown starts. Each with small, deliberate offsets so the eye 
  is led through the story, not overwhelmed.
- Example for Phase 5 (resolution): reroute arc turns solid green -> rogue loop 
  severed to grey -> node statuses settle -> money counter flips (hero moment) -> 
  dawn palette tween -> [beat] -> outro eases in. The money-counter flip and the 
  dawn tween are the emotional peak — give them room; don't let anything step on them.
- Tune every offset so the whole thing breathes. Nothing should feel abrupt; 
  nothing should feel laggy. Make these beat timings easy to adjust (constants in 
  one place) so I can fine-tune pacing during rehearsal.

## PART B — Cross-component consistency
- Verify the agent-panel activation cadence (Task 3) and the swarm-graph node 
  cascade (Task 6) fire on the SAME rhythm so they read as one swarm mobilizing, 
  not two separate widgets.
- Verify all accent colors, glows, fonts, and glassmorphism styling are 
  consistent across every component (map overlays, HUD, panels, graph, cards). 
  Audit for any off-palette color, inconsistent border-radius, mismatched blur, or 
  stray font. Fix so the whole screen looks like one design system.
- Verify z-index / layering: the approval card is above everything at Phase 4; the 
  outro is above everything at the end; nothing important is ever obscured 
  (money counter, key nodes/arcs, active agent text) at any phase.

## PART C — Stage-hardening (this is the critical part)
Make the demo impossible to break live:
1. OFFLINE PROOF: confirm with USE_3D_TILES=false the ENTIRE demo runs in 
   airplane mode — no network requests anywhere. Grep the built output / runtime 
   for fetch/axios/XHR/WebSocket and confirm none fire (except, only when 
   USE_3D_TILES=true, the maps tiles). Report what you find.
2. 3D-TILES AUTO-FALLBACK: confirm that if USE_3D_TILES=true but tiles fail/timeout 
   (~3s), it auto-drops to the static basemap without breaking. Simulate a failure 
   and verify.
3. RESET IS TOTAL: pressing R from ANY phase (including mid-typewriter, 
   mid-countdown, mid-approval, mid-resolution) must instantly and cleanly return 
   to a pristine Phase 0 — no leftover text, no orphaned timers/tickers, no 
   double-running countdowns, no stuck cards. Test R from every single phase and 
   from mid-animation states.
4. KEY-MASH SAFETY: rapidly pressing SPACE (or SPACE during animations, or 
   double-pressing) must never skip a phase incorrectly, double-fire, or corrupt 
   state. Debounce/guard phase transitions so they only advance one clean step and 
   ignore input while a transition is mid-flight (or queue it safely). Test 
   aggressive key-mashing on every key (SPACE/Y/K/R).
5. K-PATH SAFETY: pressing K at Phase 4 must never deadlock; Y must always work 
   afterward; R must always recover. Test K then Y, K then R, K then K.
6. NO CONSOLE ERRORS: the full run (both scenarios, both USE_3D_TILES values) must 
   produce zero console errors or unhandled promise rejections. Fix any that appear.
7. MEMORY/LEAK CHECK: run R -> full sequence 10+ times in a row; confirm no growing 
   timer count, no accumulating listeners, no rising memory, no degrading framerate 
   over repeated runs (rehearsals will run this dozens of times).

## PART D — Performance verification
- Confirm a sustained 60fps at 1920x1080 through the heaviest moment (Phase 3: map 
  arcs + 5 typewriter panels + swarm graph pulsing + rogue loop + charts all 
  animating at once). If any moment drops frames, identify the culprit and 
  optimize (the swarm graph or arc density are the usual suspects — reduce pulse 
  density, use fixed graph positions, throttle non-critical animations). Report 
  before/after.
- Confirm the demo loads fast and the initial Phase 0 state is calm and stable 
  (no layout shift, no pop-in) so the presenter can leave it running before they 
  start.

## PART E — Both-scenario verification
Run a FULL end-to-end pass in BOTH scenarios (change only ACTIVE_SCENARIO):
- supplychain: R -> SPACE x5 through all phases -> Y -> outro. Verify no 
  countdown, correct "47M/44M", "Operations Executive", clean layout with no 
  gaps where the countdown would be.
- banking: same pass. Verify countdown ticks and freezes correctly, "$180M/settled", 
  "Treasurer", compliance badges on card + outro, correct financial-center map framing.
- Confirm switching scenarios requires changing ONLY ACTIVE_SCENARIO — no other 
  edits, no errors.

## PART F — Presenter pre-flight checklist (deliverable doc)
Create a short PRESENTER.md at the project root containing:
- How to run the demo (dev command + how to build/run a production build).
- The keyboard controls (SPACE / Y / K / R) and what each does.
- The two config flags (ACTIVE_SCENARIO, USE_3D_TILES) and exactly where to set them.
- The 6-phase runbook: for each phase, what appears on screen + the presenter's 
  spoken dialogue line (pull dialogue from config.dialogue).
- A PRE-FLIGHT CHECKLIST for the day-of: set USE_3D_TILES per venue wifi, 
  disable OS notifications/screensaver/auto-updates, set display to 1920x1080, 
  full-screen the browser, do one silent R -> full run before the audience arrives, 
  confirm the reset key, have the offline mode ready as the safe default.
- A "if something goes wrong" section: press R to reset to a clean state at any time.

## CONSTRAINTS
- NO new features/components. Polish, unify, harden, verify, document only.
- Preserve config-driven + scripted + offline-capable + deterministic guarantees.
- Everything must remain switchable between scenarios via ACTIVE_SCENARIO only.

## DELIVERABLE
A stage-ready demo: every phase transition is one choreographed cinematic beat; 
the visual language is consistent across all components; it runs at 60fps at 
1920x1080; it survives R-from-anywhere, key-mashing, and the K-path with zero 
errors or leaks; it runs fully offline with USE_3D_TILES=false; it works 
identically in both scenarios by changing one value; and PRESENTER.md gives me a 
runbook + pre-flight checklist. Report the results of every hardening check in 
Part C, the performance numbers in Part D, and confirm both scenarios in Part E. 
Explain your plan before making changes.

A few tips for this final stretch:
This is where the demo actually gets good. Everything up to now made the pieces work. Part A — unifying the timing into choreographed beats — is what makes it feel like a film instead of a dashboard. Spend real time here. The difference between "components reacting to a phase change" and "a single directed beat leading the audience's eye" is the difference between polite applause and jaws dropping.


Rehearse with the actual hardware, early. The single biggest cause of live demo failure isn't code — it's the environment. A projector at 1920×1080 renders differently than your Retina MacBook. Test on the real display, or at minimum set your browser to exactly 1920×1080, days before. Fonts that look crisp on Retina can look thin on a projector; glows that pop on your screen can wash out on a big screen in a bright room.


Treat the offline mode as your default, not your backup. I'd genuinely recommend presenting with USE_3D_TILES=false unless the venue wifi is rock-solid and you've tested it in that room. The static basemap looks great and it will never let you down. The 3D globe is a "nice to have" you turn on only when you're certain. Conference wifi has ended more demos than bad code ever has.


The reset key is your safety net — make it muscle memory. No matter what happens on stage — a wrong keypress, a weird state, a question that derails the flow — R gets you back to a pristine start instantly. Rehearse hitting it. Know that it always works. That confidence lets you present relaxed, because you know nothing is unrecoverable.


Do the 10x repeat-run leak test seriously. You will run this demo far more in rehearsal than in the actual presentation. If there's a slow leak — an accumulating timer, a growing listener count — it won't show on run #1 but it'll cause mysterious jank by run #15, possibly right when you're presenting. Catching it now saves you a baffling day-of problem.


Read PRESENTER.md out loud as if presenting. Once Antigravity generates it, actually walk through it. The dialogue lines from config.dialogue should feel natural coming out of your mouth. Tweak any that don't. The best technical demo still fails if the narration is stiff — and the reverse is also true: confident, well-timed narration can carry even a modest visual.



That's the full seven-task arc — from empty folder to a stage-ready, config-driven, offline-proof, cinematic agentic war room that flips between supply-chain and banking scenarios with a single value.
When you've run it end to end, if you want, come back and I can help you with the narration script and stage delivery — the pacing of what you say over each phase, where to pause, which numbers to point at, and how to land the closing line. The visuals are only half the demo; how you present them is the other half. Good luck — this is going to be genuinely impressive.
Evaluate Compare

