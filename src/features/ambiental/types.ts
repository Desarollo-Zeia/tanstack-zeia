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
