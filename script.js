
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const npcRobot = document.getElementById("npcRobot");
const npcCanvas = document.getElementById("npcCanvas");
const npcSpeech = document.getElementById("npcSpeech");

let npcMixer = null;
let npcModel = null;
let npcClock = new THREE.Clock();
let npcDirection = 1;

if (npcCanvas && npcRobot) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 1.15, 5.2);

  const renderer = new THREE.WebGLRenderer({ canvas: npcCanvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.add(new THREE.HemisphereLight(0xa5f3fc, 0x020617, 2.5));

  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(3, 5, 4);
  scene.add(key);

  const blue = new THREE.PointLight(0x22d3ee, 2.5, 8);
  blue.position.set(-2, 2, 3);
  scene.add(blue);

  function resizeNpc(){
    const w = npcRobot.clientWidth || 210;
    const h = npcRobot.clientHeight || 250;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resizeNpc();
  window.addEventListener("resize", resizeNpc);

  const loader = new GLTFLoader();
  loader.load(
    "assets/cute_robot.glb",
    (gltf) => {
      npcModel = gltf.scene;

      const box = new THREE.Box3().setFromObject(npcModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      npcModel.position.sub(center);

      const maxSize = Math.max(size.x, size.y, size.z);
      npcModel.scale.setScalar(2.55 / maxSize);
      npcModel.position.y = -0.95;

      npcModel.traverse((child) => {
        if (child.isMesh) child.frustumCulled = false;
      });

      scene.add(npcModel);

      if (gltf.animations && gltf.animations.length) {
        npcMixer = new THREE.AnimationMixer(npcModel);
        const walk =
          gltf.animations.find(a => /walk|walking|run/i.test(a.name)) ||
          gltf.animations.find(a => /idle/i.test(a.name)) ||
          gltf.animations[0];

        const action = npcMixer.clipAction(walk);
        action.play();
      }
    },
    undefined,
    () => {
      npcSpeech.textContent = "Robot failed to load.";
    }
  );

  function animate(){
    requestAnimationFrame(animate);
    const delta = npcClock.getDelta();
    if (npcMixer) npcMixer.update(delta);

    if (npcModel) {
      const time = Date.now() * 0.001;
      npcModel.rotation.y = Math.sin(time * 1.4) * 0.18 + (npcDirection === 1 ? 0.25 : -0.25);
      npcModel.position.y = -0.95 + Math.sin(time * 3) * 0.035;
    }

    renderer.render(scene, camera);
  }
  animate();

  const targets = [
    { selector: ".hero-visual", text: "I can explain our automation services." },
    { selector: "#services", text: "We build Messenger and WhatsApp bots." },
    { selector: ".service-card:nth-child(1)", text: "Messenger Bot starts at $20." },
    { selector: ".service-card:nth-child(2)", text: "We can connect customers to WhatsApp." },
    { selector: ".service-card:nth-child(3)", text: "Lead generation helps collect buyers." },
    { selector: "#pricing", text: "Our packages are $20, $100, and $499." },
    { selector: "#contact", text: "Click me or WhatsApp us to start." }
  ];

  let targetIndex = 0;

  function getPoint(target){
    const el = document.querySelector(target.selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = window.scrollX + r.left + r.width * 0.62 - npcRobot.offsetWidth / 2;
    const y = window.scrollY + r.top + Math.min(r.height * 0.30, 230) - npcRobot.offsetHeight * 0.58;
    return { x: Math.max(18, x), y: Math.max(90, y), text: target.text };
  }

  function patrol(){
    const target = targets[targetIndex % targets.length];
    const point = getPoint(target);

    if (point) {
      const oldX = parseFloat(npcRobot.style.left || npcRobot.offsetLeft || 0);
      npcDirection = point.x >= oldX ? 1 : -1;
      npcRobot.style.left = point.x + "px";
      npcRobot.style.top = point.y + "px";
      npcRobot.style.transform = npcDirection === 1 ? "scaleX(1)" : "scaleX(-1)";
      npcSpeech.textContent = point.text;
    }

    targetIndex++;
    setTimeout(patrol, 6500);
  }

  window.addEventListener("load", () => setTimeout(patrol, 900));

  npcRobot.addEventListener("click", () => {
    const panel = document.getElementById("chatPanel");
    if (panel) panel.classList.add("open");
    npcSpeech.textContent = "Ask me about KR Bot Automation!";
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
