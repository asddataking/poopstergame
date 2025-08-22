import { HOUSE_TIERS, TOWN_CONFIG } from '@/lib/constants'
import type { House } from './state'
import type { Customer } from './state'

// Generate a procedural town with roads and house lots
export function generateTown(): House[] {
  const houses: House[] = []
  const { GRID_WIDTH, GRID_HEIGHT, ROAD_WIDTH, LOT_SIZE, STARTING_HOUSES } = TOWN_CONFIG
  
  // Create road network (simple grid pattern)
  const roadPositions = new Set<string>()
  
  // Horizontal roads
  for (let y = ROAD_WIDTH; y < GRID_HEIGHT; y += LOT_SIZE + ROAD_WIDTH) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      roadPositions.add(`${x},${y}`)
    }
  }
  
  // Vertical roads
  for (let x = ROAD_WIDTH; x < GRID_WIDTH; x += LOT_SIZE + ROAD_WIDTH) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      roadPositions.add(`${x},${y}`)
    }
  }
  
  // Generate house lots (avoiding roads)
  const availableLots: Array<{x: number, y: number}> = []
  
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      // Check if this position is a road
      let isRoad = false
      for (let dy = 0; dy < ROAD_WIDTH; dy++) {
        for (let dx = 0; dx < ROAD_WIDTH; dx++) {
          if (roadPositions.has(`${x + dx},${y + dy}`)) {
            isRoad = true
            break
          }
        }
        if (isRoad) break
      }
      
      // Check if this position is within a lot
      let isInLot = false
      for (let dy = 0; dy < LOT_SIZE; dy++) {
        for (let dx = 0; dx < LOT_SIZE; dx++) {
          if (roadPositions.has(`${x + dx},${y + dy}`)) {
            isInLot = true
            break
          }
        }
        if (isInLot) break
      }
      
      // If not road and not in lot, it's a potential lot center
      if (!isRoad && !isInLot && 
          x + LOT_SIZE/2 < GRID_WIDTH && 
          y + LOT_SIZE/2 < GRID_HEIGHT) {
        availableLots.push({
          x: Math.floor(x + LOT_SIZE/2),
          y: Math.floor(y + LOT_SIZE/2)
        })
      }
    }
  }
  
  // Shuffle available lots
  const shuffledLots = availableLots.sort(() => Math.random() - 0.5)
  
  // Place houses
  for (let i = 0; i < Math.min(STARTING_HOUSES, shuffledLots.length); i++) {
    const lot = shuffledLots[i]
    const house = generateHouse(lot.x, lot.y, i)
    houses.push(house)
  }
  
  return houses
}

