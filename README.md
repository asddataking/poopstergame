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
- **Plan Routes**: Select houses to service each day
- **Execute Routes**: Drive around town collecting dog waste
- **Manage Upgrades**: Improve your equipment and efficiency
- **Track Progress**: Monitor your business growth

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
├── MapCanvas.tsx         # Game map visualization
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

1. **Start Your Day**: Select houses to service in the Plan tab
2. **Execute Routes**: Drive to each house and collect waste
3. **Manage Customers**: Keep customers happy to retain them
4. **Upgrade Equipment**: Invest in better tools and vehicles
5. **Grow Your Business**: Expand your customer base and profits

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
