// Headquarters
export interface ElectricalPanel {
  id: number
  name: string
  is_active: boolean
  type: string
  threads: number
}

export interface Headquarter {
  id: number
  name: string
  is_active: boolean
  electrical_panels: ElectricalPanel[]
  powers?: Array<{
    id: number
    power_installed: number | null
    power_contracted: number | null
    power_max: number | null
  }>
}

export interface HeadquartersResponse {
  count: number
  results: Headquarter[]
}

// Measurement Points
export interface MeasurementPoint {
  id: number
  name: string
  is_active: boolean
  channel: string
  type: string
  key: string
  capacity: string
  hardware: string | null
  location_reference: string
  installation_date: string | null
}

export interface Device {
  id: number
  name: string
  dev_eui: string
  measurement_points: MeasurementPoint[]
}

export interface PanelWithDevices {
  id: number
  name: string
  is_active: boolean
  type: string
  threads: number
  devices: Device[]
}

export interface MeasurementPointsResponse {
  count: number
  results: PanelWithDevices[]
}

// Device Measurement Points List
export interface DeviceMeasurementPoint {
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
}

export interface DeviceMeasurementPointsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: DeviceMeasurementPoint[]
}

// Consumption Distribution
export interface DateRange {
  type: string
  start_date: string
  end_date: string
}

export interface ConsumptionResult {
  measurement_point_id: number | null
  measurement_point_name: string
  device_name: string | null
  is_main: boolean
  is_active: boolean
  is_other_loads?: boolean
  description?: string
  consumption_kwh: number
  consumption_percentage: number
  channel: string | null
  type: string | null
  capacity: string | null
  hardware: string | null
  first_reading_value: number | null
  last_reading_value: number | null
  first_reading_time: string | null
  last_reading_time: string | null
}

export interface ConsumptionDistributionResponse {
  headquarter_id: number
  electrical_panel_id: number
  electrical_panel_name: string
  main_consumption_kwh: number
  total_measurement_points: number
  date_range: DateRange
  results: ConsumptionResult[]
}

// Readings
export interface ReadingDevice {
  id: number
  name: string
  model: string
  dev_eui: string
}

export interface ReadingIndicators {
  id: number
  values: Record<string, number>
  measurement_point_name: string
}

export interface Reading {
  created_at: string
  device: ReadingDevice
  indicators: ReadingIndicators
}

export interface ReadingsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Reading[]
}

// Readings Graph
export interface ReadingGraphPoint {
  period: string
  first_reading: string
  last_reading: string
  indicator: string
  unit: string
  first_value: number
  last_value: number
  difference: number | null
  device: string
  measurement_point: string
}

// Readings Graph endpoint returns a plain array, not a wrapped response
export type ReadingsGraphResponse = ReadingGraphPoint[]

// Power Graph
export interface PowerChannelValue {
  measurement_point_name: string
  power: number
}

export interface PowerGraphPoint {
  created_at: string
  device: string | null
  values_per_channel: PowerChannelValue[]
  unit: string
}

export interface PowerThresholds {
  power_max: number | null
  power_contracted: number | null
  power_installed: number | null
}

export interface PowerGraphResponse {
  power_thresholds: PowerThresholds
  results: PowerGraphPoint[]
}

// Unbalanced Current Counters Graph
export interface UnbalancedCurrentCounter {
  date: string
  unbalanced_count: number
}

export interface UnbalancedCurrentCountersItem {
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
  results: UnbalancedCurrentCounter[]
}

export type UnbalancedCurrentCountersResponse = UnbalancedCurrentCountersItem[]

// Most Three Unbalanced Measurement Points
export interface TopUnbalancedMeasurementPoint {
  measurement_point_id: number
  measurement_point_name: string
  total_readings: number
  current_unbalanced: number
  voltage_unbalanced: number
  total_unbalanced: number
}

export interface MostThreeUnbalancedResponse {
  date: string
  top_unbalanced_measurement_points: TopUnbalancedMeasurementPoint[]
}

// Readings Graph Especific (Comparador por Día)
export interface ReadingsGraphEspecificEntry {
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

export type ReadingsGraphEspecificData = Record<string, ReadingsGraphEspecificEntry[]>
export type ReadingsGraphEspecificResponse = ReadingsGraphEspecificData[]

// Alerts (latest by subtype)
export interface AlertItem {
  id: number
  indicator_name: string
  subindicator_name: string
  origin: string
  date: string
  time: string
  limit: number
  value: number
  device_id: number
  device_name: string
  measurement_point_id: number
  measurement_point_name: string
  status: string
  alert_status: string
  notes: string
}

export interface AlertsLatestBySubtypeResponse {
  today_count: number
  results: AlertItem[]
}

export interface AlertsHistoryResponse {
  count: number
  next: string | null
  previous: string | null
  results: AlertItem[]
}
