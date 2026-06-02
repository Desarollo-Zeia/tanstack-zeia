# Alertas de Energía — API v1

> Todos los endpoints requieren autenticación (`IsAuthenticated`).  
> Base path: `/api/v1/`

---

## Tabla de Contenidos

1. [Voltage Fluctuation](#1-voltage-fluctuation)
2. [Power Demand](#2-power-demand)
3. [Current Monitoring](#3-current-monitoring)
4. [Energy Monitoring](#4-energy-monitoring)

---

## 1. Voltage Fluctuation

### 1.1 Tabla de alertas

**`GET /alerts/energy/voltage-fluctuation/`**

Retorna alertas de fluctuación de voltaje paginadas (5 por página).

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `device` | `int` | ID del dispositivo |
| `measurement_point` | `int` | ID del punto de medición |
| `fluctuation_subtype` | `string` | `overvoltage` \| `undervoltage` \| `zero_voltage` (repetible) |
| `status` | `string` | `new` \| `acknowledged` \| `resolved` (repetible) |
| `alert_status` | `string` | `moderate` \| `critical` (repetible) |
| `phase_type` | `string` | `A` \| `B` \| `C` \| `AB` \| `BC` \| `AC` (repetible) |
| `date_after` | `date` | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | `date` | Fecha fin (`YYYY-MM-DD`) |
| `time_after` | `time` | Hora inicio (`HH:MM`) |
| `time_before` | `time` | Hora fin (`HH:MM`) |

#### Response `200`

```json
{
  "count": 42,
  "next": "http://...?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "indicator_name": "Voltaje",
      "subindicator_name": "Voltaje de Fase A (Ua)",
      "origin": "Subtensión - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 230.0,
      "value": 195.5,
      "device_id": 10,
      "device_name": "Panel Principal",
      "measurement_point_id": 5,
      "measurement_point_name": "Tablero 1",
      "status": "new",
      "alert_status": "critical",
      "notes": "string | null"
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `count` | `int` | Total de alertas que coinciden con los filtros |
| `next` | `string \| null` | URL de la siguiente página |
| `previous` | `string \| null` | URL de la página anterior |
| `results[].id` | `int` | ID de la alerta |
| `results[].indicator_name` | `string` | Nombre del indicador (ej: "Voltaje") |
| `results[].subindicator_name` | `string` | Nombre del sub-indicador con fase |
| `results[].origin` | `string` | Descripción del origen de la alerta |
| `results[].date` | `string` | Fecha formateada en español |
| `results[].time` | `string` | Hora formateada en 12h |
| `results[].limit` | `float` | Valor límite del umbral |
| `results[].value` | `float` | Valor registrado que disparó la alerta |
| `results[].device_id` | `int` | ID del dispositivo |
| `results[].device_name` | `string` | Nombre del dispositivo |
| `results[].measurement_point_id` | `int` | ID del punto de medición |
| `results[].measurement_point_name` | `string` | Nombre del punto de medición |
| `results[].status` | `string` | Estado de gestión: `new`, `acknowledged`, `resolved` |
| `results[].alert_status` | `string` | Severidad: `moderate`, `critical` |
| `results[].notes` | `string \| null` | Notas adicionales |

---

### 1.2 Última alerta por fase

**`GET /alerts/energy/voltage-fluctuation/latest-by-phase/`**

Retorna la última alerta por cada fase (máx. 6: A, B, C, AB, BC, AC) y el conteo total de alertas del día.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `fluctuation_subtype` | `string` | `overvoltage` \| `undervoltage` \| `zero_voltage` |

#### Response `200`

```json
{
  "today_count": 12,
  "results": [
    {
      "id": 1,
      "indicator_name": "Voltaje",
      "subindicator_name": "Voltaje de Fase A (Ua)",
      "origin": "Subtensión - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 230.0,
      "value": 195.5,
      "device_id": 10,
      "device_name": "Panel Principal",
      "measurement_point_id": 5,
      "measurement_point_name": "Tablero 1",
      "status": "new",
      "alert_status": "critical",
      "notes": null
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `today_count` | `int` | Total de alertas del día (todos los subtipos y fases) |
| `results` | `array` | Última alerta por fase (máx. 6 elementos), misma estructura que la tabla |

---

### 1.3 Detalle de lecturas de una alerta

**`GET /alerts/<alert_id>/voltage-fluctuation/readings/`**

Retorna todas las lecturas del día en que ocurrió la alerta. La lectura que disparó la alerta se marca con `is_alert_reading: true`. Sin paginación (el frontend pagina y usa la lista completa para el gráfico).

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `alert_id` | `int` | ID de la alerta |

#### Response `200`

```json
{
  "alert_id": 1,
  "alert_reading_id": 55,
  "date": "2026-03-05",
  "measurement_point_id": 5,
  "measurement_point_name": "Tablero 1",
  "phase_type": "A",
  "fluctuation_subtype": "undervoltage",
  "threshold_high": 253.0,
  "threshold_low": 207.0,
  "readings": [
    {
      "id": 55,
      "date": "Jueves, 5 de Marzo",
      "time": "08:00",
      "Ua_value": 195.5,
      "Ub_value": 228.3,
      "Uc_value": 229.1,
      "Uab_value": 398.2,
      "Ubc_value": 396.7,
      "Uac_value": 397.5,
      "P_value": 12.4,
      "is_alert_reading": true
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `alert_id` | `int` | ID de la alerta consultada |
| `alert_reading_id` | `int` | ID de la lectura que disparó la alerta |
| `date` | `string` | Fecha de la alerta (`YYYY-MM-DD`) |
| `measurement_point_id` | `int` | ID del punto de medición |
| `measurement_point_name` | `string` | Nombre del punto de medición |
| `phase_type` | `string` | Fase afectada: `A`, `B`, `C`, `AB`, `BC`, `AC` |
| `fluctuation_subtype` | `string` | Subtipo: `overvoltage`, `undervoltage`, `zero_voltage` |
| `threshold_high` | `float \| null` | Límite superior de voltaje para la línea del gráfico |
| `threshold_low` | `float \| null` | Límite inferior de voltaje para la línea del gráfico |
| `readings[].id` | `int` | ID de la lectura |
| `readings[].date` | `string` | Fecha formateada en español |
| `readings[].time` | `string` | Hora (`HH:MM`) |
| `readings[].Ua_value` | `float \| null` | Voltaje fase A |
| `readings[].Ub_value` | `float \| null` | Voltaje fase B |
| `readings[].Uc_value` | `float \| null` | Voltaje fase C |
| `readings[].Uab_value` | `float \| null` | Voltaje línea AB |
| `readings[].Ubc_value` | `float \| null` | Voltaje línea BC |
| `readings[].Uac_value` | `float \| null` | Voltaje línea AC |
| `readings[].P_value` | `float \| null` | Potencia activa |
| `readings[].is_alert_reading` | `bool` | `true` si es la lectura que disparó la alerta |

---

### 1.4 Reporte Excel — Historial completo

**`GET /alerts/energy/voltage-fluctuation/report/`**

Descarga un archivo Excel con el historial completo de alertas. Genera una hoja por subtipo: **Subtensión**, **Sobretensión**, **Voltaje Cero**.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `date_after` | `date` | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | `date` | Fecha fin (`YYYY-MM-DD`) |
| `phase_type` | `string` | `A` \| `B` \| `C` \| `AB` \| `BC` \| `AC` (repetible) |

#### Response `200`

Archivo binario: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
Filename: `reporte_alertas_voltaje.xlsx`

**Columnas por hoja:**

| Columna | Descripción |
|---------|-------------|
| Punto de Medición | Nombre del punto de medición |
| Indicador | Nombre del indicador |
| Sub Indicador | Nombre del sub-indicador |
| Origen | Descripción del origen |
| Fecha | Fecha de la alerta |
| Hora | Hora de la alerta |
| Límite | Valor umbral |
| Valor | Valor registrado |

---

### 1.5 Reporte Excel — Última alerta por fase

**`GET /alerts/energy/voltage-fluctuation/latest-by-phase/report/`**

Descarga un Excel con la última alerta por fase (misma lógica que 1.2). Una hoja por subtipo: **Subtensión**, **Sobretensión**, **Voltaje Cero**.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `fluctuation_subtype` | `string` | `overvoltage` \| `undervoltage` \| `zero_voltage` |

#### Response `200`

Archivo binario: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
Filename: `reporte_ultima_alerta_por_fase.xlsx`

**Columnas por hoja:** (misma estructura que 1.4)

---

## 2. Power Demand

### 2.1 Tabla de alertas

**`GET /alerts/energy/power-demand/`**

Retorna alertas de demanda de potencia paginadas (5 por página).

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `device` | `int` | ID del dispositivo |
| `measurement_point` | `int` | ID del punto de medición |
| `power_subtype` | `string` | `max_demand_exceeded` \| `contracted_power_exceeded` \| `installed_power_exceeded` \| `max_reactive_exceeded` \| `min_reactive_subceeded` (repetible) |
| `status` | `string` | `new` \| `acknowledged` \| `resolved` (repetible) |
| `alert_status` | `string` | `moderate` \| `critical` (repetible) |
| `date_after` | `date` | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | `date` | Fecha fin (`YYYY-MM-DD`) |
| `time_after` | `time` | Hora inicio (`HH:MM`) |
| `time_before` | `time` | Hora fin (`HH:MM`) |

#### Response `200`

```json
{
  "count": 15,
  "next": "http://...?page=2",
  "previous": null,
  "results": [
    {
      "id": 2,
      "indicator_name": "Potencia",
      "subindicator_name": "Potencia Activa Total (P)",
      "origin": "Máxima Demanda Excedida",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 500.0,
      "value": 523.7,
      "device_id": 10,
      "device_name": "Panel Principal",
      "measurement_point_id": 5,
      "measurement_point_name": "Tablero 1",
      "status": "new",
      "alert_status": "critical",
      "notes": null
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `count` | `int` | Total de alertas que coinciden |
| `next` | `string \| null` | URL de la siguiente página |
| `previous` | `string \| null` | URL de la página anterior |
| `results` | `array` | Misma estructura que Voltage (ver 1.1), con `indicator_name` = "Potencia" |

---

### 2.2 Última alerta por subtipo

**`GET /alerts/energy/power-demand/latest-by-subtype/`**

Retorna la última alerta por cada `power_subtype` (máx. 5) y el conteo total del día.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `power_subtype` | `string` | Filtrar por subtipo específico |

#### Response `200`

```json
{
  "today_count": 8,
  "results": [
    {
      "id": 2,
      "indicator_name": "Potencia",
      "subindicator_name": "Potencia Activa Total (P)",
      "origin": "Máxima Demanda Excedida",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 500.0,
      "value": 523.7,
      "device_id": 10,
      "device_name": "Panel Principal",
      "measurement_point_id": 5,
      "measurement_point_name": "Tablero 1",
      "status": "new",
      "alert_status": "critical",
      "notes": null
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `today_count` | `int` | Total de alertas del día (todos los subtipos) |
| `results` | `array` | Última alerta por subtipo (máx. 5), misma estructura que la tabla |

---

### 2.3 Detalle de lecturas de una alerta

**`GET /alerts/<alert_id>/power-demand/readings/`**

Retorna todas las lecturas del día de la alerta (P y Q). La lectura que disparó la alerta se marca con `is_alert_reading: true`.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `alert_id` | `int` | ID de la alerta |

#### Response `200`

```json
{
  "alert_id": 2,
  "alert_reading_id": 120,
  "date": "2026-03-05",
  "measurement_point_id": 5,
  "measurement_point_name": "Tablero 1",
  "power_subtype": "max_demand_exceeded",
  "threshold_value": 500.0,
  "readings": [
    {
      "id": 120,
      "date": "Jueves, 5 de Marzo",
      "time": "08:00",
      "P_value": 523.7,
      "Q_value": 45.2,
      "is_alert_reading": true
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `alert_id` | `int` | ID de la alerta consultada |
| `alert_reading_id` | `int` | ID de la lectura que disparó la alerta |
| `date` | `string` | Fecha de la alerta (`YYYY-MM-DD`) |
| `measurement_point_id` | `int` | ID del punto de medición |
| `measurement_point_name` | `string` | Nombre del punto de medición |
| `power_subtype` | `string` | Subtipo de la alerta de potencia |
| `threshold_value` | `float \| null` | Valor límite que fue excedido |
| `readings[].id` | `int` | ID de la lectura |
| `readings[].date` | `string` | Fecha formateada en español |
| `readings[].time` | `string` | Hora (`HH:MM`) |
| `readings[].P_value` | `float \| null` | Potencia activa |
| `readings[].Q_value` | `float \| null` | Potencia reactiva |
| `readings[].is_alert_reading` | `bool` | `true` si es la lectura que disparó la alerta |

---

### 2.4 Reporte Excel — Historial completo

**`GET /alerts/energy/power-demand/report/`**

Descarga un Excel con el historial completo. Dos hojas: **Potencia Activa**, **Potencia Reactiva**.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `date_after` | `date` | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | `date` | Fecha fin (`YYYY-MM-DD`) |
| `power_subtype` | `string` | Filtrar por subtipo específico |

#### Response `200`

Archivo binario: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
Filename: `reporte_alertas_potencia.xlsx`

**Columnas por hoja:**

| Columna | Descripción |
|---------|-------------|
| Punto de Medición | Nombre del punto de medición |
| Indicador | Nombre del indicador |
| Sub Indicador | Nombre del sub-indicador |
| Origen | Descripción del origen |
| Fecha | Fecha de la alerta |
| Hora | Hora de la alerta |
| Valor | Valor registrado |
| Notas | Notas adicionales |

---

### 2.5 Reporte Excel — Última alerta por subtipo

**`GET /alerts/energy/power-demand/latest-by-subtype/report/`**

Descarga un Excel con la última alerta por subtipo de potencia. Dos hojas: **Potencia Activa**, **Potencia Reactiva**.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `power_subtype` | `string` | Filtrar por subtipo específico |

#### Response `200`

Archivo binario: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
Filename: `reporte_ultima_alerta_potencia.xlsx`

**Columnas por hoja:** (misma estructura que 2.4)

---

## 3. Current Monitoring

### 3.1 Tabla de alertas

**`GET /alerts/energy/current-monitoring/`**

Retorna alertas de monitoreo de corriente paginadas (5 por página).

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `device` | `int` | ID del dispositivo |
| `measurement_point` | `int` | ID del punto de medición |
| `current_subtype` | `string` | Subtipo de corriente (repetible) |
| `current_phase` | `string` | `A` \| `B` \| `C` (repetible) |
| `status` | `string` | `new` \| `acknowledged` \| `resolved` (repetible) |
| `alert_status` | `string` | `moderate` \| `critical` (repetible) |
| `date_after` | `date` | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | `date` | Fecha fin (`YYYY-MM-DD`) |
| `time_after` | `time` | Hora inicio (`HH:MM`) |
| `time_before` | `time` | Hora fin (`HH:MM`) |

#### Response `200`

```json
{
  "count": 20,
  "next": "http://...?page=2",
  "previous": null,
  "results": [
    {
      "id": 3,
      "indicator_name": "Corriente",
      "subindicator_name": "Corriente de Fase A (Ia)",
      "origin": "Sobrecorriente - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 100.0,
      "value": 112.3,
      "device_id": 10,
      "device_name": "Panel Principal",
      "measurement_point_id": 5,
      "measurement_point_name": "Tablero 1",
      "status": "new",
      "alert_status": "moderate",
      "notes": null
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `count` | `int` | Total de alertas que coinciden |
| `next` | `string \| null` | URL de la siguiente página |
| `previous` | `string \| null` | URL de la página anterior |
| `results` | `array` | Misma estructura que Voltage (ver 1.1), con `indicator_name` = "Corriente" |

---

### 3.2 Última alerta por fase

**`GET /alerts/energy/current-monitoring/latest-by-phase/`**

Retorna la última alerta por combinación `(current_phase + current_subtype)` y el conteo total del día.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `current_phase` | `string` | `A` \| `B` \| `C` |
| `current_subtype` | `string` | Filtrar por subtipo específico |

#### Response `200`

```json
{
  "today_count": 6,
  "results": [
    {
      "id": 3,
      "indicator_name": "Corriente",
      "subindicator_name": "Corriente de Fase A (Ia)",
      "origin": "Sobrecorriente - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 100.0,
      "value": 112.3,
      "device_id": 10,
      "device_name": "Panel Principal",
      "measurement_point_id": 5,
      "measurement_point_name": "Tablero 1",
      "status": "new",
      "alert_status": "moderate",
      "notes": null
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `today_count` | `int` | Total de alertas del día |
| `results` | `array` | Última alerta por combinación fase+subtipo, misma estructura que la tabla |

---

### 3.3 Detalle de lecturas de una alerta

**`GET /alerts/<alert_id>/current-monitoring/readings/`**

Retorna todas las lecturas del día de la alerta (Ia, Ib, Ic). La lectura que disparó la alerta se marca con `is_alert_reading: true`.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `alert_id` | `int` | ID de la alerta |

#### Response `200`

```json
{
  "alert_id": 3,
  "alert_reading_id": 200,
  "date": "2026-03-05",
  "measurement_point_id": 5,
  "measurement_point_name": "Tablero 1",
  "current_subtype": "overcurrent",
  "current_phase": "A",
  "readings": [
    {
      "id": 200,
      "date": "Jueves, 5 de Marzo",
      "time": "08:00",
      "Ia_value": 112.3,
      "Ib_value": 85.4,
      "Ic_value": 87.1,
      "is_alert_reading": true
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `alert_id` | `int` | ID de la alerta consultada |
| `alert_reading_id` | `int` | ID de la lectura que disparó la alerta |
| `date` | `string` | Fecha de la alerta (`YYYY-MM-DD`) |
| `measurement_point_id` | `int` | ID del punto de medición |
| `measurement_point_name` | `string` | Nombre del punto de medición |
| `current_subtype` | `string` | Subtipo de la alerta de corriente |
| `current_phase` | `string \| null` | Fase afectada: `A`, `B`, `C`, o `null` para CUF |
| `readings[].id` | `int` | ID de la lectura |
| `readings[].date` | `string` | Fecha formateada en español |
| `readings[].time` | `string` | Hora (`HH:MM`) |
| `readings[].Ia_value` | `float \| null` | Corriente fase A |
| `readings[].Ib_value` | `float \| null` | Corriente fase B |
| `readings[].Ic_value` | `float \| null` | Corriente fase C |
| `readings[].is_alert_reading` | `bool` | `true` si es la lectura que disparó la alerta |

---

### 3.4 Reporte Excel — Historial completo

**`GET /alerts/energy/current-monitoring/report/`**

Descarga un Excel con el historial completo. Cuatro hojas: **Fase A**, **Fase B**, **Fase C**, **CUF**.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `date_after` | `date` | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | `date` | Fecha fin (`YYYY-MM-DD`) |
| `current_phase` | `string` | `A` \| `B` \| `C` |
| `current_subtype` | `string` | Filtrar por subtipo específico |

#### Response `200`

Archivo binario: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
Filename: `reporte_alertas_corriente.xlsx`

**Columnas por hoja:**

| Columna | Descripción |
|---------|-------------|
| Punto de Medición | Nombre del punto de medición |
| Indicador | Nombre del indicador |
| Sub Indicador | Nombre del sub-indicador |
| Origen | Descripción del origen |
| Fecha | Fecha de la alerta |
| Hora | Hora de la alerta |
| Valor | Valor registrado |
| Notas | Notas adicionales |

---

### 3.5 Reporte Excel — Última alerta por fase

**`GET /alerts/energy/current-monitoring/latest-by-phase/report/`**

Descarga un Excel con la última alerta por combinación fase+subtipo. Cuatro hojas: **Fase A**, **Fase B**, **Fase C**, **CUF**.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `current_phase` | `string` | `A` \| `B` \| `C` |
| `current_subtype` | `string` | Filtrar por subtipo específico |

#### Response `200`

Archivo binario: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
Filename: `reporte_ultima_alerta_corriente.xlsx`

**Columnas por hoja:** (misma estructura que 3.4)

---

## 4. Energy Monitoring

### 4.1 Tabla de alertas

**`GET /alerts/energy/energy-monitoring/`**

Retorna alertas de monitoreo de energía paginadas (5 por página).

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `device` | `int` | ID del dispositivo |
| `measurement_point` | `int` | ID del punto de medición |
| `energy_subtype` | `string` | `overconsumption` \| `undervaluation` \| `reactive_inductive_exceeded` \| `reactive_capacitive_exceeded` (repetible) |
| `energy_category` | `string` | `active` (EPpos/EPneg) \| `reactive` (EQpos/EQneg) — filtra subtipos y tags |
| `status` | `string` | `new` \| `acknowledged` \| `resolved` (repetible) |
| `alert_status` | `string` | `moderate` \| `critical` (repetible) |
| `date_after` | `date` | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | `date` | Fecha fin (`YYYY-MM-DD`) |
| `time_after` | `time` | Hora inicio (`HH:MM`) |
| `time_before` | `time` | Hora fin (`HH:MM`) |

#### Response `200`

```json
{
  "count": 30,
  "next": "http://...?page=2",
  "previous": null,
  "results": [
    {
      "id": 4,
      "indicator_name": "Energía",
      "subindicator_name": "Energía Activa Consumida (EPpos)",
      "origin": "Sobreconsumo",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 1000.0,
      "value": 1150.3,
      "device_id": 10,
      "device_name": "Panel Principal",
      "measurement_point_id": 5,
      "measurement_point_name": "Tablero 1",
      "status": "new",
      "alert_status": "critical",
      "notes": "[EPpos]"
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `count` | `int` | Total de alertas que coinciden |
| `next` | `string \| null` | URL de la siguiente página |
| `previous` | `string \| null` | URL de la página anterior |
| `results` | `array` | Misma estructura que Voltage (ver 1.1), con `indicator_name` = "Energía" |

---

### 4.2 Última alerta por subtipo

**`GET /alerts/energy/energy-monitoring/latest-by-subtype/`**

Retorna la última alerta por combinación `(energy_type tag + energy_subtype + measurement_point)`. Los energy types se detectan del campo `notes`: `EPpos`, `EPneg`, `EQpos`, `EQneg`. También retorna el conteo total del día.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `energy_subtype` | `string` | `overconsumption` \| `undervaluation` \| `reactive_inductive_exceeded` \| `reactive_capacitive_exceeded` |
| `energy_category` | `string` | `active` → solo overconsumption + undervaluation (EPpos/EPneg); `reactive` → solo reactive_inductive_exceeded + reactive_capacitive_exceeded (EQpos/EQneg); omitir para todos |

#### Response `200`

```json
{
  "today_count": 10,
  "results": [
    {
      "id": 4,
      "indicator_name": "Energía",
      "subindicator_name": "Energía Activa Consumida (EPpos)",
      "origin": "Sobreconsumo",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 1000.0,
      "value": 1150.3,
      "device_id": 10,
      "device_name": "Panel Principal",
      "measurement_point_id": 5,
      "measurement_point_name": "Tablero 1",
      "status": "new",
      "alert_status": "critical",
      "notes": "[EPpos]"
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `today_count` | `int` | Total de alertas del día |
| `results` | `array` | Última alerta por combinación tag+subtipo+punto de medición, misma estructura que la tabla |

---

### 4.3 Detalle de lecturas de una alerta

**`GET /alerts/<alert_id>/energy-monitoring/readings/`**

Retorna todas las lecturas del día de la alerta (EPpos, EPneg). La lectura que disparó la alerta se marca con `is_alert_reading: true`.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `alert_id` | `int` | ID de la alerta |

#### Response `200`

```json
{
  "alert_id": 4,
  "alert_reading_id": 300,
  "date": "2026-03-05",
  "measurement_point_id": 5,
  "measurement_point_name": "Tablero 1",
  "energy_subtype": "overconsumption",
  "energy_type": "EPpos",
  "readings": [
    {
      "id": 300,
      "date": "Jueves, 5 de Marzo",
      "time": "08:00",
      "EPpos_value": 1150.3,
      "EPneg_value": 0.0,
      "is_alert_reading": true
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `alert_id` | `int` | ID de la alerta consultada |
| `alert_reading_id` | `int` | ID de la lectura que disparó la alerta |
| `date` | `string` | Fecha de la alerta (`YYYY-MM-DD`) |
| `measurement_point_id` | `int` | ID del punto de medición |
| `measurement_point_name` | `string` | Nombre del punto de medición |
| `energy_subtype` | `string` | Subtipo de la alerta de energía |
| `energy_type` | `string` | Tipo de energía detectado del campo notes: `EPpos` o `EPneg` |
| `readings[].id` | `int` | ID de la lectura |
| `readings[].date` | `string` | Fecha formateada en español |
| `readings[].time` | `string` | Hora (`HH:MM`) |
| `readings[].EPpos_value` | `float \| null` | Energía activa consumida |
| `readings[].EPneg_value` | `float \| null` | Energía activa generada |
| `readings[].is_alert_reading` | `bool` | `true` si es la lectura que disparó la alerta |

---

### 4.4 Reporte Excel — Historial completo

**`GET /alerts/energy/energy-monitoring/report/`**

Descarga un Excel con el historial completo. Cuatro hojas: **Energía Consumida**, **Energía Generada**, **Reactiva Inductiva**, **Reactiva Capacitiva**.

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `date_after` | `date` | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | `date` | Fecha fin (`YYYY-MM-DD`) |
| `energy_subtype` | `string` | Filtrar por subtipo específico |

#### Response `200`

Archivo binario: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
Filename: `reporte_alertas_energia.xlsx`

**Columnas por hoja:**

| Columna | Descripción |
|---------|-------------|
| Punto de Medición | Nombre del punto de medición |
| Indicador | Nombre del indicador |
| Sub Indicador | Nombre del sub-indicador |
| Origen | Descripción del origen |
| Fecha | Fecha de la alerta |
| Hora | Hora de la alerta |
| Valor | Valor registrado |
| Notas | Notas adicionales |

---

### 4.5 Reporte Excel — Última alerta por subtipo

**`GET /alerts/energy/energy-monitoring/latest-by-subtype/report/`**

Descarga un Excel con la última alerta por subtipo. Cuatro hojas: **Energía Consumida** (EPpos), **Energía Generada** (EPneg), **Reactiva Inductiva** (EQpos), **Reactiva Capacitiva** (EQneg).

#### Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | `int` | ID del punto de medición |
| `energy_subtype` | `string` | Filtrar por subtipo específico |

#### Response `200`

Archivo binario: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
Filename: `reporte_ultima_alerta_energia.xlsx`

**Columnas por hoja:** (misma estructura que 4.4)
