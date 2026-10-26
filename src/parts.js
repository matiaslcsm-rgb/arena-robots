// El catálogo de piezas. Solo datos y cuentas (sin three.js), así se prueba con node.
//
// Cada pieza tiene sus números y su forma: una lista de cajas y cilindros (en metros) que robot.js convierte en 3D.
//   box: { t: 'box', s: [ancho, alto, fondo], p: [x, y, z], r?: [rx, ry, rz], m: material, g?: grupo que se anima }
//   cyl: { t: 'cyl', rad, h, seg?, p, r?, m, g? }
// Materiales: gris, oliva, hueso, nar (naranja), ama (amarillo), carbon, metal, peligro (franjas), oruga, lente (brilla).
// Los brazos se dibujan para el lado derecho (x hacia afuera); el izquierdo es su espejo.

export const SLOTS = ['legs', 'core', 'head', 'armL', 'armR'];
export const SLOT_NAMES = { legs: 'Piernas', core: 'Núcleo', head: 'Cabeza', armL: 'Brazo izq.', armR: 'Brazo der.' };
const ARM_SLOTS = ['armL', 'armR'];

export const PARTS = {
    legs: {
        bipedo: {
            name: 'Bípedo B-12', weight: 28, armor: 300, maxLoad: 70, speed: 9, jump: 1, hip: 2.2,
            pivots: { legL: [-0.55, 2.2, 0], legR: [0.55, 2.2, 0] },
            shapes: [
                { t: 'box', s: [1.7, 0.5, 1.1], p: [0, 2.2, 0], m: 'carbon' },
                { t: 'box', s: [1.8, 0.12, 1.15], p: [0, 2.0, 0], m: 'peligro' },
                ...[-1, 1].flatMap(k => {
                    const x = 0.55 * k, g = k < 0 ? 'legL' : 'legR';
                    return [
                        { t: 'cyl', rad: 0.28, h: 0.5, p: [x, 2.2, 0], r: [0, 0, Math.PI / 2], m: 'nar', g },
                        { t: 'box', s: [0.5, 1.1, 0.6], p: [x, 1.6, 0], m: 'oliva', g },
                        { t: 'cyl', rad: 0.08, h: 0.9, p: [x, 1.2, -0.38], m: 'metal', g },   // el pistón de atrás
                        { t: 'cyl', rad: 0.22, h: 0.55, p: [x, 1.05, 0], r: [0, 0, Math.PI / 2], m: 'carbon', g },
                        { t: 'box', s: [0.42, 0.95, 0.5], p: [x, 0.55, 0.08], m: 'gris', g },
                        { t: 'box', s: [0.65, 0.22, 1.0], p: [x, 0.11, 0.15], m: 'carbon', g }
                    ];
                })
            ]
        },
        oruga: {
            name: 'Oruga T-40', weight: 46, armor: 620, maxLoad: 115, speed: 6, jump: 0, hip: 1.55,
            pivots: { tracks: [0, 0, 0] },
            shapes: [
                ...[-1, 1].flatMap(k => [
                    { t: 'box', s: [0.85, 0.95, 2.8], p: [0.95 * k, 0.48, 0], m: 'oruga', g: 'tracks' },
                    { t: 'box', s: [0.9, 0.3, 2.3], p: [0.95 * k, 1.05, 0], m: 'oliva' },
                    { t: 'box', s: [0.92, 0.1, 2.3], p: [0.95 * k, 0.88, 0], m: 'peligro' }
                ]),
                { t: 'box', s: [1.3, 0.6, 1.8], p: [0, 1.2, 0], m: 'carbon' },
                { t: 'box', s: [1.0, 0.2, 1.0], p: [0, 1.55, 0], m: 'gris' }
            ]
        },
        ruedas: {
            name: 'Ruedas R-3', weight: 22, armor: 200, maxLoad: 55, speed: 13, jump: 0.5, hip: 1.8,
            pivots: { wheels: [0, 0, 0] },
            shapes: [
                { t: 'box', s: [1.5, 0.45, 1.6], p: [0, 1.5, 0], m: 'gris' },
                { t: 'box', s: [1.55, 0.1, 1.65], p: [0, 1.3, 0], m: 'peligro' },
                ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].flatMap(([kx, kz]) => [
                    { t: 'box', s: [0.18, 1.1, 0.18], p: [0.75 * kx, 0.95, 0.65 * kz], r: [0, 0, 0.35 * kx], m: 'carbon' },
                    { t: 'cyl', rad: 0.45, h: 0.35, seg: 8, p: [1.0 * kx, 0.45, 0.65 * kz], r: [0, 0, Math.PI / 2], m: 'carbon', g: 'wheels' },
                    { t: 'cyl', rad: 0.15, h: 0.38, p: [1.0 * kx, 0.45, 0.65 * kz], r: [0, 0, Math.PI / 2], m: 'nar', g: 'wheels' }
                ])
            ]
        }
    },
    core: {
        estandar: {
            name: 'Núcleo C-20', weight: 30, armor: 500, energy: 1000, regen: 120,
            neck: [0, 1.45, 0], armL: [-1.05, 1.1, 0], armR: [1.05, 1.1, 0],
            shapes: [
                { t: 'box', s: [1.8, 1.4, 1.3], p: [0, 0.75, 0], m: 'oliva' },
                { t: 'box', s: [1.1, 0.55, 0.1], p: [0, 0.95, 0.68], m: 'hueso' },
                { t: 'box', s: [1.82, 0.16, 1.32], p: [0, 0.15, 0], m: 'peligro' },
                { t: 'box', s: [1.2, 1.0, 0.55], p: [0, 0.8, -0.9], m: 'carbon' },          // la mochila
                { t: 'cyl', rad: 0.12, h: 1.0, p: [0.45, 0.8, -1.2], m: 'ama' },            // cables de la mochila
                { t: 'cyl', rad: 0.12, h: 1.0, p: [-0.45, 0.8, -1.2], m: 'ama' }
            ]
        },
        pesado: {
            name: 'Núcleo H-55', weight: 48, armor: 920, energy: 900, regen: 100,
            neck: [0, 1.75, 0], armL: [-1.3, 1.35, 0], armR: [1.3, 1.35, 0],
            shapes: [
                { t: 'box', s: [2.3, 1.7, 1.6], p: [0, 0.9, 0], m: 'gris' },
                { t: 'box', s: [2.4, 0.5, 1.7], p: [0, 1.5, 0], m: 'oliva' },
                { t: 'box', s: [1.4, 0.7, 0.12], p: [0, 0.8, 0.84], m: 'carbon' },
                { t: 'box', s: [2.32, 0.18, 1.62], p: [0, 0.18, 0], m: 'peligro' },
                { t: 'box', s: [1.6, 1.2, 0.6], p: [0, 1.0, -1.1], m: 'carbon' }
            ]
        },
        liviano: {
            name: 'Núcleo L-08', weight: 18, armor: 280, energy: 1250, regen: 165,
            neck: [0, 1.2, 0], armL: [-0.85, 0.9, 0], armR: [0.85, 0.9, 0],
            shapes: [
                { t: 'box', s: [1.4, 1.1, 1.0], p: [0, 0.6, 0], m: 'hueso' },
                { t: 'box', s: [0.9, 0.3, 0.08], p: [0, 0.7, 0.52], m: 'nar' },
                { t: 'box', s: [1.42, 0.12, 1.02], p: [0, 0.1, 0], m: 'peligro' },
                { t: 'cyl', rad: 0.3, h: 0.9, p: [0, 0.7, -0.65], m: 'carbon' }             // la batería
            ]
        }
    },
    head: {
        sensor: {
            name: 'Cabeza S-1', weight: 4, armor: 80,
            shapes: [
                { t: 'box', s: [0.75, 0.5, 0.75], p: [0, 0.3, 0], m: 'gris' },
                { t: 'box', s: [0.5, 0.14, 0.06], p: [0, 0.35, 0.39], m: 'lente' },
                { t: 'box', s: [0.05, 0.6, 0.05], p: [0.28, 0.8, -0.2], m: 'carbon' },
                { t: 'box', s: [0.1, 0.1, 0.1], p: [0.28, 1.1, -0.2], m: 'nar' }
            ]
        },
        camara: {
            name: 'Cabeza TV-4', weight: 6, armor: 100,
            shapes: [
                { t: 'box', s: [0.6, 0.55, 0.95], p: [0, 0.32, -0.05], m: 'hueso' },
                { t: 'cyl', rad: 0.2, h: 0.45, p: [0, 0.32, 0.6], r: [Math.PI / 2, 0, 0], m: 'carbon' },
                { t: 'cyl', rad: 0.16, h: 0.04, p: [0, 0.32, 0.84], r: [Math.PI / 2, 0, 0], m: 'lente' },
                { t: 'box', s: [0.08, 0.15, 0.7], p: [0, 0.68, -0.05], m: 'carbon' },        // la manija
                { t: 'box', s: [0.1, 0.1, 0.1], p: [-0.25, 0.5, 0.42], m: 'nar' }            // luz de "grabando"
            ]
        },
        domo: {
            name: 'Cabeza D-9', weight: 7, armor: 160,
            shapes: [
                { t: 'cyl', rad: 0.5, h: 0.55, seg: 6, p: [0, 0.3, 0], m: 'oliva' },
                { t: 'cyl', rad: 0.51, h: 0.12, seg: 6, p: [0, 0.38, 0], m: 'lente' },
                { t: 'cyl', rad: 0.35, h: 0.15, seg: 6, p: [0, 0.65, 0], m: 'carbon' }
            ]
        }
    },
    arm: {
        canon: {
            name: 'Cañón K-90', weight: 14, armor: 120, kind: 'cañón',
            shapes: [
                { t: 'box', s: [0.6, 0.65, 0.7], p: [0.3, 0, 0], m: 'oliva' },
                { t: 'box', s: [0.45, 0.45, 1.0], p: [0.45, -0.35, 0.4], m: 'gris' },
                { t: 'cyl', rad: 0.17, h: 1.8, p: [0.45, -0.35, 1.5], r: [Math.PI / 2, 0, 0], m: 'carbon' },
                { t: 'box', s: [0.42, 0.42, 0.3], p: [0.45, -0.35, 2.35], m: 'metal' },
                { t: 'box', s: [0.47, 0.1, 0.5], p: [0.45, -0.1, 0.4], m: 'peligro' }
            ]
        },
        ametralladora: {
            name: 'Ametralladora M-6', weight: 10, armor: 100, kind: 'ametralladora',
            shapes: [
                { t: 'box', s: [0.55, 0.55, 0.6], p: [0.28, 0, 0], m: 'gris' },
                { t: 'box', s: [0.4, 0.4, 1.1], p: [0.45, -0.3, 0.55], m: 'carbon' },
                ...[-0.1, 0, 0.1].map(dx => ({ t: 'cyl', rad: 0.05, h: 0.8, p: [0.45 + dx, -0.25 - Math.abs(dx), 1.45], r: [Math.PI / 2, 0, 0], m: 'metal' })),
                { t: 'cyl', rad: 0.28, h: 0.25, p: [0.45, -0.62, 0.45], m: 'ama' }           // el tambor de balas
            ]
        },
        pinza: {
            name: 'Pinza P-2', weight: 9, armor: 140, kind: 'cuerpo a cuerpo',
            shapes: [
                { t: 'box', s: [0.55, 0.55, 0.55], p: [0.28, 0, 0], m: 'oliva' },
                { t: 'box', s: [0.35, 0.9, 0.35], p: [0.45, -0.6, 0.1], m: 'carbon' },
                { t: 'cyl', rad: 0.08, h: 0.8, p: [0.62, -0.55, 0.1], m: 'metal' },
                { t: 'box', s: [0.4, 0.35, 0.6], p: [0.45, -1.15, 0.3], m: 'gris' },
                { t: 'box', s: [0.1, 0.12, 0.7], p: [0.32, -1.25, 0.85], m: 'nar' },
                { t: 'box', s: [0.1, 0.12, 0.7], p: [0.58, -1.25, 0.85], m: 'nar' }
            ]
        }
    }
};

