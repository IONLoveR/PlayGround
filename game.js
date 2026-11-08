import * as THREE from './vendor/three.module.js';

const $ = (selector) => document.querySelector(selector);
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#081222');
scene.fog = new THREE.FogExp2('#101d32', .009);
const camera = new THREE.PerspectiveCamera(54, innerWidth/innerHeight, .1, 190);
camera.position.set(0, 5.2, 10.4);
scene.add(new THREE.HemisphereLight(0xa6cce3, 0x182338, 1.7));
const moonLight = new THREE.DirectionalLight(0xbde9ff, 2.1);
moonLight.position.set(-5,12,8); scene.add(moonLight);
const cityGlow = new THREE.PointLight(0x1ba9c9, 22, 38, 1.8);
cityGlow.position.set(0,7,-16); scene.add(cityGlow);
const pinkGlow = new THREE.PointLight(0x923baf, 16, 28, 2);
pinkGlow.position.set(9,5,-25); scene.add(pinkGlow);

const material = (color, roughness=.72, metalness=.05, emissive=0, intensity=0) =>
  new THREE.MeshStandardMaterial({color, roughness, metalness, emissive, emissiveIntensity:intensity});
const box = new THREE.BoxGeometry(1,1,1);
function cube(parent, mat, x,y,z,sx,sy,sz) {
  const mesh = new THREE.Mesh(box, mat);
  mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); parent.add(mesh); return mesh;
}
const roadMat=material('#111a2a',.91), sidewalkMat=material('#273247');
const windowBlue=material('#25445b',.36,.2,0x1c7193,.65);
const windowPink=material('#5d2a61',.38,.1,0x9a3a99,.8);
const windowGold=material('#705534',.4,.1,0xffbb55,.7);
const cyanMat=material('#49e7f2',.3,.25,0x33ddee,2.2);
const limeMat=material('#d8ff64',.3,.1,0xb6f94f,1.8);
const redMat=material('#f06478',.3,.1,0xc72842,1.2);

// A deep avenue, lane markers, and repeating sidewalks create the sense of speed.
cube(scene,roadMat,0,-.34,-46,13,.55,120);
cube(scene,sidewalkMat,-7.2,-.12,-46,1.5,.75,120);
cube(scene,sidewalkMat,7.2,-.12,-46,1.5,.75,120);
for (const x of [-4.25,4.25]) cube(scene,cyanMat,x,.035,-46,.055,.035,120);
cube(scene,material('#101b2c'),0,-.7,-46,120,.35,125);
const laneDash=[];
for(let lane=0;lane<2;lane++) for(let i=0;i<18;i++)
  laneDash.push(cube(scene,material('#6a8b9b',.5,.1,0x224357,.35),lane===0?-1.35:1.35,.002,-93+i*6,.045,.018,2.2));

// Procedural high-rise blocks with randomized neon windows and rooftop signs.
const buildings=[];
function makeBuilding(side,index) {
  const group=new THREE.Group();
  const width=3.6+Math.random()*4.2, height=9+Math.random()*20, depth=8+Math.random()*9;
  group.position.set(side*(8.4+width*.48+Math.random()*2.2),0,-10-index*15-Math.random()*8);
  const walls=['#18263a','#1a2636','#202638','#172333','#20283a'];
  cube(group,material(walls[Math.random()*walls.length|0],.88),0,height/2,0,width,height,depth);
  cube(group,material('#26364b',.6,.15),0,height+.13,0,width+.3,.26,depth+.3);
  const windows=[windowBlue,windowPink,windowGold], cols=Math.max(2,Math.floor(width/1.12)), rows=Math.floor(height/1.5);
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
    if(Math.random()<.22) continue;
    cube(group,windows[Math.random()*3|0],-width/2+.42+c*(width-.84)/Math.max(1,cols-1),1+r*1.35,depth/2+.014,.42,.68,.035);
  }
  for(let r=0;r<rows;r++) for(let c=0;c<2;c++) if(Math.random()>.3)
    cube(group,windows[Math.random()*3|0],side*(width/2+.014),1.2+r*1.5,-depth*.25+c*depth*.5,.035,.68,.55);
  if(index%3!==1) {
    cube(group,side===1?windowPink:windowBlue,0,height*.72,depth/2+.05,width*.53,.7,.08);
    cube(group,material('#d8f7ff',.4,.05,side===1?0xec53da:0x50eaff,2.8),0,height*.72,depth/2+.1,width*.39,.055,.025);
  }
  if(index%4===0) cube(group,cyanMat,0,height+1.1,0,.07,2,.07);
  scene.add(group); buildings.push(group);
}
for(const side of [-1,1]) for(let i=0;i<11;i++) makeBuilding(side,i);

