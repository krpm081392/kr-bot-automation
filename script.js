const openChat = document.getElementById("openChat");
const aiPanel = document.getElementById("aiPanel");
const closeChat = document.getElementById("closeChat");
const sendAi = document.getElementById("sendAi");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");
const npc = document.getElementById("npcRobot");
const npcBubble = document.getElementById("npcBubble");

openChat.onclick = () => aiPanel.classList.toggle("open");
closeChat.onclick = () => aiPanel.classList.remove("open");

function addMsg(text, type){
  const p = document.createElement("p");
  p.className = type === "user" ? "ai-user" : "ai-bot";
  p.textContent = text;
  aiMessages.appendChild(p);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

npc.onclick = () => {
  aiPanel.classList.add("open");
  addMsg("Hi KR Bot, tell me more.", "user");
  setTimeout(() => addMsg("Hello! I can explain our $20 Messenger Bot, $100 Messenger + WhatsApp package, or $499 Website + Messenger Bot.", "bot"), 350);
};

let targets = [];
let targetIndex = 0;

function refreshTargets(){
  targets = [...document.querySelectorAll(".repair-target")].filter(el => el.offsetParent !== null);
}

function setState(state){
  npc.className = "npc " + state;
}

function pagePointForElement(el){
  const r = el.getBoundingClientRect();
  const rw = npc.offsetWidth || 240;
  const rh = npc.offsetHeight || 300;
  let x = r.left + window.scrollX + Math.min(r.width * .64, r.width - 45) - rw * .48;
  let y = r.top + window.scrollY + Math.min(r.height * .16, 150) - rh * .20;
  x = Math.max(18, x);
  y = Math.max(84, y);
  return {x, y};
}

function moveToTarget(el){
  if(!el) return;
  setState("walking");
  npcBubble.textContent = "Walking to repair area...";
  const {x, y} = pagePointForElement(el);
  const currentX = parseFloat(npc.style.left || "0");
  npc.style.transform = x >= currentX ? "scaleX(1)" : "scaleX(-1)";
  npc.style.left = x + "px";
  npc.style.top = y + "px";
  setTimeout(() => startWork(el), 2500);
}

function startWork(el){
  const mode = Math.random() > .48 ? "fixing" : "scanning";
  setState(mode);
  document.querySelectorAll(".repair-target").forEach(t => t.classList.remove("active-repair"));
  el.classList.add("active-repair");
  npcBubble.textContent = el.dataset.message || "⚡ Fixing this section...";
  createSparks(el);
  setTimeout(() => {
    el.classList.remove("active-repair");
    setState("idle");
    npcBubble.textContent = "Click me to know more";
    setTimeout(nextTarget, 1300);
  }, 5000);
}

function nextTarget(){
  refreshTargets();
  if(!targets.length) return;
  targetIndex = (targetIndex + 1) % targets.length;
  moveToTarget(targets[targetIndex]);
}

function createSparks(el){
  const r = el.getBoundingClientRect();
  for(let i=0; i<20; i++){
    const s = document.createElement("div");
    s.style.cssText = "position:absolute;width:7px;height:7px;border-radius:50%;background:#facc15;box-shadow:0 0 15px #f97316;z-index:80;pointer-events:none";
    s.style.left = (r.left + window.scrollX + Math.random() * r.width) + "px";
    s.style.top = (r.top + window.scrollY + Math.random() * Math.min(r.height, 130)) + "px";
    document.body.appendChild(s);
    const dx = Math.random() * 140 - 70;
    const dy = Math.random() * 140 - 70;
    s.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) scale(0)`, opacity: 0 }
    ], {duration: 900, easing: "ease-out"});
    setTimeout(() => s.remove(), 950);
  }
}

window.addEventListener("load", () => {
  refreshTargets();
  const start = document.getElementById("heroFloor") || document.getElementById("heroTarget");
  const p = pagePointForElement(start);
  npc.style.left = p.x + "px";
  npc.style.top = p.y + "px";
  setState("idle");
  setTimeout(nextTarget, 1500);
});
window.addEventListener("resize", refreshTargets);

async function askAi(){
  const msg = aiInput.value.trim();
  if(!msg) return;
  addMsg(msg, "user");
  aiInput.value = "";
  addMsg("Thinking...", "bot");
  const last = aiMessages.lastChild;
  try{
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({message: msg})
    });
    const data = await res.json();
    last.textContent = data.reply || "Sorry, please message us on WhatsApp.";
  }catch(e){
    last.textContent = "Gemini is not connected yet. Add GEMINI_API_KEY in Vercel Environment Variables.";
  }
}
sendAi.onclick = askAi;
aiInput.addEventListener("keydown", e => { if(e.key === "Enter") askAi(); });