export const DEFAULT_BUILD = { legs: 'bipedo', core: 'estandar', head: 'sensor', armL: 'ametralladora', armR: 'canon' };

// Las opciones de una ranura (los dos brazos comparten catálogo)
export const catalog = slot => PARTS[ARM_SLOTS.includes(slot) ? 'arm' : slot];
export const partOf = (build, slot) => catalog(slot)[build[slot]];

// Arreglo de un armado que vino de afuera (guardado viejo, pieza que ya no existe): lo que falta, de fábrica
export function cleanBuild(b) {
    const out = {};
    SLOTS.forEach(s => { out[s] = b && catalog(s)[b[s]] ? b[s] : DEFAULT_BUILD[s]; });
    return out;
}

// Los números del robot armado. La carga es todo lo que van cargando las piernas; pasada de su límite, el robot anda
// más lento (nunca menos de un tercio).
export function computeStats(build) {
    const parts = SLOTS.map(s => partOf(build, s)), legs = partOf(build, 'legs'), core = partOf(build, 'core');
    const weight = parts.reduce((t, p) => t + p.weight, 0), load = weight - legs.weight;
    const over = load > legs.maxLoad;
    return {
        weight, load, maxLoad: legs.maxLoad, over,
        armor: parts.reduce((t, p) => t + p.armor, 0),
        speed: legs.speed * (over ? Math.max(1 / 3, legs.maxLoad / load) : 1),
        jump: legs.jump, energy: core.energy, regen: core.regen
    };
}
