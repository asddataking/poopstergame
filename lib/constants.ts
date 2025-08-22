// Game Configuration Constants
export const GAME_CONFIG = {
  // Time settings
  DAY_TIME_BUDGET: 8, // hours
  TILE_DRIVE_TIME: 0.1, // hours per tile
  BASE_SCOOP_TIME: 0.2, // hours per house
  
  // Economy
  STARTING_CASH: 1000,
  FUEL_COST_PER_TILE: 2,
  SUPPLIES_COST_PER_JOB: 5,
  WORKER_DAILY_WAGE: 50,
  
  // Satisfaction & Churn
  SATISFACTION_SERVICED: 2,
  SATISFACTION_MISSED: -4,
  SATISFACTION_LATE: -1,
  CHURN_THRESHOLD: 0,
  
  // Route planning
  AUTO_ROUTE_IMPROVEMENT: 0.15, // 15% distance savings
  
  // Events
  WEATHER_RAIN_TIME_MULTIPLIER: 1.2,
  WEATHER_HEAT_CHURN_RISK: 0.1,
  DETOUR_EXTRA_TILES: 10,
  
  // Progression
  PROFIT_MILESTONES: [1000, 5000, 15000, 50000, 100000],
  
  // Marketing
  BASE_LEAD_CHANCE: 0.1, // 10% per week
  MARKETING_LEAD_BONUS: 0.05, // 5% per level
  PREMIUM_UPGRADE_CHANCE: 0.3, // 30% chance to upgrade tier
} as const

// House Tiers
export const HOUSE_TIERS = {
  SMALL: {
    name: 'Small House',
    basePrice: 25,
    maxDirtiness: 3,
    frequency: 'weekly' as const,
    color: '#4ade80',
    size: 1,
  },
  MEDIUM: {
    name: 'Medium House',
    basePrice: 45,
    maxDirtiness: 4,
    frequency: 'weekly' as const,
    color: '#fbbf24',
    size: 1.2,
  },
  LARGE: {
    name: 'Large House',
    basePrice: 75,
    maxDirtiness: 5,
    frequency: 'biweekly' as const,
    color: '#f97316',
    size: 1.5,
  },
} as const

// Upgrade Types
export const UPGRADE_TYPES = {
  BAG_CAPACITY: 'bag_capacity',
  WALKING_SPEED: 'walking_speed',
  VAN_SPEED: 'van_speed',
  ROUTE_PLANNER: 'route_planner',
  MARKETING: 'marketing',
  WORKER: 'worker',
  PREMIUM_ADDON: 'premium_addon',
} as const

// Upgrade Definitions
export const UPGRADES = {
  [UPGRADE_TYPES.BAG_CAPACITY]: {
    name: 'Bag Capacity',
    description: 'Reduces supplies cost per job',
    baseCost: 500,
    costMultiplier: 1.5,
    maxLevel: 5,
    effect: (level: number) => Math.max(0.5, 1 - level * 0.1), // 50% reduction at max
    effectDescription: (level: number) => `Supplies cost: ${Math.round((1 - Math.max(0.5, 1 - level * 0.1)) * 100)}% off`,
  },
  [UPGRADE_TYPES.WALKING_SPEED]: {
    name: 'Walking Speed',
    description: 'Reduces time spent at each house',
    baseCost: 300,
    costMultiplier: 1.4,
    maxLevel: 5,
    effect: (level: number) => Math.max(0.5, 1 - level * 0.1), // 50% reduction at max
    effectDescription: (level: number) => `Scoop time: ${Math.round((1 - Math.max(0.5, 1 - level * 0.1)) * 100)}% faster`,
  },
  [UPGRADE_TYPES.VAN_SPEED]: {
    name: 'Van Speed',
    description: 'Reduces driving time between houses',
    baseCost: 400,
    costMultiplier: 1.6,
    maxLevel: 5,
    effect: (level: number) => Math.max(0.6, 1 - level * 0.08), // 40% reduction at max
    effectDescription: (level: number) => `Drive time: ${Math.round((1 - Math.max(0.6, 1 - level * 0.08)) * 100)}% faster`,
  },
  [UPGRADE_TYPES.ROUTE_PLANNER]: {
    name: 'Route Planner+',
    description: 'Better route optimization',
    baseCost: 800,
    costMultiplier: 2.0,
    maxLevel: 3,
    effect: (level: number) => 1 - (level * 0.05), // 15% distance savings at max
    effectDescription: (level: number) => `Route distance: ${Math.round(level * 5)}% shorter`,
  },
  [UPGRADE_TYPES.MARKETING]: {
    name: 'Marketing',
    description: 'Increases chance of new leads',
    baseCost: 600,
    costMultiplier: 1.8,
    maxLevel: 5,
    effect: (level: number) => level * 0.05, // 25% bonus at max
    effectDescription: (level: number) => `Lead chance: +${Math.round(level * 5)}%`,
  },
  [UPGRADE_TYPES.WORKER]: {
    name: 'Hire Worker',
    description: 'Doubles daily capacity',
    baseCost: 2000,
    costMultiplier: 1.0, // One-time purchase
    maxLevel: 1,
    effect: (level: number) => level * 2, // 2x capacity
    effectDescription: (level: number) => `Daily capacity: ${level * 2}x`,
  },
  [UPGRADE_TYPES.PREMIUM_ADDON]: {
    name: 'Premium Add-on',
    description: 'Some houses upgrade to higher pricing',
    baseCost: 1500,
    costMultiplier: 1.0, // One-time purchase
    maxLevel: 1,
    effect: (level: number) => level * 0.3, // 30% upgrade chance
    effectDescription: (level: number) => `Upgrade chance: ${level * 30}%`,
  },
} as const

// Town Generation
export const TOWN_CONFIG = {
  GRID_WIDTH: 20,
  GRID_HEIGHT: 12,
  ROAD_WIDTH: 2,
  LOT_SIZE: 3,
  STARTING_HOUSES: 20,
  MAX_HOUSES: 50,
} as const

// Visual Settings
export const VISUAL_CONFIG = {
  TILE_SIZE: 32,
  ANIMATION_SPEED: 0.3,
  VAN_SPEED: 2, // tiles per second
  SCOOP_PROGRESS_TIME: 2000, // ms
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  GAME_STATE: 'poopster_game_state',
  SETTINGS: 'poopster_settings',
} as const
