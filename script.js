const openChat=document.getElementById("openChat");
const aiPanel=document.getElementById("aiPanel");
const closeChat=document.getElementById("closeChat");
const sendAi=document.getElementById("sendAi");
const aiInput=document.getElementById("aiInput");
const aiMessages=document.getElementById("aiMessages");
const robot=document.getElementById("patrolRobot");
const robotBubble=document.getElementById("robotBubble");

openChat.onclick=()=>aiPanel.classList.toggle("open");
closeChat.onclick=()=>aiPanel.classList.remove("open");

function addMsg(text,type){
  const p=document.createElement("p");
  p.className=type==="user"?"ai-user":"ai-bot";
  p.textContent=text;
  aiMessages.appendChild(p);
  aiMessages.scrollTop=aiMessages.scrollHeight;
}

robot.onclick=()=>{
  aiPanel.classList.add("open");
  addMsg("Hi KR Bot, tell me more.", "user");
  setTimeout(()=>addMsg("Hello! I can explain our $20 Messenger Bot, $100 Messenger + WhatsApp, or $499 Website + Messenger Bot package.", "bot"),350);
};

const states=[
  {cls:"welding", text:"⚡ Welding the sales flow... Click me to know more."},
  {cls:"scanning", text:"🔍 Scanning for hot leads... Click me to ask questions."},
  {cls:"", text:"🤖 Click me to know more about our products."},
  {cls:"welding", text:"🔧 Fixing Messenger automation... Start with $20."},
  {cls:"scanning", text:"📲 Checking WhatsApp system... Package starts at $100."},
];

function moveRobot(){
  if(window.innerWidth <= 1050) return;
  const stops = document.querySelectorAll(".patrol-stop");
  const index = Math.floor(Math.random()*stops.length);
  const el = stops[index];
  const r = el.getBoundingClientRect();
  const x = Math.min(window.innerWidth - 470, Math.max(80, r.left + r.width * 0.60));
  const y = Math.min(window.innerHeight - 440, Math.max(90, r.top + window.scrollY + 30 - window.scrollY));
  const st = states[Math.floor(Math.random()*states.length)];
  robot.style.left = x + "px";
  robot.style.top = y + "px";
  robot.className = "patrol-robot-wrap " + st.cls;
  robotBubble.textContent = el.dataset.robotText || st.text;
}

setInterval(moveRobot, 4200);
window.addEventListener("scroll",()=>{ if(Math.random()>.92) moveRobot(); });

async function askAi(){
  const msg=aiInput.value.trim();
  if(!msg)return;
  addMsg(msg,"user");
  aiInput.value="";
  addMsg("Thinking...","bot");
  const last=aiMessages.lastChild;
  try{
    const res=await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:msg})
    });
    const data=await res.json();
    last.textContent=data.reply||"Sorry, I could not answer right now.";
  }catch(e){
    last.textContent="Gemini is not connected yet. Add GEMINI_API_KEY in Vercel Environment Variables.";
  }
}
sendAi.onclick=askAi;
aiInput.addEventListener("keydown",e=>{if(e.key==="Enter")askAi();});
