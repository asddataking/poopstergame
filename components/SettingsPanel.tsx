'use client'

import { useState } from 'react'

interface GameSettings {
  audio: {
    masterVolume: number
    musicVolume: number
    sfxVolume: number
    enableMusic: boolean
    enableSFX: boolean
  }
  gameplay: {
    autoSave: boolean
    autoSaveInterval: number
    showTutorials: boolean
    difficulty: 'easy' | 'normal' | 'hard'
    timeScale: number
  }
  display: {
    theme: 'light' | 'dark' | 'auto'
    fontSize: 'small' | 'medium' | 'large'
    showAnimations: boolean
    showNotifications: boolean
  }
  business: {
    startingCash: number
    customerSatisfactionThreshold: number
    maxCustomers: number
    enableEvents: boolean
  }
}

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<'audio' | 'gameplay' | 'display' | 'business'>('audio')
  const [settings, setSettings] = useState<GameSettings>({
    audio: {
      masterVolume: 80,
      musicVolume: 70,
      sfxVolume: 90,
      enableMusic: true,
      enableSFX: true,
    },
    gameplay: {
      autoSave: true,
      autoSaveInterval: 5,
      showTutorials: true,
      difficulty: 'normal',
      timeScale: 1,
    },
    display: {
      theme: 'auto',
      fontSize: 'medium',
      showAnimations: true,
      showNotifications: true,
    },
    business: {
      startingCash: 1000,
      customerSatisfactionThreshold: 60,
      maxCustomers: 100,
      enableEvents: true,
    },
  })
  
  const updateSetting = <K extends keyof GameSettings, SK extends keyof GameSettings[K]>(
    category: K,
    setting: SK,
    value: GameSettings[K][SK]
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }))
  }
  
  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        audio: {
          masterVolume: 80,
          musicVolume: 70,
          sfxVolume: 90,
          enableMusic: true,
          enableSFX: true,
        },
        gameplay: {
          autoSave: true,
          autoSaveInterval: 5,
          showTutorials: true,
          difficulty: 'normal',
          timeScale: 1,
        },
        display: {
          theme: 'auto',
          fontSize: 'medium',
          showAnimations: true,
          showNotifications: true,
        },
        business: {
          startingCash: 1000,
          customerSatisfactionThreshold: 60,
          maxCustomers: 100,
          enableEvents: true,
        },
      })
    }
  }
  
  const saveSettings = () => {
    // In a real implementation, this would save to localStorage or backend
    localStorage.setItem('poopsterGameSettings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }
  
  const tabs = [
    { id: 'audio', name: 'Audio', icon: '🔊' },
    { id: 'gameplay', name: 'Gameplay', icon: '🎮' },
    { id: 'display', name: 'Display', icon: '🎨' },
    { id: 'business', name: 'Business', icon: '💼' },
  ] as const
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Game Settings</h2>
        <div className="flex space-x-2">
          <button
            onClick={resetToDefaults}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={saveSettings}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>
      
      {/* Settings Content */}
      <div className="game-card">
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Audio Settings</h3>
            
            {/* Master Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Master Volume</label>
                <span className="text-sm text-gray-500">{settings.audio.masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.audio.masterVolume}
                onChange={(e) => updateSetting('audio', 'masterVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            {/* Music Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Music Volume</label>
                <span className="text-sm text-gray-500">{settings.audio.musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.audio.musicVolume}
                onChange={(e) => updateSetting('audio', 'musicVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={!settings.audio.enableMusic}
              />
            </div>
            
            {/* SFX Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Sound Effects Volume</label>
                <span className="text-sm text-gray-500">{settings.audio.sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.audio.sfxVolume}
                onChange={(e) => updateSetting('audio', 'sfxVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={!settings.audio.enableSFX}
              />
            </div>
            
            {/* Audio Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.audio.enableMusic}
                  onChange={(e) => updateSetting('audio', 'enableMusic', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Music</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.audio.enableSFX}
                  onChange={(e) => updateSetting('audio', 'enableSFX', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Sound Effects</span>
              </label>
            </div>
          </div>
        )}
        
        {activeTab === 'gameplay' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Gameplay Settings</h3>
            
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Game Difficulty</label>
              <select
                value={settings.gameplay.difficulty}
                onChange={(e) => updateSetting('gameplay', 'difficulty', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy - More forgiving, slower progression</option>
                <option value="normal">Normal - Balanced challenge</option>
                <option value="hard">Hard - Challenging, faster progression</option>
              </select>
            </div>
            
            {/* Time Scale */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Game Speed</label>
                <span className="text-sm text-gray-500">{settings.gameplay.timeScale}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={settings.gameplay.timeScale}
                onChange={(e) => updateSetting('gameplay', 'timeScale', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            {/* Auto Save */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.gameplay.autoSave}
                  onChange={(e) => updateSetting('gameplay', 'autoSave', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Auto-Save</span>
              </label>
              
              {settings.gameplay.autoSave && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Save Interval (minutes)</label>
                  <select
                    value={settings.gameplay.autoSaveInterval}
                    onChange={(e) => updateSetting('gameplay', 'autoSaveInterval', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Every minute</option>
                    <option value="5">Every 5 minutes</option>
                    <option value="10">Every 10 minutes</option>
                    <option value="30">Every 30 minutes</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* Tutorials */}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.gameplay.showTutorials}
                onChange={(e) => updateSetting('gameplay', 'showTutorials', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Tutorials and Tips</span>
            </label>
          </div>
        )}
        
        {activeTab === 'display' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Display Settings</h3>
            
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={settings.display.theme}
                onChange={(e) => updateSetting('display', 'theme', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="auto">Auto (Follow System)</option>
              </select>
            </div>
            
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <select
                value={settings.display.fontSize}
                onChange={(e) => updateSetting('display', 'fontSize', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            {/* Display Toggles */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.display.showAnimations}
                  onChange={(e) => updateSetting('display', 'showAnimations', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Animations</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.display.showNotifications}
                  onChange={(e) => updateSetting('display', 'showNotifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Notifications</span>
              </label>
            </div>
          </div>
        )}
        
        {activeTab === 'business' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Business Settings</h3>
            
            {/* Starting Cash */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Starting Cash</label>
              <input
                type="number"
                min="500"
                max="10000"
                step="100"
                value={settings.business.startingCash}
                onChange={(e) => updateSetting('business', 'startingCash', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Amount of money you start with</p>
            </div>
            
            {/* Customer Satisfaction Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Customer Satisfaction Threshold</label>
                <span className="text-sm text-gray-500">{settings.business.customerSatisfactionThreshold}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={settings.business.customerSatisfactionThreshold}
                onChange={(e) => updateSetting('business', 'customerSatisfactionThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum satisfaction to retain customers</p>
            </div>
            
            {/* Max Customers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Customers</label>
              <input
                type="number"
                min="20"
                max="500"
                step="10"
                value={settings.business.maxCustomers}
                onChange={(e) => updateSetting('business', 'maxCustomers', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum number of customers you can serve</p>
            </div>
            
            {/* Events */}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.business.enableEvents}
                onChange={(e) => updateSetting('business', 'enableEvents', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Random Events</span>
            </label>
            <p className="text-xs text-gray-500">Weather, special requests, and other random events</p>
          </div>
        )}
      </div>
      
      {/* Additional Options */}
      <div className="game-card">
        <h3 className="font-semibold text-gray-800 mb-3">Additional Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
            📁 Export Save Data
          </button>
          <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            📥 Import Save Data
          </button>
          <button className="px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
            🎯 Reset Progress
          </button>
          <button className="px-4 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
            📊 View Statistics
          </button>
        </div>
      </div>
    </div>
  )
}
