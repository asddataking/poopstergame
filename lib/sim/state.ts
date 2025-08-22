import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { HOUSE_TIERS, UPGRADE_TYPES, UPGRADES, GAME_CONFIG, TOWN_CONFIG } from '@/lib/constants'

// Types
export interface House {
  id: string
  x: number
  y: number
  tier: keyof typeof HOUSE_TIERS
  basePrice: number
  dirtiness: number
  frequency: 'weekly' | 'biweekly'
  lastServiced: number // day number
  satisfaction: number
  isPremium: boolean
  serviced?: boolean
}

export interface Route {
  houses: string[]
  projectedRevenue: number
  projectedTime: number
  projectedFuel: number
}

export interface Customer {
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

export interface WeeklyStats {
  revenue: number
  expenses: number
  profit: number
  newCustomers: number
  churnedCustomers: number
  retentionRate: number
  averageRating: number
}

export interface GameState {
  // Core state
  day: number
  cash: number
  timeLeft: number
  isDayActive: boolean
  currentRoute: Route | null
  
  // Houses
  houses: House[]
  selectedHouses: string[]
  dailyCapacity: number
  
  // Upgrades
  upgrades: Record<string, number>
  
  // Statistics
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  housesServiced: number
  housesMissed: number
  
  // New properties for components
  dailyEarnings: number
  totalCustomers: number
  customerSatisfaction: number
  dayNumber: number
  weeklyStats: WeeklyStats
  customers: Customer[]
  
  // Events
  weather: 'clear' | 'rain' | 'heat'
  events: string[]
  
  // Actions
  startDay: () => void
  endDay: () => void
  selectHouse: (houseId: string) => void
  deselectHouse: (houseId: string) => void
  autoPlanRoute: () => void
  serviceHouse: (houseId: string) => void
  purchaseUpgrade: (upgradeType: string) => void
  resetGame: () => void
  saveGame: () => void
  loadGame: () => void
  
  // New actions for components
  updateCustomerService: (customerId: string, serviceDate: string) => void
  addCustomerNote: (customerId: string, note: string) => void
  churnCustomer: (customerId: string) => void
  
  // Internal game logic
  processChurnAndLeads: () => void
}

// Initial state
const initialState = {
  day: 1,
  cash: GAME_CONFIG.STARTING_CASH,
  timeLeft: GAME_CONFIG.DAY_TIME_BUDGET,
  isDayActive: false,
  currentRoute: null,
  houses: [],
  selectedHouses: [],
  dailyCapacity: 8,
  upgrades: {},
  totalRevenue: 0,
  totalExpenses: 0,
  totalProfit: 0,
  housesServiced: 0,
  housesMissed: 0,
  weather: 'clear' as const,
  events: [],
  
  // New properties
  dailyEarnings: 0,
  totalCustomers: 0,
  customerSatisfaction: 75,
  dayNumber: 1,
  weeklyStats: {
    revenue: 0,
    expenses: 0,
    profit: 0,
    newCustomers: 0,
    churnedCustomers: 0,
    retentionRate: 100,
    averageRating: 4.0,
  },
  customers: [],
}

// Game state store
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startDay: () => {
        const state = get()
        if (state.selectedHouses.length === 0) return
        
        set({
          isDayActive: true,
          timeLeft: GAME_CONFIG.DAY_TIME_BUDGET,
          currentRoute: {
            houses: state.selectedHouses,
            projectedRevenue: 0, // Will be calculated during route
            projectedTime: 0,
            projectedFuel: 0,
          }
        })
      },
      
