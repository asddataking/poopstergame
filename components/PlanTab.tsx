'use client'

import { useGameStore } from '@/lib/sim/state'
import { planRoute, getRouteStats } from '@/lib/sim/route'
import { HOUSE_TIERS } from '@/lib/constants'

interface PlanTabProps {
  onStartDay: () => void
  canStartDay: boolean
}

export default function PlanTab({ onStartDay, canStartDay }: PlanTabProps) {
  const {
    houses,
    selectedHouses,
    dailyCapacity,
    selectHouse,
    deselectHouse,
    autoPlanRoute,
  } = useGameStore()
  
  // Calculate route projection
  const routeProjection = selectedHouses.length > 0 ? 
    planRoute(houses, selectedHouses) : null
  
  const routeStats = routeProjection ? getRouteStats(routeProjection) : null
  
  // Sort houses by various criteria
  const sortedHouses = [...houses].sort((a, b) => {
    // First by selection status
    if (selectedHouses.includes(a.id) && !selectedHouses.includes(b.id)) return -1
    if (!selectedHouses.includes(a.id) && selectedHouses.includes(b.id)) return 1
    
    // Then by profit potential (base price * dirtiness)
    const aProfit = a.basePrice * (1 + a.dirtiness * 0.1)
    const bProfit = b.basePrice * (1 + b.dirtiness * 0.1)
    return bProfit - aProfit
  })
  
  const handleHouseToggle = (houseId: string) => {
    if (selectedHouses.includes(houseId)) {
      deselectHouse(houseId)
    } else if (selectedHouses.length < dailyCapacity) {
      selectHouse(houseId)
    }
  }
  
  const handleAutoPlan = () => {
    autoPlanRoute()
  }
  
  const getHouseStatus = (house: any) => {
    if (selectedHouses.includes(house.id)) {
      return 'selected'
    }
    if (selectedHouses.length >= dailyCapacity) {
      return 'disabled'
    }
    return 'available'
  }
  
  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 5) return 'text-green-600'
    if (satisfaction >= 2) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getSatisfactionText = (satisfaction: number) => {
    if (satisfaction >= 5) return 'Excellent'
    if (satisfaction >= 2) return 'Good'
    if (satisfaction >= 0) return 'Fair'
    return 'Poor'
  }
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Plan Your Route</h2>
        <div className="text-sm text-gray-600">
          {selectedHouses.length}/{dailyCapacity} houses selected
        </div>
      </div>
      
      {/* Auto-plan button */}
      <button
        onClick={handleAutoPlan}
        disabled={selectedHouses.length >= dailyCapacity}
        className="w-full game-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🚀 Auto-Plan Route
      </button>
      
      {/* Route Projection */}
      {routeStats && (
        <div className="game-card bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Route Projection</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Houses:</span>
              <span className="font-medium">{routeStats.houses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Revenue:</span>
              <span className="font-medium text-green-600">${routeStats.revenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Time:</span>
              <span className="font-medium">{routeStats.time}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Fuel:</span>
              <span className="font-medium text-red-600">${routeStats.fuel}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* House List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Available Houses</h3>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {sortedHouses.map(house => {
            const status = getHouseStatus(house)
            const isSelected = selectedHouses.includes(house.id)
            const profit = house.basePrice * (1 + house.dirtiness * 0.1)
            
            return (
              <div
                key={house.id}
                className={`game-card cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-primary-500 bg-primary-50' 
                    : 'hover:bg-gray-50'
                } ${
                  status === 'disabled' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleHouseToggle(house.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Selection checkbox */}
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-primary-500 border-primary-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    {/* House info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          HOUSE_TIERS[house.tier].color === '#4ade80' ? 'text-green-600' :
                          HOUSE_TIERS[house.tier].color === '#fbbf24' ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {HOUSE_TIERS[house.tier].name}
                        </span>
                        {house.isPremium && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            ⭐ Premium
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Dirtiness: {house.dirtiness}/5 • {house.frequency}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ${Math.round(profit)}
                    </div>
                    <div className={`text-xs ${getSatisfactionColor(house.satisfaction)}`}>
                      {getSatisfactionText(house.satisfaction)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Start Day Button */}
      <button
        onClick={onStartDay}
        disabled={!canStartDay}
        className="w-full game-button text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🚗 Start Day
      </button>
      
      {/* Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>💡 Select houses to create your daily route</div>
        <div>💡 Higher dirtiness = more revenue</div>
        <div>💡 Premium houses pay 50% more</div>
        <div>💡 Keep customers happy to avoid churn</div>
      </div>
    </div>
  )
}
