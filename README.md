# Arena de Robots

Un juego de batalla de robots armados por piezas, en 3D con estilo de PlayStation 1. Hecho desde cero (2026-10-26).
Por ahora: una arena vacía y tu robot, que se arma en el garaje.

## Cómo jugar
Los módulos de JavaScript no andan abriendo el archivo directo: hace falta un servidor local.

```bash
python -m http.server 8770
```

Después abrí http://localhost:8770 en el navegador.

- **W A S D** moverse · **mouse** mirar (clic para capturarlo) · **Espacio** saltar · **Shift** impulso (gasta energía)
- **G** el garaje: cambiar piernas, núcleo, cabeza y los dos brazos

## Cómo está hecho
- `src/parts.js`: el catálogo de piezas (números y forma) y las cuentas del robot armado. Sin gráficos: se prueba solo.
- `src/robot.js`: arma el robot en 3D con las piezas y lo anima.
- `src/ps1.js`: el look de PS1 (320x240 sin suavizar, vértices que tiemblan, texturas hechas en código).
- `src/main.js`: la arena, el manejo, la cámara y el HUD. `src/garage.js`: el garaje.
- Única librería: three.js 0.160 (desde el CDN).

### Sumar una pieza
Agregá una entrada en `PARTS` (`src/parts.js`) con sus números y su lista de formas (cajas y cilindros). Las piernas
dicen a qué altura va la cadera; los núcleos, dónde van el cuello y los hombros.

## Pruebas
```bash
node tests/parts.test.mjs
```
