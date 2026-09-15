export interface Company {
  id: number
  name: string
  role: string
}

export interface EnergyModuleChild {
  name: string
  url: string | null
  icon: string
}

export interface EnergyModule {
  name: string
  url: string | null
  icon: string
  // El backend envía "energy" en los módulos de energía (igual que "water"
  // en los de agua). Opcional por compatibilidad con respuestas antiguas.
  monitoring_type?: 'energy' | string
  is_active: boolean
  children: EnergyModuleChild[]
}

export interface WaterModule {
  name: string
  url: string | null
  icon: string
  monitoring_type: 'water' | string
  is_active: boolean
  children: EnergyModuleChild[]
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  companies: Company[]
  is_user_energy_monitoring: boolean
  is_user_water_monitoring: boolean
  energy_modules: EnergyModule[]
  water_modules: WaterModule[]
  is_user_quality_air_auto: boolean
  is_user_thermal_comfort: boolean
}

export interface AuthResponse {
  token: string
  user: User
  // Flag por usuario que controla la visibilidad del botón de
  // Máxima Demanda Nacional. Opcional: ausente = sin acceso.
  maxdemand?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface OcupacionalAuthResponse {
  token: string
  first_name: string
  last_name: string
  email: string
  created_at: string
  registered_days: number
  user_id: number
}
