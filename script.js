import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const wrap=document.getElementById("npc");
const bubble=document.getElementById("npcBubble");
const canvas=document.getElementById("robotCanvas");
const chat=document.getElementById("chat");
const openChat=document.getElementById("openChat");
const closeChat=document.getElementById("closeChat");
const send=document.getElementById("send");
const chatInput=document.getElementById("chatInput");
const messages=document.getElementById("messages");

openChat.onclick=()=>chat.classList.toggle("open");
closeChat.onclick=()=>chat.classList.remove("open");
wrap.onclick=()=>{chat.classList.add("open"); addMsg("Hi KR Bot, tell me more.","userMsg"); setTimeout(()=>addMsg("Hello! I can explain our $20, $100, and $499 automation packages.","botMsg"),300);};

function addMsg(t,c){const p=document.createElement("p");p.className=c;p.textContent=t;messages.appendChild(p);messages.scrollTop=messages.scrollHeight;}

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,1,0.1,100);
camera.position.set(0,1.1,6);
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));

const robot=new THREE.Group(); scene.add(robot);
const metal=new THREE.MeshStandardMaterial({color:0x5f7890,roughness:.42,metalness:.7});
const orange=new THREE.MeshStandardMaterial({color:0xd36b2c,roughness:.5,metalness:.4});
const dark=new THREE.MeshStandardMaterial({color:0x111827,roughness:.7,metalness:.3});
const glow=new THREE.MeshStandardMaterial({color:0x22d3ee,emissive:0x22d3ee,emissiveIntensity:2.5});
function box(w,h,d,m){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m)}
function cyl(r,h,m){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),m)}
const body=box(1.35,1.5,.7,metal); body.position.y=.15; robot.add(body);
const head=box(1.25,.75,.7,metal); head.position.y=1.32; robot.add(head);
const e1=new THREE.Mesh(new THREE.SphereGeometry(.13,32,16),glow); e1.position.set(-.28,1.4,.4); robot.add(e1);
const e2=e1.clone(); e2.position.x=.28; robot.add(e2);
const mouth=box(.48,.04,.04,glow); mouth.position.set(0,1.16,.42); robot.add(mouth);
const chest=new THREE.Mesh(new THREE.SphereGeometry(.27,32,16),glow); chest.scale.z=.25; chest.position.set(0,.35,.4); robot.add(chest);
const antenna=cyl(.025,.42,metal); antenna.position.set(0,1.94,0); robot.add(antenna);
const tip=new THREE.Mesh(new THREE.SphereGeometry(.08,16,16),glow); tip.position.set(0,2.18,0); robot.add(tip);
const pack=box(.55,1.15,.45,dark); pack.position.set(.86,.3,-.25); robot.add(pack);
const lArm=new THREE.Group(); lArm.position.set(-.9,.65,0); const la=box(.23,.85,.24,metal); la.position.y=-.35; lArm.add(la); robot.add(lArm);
const rArm=new THREE.Group(); rArm.position.set(.9,.65,0); const ra=box(.23,.85,.24,metal); ra.position.y=-.35; rArm.add(ra); const tool=cyl(.045,.75,orange); tool.rotation.z=1.2; tool.position.set(.18,-.75,.25); rArm.add(tool); robot.add(rArm);
const lLeg=new THREE.Group(); lLeg.position.set(-.38,-.6,0); const ll=box(.26,.9,.26,metal); ll.position.y=-.4; lLeg.add(ll); robot.add(lLeg);
const rLeg=new THREE.Group(); rLeg.position.set(.38,-.6,0); const rl=box(.26,.9,.26,metal); rl.position.y=-.4; rLeg.add(rl); robot.add(rLeg);
const f1=box(.55,.18,.48,dark); f1.position.set(-.38,-1.5,.16); robot.add(f1); const f2=f1.clone(); f2.position.x=.38; robot.add(f2);
scene.add(new THREE.HemisphereLight(0x67e8f9,0x020617,2.2));
const pLight=new THREE.PointLight(0x22d3ee,2.8,10); pLight.position.set(2,3,4); scene.add(pLight);
const oLight=new THREE.PointLight(0xff7a18,1.5,8); oLight.position.set(-2,0,3); scene.add(oLight);

