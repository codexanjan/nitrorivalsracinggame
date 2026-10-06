# Contributing to Nitro Rivals

Play the [live game](https://nitro-rivals.vercel.app/) first, then see the README for local setup and controls.

## Report a bug

Open an issue with the track, car, race mode, difficulty, browser/device, steps to reproduce, and expected versus actual behavior. Attach a gameplay screenshot or short recording when possible. Keep account details and private information out of reports.

## Suggest a feature

Describe the experience you want and how it improves a race. Small improvements to driving, performance, accessibility, character detail, and track design are welcome.

## Submit a change

Keep changes focused. Run `npm test` and check the affected behavior in a browser. Include screenshots for visual changes. For physics changes, check all four cars and three tracks; preserve equal car performance and collision rules for the human and bots. Avoid adding external runtime dependencies unless they solve a clear problem.

The tests cover simulation behavior. Browser testing is also needed for rendering, audio, input, and responsive layouts.
