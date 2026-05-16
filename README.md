# KR Bot Automation Mechanic NPC Final

Fixed:
- "Services You Can Sell" changed to "AI Automation Services"
- Keeps the 4 premium robot service images
- Adds a better mechanic NPC robot made with CSS parts, not emoji/Roblox
- Robot is page-anchored absolute, not fixed
- Robot walks between real website elements
- Robot welds/scans sections with sparks
- Clicking robot opens Gemini chat

Upload:
- index.html
- style.css
- script.js
- README.md
- assets/
- api/

Delete old files/folders first:
- old src/
- old package.json
- old zip files
- old extra robot image files not inside assets/

Vercel:
- Framework Preset: Other
- Build Command: empty
- Output Directory: empty

Gemini:
Add GEMINI_API_KEY in Vercel Environment Variables, then redeploy.
