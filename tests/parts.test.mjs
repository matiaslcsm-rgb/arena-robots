// Pruebas del catálogo y de las cuentas. Uso: node tests/parts.test.mjs
import assert from 'node:assert/strict';
import { SLOTS, PARTS, DEFAULT_BUILD, catalog, cleanBuild, computeStats } from '../src/parts.js';

const MATS = ['gris', 'oliva', 'hueso', 'nar', 'ama', 'carbon', 'metal', 'peligro', 'oruga', 'lente'];
let n = 0;
const test = (name, fn) => { fn(); n++; console.log('✅', name); };

test('cada pieza tiene sus números y una forma válida', () => {
    for (const [group, parts] of Object.entries(PARTS)) for (const [key, p] of Object.entries(parts)) {
        assert.ok(p.name && p.weight > 0 && p.armor > 0, `${group}.${key}: nombre, peso y blindaje`);
        assert.ok(p.shapes.length, `${group}.${key}: tiene forma`);
        for (const s of p.shapes) {
            assert.ok(MATS.includes(s.m), `${group}.${key}: material "${s.m}"`);
            assert.ok(s.t === 'box' ? s.s.length === 3 : s.t === 'cyl' && s.rad > 0 && s.h > 0, `${group}.${key}: forma ${s.t}`);
            if (s.g) assert.ok(p.pivots && p.pivots[s.g], `${group}.${key}: el grupo "${s.g}" tiene su pivote`);
        }
    }
    for (const p of Object.values(PARTS.legs)) assert.ok(p.hip > 0 && p.maxLoad > 0 && p.speed > 0);
    for (const p of Object.values(PARTS.core)) assert.ok(p.neck && p.armL && p.armR && p.energy > 0);
});

test('el armado de fábrica camina sin sobrecarga', () => {
    const st = computeStats(DEFAULT_BUILD);
    assert.equal(st.over, false);
    assert.equal(st.speed, PARTS.legs.bipedo.speed);
    assert.equal(st.weight, SLOTS.reduce((t, s) => t + catalog(s)[DEFAULT_BUILD[s]].weight, 0));
});

test('pasado de carga anda más lento, pero nunca menos de un tercio', () => {
    const heavy = { legs: 'ruedas', core: 'pesado', head: 'domo', armL: 'canon', armR: 'canon' };
    const st = computeStats(heavy);
    assert.ok(st.over && st.load > st.maxLoad);
    assert.ok(st.speed < PARTS.legs.ruedas.speed && st.speed >= PARTS.legs.ruedas.speed / 3);
});

test('las orugas aguantan más que las ruedas', () => {
    assert.ok(PARTS.legs.oruga.maxLoad > PARTS.legs.ruedas.maxLoad && PARTS.legs.oruga.armor > PARTS.legs.ruedas.armor);
});

test('un armado roto (pieza que no existe) se arregla con las de fábrica', () => {
    assert.deepEqual(cleanBuild({ legs: 'oruga', core: 'nada' }), { ...DEFAULT_BUILD, legs: 'oruga' });
    assert.deepEqual(cleanBuild(null), DEFAULT_BUILD);
});

console.log(`\n${n}/${n} pruebas`);
