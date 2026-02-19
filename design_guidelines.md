# GAT Trading Dashboard - Design Guidelines

## Design Approach
**Reference-Based Approach**: The design is fully specified in the provided HTML files. This is a professional cryptocurrency/forex/futures trading platform with an established dark theme aesthetic and complete component library.

## Core Design Elements

### Typography
- **Font Stack**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Hierarchy**: 
  - Hero titles: 4rem bold
  - Section headings: 2xl-2.5rem bold
  - Card titles: lg-xl bold
  - Body text: sm-base regular
  - Stats/numbers: 2xl-5xl bold (financial data emphasis)
- **Colors**: White for primary text, gray-400 for secondary, emerald-400 for highlights

### Layout System
**Spacing Units**: Tailwind units - 1, 2, 4, 6, 8 for consistent spacing
- Cards: p-4 to p-6
- Sections: py-4 to py-8
- Gaps: gap-3 to gap-8
- Container: max-w-7xl with px-4 sm:px-6 lg:px-8

### Color Palette
- **Background**: Black (#000000) base, gray-900 (#111827) cards
- **Accents**: Emerald-600 (#059669) primary, Emerald-500 (#10b981), Emerald-400 (#34d399)
- **Borders**: gray-800 (#1f2937), gray-700 (#374151)
- **Status Colors**: Green for profit/positive, Red for loss/negative, Yellow for warnings
- **Overlays**: rgba backgrounds with blur effects for glassmorphism

### Component Library

**Navigation**
- Sticky header (z-50) with dark background (gray-900)
- Logo with emerald-600 icon container
- Horizontal nav links with emerald-600 active state
- User dropdown menu with profile avatar initials
- Notification bell with red dot indicator
- Mobile hamburger menu

**Cards/Panels**
- Gray-900 background with gray-800 borders
- Rounded-lg to rounded-xl corners
- Emerald-500/30 border for featured/important cards
- Icon containers: 48-56px with emerald gradient backgrounds
- Hover states: border-gray-700 transition

**Stats Display**
- Large numbers (2xl-5xl) in white
- Percentage badges with green/red backgrounds
- Icon + label + value pattern
- Grid layouts: 2-4 columns responsive

**Forms & Inputs**
- Gray-800 backgrounds with gray-700 borders
- Emerald-500 focus states
- Rounded-lg inputs with px-3 py-2
- Placeholder text in gray-400

**Buttons**
- Primary: Emerald-600 background, white text
- Secondary: Gray-800 with emerald border, transparent hover
- Sizes: px-3 py-2 (small) to px-6 py-3 (large)
- Hover: translateY(-2px) with shadow increase

**Tables/Lists**
- Zebra striping with gray-800/gray-750
- Compact rows with py-3 padding
- Status badges with rounded-full pills
- Right-aligned numerical data

**Charts & Visualizations**
- Placeholder areas for TradingView/chart libraries
- Dark backgrounds matching card style
- Timeframe selector buttons (1M, 5M, 15M, 1H, 1D)

### Responsive Behavior
- **Mobile**: Single column, stacked navigation, hamburger menu
- **Tablet (sm/md)**: 2-column grids, compact spacing
- **Desktop (lg+)**: 3-4 column grids, horizontal navigation, full feature set

### Icons
**Library**: Remixicon (via CDN)
- Dashboard: ri-dashboard-line
- Trading: ri-exchange-line, ri-line-chart-line, ri-currency-line
- Wallet: ri-wallet-3-line
- User: ri-user-line
- Settings: ri-settings-3-line
- Notifications: ri-notification-3-line

### Special Features
- Glassmorphism effects with backdrop-filter blur
- Gradient overlays on hero backgrounds
- Pulsing animations on important metrics
- Real-time clock displays in monospace font
- Trading session status indicators with colored dots
- Scroll indicators with bounce animation

### Images
**Hero Section**: Full-viewport background with trading-themed imagery, dark overlay gradient (rgba(0,0,0,0.7)), and particle animation effects. Hero content centered with glassmorphic cards below.

**No other images needed** - design relies on icons, charts, and data visualization.

### Accessibility
- Proper ARIA labels on interactive elements
- Focus states with emerald-500 rings
- Keyboard navigation support (ESC to close menus)
- Semantic HTML structure
- High contrast text (white on dark backgrounds)