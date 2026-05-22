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
  measurement_point_id: number
  measurement_point_name: string
  device_name: string
  is_main: boolean
  is_active: boolean
  consumption_kwh: number
  consumption_percentage: number
  channel: string
  type: string
  capacity: string
  hardware: string
  first_reading_value: number
  last_reading_value: number
  first_reading_time: string
  last_reading_time: string
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