const starGeo=new THREE.BufferGeometry(), stars=[];
for(let i=0;i<160;i++) stars.push((Math.random()-.5)*140,8+Math.random()*40,-65-Math.random()*70);
starGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xb4e9ff,size:.14,transparent:true,opacity:.72})));
const moon=new THREE.Mesh(new THREE.SphereGeometry(2.1,20,20),new THREE.MeshBasicMaterial({color:0x9ed4e3,transparent:true,opacity:.72}));
moon.position.set(-24,29,-90); scene.add(moon);
const halo=new THREE.Mesh(new THREE.SphereGeometry(3.1,20,20),new THREE.MeshBasicMaterial({color:0x35aac4,transparent:true,opacity:.08,side:THREE.BackSide}));
halo.position.copy(moon.position); scene.add(halo);

// A bright, readable hero silhouette with a trailing energy cape.
const hero=new THREE.Group(); hero.position.set(0,0,1.35); scene.add(hero);
const heroDark=material('#172639',.38,.2), suit=material('#d8ff64',.3,.15,0x9bd92f,.65);
const suitBlue=material('#43dbea',.26,.2,0x22b4d2,1.1), visor=material('#071522',.12,.6,0x30dded,.6);
const skin=material('#dcb49b',.78);
const capeMat=new THREE.MeshStandardMaterial({color:0x087d91,roughness:.48,metalness:.1,emissive:0x034955,emissiveIntensity:.7,side:THREE.DoubleSide});
cube(hero,heroDark,0,1.05,0,.78,.9,.42);
cube(hero,suitBlue,0,1.22,.225,.53,.27,.055);
cube(hero,suit,0,.72,.01,.57,.17,.45);
const head=new THREE.Mesh(new THREE.SphereGeometry(.29,16,12),skin); head.position.set(0,1.82,.02); hero.add(head);
const mask=new THREE.Mesh(new THREE.BoxGeometry(.49,.17,.12),visor); mask.position.set(0,1.84,.255); hero.add(mask);
cube(hero,suit,0,2.05,0,.23,.1,.25);
const capeGeo=new THREE.BufferGeometry();
capeGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-.28,1.49,-.22,.28,1.49,-.22,-.43,.48,-.9,.43,.48,-.9]),3));
capeGeo.setIndex([0,2,1,1,2,3]); capeGeo.computeVertexNormals();
const cape=new THREE.Mesh(capeGeo,capeMat); hero.add(cape);
const limbs=[];
for(const side of [-1,1]) {
  const arm=new THREE.Group(); arm.position.set(side*.48,1.35,0); hero.add(arm);
  cube(arm,suit,0,-.27,0,.22,.59,.23); cube(arm,heroDark,0,-.53,.04,.2,.17,.22); limbs.push(arm);
  const leg=new THREE.Group(); leg.position.set(side*.22,.57,0); hero.add(leg);
  cube(leg,heroDark,0,-.25,0,.28,.6,.3); cube(leg,suitBlue,0,-.5,.12,.3,.12,.48); limbs.push(leg);
}
const runnerLight=new THREE.PointLight(0x58e9ff,3.8,5,2); runnerLight.position.set(0,1.1,.2); hero.add(runnerLight);

