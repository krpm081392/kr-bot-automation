const robotNpc = document.getElementById("robotNpc");
const robotSpeech = document.getElementById("robotSpeech");
const robotLottie = document.getElementById("robotLottie");

const openChat = document.getElementById("openChat");
const closeChat = document.getElementById("closeChat");
const chatPanel = document.getElementById("chatPanel");
const sendChat = document.getElementById("sendChat");
const chatInput = document.getElementById("chatInput");
const messages = document.getElementById("messages");

function openKRBotChat(){
  if (chatPanel) chatPanel.classList.add("open");
  if (robotSpeech) robotSpeech.textContent = "Ask me about KR Bot Automation!";
}

if (openChat) openChat.onclick = () => chatPanel.classList.toggle("open");
if (closeChat) closeChat.onclick = () => chatPanel.classList.remove("open");

if (robotNpc) robotNpc.addEventListener("click", openKRBotChat);
if (robotSpeech) robotSpeech.addEventListener("click", (e) => {
  e.stopPropagation();
  openKRBotChat();
});
if (robotLottie) robotLottie.addEventListener("click", (e) => {
  e.stopPropagation();
  openKRBotChat();
});

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

function robotPoint(target){
  if (!robotNpc) return null;
  const el = document.querySelector(target.selector);
  if (!el) return null;

  const r = el.getBoundingClientRect();
  const x = window.scrollX + r.left + r.width * 0.62 - robotNpc.offsetWidth / 2;
  const y = window.scrollY + r.top + Math.min(r.height * 0.28, 200) - robotNpc.offsetHeight * 0.55;

  return { x: Math.max(12, x), y: Math.max(95, y), text: target.text };
}

function patrolRobot(){
  if (!robotNpc || !robotSpeech) return;

  const point = robotPoint(robotTargets[robotTargetIndex % robotTargets.length]);

  if (point) {
    const oldX = parseFloat(robotNpc.style.left || robotNpc.offsetLeft || 0);
    const goingLeft = point.x < oldX;

    robotNpc.style.left = point.x + "px";
    robotNpc.style.top = point.y + "px";
    robotNpc.classList.toggle("fly-left", goingLeft);
    robotNpc.classList.add("npc-moving");
    robotSpeech.textContent = point.text;

    setTimeout(() => robotNpc.classList.remove("npc-moving"), 2600);
  }

  robotTargetIndex++;
  setTimeout(patrolRobot, 4800);
}

window.addEventListener("load", () => setTimeout(patrolRobot, 900));

function addMsg(text, type){
  if (!messages) return;
  const p = document.createElement("p");
  p.className = type === "user" ? "user-reply" : "bot-reply";
  p.textContent = text;
  messages.appendChild(p);
  messages.scrollTop = messages.scrollHeight;
}

function localBotReply(message){
  const msg = message.toLowerCase();

  if (msg.includes("price") || msg.includes("pricing") || msg.includes("cost") || msg.includes("how much") || msg.includes("$")) {
    return "Our starter prices are: Messenger Bot $20, Messenger + WhatsApp Bot $100, and Website + Messenger Bot $499. The $20 plan is best to start fast.";
  }
  if (msg.includes("messenger") || msg.includes("facebook")) {
    return "Messenger Bot helps your Facebook page reply to customers automatically. It can welcome buyers, answer FAQs, show products, collect buyer info, and hand over serious leads to you.";
  }
  if (msg.includes("whatsapp") || msg.includes("wa")) {
    return "Messenger + WhatsApp package is $100. It lets customers move from Messenger to WhatsApp so you can close sales faster.";
  }
  if (msg.includes("lead") || msg.includes("customer") || msg.includes("buyer")) {
    return "Lead Generation helps collect customer name, phone, product interest, and message. Then the bot can hand over hot buyers to the owner.";
  }
  if (msg.includes("website") || msg.includes("site")) {
    return "Website + Messenger Bot package is $499. It includes a full website, Messenger bot, WhatsApp integration, lead capture system, and premium UI setup.";
  }
  if (msg.includes("contact") || msg.includes("start") || msg.includes("order") || msg.includes("avail") || msg.includes("buy")) {
    return "You can start by choosing a package: $20 Messenger Bot, $100 Messenger + WhatsApp, or $499 Website + Messenger Bot. Tap WhatsApp or Get Started and send your page/business details.";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! I’m KR Worker Bot. I can explain our Messenger bots, WhatsApp bots, lead generation, website package, and pricing.";
  }
  return "I can help with our services: Messenger Bot $20, Messenger + WhatsApp Bot $100, Website + Messenger Bot $499, lead generation, and customer automation. Ask me about any package.";
}

async function ask(){
  const msg = chatInput.value.trim();
  if (!msg) return;

  addMsg(msg, "user");
  chatInput.value = "";

  addMsg("Thinking...", "bot");
  const last = messages.lastChild;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({message: msg})
    });

    const data = await res.json();
    last.textContent = data.reply || localBotReply(msg);
  } catch (e) {
    last.textContent = localBotReply(msg);
  }
}

if (sendChat) sendChat.onclick = ask;
if (chatInput) chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") ask();
});
