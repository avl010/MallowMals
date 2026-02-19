# MallowMals — Cerealsona Personality Quiz

An interactive personality quiz disguised as a blind box unboxing experience. Instead of it being randomly selected, the character you receive is a reflection of **your personality and choices**.

## Concept

The experience unfolds through a chatbot conversation on a simulated phone screen. A mysterious message from an unknown number invites you to take a quiz and depending on how you respond, you're guided through 12 questions about a simple morning routine relating to cereal.

Your choices map to one of six characters, each representing a different personality type. After the quiz, you tap a shaking blind box to build anticipation before your character is revealed.

## Features
- **Conversational quiz UI** — chatbot-style dialogue with typing indicators and sound effects
- **Branching narrative** — multiple paths through the intro based on your responses
- **Blind box unboxing** — tap-to-open mechanic with shake animation before the reveal
- **Six unique result types** — each with an illustrated character card showing description, strengths, weaknesses, and compatibility
- **3D character models** — toggle between 2D card and interactive 3D model (rotate and zoom)
- **Save your result** — download your character card image

## Files
- `index.html` — main UI and markup
- `script.js` — quiz logic, scoring, UI behaviors
- `IMG/` — artwork and result images (keep filenames referenced in `script.js`)
- audio files (`vibe.mp3`, `ding.mp3`, `pop.mp3`) — UI sounds

## Credits
- Codebase & UI: adapted from I-see Warisa Jaidee — referenced in the UI as [@izonfalzo](https://iseej.github.io/Card/).
- Third-party library:
  - **html2canvas** (via CDN) — used for screenshot/export functionality.
  - **Three.js** (v0.160.0, ES modules) — 3D model rendering and interaction (GLB format)
  - [es-module-shims](https://github.com/guybedford/es-module-shims) — import map polyfill
- Tools:
  - GitHub Copilot — assisted during development for code editing. Copilot helped suggest improvements and perform repetitive edits but final code decisions and testing were made by me.