// Generate sample customers for the CustomerManagement component
export function generateSampleCustomers(): Customer[] {
  const customerNames = [
    'Smith Family', 'Johnson Residence', 'Williams Home', 'Brown House',
    'Davis Family', 'Miller Residence', 'Wilson Home', 'Moore House',
    'Taylor Family', 'Anderson Residence', 'Thomas Home', 'Jackson House',
    'White Family', 'Harris Residence', 'Martin Home', 'Thompson House',
    'Garcia Family', 'Martinez Residence', 'Robinson Home', 'Clark House'
  ]
  
  const streetNames = [
    'Oak Street', 'Maple Avenue', 'Pine Road', 'Elm Street',
    'Cedar Lane', 'Birch Drive', 'Willow Way', 'Cherry Street',
    'Magnolia Avenue', 'Sycamore Road', 'Poplar Street', 'Hickory Lane',
    'Walnut Drive', 'Chestnut Way', 'Ash Street', 'Beech Avenue',
    'Spruce Road', 'Fir Street', 'Hemlock Lane', 'Cypress Drive'
  ]
  
  const customers: Customer[] = []
  
  for (let i = 0; i < Math.min(20, customerNames.length); i++) {
    const tier = Math.random() < 0.3 ? 'LARGE' : Math.random() < 0.5 ? 'MEDIUM' : 'SMALL'
    const satisfaction = Math.floor(Math.random() * 40) + 60 // 60-100%
    const status = Math.random() < 0.8 ? 'active' : Math.random() < 0.5 ? 'pending' : 'overdue'
    
    // Generate random dates
    const today = new Date()
    const lastService = new Date(today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    const nextService = new Date(today.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000)
    
    customers.push({
      id: `customer_${i}`,
      name: customerNames[i],
      address: `${Math.floor(Math.random() * 9999) + 1} ${streetNames[i]}`,
      tier,
      lastService: lastService.toISOString(),
      nextService: nextService.toISOString(),
      satisfaction,
      status: status as 'active' | 'pending' | 'overdue' | 'churned',
      notes: Math.random() < 0.3 ? 'Special attention to garden area' : '',
    })
  }
  
  return customers
}

// Generate a single house with random properties
function generateHouse(x: number, y: number, index: number): House {
  // Determine tier based on position (center = higher tier)
  const centerX = TOWN_CONFIG.GRID_WIDTH / 2
  const centerY = TOWN_CONFIG.GRID_HEIGHT / 2
  const distanceFromCenter = Math.sqrt(
    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
  )
  
  let tier: keyof typeof HOUSE_TIERS
  if (distanceFromCenter < 3) {
    tier = 'LARGE'
  } else if (distanceFromCenter < 6) {
    tier = 'MEDIUM'
  } else {
    tier = 'SMALL'
  }
  
  // Random dirtiness (1-5 for large, 1-4 for medium, 1-3 for small)
  const maxDirtiness = HOUSE_TIERS[tier].maxDirtiness
  const dirtiness = Math.floor(Math.random() * maxDirtiness) + 1
  
  // Random frequency (70% weekly, 30% biweekly)
  const frequency = Math.random() < 0.7 ? 'weekly' : 'biweekly'
  
  // Random satisfaction (start positive)
  const satisfaction = Math.floor(Math.random() * 3) + 2
  
  // Premium status (10% chance for medium/large houses)
  const isPremium = (tier === 'MEDIUM' || tier === 'LARGE') && Math.random() < 0.1
  
  return {
    id: `house_${index}`,
    x,
    y,
    tier,
    basePrice: HOUSE_TIERS[tier].basePrice,
    dirtiness,
    frequency,
    lastServiced: 0, // Never serviced
    satisfaction,
    isPremium,
  }
}

// Generate a new house for leads
export function generateNewHouse(existingHouses: House[]): House | null {
  const { GRID_WIDTH, GRID_HEIGHT, ROAD_WIDTH, LOT_SIZE, MAX_HOUSES } = TOWN_CONFIG
  
  if (existingHouses.length >= MAX_HOUSES) return null
  
  // Find available lots (avoiding existing houses)
  const occupiedPositions = new Set<string>()
  existingHouses.forEach(house => {
    occupiedPositions.add(`${house.x},${house.y}`)
  })
  
  const availableLots: Array<{x: number, y: number}> = []
  
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      // Check if position is available
      let isAvailable = true
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (occupiedPositions.has(`${x + dx},${y + dy}`)) {
            isAvailable = false
            break
          }
        }
        if (!isAvailable) break
      }
      
      if (isAvailable) {
        availableLots.push({ x, y })
      }
    }
  }
  
  if (availableLots.length === 0) return null
  
  // Pick random lot
  const lot = availableLots[Math.floor(Math.random() * availableLots.length)]
  
  // Generate house with slightly different logic for leads
  const house = generateHouse(lot.x, lot.y, existingHouses.length)
  
  // Leads start with lower satisfaction
  house.satisfaction = Math.floor(Math.random() * 2) + 1
  
  return house
}

// Check if a position is on a road
export function isRoadPosition(x: number, y: number): boolean {
  const { ROAD_WIDTH, LOT_SIZE } = TOWN_CONFIG
  
  // Check horizontal roads
  if (y % (LOT_SIZE + ROAD_WIDTH) < ROAD_WIDTH) return true
  
  // Check vertical roads
  if (x % (LOT_SIZE + ROAD_WIDTH) < ROAD_WIDTH) return true
  
  return false
}

// Get road positions for rendering
export function getRoadPositions(): Array<{x: number, y: number}> {
  const { GRID_WIDTH, GRID_HEIGHT, ROAD_WIDTH, LOT_SIZE } = TOWN_CONFIG
  const roadPositions: Array<{x: number, y: number}> = []
  
  // Horizontal roads
  for (let y = ROAD_WIDTH; y < GRID_HEIGHT; y += LOT_SIZE + ROAD_WIDTH) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      roadPositions.push({ x, y })
    }
  }
  
  // Vertical roads
  for (let x = ROAD_WIDTH; x < GRID_WIDTH; x += LOT_SIZE + ROAD_WIDTH) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      roadPositions.push({ x, y })
    }
  }
  
  return roadPositions
}
