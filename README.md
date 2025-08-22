# Poopster Game 🐕💩

A business simulation game where you manage a dog waste collection service. Build your empire one scoop at a time!

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Game Features

### Core Gameplay
- **Roblox-Style 3D World**: Immersive 3D environment with streets, houses, and backyards
- **Street Navigation**: Start on the street and walk to houses you need to service
- **Backyard Exploration**: Navigate through fenced backyards to find and scoop poops
- **Poop Scooping Mechanics**: Press S key when close to poops to scoop them
- **Scoring System**: Earn points based on poop size (Small: 10, Medium: 25, Large: 50)
- **Dynamic Poop Respawn**: Poops respawn in random backyard locations after 8-20 seconds
- **Full-Screen Immersion**: Game dashboard hidden by default, press TAB to toggle UI
- **Minimap Navigation**: Visual minimap showing your position and house locations

### New Components Added

#### 📊 StatsDashboard
- Business statistics and key metrics
- Daily, weekly, and monthly views
- Progress tracking for business goals
- Customer satisfaction monitoring

#### 💰 FinancialDashboard
- Revenue, expenses, and profit tracking
- Visual charts and financial breakdowns
- Business insights and growth analysis
- Time-based financial reporting

#### 👥 CustomerManagement
- Customer database and relationship management
- Service scheduling and status tracking
- Customer notes and communication
- Filtering and search capabilities

#### ⚙️ SettingsPanel
- Audio controls (music, sound effects)
- Gameplay options (difficulty, time scale)
- Display preferences (theme, font size)
- Business rules configuration

#### 🔔 NotificationSystem
- Real-time game alerts and notifications
- Event tracking (weather, achievements)
- Actionable notifications with quick actions
- Unread count indicators

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Game Engine**: Kaboom.js (for future game mechanics)

### Component Structure
```
components/
├── GameRoot.tsx          # Main game container
├── ThreeJSMap.tsx        # 3D interactive map with walking and poop scooping
├── MapCanvas.tsx         # Legacy 2D map (replaced by ThreeJSMap)
├── PlanTab.tsx           # Route planning interface
├── RouteTab.tsx          # Route execution interface
├── UpgradesTab.tsx       # Upgrade management
├── ReportsTab.tsx        # Container for dashboard components
├── StatsDashboard.tsx    # Business statistics
├── FinancialDashboard.tsx # Financial tracking
├── CustomerManagement.tsx # Customer management
├── SettingsPanel.tsx     # Game settings
├── NotificationSystem.tsx # Notifications and events
└── EndDayModal.tsx       # End-of-day summary
```

### State Management
The game uses Zustand for state management with the following key areas:
- **Game State**: Day, cash, time, active routes
- **Business Data**: Revenue, expenses, customer satisfaction
- **Customer Data**: Customer information, service history
- **Settings**: User preferences and game configuration

## 🎯 How to Play

1. **Start Your Day**: Click "Show Dashboard" and select houses to service in the Plan tab
2. **Navigate the World**: Use WASD or Arrow keys to walk from the street to houses
3. **Enter Backyards**: Walk through the green backyard areas to find poops
4. **Scoop Poops**: Press S key when close to poops to scoop them and earn points
5. **Manage Business**: Press TAB to toggle UI, access dashboard for upgrades and reports
6. **Grow Your Empire**: Earn points, upgrade equipment, and expand your customer base

### 🎮 Controls
- **WASD / Arrow Keys**: Move around the 3D world
- **S Key**: Scoop poop (when in backyard and close to poop)
- **TAB**: Toggle game UI on/off
- **ESC**: Close dashboard modal

## 🔧 Development

### Adding New Components
1. Create your component in the `components/` directory
2. Import and integrate it into `GameRoot.tsx` or appropriate tab
3. Add any required state properties to `lib/sim/state.ts`
4. Style using Tailwind CSS classes

### State Updates
- Add new properties to the `GameState` interface
- Implement actions in the Zustand store
- Update the initial state object
- Add persistence rules if needed

### Styling
- Use the existing `.game-card` class for consistent card styling
- Follow the established color scheme (green for money, blue for info, etc.)
- Maintain responsive design for mobile and desktop

## 📱 Responsive Design

All components are designed to work on both desktop and mobile devices:
- **Desktop**: Full tab navigation with detailed views
- **Mobile**: Collapsible tabs with essential information
- **Touch-friendly**: Optimized for touch interactions

## 🎨 Customization

The game supports extensive customization through the Settings panel:
- **Audio**: Volume controls for music and sound effects
- **Gameplay**: Difficulty levels and time scaling
- **Display**: Theme selection and font sizing
- **Business**: Starting conditions and game rules

## 🚀 Future Enhancements

- **Multiplayer**: Compete with other players
- **Advanced AI**: Smarter route optimization
- **Weather System**: Dynamic weather affecting gameplay
- **Achievements**: Unlockable goals and rewards
- **Mobile App**: Native mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Poopster-ing!** 🐕💩✨
