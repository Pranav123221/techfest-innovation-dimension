# Techfest — The Innovation Dimension

> An interactive, continuous 3D digital experience engineered for the **Techfest IIT Bombay College Ambassador** task.

---

## Overview

**Techfest — The Innovation Dimension** is an independent 3D interactive website concept created for the Techfest IIT Bombay College Ambassador selection task. 

Rather than presenting a generic flat web page or static portfolio, the visitor enters a futuristic dimension representing Techfest. The entire website functions as one continuous 3D flight journey where scrolling propels the camera physically through the 3D environment across five dedicated experiential zones:
1. **00 / Origin** — The Central Techfest Innovation Core
2. **01 / Compete** — Kinetic Multi-Ring Robotics Arena
3. **02 / Build** — Modular Assembly Matrix & Laser Lattice
4. **03 / Explore** — High-Velocity Warp Particle Tunnel
5. **04 / Connect** — Synaptic Neural Constellation Network
6. **05 / The Next Frontier** — Singularity Convergence & Portal to the Official Platform

---

## Features

- **Procedural 3D Environment (Zero External 3D Models):** Geometries, rings, nodes, and particles are mathematically generated via Three.js primitives and buffers, ensuring zero asset download delays and high performance.
- **Scroll-Driven 3D Flight Path:** GSAP ScrollTrigger orchestrates camera positioning, dynamic `lookAt` orientation vectors, and atmospheric fog density based on user scroll position.
- **Interactive Raycasting:** Hovering over 3D orbital satellites, arena trophies, voxel blocks, or neural nodes triggers procedural scale shifts, glow enhancements, sound cues, and telemetry tooltips.
- **Synthesized Audio Engine:** Built-in Web Audio API frequency synthesizer produces ambient sub-frequency hums and tactical UI interaction beeps without loading external audio assets.
- **Dynamic Heads-Up Display (HUD):** Fixed cybernetic overlay tracking current zone indices (`00 / 05` through `05 / 05`), dynamic 3D camera coordinates, and a flight progress bar.
- **Responsive & Performance-Capped:** Automatic device pixel ratio (DPR) capping, mobile geometry tiering, and `prefers-reduced-motion` compliance.

---

## Tech Stack

- **HTML5:** Semantic document architecture and accessible HUD overlays.
- **CSS3 / Tailwind CSS:** Glassmorphism, cybernetic typography, custom cursor, and scanline shaders.
- **JavaScript (ES6+):** Vanilla procedural logic for clean integration and zero compilation overhead.
- **Three.js (r128):** Real-time WebGL rendering, custom buffers, lighting, and raycasting.
- **GSAP & ScrollTrigger:** Scroll-synchronized 3D spline camera interpolation.
- **Web Audio API:** Procedural sound synthesis.

---

## Project Structure

```text
techfest-innovation-dimension/
│
├── index.html       # Semantic HTML layout, HUD, overlays & CDN imports
├── style.css        # CSS variables, animations, cursor, and glassmorphism
├── script.js       # Procedural 3D scene, ScrollTrigger flight & interactions
└── README.md        # Project documentation & run guide
```

---

## How to Run Locally

### Option 1: Direct Browser Launch
Because all assets and shaders are procedural and CDN-imported, you can open `index.html` directly in any modern browser:
```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

### Option 2: Local HTTP Server (Recommended)
If you prefer running via a local web server (e.g., using Python or Node.js):

**Using Python 3:**
```bash
python3 -m http.server 8000
```
Then visit: `http://localhost:8000`

**Using Node.js (`npx serve`):**
```bash
npx serve .
```

**Using VS Code:**
Install the **Live Server** extension, right-click `index.html`, and select **"Open with Live Server"**.

---

## Controls & Interactions

| Action | Result |
| :--- | :--- |
| **Scroll / Trackpad** | Navigates the 3D camera along the spatial flight path through all 5 zones. |
| **Mouse Drag / Move** | Subtle camera parallax orientation and perspective shift. |
| **Object Hover** | Highlights interactive 3D nodes, expands cursor, and displays telemetry tooltips. |
| **Object Click** | Triggers an interactive spatial scale pulse and tactical audio chirp. |
| **SFX Button (HUD)** | Toggles the procedural Web Audio ambient hum and interaction sounds. |
| **README Button (HUD)** | Opens the in-app architectural documentation modal. |
| **Enter Dimension CTA** | Launches the initial camera flight transition into the 3D world. |

---

## Note

> **Disclaimer:** This is an independent concept created for the Techfest IIT Bombay College Ambassador task and is not an official Techfest website.