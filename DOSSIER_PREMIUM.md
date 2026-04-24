# 📊 Fuentes de Datos OSINT - Dossier Premium por País

## Fuentes Actualmente Integradas en el Proyecto

| Fuente | Datos Obtenidos | URL/API | Estado |
|--------|----------------|---------|--------|
| **MAEC** | Nivel riesgo, recomendaciones, alertas seguridad | Scraping | ✅ Activo |
| **Open-Meteo** | Clima actual y forecast 7 días | API Gratuita | ✅ Activo |
| **GPI (IEP)** | Peace Index - 163 países | Static Data | ✅ Incluido |
| **GTI (IEP)** | Terrorism Index | Static Data | ✅ Incluido |
| **HDI (UNDP)** | Human Development Index - 45 países | Static Data | ✅ Incluido |
| **IPC (Macro)** | Inflación/Coste vida - 55 países | Static Data | ✅ Incluido |

---

## 🏛️ Fuentes Oficiales de Inteligencia Turística

### 1. ONU / UNWTO (Organización Mundial del Turismo)

**URL:** https://www.unwto.org/

**Datos disponibles:**
| Métrica | Descripción | Disponibilidad |
|---------|-------------|----------------|
| Llegadas turísticas | Millones de visitantes/año por país | ✅ Datos abiertos |
| Ingresos turismo | Billones USD generados | ✅ Datos abiertos |
| Empleo sector | % empleos turismo | ✅ Datos abiertos |
| PIB turismo | Contribución % al PIB | ✅ Datos abiertos |

**API:** https://api.unwto.org/ (requiere registro gratuito)

**Datos ejemplo España 2024:**
- Llegadas: 85 millones turistas
- Ingresos: $108 mil millones
- PIB turismo: 12.8%

---

### 2. Banco Mundial (World Bank)

**URL:** https://data.worldbank.org/

**Datos disponibles:**
| Indicador | Código API |
|-----------|------------|
| PIB per cápita | NY.GDP.PCAP.CD |
| Población | SP.POP.TOTL |
| Turistas receptores | ST.INT.ARVL |
| Gasto turístico receptor | ST.INT.RCPT.CD |
| Gasto turístico emissor | ST.INT.XPND.CD |

**API:** `https://api.worldbank.org/v2/country/{code}/indicator/{indicator}?format=json`

---

### 3. OECD - Tourism

**URL:** https://data.oecd.org/

**Datos:**
- Estadísticas turísticas por país
- Impacto económico del turismo
- Tendencias de viajes

---

### 4. IATA - Aviación

**URL:** https://www.iata.org/

**Datos disponibles:**
- Rutas aéreas por país
- Capacidad de asientos
- Conectividad aérea

---

### 5. OMT (Organización Mundial del Turismo) - Española

**URL:** https://www.tourspain.es/

**Datos:**
- Estadísticas turismo España
- Destinos preferentes
- Perfiles de mercados emisores

---

### 6. numbeo - Coste de Vida

**URL:** https://www.numbeo.com/

**Datos:**
| Indicador | Descripción |
|-----------|-------------|
| Costo vida índice | Comparativa global |
| Costo restaurantes | Precio medio comida |
| Costo transporte | Transporte público |
| Alquiler/m² | Precio vivienda |

**API:** https://www.numbeo.com/property-api/ (freemium)

---

### 7. Weather API - Clima histórico

**Open-Meteo (ya integrado):**
- Forecast 7 días
- Datos históricos 40+ años
- Temperatura media, lluvias, etc.

**Extender a:**
- Temperaturas medias por mes
- Mejor época para visitar
- Probabilidad de lluvia

---

## 📊 Datos Disponibles en el Proyecto Actual

### Datos por País (paises.ts)

```typescript
interface DatoPais {
  codigo: string;           // ISO 2
  nombre: string;
  capital: string;
  continente: string;
  idioma: string;
  moneda: string;
  tipoCambio: string;
  zonaHoraria: string;
  conduccion: 'derecha' | 'izquierda';
  poblacion: string;
  pib: string;
  indicadores: {
    ipc: string;            // Inflación
    indicePrecios: string;  // Nivel coste vida
  };
  voltaje: string;
  prefijoTelefono: string;
  nivelRiesgo: NivelRiesgo; // MAEC
  ultimoInforme: string;
  contactos: ContactoOficial[];
  requerimientos: Requisito[];
  queHacer: string[];
  queNoHacer: string[];
  diarios: { nombre: string; url: string }[];
  urlsUtiles: { nombre: string; url: string }[];
  bandera: string;
  mapaCoordenadas: [lat, lon];
}
```