// Hazards and energy shards are recycled as they pass the runner.
const obstacles=[], shards=[];
const barrierMat=material('#e85f70',.38,.15,0xa31e3d,.7), crateMat=material('#cd914f',.68,.04,0x693e1c,.2), carMat=material('#24364b',.26,.65,0x111a26,.2);
function makeObstacle(type,lane,z) {
  const group=new THREE.Group(); group.position.set(lane*2.7,0,z); group.userData={type,hit:false};
  if(type==='barrier') {
    cube(group,barrierMat,0,.54,0,1.45,1.08,.7); cube(group,limeMat,0,.75,.37,1.32,.12,.06);
    cube(group,material('#211827'),0,.25,.37,.45,.17,.055);
    for(const side of [-1,1]) cube(group,material('#34445a'),side*.54,.12,0,.14,.24,.84);
  } else if(type==='car') {
    cube(group,carMat,0,.61,0,1.65,.88,2.2); cube(group,material('#314860',.25,.5),0,1.05,-.13,1.25,.48,1.15);
    cube(group,redMat,-.53,.45,1.12,.28,.18,.08); cube(group,redMat,.53,.45,1.12,.28,.18,.08);
    cube(group,cyanMat,-.56,.54,-1.12,.25,.12,.07); cube(group,cyanMat,.56,.54,-1.12,.25,.12,.07);
    for(const side of [-1,1]) cube(group,material('#080c12'),side*.82,.28,.58,.12,.32,.38);
  } else {
    cube(group,crateMat,0,.52,0,1.15,1.05,1.15); cube(group,limeMat,0,.55,.59,.8,.14,.045);
    cube(group,material('#f1d29a'),0,.19,.59,.16,.22,.05);
  }
  scene.add(group); obstacles.push(group);
}
function makeShard(lane,z,y=1.35) {
  const group=new THREE.Group(); group.position.set(lane*2.7,y,z);
  const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.38,0),limeMat); crystal.rotation.z=Math.PI/4; group.add(crystal);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.48,.025,6,20),cyanMat); ring.rotation.x=Math.PI/2; group.add(ring);
  group.add(new THREE.PointLight(0xc9ff56,1.2,3,2)); scene.add(group); shards.push(group);
}

