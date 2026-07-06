# Fuentes Oficiales: Animaciones GSAP + Particle Network Canvas 2D

**Fecha:** 2026-06-24  
**Status:** approved  
**Approach:** C — GSAP npm + Canvas 2D nativo (sin Three.js)

---

## Objetivo

Agregar animaciones de entrada, interaccion y un fondo decorativo de particulas al componente `FuentesOficiales` existente, sin alterar su funcionalidad actual (expand/collapse, institution counts, links externos).

El prototipo de referencia es `fuentes_oficiales_gsap_threejs.html` que usa Three.js + GSAP. Esta spec reemplaza Three.js por Canvas 2D nativo (el efecto es visualmente identico porque el prototipo no usa features 3D reales).

---

## Arquitectura de Componentes

```
components/
  FuentesOficiales.tsx          <- MODIFICAR (agregar refs, wrapper animacion, importar ParticleNetwork)
  ParticleNetwork.tsx           <- NUEVO (canvas 2D con particulas)

hooks/
  useIntersectionObserver.ts    <- NUEVO (hook reutilizable)
  useReducedMotion.ts           <- NUEVO (hook reutilizable)
```

### Estructura del render

```
<section id="fuentes" className="relative overflow-hidden">
  <ParticleNetwork className="absolute inset-0 z-0 opacity-35" />
  <div className="relative z-10">
    <!-- Contenido existente de FuentesOficiales (header, grid, disclaimer) -->
  </div>
</section>
```

---

## ParticleNetwork (Canvas 2D)

### Comportamiento

- Canvas `position: absolute`, cubre toda la seccion, `pointer-events: none`
- Particulas: puntos circulares color `#1D9E75`, opacidad 0.7
- Lineas: segmentos entre particulas cercanas (dist < threshold), opacidad 0.08
- Movimiento: cada particula se desplaza en X/Y a velocidad ~0.004 units/frame
- Rebote suave en bordes del canvas
- Responsive: ajusta tamano en `resize`

### Cantidad de particulas

| Condicion | Particulas |
|-----------|------------|
| Desktop (>= 768px), hardware normal | 120 |
| Mobile (< 768px) | 60 |
| `navigator.hardwareConcurrency < 4` | 60 |

### Performance

- `requestAnimationFrame` loop
- **Pausa** cuando la seccion sale del viewport (IntersectionObserver)
- **Resume** cuando vuelve a entrar
- `devicePixelRatio` capped a 2 (no renderiza a 3x)
- Cleanup: cancela rAF y libera canvas context en unmount

### Accesibilidad

- `aria-hidden="true"` en el canvas
- No afecta tab order ni lectores de pantalla

### Reduced Motion

- Si `prefers-reduced-motion: reduce`: NO se monta el canvas. Cero render.

### API

```tsx
interface ParticleNetworkProps {
  className?: string;
  particleCount?: number;  // override manual (default: auto-detected)
  color?: string;          // default: '#1D9E75'
}
```

---

## Animaciones GSAP

### Dependencia

- `gsap` (core only, ~100KB gzipped)
- **Dynamic import**: `const { gsap } = await import('gsap')` dentro del `useEffect`
- Cero bytes de GSAP se cargan hasta que la seccion entra en viewport

### Animaciones de entrada

Disparan una sola vez cuando la seccion se hace visible (IntersectionObserver, threshold 0.1).

| Elemento | From | To | Delay | Duracion | Ease |
|----------|------|----|-------|----------|------|
| Header (titulo + subtitulo + badges) | `opacity: 0, y: 30` | `opacity: 1, y: 0` | 0.2s | 0.9s | `power3.out` |
| Cards (grid) | `opacity: 0, y: 40, scale: 0.97` | `opacity: 1, y: 0, scale: 1` | 0.5s + stagger 0.08s | 0.6s | `power3.out` |
| Disclaimer | `opacity: 0, y: 20` | `opacity: 1, y: 0` | 1.4s | 0.6s | `power2.out` |

### Animaciones de interaccion

Siempre activas (no dependen de IntersectionObserver).

| Trigger | Animacion | Duracion | Ease |
|---------|-----------|----------|------|
| `mouseenter` en card | `y: -5, scale: 1.02` + border `#1D9E75` + shadow `0 4px 20px rgba(29,158,117,0.12)` | 0.25s | `power2.out` |
| `mouseleave` en card | `y: 0, scale: 1` + border original + sin shadow | 0.3s | `power2.inOut` |
| `click` en card | `scale: 0.97` yoyo repeat 1 | 0.1s | `power1.inOut` |

### Reduced Motion

- Si `prefers-reduced-motion: reduce`: no se ejecuta ninguna animacion GSAP
- Los elementos se renderizan directamente con `opacity: 1, transform: none`

---

## Integracion con FuentesOficiales existente

### Lo que NO cambia

- Logica de expand/collapse de cards
- Props: `institutionCounts`, `lastUpdatedAt`, `totalActiveOpportunities`
- Datos de instituciones (array hardcoded)
- Links externos, badges de conteo
- Responsive grid layout

### Lo que SI cambia

- Se agrega `<ParticleNetwork />` como primer child del section wrapper
- Se agregan `ref`s a: header container, cards grid container, disclaimer
- Se agrega `useEffect` que importa GSAP y configura animaciones de entrada
- Se agregan event handlers GSAP para hover/click en cards
- Los elementos animados inician con `opacity: 0` (via className) y se animan a `opacity: 1`
- Dark mode: el canvas ya usa color con opacity baja, funciona en ambos temas

---

## Dependencias

| Paquete | Version | Tipo | Motivo |
|---------|---------|------|--------|
| `gsap` | ^3.12 | production | Animaciones de entrada e interaccion |

**No se agrega:** Three.js, ScrollTrigger, ni ningun plugin GSAP adicional.

---

## Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `package.json` | Agregar `gsap` a dependencies |
| `components/ParticleNetwork.tsx` | CREAR |
| `hooks/useIntersectionObserver.ts` | CREAR |
| `hooks/useReducedMotion.ts` | CREAR |
| `components/FuentesOficiales.tsx` | MODIFICAR |

---

## Testing

- **Unit tests**: `useReducedMotion` y `useIntersectionObserver` con mocks de jsdom
- **Visual check**: confirmar particulas, stagger, hover en `npm run dev`
- **Performance**: Lighthouse mobile throttled — LCP debe mantenerse < 2.5s
- **Regression**: expand/collapse de cards sigue funcionando post-cambio
- **Accessibility**: verificar con screen reader que el canvas no introduce ruido

---

## Riesgos y Mitigaciones

| Riesgo | Mitigacion |
|--------|------------|
| GSAP license | Core es free para uso comercial (no Business Green) |
| Canvas 2D no soportado | No se monta, solo queda fondo solido |
| Jank en scroll | Particulas se pausan fuera de viewport |
| Bundle size +100KB | Dynamic import — solo se carga cuando es necesario |
| SSR hydration mismatch | `'use client'` + `typeof window` guard |