      endDay: () => {
        const state = get()
        const { houses, selectedHouses, upgrades, weather } = state
        
        // Calculate revenue and expenses
        let revenue = 0
        let expenses = 0
        let serviced = 0
        let missed = 0
        
        // Process each selected house
        selectedHouses.forEach(houseId => {
          const house = houses.find(h => h.id === houseId)
          if (!house) return
          
          // Check if house was serviced (in time)
          const wasServiced = state.timeLeft > 0
          
          if (wasServiced) {
            // Calculate revenue with upgrades
            let jobPrice = house.basePrice * (1 + house.dirtiness * 0.1)
            if (house.isPremium) jobPrice *= 1.5
            
            // Apply bag capacity upgrade
            const bagUpgrade = upgrades[UPGRADE_TYPES.BAG_CAPACITY] || 0
            const suppliesCost = GAME_CONFIG.SUPPLIES_COST_PER_JOB * 
              (1 - (bagUpgrade * 0.1))
            
            revenue += jobPrice
            expenses += suppliesCost
            serviced++
            
            // Update house satisfaction
            house.satisfaction += GAME_CONFIG.SATISFACTION_SERVICED
            house.lastServiced = state.day
            house.serviced = true
          } else {
            missed++
            house.satisfaction += GAME_CONFIG.SATISFACTION_MISSED
          }
        })
        
        // Add fuel costs
        const fuelCost = GAME_CONFIG.FUEL_COST_PER_TILE * 
          (selectedHouses.length * 2) // Rough estimate
        expenses += fuelCost
        
        // Add worker wages
        if (upgrades[UPGRADE_TYPES.WORKER]) {
          expenses += GAME_CONFIG.WORKER_DAILY_WAGE
        }
        
        // Weather effects
        if (weather === 'rain') {
          expenses *= 1.2 // 20% more supplies needed
        }
        
        const profit = revenue - expenses
        
        // Calculate customer satisfaction
        const totalSatisfaction = houses.reduce((sum, house) => sum + house.satisfaction, 0)
        const avgSatisfaction = houses.length > 0 ? totalSatisfaction / houses.length : 75
        
        // Update weekly stats
        const currentWeek = Math.floor((state.day - 1) / 7)
        const newWeek = Math.floor(state.day / 7)
        let weeklyStats = state.weeklyStats
        
        if (newWeek > currentWeek) {
          // New week, reset stats
          weeklyStats = {
            revenue: revenue,
            expenses: expenses,
            profit: profit,
            newCustomers: 0,
            churnedCustomers: 0,
            retentionRate: 100,
            averageRating: avgSatisfaction / 20, // Convert to 5-star scale
          }
        } else {
          // Same week, accumulate
          weeklyStats = {
            ...weeklyStats,
            revenue: weeklyStats.revenue + revenue,
            expenses: weeklyStats.expenses + expenses,
            profit: weeklyStats.profit + profit,
            averageRating: (weeklyStats.averageRating + avgSatisfaction / 20) / 2,
          }
        }
        
        // Update state
        set({
          day: state.day + 1,
          cash: state.cash + profit,
          isDayActive: false,
          currentRoute: null,
          selectedHouses: [],
          totalRevenue: state.totalRevenue + revenue,
          totalExpenses: state.totalExpenses + expenses,
          totalProfit: state.totalProfit + profit,
          housesServiced: state.housesServiced + serviced,
          housesMissed: state.housesMissed + missed,
          timeLeft: 0,
          dailyEarnings: revenue,
          totalCustomers: houses.length,
          customerSatisfaction: Math.max(0, Math.min(100, avgSatisfaction)),
          dayNumber: state.day + 1,
          weeklyStats,
        })
        
        // Process churn and new leads
        get().processChurnAndLeads()
      },
      
      selectHouse: (houseId: string) => {
        const state = get()
        if (state.selectedHouses.length >= state.dailyCapacity) return
        if (state.selectedHouses.includes(houseId)) return
        
        set({
          selectedHouses: [...state.selectedHouses, houseId]
        })
      },
      
      deselectHouse: (houseId: string) => {
        const state = get()
        set({
          selectedHouses: state.selectedHouses.filter(id => id !== houseId)
        })
      },
      
