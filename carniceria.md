Eres un desarrollador senior full-stack experto en React, PWA y Firebase. Tu tarea es construir desde cero una Progressive Web App (PWA) para gestión de ventas de un comercio minorista. La app será usada principalmente en computadora de escritorio por el cajero, en simultáneo con su sistema de facturación, por lo que debe ser extremadamente ágil y clara.

---

## STACK TECNOLÓGICO

- Frontend: React + Vite
- Estilos: Tailwind CSS v3 con configuración extendida de keyframes y animaciones personalizadas
- Animaciones: exclusivamente con Tailwind CSS + CSS puro. Sin Framer Motion, sin GSAP, sin ninguna librería externa de animación
- Base de datos: Firebase Firestore (SDK modular v9+)
- PWA: vite-plugin-pwa con manifest y service worker
- Sin autenticación por ahora

---

## SISTEMA DE DISEÑO

### Paleta de colores

Tema base blanco y gris. Los únicos colores de acento son verde para verdulería y rojo para carnicería.

Fondo general:        #ffffff
Superficie secundaria: #f7f7f7
Superficie terciaria:  #f0f0f0
Bordes suaves:        #e4e4e4
Bordes énfasis:       #d0d0d0
Texto principal:      #111111
Texto secundario:     #666666
Texto terciario:      #999999
Verdulería accent:    #2d6a4f
Verdulería bg suave:  #eaf4ee
Verdulería borde:     #b8dbc7
Carnicería accent:    #b91c1c
Carnicería bg suave:  #fdeaea
Carnicería borde:     #f0b8b8

### Layout general — desktop first

La app usa un layout de tres zonas fijas:

1. Sidebar izquierdo (196px fijo) — fondo blanco, borde derecho gris
2. Topbar superior — fondo sólido del color del módulo activo (verde o rojo), texto blanco
3. Cuerpo principal — dividido horizontalmente:
   - Panel izquierdo (380px fijo): formulario de carga, fondo blanco, borde derecho gris
   - Panel derecho (flexible): métricas y listado de ventas, fondo #f7f7f7

