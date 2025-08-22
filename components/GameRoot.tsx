'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/lib/sim/state'
import { generateTown, generateSampleCustomers } from '@/lib/sim/generateTown'
import { planRoute } from '@/lib/sim/route'
import { generateWeather } from '@/lib/sim/dayCycle'
import ThreeJSMap from './ThreeJSMap'
import PlanTab from './PlanTab'
import RouteTab from './RouteTab'
import UpgradesTab from './UpgradesTab'
import ReportsTab from './ReportsTab'
import SettingsPanel from './SettingsPanel'
import NotificationSystem from './NotificationSystem'
import EndDayModal from './EndDayModal'

type TabType = 'plan' | 'route' | 'upgrades' | 'reports' | 'settings'

export default function GameRoot() {
  const [activeTab, setActiveTab] = useState<TabType>('plan')
  const [showEndDayModal, setShowEndDayModal] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  
  const {
    day,
    cash,
    timeLeft,
    isDayActive,
    houses,
    selectedHouses,
    dailyCapacity,
    startDay,
    endDay,
    resetGame,
    customers,
  } = useGameStore()
  
  // Initialize town on first load
  useEffect(() => {
    if (houses.length === 0) {
      const initialHouses = generateTown()
      useGameStore.setState({ houses: initialHouses })
    }
  }, [houses.length])
  
  // Initialize customers on first load
  useEffect(() => {
    if (customers.length === 0) {
      const initialCustomers = generateSampleCustomers()
      useGameStore.setState({ customers: initialCustomers })
    }
  }, [customers.length])
  
  // Generate weather for new days
  useEffect(() => {
    if (day > 1 && !isDayActive) {
      const weather = generateWeather()
      useGameStore.setState({ weather })
    }
  }, [day, isDayActive])
  
  const handleStartDay = () => {
    if (selectedHouses.length === 0) return
    
    startDay()
    setActiveTab('route')
  }
  
  const handleEndDay = () => {
    endDay()
    setShowEndDayModal(true)
    setActiveTab('plan')
  }
  
  const handleResetGame = () => {
    if (confirm('Are you sure you want to reset your game? This cannot be undone.')) {
      resetGame()
      const initialHouses = generateTown()
      useGameStore.setState({ houses: initialHouses })
    }
  }
  
  // Calculate route projections
  const routeProjection = selectedHouses.length > 0 ? 
    planRoute(houses, selectedHouses) : null
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HUD */}
      <div className="bg-white shadow-lg border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-game text-primary-600">Poopster</h1>
            <div className="text-sm text-gray-600">
              Day {day}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                ${cash.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Cash</div>
            </div>
            
            {isDayActive && (
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {Math.max(0, timeLeft).toFixed(1)}h
                </div>
                <div className="text-xs text-gray-500">Time Left</div>
              </div>
            )}
            
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600">
                {selectedHouses.length}/{dailyCapacity}
              </div>
              <div className="text-xs text-gray-500">Route</div>
            </div>
            
            {/* Notification System */}
            <NotificationSystem />
          </div>
        </div>
        
        {/* Route Projection */}
        {routeProjection && !isDayActive && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-800">Route Preview:</span>
              <div className="flex space-x-4 text-blue-700">
                <span>Revenue: ${routeProjection.totalRevenue}</span>
                <span>Time: {routeProjection.totalTime.toFixed(1)}h</span>
                <span>Fuel: ${Math.round(routeProjection.totalFuel)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Game Area - Full Screen 3D Map */}
      <div className="flex-1 relative">
        <ThreeJSMap />
        
        {/* Floating Action Button to show dashboard */}
        <button
          onClick={() => setShowDashboard(true)}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-10"
        >
          📋 Show Dashboard
        </button>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleResetGame}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Reset Game
          </button>
          
          <div className="text-xs text-gray-400">
            Poopster v1.0 - Build your poop empire!
          </div>
        </div>
      </div>
      
      {/* End Day Modal */}
      {showEndDayModal && (
        <EndDayModal
          onClose={() => setShowEndDayModal(false)}
        />
      )}

      {/* Dashboard Modal */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Game Dashboard</h2>
                <button
                  onClick={() => setShowDashboard(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 bg-gray-50 mb-6">
                {([
                  { id: 'plan', name: 'Plan', icon: '📋' },
                  { id: 'route', name: 'Route', icon: '🗺️' },
                  { id: 'upgrades', name: 'Upgrades', icon: '⚡' },
                  { id: 'reports', name: 'Reports', icon: '📊' },
                  { id: 'settings', name: 'Settings', icon: '⚙️' },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'plan' && (
                  <PlanTab
                    onStartDay={handleStartDay}
                    canStartDay={selectedHouses.length > 0 && !isDayActive}
                  />
                )}
                {activeTab === 'route' && (
                  <RouteTab
                    onEndDay={handleEndDay}
                    canEndDay={isDayActive}
                  />
                )}
                {activeTab === 'upgrades' && <UpgradesTab />}
                {activeTab === 'reports' && <ReportsTab />}
                {activeTab === 'settings' && <SettingsPanel />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
