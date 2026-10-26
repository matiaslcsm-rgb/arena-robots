// El garaje: cambiar cada pieza con ◀ ▶ y ver cómo cambian los números del robot.
import { SLOTS, SLOT_NAMES, catalog, computeStats } from './parts.js';

const panel = document.getElementById('garage');
let build, onChange, onClose;

export function openGarage(b, change, close) {
    build = { ...b }; onChange = change; onClose = close;
    panel.hidden = false; render();
}
export function closeGarage() { panel.hidden = true; }

function cycle(slot, d) {
    const keys = Object.keys(catalog(slot)), i = keys.indexOf(build[slot]);
    build = { ...build, [slot]: keys[(i + d + keys.length) % keys.length] };
    onChange(build); render();
}
function render() {
    const st = computeStats(build);
    panel.innerHTML = `<h2>GARAJE</h2>` +
        SLOTS.map(s => `<div class="row"><span class="slot">${SLOT_NAMES[s]}</span>
            <button data-s="${s}" data-d="-1" aria-label="anterior">◀</button>
            <span class="part">${catalog(s)[build[s]].name}</span>
            <button data-s="${s}" data-d="1" aria-label="siguiente">▶</button></div>`).join('') +
        `<table>
            <tr><td>Peso</td><td>${st.weight}</td></tr>
            <tr><td>Carga</td><td class="${st.over ? 'over' : ''}">${st.load} / ${st.maxLoad}${st.over ? ' ¡SOBRECARGA!' : ''}</td></tr>
            <tr><td>Blindaje</td><td>${st.armor}</td></tr>
            <tr><td>Velocidad</td><td>${(st.speed * 3.6).toFixed(0)} km/h</td></tr>
            <tr><td>Salto</td><td>${st.jump ? '×' + st.jump : 'no salta'}</td></tr>
            <tr><td>Energía</td><td>${st.energy} (+${st.regen}/s)</td></tr>
        </table>
        <button class="done">Listo (G)</button>`;
    panel.querySelectorAll('button[data-s]').forEach(b => b.onclick = () => cycle(b.dataset.s, +b.dataset.d));
    panel.querySelector('.done').onclick = () => onClose();
}
