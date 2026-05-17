
// Stable model-viewer NPC robot: no Three.js imports
const robotNpc = document.getElementById("robotNpc");
const robotSpeech = document.getElementById("robotSpeech");
const robotModel = document.getElementById("robotModel");

function openKRBotChat(){
  const panel = document.getElementById("chatPanel");
  if (panel) panel.classList.add("open");
  if (robotSpeech) robotSpeech.textContent = "Ask me about KR Bot Automation!";
}

if (robotNpc) robotNpc.addEventListener("click", openKRBotChat);
if (robotSpeech) robotSpeech.addEventListener("click", (e)=>{ e.stopPropagation(); openKRBotChat(); });
if (robotModel) robotModel.addEventListener("click", (e)=>{ e.stopPropagation(); openKRBotChat(); });

if (robotModel && robotSpeech) {
  robotModel.addEventListener("load", () => {
    robotSpeech.textContent = "Hi! Click me to ask about our services.";
  });
  robotModel.addEventListener("error", () => {
    robotSpeech.textContent = "Robot file missing. Upload assets/robot.glb";
    if (robotNpc) robotNpc.classList.add("robot-fallback-visible");
  });
}

const robotTargets = [
  { selector: ".hero-visual", text: "Click me to ask about KR Bot services." },
  { selector: "#services", text: "We build Messenger and WhatsApp bots." },
  { selector: ".service-card:nth-child(1)", text: "Messenger Bot starts at $20." },
  { selector: ".service-card:nth-child(2)", text: "Messenger + WhatsApp is $100." },
  { selector: ".service-card:nth-child(3)", text: "Lead generation helps collect buyers." },
  { selector: "#pricing", text: "Website + Messenger Bot package is $499." },
  { selector: "#contact", text: "Click me or WhatsApp us to start." }
];

let robotTargetIndex = 0;
let robotDirection = 1;

function robotPoint(target){
  if (!robotNpc) return null;
  const el = document.querySelector(target.selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const x = window.scrollX + r.left + r.width * 0.62 - robotNpc.offsetWidth / 2;
  const y = window.scrollY + r.top + Math.min(r.height * 0.30, 220) - robotNpc.offsetHeight * 0.58;
  return { x: Math.max(12, x), y: Math.max(90, y), text: target.text };
}

function patrolRobot(){
  if (!robotNpc || !robotSpeech) return;
  const point = robotPoint(robotTargets[robotTargetIndex % robotTargets.length]);
  if (point) {
    const oldX = parseFloat(robotNpc.style.left || robotNpc.offsetLeft || 0);
    robotDirection = point.x >= oldX ? 1 : -1;
    robotNpc.style.left = point.x + "px";
    robotNpc.style.top = point.y + "px";
    robotNpc.classList.toggle("walk-left", robotDirection < 0);
    robotSpeech.textContent = point.text;
  }
  robotTargetIndex++;
  setTimeout(patrolRobot, 6500);
}

window.addEventListener("load", () => setTimeout(patrolRobot, 1200));


const openChat=document.getElementById("openChat");
const closeChat=document.getElementById("closeChat");
const chatPanel=document.getElementById("chatPanel");
const sendChat=document.getElementById("sendChat");
const chatInput=document.getElementById("chatInput");
const messages=document.getElementById("messages");

openChat.onclick=()=>chatPanel.classList.toggle("open");
closeChat.onclick=()=>chatPanel.classList.remove("open");

function addMsg(text,type){
  const p=document.createElement("p");
  p.className=type==="user"?"user-reply":"bot-reply";
  p.textContent=text;
  messages.appendChild(p);
  messages.scrollTop=messages.scrollHeight;
}

async function ask(){
  const msg=chatInput.value.trim();
  if(!msg)return;
  addMsg(msg,"user");
  chatInput.value="";
  addMsg("Thinking...","bot");
  const last=messages.lastChild;
  try{
    const res=await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:msg})
    });
    const data=await res.json();
    last.textContent=data.reply||"Please message us on WhatsApp.";
  }catch(e){
    last.textContent="Gemini is not connected yet. Add GEMINI_API_KEY in Vercel Environment Variables.";
  }
}
sendChat.onclick=ask;
chatInput.addEventListener("keydown",e=>{if(e.key==="Enter")ask();});
