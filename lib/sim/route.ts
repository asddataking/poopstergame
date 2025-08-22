import type { House } from './state'
import { GAME_CONFIG, VISUAL_CONFIG } from '@/lib/constants'

export interface RoutePoint {
  houseId: string
  x: number
  y: number
  estimatedTime: number
  estimatedRevenue: number
}

export interface OptimizedRoute {
  points: RoutePoint[]
  totalDistance: number
  totalTime: number
  totalRevenue: number
  totalFuel: number
}

// Calculate distance between two points
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// Nearest neighbor algorithm for route planning
export function planRoute(houses: House[], selectedHouseIds: string[]): OptimizedRoute {
  if (selectedHouseIds.length === 0) {
    return {
      points: [],
      totalDistance: 0,
      totalTime: 0,
      totalRevenue: 0,
      totalFuel: 0,
    }
  }
  
  // Get selected houses
  const selectedHouses = houses.filter(house => selectedHouseIds.includes(house.id))
  
  // Start from the first house
  const route: RoutePoint[] = []
  const unvisited = [...selectedHouses]
  let currentX = 0
  let currentY = 0
  let totalDistance = 0
  
  // Find starting point (closest to origin or center)
  const centerX = 10 // Approximate center of 20x12 grid
  const centerY = 6
  
  let startHouse = unvisited[0]
  let minDistance = calculateDistance(centerX, centerY, startHouse.x, startHouse.y)
  
  for (const house of unvisited) {
    const distance = calculateDistance(centerX, centerY, house.x, house.y)
    if (distance < minDistance) {
      minDistance = distance
      startHouse = house
    }
  }
  
  // Remove starting house from unvisited
  const startIndex = unvisited.findIndex(h => h.id === startHouse.id)
  unvisited.splice(startIndex, 1)
  
  // Add starting point
  route.push({
    houseId: startHouse.id,
    x: startHouse.x,
    y: startHouse.y,
    estimatedTime: 0,
    estimatedRevenue: startHouse.basePrice * (1 + startHouse.dirtiness * 0.1),
  })
  
  currentX = startHouse.x
  currentY = startHouse.y
  
  // Build route using nearest neighbor
  while (unvisited.length > 0) {
    let nearestHouse = unvisited[0]
    let minDistance = calculateDistance(currentX, currentY, nearestHouse.x, nearestHouse.y)
    
    for (const house of unvisited) {
      const distance = calculateDistance(currentX, currentY, house.x, house.y)
      if (distance < minDistance) {
        minDistance = distance
        nearestHouse = house
      }
    }
    
    // Add to route
    route.push({
      houseId: nearestHouse.id,
      x: nearestHouse.x,
      y: nearestHouse.y,
      estimatedTime: 0,
      estimatedRevenue: nearestHouse.basePrice * (1 + nearestHouse.dirtiness * 0.1),
    })
    
    totalDistance += minDistance
    currentX = nearestHouse.x
    currentY = nearestHouse.y
    
    // Remove from unvisited
    const index = unvisited.findIndex(h => h.id === nearestHouse.id)
    unvisited.splice(index, 1)
  }
  
  // Calculate time estimates and apply upgrades
  let totalTime = 0
  let totalRevenue = 0
  
  for (let i = 0; i < route.length; i++) {
    const point = route[i]
    
    // Calculate drive time to this point
    let driveTime = 0
    if (i > 0) {
      const prevPoint = route[i - 1]
      const distance = calculateDistance(prevPoint.x, prevPoint.y, point.x, point.y)
      driveTime = distance * GAME_CONFIG.TILE_DRIVE_TIME
    }
    
    // Scoop time (will be modified by upgrades in the main game logic)
    const scoopTime = GAME_CONFIG.BASE_SCOOP_TIME
    
    point.estimatedTime = driveTime + scoopTime
    totalTime += point.estimatedTime
    totalRevenue += point.estimatedRevenue
  }
  
  // Apply route planner upgrade improvements
  const routeImprovement = 1 - GAME_CONFIG.AUTO_ROUTE_IMPROVEMENT
  totalDistance *= routeImprovement
  totalTime *= routeImprovement
  
  // Calculate fuel cost
  const totalFuel = totalDistance * GAME_CONFIG.FUEL_COST_PER_TILE
  
  return {
    points: route,
    totalDistance,
    totalTime,
    totalRevenue,
    totalFuel,
  }
}

// Simple 2-opt improvement for route optimization
export function improveRoute(route: OptimizedRoute): OptimizedRoute {
  const { points } = route
  if (points.length < 4) return route
  
  let improved = true
  let bestDistance = route.totalDistance
  
  while (improved) {
    improved = false
    
    for (let i = 1; i < points.length - 2; i++) {
      for (let j = i + 1; j < points.length - 1; j++) {
        // Try swapping segments
        const newPoints = [...points]
        const segment = newPoints.splice(i, j - i + 1)
        newPoints.splice(i, 0, ...segment.reverse())
        
        // Calculate new distance
        let newDistance = 0
        for (let k = 1; k < newPoints.length; k++) {
          newDistance += calculateDistance(
            newPoints[k-1].x, newPoints[k-1].y,
            newPoints[k].x, newPoints[k].y
          )
        }
        
        if (newDistance < bestDistance) {
          bestDistance = newDistance
          route.points = newPoints
          route.totalDistance = newDistance
          improved = true
          break
        }
      }
      if (improved) break
    }
  }
  
  return route
}

// Get route visualization data for Kaboom
export function getRouteVisualization(route: OptimizedRoute): Array<{x: number, y: number}> {
  const path: Array<{x: number, y: number}> = []
  
  for (const point of route.points) {
    path.push({ x: point.x, y: point.y })
  }
  
  return path
}

// Check if a route is valid (within time budget)
export function isRouteValid(route: OptimizedRoute, timeBudget: number): boolean {
  return route.totalTime <= timeBudget
}

// Get route statistics for display
export function getRouteStats(route: OptimizedRoute) {
  return {
    houses: route.points.length,
    distance: Math.round(route.totalDistance * 10) / 10,
    time: Math.round(route.totalTime * 10) / 10,
    revenue: Math.round(route.totalRevenue),
    fuel: Math.round(route.totalFuel),
  }
}
