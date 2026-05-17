
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const combatNpc = document.getElementById("combatNpc");
const combatCanvas = document.getElementById("combatCanvas");
const combatSpeech = document.getElementById("combatSpeech");
const crackOverlay = document.getElementById("crackOverlay");
const flameOverlay = document.getElementById("flameOverlay");

let combatMixer = null;
let combatModel = null;
let combatClock = new THREE.Clock();
let combatDirection = 1;

if (combatCanvas && combatNpc) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 1.15, 5.4);

  const renderer = new THREE.WebGLRenderer({ canvas: combatCanvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.add(new THREE.HemisphereLight(0xa5f3fc, 0x020617, 2.4));

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 5, 4);
  scene.add(key);

  const orange = new THREE.PointLight(0xff7a18, 2.4, 8);
  orange.position.set(-2, 1.4, 3);
  scene.add(orange);

  const blue = new THREE.PointLight(0x22d3ee, 2.2, 8);
  blue.position.set(2, 2, 3);
  scene.add(blue);

  function resizeCombat(){
    const w = combatNpc.clientWidth || 260;
    const h = combatNpc.clientHeight || 310;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resizeCombat();
  window.addEventListener("resize", resizeCombat);

  const loader = new GLTFLoader();
  loader.load(
    "assets/combat_steampunk_robot.glb",
    (gltf) => {
      combatModel = gltf.scene;

      const box = new THREE.Box3().setFromObject(combatModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      combatModel.position.sub(center);

      const maxSize = Math.max(size.x, size.y, size.z);
      combatModel.scale.setScalar(2.7 / maxSize);
      combatModel.position.y = -0.95;

      combatModel.traverse((child) => {
        if (child.isMesh) child.frustumCulled = false;
      });

      scene.add(combatModel);

      if (gltf.animations && gltf.animations.length) {
        combatMixer = new THREE.AnimationMixer(combatModel);
        const walk =
          gltf.animations.find(a => /walk|walking|run/i.test(a.name)) ||
          gltf.animations.find(a => /idle/i.test(a.name)) ||
          gltf.animations[0];
        combatMixer.clipAction(walk).play();
      }
    },
    undefined,
    () => {
      combatSpeech.textContent = "Robot model failed to load.";
    }
  );

  function animateCombat(){
    requestAnimationFrame(animateCombat);
    const delta = combatClock.getDelta();
    if (combatMixer) combatMixer.update(delta);

    if (combatModel) {
      const time = Date.now() * 0.001;
      combatModel.rotation.y = Math.sin(time * 1.1) * 0.16 + (combatDirection === 1 ? 0.25 : -0.25);
      combatModel.position.y = -0.95 + Math.sin(time * 2.8) * 0.035;
      orange.intensity = 2.2 + Math.sin(time * 6) * 0.8;
    }

    renderer.render(scene, camera);
  }
  animateCombat();

  const targets = [
    { selector: ".hero-visual", text: "I protect and explain your automation system." },
    { selector: "#services", text: "These are your AI automation services." },
    { selector: ".service-card:nth-child(1)", text: "Messenger Bot starts at $20." },
    { selector: ".service-card:nth-child(2)", text: "Messenger + WhatsApp package is $100." },
    { selector: "#pricing", text: "Need full website + bot? That package is $499." },
    { selector: "#contact", text: "Click me or WhatsApp us to start." }
  ];

  let targetIndex = 0;

  function getPoint(target){
    const el = document.querySelector(target.selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = window.scrollX + r.left + r.width * 0.62 - combatNpc.offsetWidth / 2;
    const y = window.scrollY + r.top + Math.min(r.height * 0.30, 230) - combatNpc.offsetHeight * 0.58;
    return { x: Math.max(18, x), y: Math.max(90, y), text: target.text };
  }

  function patrol(){
    const target = targets[targetIndex % targets.length];
    const point = getPoint(target);

    if (point) {
      const oldX = parseFloat(combatNpc.style.left || combatNpc.offsetLeft || 0);
      combatDirection = point.x >= oldX ? 1 : -1;
      combatNpc.style.left = point.x + "px";
      combatNpc.style.top = point.y + "px";
      combatNpc.style.transform = combatDirection === 1 ? "scaleX(1)" : "scaleX(-1)";
      combatSpeech.textContent = point.text;
    }

    targetIndex++;
    setTimeout(patrol, 6500);
  }

  function specialAttack(){
    combatNpc.classList.add("smashing");
    combatSpeech.textContent = "Boom! Automation power activated.";
    crackOverlay.classList.remove("show");
    flameOverlay.classList.remove("show");
    void crackOverlay.offsetWidth;
    crackOverlay.classList.add("show");
    flameOverlay.classList.add("show");
    setTimeout(() => combatNpc.classList.remove("smashing"), 900);
  }

  window.addEventListener("load", () => {
    setTimeout(patrol, 900);
    setTimeout(specialAttack, 4500);
  });

  combatNpc.addEventListener("click", () => {
    const panel = document.getElementById("chatPanel");
    if (panel) panel.classList.add("open");
    combatSpeech.textContent = "Ask me about KR Bot Automation!";
    specialAttack();
  });
}


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
