
import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js?deps=three@0.160.0";

const robotNpc = document.getElementById("robotNpc");
const robotCanvas = document.getElementById("robotCanvas");
const robotSpeech = document.getElementById("robotSpeech");

let robotMixer = null;
let robotModel = null;
let robotClock = new THREE.Clock();
let robotDirection = 1;

function openKRChat(){
  const panel = document.getElementById("chatPanel");
  if (panel) panel.classList.add("open");
  if (robotSpeech) robotSpeech.textContent = "Ask me about KR Bot Automation!";
}

if (robotNpc) {
  robotNpc.addEventListener("click", openKRChat);
}
if (robotSpeech) {
  robotSpeech.addEventListener("click", (e) => {
    e.stopPropagation();
    openKRChat();
  });
}

if (robotCanvas && robotNpc) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 1000);
  camera.position.set(0, 1.35, 5.8);

  const renderer = new THREE.WebGLRenderer({ canvas: robotCanvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x0f172a, 3.0));

  const key = new THREE.DirectionalLight(0xffffff, 3.3);
  key.position.set(4, 7, 5);
  scene.add(key);

  const blue = new THREE.PointLight(0x22d3ee, 3.2, 12);
  blue.position.set(-3, 3, 4);
  scene.add(blue);

  function resizeRobot(){
    const w = robotNpc.clientWidth || 300;
    const h = robotNpc.clientHeight || 360;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resizeRobot();
  window.addEventListener("resize", resizeRobot);

  const loader = new GLTFLoader();

  loader.load(
    "assets/robot.glb",
    (gltf) => {
      robotModel = gltf.scene;

      robotModel.traverse((child) => {
        if (child.isMesh) child.frustumCulled = false;
      });

      const box = new THREE.Box3().setFromObject(robotModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      robotModel.position.sub(center);

      const maxSize = Math.max(size.x, size.y, size.z) || 1;
      robotModel.scale.setScalar(2.9 / maxSize);
      robotModel.position.y = -1.02;

      scene.add(robotModel);

      if (gltf.animations && gltf.animations.length) {
        robotMixer = new THREE.AnimationMixer(robotModel);
        const clip =
          gltf.animations.find(a => /walk|walking|run/i.test(a.name)) ||
          gltf.animations.find(a => /idle/i.test(a.name)) ||
          gltf.animations[0];
        robotMixer.clipAction(clip).play();
      }

      robotSpeech.textContent = "Hi! Click me to ask about our services.";
    },
    (xhr) => {
      if (xhr.total) robotSpeech.textContent = "Loading robot " + Math.round(xhr.loaded / xhr.total * 100) + "%";
    },
    (error) => {
      console.error("GLB LOAD ERROR:", error);
      robotSpeech.textContent = "Robot file not found. Add assets/robot.glb";
      const fallback = document.createElement("div");
      fallback.className = "robot-fallback";
      robotNpc.appendChild(fallback);
    }
  );

  function animateRobot(){
    requestAnimationFrame(animateRobot);
    const delta = robotClock.getDelta();

    if (robotMixer) robotMixer.update(delta);

    if (robotModel) {
      const time = Date.now() * 0.001;
      robotModel.rotation.y = Math.sin(time * 1.15) * 0.14 + (robotDirection === 1 ? 0.25 : -0.25);
      robotModel.position.y = -1.02 + Math.sin(time * 3) * 0.035;
      if (!robotMixer) robotModel.rotation.z = Math.sin(time * 4) * 0.025;
    }

    renderer.render(scene, camera);
  }
  animateRobot();

  const targets = [
    { selector: ".hero-visual", text: "Click me to ask about KR Bot services." },
    { selector: "#services", text: "We build Messenger and WhatsApp bots." },
    { selector: ".service-card:nth-child(1)", text: "Messenger Bot starts at $20." },
    { selector: ".service-card:nth-child(2)", text: "Messenger + WhatsApp is $100." },
    { selector: ".service-card:nth-child(3)", text: "Lead generation helps collect buyers." },
    { selector: "#pricing", text: "Website + Messenger Bot package is $499." },
    { selector: "#contact", text: "Click me or WhatsApp us to start." }
  ];

  let targetIndex = 0;

  function getPoint(target){
    const el = document.querySelector(target.selector);
    if (!el) return null;

    const r = el.getBoundingClientRect();
    const x = window.scrollX + r.left + r.width * 0.62 - robotNpc.offsetWidth / 2;
    const y = window.scrollY + r.top + Math.min(r.height * 0.30, 230) - robotNpc.offsetHeight * 0.58;

    return { x: Math.max(18, x), y: Math.max(90, y), text: target.text };
  }

  function patrol(){
    const point = getPoint(targets[targetIndex % targets.length]);

    if (point) {
      const oldX = parseFloat(robotNpc.style.left || robotNpc.offsetLeft || 0);
      robotDirection = point.x >= oldX ? 1 : -1;
      robotNpc.style.left = point.x + "px";
      robotNpc.style.top = point.y + "px";
      robotNpc.style.transform = robotDirection === 1 ? "scaleX(1)" : "scaleX(-1)";
      robotSpeech.textContent = point.text;
    }

    targetIndex++;
    setTimeout(patrol, 6500);
  }

  window.addEventListener("load", () => setTimeout(patrol, 1200));
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
