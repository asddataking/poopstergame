'use client'

import { useGameStore } from '@/lib/sim/state'
import { UPGRADES, UPGRADE_TYPES } from '@/lib/constants'

export default function UpgradesTab() {
  const {
    cash,
    upgrades,
    purchaseUpgrade,
  } = useGameStore()
  
  const handlePurchase = (upgradeType: string) => {
    purchaseUpgrade(upgradeType)
  }
  
  const getUpgradeCost = (upgradeType: string) => {
    const upgrade = UPGRADES[upgradeType as keyof typeof UPGRADES]
    if (!upgrade) return 0
    
    const currentLevel = upgrades[upgradeType] || 0
    return Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel))
  }
  
  const canAfford = (upgradeType: string) => {
    return cash >= getUpgradeCost(upgradeType)
  }
  
  const isMaxLevel = (upgradeType: string) => {
    const upgrade = UPGRADES[upgradeType as keyof typeof UPGRADES]
    if (!upgrade) return true
    
    const currentLevel = upgrades[upgradeType] || 0
    return currentLevel >= upgrade.maxLevel
  }
  
  const getUpgradeStatus = (upgradeType: string) => {
    if (isMaxLevel(upgradeType)) return 'maxed'
    if (canAfford(upgradeType)) return 'available'
    return 'unaffordable'
  }
  
  const getUpgradeIcon = (upgradeType: string) => {
    const icons: Record<string, string> = {
      [UPGRADE_TYPES.BAG_CAPACITY]: '👜',
      [UPGRADE_TYPES.WALKING_SPEED]: '🚶',
      [UPGRADE_TYPES.VAN_SPEED]: '🚐',
      [UPGRADE_TYPES.ROUTE_PLANNER]: '🗺️',
      [UPGRADE_TYPES.MARKETING]: '📢',
      [UPGRADE_TYPES.WORKER]: '👷',
      [UPGRADE_TYPES.PREMIUM_ADDON]: '⭐',
    }
    return icons[upgradeType] || '🔧'
  }
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Upgrades & Improvements</h2>
        <div className="text-sm text-gray-600">
          ${cash.toLocaleString()} available
        </div>
      </div>
      
      {/* Upgrades Grid */}
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(UPGRADES).map(([upgradeType, upgrade]) => {
          const currentLevel = upgrades[upgradeType] || 0
          const cost = getUpgradeCost(upgradeType)
          const status = getUpgradeStatus(upgradeType)
          
          return (
            <div
              key={upgradeType}
              className={`game-card transition-all ${
                status === 'maxed' 
                  ? 'bg-green-50 border-green-200' 
                  : status === 'available'
                  ? 'hover:shadow-lg'
                  : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getUpgradeIcon(upgradeType)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{upgrade.name}</h3>
                      <div className="text-xs text-gray-500">
                        Level {currentLevel}/{upgrade.maxLevel}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {upgrade.description}
                  </p>
                  
                  {/* Current Effect */}
                  {currentLevel > 0 && (
                    <div className="text-sm text-green-700 mb-2">
                      {upgrade.effectDescription(currentLevel)}
                    </div>
                  )}
                  
                  {/* Next Level Effect */}
                  {currentLevel < upgrade.maxLevel && (
                    <div className="text-sm text-blue-700">
                      Next level: {upgrade.effectDescription(currentLevel + 1)}
                    </div>
                  )}
                </div>
                
                {/* Purchase Button */}
                <div className="text-right ml-4">
                  {status === 'maxed' ? (
                    <div className="text-green-600 font-semibold text-sm">
                      MAXED OUT
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-gray-800 mb-2">
                        ${cost.toLocaleString()}
                      </div>
                      <button
                        onClick={() => handlePurchase(upgradeType)}
                        disabled={status === 'unaffordable'}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          status === 'available'
                            ? 'bg-primary-500 hover:bg-primary-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {status === 'available' ? 'Purchase' : 'Not Enough Cash'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              {upgrade.maxLevel > 1 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{currentLevel}/{upgrade.maxLevel}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentLevel / upgrade.maxLevel) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Upgrade Strategy Tips */}
      <div className="game-card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Upgrade Strategy</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div>• Start with Bag Capacity to reduce costs</div>
          <div>• Van Speed improves route efficiency</div>
          <div>• Marketing brings in new customers</div>
          <div>• Workers double your daily capacity</div>
          <div>• Premium Add-on increases high-tier revenue</div>
        </div>
      </div>
      
      {/* Current Stats */}
      <div className="game-card bg-gray-50 border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Current Upgrades</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(UPGRADES).map(([upgradeType, upgrade]) => {
            const currentLevel = upgrades[upgradeType] || 0
            if (currentLevel === 0) return null
            
            return (
              <div key={upgradeType} className="flex justify-between">
                <span className="text-gray-600">{upgrade.name}:</span>
                <span className="font-medium">Level {currentLevel}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
