# Browser Football Game - Agent Instructions

## Goal
Build a lightweight 2D browser football game that runs in the browser and is fun to play in short sessions.

## Product scope for v1
Implement:
- main menu
- match scene
- one controllable player
- one ball
- movement
- passing
- shooting
- simple opponent AI
- score
- timer
- restart match flow
- desktop keyboard controls
- basic mobile controls only if easy after desktop works

Do not implement in v1:
- online multiplayer
- accounts
- backend server
- cosmetics store
- complex physics simulation
- commentary
- tournaments

---

## Advanced gameplay scope (post-v1 / target complexity)

Gameplay should evolve toward **much more complex** football simulation. Prefer depth over breadth: implement each area with as much nuance as the codebase can support.

### Movement and control
- **Stamina and sprint:** Sprint key drains stamina; walking/jogging recovers it. Max speed and acceleration reduced when exhausted.
- **Momentum and acceleration:** No instant velocity changes. Acceleration and deceleration curves; turning costs speed.
- **Dribble vs run:** Toggle or hold for “close control” (slower, ball stays closer, harder to tackle) vs “knock-on” (faster, ball further ahead, easier to lose).
- **Tackling:** Standing tackle (timing window, risk of foul) and optional slide tackle (higher risk, recovery time).
- **First touch / trapping:** On receiving a pass, first touch quality (direction, distance ball travels) depends on pass strength, angle, and a simple “control” stat.

### Ball and physics
- **Ball spin and curve:** Shot and pass direction/input can add spin; trajectory curves in the air.
- **Ground vs air:** Different friction and bounce for ground passes vs lofted balls; air time and landing behavior.
- **Realistic bounce and friction:** Pitch friction, ball deceleration, bounce height/dampening.
- **Out of play:** Ball out over sideline → throw-in; over goal line (not in goal) → corner or goal kick. Implement throw-ins, goal kicks, corners as set pieces with dedicated flow.

### Passing
- **Short vs long pass:** Different power/accuracy curves; long passes more affected by pressure and angle.
- **Through balls:** Pass into space ahead of a teammate (lead the runner).
- **Lob / chip:** Lofted pass over defenders; different arc and speed.
- **Accuracy factors:** Pressure (nearby opponents), body angle to target, simple “passing” stat, distance.
- **Pass recipient selection:** When multiple teammates are valid targets, allow player to choose (e.g. cycle or direct select).
- **One-twos:** Give-and-go: pass and then trigger run; optional one-touch return pass.

### Shooting
- **Power and placement:** Charge shot (hold to power up); aim left/center/right (and optionally height) of goal.
- **Shot types:** Finesse (curved, less power) vs power (straight, more power); volleys and headers when ball is in the air.
- **Accuracy and curve:** Shots can miss or curl; affected by balance, pressure, and a “shooting” stat.
- **Goalkeeper:** AI keeper with positioning, reaction time, dive direction, and parry/catch behavior. Difficulty affects reaction speed and positioning quality.

### Team and tactics
- **Full team:** Multiple outfield players per side (e.g. 5–7); each with position and basic role.
- **Formations:** Selectable formations (e.g. 2-1-2, 3-1-1, 3-2) that set default positions and movement tendencies.
- **Player switching:** Cycle or direct select which outfield player the human controls; AI controls others by tactic.
- **Offside:** Optional offside rule with line and ref decision.
- **Team mentality:** Attack / Balanced / Defend; affects line height, pressing, and forward runs.
- **Set pieces:** Corners and free kicks with run-up, aim, and power; optional quick routines.

### Opponent and AI
- **Multiple AI players:** Defenders, midfielders, attackers with distinct roles and positioning.
- **Pressing:** High press, mid block, low block; affects when and where AI closes down.
- **Marking:** Man-marking and zonal marking options; defenders track runners or cover zones.
- **Counter-attack and transitions:** When ball is won, AI looks for quick break; when ball is lost, recovery runs.
- **Goalkeeper AI:** As above; distribution (throw, short kick, long kick) after save or catch.
- **Difficulty levels:** Easy / Medium / Hard affecting reaction time, pass/shot accuracy, aggression, and decision speed.

### Match flow and rules
- **Halves and half-time:** Two halves with a half-time screen; optional team talk or tactic change.
- **Stoppage time:** Add time at end of each half (e.g. based on goals or simple random).
- **Substitutions:** Bench of subs; allow substitutions at half-time or after a set time.
- **Fatigue and injuries:** Optional: stamina per player over the match; optional injury (e.g. collision) that forces sub.
- **Fouls and free kicks:** Tackle can be foul; free kick from spot; optional cards (yellow/red) and penalty for foul in box.

### Progression and stats (optional)
- **Player stats:** Per-player or per-position attributes (speed, acceleration, shot, pass, tackle, control) that affect the above systems.
- **Unlockables:** Optional: formations, tactics, or stadiums unlocked by wins or goals.
- **Season / career:** Optional: multiple matches, league table, simple season progression.

## Tech stack
- TypeScript
- Vite
- Phaser 3
- Vitest
- ESLint

## Architecture rules
- Keep rendering and gameplay logic separate
- Keep constants in a dedicated config module
- Use small modules
- Prefer simple clear code over abstractions
- Avoid adding dependencies unless necessary
- Keep core game logic framework-light where possible

## Folder structure target
- src/game/scenes
- src/game/entities
- src/game/systems
- src/game/config
- src/ui
- src/utils
- tests

## Quality bar
Before finishing a task:
- run build
- run tests if relevant
- avoid unrelated changes
- keep README updated when setup or controls change

## Coding rules
- Use descriptive names
- Avoid giant files
- Add comments only where needed
- Do not leave dead code unless clearly marked as temporary
- Prefer incremental changes that keep the game playable

## Task behavior
When asked to implement something:
1. inspect current codebase first
2. make a short plan
3. implement the smallest good version
4. verify it runs
5. summarize what changed and what remains

## Definition of done for features
A feature is done when:
- it works in local gameplay
- it does not break existing flow
- build passes
- controls and behavior are documented if user-visible

## Current priority order (base game)
1. project scaffold
2. playable pitch and player movement
3. ball and possession
4. pass
5. shoot
6. opponent behavior
7. score and timer
8. polish

## Priority order for advanced gameplay
After the base game, implement advanced features in dependency order: movement/stamina/physics → passing depth → shooting depth → set pieces → full team and formations → player switching → opponent AI depth → goalkeeper → match flow (halves, fouls, subs) → optional progression.