let state='ready', targetLane=0, score=0, coins=0, charge=0, speed=21, elapsed=0;
let spawnTimer=1, shardTimer=1, jumpTime=0, boostTime=0, invuln=0, runClock=0;
let lastTime=performance.now(), soundOn=false, audioCtx=null, swipeStart=null;
let best=Number(localStorage.getItem('voltBest')||0);
const distanceEl=$('#distance'), coinEl=$('#coinCount'), chargeText=$('#chargeText'), chargeFill=$('#chargeFill');
const speedText=$('#speedText'), powerTip=$('#powerTip'), intro=$('#introScreen'), gameover=$('#gameoverScreen');
const hud=$('#hud'), touchControls=$('.touch-controls'), mobileNote=$('#mobileNote'), toast=$('#toast');
function isMobile(){return matchMedia('(max-width:700px)').matches||'ontouchstart' in window;}
function updateControls(){touchControls.classList.toggle('active',state==='running'&&isMobile());mobileNote.style.display=state==='ready'&&isMobile()?'block':'none';}
function playTone(freq,duration=.1,wave='sine') {
  if(!soundOn) return;
  try { audioCtx ||= new (window.AudioContext||window.webkitAudioContext)(); const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
    osc.type=wave; osc.frequency.value=freq; gain.gain.setValueAtTime(.055,audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration); osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime+duration);
  } catch {}
}
function move(dir){if(state==='ready'){resetGame();return;} if(state==='running') targetLane=THREE.MathUtils.clamp(targetLane+dir,-1,1);}
function jump(){if(state==='ready'){resetGame();return;} if(state!=='running'||jumpTime>0)return; jumpTime=.78; playTone(480,.08);}
function burst(){
  if(state!=='running'||charge<100||boostTime>0)return;
  charge=0; boostTime=3.2; invuln=3.2; powerTip.classList.remove('ready');
  const flash=$('#flash'); flash.classList.remove('pulse'); void flash.offsetWidth; flash.classList.add('pulse');
  toast.classList.remove('hidden'); requestAnimationFrame(()=>toast.classList.add('show'));
  setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.classList.add('hidden'),300);},900);
  playTone(740,.2,'sawtooth');
}
function resetGame(){
  for(const item of obstacles)scene.remove(item); for(const item of shards)scene.remove(item);
  obstacles.length=0; shards.length=0; state='running'; targetLane=0; hero.position.x=0;
  score=coins=charge=elapsed=runClock=0; speed=21; spawnTimer=.75; shardTimer=.9; jumpTime=boostTime=invuln=0;
  intro.classList.add('hidden'); gameover.classList.add('hidden'); $('#pauseBadge').classList.add('hidden');
  distanceEl.textContent='0'; coinEl.textContent='0'; chargeText.textContent='0%'; chargeFill.style.width='0%';
  updateControls(); lastTime=performance.now();
}
function endGame(){
  if(state!=='running')return; state='over';
  $('#finalDistance').textContent=Math.floor(score); $('#finalCoins').textContent=coins;
  best=Math.max(best,Math.floor(score)); localStorage.setItem('voltBest',best); $('#bestDistance').textContent=best;
  gameover.classList.remove('hidden'); updateControls(); playTone(130,.4,'triangle');
}
function spawnWave(){
  const lanes=[-1,0,1], first=lanes[Math.random()*3|0], roll=Math.random();
  makeObstacle(roll<.46?'barrier':roll<.77?'car':'crate',first,-83);
  if(Math.random()<.44){let second=lanes[Math.random()*3|0]; if(second===first)second=lanes[(lanes.indexOf(first)+1+(Math.random()*2|0))%3]; makeObstacle(Math.random()<.55?'car':'barrier',second,-101);}
}
function updateGame(dt){
  if(state!=='running')return;
  runClock+=dt; elapsed+=dt; speed=Math.min(35,21+elapsed*.18);
  const boosted=boostTime>0, worldSpeed=speed*(boosted?1.72:1);
  score+=worldSpeed*dt*.29; distanceEl.textContent=Math.floor(score);
  speedText.textContent=Math.round(speed*3.6*(boosted?1.5:1));
  if(boosted)boostTime=Math.max(0,boostTime-dt); if(invuln>0)invuln=Math.max(0,invuln-dt);
  hero.position.x=THREE.MathUtils.damp(hero.position.x,targetLane*2.7,13,dt);
  if(jumpTime>0){jumpTime-=dt;hero.position.y=Math.sin((1-jumpTime/.78)*Math.PI)*1.48;}else hero.position.y=0;
  limbs.forEach((limb,i)=>limb.rotation.x=Math.sin(runClock*13+(i%2)*Math.PI)*.62*(jumpTime>0?.25:1));
  cape.rotation.x=Math.sin(runClock*8)*.16; cape.rotation.z=Math.sin(runClock*6)*.07;
  hero.rotation.z=THREE.MathUtils.damp(hero.rotation.z,(targetLane*2.7-hero.position.x)*-.09,10,dt);
  runnerLight.intensity=boosted?8:3.8; suit.emissiveIntensity=boosted?1.8:.65;
  for(const marker of laneDash){marker.position.z+=worldSpeed*dt;if(marker.position.z>9)marker.position.z-=108;}
  for(const building of buildings){building.position.z+=worldSpeed*dt*.66;if(building.position.z>24)building.position.z-=165;}
  spawnTimer-=dt; if(spawnTimer<=0){spawnWave();spawnTimer=Math.max(.92,1.55-elapsed*.006)+Math.random()*.38;}
  shardTimer-=dt; if(shardTimer<=0){const lane=[-1,0,1][Math.random()*3|0];for(let i=0;i<3;i++)makeShard(lane,-79-i*3.2,1.25+Math.sin(i*.7)*.12);shardTimer=2.15+Math.random()*1.25;}

  for(let i=obstacles.length-1;i>=0;i--){
    const obstacle=obstacles[i]; obstacle.position.z+=worldSpeed*dt;
    if(!obstacle.userData.hit&&Math.abs(obstacle.position.z-hero.position.z)<1.25&&Math.abs(obstacle.position.x-hero.position.x)<1.25){
      obstacle.userData.hit=true;
      if(invuln>0){scene.remove(obstacle);obstacles.splice(i,1);continue;}
      if(hero.position.y<.85){endGame();return;}
      playTone(220,.07,'triangle');
    }
    if(obstacle.position.z>11){scene.remove(obstacle);obstacles.splice(i,1);}
  }
  for(let i=shards.length-1;i>=0;i--){
    const shard=shards[i]; shard.position.z+=worldSpeed*dt; shard.rotation.y+=dt*2.7;
    shard.children[0].rotation.x+=dt*1.5;
    if(Math.abs(shard.position.z-hero.position.z)<1.25&&Math.abs(shard.position.x-hero.position.x)<1.3){
      coins++; charge=Math.min(100,charge+20); coinEl.textContent=coins;
      chargeText.textContent=`${charge}%`; chargeFill.style.width=`${charge}%`;
      if(charge>=100)powerTip.classList.add('ready');
      playTone(660,.1); scene.remove(shard); shards.splice(i,1); continue;
    }
    if(shard.position.z>10){scene.remove(shard);shards.splice(i,1);}
  }
  camera.position.x=THREE.MathUtils.damp(camera.position.x,hero.position.x*.16,3,dt);
  camera.position.y=5.2+Math.sin(runClock*5)*.035;
  camera.lookAt(hero.position.x*.12,1.05,-5.5);
  if(boostTime<=0&&boosted){suit.emissiveIntensity=.65;runnerLight.intensity=3.8;}
}

