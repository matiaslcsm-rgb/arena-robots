// Arena de Robots: una arena vacía y tu robot armado por piezas, en 3D estilo PS1.
//   W A S D: moverse · mouse: mirar (clic para capturarlo) · Espacio: saltar · Shift: impulso (gasta energía)
//   G: el garaje (cambiar piezas)
import * as THREE from 'three';
import { makeRenderer, ps1Material, floorTex, wallTex } from './ps1.js';
import { buildRobot, animateRobot } from './robot.js';
import { DEFAULT_BUILD, cleanBuild, computeStats } from './parts.js';
import { openGarage, closeGarage } from './garage.js';

const ARENA = 40;        // media arena (metros): el piso va de -40 a 40
const GRAVITY = 22;
const SAVE_KEY = 'arena-robots/armado';

const canvas = document.getElementById('view'), renderer = makeRenderer(canvas);
const scene = new THREE.Scene();
const FOG = '#8f9497';
scene.background = new THREE.Color(FOG); scene.fog = new THREE.Fog(FOG, 25, 80);
scene.add(new THREE.HemisphereLight('#dfe4e8', '#4a4640', 1.1));
const sun = new THREE.DirectionalLight('#fff1d8', 1.6); sun.position.set(20, 40, 15); scene.add(sun);
const camera = new THREE.PerspectiveCamera(60, 4 / 3, 0.1, 200);

// --- LA ARENA: piso de hormigón, paredes de chapa con franja de peligro, y un círculo en el centro ---
const floor = new THREE.Mesh(new THREE.PlaneGeometry(ARENA * 2, ARENA * 2, 16, 16), ps1Material(new THREE.MeshLambertMaterial({ map: floorTex(10) })));
floor.rotation.x = -Math.PI / 2; scene.add(floor);
const wallMat = ps1Material(new THREE.MeshLambertMaterial({ map: wallTex() }));
wallMat.map.repeat.set(20, 2);
const stripeMat = ps1Material(new THREE.MeshLambertMaterial({ color: '#f2c21a' }));
for (const [x, z, w, d] of [[0, -ARENA, ARENA * 2, 1], [0, ARENA, ARENA * 2, 1], [-ARENA, 0, 1, ARENA * 2], [ARENA, 0, 1, ARENA * 2]]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 7, d + 1, 8, 2, 8), wallMat); wall.position.set(x, 3.5, z); scene.add(wall);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(w + 1.1, 0.5, d + 1.1), stripeMat); stripe.position.set(x, 1, z); scene.add(stripe);
}
const ring = new THREE.Mesh(new THREE.RingGeometry(5.6, 6, 24), ps1Material(new THREE.MeshBasicMaterial({ color: '#c9a628' })));
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; scene.add(ring);

// --- EL ROBOT ---
let build = DEFAULT_BUILD;
try { build = cleanBuild(JSON.parse(localStorage.getItem(SAVE_KEY))); } catch (e) { /* armado de fábrica */ }
let stats = computeStats(build), robot = buildRobot(build);
scene.add(robot);
const me = { pos: new THREE.Vector3(0, 0, 10), vel: new THREE.Vector3(), yaw: Math.PI, pitch: 0.25, energy: stats.energy, ground: true };
function setBuild(b) {
    build = b; stats = computeStats(build);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(build)); } catch (e) { /* sin guardado: sigue andando */ }
    const rot = robot.rotation.y; scene.remove(robot); robot = buildRobot(build); scene.add(robot);
    robot.position.copy(me.pos); robot.rotation.y = rot;
    me.energy = Math.min(me.energy, stats.energy);
}