El sidebar nunca cambia de color. El topbar es el único elemento que cambia entre verde (#2d6a4f) y rojo (#b91c1c) según el módulo.

### Sidebar

- Logo/nombre de la app arriba
- Secciones separadas: "Verdulería" y "Carnicería" con label de sección en gris muy claro
- Cada ítem de navegación tiene un punto de color (verde o gris) y texto
- Ítem activo en verdulería: fondo #eaf4ee, texto #1d5236, font-weight 500
- Ítem activo en carnicería: fondo #fdeaea, texto #921515, font-weight 500
- Fecha y hora actuales al fondo del sidebar en un chip gris

### Topbar

- Altura 52px
- Ícono del módulo (emoji en caja redondeada con fondo blanco semitransparente)
- Título de la pantalla actual + subtítulo descriptivo, ambos en blanco
- Tabs de navegación del módulo en el lado derecho (fondo semitransparente oscuro, tab activo con fondo blanco semitransparente)
- El toast de confirmación aparece también en el topbar, lado derecho

### Tipografía y espaciado

- Font mínimo en datos: 13px
- Inputs del formulario principal: 13-14px
- Input de importe en carnicería: 30-32px
- Labels de sección: 10-11px, uppercase, letter-spacing, color #aaa
- Totales en panel derecho: 20px, font-weight 500
- Espaciado interno consistente: padding de paneles 18px, gap entre elementos 10-12px
- Border-radius general: 7-8px para inputs y botones, 10-12px para tarjetas y paneles

---

## SISTEMA DE ANIMACIONES

Todos los keyframes se deben definir en `tailwind.config.js` antes de escribir cualquier componente.

### tailwind.config.js — keyframes completos

```js
theme: {
  extend: {
    keyframes: {
      ripple: {
        '0%':   { transform: 'scale(0)', opacity: '0.4' },
        '100%': { transform: 'scale(3.5)', opacity: '0' },
      },
      fadeSlideIn: {
        '0%':   { opacity: '0', transform: 'translateY(8px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      fadeSlideOut: {
        '0%':   { opacity: '1', transform: 'translateY(0)' },
        '100%': { opacity: '0', transform: 'translateY(-6px)' },
      },
      shimmer: {
        '0%':   { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      shake: {
        '0%, 100%': { transform: 'translateX(0)' },
        '25%':      { transform: 'translateX(-5px)' },
        '75%':      { transform: 'translateX(5px)' },
      },
      toastIn: {
        '0%':   { opacity: '0', transform: 'translateY(5px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      fadeOut: {
        '0%':   { opacity: '1' },
        '100%': { opacity: '0' },
      },
      pulseSuccess: {
        '0%, 100%': { boxShadow: '0 0 0 0 rgba(45,106,79,0)' },
        '50%':      { boxShadow: '0 0 0 4px rgba(45,106,79,0.18)' },
      },
    },
    animation: {
      ripple:       'ripple 0.55s linear',
      fadeSlideIn:  'fadeSlideIn 0.22s ease-out',
      fadeSlideOut: 'fadeSlideOut 0.18s ease-in',
      shimmer:      'shimmer 1.4s infinite linear',
      shake:        'shake 0.28s ease-in-out',
      toastIn:      'toastIn 0.2s ease-out',
      fadeOut:      'fadeOut 0.15s ease-in',
      pulseSuccess: 'pulseSuccess 0.5s ease-in-out',
    },
  },
}
```

### Componente RippleButton

Componente `<RippleButton>` reutilizable en `src/components/RippleButton.jsx`:
- Al hacer clic genera un `<span>` posicionado en el punto exacto del click
- El span se anima con `animate-ripple` y se elimina automáticamente del DOM al terminar
- Clases base: `relative overflow-hidden`
- Props: `children`, `onClick`, `className`, `disabled`, `type`
- Usar en todos los botones primarios de acción de la app

### Transiciones de pantalla

Hook `usePageTransition` en `src/hooks/usePageTransition.js`:
- Maneja estado `entering` / `visible` / `leaving`
- Al montar una vista: aplica `animate-fadeSlideIn`
- Al desmontar: aplica `animate-fadeSlideOut` antes de remover del DOM
- Duración máxima de transición: 220ms para no afectar la percepción de velocidad

### Skeleton loaders

Componente `<Skeleton>` en `src/components/Skeleton.jsx`:
- Animación shimmer con gradiente: `bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer`
- Props: `className` para tamaño, `rounded` para border-radius
- Variantes estáticas: `Skeleton.Text`, `Skeleton.Row`, `Skeleton.Card`
- Usar en: listado de artículos mientras carga (5 filas), reportes mientras consulta Firestore (totales + 3 filas), cualquier dato asíncrono

### Toasts

Hook `useToast` + componente `<ToastContainer>` global montado en `App.jsx`:
- Toast de éxito: fondo del color del módulo activo (verde o rojo), texto blanco
- Aparece en el topbar lado derecho con `animate-toastIn`
- Sale con `animate-fadeOut` tras 2.2 segundos
- El campo de importe en carnicería hace `animate-pulseSuccess` al confirmar

### Feedback en inputs

- Focus: `ring-2 ring-offset-0` con el color del módulo (`ring-[#2d6a4f]` o `ring-[#b91c1c]`) + `transition-all duration-150`
- Error de validación: borde rojo + `animate-shake`
- Input de importe carnicería al confirmar: `animate-pulseSuccess` antes de limpiarse

### Ítems del carrito

- Al agregar: `animate-fadeSlideIn`
- Al eliminar: `animate-fadeOut` → esperar 150ms → remover del DOM
- Usar `key` estable por ítem para que React no confunda las animaciones

---

## MÓDULO VERDULERÍA

### Pantalla: Nueva venta (pantalla por defecto del módulo)

Panel izquierdo — formulario:
1. Input de búsqueda de artículo con autocompletar (busca por nombre y por código)
2. Al seleccionar artículo: foco automático salta al campo cantidad
3. Inputs de cantidad y precio unitario (precio se autocompleta del artículo, editable)
4. Botones "Cancelar" (gris) y "+ Agregar al carrito" (verde, RippleButton)
5. Separador horizontal
6. Lista del carrito con ítems animados
7. Barra inferior con total en grande y botón "Confirmar venta" (RippleButton verde)
8. Enter en cualquier campo activa "Agregar al carrito"; Enter en carrito vacío activa "Confirmar venta"

Panel derecho — datos en tiempo real:
- 3 stat cards: "Ventas hoy" (importe en verde), "Transacciones" (número), "Ticket promedio"
- Panel de ventas recientes con tabs Día / Mes / Año
- Filas de ventas expandibles que muestran el detalle de ítems
- Skeleton loader mientras carga Firestore

Guardar en colección `verduleria_ventas`:
```json
{
  "fecha": "Timestamp",
  "items": [
    { "articuloId": "", "nombre": "", "precio": 0, "cantidad": 0, "subtotal": 0 }
  ],
  "total": 0
}
```

### Pantalla: Artículos (ABM)

Topbar: input de búsqueda + botón "+ Nuevo artículo" (RippleButton verde)

Tabla completa con columnas: Nombre, Código, Precio, Fecha de ingreso, Acciones
- Botón "Editar": abre modal con animación scale+fade (0.95→1 + opacity 0→1 en 180ms)
- Botón "Eliminar": botón con borde rojo suave, pide confirmación antes de borrar
- Filas con hover sutil (#fafafa)
- Skeleton de filas mientras carga

Campos del artículo: nombre (texto, requerido), código (texto, único, requerido), precio (decimal, requerido), fecha de ingreso (date, default hoy)

Guardar en colección `verduleria_articulos`

### Pantalla: Reportes

Tabs de período: Día / Mes / Año con selector de fecha según el período activo

Panel superior: stat cards (Total del período en verde, Cantidad de ventas)

Panel inferior: listado de ventas ordenado por fecha descendente
- Cada fila muestra hora, resumen de ítems y total
- Expandible para ver desglose: nombre artículo, cantidad, precio unitario, subtotal
- Skeleton mientras carga

Datos desde `verduleria_ventas`

---

## MÓDULO CARNICERÍA

### Pantalla: Nueva venta (pantalla por defecto del módulo)

Panel izquierdo — formulario simplificado:
- Label "Importe de la venta" en gris
- Signo "$" grande a la izquierda del input
- Input numérico con font-size 30-32px, font-weight 500, muy prominente
- Botón "Registrar venta — $X.XXX" a ancho completo (RippleButton rojo), precio se actualiza en tiempo real
- Hint "Presioná Enter para confirmar" en gris claro
- Separador
- Lista de últimas ventas del día (hora + "Carne" + importe en rojo)

Panel derecho — idéntico al de verdulería pero en rojo:
- Stat cards con "Ventas hoy" en rojo
- Panel de ventas recientes con tabs Día / Mes / Año

Guardar en colección `carniceria_ventas`:
```json
{
  "fecha": "Timestamp",
  "importe": 0
}
```

### Pantalla: Reportes

Misma estructura que reportes de verdulería pero con acentos rojos y datos de `carniceria_ventas`. Sin desglose de ítems, solo fecha, hora e importe.

---

## FIREBASE

- SDK modular v9+ — nunca usar la API de compatibilidad
- Archivo `src/firebase/config.js` con variables de entorno via `.env`:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

- `src/firebase/verduleria.js` — funciones CRUD para artículos y ventas de verdulería
- `src/firebase/carniceria.js` — funciones CRUD para ventas de carnicería
- Reglas de Firestore permisivas para desarrollo:

rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /{document=**} {
allow read, write: if true;
}
}
}