function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min(.04,Math.max(0,(now-lastTime)/1000)); lastTime=now;
  if(state==='running')updateGame(dt);
  else if(state==='ready'){
    const t=now*.001; hero.position.y=Math.sin(t*2)*.035; hero.rotation.y=Math.sin(t*.7)*.04;
    cape.rotation.x=Math.sin(t*3)*.12;
    camera.lookAt(0,1,-5.5);
  }
  renderer.render(scene,camera);
}

function pauseGame(){
  if(state==='running'){state='paused';$('#pauseBadge').classList.remove('hidden');updateControls();}
  else if(state==='paused'){state='running';$('#pauseBadge').classList.add('hidden');updateControls();lastTime=performance.now();}
}
$('#startBtn').addEventListener('click',resetGame);
$('#restartBtn').addEventListener('click',resetGame);
$('#leftBtn').addEventListener('pointerdown',e=>{e.preventDefault();move(-1);});
$('#rightBtn').addEventListener('pointerdown',e=>{e.preventDefault();move(1);});
$('#jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();jump();});
$('#boostBtn').addEventListener('pointerdown',e=>{e.preventDefault();burst();});
$('#soundBtn').addEventListener('click',()=>{
  soundOn=!soundOn; $('#soundBtn').classList.toggle('on',soundOn);
  if(soundOn){playTone(540,.08);if(audioCtx?.state==='suspended')audioCtx.resume();}
});
$('#pauseBadge').addEventListener('click',pauseGame);
window.addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','a','A','d','D','w','W','p','P','Escape','Shift'].includes(e.key))e.preventDefault();
  if(e.repeat)return;
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')move(-1);
  else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')move(1);
  else if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key===' ')jump();
  else if(e.key==='Shift'||e.key==='x'||e.key==='X')burst();
  else if(e.key==='p'||e.key==='P'||e.key==='Escape')pauseGame();
  else if(e.key==='Enter'&&(state==='ready'||state==='over'))resetGame();
});
canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'){swipeStart={x:e.clientX,y:e.clientY,time:performance.now()};}
});
canvas.addEventListener('pointerup',e=>{
  if(!swipeStart)return;
  const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;
  swipeStart=null;
  if(Math.max(Math.abs(dx),Math.abs(dy))<24){if(state==='ready')resetGame();else if(state==='running')jump();return;}
  if(Math.abs(dx)>Math.abs(dy))move(dx<0?-1:1);
  else if(dy<0)jump();
});
canvas.addEventListener('pointercancel',()=>{swipeStart=null;});
window.addEventListener('blur',()=>{if(state==='running')pauseGame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='running')pauseGame();});
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6)); renderer.setSize(innerWidth,innerHeight);
  updateControls();
});
updateControls();
requestAnimationFrame(animate);
