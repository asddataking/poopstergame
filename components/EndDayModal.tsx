'use client'

import { useGameStore } from '@/lib/sim/state'

interface EndDayModalProps {
  onClose: () => void
}

export default function EndDayModal({ onClose }: EndDayModalProps) {
  const {
    day,
    cash,
    dailyEarnings,
    totalCustomers,
    customerSatisfaction,
    houses,
  } = useGameStore()
  
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Day {day} Complete!</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          <p className="text-gray-600 mt-2">Great work today! Here's your summary:</p>
        </div>
        
        {/* Day Summary */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(dailyEarnings || 0)}
              </div>
              <div className="text-xs text-green-600">Today's Earnings</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-lg font-bold text-blue-700">
                {houses.filter(h => h.serviced).length}
              </div>
              <div className="text-xs text-blue-600">Houses Serviced</div>
            </div>
          </div>
          
          {/* Customer Satisfaction */}
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl mb-2">{getSatisfactionIcon(customerSatisfaction || 0)}</div>
            <div className={`text-xl font-bold ${getSatisfactionColor(customerSatisfaction || 0)}`}>
              {formatPercentage(customerSatisfaction || 0)} Satisfaction
            </div>
            <div className="text-sm text-orange-600 mt-1">
              {customerSatisfaction >= 80 ? 'Excellent work!' :
               customerSatisfaction >= 60 ? 'Good job!' :
               'Room for improvement'}
            </div>
          </div>
          
          {/* Business Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Customers:</span>
              <span className="font-medium">{totalCustomers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Cash:</span>
              <span className="font-bold text-green-600">{formatCurrency(cash)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Day Number:</span>
              <span className="font-medium">{day}</span>
            </div>
          </div>
          
          {/* Motivational Message */}
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm text-purple-700">
              {day === 1 ? 'Great start to your poopster empire!' :
               day < 7 ? 'You\'re building momentum!' :
               day < 30 ? 'You\'re becoming a poopster pro!' :
               'You\'re a poopster legend!'}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue to Next Day
          </button>
        </div>
      </div>
    </div>
  )
}
