'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/lib/sim/state'
import { GAME_CONFIG, VISUAL_CONFIG } from '@/lib/constants'

interface RouteTabProps {
  onEndDay: () => void
  canEndDay: boolean
}

export default function RouteTab({ onEndDay, canEndDay }: RouteTabProps) {
  const {
    currentRoute,
    houses,
    timeLeft,
    isDayActive,
    weather,
  } = useGameStore()
  
  const [currentHouseIndex, setCurrentHouseIndex] = useState(0)
  const [isScooping, setIsScooping] = useState(false)
  const [scoopProgress, setScoopProgress] = useState(0)
  const [completedHouses, setCompletedHouses] = useState<string[]>([])
  
  // Get current house info
  const currentHouse = currentRoute && currentRoute.houses[currentHouseIndex] ? 
    houses.find(h => h.id === currentRoute.houses[currentHouseIndex]) : null
  
  // Auto-advance time
  useEffect(() => {
    if (!isDayActive) return
    
    const interval = setInterval(() => {
      useGameStore.setState(state => ({
        timeLeft: Math.max(0, state.timeLeft - 0.1)
      }))
    }, 1000) // Update every second
    
    return () => clearInterval(interval)
  }, [isDayActive])
  
  // Handle scooping a house
  const handleScoop = () => {
    if (!currentHouse || isScooping) return
    
    setIsScooping(true)
    setScoopProgress(0)
    
    // Simulate scooping progress
    const scoopTime = VISUAL_CONFIG.SCOOP_PROGRESS_TIME
    const interval = setInterval(() => {
      setScoopProgress(prev => {
        const newProgress = prev + (100 / (scoopTime / 50)) // Update every 50ms
        
        if (newProgress >= 100) {
          clearInterval(interval)
          completeScoop()
          return 100
        }
        
        return newProgress
      })
    }, 50)
  }
  
  const completeScoop = () => {
    if (!currentHouse) return
    
    // Add to completed houses
    setCompletedHouses(prev => [...prev, currentHouse.id])
    
    // Move to next house
    if (currentHouseIndex < (currentRoute?.houses.length || 0) - 1) {
      setCurrentHouseIndex(prev => prev + 1)
      setIsScooping(false)
      setScoopProgress(0)
    } else {
      // Route complete
      setIsScooping(false)
      setScoopProgress(0)
    }
  }
  
  // Calculate route progress
  const routeProgress = currentRoute ? 
    (completedHouses.length / currentRoute.houses.length) * 100 : 0
  
  // Get weather icon
  const getWeatherIcon = () => {
    switch (weather) {
      case 'rain': return '🌧️'
      case 'heat': return '🔥'
      default: return '☀️'
    }
  }
  
  if (!isDayActive || !currentRoute) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-2xl mb-2">🚗</div>
        <div>No active route</div>
        <div className="text-sm">Go to Plan tab to start your day</div>
      </div>
    )
  }
  
  return (
    <div className="p-4 space-y-4">
      {/* Route Status */}
      <div className="game-card bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-blue-800">Route Progress</h3>
          <div className="text-sm text-blue-600">
            {getWeatherIcon()} {weather}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${routeProgress}%` }}
          />
        </div>
        
        <div className="text-sm text-blue-700">
          {completedHouses.length} of {currentRoute.houses.length} houses completed
        </div>
      </div>
      
      {/* Current House */}
      {currentHouse && (
        <div className="game-card bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">Current House</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-green-700">Type:</span>
              <span className="font-medium">{currentHouse.tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Dirtiness:</span>
              <span className="font-medium">{currentHouse.dirtiness}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Revenue:</span>
              <span className="font-medium text-green-600">
                ${Math.round(currentHouse.basePrice * (1 + currentHouse.dirtiness * 0.1))}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Scoop Button */}
      {currentHouse && !completedHouses.includes(currentHouse.id) && (
        <div className="space-y-3">
          <button
            onClick={handleScoop}
            disabled={isScooping}
            className="w-full game-button text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScooping ? '🔄 Scooping...' : '💩 Scoop This House!'}
          </button>
          
          {/* Scoop Progress */}
          {isScooping && (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-500 h-3 rounded-full transition-all duration-100"
                style={{ width: `${scoopProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Route Queue */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Route Queue</h3>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {currentRoute.houses.map((houseId, index) => {
            const house = houses.find(h => h.id === houseId)
            if (!house) return null
            
            const isCompleted = completedHouses.includes(houseId)
            const isCurrent = index === currentHouseIndex
            
            return (
              <div
                key={houseId}
                className={`p-2 rounded-lg text-sm ${
                  isCompleted 
                    ? 'bg-green-100 text-green-800' 
                    : isCurrent 
                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {index + 1}. {house.tier} House
                  </span>
                  <span className="text-xs">
                    {isCompleted ? '✅' : isCurrent ? '🔄' : '⏳'}
                  </span>
                </div>
                {isCurrent && (
                  <div className="text-xs mt-1">
                    Dirtiness: {house.dirtiness}/5 • 
                    Revenue: ${Math.round(house.basePrice * (1 + house.dirtiness * 0.1))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Time and Actions */}
      <div className="game-card bg-yellow-50 border-yellow-200">
        <div className="flex items-center justify-between mb-3">
          <div className="text-yellow-800">
            <div className="text-sm">Time Remaining</div>
            <div className="text-xl font-bold">{timeLeft.toFixed(1)}h</div>
          </div>
          
          <div className="text-right text-yellow-700">
            <div className="text-sm">Route Status</div>
            <div className="text-lg font-semibold">
              {routeProgress.toFixed(0)}% Complete
            </div>
          </div>
        </div>
        
        {/* End Day Button */}
        <button
          onClick={onEndDay}
          disabled={!canEndDay}
          className="w-full game-button-secondary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🏁 End Day
        </button>
      </div>
      
      {/* Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>💡 Tap "Scoop" when you arrive at each house</div>
        <div>💡 Keep an eye on your time budget</div>
        <div>💡 Weather affects your efficiency</div>
        <div>💡 Complete all houses for maximum profit</div>
      </div>
    </div>
  )
}
