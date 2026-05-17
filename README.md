# KR Bot Automation Model Viewer NPC

This version uses Google's <model-viewer>, not Three.js imports.

Fixes:
- invisible robot from Three.js import errors
- robot not clickable
- mobile visibility/z-index
- old repair arm removed

Robot path:
assets/robot.glb

Upload all:
- index.html
- style.css
- script.js
- README.md
- assets/
- api/

Clicking the robot, model, or speech bubble opens KR chat.


Alive NPC update:
- fake walking bob/tilt for GLB with no walk animation
- patrols faster
- lower/closer model camera
- shadow under robot so it looks grounded
