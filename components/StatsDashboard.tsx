'use client'

import { useGameStore } from '@/lib/sim/state'
import { useState } from 'react'

export default function StatsDashboard() {
  const {
    cash,
    dailyEarnings,
    totalCustomers,
    customerSatisfaction,
    dayNumber,
    weeklyStats,
  } = useGameStore()
  
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day')
  
  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 80) return 'text-green-600'
    if (satisfaction >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getSatisfactionIcon = (satisfaction: number) => {
    if (satisfaction >= 80) return '😊'
    if (satisfaction >= 60) return '😐'
    return '😞'
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`
  }
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Business Statistics</h2>
        <div className="flex space-x-2">
          {(['day', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeframe === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Cash */}
        <div className="game-card bg-green-50 border-green-200">
          <div className="text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-lg font-bold text-green-700">
              {formatCurrency(cash)}
            </div>
            <div className="text-xs text-green-600">Available Cash</div>
          </div>
        </div>
        
        {/* Daily Earnings */}
        <div className="game-card bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-lg font-bold text-blue-700">
              {formatCurrency(dailyEarnings || 0)}
            </div>
            <div className="text-xs text-blue-600">Today's Earnings</div>
          </div>
        </div>
        
        {/* Customer Count */}
        <div className="game-card bg-purple-50 border-purple-200">
          <div className="text-center">
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-lg font-bold text-purple-700">
              {totalCustomers || 0}
            </div>
            <div className="text-xs text-purple-600">Total Customers</div>
          </div>
        </div>
        
        {/* Satisfaction */}
        <div className="game-card bg-orange-50 border-orange-200">
          <div className="text-center">
            <div className="text-2xl mb-1">{getSatisfactionIcon(customerSatisfaction || 0)}</div>
            <div className={`text-lg font-bold ${getSatisfactionColor(customerSatisfaction || 0)}`}>
              {formatPercentage(customerSatisfaction || 0)}
            </div>
            <div className="text-xs text-orange-600">Satisfaction</div>
          </div>
        </div>
      </div>
      
      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Performance */}
        <div className="game-card">
          <h3 className="font-semibold text-gray-800 mb-3">Business Performance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Day:</span>
              <span className="font-medium">{dayNumber || 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weekly Revenue:</span>
              <span className="font-medium">{formatCurrency(weeklyStats?.revenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weekly Expenses:</span>
              <span className="font-medium">{formatCurrency(weeklyStats?.expenses || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weekly Profit:</span>
              <span className={`font-medium ${
                (weeklyStats?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(weeklyStats?.profit || 0)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Customer Insights */}
        <div className="game-card">
          <h3 className="font-semibold text-gray-800 mb-3">Customer Insights</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">New This Week:</span>
              <span className="font-medium">{weeklyStats?.newCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Churned This Week:</span>
              <span className="font-medium text-red-600">{weeklyStats?.churnedCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retention Rate:</span>
              <span className="font-medium">{formatPercentage(weeklyStats?.retentionRate || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Rating:</span>
              <span className="font-medium">⭐ {weeklyStats?.averageRating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="game-card">
        <h3 className="font-semibold text-gray-800 mb-3">Business Growth</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Customer Base</span>
              <span className="font-medium">{totalCustomers || 0} / 100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((totalCustomers || 0) / 100 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Satisfaction Goal</span>
              <span className="font-medium">{customerSatisfaction || 0}% / 90%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((customerSatisfaction || 0) / 90 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
