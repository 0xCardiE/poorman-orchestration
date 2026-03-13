# Browser Football Game Plan

## Objective
Build a playable browser football game MVP, then evolve toward **much more complex** gameplay (see advanced milestones and AGENTS.md “Advanced gameplay scope”).

---

## Base game (MVP)

### Milestone 1 - Scaffold
- Set up Vite + TypeScript
- Add Phaser 3
- Add ESLint
- Add Vitest
- Create initial folder structure
- Create README with setup and commands

### Milestone 2 - Basic Playable Scene
- Add main menu scene
- Add match scene
- Render pitch
- Add controllable player placeholder
- Add keyboard movement
- Keep player within pitch bounds

### Milestone 3 - Ball and Possession
- Add visible ball
- Add player possession state
- Ball follows player while in possession
- Structure code for future passing/shooting

### Milestone 4 - Pass
- Add pass action
- Use movement/facing direction
- Ball travels independently
- Keep implementation simple

### Milestone 5 - Shoot
- Add shoot action
- Shot stronger than pass
- Reuse sensible ball logic

### Milestone 6 - Opponent
- Add at least one simple opponent
- Opponent moves simply toward ball or defends zone
- Keep AI readable and intentionally basic

### Milestone 7 - Goals and Match Rules
- Add left and right goals
- Increment score on goal
- Add visible timer
- Add restart flow

### Milestone 8 - Polish
- Improve controls text
- Improve HUD
- Fix obvious bugs
- Keep code tidy without large refactors

---

## Advanced gameplay (complexity targets)

Implement in order; each milestone should push **gameplay depth** as far as is practical. Prefer one system done well over many half-done.

### Milestone 9 - Movement depth
- **Stamina and sprint:** Sprint key; stamina bar that drains when sprinting and recovers when not. Reduced max speed/acceleration when exhausted.
- **Momentum and acceleration:** No instant velocity changes; acceleration and deceleration curves; turning reduces speed.
- **Dribble vs run:** Toggle or hold for close control (slower, ball closer) vs knock-on (faster, ball ahead); affects tackle susceptibility.

### Milestone 10 - Tackling and first touch
- **Standing tackle:** Timing-based tackle when near opponent with ball; risk of foul (ref + free kick later).
- **First touch / trapping:** On receive, ball direction and distance from first touch depend on pass strength, angle, and a simple control stat.

### Milestone 11 - Ball physics depth
- **Ball spin and curve:** Pass and shot input can add spin; trajectory curves in air.
- **Ground vs air:** Different friction and bounce for ground vs lofted balls.
- **Realistic bounce and friction:** Pitch friction, ball deceleration, bounce dampening.

### Milestone 12 - Out of play and set pieces (basics)
- **Out of play:** Sideline → throw-in; goal line (no goal) → corner or goal kick. Ball placement and restart flow.
- **Throw-in, goal kick, corner:** Dedicated set-piece state; aim and power for throw/corner; goal kick from 6-yard area.

### Milestone 13 - Passing depth
- **Short vs long pass:** Different power/accuracy; long passes more sensitive to pressure and angle.
- **Through balls:** Pass into space ahead of a teammate.
- **Lob/chip:** Lofted pass over defenders.
- **Accuracy factors:** Pressure, body angle, passing stat, distance.
- **Pass recipient selection:** When multiple teammates valid, cycle or select target.

### Milestone 14 - Shooting depth
- **Power and placement:** Charge shot (hold to power); aim left/center/right (and height) of goal.
- **Shot types:** Finesse (curve, less power) vs power; volleys and headers when ball in air.
- **Accuracy and curve:** Shots can miss or curl; pressure and shooting stat.

### Milestone 15 - Goalkeeper
- **Goalkeeper entity:** AI keeper with position between ball and goal.
- **Reactions and diving:** Reaction time, dive direction, parry vs catch.
- **Difficulty:** Easy/Medium/Hard affects reaction speed and positioning.

### Milestone 16 - Full team and formations
- **Multiple outfield players:** e.g. 5–7 per side with positions (def, mid, att).
- **Formations:** Selectable formations (e.g. 2-1-2, 3-1-1) setting default positions and movement.
- **AI teammates:** Non-controlled players move by formation and simple roles.

### Milestone 17 - Player switching
- **Cycle controlled player:** Key to cycle which outfield player the human controls.
- **Direct select (optional):** Click or shortcut to select specific player.
- **Camera or focus:** Keep selected player in view; smooth handoff.

### Milestone 18 - Opponent AI depth
- **Multiple AI players:** Defenders, midfielders, attackers with roles.
- **Pressing:** High / mid / low block; when and where AI closes down.
- **Marking:** Man-mark or zonal; track runners or cover zones.
- **Counter-attack:** On ball won, AI looks for quick break; on ball lost, recovery runs.

### Milestone 19 - Match flow and rules
- **Halves and half-time:** Two halves; half-time screen; optional tactic/mentality change.
- **Stoppage time:** Add time at end of each half.
- **Fouls and free kicks:** Tackle can be foul; free kick from spot; optional yellow/red; penalty for foul in box.

### Milestone 20 - Optional progression
- **Player/team stats:** Attributes (speed, shot, pass, tackle, control) affecting gameplay.
- **Substitutions:** Bench and subs at half-time or after time.
- **Fatigue (optional):** Stamina per player over match.
- **Season/career (optional):** Multiple matches, league table, simple progression.

### Milestone 21 - Polish and balance
- **Difficulty tuning:** Balance reaction times, accuracy, aggression across Easy/Medium/Hard.
- **HUD and feedback:** Stamina, selected player, formation, score, time, set-piece indicator.
- **One-twos and extras:** Give-and-go; optional unlockables (formations, etc.) if scope allows.

---

## Execution rules
- Complete base milestones 1–8 first; then advanced 9–21 in order.
- After each milestone, verify project still builds and game stays playable.
- If something is unclear, choose the interpretation that maximizes **gameplay complexity** within the existing architecture.
- Record progress in README or a progress section.
