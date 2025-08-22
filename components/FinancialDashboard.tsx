'use client'

import { useGameStore } from '@/lib/sim/state'
import { useState } from 'react'

interface FinancialRecord {
  date: string
  revenue: number
  expenses: number
  profit: number
  customers: number
}

export default function FinancialDashboard() {
  const {
    cash,
    dailyEarnings,
    weeklyStats,
  } = useGameStore()
  
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'expenses' | 'profit'>('profit')
  
  // Mock financial data - in a real implementation, this would come from the game state
  const mockFinancialData: FinancialRecord[] = [
    { date: '2024-01-01', revenue: 1200, expenses: 800, profit: 400, customers: 15 },
    { date: '2024-01-02', revenue: 1350, expenses: 750, profit: 600, customers: 18 },
    { date: '2024-01-03', revenue: 1100, expenses: 700, profit: 400, customers: 16 },
    { date: '2024-01-04', revenue: 1600, expenses: 900, profit: 700, customers: 22 },
    { date: '2024-01-05', revenue: 1400, expenses: 850, profit: 550, customers: 19 },
    { date: '2024-01-06', revenue: 1800, expenses: 950, profit: 850, customers: 25 },
    { date: '2024-01-07', revenue: 1300, expenses: 800, profit: 500, customers: 17 },
  ]
  
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
  
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'revenue': return 'text-green-600'
      case 'expenses': return 'text-red-600'
      case 'profit': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }
  
  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'revenue': return '💰'
      case 'expenses': return '💸'
      case 'profit': return '📈'
      default: return '📊'
    }
  }
  
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }
  
  const getCurrentPeriodData = () => {
    switch (timeframe) {
      case 'week':
        return mockFinancialData.slice(-7)
      case 'month':
        return mockFinancialData // In real implementation, this would be monthly data
      case 'quarter':
        return mockFinancialData // In real implementation, this would be quarterly data
      default:
        return mockFinancialData.slice(-7)
    }
  }
  
  const currentData = getCurrentPeriodData()
  const totalRevenue = currentData.reduce((sum, record) => sum + record.revenue, 0)
  const totalExpenses = currentData.reduce((sum, record) => sum + record.expenses, 0)
  const totalProfit = totalRevenue - totalExpenses
  const avgCustomers = Math.round(currentData.reduce((sum, record) => sum + record.customers, 0) / currentData.length)
  
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Financial Dashboard</h2>
        <div className="flex space-x-2">
          {(['week', 'month', 'quarter'] as const).map((period) => (
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
      
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="game-card bg-green-50 border-green-200">
          <div className="text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-lg font-bold text-green-700">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-xs text-green-600">Total Revenue</div>
          </div>
        </div>
        
        {/* Total Expenses */}
        <div className="game-card bg-red-50 border-red-200">
          <div className="text-center">
            <div className="text-2xl mb-1">💸</div>
            <div className="text-lg font-bold text-red-700">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-xs text-red-600">Total Expenses</div>
          </div>
        </div>
        
        {/* Net Profit */}
        <div className="game-card bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl mb-1">📈</div>
            <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              {formatCurrency(totalProfit)}
            </div>
            <div className="text-xs text-blue-600">Net Profit</div>
          </div>
        </div>
        
        {/* Profit Margin */}
        <div className="game-card bg-purple-50 border-purple-200">
          <div className="text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className={`text-lg font-bold ${profitMargin >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
              {formatPercentage(profitMargin)}
            </div>
            <div className="text-xs text-purple-600">Profit Margin</div>
          </div>
        </div>
      </div>
      
      {/* Financial Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue vs Expenses Chart */}
        <div className="game-card">
          <h3 className="font-semibold text-gray-800 mb-3">Revenue vs Expenses</h3>
          <div className="space-y-2">
            {currentData.map((record, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="text-xs text-gray-500 w-16">
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 flex space-x-1">
                  <div 
                    className="bg-green-500 h-4 rounded-l"
                    style={{ width: `${(record.revenue / Math.max(...currentData.map(r => r.revenue))) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-500 h-4 rounded-r"
                    style={{ width: `${(record.expenses / Math.max(...currentData.map(r => r.expenses))) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 w-20 text-right">
                  {formatCurrency(record.revenue)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-4 mt-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Expenses</span>
            </div>
          </div>
        </div>
        
        {/* Profit Trend */}
        <div className="game-card">
          <h3 className="font-semibold text-gray-800 mb-3">Profit Trend</h3>
          <div className="space-y-2">
            {currentData.map((record, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="text-xs text-gray-500 w-16">
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`h-4 rounded transition-all ${
                        record.profit >= 0 ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.abs(record.profit) / Math.max(...currentData.map(r => Math.abs(r.profit))) * 100}%` }}
                    ></div>
                    <span className={`text-xs font-medium ${
                      record.profit >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(record.profit)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Detailed Financial Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Breakdown */}
        <div className="game-card">
          <h3 className="font-semibold text-gray-800 mb-3">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Small Houses</span>
              <span className="font-medium">{formatCurrency(totalRevenue * 0.4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Medium Houses</span>
              <span className="font-medium">{formatCurrency(totalRevenue * 0.35)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Large Houses</span>
              <span className="font-medium">{formatCurrency(totalRevenue * 0.25)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">Total Revenue</span>
                <span className="font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expense Breakdown */}
        <div className="game-card">
          <h3 className="font-semibold text-gray-800 mb-3">Expense Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fuel Costs</span>
              <span className="font-medium">{formatCurrency(totalExpenses * 0.3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Supplies</span>
              <span className="font-medium">{formatCurrency(totalExpenses * 0.25)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Worker Wages</span>
              <span className="font-medium">{formatCurrency(totalExpenses * 0.35)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Other</span>
              <span className="font-medium">{formatCurrency(totalExpenses * 0.1)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">Total Expenses</span>
                <span className="font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Financial Insights */}
      <div className="game-card">
        <h3 className="font-semibold text-gray-800 mb-3">Financial Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-sm text-gray-600">Avg. Daily Revenue</div>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(Math.round(totalRevenue / currentData.length))}
            </div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-sm text-gray-600">Revenue per Customer</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(Math.round(totalRevenue / avgCustomers))}
            </div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-sm text-gray-600">Growth Rate</div>
            <div className="text-lg font-bold text-purple-600">
              {formatPercentage(calculateGrowth(totalRevenue, totalRevenue * 0.9))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="game-card">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
            📊 Export Report
          </button>
          <button className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            💰 Set Budget
          </button>
          <button className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
            📈 Forecast
          </button>
          <button className="px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
            🔍 Analyze
          </button>
        </div>
      </div>
    </div>
  )
}
