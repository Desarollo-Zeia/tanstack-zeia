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
GET /headquarter/{headquarter_id}/electrical_panel/{panel_id}/devices/measurement-points/list/?page=1&page_size=100
```

Returns a flat, paginated list of the measurement points of a panel, with their topology and the voltage bands used to draw reference lines in charts. Responds `404` if the user does not belong to the headquarter's company.

**Path params:**
- `headquarter_id` (number, required)
- `panel_id` (number, required)

**Query params:**
- `page` (number, optional) — default `1`
- `page_size` (number, optional) — backend default `10`. `fetchDeviceMeasurementPointsList` always sends `page=1&page_size=100` so panels with more than 10 points are not truncated in the selectors.

No other filters (no date range).

**Response:** `DeviceMeasurementPointsListResponse` (see `src/features/dashboard/types.ts`)

```typescript
type MonitoringTopology = 'mono_1f' | 'three_phase_3w' | 'three_phase_4w'

interface DeviceMeasurementPointsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    id: number
    name: string
    is_active: boolean
    channel: string
    type: string                    // 'monofasico' | 'trifasico' (does not distinguish 3W from 4W)
    key: string | null
    capacity: string                // e.g. '220v/220A'
    capacity_voltage: number | null // nominal voltage in V
    monitoring_topology: MonitoringTopology | null
    hardware: string
    device: string
    dev_eui: string
    electrical_panel: string
    location_reference: string
    installation_date: string | null
    thresholds?: {
      voltage?: VoltageThresholds | null
      current?: ThresholdRange | null
      power?: ThresholdRange | null
      energy?: ThresholdRange | null
    } | null
  }>
}

interface VoltageBand {
  lower_threshold: number
  upper_threshold: number
  nominal_voltage: number
}

// Top-level keys are legacy (direct nominal), kept for old clients
interface VoltageThresholds extends VoltageBand {
  phase: VoltageBand  // phase-to-neutral voltages
  line: VoltageBand   // line-to-line voltages
}

