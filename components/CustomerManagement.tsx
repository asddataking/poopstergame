'use client'

import { useGameStore } from '@/lib/sim/state'
import { useState } from 'react'
import { HOUSE_TIERS } from '@/lib/constants'

interface Customer {
  id: string
  name: string
  address: string
  tier: keyof typeof HOUSE_TIERS
  lastService: string
  nextService: string
  satisfaction: number
  status: 'active' | 'pending' | 'overdue' | 'churned'
  notes: string
}

export default function CustomerManagement() {
  const {
    customers,
    updateCustomerService,
    addCustomerNote,
    churnCustomer,
  } = useGameStore()
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'overdue' | 'churned'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [newNote, setNewNote] = useState('')
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-blue-600 bg-blue-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      case 'churned': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅'
      case 'pending': return '⏳'
      case 'overdue': return '🚨'
      case 'churned': return '❌'
      default: return '❓'
    }
  }
  
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'SMALL': return '🏠'
      case 'MEDIUM': return '🏘️'
      case 'LARGE': return '🏰'
      default: return '🏠'
    }
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }
  
  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 80) return 'text-green-600'
    if (satisfaction >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const filteredCustomers = customers?.filter(customer => {
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.address.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  }) || []
  
  const handleServiceUpdate = (customerId: string, serviceDate: string) => {
    updateCustomerService?.(customerId, serviceDate)
  }
  
  const handleAddNote = (customerId: string) => {
    if (newNote.trim()) {
      addCustomerNote?.(customerId, newNote)
      setNewNote('')
    }
  }
  
  const handleChurn = (customerId: string) => {
    if (confirm('Are you sure you want to mark this customer as churned?')) {
      churnCustomer?.(customerId)
    }
  }
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Customer Management</h2>
        <div className="text-sm text-gray-600">
          {filteredCustomers.length} customers
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search customers by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          {(['all', 'active', 'pending', 'overdue', 'churned'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                filterStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Customer List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer List */}
        <div className="lg:col-span-2">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`game-card cursor-pointer transition-all hover:shadow-md ${
                  selectedCustomer?.id === customer.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTierIcon(customer.tier)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      <span className="mr-1">{getStatusIcon(customer.status)}</span>
                      {customer.status}
                    </div>
                    <div className={`text-sm mt-1 ${getSatisfactionColor(customer.satisfaction)}`}>
                      {customer.satisfaction}% satisfaction
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  <span>Last: {formatDate(customer.lastService)}</span>
                  <span className="mx-2">•</span>
                  <span>Next: {formatDate(customer.nextService)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Customer Details */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <div className="game-card space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getTierIcon(selectedCustomer.tier)}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    House Tier
                  </label>
                  <div className="text-sm text-gray-600">
                    {HOUSE_TIERS[selectedCustomer.tier]?.name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Status
                  </label>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                    <span className="mr-1">{getStatusIcon(selectedCustomer.status)}</span>
                    {selectedCustomer.status}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satisfaction
                  </label>
                  <div className={`text-sm ${getSatisfactionColor(selectedCustomer.satisfaction)}`}>
                    {selectedCustomer.satisfaction}%
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Service
                  </label>
                  <div className="text-sm text-gray-600">
                    {formatDate(selectedCustomer.lastService)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Service
                  </label>
                  <input
                    type="date"
                    value={selectedCustomer.nextService ? selectedCustomer.nextService.split('T')[0] : ''}
                    onChange={(e) => handleServiceUpdate(selectedCustomer.id, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Note
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAddNote(selectedCustomer.id)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {selectedCustomer.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {selectedCustomer.notes}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t">
                  <button
                    onClick={() => handleChurn(selectedCustomer.id)}
                    className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Mark as Churned
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="game-card text-center text-gray-500 py-8">
              Select a customer to view details
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="game-card">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
            📅 Schedule All
          </button>
          <button className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            📊 Export Data
          </button>
          <button className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
            📧 Send Reminders
          </button>
          <button className="px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
            🎯 Find Prospects
          </button>
        </div>
      </div>
    </div>
  )
}
