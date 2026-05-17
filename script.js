
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FBXLoader.js";

const fbxNpc = document.getElementById("fbxNpc");
const fbxCanvas = document.getElementById("fbxCanvas");
const fbxSpeech = document.getElementById("fbxSpeech");

let fbxMixer = null;
let fbxModel = null;
let fbxClock = new THREE.Clock();
let fbxDirection = 1;

if (fbxCanvas && fbxNpc) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  camera.position.set(0, 1.25, 5.4);

  const renderer = new THREE.WebGLRenderer({ canvas: fbxCanvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.add(new THREE.HemisphereLight(0xa5f3fc, 0x020617, 2.5));

  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(3, 5, 4);
  scene.add(key);

  const blue = new THREE.PointLight(0x22d3ee, 2.6, 8);
  blue.position.set(-2, 2, 3);
  scene.add(blue);

  const orange = new THREE.PointLight(0xff7a18, 1.8, 8);
  orange.position.set(2, 1.5, 3);
  scene.add(orange);

  function resizeFbx(){
    const w = fbxNpc.clientWidth || 240;
    const h = fbxNpc.clientHeight || 290;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resizeFbx();
  window.addEventListener("resize", resizeFbx);

  const loader = new FBXLoader();
  loader.setPath("assets/source/");
  loader.load(
    "MODELO FINAL.fbx",
    (model) => {
      fbxModel = model;

      const box = new THREE.Box3().setFromObject(fbxModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      fbxModel.position.sub(center);

      const maxSize = Math.max(size.x, size.y, size.z);
      fbxModel.scale.setScalar(2.8 / maxSize);
      fbxModel.position.y = -1.0;

      fbxModel.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;
          child.castShadow = true;
        }
      });

      scene.add(fbxModel);

      if (fbxModel.animations && fbxModel.animations.length) {
        fbxMixer = new THREE.AnimationMixer(fbxModel);
        const action = fbxMixer.clipAction(fbxModel.animations[0]);
        action.play();
        fbxSpeech.textContent = "I am walking around your website.";
      } else {
        fbxSpeech.textContent = "I patrol your website and explain services.";
      }
    },
    undefined,
    () => {
      fbxSpeech.textContent = "Robot model failed to load.";
    }
  );

  function animate(){
    requestAnimationFrame(animate);
    const delta = fbxClock.getDelta();
    if (fbxMixer) fbxMixer.update(delta);

    if (fbxModel) {
      const time = Date.now() * 0.001;
      fbxModel.rotation.y = Math.sin(time * 1.2) * 0.16 + (fbxDirection === 1 ? 0.25 : -0.25);
      fbxModel.position.y = -1.0 + Math.sin(time * 3) * 0.04;

      if (!fbxMixer) {
        fbxModel.rotation.z = Math.sin(time * 4) * 0.035;
      }
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
    const x = window.scrollX + r.left + r.width * 0.62 - fbxNpc.offsetWidth / 2;
    const y = window.scrollY + r.top + Math.min(r.height * 0.30, 230) - fbxNpc.offsetHeight * 0.58;
    return { x: Math.max(18, x), y: Math.max(90, y), text: target.text };
  }

  function patrol(){
    const target = targets[targetIndex % targets.length];
    const point = getPoint(target);

    if (point) {
      const oldX = parseFloat(fbxNpc.style.left || fbxNpc.offsetLeft || 0);
      fbxDirection = point.x >= oldX ? 1 : -1;
      fbxNpc.style.left = point.x + "px";
      fbxNpc.style.top = point.y + "px";
      fbxNpc.style.transform = fbxDirection === 1 ? "scaleX(1)" : "scaleX(-1)";
      fbxSpeech.textContent = point.text;
    }

    targetIndex++;
    setTimeout(patrol, 6500);
  }

  window.addEventListener("load", () => setTimeout(patrol, 900));

  fbxNpc.addEventListener("click", () => {
    const panel = document.getElementById("chatPanel");
    if (panel) panel.classList.add("open");
    fbxSpeech.textContent = "Ask me about KR Bot Automation!";
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
