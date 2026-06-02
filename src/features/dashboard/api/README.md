# Dashboard API Endpoints

Base URL: `https://api.energy.zeia.com.pe/api/v1`

Authentication: `Authorization: Token {token}` header required for all endpoints.

---

## 1. List User Headquarters

```
GET /user/headquarters/
```

Returns all headquarters (sedes) accessible to the logged-in user, including their electrical panels.

**Response:** `HeadquartersResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface HeadquartersResponse {
  count: number
  results: Array<{
    id: number
    name: string
    is_active: boolean
    electrical_panels: Array<{
      id: number
      name: string
      is_active: boolean
      type: string
      threads: number
    }>
    powers: Array<{
      id: number
      power_installed: number | null
      power_contracted: number | null
      power_max: number | null
    }>
  }>
}
```

---

## 2. List Measurement Points by Headquarter

```
GET /headquarter/{headquarter_id}/measurement-points/
```

Returns all electrical panels, devices, and measurement points for a specific headquarter.

**Path params:**
- `headquarter_id` (number, required)

**Response:** `MeasurementPointsResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface MeasurementPointsResponse {
  count: number
  results: Array<{
    id: number
    name: string
    is_active: boolean
    type: string
    threads: number
    devices: Array<{
      id: number
      name: string
      dev_eui: string
      measurement_points: Array<{
        id: number
        name: string
        is_active: boolean
        channel: string
        type: string
        capacity: string
        hardware: string | null
      }>
    }>
  }>
}
```

---

## 3. List Device Measurement Points by Panel

```
GET /headquarter/{headquarter_id}/electrical_panel/{panel_id}/devices/measurement-points/list/?date_after={YYYY-MM-DD}&date_before={YYYY-MM-DD}
```

Returns a flat list of all measurement points (devices) for a specific panel and date range.

**Path params:**
- `headquarter_id` (number, required)
- `panel_id` (number, required)

**Query params:**
- `date_after` (string, required) — format `YYYY-MM-DD`
- `date_before` (string, required) — format `YYYY-MM-DD`

**Response:** `DeviceMeasurementPointsListResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface DeviceMeasurementPointsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    id: number
    name: string
    is_active: boolean
    channel: string
    type: string
    key: string
    capacity: string
    hardware: string
    device: string
    dev_eui: string
    electrical_panel: string
    location_reference: string
    installation_date: string | null
  }>
}
```

---

## 4. Consumption Distribution by Panel

```
GET /headquarter/{headquarter_id}/electrical_panel/{panel_id}/consumption-distribution/?date_after={YYYY-MM-DD}&date_before={YYYY-MM-DD}
```

Returns energy consumption breakdown by measurement point for a specific panel and date range.

**Path params:**
- `headquarter_id` (number, required)
- `panel_id` (number, required)

**Query params:**
- `date_after` (string, required) — format `YYYY-MM-DD`
- `date_before` (string, required) — format `YYYY-MM-DD`

**Response:** `ConsumptionDistributionResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface ConsumptionDistributionResponse {
  headquarter_id: number
  electrical_panel_id: number
  electrical_panel_name: string
  main_consumption_kwh: number
  total_measurement_points: number
  date_range: {
    type: string
    start_date: string
    end_date: string
  }
  results: Array<{
    measurement_point_id: number
    measurement_point_name: string
    device_name: string
    is_main: boolean
    consumption_kwh: number
    consumption_percentage: number
    capacity: string
    first_reading_value: number
    last_reading_value: number
    first_reading_time: string
    last_reading_time: string
  }>
}
```

---

## 5. Power Graph by Headquarter

```
GET /headquarter/{headquarter_id}/electrical_panel/powers/graph?date_after={YYYY-MM-DD}&date_before={YYYY-MM-DD}&group_by={hour|day}
```

Returns time-series power data for all measurement points in a headquarter.

**Path params:**
- `headquarter_id` (number, required)

**Query params:**
- `date_after` (string, required) — format `YYYY-MM-DD`
- `date_before` (string, required) — format `YYYY-MM-DD`
- `group_by` (string, optional) — `hour` (default) or `day`

**Response:** `PowerGraphResponse` (see `src/features/dashboard/types.ts`)

```typescript
type PowerGraphResponse = Array<{
  created_at: string
  device: string | null
  values_per_channel: Array<{
    measurement_point_name: string
    power: number
  }>
  unit: string
}>
```

---

## 6. Unbalanced Current Counters Graph

```
GET /headquarter/{headquarter_id}/electrical_panel/{panel_id}/measurement_point/{measurement_point_id}/unbalanced-current/counters-graph?date_after={YYYY-MM-DD}&date_before={YYYY-MM-DD}
```

Returns daily count of unbalanced current events for a specific measurement point.

**Path params:**
- `headquarter_id` (number, required)
- `panel_id` (number, required)
- `measurement_point_id` (number, required)

**Query params:**
- `date_after` (string, required) — format `YYYY-MM-DD`
- `date_before` (string, required) — format `YYYY-MM-DD`

**Response:** `UnbalancedCurrentCountersResponse` (see `src/features/dashboard/types.ts`)