interface ThresholdRange {
  lower_threshold: number | null
  upper_threshold: number | null
  nominal_voltage?: number | null
}
```

> **Note:** values are absolute volts, not percentages. `thresholds` is `null` when the point has no resolvable nominal voltage (no `capacity_voltage` and no threshold profile with `nominal_voltage_v`): in that case no reference lines are drawn. The backend resolves the profile point → headquarter → company → default ±5%.

> **Note:** use `monitoring_topology` (not `type`) to know whether the point has phase and/or line voltages:
>
> | Topology | Phase (`Ua/Ub/Uc`, `U`) | Line (`Uab/Ubc/Uac`) |
> |---|---|---|
> | `three_phase_3w` | readings usually `null` | `line` = direct nominal |
> | `three_phase_4w` | `phase` = direct nominal | `line` = nominal × √3 |
> | `mono_1f` | `U` = direct nominal | not applicable |

> **Note:** the "Tendencia de Indicador" chart (`readings-graph.tsx`, `/energia/dashboard/home`) draws `lower_threshold`/`upper_threshold` as dashed horizontal lines. For the `voltage` category the band depends on the active indicator and is resolved by `getVoltageBand()` (`src/features/dashboard/lib/voltage-thresholds.ts`): `phase` for `Ua/Ub/Uc/U`, `line` for `Uab/Ubc/Uac` (none for line voltages on `mono_1f`), and no lines for other voltage indicators (`THDV*`, `Vfun*`, harmonics). The legacy top-level voltage keys are not used. Other categories (`current`, `power`, `energy`) still use `thresholds[category]`.

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

> **⚠️ DEPRECATED:** Reemplazado por `billing-calculate` (sección 14). La función `fetchRateConsumptionDateRange` está comentada en `rate-consumption-date-range.ts`.

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

## 12. Consumption Cycle Detail (Ciclo de Facturación)

```
GET /headquarter/{headquarter_id}/consumption-cycle/detail/
```

Returns billing cycle information for a headquarter's electrical panels.

**Path params:**
- `headquarter_id` (number, required)

**Response:** `ConsumptionCycleDetailResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface ConsumptionCycleDetailResponse {
  power_contracted: number
  electrical_panel_type: string
  electrical_panel_threads: number
  energy_provider: string | null
  supply_number: string | null
  billing_cycle_start: string | null  // null when the headquarter has no current billing cycle
  billing_cycle_end: string | null
  ratedays: number | null
  totalratedays: number | null
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

> **Note:** headquarters without a current billing cycle return `billing_cycle_start`, `billing_cycle_end`, `ratedays` and `totalratedays` as `null` (same as `water/consumption-cycle/detail`). `BillingCycleTable` must guard them: it shows "Sin ciclo vigente" and "—" instead of calling `formatDateShort(null)`, which throws.

---

## 13. Tariff PDFs (Facturas)

```
GET /headquarter/{headquarter_id}/tariff-pdfs/
```

Returns the list of available billing PDFs for a headquarter.

**Path params:**
- `headquarter_id` (number, required)

**Response:** `TariffPdfsResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface TariffPdf {
  id: number
  title: string
  pdf_url: string
}

interface TariffPdfsResponse {
  data: TariffPdf[]
}
```

---

## 14. Billing Calculate (Cálculo de Facturación)

```
GET /headquarter/{headquarter_id}/billing-calculate/?start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}
```

Returns the calculated billing breakdown (itemized charges) for a headquarter within a date range.

**Path params:**
- `headquarter_id` (number, required)

**Query params:**
- `start_date` (string, required) — format `YYYY-MM-DD`
- `end_date` (string, required) — format `YYYY-MM-DD`

**Response:** `BillingCalculateResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface BillingCalculateEnergyDetails {
  consumption: number
  unit: string
  rate: number
  rate_unit: string
}

interface BillingCalculatePowerDetails {
  max_power: number
  max_power_datetime: string
  rate: number
  rate_unit: string
}

interface BillingCalculateReactiveDetails {
  consumption: number
  active_energy_consumption: number
  threshold_percent: number
  excess_consumption: number
  unit: string
  rate: number
  rate_unit: string
}

type BillingCalculateDetails =
  | BillingCalculateEnergyDetails
  | BillingCalculatePowerDetails
  | BillingCalculateReactiveDetails

interface BillingCalculateItem {
  code: string
  name: string
  value: number
  currency: string
  details: BillingCalculateDetails | null
}

interface BillingCalculateResponse {
  headquarter_id: number
  start_date: string
  end_date: string
  results: BillingCalculateItem[]
  total_amount: number | null
  currency: string | null
  totals_by_currency: Record<string, number>
}
```

> **Note:** `details` is polymorphic — energy charges include `consumption`/`unit`, power charges include `max_power`/`max_power_datetime`, reactive energy charges (e.g. `energia_reactiva_inductiva`) include `active_energy_consumption`/`threshold_percent`/`excess_consumption`, and fixed charges (e.g. `cargo_fijo_mensual`) return `details: null`.
>
> **Note:** `total_amount`/`currency` are only populated when all charges share a single currency; they are `null` for mixed-currency responses. `totals_by_currency` always carries the per-currency totals (e.g. `{ "USD": 9520.7, "PEN": 1072.67 }`).

---

## 15. Billing Cycles (Ciclos de Facturación)

```
GET /headquarter/{headquarter_id}/billing-cycles/?billing_type=energy
```

Returns the billing cycles available for a headquarter. The cycle with `is_current: true` is the active one and drives the Detalle Tarifario table; the full list feeds the period selectors in Billing Comparison.

> **Note:** Since the water billing rollout, this endpoint returns both `energy` and `water` cycles unless filtered. The frontend always sends `?billing_type=energy` so the monthly view never mixes water cycles in.

**Path params:**
- `headquarter_id` (number, required)

**Query params:**
- `billing_type` (string, required by our client: `'energy'`) — filters cycles by billing type

**Response:** `BillingCyclesResponse` (see `src/features/dashboard/types.ts`)

```typescript
interface BillingCycleItem {
  id: number
  energy_headquarter: number
  name: string        // display label sent by the backend, e.g. "Octubre 2026"
  start_date: string  // format YYYY-MM-DD
  end_date: string    // format YYYY-MM-DD
  is_current: boolean
  billing_type: string  // 'energy' | 'water'
}

interface BillingCyclesResponse {
  count: number
  results: BillingCycleItem[]
}
```

> **Note:** `name` is the cycle's display label. The UI renders it through `getCycleLabel()` (`src/features/dashboard/lib/billing-format.ts`) in the period selectors, the monthly chart (the x-axis uses its first 3 letters), the breakdown and the hero. It is not derived from `start_date` because a cycle can start on the last day of the previous month (`start_date: "2026-09-30"` → `name: "Octubre 2026"`). If `name` is missing or empty, the UI falls back to the month of `start_date`.