      autoPlanRoute: () => {
        const state = get()
        const availableHouses = state.houses.filter(house => 
          !state.selectedHouses.includes(house.id)
        )
        
        // Sort by profit/time ratio
        const profitableHouses = availableHouses
          .map(house => ({
            ...house,
            profitPerTime: house.basePrice / (house.dirtiness * 0.1 + 1)
          }))
          .sort((a, b) => b.profitPerTime - a.profitPerTime)
          .slice(0, state.dailyCapacity - state.selectedHouses.length)
        
        set({
          selectedHouses: [
            ...state.selectedHouses,
            ...profitableHouses.map(h => h.id)
          ]
        })
      },
      
      serviceHouse: (houseId: string) => {
        const state = get()
        if (!state.isDayActive || !state.currentRoute) return
        
        // This will be called from the route component
        // Time and fuel calculations happen there
      },
      
      purchaseUpgrade: (upgradeType: string) => {
        const state = get()
        const upgrade = UPGRADES[upgradeType as keyof typeof UPGRADES]
        if (!upgrade) return
        
        const currentLevel = state.upgrades[upgradeType] || 0
        if (currentLevel >= upgrade.maxLevel) return
        
        const cost = upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel)
        if (state.cash < cost) return
        
        // Apply upgrade effects
        let newState: Partial<GameState> = {
          cash: state.cash - cost,
          upgrades: {
            ...state.upgrades,
            [upgradeType]: currentLevel + 1
          }
        }
        
        // Special upgrade effects
        if (upgradeType === UPGRADE_TYPES.WORKER) {
          newState.dailyCapacity = state.dailyCapacity * 2
        }
        
        set(newState)
      },
      
      resetGame: () => {
        set(initialState)
      },
      
      saveGame: () => {
        // Persist middleware handles this automatically
      },
      
      loadGame: () => {
        // Persist middleware handles this automatically
      },
      
      processChurnAndLeads: () => {
        const state = get()
        const { houses, upgrades, day } = state
        
        // Process churn
        const newHouses = houses.filter(house => {
          if (house.satisfaction < GAME_CONFIG.CHURN_THRESHOLD) {
            return false // House churns
          }
          return true
        })
        
        // Generate new leads
        const marketingLevel = upgrades[UPGRADE_TYPES.MARKETING] || 0
        const leadChance = GAME_CONFIG.BASE_LEAD_CHANCE + 
          (marketingLevel * GAME_CONFIG.MARKETING_LEAD_BONUS)
        
        if (Math.random() < leadChance && newHouses.length < TOWN_CONFIG.MAX_HOUSES) {
          // Generate new house (this will be implemented in generateTown.ts)
          // For now, just update the houses array
          set({ houses: newHouses })
        } else {
          set({ houses: newHouses })
        }
      },
      
      // New customer management actions
      updateCustomerService: (customerId: string, serviceDate: string) => {
        const state = get()
        const updatedCustomers = state.customers.map(customer => 
          customer.id === customerId 
            ? { ...customer, nextService: serviceDate }
            : customer
        )
        set({ customers: updatedCustomers })
      },
      
      addCustomerNote: (customerId: string, note: string) => {
        const state = get()
        const updatedCustomers = state.customers.map(customer => 
          customer.id === customerId 
            ? { ...customer, notes: note }
            : customer
        )
        set({ customers: updatedCustomers })
      },
      
      churnCustomer: (customerId: string) => {
        const state = get()
        const updatedCustomers = state.customers.map(customer => 
          customer.id === customerId 
            ? { ...customer, status: 'churned' as const }
            : customer
        )
        set({ customers: updatedCustomers })
      },
    }),
    {
      name: 'poopster-game-state',
      partialize: (state) => ({
        day: state.day,
        cash: state.cash,
        houses: state.houses,
        upgrades: state.upgrades,
        totalRevenue: state.totalRevenue,
        totalExpenses: state.totalExpenses,
        totalProfit: state.totalProfit,
        housesServiced: state.housesServiced,
        housesMissed: state.housesMissed,
      }),
    }
  )
)
