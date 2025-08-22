import { GAME_CONFIG, UPGRADE_TYPES } from '@/lib/constants'
import type { House } from './state'
import { generateNewHouse } from './generateTown'

export interface DayResult {
  revenue: number
  expenses: number
  profit: number
  housesServiced: number
  housesMissed: number
  satisfactionChanges: Record<string, number>
  newEvents: string[]
  churnedHouses: string[]
  newLeads: House[]
}

// Advance to the next day and process all game logic
export function advanceDay(
  houses: House[],
  selectedHouses: string[],
  upgrades: Record<string, number>,
  weather: string,
  timeLeft: number
): DayResult {
  const result: DayResult = {
    revenue: 0,
    expenses: 0,
    profit: 0,
    housesServiced: 0,
    housesMissed: 0,
    satisfactionChanges: {},
    newEvents: [],
    churnedHouses: [],
    newLeads: [],
  }
  
  // Process each selected house
  selectedHouses.forEach(houseId => {
    const house = houses.find(h => h.id === houseId)
    if (!house) return
    
    // Check if house was serviced (in time)
    const wasServiced = timeLeft > 0
    
    if (wasServiced) {
      // Calculate revenue with upgrades
      let jobPrice = house.basePrice * (1 + house.dirtiness * 0.1)
      if (house.isPremium) jobPrice *= 1.5
      
      // Apply bag capacity upgrade
      const bagUpgrade = upgrades[UPGRADE_TYPES.BAG_CAPACITY] || 0
      const suppliesCost = GAME_CONFIG.SUPPLIES_COST_PER_JOB * 
        (1 - (bagUpgrade * 0.1))
      
      result.revenue += jobPrice
      result.expenses += suppliesCost
      result.housesServiced++
      
      // Update house satisfaction
      const satisfactionChange = GAME_CONFIG.SATISFACTION_SERVICED
      house.satisfaction += satisfactionChange
      result.satisfactionChanges[houseId] = satisfactionChange
      
      // Update last serviced date
      house.lastServiced = Date.now()
    } else {
      result.housesMissed++
      
      // Check if house is late (missed by more than 1 day)
      const daysSinceLastService = Math.floor((Date.now() - house.lastServiced) / (1000 * 60 * 60 * 24))
      const satisfactionChange = daysSinceLastService > 1 ? 
        GAME_CONFIG.SATISFACTION_LATE : 
        GAME_CONFIG.SATISFACTION_MISSED
      
      house.satisfaction += satisfactionChange
      result.satisfactionChanges[houseId] = satisfactionChange
    }
  })
  
  // Add fuel costs
  const fuelCost = GAME_CONFIG.FUEL_COST_PER_TILE * 
    (selectedHouses.length * 2) // Rough estimate
  result.expenses += fuelCost
  
  // Add worker wages
  if (upgrades[UPGRADE_TYPES.WORKER]) {
    result.expenses += GAME_CONFIG.WORKER_DAILY_WAGE
  }
  
  // Weather effects
  if (weather === 'rain') {
    result.expenses *= 1.2 // 20% more supplies needed
    result.newEvents.push('🌧️ Rainy day increased supply costs')
  } else if (weather === 'heat') {
    // Heat increases churn risk for missed houses
    result.newEvents.push('🔥 Heat wave - missed houses more likely to churn')
  }
  
  // Calculate profit
  result.profit = result.revenue - result.expenses
  
  // Process churn
  result.churnedHouses = processChurn(houses)
  
  // Generate new leads
  result.newLeads = generateLeads(houses, upgrades)
  
  // Generate random events
  const randomEvent = generateRandomEvent()
  if (randomEvent) {
    result.newEvents.push(randomEvent)
  }
  
  return result
}

// Process house churn based on satisfaction
function processChurn(houses: House[]): string[] {
  const churnedHouses: string[] = []
  
  houses.forEach(house => {
    if (house.satisfaction < GAME_CONFIG.CHURN_THRESHOLD) {
      churnedHouses.push(house.id)
    }
  })
  
  return churnedHouses
}

// Generate new leads based on marketing level
function generateLeads(houses: House[], upgrades: Record<string, number>): House[] {
  const marketingLevel = upgrades[UPGRADE_TYPES.MARKETING] || 0
  const leadChance = GAME_CONFIG.BASE_LEAD_CHANCE + 
    (marketingLevel * GAME_CONFIG.MARKETING_LEAD_BONUS)
  
  const newLeads: House[] = []
  
  if (Math.random() < leadChance && houses.length < 50) {
    const newHouse = generateNewHouse(houses)
    if (newHouse) {
      newLeads.push(newHouse)
    }
  }
  
  return newLeads
}

// Generate random events
function generateRandomEvent(): string | null {
  const events = [
    '🚧 Road construction added 5 minutes to route',
    '🎉 Customer left a generous tip!',
    '🐕 Friendly dog slowed down service',
    '📱 GPS malfunction caused minor delay',
    '☕ Coffee break boosted efficiency',
    '🚗 Traffic jam increased fuel costs',
    '🌱 Customer upgraded to premium service',
    '📦 Supplies on sale - saved money today',
  ]
  
  // 15% chance of random event
  if (Math.random() < 0.15) {
    return events[Math.floor(Math.random() * events.length)]
  }
  
  return null
}

// Calculate weekly summary
export function calculateWeeklySummary(
  dailyResults: DayResult[],
  startDay: number
): {
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  averageSatisfaction: number
  customerRetention: number
  efficiency: number
} {
  if (dailyResults.length === 0) {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      averageSatisfaction: 0,
      customerRetention: 0,
      efficiency: 0,
    }
  }
  
  const totalRevenue = dailyResults.reduce((sum, day) => sum + day.revenue, 0)
  const totalExpenses = dailyResults.reduce((sum, day) => sum + day.expenses, 0)
  const totalProfit = totalRevenue - totalExpenses
  
  const totalHouses = dailyResults.reduce((sum, day) => 
    sum + day.housesServiced + day.housesMissed, 0)
  const efficiency = totalHouses > 0 ? 
    dailyResults.reduce((sum, day) => sum + day.housesServiced, 0) / totalHouses : 0
  
  return {
    totalRevenue,
    totalExpenses,
    totalProfit,
    averageSatisfaction: 0, // Would need to track this separately
    customerRetention: 0, // Would need to track this separately
    efficiency,
  }
}

// Check for milestone achievements
export function checkMilestones(profit: number): number[] {
  return GAME_CONFIG.PROFIT_MILESTONES.filter(milestone => profit >= milestone)
}

// Generate weather for the day
export function generateWeather(): 'clear' | 'rain' | 'heat' {
  const rand = Math.random()
  
  if (rand < 0.7) return 'clear'
  if (rand < 0.85) return 'rain'
  return 'heat'
}

// Apply weather effects to route
export function applyWeatherEffects(
  baseTime: number,
  baseFuel: number,
  weather: string
): { time: number; fuel: number } {
  let time = baseTime
  let fuel = baseFuel
  
  switch (weather) {
    case 'rain':
      time *= GAME_CONFIG.WEATHER_RAIN_TIME_MULTIPLIER
      fuel *= 1.1 // 10% more fuel in rain
      break
    case 'heat':
      fuel *= 1.05 // 5% more fuel in heat (AC usage)
      break
  }
  
  return { time, fuel }
}
