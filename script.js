const openChat = document.getElementById("openChat");
const aiPanel = document.getElementById("aiPanel");
const closeChat = document.getElementById("closeChat");
const sendAi = document.getElementById("sendAi");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");

const robot = document.getElementById("robotNpc");
const robotBubble = document.getElementById("npcBubble");

openChat.onclick = () => aiPanel.classList.toggle("open");
closeChat.onclick = () => aiPanel.classList.remove("open");

function addMsg(text, type){
  const p = document.createElement("p");
  p.className = type === "user" ? "ai-user" : "ai-bot";
  p.textContent = text;
  aiMessages.appendChild(p);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

robot.onclick = () => {
  aiPanel.classList.add("open");
  addMsg("Hi KR Bot, tell me more.", "user");
  setTimeout(() => addMsg("Hello! I can explain our $20 Messenger Bot, $100 Messenger + WhatsApp package, or $499 Website + Messenger Bot.", "bot"), 350);
};

// Page-anchored NPC state machine
const RobotState = {
  WALKING: "walking",
  FIXING: "fixing",
  SCANNING: "scanning",
  IDLE: "idle"
};

let state = RobotState.IDLE;
let targetIndex = 0;
let targets = [];

function refreshTargets(){
  targets = [...document.querySelectorAll(".repair-target")].filter(el => el.offsetParent !== null);
}

function setState(newState){
  state = newState;
  robot.className = "robot-npc " + newState;
}

function pagePointForElement(el){
  const r = el.getBoundingClientRect();
  const robotW = robot.offsetWidth || 300;
  const robotH = robot.offsetHeight || 360;

  let x = r.left + window.scrollX + Math.min(r.width * 0.62, r.width - 40);
  let y = r.top + window.scrollY + Math.min(r.height * 0.18, r.height - 40);

  x = Math.max(20, x - robotW * 0.45);
  y = Math.max(90, y - robotH * 0.15);

  return {x, y};
}

function moveToTarget(el){
  if (!el) return;
  setState(RobotState.WALKING);
  robotBubble.textContent = "Walking to repair area...";

  const {x, y} = pagePointForElement(el);
  const currentX = parseFloat(robot.style.left || 120);
  const direction = x >= currentX ? 1 : -1;
  robot.style.transform = `scaleX(${direction})`;
  robot.style.left = x + "px";
  robot.style.top = y + "px";

  setTimeout(() => startWork(el), 2600);
}

function startWork(el){
  const workType = Math.random() > 0.55 ? RobotState.FIXING : RobotState.SCANNING;
  setState(workType);

  document.querySelectorAll(".repair-target").forEach(t => t.classList.remove("active-repair"));
  el.classList.add("active-repair");

  const message = el.dataset.message || "⚡ Fixing this section... Click me to know more.";
  robotBubble.textContent = message;

  createElementSparks(el);

  setTimeout(() => {
    el.classList.remove("active-repair");
    setState(RobotState.IDLE);
    robotBubble.textContent = "Click me to know more";

    setTimeout(nextTarget, 1200);
  }, 5000);
}

function nextTarget(){
  refreshTargets();
  if (!targets.length) return;

  targetIndex = (targetIndex + 1) % targets.length;
  const selected = targets[targetIndex];
  moveToTarget(selected);
}

function createElementSparks(el){
  const r = el.getBoundingClientRect();
  for(let i=0; i<18; i++){
    const spark = document.createElement("div");
    spark.className = "page-spark";
    spark.style.position = "absolute";
    spark.style.left = (r.left + window.scrollX + Math.random() * r.width) + "px";
    spark.style.top = (r.top + window.scrollY + Math.random() * Math.min(r.height, 120)) + "px";
    spark.style.width = "7px";
    spark.style.height = "7px";
    spark.style.borderRadius = "50%";
    spark.style.background = "#facc15";
    spark.style.boxShadow = "0 0 15px #f97316";
    spark.style.zIndex = "80";
    spark.style.pointerEvents = "none";
    document.body.appendChild(spark);

    const dx = (Math.random() * 120) - 60;
    const dy = (Math.random() * 120) - 60;

    spark.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) scale(0)`, opacity: 0 }
    ], {
      duration: 900,
      easing: "ease-out"
    });

    setTimeout(() => spark.remove(), 950);
  }
}

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
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({message: msg})
    });
    const data = await res.json();
    last.textContent = data.reply || "Sorry, I could not answer right now.";
  }catch(e){
    last.textContent = "Gemini is not connected yet. Add GEMINI_API_KEY in Vercel Environment Variables.";
  }
}

sendAi.onclick = askAi;
aiInput.addEventListener("keydown", e => {
  if(e.key === "Enter") askAi();
});

// Initial placement: inside hero floor, page-anchored
window.addEventListener("load", () => {
  refreshTargets();
  const start = document.getElementById("heroFloor") || document.getElementById("heroTarget");
  const p = pagePointForElement(start);
  robot.style.left = p.x + "px";
  robot.style.top = p.y + "px";
  robotBubble.textContent = "Click me to know more";
  setState(RobotState.IDLE);
  setTimeout(nextTarget, 1500);
});

window.addEventListener("resize", () => {
  refreshTargets();
});