// --- CONTROLES ---
const keys = {};
let garage = false, started = false;
addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyG' && started) toggleGarage();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('mousemove', e => {
    if (document.pointerLockElement !== canvas || garage) return;
    me.yaw -= e.movementX * 0.0025; me.pitch = Math.max(-0.2, Math.min(0.9, me.pitch + e.movementY * 0.002));
});
const overlay = document.getElementById('overlay');
overlay.addEventListener('click', () => { started = true; overlay.hidden = true; canvas.requestPointerLock(); });
canvas.addEventListener('click', () => { if (started && !garage) canvas.requestPointerLock(); });
function toggleGarage() {
    garage = !garage;
    if (garage) { document.exitPointerLock(); openGarage(build, setBuild, toggleGarage); camera.setViewOffset(320, 240, -70, 0, 320, 240); } // el robot, a la derecha del panel
    else { closeGarage(); camera.clearViewOffset(); canvas.requestPointerLock(); }
}

// --- EL PASO DEL JUEGO ---
const hud = { ap: document.getElementById('ap'), en: document.getElementById('en-fill'), spd: document.getElementById('spd'), load: document.getElementById('load') };
let last = performance.now();
function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (started && !garage) step(dt);
    else animateRobot(robot, dt, 0, false);
    placeCamera(dt, now / 1000);
    renderer.render(scene, camera);
    drawHud();
    requestAnimationFrame(frame);
}
function step(dt) {
    // moverse relativo a la cámara; el robot mira para donde mira la cámara
    const fwd = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), side = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    const dir = new THREE.Vector3(Math.sin(me.yaw) * fwd - Math.cos(me.yaw) * side, 0, Math.cos(me.yaw) * fwd + Math.sin(me.yaw) * side);
    const boost = keys.ShiftLeft && me.energy > 0 && dir.lengthSq() > 0;
    me.energy = boost ? Math.max(0, me.energy - 350 * dt) : Math.min(stats.energy, me.energy + stats.regen * dt);
    const target = dir.lengthSq() ? dir.normalize().multiplyScalar(stats.speed * (boost ? 1.8 : 1)) : dir;
    const k = 1 - Math.exp(-(me.ground ? 10 : 2) * dt); // en el aire se maneja menos
    me.vel.x += (target.x - me.vel.x) * k; me.vel.z += (target.z - me.vel.z) * k;
    if (keys.Space && me.ground && stats.jump > 0) { me.vel.y = 9 * stats.jump; me.ground = false; }
    me.vel.y -= GRAVITY * dt;
    me.pos.addScaledVector(me.vel, dt);
    if (me.pos.y <= 0) { me.pos.y = 0; me.vel.y = 0; me.ground = true; }
    const lim = ARENA - 2.5; me.pos.x = Math.max(-lim, Math.min(lim, me.pos.x)); me.pos.z = Math.max(-lim, Math.min(lim, me.pos.z));
    robot.position.copy(me.pos);
    const turn = me.yaw - robot.rotation.y;
    robot.rotation.y += Math.atan2(Math.sin(turn), Math.cos(turn)) * Math.min(1, dt * 8); // gira hacia la cámara, por el lado corto
    animateRobot(robot, dt, Math.hypot(me.vel.x, me.vel.z), !me.ground);
}
// Cámara en tercera persona, detrás y arriba; en el garaje da vueltas alrededor del robot
function placeCamera(dt, t) {
    const look = me.pos.clone().add(new THREE.Vector3(0, 3, 0));
    const yaw = garage ? t * 0.4 : me.yaw, dist = garage ? 8 : 10, pitch = garage ? 0.25 : me.pitch;
    const want = look.clone().add(new THREE.Vector3(-Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist + 1, -Math.cos(yaw) * Math.cos(pitch) * dist));
    camera.position.lerp(want, garage ? 1 : 1 - Math.exp(-12 * dt));
    camera.lookAt(look);
}
function drawHud() {
    hud.ap.textContent = String(stats.armor).padStart(5, '0');
    hud.en.style.width = (100 * me.energy / stats.energy) + '%';
    hud.spd.textContent = Math.round(Math.hypot(me.vel.x, me.vel.z) * 3.6) + ' km/h';
    hud.load.textContent = `${stats.load}/${stats.maxLoad}` + (stats.over ? ' SOBRECARGA' : '');
    hud.load.classList.toggle('over', stats.over);
}
robot.position.copy(me.pos); robot.rotation.y = me.yaw;
requestAnimationFrame(frame);
