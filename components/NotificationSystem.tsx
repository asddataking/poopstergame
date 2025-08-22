'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'event'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface GameEvent {
  id: string
  type: 'weather' | 'customer' | 'business' | 'upgrade' | 'achievement'
  title: string
  description: string
  icon: string
  severity: 'low' | 'medium' | 'high'
  timestamp: Date
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [events, setEvents] = useState<GameEvent[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showEvents, setShowEvents] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Mock data - in a real implementation, this would come from the game state
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Customer Acquired!',
        message: 'New customer "Smith Family" has signed up for weekly service.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        action: {
          label: 'View Customer',
          onClick: () => console.log('View customer clicked')
        }
      },
      {
        id: '2',
        type: 'warning',
        title: 'Low Supplies',
        message: 'You are running low on cleaning supplies. Consider restocking soon.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        action: {
          label: 'Buy Supplies',
          onClick: () => console.log('Buy supplies clicked')
        }
      },
      {
        id: '3',
        type: 'info',
        title: 'Daily Summary',
        message: 'You completed 15 jobs today with 95% customer satisfaction.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true
      }
    ]
    
    const mockEvents: GameEvent[] = [
      {
        id: '1',
        type: 'weather',
        title: 'Rainy Weather',
        description: 'Heavy rain expected today. Service times may be longer.',
        icon: '🌧️',
        severity: 'medium',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'customer',
        title: 'Special Request',
        description: 'Customer "Johnson" requests extra attention to their garden area.',
        icon: '🎯',
        severity: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 15)
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Milestone Reached!',
        description: 'Congratulations! You\'ve served 100 customers.',
        icon: '🏆',
        severity: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 45)
      }
    ]
    
    setNotifications(mockNotifications)
    setEvents(mockEvents)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])
  
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }
  
  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    setUnreadCount(prev => {
      const removed = notifications.find(n => n.id === notificationId)
      return removed && !removed.read ? Math.max(0, prev - 1) : prev
    })
  }
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      case 'event': return '🎉'
      default: return '📢'
    }
  }
  
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      case 'event': return 'border-purple-200 bg-purple-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }
  
  const getEventColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-green-200 bg-green-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'high': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }
  
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }
  
  return (
    <div className="relative">
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span className="text-2xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        
        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🔕</div>
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${getNotificationColor(notification.type)} ${
                        !notification.read ? 'ring-2 ring-blue-300' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-800 text-sm">
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            {notification.action && (
                              <button
                                onClick={() => {
                                  notification.action?.onClick()
                                  markAsRead(notification.id)
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {notification.action.label}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Events Button */}
      <button
        onClick={() => setShowEvents(!showEvents)}
        className="ml-2 p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span className="text-2xl">📅</span>
      </button>
      
      {/* Events Dropdown */}
      {showEvents && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Game Events</h3>
              <button
                onClick={() => setShowEvents(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-2">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">📅</div>
                <p>No active events</p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${getEventColor(event.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{event.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-800 text-sm">
                            {event.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            event.severity === 'high' ? 'bg-red-100 text-red-800' :
                            event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {event.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {(showNotifications || showEvents) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false)
            setShowEvents(false)
          }}
        />
      )}
    </div>
  )
}
