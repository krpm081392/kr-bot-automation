
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
  const npcScene = new THREE.Scene();
  const npcCamera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  npcCamera.position.set(0, 1.2, 5.2);

  const npcRenderer = new THREE.WebGLRenderer({ canvas: npcCanvas, alpha: true, antialias: true });
  npcRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  npcScene.add(new THREE.HemisphereLight(0xa5f3fc, 0x020617, 2.4));
  const npcKeyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  npcKeyLight.position.set(3, 5, 4);
  npcScene.add(npcKeyLight);

  const npcBlueLight = new THREE.PointLight(0x22d3ee, 3, 8);
  npcBlueLight.position.set(-2, 2, 3);
  npcScene.add(npcBlueLight);

  function resizeNpcRenderer(){
    const w = npcRobot.clientWidth || 230;
    const h = npcRobot.clientHeight || 260;
    npcRenderer.setSize(w, h, false);
    npcCamera.aspect = w / h;
    npcCamera.updateProjectionMatrix();
  }
  resizeNpcRenderer();
  window.addEventListener("resize", resizeNpcRenderer);

  const loader = new GLTFLoader();
  loader.load(
    "assets/robot_playground.glb",
    (gltf) => {
      npcModel = gltf.scene;

      const box = new THREE.Box3().setFromObject(npcModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      npcModel.position.sub(center);

      const maxSize = Math.max(size.x, size.y, size.z);
      npcModel.scale.setScalar(2.6 / maxSize);
      npcModel.position.y = -0.9;

      npcModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.frustumCulled = false;
        }
      });

      npcScene.add(npcModel);

      if (gltf.animations && gltf.animations.length) {
        npcMixer = new THREE.AnimationMixer(npcModel);
        const preferred = gltf.animations.find(a => /walk|run|idle/i.test(a.name)) || gltf.animations[0];
        const action = npcMixer.clipAction(preferred);
        action.play();
      }
    },
    undefined,
    () => {
      npcSpeech.textContent = "Robot model failed to load.";
    }
  );

  function animateNpc(){
    requestAnimationFrame(animateNpc);
    const delta = npcClock.getDelta();

    if (npcMixer) npcMixer.update(delta);

    if (npcModel) {
      npcModel.rotation.y = Math.sin(Date.now() * 0.0012) * 0.22 + (npcDirection === 1 ? 0.25 : -0.25);
      npcModel.position.y = -0.9 + Math.sin(Date.now() * 0.003) * 0.04;
    }

    npcRenderer.render(npcScene, npcCamera);
  }
  animateNpc();

  const npcTargets = [
    { selector: ".hero-visual", text: "I help automate customer conversations." },
    { selector: "#services", text: "These are our AI automation services." },
    { selector: ".service-card:nth-child(1)", text: "Messenger Bot starts at only $20." },
    { selector: ".service-card:nth-child(2)", text: "We can add WhatsApp contact flow too." },
    { selector: ".service-card:nth-child(3)", text: "I can help collect leads automatically." },
    { selector: "#pricing", text: "Our packages are $20, $100, and $499." },
    { selector: "#contact", text: "Click me or WhatsApp us to start." }
  ];

  let npcTargetIndex = 0;

  function getNpcPoint(target){
    const el = document.querySelector(target.selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const pageX = window.scrollX + r.left + r.width * 0.62;
    const pageY = window.scrollY + r.top + Math.min(r.height * 0.28, 220);
    return {
      x: Math.max(18, pageX - npcRobot.offsetWidth / 2),
      y: Math.max(92, pageY - npcRobot.offsetHeight * 0.6),
      text: target.text
    };
  }

  function patrolNpc(){
    const target = npcTargets[npcTargetIndex % npcTargets.length];
    const point = getNpcPoint(target);

    if (point) {
      const oldX = parseFloat(npcRobot.style.left || npcRobot.offsetLeft || 0);
      npcDirection = point.x >= oldX ? 1 : -1;
      npcRobot.style.left = point.x + "px";
      npcRobot.style.top = point.y + "px";
      npcRobot.style.transform = npcDirection === 1 ? "scaleX(1)" : "scaleX(-1)";
      npcSpeech.textContent = point.text;
    }

    npcTargetIndex++;
    setTimeout(patrolNpc, 6200);
  }

  window.addEventListener("load", () => {
    setTimeout(patrolNpc, 1200);
  });

  npcRobot.addEventListener("click", () => {
    const chatPanel = document.getElementById("chatPanel");
    if (chatPanel) chatPanel.classList.add("open");
    npcSpeech.textContent = "Ask me anything about KR Bot Automation!";
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
