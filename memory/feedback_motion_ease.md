---
name: Motion v12 ease typing
description: En Motion v12 (motion/react), el campo `ease` en Variants no acepta strings literales sin tipo. Usar array cubic-bezier o importar Variants.
type: feedback
---

En Motion v12+, el tipo `Easing` no infiere strings como `'easeOut'` correctamente en TypeScript.

**Why:** El tipo `Variants` de motion/react requiere que `ease` sea `Easing | Easing[]`, no `string`.

**How to apply:** Siempre:
1. Importar `type Variants` de `motion/react` y tipar los objetos de variantes explícitamente.
2. Usar cubic-bezier array (`[0.25, 0.1, 0.25, 1]`) en lugar de strings como `'easeOut'`.
