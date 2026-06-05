export interface AccountDetail {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string | null
  gender: string | null
  photo: string | null
  created_at: string
  modified_at: string
  age: number | null
  birthday: string | null
  dni: string | null
  enterprise: number
  headquarter: number
  admission_date: string | null
  departure_date: string | null
  is_enabled: boolean
  name_enterprise: string
}

export interface Headquarter {
  id: number
  name: string
}

export interface HeadquartersResponse {
  count: number
  next: string | null
  previous: string | null
  results: Headquarter[]
}

export interface RoomDevice {
  id: number
  dev_eui: string
  type_sensor: string
}

export interface Room {
  id: number
  name: string
  status: string
  headquarter: {
    id: number
    name: string
  }
  devices: RoomDevice[]
  report_link: string | null
  is_activated: boolean
  has_reports: boolean
  co2_monitoring_time: number
}

export interface RoomsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Room[]
}

export interface IndicatorReading {
  room_id: number
  date: string
  hour: string
  indicator: string
  unit: string
  value: number
  status: string
}

export interface RoomThresholds {
  co2?: {
    good: number
    moderate: number
    unhealthy: number
    dangerous: number
  }
  temperature?: {
    min: number
    max: number
  }
  humidity?: {
    min: number
    max: number
  }
}

export interface LastHighestReading {
  indicator: string
  unit: string
  value: number
  date: string
  hour: string
}

export interface RoomIndicatorData {
  room_id: number
  room_name: string
  thresholds: RoomThresholds
  last_highest_reading: LastHighestReading
  readings: IndicatorReading[]
}

export type IndicatorGraphResponse = RoomIndicatorData[]

// Room Detail (for indicators page)
export interface RoomIndicatorActivated {
  indicator: string
  unit: string
}

export interface RoomThresholdLevel {
  level: string
  value: number
}

export interface RoomThresholdConfig {
  unit: string
  levels: RoomThresholdLevel[]
}

export type RoomThresholdMap = Record<string, RoomThresholdConfig>

export interface RoomDetail {
  id: number
  name: string
  status: string
  headquarter: {
    id: number
    name: string
  }
  devices: RoomDevice[]
  indicators_activated: RoomIndicatorActivated[]
  indicators_pollutants: RoomIndicatorActivated[]
  is_activated: boolean
  thresholds: RoomThresholdMap
  thresholds_filter: Record<string, string[]>
}

// Room Readings (paginated)
export interface RoomReading {
  indicator: string
  value: string
  unit: string
  status: string
  hours: string
  date: string
}

export interface RoomReadingsResponse {
  count: number
  next: string | null
  previous: string | null
  results: RoomReading[]
}

// Peak History (Picos Históricos)
export interface PeakHistoryReading {
  created_at: string
  indicator: string
  unit: string
  status: string
  value: number
  date: string
  hour: string
}

export interface PeakHistoryThresholds {
  co2?: Record<string, number>
  temperature?: { min: number; max: number }
  humidity?: { min: number; max: number }
}

export interface PeakHistoryRoom {
  room_id: number
  room_name: string
  thresholds: PeakHistoryThresholds
  readings_highest: PeakHistoryReading
  readings_lowest: PeakHistoryReading
}

export interface PeakHistoryResponse {
  count: number
  next: string | null
  previous: string | null
  results: PeakHistoryRoom[]
}

// Room Indicator Graph by Date (single room, multi-date)
export interface DateReading {
  hour: string
  indicator: string
  unit: string
  value: number
  status: string
}

export type RoomIndicatorGraphResponse = Record<string, DateReading[]>

export type ViewMode = 'by-room' | 'by-date'
