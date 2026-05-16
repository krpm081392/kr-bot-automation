import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/OBJLoader.js";

const canvas = document.getElementById("robotCanvas");
const bay = document.querySelector(".robot-bay");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(0, 1.4, 6);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const hemi = new THREE.HemisphereLight(0x99ddff, 0x050505, 2.5);
scene.add(hemi);

const light = new THREE.PointLight(0x22d3ee, 3, 50);
light.position.set(4, 6, 5);
scene.add(light);

const orange = new THREE.PointLight(0xff7a18, 4, 20);
orange.position.set(-2, 1, 3);
scene.add(orange);

const floor = new THREE.Mesh(
  new THREE.CylinderGeometry(2.6, 2.6, 0.08, 64),
  new THREE.MeshStandardMaterial({ color: 0x07111e, roughness: 0.7, metalness: 0.4 })
);
floor.position.y = -1.6;
floor.scale.z = 0.45;
scene.add(floor);

let model = new THREE.Group();
scene.add(model);

const loader = new OBJLoader();
loader.load(
  "assets/Rmk3.obj",
  (obj) => {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x7f8fa0,
          roughness: 0.45,
          metalness: 0.75
        });
        child.castShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    obj.position.sub(center);
    const maxSize = Math.max(size.x, size.y, size.z);
    obj.scale.setScalar(3.1 / maxSize);

    model.add(obj);
  },
  undefined,
  () => {
    const fallback = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.4, 1),
      new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: .7, roughness: .4 })
    );
    model.add(fallback);
  }
);

function resize(){
  const w = bay.clientWidth;
  const h = bay.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

let t = 0;
function animate(){
  requestAnimationFrame(animate);
  t += 0.015;

  model.rotation.y = Math.sin(t * 1.2) * 0.45 + 0.3;
  model.rotation.x = Math.sin(t * 2.2) * 0.06;
  model.position.y = Math.sin(t * 3) * 0.08 - 0.2;

  orange.intensity = 2.5 + Math.sin(t * 18) * 1.8;

  renderer.render(scene, camera);
}
animate();

// Gemini chat
const openChat = document.getElementById("openChat");
const closeChat = document.getElementById("closeChat");
const aiPanel = document.getElementById("aiPanel");
const sendAi = document.getElementById("sendAi");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");

openChat.onclick = () => aiPanel.classList.toggle("open");
closeChat.onclick = () => aiPanel.classList.remove("open");

function addMsg(text, type){
  const p = document.createElement("p");
  p.className = type === "user" ? "ai-user" : "ai-bot";
  p.textContent = text;
  aiMessages.appendChild(p);
  aiMessages.scrollTop = aiMessages.scrollHeight;
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
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:msg})
    });
    const data = await res.json();
    last.textContent = data.reply || "Sorry, please message us on WhatsApp.";
  }catch(e){
    last.textContent = "Gemini is not connected yet. Add GEMINI_API_KEY in Vercel.";
  }
}
sendAi.onclick = askAi;
aiInput.addEventListener("keydown", e => {
  if(e.key === "Enter") askAi();
});
