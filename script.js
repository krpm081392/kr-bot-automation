const robotNpc = document.getElementById("robotNpc");
const robotSpeech = document.getElementById("robotSpeech");
const robotLottie = document.getElementById("robotLottie");

const openChat = document.getElementById("openChat");
const closeChat = document.getElementById("closeChat");
const chatPanel = document.getElementById("chatPanel");
const sendChat = document.getElementById("sendChat");
const chatInput = document.getElementById("chatInput");
const messages = document.getElementById("messages");

const BUSINESS_INFO = {
  name: "KR Bot Automation",
  email: "krbotautomation@gmail.com",
  whatsapp: "+385992194687",
  packages: [
    {
      name: "Messenger Bot",
      price: "$20",
      bestFor: "Facebook page owners who want automatic replies fast.",
      includes: [
        "Welcome message",
        "Basic menu",
        "FAQ replies",
        "Product or service information",
        "Simple owner handover"
      ]
    },
    {
      name: "Messenger + WhatsApp Bot",
      price: "$100",
      bestFor: "Businesses that want Messenger automation and WhatsApp closing.",
      includes: [
        "Messenger automation",
        "WhatsApp contact button",
        "Product/service showcase",
        "Lead collection",
        "Owner handover"
      ]
    },
    {
      name: "Website + Messenger Bot",
      price: "$499",
      bestFor: "Businesses that want a complete online system.",
      includes: [
        "Premium website UI",
        "Messenger bot setup",
        "WhatsApp integration",
        "Lead capture system",
        "Premium setup"
      ]
    }
  ]
};

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

window.addEventListener("load", () => {
  setTimeout(patrolRobot, 900);
});

function addMsg(text, type){
  if (!messages) return;

  const p = document.createElement("p");
  p.className = type === "user" ? "user-reply" : "bot-reply";
  p.textContent = text;

  messages.appendChild(p);
  messages.scrollTop = messages.scrollHeight;
}

function hasAny(msg, words){
  return words.some(word => msg.includes(word));
}

function packageSummary(){
  return "We offer 3 packages:\n\n1) Messenger Bot — $20\nBest for Facebook page owners who want auto replies.\n\n2) Messenger + WhatsApp Bot — $100\nBest for businesses that want Messenger automation and WhatsApp closing.\n\n3) Website + Messenger Bot — $499\nBest for a complete website + bot + lead system.";
}

function localBotReply(message){
  const msg = message.toLowerCase().trim();

  if (!msg) {
    return "Ask me about pricing, Messenger bot, WhatsApp bot, lead generation, website package, or how to get started.";
  }

  if (hasAny(msg, ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"])) {
    return "Hello! Welcome to KR Bot Automation. I can explain our packages, pricing, features, and how to start your bot setup.";
  }

  if (hasAny(msg, ["price", "pricing", "cost", "how much", "package", "packages", "plan", "plans", "$", "rate"])) {
    return packageSummary();
  }

  if (hasAny(msg, ["cheapest", "starter", "start cheap", "basic", "low budget", "beginner"])) {
    return "The cheapest starter package is the Messenger Bot for $20. It includes welcome message, basic menu, FAQ replies, product/service info, and simple owner handover.";
  }

  if (hasAny(msg, ["best", "recommend", "which", "suggest", "good for me"])) {
    return "If you are just starting, choose the $20 Messenger Bot. If you want customers to move to WhatsApp, choose the $100 Messenger + WhatsApp Bot. If you want a full online system, choose the $499 Website + Messenger Bot.";
  }

  if (hasAny(msg, ["messenger", "facebook", "fb", "page", "meta"])) {
    return "Messenger Bot helps your Facebook page reply automatically. It can welcome customers, answer FAQs, show products or services, collect buyer details, and hand over serious customers to the owner.";
  }

  if (hasAny(msg, ["whatsapp", "wa", "whats app"])) {
    return "The Messenger + WhatsApp Bot package is $100. It connects Messenger automation with a WhatsApp contact path so interested customers can message the owner directly and close faster.";
  }

  if (hasAny(msg, ["lead", "leads", "buyer", "buyers", "customer", "customers", "collect info", "name", "phone"])) {
    return "Lead Generation collects buyer information like name, phone number, product interest, and message. The bot can qualify the customer and hand over hot leads to the owner.";
  }

  if (hasAny(msg, ["website", "site", "landing page", "web page", "web"])) {
    return "The Website + Messenger Bot package is $499. It includes premium website UI, Messenger bot setup, WhatsApp integration, lead capture system, and premium setup.";
  }

  if (hasAny(msg, ["feature", "features", "include", "included", "what do i get", "what can it do"])) {
    return "Our automation can include: auto replies, welcome message, menu buttons, FAQ replies, product showcase, price information, lead collection, WhatsApp button, and owner handover.";
  }

  if (hasAny(msg, ["time", "how long", "delivery", "finish", "setup", "when"])) {
    return "Basic Messenger Bot setup can be done fast after we receive your business details. Larger packages like Website + Messenger Bot need more setup because we build the website and automation flow.";
  }

  if (hasAny(msg, ["need to send", "requirements", "requirement", "what do you need", "details"])) {
    return "To start, please send: business/page name, Facebook page link, products or services, prices, FAQs, WhatsApp number, and the message you want customers to receive.";
  }

  if (hasAny(msg, ["contact", "message", "call", "email", "whatsapp number", "number"])) {
    return "You can contact KR Bot Automation by tapping the WhatsApp button on this website. You can also email krbotautomation@gmail.com.";
  }

  if (hasAny(msg, ["start", "order", "buy", "avail", "get started", "interested", "hire"])) {
    return "Great! To start, choose a package: $20 Messenger Bot, $100 Messenger + WhatsApp Bot, or $499 Website + Messenger Bot. Then tap WhatsApp and send your business/page details.";
  }

  if (hasAny(msg, ["small business", "seller", "online seller", "shop", "store", "service provider"])) {
    return "Yes, this is perfect for small businesses, online sellers, Facebook page owners, service providers, and shops that want faster replies and more organized leads.";
  }

  if (hasAny(msg, ["refund", "guarantee", "trust", "safe", "legit"])) {
    return "KR Bot Automation focuses on simple and clear setup. We explain what the bot can do before starting, and we build based on your business details and agreed package.";
  }

  if (hasAny(msg, ["gemini", "ai", "smart", "chatgpt"])) {
    return "The bot can work with simple local replies now. Gemini AI can be connected later to make answers smarter, but the website chat can already answer basic questions about services and pricing.";
  }

  if (hasAny(msg, ["thanks", "thank you", "salamat"])) {
    return "You’re welcome! Tap WhatsApp when you’re ready to start your bot setup.";
  }

  return "I can help with KR Bot Automation services. Ask me about pricing, Messenger Bot, WhatsApp Bot, lead generation, website package, setup time, or how to get started.";
}

async function ask(){
  if (!chatInput || !messages) return;

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

    const apiReply = data && data.reply ? String(data.reply) : "";
    const apiLooksBroken =
      apiReply.toLowerCase().includes("gemini is not connected") ||
      apiReply.toLowerCase().includes("gemini_api_key") ||
      apiReply.toLowerCase().includes("vercel environment") ||
      apiReply.toLowerCase().includes("redeploy");

    if (apiReply && !apiLooksBroken) {
      last.textContent = apiReply;
    } else {
      last.textContent = localBotReply(msg);
    }
  } catch (e) {
    last.textContent = localBotReply(msg);
  }
}

if (sendChat) sendChat.onclick = ask;
if (chatInput) {
  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter") ask();
  });
}