- Todas las queries de reportes usan `where('fecha', '>=', startOfPeriod)` + `where('fecha', '<=', endOfPeriod)` con índices compuestos si son necesarios

---

## PWA

- `vite-plugin-pwa` con estrategia `generateSW`
- Manifest:
  - name: "Ventas Comercio"
  - short_name: "Ventas"
  - theme_color: "#2d6a4f"
  - background_color: "#ffffff"
  - display: "standalone"
  - Íconos en 192x192 y 512x512
- Service worker con precaching de assets estáticos
- Funcionar offline para carga de ventas con sincronización posterior

---

## FORMATO DE DATOS

- Moneda argentina: separador de miles con punto, decimales con coma — `$1.275,00`
- Fechas: "Lun 21 de abril" en headers, "21/04/2026" en tablas
- Horas: "09:38 hs" en listados
- Los importes en el botón de carnicería se actualizan en tiempo real mientras el cajero tipea

---

## ESTRUCTURA DE ARCHIVOS

src/
components/
RippleButton.jsx
Skeleton.jsx
Modal.jsx
ToastContainer.jsx
hooks/
useToast.js
usePageTransition.js
useVentas.js
useArticulos.js
modules/
verduleria/
VentaScreen.jsx
ArticulosScreen.jsx
ReportesScreen.jsx
carniceria/
VentaScreen.jsx
ReportesScreen.jsx
firebase/
config.js
verduleria.js
carniceria.js
App.jsx
main.jsx
tailwind.config.js   ← configurar PRIMERO con todos los keyframes
.env.example

---

## ORDEN DE DESARROLLO

1. Setup: Vite + React + Tailwind v3 + Firebase + vite-plugin-pwa
2. Configurar `tailwind.config.js` con todos los keyframes antes de tocar cualquier componente
3. Crear componentes base: `RippleButton`, `Skeleton`, `Modal`, `ToastContainer`
4. Crear hooks base: `useToast`, `usePageTransition`
5. Configurar Firebase + archivo config con placeholders de .env
6. Layout principal: sidebar + topbar dinámico + routing entre módulos
7. Módulo verdulería completo: Venta → ABM → Reportes
8. Módulo carnicería completo: Venta → Reportes
9. PWA: manifest + service worker + íconos
10. README con instrucciones de setup, configuración de Firebase y despliegue

---

## CRITERIO DE DECISIÓN

Ante cualquier decisión de diseño o implementación no especificada, elegir siempre la opción más simple y rápida para un cajero que opera bajo presión. Las animaciones deben sumar percepción de calidad sin agregar latencia real. Si una animación hace la app sentirse más lenta, eliminarla. La velocidad de uso tiene prioridad absoluta sobre la estética.