export interface WaterPipe {
  id: number
  name: string
  is_active: boolean
  is_main: boolean
}

export interface WaterHeadquarter {
  id: number
  name: string
  is_active: boolean
  water_pipes: WaterPipe[]
}

export interface WaterHeadquartersResponse {
  count: number
  results: WaterHeadquarter[]
}

export interface WaterMeasurementPoint {
  id: number
  name: string
  is_active: boolean
  is_main: boolean
  water_pipe: string
}

export interface WaterMeasurementPointsResponse {
  count: number
  next: string | null
  previous: string | null
  results: WaterMeasurementPoint[]
}

export interface WaterConsumptionSummary {
  water_pipe_id: number
  water_pipe_name: string
  today_consumption_litros: number
  month_consumption_litros: number
  month_average_daily_litros: number
  date_range: {
    today: string
    month_start: string
    month_end: string
  }
}

export interface WaterDistributionResult {
  measurement_point_water_id: number | null
  measurement_point_water_name: string
  dev_eui: string | null
  is_main: boolean
  is_active: boolean
  consumption_litros: number
  consumption_percentage: number
  first_reading_value: number | null
  last_reading_value: number | null
  first_reading_time: string | null
  last_reading_time: string | null
  is_highest: boolean
}

export interface WaterDistributionResponse {
  water_pipe_id: number
  water_pipe_name: string
  main_consumption_litros: number
  total_measurement_points: number
  date_range: {
    type: string
    start_date: string
    end_date: string
  }
  results: WaterDistributionResult[]
}

export interface WaterReadingGraphPoint {
  period: string
  first_reading: string
  last_reading: string
  indicator: string
  unit: string
  first_value: number
  last_value: number
  difference: number | null
  measurement_point: string
}

export type WaterReadingsGraphResponse = WaterReadingGraphPoint[]

export interface WaterDayComparisonEntry {
  time: string
  indicator: string
  unit: string
  value: number
  is_average: boolean
  device: string
  measurement_point: string
  sample_count?: number
}

export type WaterDayComparisonItem = Record<string, WaterDayComparisonEntry[]>

export type WaterDayComparisonResponse = WaterDayComparisonItem[]

export interface WaterReadingIndicators {
  id: number
  measurement_point_name: string
  values: Record<string, number>
}

export interface WaterReading {
  created_at: string
  indicators: WaterReadingIndicators
}

export interface WaterReadingsResponse {
  count: number
  next: string | null
  previous: string | null
  results: WaterReading[]
}

// Water Billing (Tarifario de Agua)
export interface WaterBillingPermission {
  id: number
  code: string
  name: string
  billing_type: string
  is_active: boolean
}

export interface WaterBillingConcept {
  id: number
  billing_permission: WaterBillingPermission
  currency: string
  rate: number | null
  is_active: boolean
  created_at: string
  modified_at: string
}

export interface WaterBillingConceptsResponse {
  count: number
  next: string | null
  previous: string | null
  results: WaterBillingConcept[]
}

export interface WaterBillingCalculateDetails {
  consumption: number
  unit: string
  rate: number
  rate_unit: string
  // Solo alcantarillado: factor de descarga y volumen facturable
  factor?: number
  billed_volume?: number
}

export interface WaterBillingCalculateItem {
  code: string
  name: string
  value: number
  currency: string
  // null cuando el concepto no tiene tarifa configurada (value = 0.0)
  details: WaterBillingCalculateDetails | null
}

export interface WaterBillingCalculateResponse {
  headquarter_id: number
  start_date: string
  end_date: string
  results: WaterBillingCalculateItem[]
  // null cuando los conceptos activos mezclan monedas
  total_amount: number | null
  currency: string | null
  totals_by_currency: Record<string, number>
}

export interface WaterBillingCycleItem {
  id: number
  energy_headquarter: number
  start_date: string
  end_date: string
  is_current: boolean
  billing_type: string
}

export interface WaterBillingCyclesResponse {
  count: number
  results: WaterBillingCycleItem[]
}

export interface WaterCyclePipe {
  id: number
  name: string
  is_main: boolean
  measurement_points: number
}

export interface WaterConsumptionCycleDetail {
  water_discharge_factor: number | null
  billing_cycle_start: string | null
  billing_cycle_end: string | null
  ratedays: number | null
  totalratedays: number | null
  water_pipes: WaterCyclePipe[]
}
