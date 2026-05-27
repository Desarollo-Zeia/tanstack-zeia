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