### Datos de Índices (indices.ts)

| Índice | Fuente | Países | Actualización |
|--------|--------|--------|----------------|
| GPI | IEP 2026 | 163 | Anual |
| GTI | IEP 2026 | --- | Anual |
| HDI | UNDP 2024 | 45 | Anual |
| IPC | Macro 2026 | 55 | Trimestral |
| MAEC | MAEC 2026 | 94 | Diario |

---

## 🎯 Propuesta: Dossier Premium por País

### Estructura del Dossier

```markdown
# 📄 Dossier: [País] - [Fecha]

## 1. INFORMACIÓN GENERAL
- Capital, idioma, moneda, zona horaria
- Población, PIB per cápita
- Indicador de coste de vida (IPC)
- Huso horario respecto a España

## 2. SEGURIDAD (MAEC)
- Nivel de riesgo actual
- Último informe MAEC
- Recomendaciones de seguridad
- Teléfonos de emergencia consulares
- Enlaces alertas viaje

## 3. DATOS TURÍSTICOS
- Llegadas turistas 2024 (UNWTO)
- Ingresos turismo (UNWTO)
- Principales mercados emisores
- Destinos más visitados
- Estancia media

## 4. CLIMA Y MEJOR ÉPOCA
- Temperatura media mensual
- Precipitaciones
- Mejor época para visitar
- Condiciones climáticas extremas

## 5. COSTES Y PRESUPUESTO
- Coste vida (Numbeo)
- Precio medio hotel (€)
- Comida restaurante (€)
- Transporte público
- Presupuesto diario recomendado

## 6. INDICADORES DE DESARROLLO
- HDI (UNDP)
- Calidad de vida
- Infraestructura turística

## 7. TRANSPORTE
- Aeropuertos principales
- Conexiones aéreas desde España
- Transporte interno
- Conducción: derecha/izquierda
- Requisitos licencia

## 8. REQUISITOS DE ENTRADA
- Visado Schengen/no Schengen
- Pasaporte requisitos
- Vacunas requeridas
- Seguro obligatorio

## 9. CONTACTS ÚTILES
- Embajada en Madrid
- Consulados
- Teléfono emergencia
- Web turismo oficial

## 10. ENLACES Y RECURSOS
- Web oficial turismo
- Datasheet MAEC (PDF)
- Mapas y guías
```

---

## 🔧 APIs a Integrar para Dossier Premium

### Alta Prioridad (Gratuitas)

| API | Datos | Coste | Endpoint |
|-----|-------|-------|----------|
| **World Bank** | PIB, turistas, población | Gratis | `api.worldbank.org` |
| **UNWTO** | Estadísticas turismo | Gratis | `api.unwto.org` |
| **Open-Meteo** | Clima histórico | Gratis | `api.open-meteo.com` |
| **Numbeo** | Coste vida | Freemium | API disponible |

### Media Prioridad

| API | Datos | Costo |
|-----|-------|-------|
| **AviationStack** | Rutas aéreas | Freemium |
| **Amadeus** | Hoteles, vuelos | Freemium |
| **Booking** | Precios hotel | Scraping |

---

## 📦 Implementación Recomendada

### Paso 1: API World Bank
```typescript
// Obtener llegadas turísticas
GET https://api.worldbank.org/v2/country/${code}/indicator/ST.INT.ARVL?format=json&date=2024
```

### Paso 2: API Open-Meteo (Extender)
```typescript
// Clima histórico
GET https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2024-01-01&end_date=2024-12-31&daily=temperature_2m_mean,precipitation_sum
```

### Paso 3: UNWTO Data
```typescript
// Estadísticas turismo
GET https://api.unwto.org/v1/country?format=json
```

---

## 📝 Resumen: Qué podemos ofrecer AHORA vs QUÉ PODEMOS OFRECER

### ✅ Disponible Ahora (94 países)
- Nivel riesgo MAEC
- Clima 7 días (Open-Meteo)
- PIB, población (datos estáticos)
- Costes aproximados (IPC estático)
- Requisitos entrada
- Embajadas y contactos

### 🎯 Con API World Bank (fácil)
- Llegadas turistas reales
- Ingresos turismo
- Evolución histórica

### 🚀 Con más desarrollo
- Coste vida tiempo real (Numbeo)
- Precios hoteles (Amadeus/Booking)
- Rutas aéreas (AviationStack)
- Mejor época (clima histórico)

---

*Documento creado: 2026-04-24*
*Proyecto: Viaje con Inteligencia*