```typescript
type UnbalancedCurrentCountersResponse = Array<{
  measurement_point: {
    measurement_point_id: number
    measurement_point_name: string
  }
  device: {
    device_id: number
    device_name: string
    dev_eui: string
  }
  date_range: {
    date_after: string
    date_before: string
  }
  results: Array<{
    date: string
    unbalanced_count: number
  }>
}>
```

---

## 7. Unbalanced Voltage Counters Graph

```
GET /headquarter/{headquarter_id}/electrical_panel/{panel_id}/measurement_point/{measurement_point_id}/unbalanced-voltage/counters-graph?date_after={YYYY-MM-DD}&date_before={YYYY-MM-DD}
```

Returns daily count of unbalanced voltage events for a specific measurement point.

**Path params:**
- `headquarter_id` (number, required)
- `panel_id` (number, required)
- `measurement_point_id` (number, required)

**Query params:**
- `date_after` (string, required) — format `YYYY-MM-DD`
- `date_before` (string, required) — format `YYYY-MM-DD`

**Response:** `UnbalancedCurrentCountersResponse` (same structure as endpoint #6)

---

## 8. Most Three Unbalanced Measurement Points

```
GET /headquarter/{headquarter_id}/electrical_panel/most-three-unbalanced?date_after={YYYY-MM-DD}&date_before={YYYY-MM-DD}
```

Returns the top 3 measurement points with the most unbalanced events for a headquarter.

**Path params:**
- `headquarter_id` (number, required)

**Query params:**
- `date_after` (string, required) — format `YYYY-MM-DD`
- `date_before` (string, required) — format `YYYY-MM-DD`

**Response:** `MostThreeUnbalancedResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface MostThreeUnbalancedResponse {
  date: string
  top_unbalanced_measurement_points: Array<{
    measurement_point_id: number
    measurement_point_name: string
    total_readings: number
    current_unbalanced: number
    voltage_unbalanced: number
    total_unbalanced: number
  }>
}
```

---

## 9. Readings Graph Especific (Comparador por Día)

```
GET /headquarter/{headquarter_id}/electrical_panel/{panel_id}/measurement_points/{measurement_point_id}/readings/graph-especific?date_after={YYYY-MM-DD}&date_before={YYYY-MM-DD}&indicador=EPpos&last_by=hour
```

Returns time-series readings data grouped by date for comparison across multiple days.

**Path params:**
- `headquarter_id` (number, required)
- `panel_id` (number, required)
- `measurement_point_id` (number, required)

**Query params:**
- `date_after` (string, required) — format `YYYY-MM-DD`
- `date_before` (string, required) — format `YYYY-MM-DD`
- `indicador` (string, hardcoded) — always `EPpos`
- `last_by` (string, hardcoded) — always `hour`

**Response:** `ReadingsGraphEspecificResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface ReadingsGraphEspecificEntry {
  time: string
  indicator: string
  unit: string
  value: number
  difference: number | null
  device: string
  measurement_point: string
  unit_cost: string
  value_cost: number
}

type ReadingsGraphEspecificResponse = Record<string, ReadingsGraphEspecificEntry[]>
```

---

## 10. Rate Consumption (Consumo Tarifario)

```
GET /headquarter/{headquarter_id}/electrical_panel/rate-consumption
```

Returns energy consumption and cost breakdown by rate type (peak/off-peak) for a headquarter.

**Path params:**
- `headquarter_id` (number, required)

**Response:** `RateConsumptionResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface RateConsumptionBreakdown {
  total: number
  peak: number
  off_peak: number
  unit: string
}

interface RateConsumptionResponse {
  consumption: RateConsumptionBreakdown
  cost: RateConsumptionBreakdown
  first_value: number
  last_value: number
  date_first_value: string
  date_last_value: string
}
```

---

## 11. Rate Consumption by Date Range (Comparador de Facturación)

```
GET /headquarter/{headquarter_id}/electrical_panel/rate-consumption/date-range?date_after={YYYY-MM-DD}&date_before={YYYY-MM-DD}
```

Returns energy consumption and cost breakdown for a specific date range within a headquarter.

**Path params:**
- `headquarter_id` (number, required)

**Query params:**
- `date_after` (string, required) — format `YYYY-MM-DD`
- `date_before` (string, required) — format `YYYY-MM-DD`

**Response:** `RateConsumptionDateRangeResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface RateConsumptionDateRange {
  start: string
  end: string
}

interface RateConsumptionDateRangeResponse {
  consumption: RateConsumptionBreakdown
  cost: RateConsumptionBreakdown
  first_value: number
  last_value: number
  date_first_value: string
  date_last_value: string
  date_range: RateConsumptionDateRange
}
```

---

## 12. Rate Consumption Cycle (Ciclo de Facturación)

```
GET /headquarter/{headquarter_id}/electrical_panel/rate-consumption/cycle
```

Returns billing cycle information for a headquarter's electrical panels.

**Path params:**
- `headquarter_id` (number, required)

**Response:** `RateConsumptionCycleResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface RateConsumptionCycleResponse {
  power_contracted: number
  electrical_panel_type: string
  electrical_panel_threads: number
  energy_provider: string | null
  supply_number: string | null
  billing_cycle_start: string
  billing_cycle_end: string
  ratedays: number
  totalratedays: number
  total_consumption: number
  unit_energy: string
  cost: number
  unit_cost: string
  first_value: number | null
  last_value: number | null
  date_first_value: string | null
  date_last_value: string | null
}
```
