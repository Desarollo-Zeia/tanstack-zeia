# Alertas API - Documentación de Endpoints

**Versión:** v1  
**Módulo:** `apps.alerts.api.v1`  
**Autenticación:** Todos los endpoints requieren `Authorization: Bearer <token>`

---

## Tabla de Contenidos

1. [Voltage Fluctuation Alerts](#voltage-fluctuation-alerts)
2. [Power Demand Alerts](#power-demand-alerts)
3. [Current Monitoring Alerts](#current-monitoring-alerts)
4. [Energy Monitoring Alerts](#energy-monitoring-alerts)
5. [Harmonic Distortion Alerts](#harmonic-distortion-alerts)
6. [Notas Generales](#notas-generales)

---

## Voltage Fluctuation Alerts

### 1. Tabla de Alertas de Voltaje

**Endpoint:** `GET /api/v1/alerts/energy/voltage-fluctuation/`

**Permisos:** `IsAuthenticated`

**Query Parameters (Filtros):**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `device` | int | ID del dispositivo | - |
| `measurement_point` | int | ID del punto de medición | - |
| `fluctuation_subtype` | string (multiple) | Tipo de fluctuación | `overvoltage`, `undervoltage`, `zero_voltage` |
| `status` | string (multiple) | Estado de la alerta | `new`, `acknowledged`, `resolved` |
| `alert_status` | string (multiple) | Severidad | `moderate`, `critical` |
| `phase_type` | string (multiple) | Tipo de fase | `A`, `B`, `C`, `AB`, `BC`, `AC` |
| `date_after` | date | Fecha inicio | `YYYY-MM-DD` |
| `date_before` | date | Fecha fin | `YYYY-MM-DD` |
| `time_after` | time | Hora inicio | `HH:MM` |
| `time_before` | time | Hora fin | `HH:MM` |

**Paginación:** 5 elementos por página

**Respuesta JSON:**
```json
{
  "count": 120,
  "next": "http://api.example.com/api/v1/alerts/energy/voltage-fluctuation/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1234,
      "indicator_name": "Voltaje",
      "subindicator_name": "Voltaje de Fase A (Ua)",
      "origin": "Subtensión - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 220.0,
      "value": 195.5,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "new",
      "alert_status": "critical",
      "notes": null
    }
  ]
}
```

---

### 2. Última Alerta por Fase

**Endpoint:** `GET /api/v1/alerts/energy/voltage-fluctuation/latest-by-phase/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `measurement_point` | int | ID del punto de medición | - |
| `fluctuation_subtype` | string | Tipo de fluctuación | `overvoltage`, `undervoltage`, `zero_voltage` |

**Respuesta JSON:**
```json
{
  "today_count": 23,
  "results": [
    {
      "id": 1234,
      "indicator_name": "Voltaje",
      "subindicator_name": "Voltaje de Fase A (Ua)",
      "origin": "Subtensión - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 220.0,
      "value": 195.5,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "new",
      "alert_status": "critical",
      "notes": null
    }
  ]
}
```

**Nota:** Retorna máximo 6 alertas (una por fase: A, B, C, AB, BC, AC)

---

### 3. Detalle de Lecturas de Alerta de Voltaje

**Endpoint:** `GET /api/v1/alerts/{alert_id}/voltage-fluctuation/readings/`

**Permisos:** `IsAuthenticated`

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `alert_id` | int | ID de la alerta |

**Respuesta JSON:**
```json
{
  "alert_id": 1234,
  "alert_reading_id": 5678,
  "date": "2026-03-05",
  "measurement_point_id": 12,
  "measurement_point_name": "Tablero Eléctrico 1",
  "phase_type": "A",
  "fluctuation_subtype": "undervoltage",
  "threshold_high": 242.0,
  "threshold_low": 198.0,
  "readings": [
    {
      "id": 5678,
      "date": "Jueves, 5 de marzo",
      "time": "08:00",
      "Ua_value": 195.5,
      "Ub_value": 220.3,
      "Uc_value": 221.1,
      "Uab_value": 380.2,
      "Ubc_value": 381.5,
      "Uac_value": 379.8,
      "P_value": 45.2,
      "is_alert_reading": true
    },
    {
      "id": 5679,
      "date": "Jueves, 5 de marzo",
      "time": "08:05",
      "Ua_value": 218.7,
      "Ub_value": 219.8,
      "Uc_value": 220.5,
      "Uab_value": 379.5,
      "Ubc_value": 380.2,
      "Uac_value": 378.9,
      "P_value": 46.1,
      "is_alert_reading": false
    }
  ]
}
```

**Nota:** Retorna todas las lecturas del día en que ocurrió la alerta. La lectura que disparó la alerta está marcada con `is_alert_reading: true`.

---

### 4. Reporte Excel de Alertas de Voltaje

**Endpoint:** `GET /api/v1/alerts/energy/voltage-fluctuation/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `date_after` | date | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | date | Fecha fin (`YYYY-MM-DD`) |
| `phase_type` | string (multiple) | Tipo de fase (`A`, `B`, `C`, `AB`, `BC`, `AC`) |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_alertas_voltaje.xlsx"`
- **Hojas Excel:** Subtensión, Sobretensión, Voltaje Cero
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Límite, Valor

---

### 5. Reporte Excel Última Alerta por Fase

**Endpoint:** `GET /api/v1/alerts/energy/voltage-fluctuation/latest-by-phase/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `fluctuation_subtype` | string | Tipo de fluctuación |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_ultima_alerta_por_fase.xlsx"`
- **Hojas Excel:** Subtensión, Sobretensión, Voltaje Cero
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Límite, Valor

---

## Power Demand Alerts

### 6. Tabla de Alertas de Demanda de Potencia

**Endpoint:** `GET /api/v1/alerts/energy/power-demand/`

**Permisos:** `IsAuthenticated`

**Query Parameters (Filtros):**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `device` | int | ID del dispositivo | - |
| `measurement_point` | int | ID del punto de medición | - |
| `power_subtype` | string (multiple) | Subtipo de potencia | `max_demand_exceeded`, `contracted_power_exceeded`, `installed_power_exceeded`, `max_reactive_exceeded`, `min_reactive_subceeded` |
| `status` | string (multiple) | Estado de la alerta | `new`, `acknowledged`, `resolved` |
| `alert_status` | string (multiple) | Severidad | `moderate`, `critical` |
| `date_after` | date | Fecha inicio | `YYYY-MM-DD` |
| `date_before` | date | Fecha fin | `YYYY-MM-DD` |
| `time_after` | time | Hora inicio | `HH:MM` |
| `time_before` | time | Hora fin | `HH:MM` |

**Paginación:** 5 elementos por página

**Respuesta JSON:**
```json
{
  "count": 85,
  "next": "http://api.example.com/api/v1/alerts/energy/power-demand/?page=2",
  "previous": null,
  "results": [
    {
      "id": 2345,
      "indicator_name": "Potencia",
      "subindicator_name": "Potencia Activa Total (P)",
      "origin": "Máxima Demanda Excedida",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 100.0,
      "value": 125.5,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "acknowledged",
      "alert_status": "critical",
      "notes": "Se notificó al cliente"
    }
  ]
}
```

---

### 7. Última Alerta por Subtipo de Potencia

**Endpoint:** `GET /api/v1/alerts/energy/power-demand/latest-by-subtype/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `measurement_point` | int | ID del punto de medición | - |
| `power_subtype` | string | Subtipo de potencia | `max_demand_exceeded`, `contracted_power_exceeded`, `installed_power_exceeded`, `max_reactive_exceeded`, `min_reactive_subceeded` |

**Respuesta JSON:**
```json
{
  "today_count": 15,
  "results": [
    {
      "id": 2345,
      "indicator_name": "Potencia",
      "subindicator_name": "Potencia Activa Total (P)",
      "origin": "Máxima Demanda Excedida",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 100.0,
      "value": 125.5,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "acknowledged",
      "alert_status": "critical",
      "notes": "Se notificó al cliente"
    }
  ]
}
```

**Nota:** Retorna máximo 5 alertas (una por cada subtipo de potencia)

---

### 8. Detalle de Lecturas de Alerta de Potencia

**Endpoint:** `GET /api/v1/alerts/{alert_id}/power-demand/readings/`

**Permisos:** `IsAuthenticated`

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `alert_id` | int | ID de la alerta |

**Respuesta JSON:**
```json
{
  "alert_id": 2345,
  "alert_reading_id": 6789,
  "date": "2026-03-05",
  "measurement_point_id": 12,
  "measurement_point_name": "Tablero Eléctrico 1",
  "power_subtype": "max_demand_exceeded",
  "threshold_value": 100.0,
  "readings": [
    {
      "id": 6789,
      "date": "Jueves, 5 de marzo",
      "time": "08:00",
      "P_value": 125.5,
      "Q_value": 45.2,
      "is_alert_reading": true
    },
    {
      "id": 6790,
      "date": "Jueves, 5 de marzo",
      "time": "08:05",
      "P_value": 98.3,
      "Q_value": 42.1,
      "is_alert_reading": false
    }
  ]
}
```

---

### 9. Reporte Excel de Alertas de Potencia

**Endpoint:** `GET /api/v1/alerts/energy/power-demand/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `date_after` | date | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | date | Fecha fin (`YYYY-MM-DD`) |
| `power_subtype` | string | Subtipo de potencia |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_alertas_potencia.xlsx"`
- **Hojas Excel:** Potencia Activa, Potencia Reactiva
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Valor, Notas

---

### 10. Reporte Excel Última Alerta por Subtipo de Potencia

**Endpoint:** `GET /api/v1/alerts/energy/power-demand/latest-by-subtype/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `power_subtype` | string | Subtipo de potencia |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_ultima_alerta_potencia.xlsx"`
- **Hojas Excel:** Potencia Activa, Potencia Reactiva
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Valor, Notas

---

## Current Monitoring Alerts

### 11. Tabla de Alertas de Corriente

**Endpoint:** `GET /api/v1/alerts/energy/current-monitoring/`

**Permisos:** `IsAuthenticated`

**Query Parameters (Filtros):**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `device` | int | ID del dispositivo | - |
| `measurement_point` | int | ID del punto de medición | - |
| `current_subtype` | string (multiple) | Subtipo de corriente | `max_current_exceeded`, `min_current_subceeded`, `zero_current`, `current_unbalance` |
| `current_phase` | string (multiple) | Fase de corriente | `A`, `B`, `C` |
| `status` | string (multiple) | Estado de la alerta | `new`, `acknowledged`, `resolved` |
| `alert_status` | string (multiple) | Severidad | `moderate`, `critical` |
| `date_after` | date | Fecha inicio | `YYYY-MM-DD` |
| `date_before` | date | Fecha fin | `YYYY-MM-DD` |
| `time_after` | time | Hora inicio | `HH:MM` |
| `time_before` | time | Hora fin | `HH:MM` |

**Paginación:** 5 elementos por página

**Respuesta JSON:**
```json
{
  "count": 67,
  "next": "http://api.example.com/api/v1/alerts/energy/current-monitoring/?page=2",
  "previous": null,
  "results": [
    {
      "id": 3456,
      "indicator_name": "Corriente",
      "subindicator_name": "Corriente de Fase A (Ia)",
      "origin": "Corriente Máxima Excedida - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 50.0,
      "value": 62.3,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "new",
      "alert_status": "moderate",
      "notes": null
    }
  ]
}
```

---

### 12. Última Alerta por Fase de Corriente

**Endpoint:** `GET /api/v1/alerts/energy/current-monitoring/latest-by-phase/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `measurement_point` | int | ID del punto de medición | - |
| `current_phase` | string | Fase de corriente | `A`, `B`, `C` |
| `current_subtype` | string | Subtipo de corriente | `max_current_exceeded`, `min_current_subceeded`, `zero_current`, `current_unbalance` |

**Respuesta JSON:**
```json
{
  "today_count": 12,
  "results": [
    {
      "id": 3456,
      "indicator_name": "Corriente",
      "subindicator_name": "Corriente de Fase A (Ia)",
      "origin": "Corriente Máxima Excedida - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 50.0,
      "value": 62.3,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "new",
      "alert_status": "moderate",
      "notes": null
    }
  ]
}
```

**Nota:** Retorna la última alerta por combinación (fase + subtipo)

---

### 13. Detalle de Lecturas de Alerta de Corriente

**Endpoint:** `GET /api/v1/alerts/{alert_id}/current-monitoring/readings/`

**Permisos:** `IsAuthenticated`

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `alert_id` | int | ID de la alerta |

**Respuesta JSON:**
```json
{
  "alert_id": 3456,
  "alert_reading_id": 7890,
  "date": "2026-03-05",
  "measurement_point_id": 12,
  "measurement_point_name": "Tablero Eléctrico 1",
  "current_subtype": "max_current_exceeded",
  "current_phase": "A",
  "readings": [
    {
      "id": 7890,
      "date": "Jueves, 5 de marzo",
      "time": "08:00",
      "Ia_value": 62.3,
      "Ib_value": 45.1,
      "Ic_value": 47.8,
      "is_alert_reading": true
    },
    {
      "id": 7891,
      "date": "Jueves, 5 de marzo",
      "time": "08:05",
      "Ia_value": 48.5,
      "Ib_value": 44.9,
      "Ic_value": 46.2,
      "is_alert_reading": false
    }
  ]
}
```

---

### 14. Reporte Excel de Alertas de Corriente

**Endpoint:** `GET /api/v1/alerts/energy/current-monitoring/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `date_after` | date | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | date | Fecha fin (`YYYY-MM-DD`) |
| `current_phase` | string | Fase de corriente |
| `current_subtype` | string | Subtipo de corriente |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_alertas_corriente.xlsx"`
- **Hojas Excel:** Fase A, Fase B, Fase C, CUF
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Valor, Notas

---

### 15. Reporte Excel Última Alerta por Fase de Corriente

**Endpoint:** `GET /api/v1/alerts/energy/current-monitoring/latest-by-phase/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `current_phase` | string | Fase de corriente |
| `current_subtype` | string | Subtipo de corriente |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_ultima_alerta_corriente.xlsx"`
- **Hojas Excel:** Fase A, Fase B, Fase C, CUF
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Valor, Notas

---

## Energy Monitoring Alerts

### 16. Tabla de Alertas de Energía

**Endpoint:** `GET /api/v1/alerts/energy/energy-monitoring/`

**Permisos:** `IsAuthenticated`

**Query Parameters (Filtros):**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `device` | int | ID del dispositivo | - |
| `measurement_point` | int | ID del punto de medición | - |
| `energy_subtype` | string (multiple) | Subtipo de energía | `overconsumption`, `undervaluation`, `reactive_inductive_exceeded`, `reactive_capacitive_exceeded` |
| `energy_category` | string | Categoría de energía | `active`, `reactive` |
| `status` | string (multiple) | Estado de la alerta | `new`, `acknowledged`, `resolved` |
| `alert_status` | string (multiple) | Severidad | `moderate`, `critical` |
| `date_after` | date | Fecha inicio | `YYYY-MM-DD` |
| `date_before` | date | Fecha fin | `YYYY-MM-DD` |
| `time_after` | time | Hora inicio | `HH:MM` |
| `time_before` | time | Hora fin | `HH:MM` |

**Paginación:** 5 elementos por página

**Respuesta JSON:**
```json
{
  "count": 95,
  "next": "http://api.example.com/api/v1/alerts/energy/energy-monitoring/?page=2",
  "previous": null,
  "results": [
    {
      "id": 4567,
      "indicator_name": "Energía",
      "subindicator_name": "Energía Activa Consumida (EPpos)",
      "origin": "Consumo Elevado",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 1000.0,
      "value": 1250.5,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "resolved",
      "alert_status": "moderate",
      "notes": "[EPpos] Consumo mensual elevado"
    }
  ]
}
```

**Nota sobre `energy_category`:**
- `active`: Filtra solo `overconsumption` + `undervaluation` (tags `EPpos`/`EPneg`)
- `reactive`: Filtra solo `reactive_inductive_exceeded` + `reactive_capacitive_exceeded` (tags `EQpos`/`EQneg`)

---

### 17. Última Alerta por Subtipo de Energía

**Endpoint:** `GET /api/v1/alerts/energy/energy-monitoring/latest-by-subtype/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `measurement_point` | int | ID del punto de medición | - |
| `energy_subtype` | string | Subtipo de energía | `overconsumption`, `undervaluation`, `reactive_inductive_exceeded`, `reactive_capacitive_exceeded` |
| `energy_category` | string | Categoría de energía | `active`, `reactive` |

**Respuesta JSON:**
```json
{
  "today_count": 18,
  "results": [
    {
      "id": 4567,
      "indicator_name": "Energía",
      "subindicator_name": "Energía Activa Consumida (EPpos)",
      "origin": "Consumo Elevado",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 1000.0,
      "value": 1250.5,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "resolved",
      "alert_status": "moderate",
      "notes": "[EPpos] Consumo mensual elevado"
    }
  ]
}
```

**Nota:** Retorna la última alerta por combinación (tipo de energía + subtipo + punto de medición)

---

### 18. Detalle de Lecturas de Alerta de Energía

**Endpoint:** `GET /api/v1/alerts/{alert_id}/energy-monitoring/readings/`

**Permisos:** `IsAuthenticated`

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `alert_id` | int | ID de la alerta |

**Respuesta JSON:**
```json
{
  "alert_id": 4567,
  "alert_reading_id": 8901,
  "date": "2026-03-05",
  "measurement_point_id": 12,
  "measurement_point_name": "Tablero Eléctrico 1",
  "energy_subtype": "overconsumption",
  "energy_type": "EPpos",
  "readings": [
    {
      "id": 8901,
      "date": "Jueves, 5 de marzo",
      "time": "08:00",
      "EPpos_value": 1250.5,
      "EPneg_value": 0.0,
      "is_alert_reading": true
    },
    {
      "id": 8902,
      "date": "Jueves, 5 de marzo",
      "time": "08:05",
      "EPpos_value": 980.3,
      "EPneg_value": 0.0,
      "is_alert_reading": false
    }
  ]
}
```

**Nota:** `energy_type` se detecta automáticamente del campo `notes` de la alerta (`EPpos` o `EPneg`)

---

### 19. Reporte Excel de Alertas de Energía

**Endpoint:** `GET /api/v1/alerts/energy/energy-monitoring/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `date_after` | date | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | date | Fecha fin (`YYYY-MM-DD`) |
| `energy_subtype` | string | Subtipo de energía |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_alertas_energia.xlsx"`
- **Hojas Excel:** Energía Consumida, Energía Generada, Reactiva Inductiva, Reactiva Capacitiva
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Valor, Notas

---

### 20. Reporte Excel Última Alerta por Subtipo de Energía

**Endpoint:** `GET /api/v1/alerts/energy/energy-monitoring/latest-by-subtype/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `energy_subtype` | string | Subtipo de energía |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_ultima_alerta_energia.xlsx"`
- **Hojas Excel:** Energía Consumida, Energía Generada, Reactiva Inductiva, Reactiva Capacitiva
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Valor, Notas

---

## Harmonic Distortion Alerts

### 21. Tabla de Alertas de Distorsión Armónica

**Endpoint:** `GET /api/v1/alerts/energy/harmonic-distortion/`

**Permisos:** `IsAuthenticated`

**Query Parameters (Filtros):**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `device` | int | ID del dispositivo | - |
| `measurement_point` | int | ID del punto de medición | - |
| `harmonic_subtype` | string (multiple) | Subtipo de distorsión | `individual_distortion`, `total_distortion` |
| `phase_type` | string (multiple) | Tipo de fase | `A`, `B`, `C` |
| `status` | string (multiple) | Estado de la alerta | `new`, `acknowledged`, `resolved` |
| `alert_status` | string (multiple) | Severidad | `moderate`, `critical` |
| `date_after` | date | Fecha inicio | `YYYY-MM-DD` |
| `date_before` | date | Fecha fin | `YYYY-MM-DD` |
| `time_after` | time | Hora inicio | `HH:MM` |
| `time_before` | time | Hora fin | `HH:MM` |

**Paginación:** 5 elementos por página

**Respuesta JSON:**
```json
{
  "count": 42,
  "next": "http://api.example.com/api/v1/alerts/energy/harmonic-distortion/?page=2",
  "previous": null,
  "results": [
    {
      "id": 5678,
      "indicator_name": "Distorsión Armónica",
      "subindicator_name": "THD de Voltaje Fase A (THDUa)",
      "origin": "Distorsión Individual Excedida - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 5.0,
      "value": 6.8,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "new",
      "alert_status": "critical",
      "notes": null
    }
  ]
}
```

---

### 22. Última Alerta por Fase de Distorsión Armónica

**Endpoint:** `GET /api/v1/alerts/energy/harmonic-distortion/latest-by-phase/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción | Valores Posibles |
|-----------|------|-------------|------------------|
| `measurement_point` | int | ID del punto de medición | - |
| `harmonic_subtype` | string | Subtipo de distorsión | `individual_distortion`, `total_distortion` |
| `phase_type` | string | Tipo de fase | `A`, `B`, `C` |

**Respuesta JSON:**
```json
{
  "today_count": 8,
  "results": [
    {
      "id": 5678,
      "indicator_name": "Distorsión Armónica",
      "subindicator_name": "THD de Voltaje Fase A (THDUa)",
      "origin": "Distorsión Individual Excedida - Fase A",
      "date": "Jueves, 5 de Marzo de 2026",
      "time": "8:00 AM",
      "limit": 5.0,
      "value": 6.8,
      "device_id": 45,
      "device_name": "Medidor Principal",
      "measurement_point_id": 12,
      "measurement_point_name": "Tablero Eléctrico 1",
      "status": "new",
      "alert_status": "critical",
      "notes": null
    }
  ]
}
```

**Nota:** Retorna la última alerta por combinación (fase + subtipo de distorsión)

---

### 23. Detalle de Lecturas de Alerta de Distorsión Armónica

**Endpoint:** `GET /api/v1/alerts/{alert_id}/harmonic-distortion/readings/`

**Permisos:** `IsAuthenticated`

**Parámetros de Ruta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `alert_id` | int | ID de la alerta |

**Respuesta JSON:**
```json
{
  "alert_id": 5678,
  "alert_reading_id": 9012,
  "date": "2026-03-05",
  "measurement_point_id": 12,
  "measurement_point_name": "Tablero Eléctrico 1",
  "phase_type": "A",
  "harmonic_subtype": "individual_distortion",
  "threshold_individual": 5.0,
  "threshold_total": 8.0,
  "readings": [
    {
      "id": 9012,
      "date": "Jueves, 5 de marzo",
      "time": "08:00",
      "THDUa_value": 6.8,
      "THDUb_value": 4.2,
      "THDUc_value": 4.5,
      "is_alert_reading": true
    },
    {
      "id": 9013,
      "date": "Jueves, 5 de marzo",
      "time": "08:05",
      "THDUa_value": 4.9,
      "THDUb_value": 4.1,
      "THDUc_value": 4.3,
      "is_alert_reading": false
    }
  ]
}
```

**Nota:** Los umbrales `threshold_individual` y `threshold_total` se obtienen del perfil de configuración del punto de medición (valores por defecto: 5% y 8%)

---

### 24. Reporte Excel de Alertas de Distorsión Armónica

**Endpoint:** `GET /api/v1/alerts/energy/harmonic-distortion/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `date_after` | date | Fecha inicio (`YYYY-MM-DD`) |
| `date_before` | date | Fecha fin (`YYYY-MM-DD`) |
| `phase_type` | string | Tipo de fase |
| `harmonic_subtype` | string | Subtipo de distorsión |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_alertas_harmonica.xlsx"`
- **Hojas Excel:** Distorsión Individual, Distorsión Total
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Valor (%), Notas

---

### 25. Reporte Excel Última Alerta por Fase de Distorsión Armónica

**Endpoint:** `GET /api/v1/alerts/energy/harmonic-distortion/latest-by-phase/report/`

**Permisos:** `IsAuthenticated`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `measurement_point` | int | ID del punto de medición |
| `phase_type` | string | Tipo de fase |
| `harmonic_subtype` | string | Subtipo de distorsión |

**Respuesta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="reporte_ultima_alerta_harmonica.xlsx"`
- **Hojas Excel:** Distorsión Individual, Distorsión Total
- **Columnas:** Punto de Medición, Indicador, Sub Indicador, Origen, Fecha, Hora, Valor (%), Notas

---

## Notas Generales

### Autenticación
Todos los endpoints requieren el header `Authorization: Bearer <token>` con un token JWT válido.

### Filtros Múltiples
Los parámetros marcados como `(multiple)` aceptan múltiples valores usando el formato:
```
?status=new&status=acknowledged
?phase_type=A&phase_type=B&phase_type=C
```

### Rangos de Fecha y Hora
- **Fecha:** `?date_after=2026-01-01&date_before=2026-03-31`
- **Hora:** `?time_after=08:00&time_before=18:00`

### Paginación
Los endpoints de tabla retornan respuestas paginadas con la estructura:
```json
{
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

### Reportes Excel
Los endpoints de reporte retornan archivos Excel (.xlsx) como descarga directa. El navegador debe manejar el `Content-Disposition: attachment` para guardar el archivo.

### Estados de Alerta
- **status:** `new` (nueva), `acknowledged` (reconocida), `resolved` (resuelta)
- **alert_status:** `moderate` (moderada), `critical` (crítica)

---

**Total de endpoints documentados:** 25
