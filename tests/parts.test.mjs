// Pruebas del catálogo, del esqueleto y de las cuentas. Uso: node tests/parts.test.mjs
import assert from 'node:assert/strict';
import { SLOTS, PARTS, BONES as BONE_NAMES, LIMB_BONES, DEFAULT_BUILD, catalog, cleanBuild, computeStats } from '../src/parts.js';
import { BONES, SHAPES, LEG } from '../src/skeleton.js';

const MATS = ['gris', 'oliva', 'hueso', 'nar', 'ama', 'carbon', 'metal', 'peligro', 'oruga', 'lente', 'hierro', 'junta', 'cobre', 'cableR', 'cableV', 'cableA'];
const ALL_BONES = BONES.map(b => b.n);
let n = 0;
const test = (name, fn) => { fn(); n++; console.log('✅', name); };
const validShape = (s, who) => {
    assert.ok(MATS.includes(s.m), `${who}: material "${s.m}"`);
    assert.ok(s.t === 'box' ? s.s.length === 3 : s.t === 'cyl' && s.rad > 0 && s.h > 0, `${who}: forma ${s.t}`);
    assert.ok(ALL_BONES.includes(s.b), `${who}: el hueso "${s.b}" existe`);
};

test('el esqueleto: cada hueso tiene su padre antes, y el dibujo usa huesos que existen', () => {
    const seen = new Set();
    for (const b of BONES) { assert.ok(!b.parent || seen.has(b.parent), `${b.n}: su padre ${b.parent} va antes`); seen.add(b.n); }
    SHAPES.forEach(s => validShape(s, 'esqueleto'));
    assert.ok(BONE_NAMES.every(b => ALL_BONES.includes(b)), 'los huesos que nombra parts.js existen');
});

test('las piernas llegan justo al piso', () => {
    const y = n => BONES.find(b => b.n === n).p[1];
    const ankle = y('pelvis') + y('thigh') + y('shin') + y('foot');
    assert.ok(Math.abs(ankle - LEG.ankle) < 1e-9, `el tobillo queda a ${ankle}`);
    assert.equal(-y('shin'), LEG.thigh); assert.equal(-y('foot'), LEG.shin);
});

test('cada pieza tiene sus números y una forma válida', () => {
    for (const [group, parts] of Object.entries(PARTS)) for (const [key, p] of Object.entries(parts)) {
        assert.ok(p.name && p.weight > 0 && p.armor > 0, `${group}.${key}: nombre, peso y blindaje`);
        assert.ok(p.shapes.length, `${group}.${key}: tiene forma`);
        p.shapes.forEach(s => validShape(s, `${group}.${key}`));
    }
    for (const p of Object.values(PARTS.legs)) assert.ok(p.maxLoad > 0 && p.speed > 0 && ['walk', 'heavy', 'glide'].includes(p.gait));
    for (const p of Object.values(PARTS.core)) assert.ok(p.energy > 0 && p.regen > 0);
    for (const p of Object.values(PARTS.arm)) {
        assert.ok(['aim', 'free'].includes(p.pose), `${p.name}: pose`);
        assert.ok(p.shapes.every(s => LIMB_BONES.arm.includes(s.b)), `${p.name}: solo huesos del brazo`);
    }
});

test('el armado de fábrica camina sin sobrecarga', () => {
    const st = computeStats(DEFAULT_BUILD);
    assert.equal(st.over, false);
    assert.equal(st.speed, PARTS.legs.bipedo.speed);
    assert.equal(st.weight, SLOTS.reduce((t, s) => t + catalog(s)[DEFAULT_BUILD[s]].weight, 0));
});

test('pasado de carga anda más lento, pero nunca menos de un tercio', () => {
    const st = computeStats({ legs: 'ruedas', core: 'pesado', head: 'domo', armL: 'canon', armR: 'canon' });
    assert.ok(st.over && st.load > st.maxLoad);
    assert.ok(st.speed < PARTS.legs.ruedas.speed && st.speed >= PARTS.legs.ruedas.speed / 3);
});

test('un armado roto (pieza que no existe) se arregla con las de fábrica', () => {
    assert.deepEqual(cleanBuild({ legs: 'oruga', core: 'nada' }), { ...DEFAULT_BUILD, legs: 'oruga' });
    assert.deepEqual(cleanBuild(null), DEFAULT_BUILD);
});

console.log(`\n${n}/${n} pruebas`);
