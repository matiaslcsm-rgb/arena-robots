// Arma el robot en 3D con las piezas elegidas y lo anima (piernas que caminan, orugas y ruedas que giran).
// Las piezas se enganchan: las piernas en el piso, el núcleo en la cadera, la cabeza en el cuello y los brazos en
// los hombros (lo dice cada pieza, ver parts.js).
import * as THREE from 'three';
import { partOf } from './parts.js';
import { mat } from './ps1.js';

const GEO = {}; // geometrías compartidas
function geo(s) {
    const k = s.t === 'box' ? 'b' + s.s.join(',') : `c${s.rad},${s.h},${s.seg || 8}`;
    return GEO[k] || (GEO[k] = s.t === 'box' ? new THREE.BoxGeometry(...s.s) : new THREE.CylinderGeometry(s.rad, s.rad, s.h, s.seg || 8));
}
// Una pieza: sus formas, agrupadas por lo que se anima (cada grupo gira alrededor de su pivote). mirror: el brazo izquierdo.
function buildPart(part, mirror = false) {
    const root = new THREE.Group(), groups = {};
    Object.entries(part.pivots || {}).forEach(([g, p]) => { const gr = new THREE.Group(); gr.position.set(...p); root.add(gr); groups[g] = gr; });
    part.shapes.forEach(s => {
        const m = new THREE.Mesh(geo(s), mat(s.m)), k = mirror ? -1 : 1;
        const pv = s.g ? part.pivots[s.g] : [0, 0, 0];
        m.position.set(s.p[0] * k - pv[0], s.p[1] - pv[1], s.p[2] - pv[2]);
        if (s.r) m.rotation.set(s.r[0], s.r[1] * k, s.r[2] * k);
        (s.g ? groups[s.g] : root).add(m);
    });
    return { root, groups };
}

export function buildRobot(build) {
    const robot = new THREE.Group(), legs = partOf(build, 'legs'), core = partOf(build, 'core');
    const L = buildPart(legs), C = buildPart(core), H = buildPart(partOf(build, 'head'));
    const AL = buildPart(partOf(build, 'armL'), true), AR = buildPart(partOf(build, 'armR'));
    robot.add(L.root);
    C.root.position.y = legs.hip; robot.add(C.root);
    H.root.position.set(...core.neck); C.root.add(H.root);
    AL.root.position.set(...core.armL); C.root.add(AL.root);
    AR.root.position.set(...core.armR); C.root.add(AR.root);
    robot.userData = { legs: L.groups, core: C.root, arms: [AL.root, AR.root], hip: legs.hip, step: 0 };
    return robot;
}

// La animación: speed es la velocidad real (m/s); al caminar, las piernas van y vienen y el núcleo se hamaca
export function animateRobot(robot, dt, speed, air) {
    const u = robot.userData, g = u.legs;
    u.step += dt * speed * 1.1;
    const swing = air ? 0.35 : Math.min(1, speed / 4) * 0.55;
    if (g.legL) { g.legL.rotation.x = Math.sin(u.step) * swing; g.legR.rotation.x = -Math.sin(u.step) * swing; }
    if (g.wheels) g.wheels.children.forEach(w => { w.rotation.x += dt * speed * 2.2; });
    if (g.tracks) g.tracks.children.forEach(t => { t.material.map.offset.y -= dt * speed * 0.15; });
    u.core.position.y = u.hip + (g.legL && !air ? Math.abs(Math.sin(u.step)) * 0.08 * Math.min(1, speed / 4) : 0);
    u.arms.forEach((a, i) => { a.rotation.x = Math.sin(u.step + i * Math.PI) * 0.06 * Math.min(1, speed / 4); });
}
