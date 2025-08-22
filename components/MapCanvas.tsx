'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/lib/sim/state'
import { getRoadPositions } from '@/lib/sim/generateTown'
import { planRoute, getRouteVisualization } from '@/lib/sim/route'
import { TOWN_CONFIG, VISUAL_CONFIG, HOUSE_TIERS } from '@/lib/constants'

let kaboomInstance: any = null

export default function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const {
    houses,
    selectedHouses,
    isDayActive,
    currentRoute,
    timeLeft,
    weather,
  } = useGameStore()
  
  // Initialize Kaboom
  useEffect(() => {
    if (!canvasRef.current || isInitialized) return
    
    const initKaboom = async () => {
      try {
        const kaboom = (await import('kaboom')).default
        
        console.log('Initializing Kaboom with canvas:', canvasRef.current)
        
        kaboomInstance = kaboom({
          canvas: canvasRef.current!,
          width: TOWN_CONFIG.GRID_WIDTH * VISUAL_CONFIG.TILE_SIZE,
          height: TOWN_CONFIG.GRID_HEIGHT * VISUAL_CONFIG.TILE_SIZE,
          background: [0.95, 0.95, 0.95],
          global: false,
        })
        
        console.log('Kaboom instance created:', kaboomInstance)
        
        // Skip sprite loading - using colored rectangles instead
        console.log('Using colored rectangles instead of sprites')
        
        // Create scene
        kaboomInstance.scene('game', () => {
          // Background grid
          for (let x = 0; x < TOWN_CONFIG.GRID_WIDTH; x++) {
            for (let y = 0; y < TOWN_CONFIG.GRID_HEIGHT; y++) {
              kaboomInstance.add([
                kaboomInstance.rect(VISUAL_CONFIG.TILE_SIZE, VISUAL_CONFIG.TILE_SIZE),
                kaboomInstance.pos(x * VISUAL_CONFIG.TILE_SIZE, y * VISUAL_CONFIG.TILE_SIZE),
                kaboomInstance.outline(1, [0.9, 0.9, 0.9]),
                kaboomInstance.color(0.98, 0.98, 0.98),
              ])
            }
          }
          
          // Roads
          const roadPositions = getRoadPositions()
          roadPositions.forEach(({ x, y }) => {
            kaboomInstance.add([
              kaboomInstance.rect(VISUAL_CONFIG.TILE_SIZE, VISUAL_CONFIG.TILE_SIZE),
              kaboomInstance.pos(x * VISUAL_CONFIG.TILE_SIZE, y * VISUAL_CONFIG.TILE_SIZE),
              kaboomInstance.color(0.3, 0.3, 0.3),
            ])
          })
          
          // Houses
          houses.forEach(house => {
            const spriteName = `house_${house.tier.toLowerCase()}`
            const isSelected = selectedHouses.includes(house.id)
            
            // Use colored rectangles instead of sprites
            const houseColor = house.tier === 'LARGE' ? [0.8, 0.4, 0.2] : 
                              house.tier === 'MEDIUM' ? [0.9, 0.7, 0.3] : 
                              [0.6, 0.8, 0.4]
            
            const houseObj = kaboomInstance.add([
              kaboomInstance.rect(VISUAL_CONFIG.TILE_SIZE - 4, VISUAL_CONFIG.TILE_SIZE - 4),
              kaboomInstance.pos(
                house.x * VISUAL_CONFIG.TILE_SIZE + 2,
                house.y * VISUAL_CONFIG.TILE_SIZE + 2
              ),
              kaboomInstance.color(...houseColor),
              kaboomInstance.origin('topleft'),
              {
                id: house.id,
                tier: house.tier,
                isSelected,
                satisfaction: house.satisfaction,
                isPremium: house.isPremium,
              }
            ])
            
            // Add selection indicator
            if (isSelected) {
              kaboomInstance.add([
                kaboomInstance.circle(6),
                kaboomInstance.pos(
                  house.x * VISUAL_CONFIG.TILE_SIZE + VISUAL_CONFIG.TILE_SIZE / 2,
                  house.y * VISUAL_CONFIG.TILE_SIZE - 5
                ),
                kaboomInstance.color(0, 1, 0),
                kaboomInstance.origin('center'),
              ])
            }
            
            // Add satisfaction indicator
            const satisfactionColor = house.satisfaction >= 5 ? [0, 1, 0] : 
                                   house.satisfaction >= 2 ? [1, 1, 0] : [1, 0, 0]
            
            kaboomInstance.add([
              kaboomInstance.rect(20, 4),
              kaboomInstance.pos(
                house.x * VISUAL_CONFIG.TILE_SIZE + 6,
                house.y * VISUAL_CONFIG.TILE_SIZE + VISUAL_CONFIG.TILE_SIZE - 8
              ),
              kaboomInstance.color(...satisfactionColor),
              kaboomInstance.origin('topleft'),
            ])
            
            // Premium indicator
            if (house.isPremium) {
              kaboomInstance.add([
                kaboomInstance.text('⭐'),
                kaboomInstance.pos(
                  house.x * VISUAL_CONFIG.TILE_SIZE + VISUAL_CONFIG.TILE_SIZE - 8,
                  house.y * VISUAL_CONFIG.TILE_SIZE + 2
                ),
                kaboomInstance.scale(0.8),
                kaboomInstance.origin('topleft'),
              ])
            }
            
            // Add click handler
            houseObj.onClick(() => {
              // Handle house selection in the main game logic
              console.log('House clicked:', house.id)
            })
          })
          
          // Van (only show during route) - use colored rectangle instead of sprite
          if (isDayActive && currentRoute) {
            const van = kaboomInstance.add([
              kaboomInstance.rect(24, 16),
              kaboomInstance.pos(0, 0),
              kaboomInstance.color(0.2, 0.4, 0.8),
              kaboomInstance.origin('center'),
              'van',
            ])
            
            // Animate van along route
            animateVan(van, currentRoute)
          }
          
          // Weather effects
          if (weather === 'rain') {
            // Add rain particles
            for (let i = 0; i < 50; i++) {
              kaboomInstance.add([
                kaboomInstance.rect(1, 3),
                kaboomInstance.pos(
                  Math.random() * kaboomInstance.width(),
                  Math.random() * kaboomInstance.height()
                ),
                kaboomInstance.color(0.5, 0.7, 1),
                kaboomInstance.move(0, 100),
                kaboomInstance.lifespan(2),
              ])
            }
          }
        })
        
        kaboomInstance.go('game')
        setIsInitialized(true)
        
      } catch (error) {
        console.error('Failed to initialize Kaboom:', error)
        console.error('Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })
        // Fallback to simple canvas rendering
        try {
          renderFallbackCanvas()
          setIsInitialized(true) // Mark as initialized even with fallback
        } catch (fallbackError) {
          console.error('Fallback canvas also failed:', fallbackError)
        }
      }
    }
    
    initKaboom()
    
    return () => {
      if (kaboomInstance) {
        kaboomInstance.destroyAll()
        kaboomInstance = null
      }
    }
  }, [])
  
  // Update scene when game state changes
  useEffect(() => {
    if (!kaboomInstance || !isInitialized) return
    
    // Update house selections
    houses.forEach(house => {
      const houseObj = kaboomInstance.get('house')[0]
      if (houseObj && houseObj.id === house.id) {
        houseObj.isSelected = selectedHouses.includes(house.id)
        // Update visual indicators
        updateHouseVisuals(houseObj, house)
      }
    })
    
    // Update van position if route is active
    if (isDayActive && currentRoute) {
      const van = kaboomInstance.get('van')[0]
      if (van) {
        animateVan(van, currentRoute)
      }
    }
    
  }, [houses, selectedHouses, isDayActive, currentRoute, isInitialized])
  
  // Animate van along route
  const animateVan = (van: any, route: any) => {
    if (!route.houses || route.houses.length === 0) return
    
    const routePoints = getRouteVisualization(route)
    let currentPointIndex = 0
    
    const moveToNextPoint = () => {
      if (currentPointIndex >= routePoints.length) return
      
      const point = routePoints[currentPointIndex]
      const targetX = point.x * VISUAL_CONFIG.TILE_SIZE + VISUAL_CONFIG.TILE_SIZE / 2
      const targetY = point.y * VISUAL_CONFIG.TILE_SIZE + VISUAL_CONFIG.TILE_SIZE / 2
      
      van.moveTo(targetX, targetY, VISUAL_CONFIG.VAN_SPEED * 32)
      
      van.onStateEnter('idle', () => {
        currentPointIndex++
        if (currentPointIndex < routePoints.length) {
          moveToNextPoint()
        }
      })
    }
    
    moveToNextPoint()
  }
  
  // Update house visual indicators
  const updateHouseVisuals = (houseObj: any, house: any) => {
    // Update satisfaction bar color
    const satisfactionColor = house.satisfaction >= 5 ? [0, 1, 0] : 
                           house.satisfaction >= 2 ? [1, 1, 0] : [1, 0, 0]
    
    // Update selection indicator
    if (house.isSelected) {
      // Add or update selection pin
    }
  }
  
  // Fallback canvas rendering
  const renderFallbackCanvas = () => {
    if (!canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    const canvas = canvasRef.current
    canvas.width = TOWN_CONFIG.GRID_WIDTH * VISUAL_CONFIG.TILE_SIZE
    canvas.height = TOWN_CONFIG.GRID_HEIGHT * VISUAL_CONFIG.TILE_SIZE
    
    // Draw grid
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw roads
    ctx.fillStyle = '#4a5568'
    const roadPositions = getRoadPositions()
    roadPositions.forEach(({ x, y }) => {
      ctx.fillRect(
        x * VISUAL_CONFIG.TILE_SIZE,
        y * VISUAL_CONFIG.TILE_SIZE,
        VISUAL_CONFIG.TILE_SIZE,
        VISUAL_CONFIG.TILE_SIZE
      )
    })
    
    // Draw houses
    houses.forEach(house => {
      const x = house.x * VISUAL_CONFIG.TILE_SIZE
      const y = house.y * VISUAL_CONFIG.TILE_SIZE
      const size = VISUAL_CONFIG.TILE_SIZE * 0.8
      
      // House color based on tier
      const colors = {
        SMALL: '#4ade80',
        MEDIUM: '#fbbf24',
        LARGE: '#f97316',
      }
      
      ctx.fillStyle = colors[house.tier]
      ctx.fillRect(x + 4, y + 4, size, size)
      
      // Selection indicator
      if (selectedHouses.includes(house.id)) {
        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = 3
        ctx.strokeRect(x + 2, y + 2, size + 4, size + 4)
      }
      
      // Satisfaction bar
      const satisfactionColor = house.satisfaction >= 5 ? '#22c55e' : 
                             house.satisfaction >= 2 ? '#eab308' : '#ef4444'
      ctx.fillStyle = satisfactionColor
      ctx.fillRect(x + 6, y + size - 8, 20, 4)
    })
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <canvas 
        ref={canvasRef}
        className="border border-gray-300 rounded-lg overflow-hidden"
        style={{
          width: TOWN_CONFIG.GRID_WIDTH * VISUAL_CONFIG.TILE_SIZE,
          height: TOWN_CONFIG.GRID_HEIGHT * VISUAL_CONFIG.TILE_SIZE,
        }}
      />
      
      {/* Loading indicator */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Loading game...</div>
          </div>
        </div>
      )}
    </div>
  )
}
