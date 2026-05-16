# KR Bot Automation Final Anchored NPC Robot

This version uses the robot image from your reference and makes it a page-anchored NPC:
- position: absolute, not fixed
- walks between real HTML sections
- fixes/scans sections
- welding sparks appear on target elements
- clicking robot opens Gemini chat
- robot stays in page coordinates when scrolling

Upload:
- index.html
- style.css
- script.js
- README.md
- assets/
- api/chat.js

Delete old:
- src
- package.json
- old ZIP files

Vercel:
- Framework Preset: Other
- Build Command: empty
- Output Directory: empty

Gemini:
Add Environment Variable:
GEMINI_API_KEY
Then redeploy.