let mode="idle", t=0;
function resize(){const w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
resize(); addEventListener("resize",resize);

function anim(){requestAnimationFrame(anim);t+=.045;robot.rotation.y=Math.sin(t*.45)*.18;robot.position.y=Math.sin(t*2)*.05;
if(mode==="walking"){lArm.rotation.x=Math.sin(t*5)*.6;rArm.rotation.x=-Math.sin(t*5)*.6;lLeg.rotation.x=-Math.sin(t*5)*.45;rLeg.rotation.x=Math.sin(t*5)*.45;}
else if(mode==="fixing"){rArm.rotation.z=-.8+Math.sin(t*18)*.22;rArm.rotation.x=.35;oLight.intensity=3+Math.sin(t*20)*1.6;}
else if(mode==="scanning"){head.rotation.y=Math.sin(t*3)*.75;e1.scale.setScalar(1+Math.sin(t*10)*.15);e2.scale.copy(e1.scale);}
else{head.rotation.y=Math.sin(t*1.4)*.18;}
renderer.render(scene,camera);}
anim();

let targets=[],idx=0;
function refresh(){targets=[...document.querySelectorAll(".target")].filter(e=>e.offsetParent!==null);}
function point(el){const r=el.getBoundingClientRect(),rw=wrap.offsetWidth,rh=wrap.offsetHeight;return {x:Math.max(20,r.left+scrollX+r.width*.55-rw*.45),y:Math.max(90,r.top+scrollY+Math.min(r.height*.18,160)-rh*.2)}}
function setMode(m){mode=m;wrap.className="npc "+m;}
function go(el){setMode("walking");bubble.textContent="Walking to repair area...";const p=point(el);wrap.style.left=p.x+"px";wrap.style.top=p.y+"px";setTimeout(()=>work(el),2500);}
function work(el){const m=Math.random()>.5?"fixing":"scanning";setMode(m);document.querySelectorAll(".target").forEach(e=>e.classList.remove("active"));el.classList.add("active");bubble.textContent=el.dataset.msg||"Fixing this section...";spark(el);setTimeout(()=>{el.classList.remove("active");setMode("idle");bubble.textContent="Click me to know more";setTimeout(next,1200)},5000)}
function next(){refresh();if(!targets.length)return;idx=(idx+1)%targets.length;go(targets[idx]);}
function spark(el){const r=el.getBoundingClientRect();for(let i=0;i<20;i++){const s=document.createElement("div");s.style.cssText="position:absolute;width:7px;height:7px;border-radius:50%;background:#facc15;box-shadow:0 0 15px #f97316;z-index:80;pointer-events:none";s.style.left=(r.left+scrollX+Math.random()*r.width)+"px";s.style.top=(r.top+scrollY+Math.random()*Math.min(r.height,130))+"px";document.body.appendChild(s);const dx=Math.random()*140-70,dy=Math.random()*140-70;s.animate([{transform:"translate(0,0) scale(1)",opacity:1},{transform:`translate(${dx}px,${dy}px) scale(0)`,opacity:0}],{duration:900,easing:"ease-out"});setTimeout(()=>s.remove(),950)}}
addEventListener("load",()=>{refresh();const p=point(document.querySelector(".floor"));wrap.style.left=p.x+"px";wrap.style.top=p.y+"px";setMode("idle");setTimeout(next,1200)});

async function ask(){const msg=chatInput.value.trim();if(!msg)return;addMsg(msg,"userMsg");chatInput.value="";addMsg("Thinking...","botMsg");const last=messages.lastChild;try{const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg})});const data=await res.json();last.textContent=data.reply||"Sorry, please message us on WhatsApp."}catch(e){last.textContent="Gemini is not connected yet. Add GEMINI_API_KEY in Vercel."}}
send.onclick=ask;chatInput.addEventListener("keydown",e=>{if(e.key==="Enter")ask()});
