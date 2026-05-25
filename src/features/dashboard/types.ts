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
