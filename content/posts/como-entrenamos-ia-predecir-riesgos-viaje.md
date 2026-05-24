---
tags: [ia, machine learning, prediccion riesgos, viaje seguro, tecnologia, osint, innovacion]
title: "Cómo entrenamos una IA para predecir riesgos de viaje en 136 países"
description: "Te explicamos el proceso real detrás de nuestro modelo de Machine Learning que analiza 25 variables para predecir riesgos de viaje. Datos, features, validación y cómo puedes probarlo."
slug: "como-entrenamos-ia-predecir-riesgos-viaje"
date: "2026-05-24"
author: "M. Castillo"
category: "Tecnología"
readTime: "8 min"
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800
keywords: "machine learning viajes, ia prediccion riesgos, random forest riesgo pais, ml prediccion viajes, inteligencia artificial viajes, modelo riesgo viajero, analisis predictivo viajes"
excerpt: "Cómo funciona el modelo de Machine Learning que entrena cada noche para predecir riesgos de viaje en 136 países. 25 variables, validación temporal y prueba gratuita."
---

# Cómo entrenamos una IA para predecir riesgos de viaje en 136 países

Cuando viajas, el riesgo no es estático. Un país puede pasar de "seguro" a "precaución" en cuestión de días por una protesta, un desastre natural o un cambio en la percepción global. Hasta ahora, los viajeros dependían de fuentes oficiales que se actualizan cada semanas o meses.

En **Viaje con Inteligencia** estamos construyendo algo diferente: un modelo de Machine Learning que entrena cada noche para anticipar cambios de riesgo antes de que ocurran.

Este post es una ventana abierta al proceso. Sin humo, sin promesas irreales. Te contamos qué datos usamos, cómo los procesamos, qué funciona, qué estamos validando y cómo puedes probarlo tú mismo.

---

## El problema: el riesgo de viaje no es estático

Las fuentes tradicionales de evaluación de riesgo tienen limitaciones conocidas:

| Fuente | Actualización | Cobertura |
|--------|--------------|-----------|
| MAEC (España) | Semanal/quincenal | ~120 países |
| US State Dept | Semanal | ~190 países |
| Blogs/foros | Variable | Sesgo positivo |
| Noticias | Tiempo real | Sin estructura |

Nuestro objetivo no es reemplazar estas fuentes, sino **anticipar tendencias** cruzando datos en tiempo real con un modelo predictivo.

---

## Los datos: 25 variables por país

Cada noche, nuestro sistema recolecta y normaliza datos de múltiples fuentes para cada país:

### 1. Datos de riesgo oficial
- Nivel de riesgo MAEC (1-5)
- Cambios históricos en la última semana/mes
- Temporalidad del cambio (¿subió o bajó?)

### 2. Datos OSINT
- Alertas activas de GDACS (desastres naturales)
- Señales de Reddit clasificadas por Groq (IA)
- Artículos RSS procesados (AP, BBC, Reuters)
- Incidentes detectados por tipo y severidad

### 3. Datos de sentimiento GDELT
- **avgTone7d**: tono medio de noticias del país (7 días)
- **avgTone30d**: tono medio (30 días)
- **toneTrend7d**: tendencia del tono (¿mejora o empeora?)
- **negativeRatio7d**: proporción de cobertura negativa
- **toneVolatility7d**: volatilidad del sentimiento

### 4. Datos contextuales
- Estacionalidad turística
- Índices de paz global (GPI), terrorismo (GTI), desarrollo (HDI)
- TCI (Travel Cost Index)

En total: **25 features numéricas por país y día**.

---

## El modelo: Random Forest con 4 variantes

Usamos **Random Forest Regressor** con 4 modelos independientes, uno para cada ventana de predicción:

| Modelo | Predice | Horizonte |
|--------|---------|-----------|
| RF_riskScore | Score de riesgo (0-100) | 7 días |
| RF_probUp7d | Probabilidad de que suba | 7 días |
| RF_probDown7d | Probabilidad de que baje | 7 días |
| RF_severity | Severidad esperada | 7 días |

Cada modelo entrena con **136 países** y utiliza los datos de los últimos 30 días como ventana de entrenamiento.

---

## El proceso: entrenamiento diario

