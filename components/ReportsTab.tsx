'use client'

import { useState } from 'react'
import StatsDashboard from './StatsDashboard'
import FinancialDashboard from './FinancialDashboard'
import CustomerManagement from './CustomerManagement'

type ReportType = 'stats' | 'financial' | 'customers'

export default function ReportsTab() {
  const [activeReport, setActiveReport] = useState<ReportType>('stats')
  
  const reports = [
    { id: 'stats', name: 'Statistics', icon: '📊', component: StatsDashboard },
    { id: 'financial', name: 'Financial', icon: '💰', component: FinancialDashboard },
    { id: 'customers', name: 'Customers', icon: '👥', component: CustomerManagement },
  ] as const
  
  const ActiveComponent = reports.find(r => r.id === activeReport)?.component || StatsDashboard
  
  return (
    <div className="h-full flex flex-col">
      {/* Report Type Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeReport === report.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{report.icon}</span>
            <span>{report.name}</span>
          </button>
        ))}
      </div>
      
      {/* Report Content */}
      <div className="flex-1 overflow-y-auto">
        <ActiveComponent />
      </div>
    </div>
  )
}
