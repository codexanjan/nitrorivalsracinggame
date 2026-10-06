# Code map

Nitro Rivals is a static browser application. It runs entirely on the client, with no backend or account system.

| File | Responsibility |
| --- | --- |
| `index.html`, `style.css` | Landing page, garage, race HUD, results, touch controls, responsive layout |
| `game.js` | UI orchestration, input, fixed-step loop, render interpolation, cameras, race results |
| `core.js` | Car/driver/track definitions, vehicle handling, AI decisions, damage, economy, local saves |
| `collision.js` | Rotated car bounds, road limits, solid contact separation, safe spawn selection |
| `jumps.js` | Ramp ascent, launch, gravity, airborne state, landing |
| `world.js` | Track geometry, three procedural environments, pickups, ramps, finish gates |
| `models.js` | Cars, wheels, lamps, car animation |
| `characters.js` | Six procedural racer meshes, face and clothing details |
| `cockpit.js` | Interior geometry, live instruments, GPS, rear-view mirror |
| `podium.js` | Trophy-holding champion, top-three stage, red carpet, confetti, ceremony camera |
| `effects.js` | Pooled smoke, sparks, debris, nitro trails |
| `audio.js` | Web Audio synthesis, music scheduling, racing effects |
| `vendor/` | Bundled Three.js and its license |
| `tests/` | Simulation regression checks and their runner |

## Simulation rules

Physics advances at 60 fixed steps per second. Rendering interpolates poses between steps; rendered car poses also undergo separation to prevent visual intersections. Car contact is independent of the damage cooldown. Airborne clearance includes pitch, nose/tail extent, and the height of both cars.

Human and bot cars use the same selected car stats and installed upgrades. Bots choose lanes, throttle, braking, drift and nitro through the same handling integrator. Difficulty controls their decisions.

Coins, inventory, purchased cars, paint, upgrades, settings and personal bests are saved in browser local storage under `nitro-rivals-v2`. No save data is sent to a server. Race payouts are settled once per completed race.

Web Audio starts after a user gesture, synthesizes the soundtrack/effects, and pauses when the tab is hidden. External fonts are optional. All racing logic and graphics assets required to play are included locally.

## Testing limits

Run `npm test` for the deterministic simulation checks. They do not guarantee the absence of all bugs or verify GPU rendering, actual speaker output, browser-specific gamepad layouts, or every mobile device. Check those interactively when changing affected code.