Cada madrugada, el sistema ejecuta este pipeline:

```
1. Recoger datos MAEC → historial de cambios
2. Procesar señales OSINT → clasificar con Groq
3. Calcular features de sentimiento GDELT
4. Normalizar 25 variables por país
5. Entrenar 4 modelos Random Forest
6. Comparar predicciones vs valores reales
7. Generar métricas de desviación
8. Publicar resultados en API
```

Tiempo total: ~157 segundos para 136 países.

---

## Qué estamos validando ahora mismo

El modelo está en **fase de validación temporal**. Esto significa:

- Llevamos ~11 días recogiendo datos históricos estructurados
- Necesitamos ~25 días para hacer validación cruzada temporal (entrenar con datos de día 1-20, predecir días 21-25, comparar aciertos)
- Las features de sentimiento (avgTone7d, etc.) necesitan al menos 7 días de datos estables — ya los tienen

Las métricas actuales son preliminares:

| Métrica | Valor actual | Objetivo |
|---------|-------------|----------|
| R² riskScore | 0.56 | >0.90 |
| MAE riskScore | 0.56 | <0.30 |
| Desviación máxima | 5.89 | <3.0 |
| Países con desviación | 2 de 136 | <1% |

> **Nota importante**: estas métricas son sobre datos de entrenamiento, no predicción real. La validación temporal nos dirá si el modelo realmente generaliza o solo memoriza patrones pasados.

---

## ¿Por qué publicamos esto ahora?

Porque creemos en la **transparencia operativa**. No estamos vendiendo un producto terminado — estamos compartiendo un proceso en construcción. Preferimos explicar cómo funciona, qué datos usamos, qué estamos validando y cuáles son las limitaciones, a prometer una precisión que aún no podemos garantizar.

Además, queremos que lo pruebes y nos des feedback.

---

## Pruébalo tú mismo (Opción C)

El modelo ya está accesible gratuitamente en producción. Puedes consultar la predicción de riesgo para cualquier país desde:

### 1. En la web
Cada ficha de país muestra un **Score de Riesgo** con el análisis combinado de MAEC, US State Dept y la predicción ML.

### 2. API pública
Con API Key gratuita (100 consultas/mes, sin tarjeta):
```
GET /api/v1/risk/{country}
Headers: x-api-key: tu-api-key
```
Ejemplo: `curl -H "x-api-key: tu-api-key" https://www.viajeinteligencia.com/api/v1/risk/th` te devuelve el riesgo actual + predicción ML para Tailandia.

Consigue tu API Key gratis en [/api-endpoints](/api-endpoints).

### 3. WebSocket en dashboard
Los usuarios con cuenta pueden ver la evolución temporal del score en su Radar de Viaje, con proyección a 12 meses ajustada por estacionalidad.

---

## Limitaciones que debes conocer

- El modelo es **asistido por IA, no autónomo**. Siempre contrasta con fuentes oficiales.
- La validación temporal está en curso. Las métricas pueden cambiar significativamente.
- Países con pocos datos (menos señales OSINT) tienen predicciones menos fiables.
- No predecimos eventos impredecibles (golpes de estado, desastres repentinos).

---

## Lo que viene (si quieres seguir el proceso)

En las próximas semanas:

1. **Validación temporal CV** — cuando acumulemos ~25 días de datos, ejecutaremos validación cruzada y publicaremos los resultados.
2. **Features de sentimiento** — las 5 variables GDELT se estabilizarán con más datos históricos.
3. **Mejora de features** — estamos explorando incorporar datos de movilidad aérea (OpenSky) y frecuencias de palabras anómalas.
4. **Si el modelo funciona** — lo integraremos como factor en las alertas personalizadas del bot de Telegram.

Puedes seguir las actualizaciones de este proyecto en nuestra página de [Transparencia Operativa](/seguridad) y en el [Centro de Transparencia](/transparencia).

---

*M. Castillo — Fundador de Viaje con Inteligencia. Construyendo el radar de seguridad global para viajeros conscientes.*

*Si quieres aportar datos, sugerencias o reportar un comportamiento inesperado del modelo, escríbenos a info@viajeinteligencia.com. Este proyecto es independiente y el feedback real de viajeros es lo que más nos ayuda a mejorar.*
