# 📋 TIPOS DE APUESTA Y PARÁMETROS DE PREMIOS

> **Última actualización:** 2025-11-02
> **Fuente:** Configuración actual del sistema

Este documento lista todos los tipos de apuesta soportados y sus parámetros de premios.

---

## 1️⃣ DIRECTO

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 60 |
| Segundo Pago | 12 |
| Tercer Pago | 4 |
| Dobles | 36 |

---

## 2️⃣ PALÉ

| Parámetro | Valor Default |
|-----------|---------------|
| Todos en secundos | 1100 |
| Primer Pago | 1100 |
| Segundo Pago | 1100 |
| Tercer Pago | 1100 |
| Dobles | 100 |

---

## 3️⃣ TRIPLETA

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 10000 |
| Segundo Pago | 100 |
| Tercer Pago | *(vacío)* |

---

## 4️⃣ CASH3 STRAIGHT

| Parámetro | Valor Default |
|-----------|---------------|
| Todos en secundos | 600 |
| 3-Way | 100 |
| 6-Way | 100 |

---

## 5️⃣ CASH3 BOX

| Parámetro | Valor Default |
|-----------|---------------|
| 3-Way | 2 decimales |
| 6-Way | *(vacío)* |

---

## 6️⃣ PLAY4 STRAIGHT

| Parámetro | Valor Default |
|-----------|---------------|
| Todos en secundos | 5000 |
| *(sin nombre)* | 5000 |

---

## 7️⃣ PLAY4 BOX

| Parámetro | Valor Default |
|-----------|---------------|
| 24-Way, 4 caballos | 200 |
| 12-Way, 2 decimales | 200 |
| 6-Way, 2 decimales | 200 |
| 4-Way, 1 decimales | 200 |

---

## 8️⃣ SUPER PALÉ

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 2000 |

---

## 9️⃣ BOLITA 1

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 75 |

---

## 🔟 BOLITA 2

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 75 |

---

## 1️⃣1️⃣ SINGULACIÓN 1

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 8 |

---

## 1️⃣2️⃣ SINGULACIÓN 2

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 8 |

---

## 1️⃣3️⃣ SINGULACIÓN 3

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 9 |
| Dobles | 30000 |

---

## 1️⃣4️⃣ PICK5 STRAIGHT

| Parámetro | Valor Default |
|-----------|---------------|
| Todos en secundos | 50000 |
| 5-Way, 1 decimales | 10000 |
| 10-Way, 1 decimales | 5000 |
| 20-Way, 1 decimales | 2500 |
| 30-Way, 1 decimales | 1650 |
| 60-Way, 1 decimales | 830 |
| 120-Way, 0 cruces | 415 |

---

## 1️⃣5️⃣ PICK5 BOX

| Parámetro | Valor Default |
|-----------|---------------|
| 5-Way, 2 decimales | *(vacío)* |
| 10-Way, 1 decimales | *(vacío)* |
| 20-Way, 1 decimales | *(vacío)* |
| 30-Way, 1 decimales | *(vacío)* |
| 60-Way, 1 decimales | *(vacío)* |
| 120-Way, 0 cruces | *(vacío)* |

---

## 1️⃣6️⃣ PICK TWO

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 75 |
| Dobles | 75 |

---

## 1️⃣7️⃣ CASH3 FRONT STRAIGHT

| Parámetro | Valor Default |
|-----------|---------------|
| Todos en secundos | 600 |
| Triples | 600 |

---

## 1️⃣8️⃣ CASH3 FRONT BOX

| Parámetro | Valor Default |
|-----------|---------------|
| 3-Way, 2 decimales | 100 |
| 6-Way, 1 caballos | 100 |

---

## 1️⃣9️⃣ CASH4 BACK STRAIGHT

| Parámetro | Valor Default |
|-----------|---------------|
| Todos en secundos | 600 |

---

## 2️⃣0️⃣ CASH4 BACK BOX

| Parámetro | Valor Default |
|-----------|---------------|
| 3-Way, 2 decimales | 100 |
| 6-Way, 1 caballos | 100 |

---

## 2️⃣1️⃣ PICK TWO FRONT

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 75 |
| Dobles | 75 |

---

## 2️⃣2️⃣ PICK TWO BACK

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 75 |
| Dobles | 75 |

---

## 2️⃣3️⃣ PICK TWO MIDDLE

| Parámetro | Valor Default |
|-----------|---------------|
| Primer Pago | 75 |
| *(4 campos más sin nombre visible)* | - |

---

## 📊 Resumen

- **Total de tipos de apuesta:** 23
- **Tipos actualmente en BD:** 23
- **Total de parámetros:** ~70 campos de premios

## 🔗 Archivos relacionados

- **Converter:** `/src/utils/premioFieldConverter.js`
- **Service:** `/src/services/prizeFieldService.js`
- **Componente:** `/src/components/EditBanca.jsx`

## ⚠️ Notas importantes

1. Algunos campos tienen valores "vacío" - estos son opcionales
2. Los valores numéricos representan multiplicadores de pago
3. Algunos parámetros tienen descripciones específicas (ej: "2 decimales", "4 caballos")
4. Actualmente solo **30 de 168 campos** están mapeados en `premioFieldConverter.js`
