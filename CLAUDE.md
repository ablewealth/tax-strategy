# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Advanced Tax Strategy Optimizer** - a React-based web application for wealth management professionals. It provides sophisticated tax optimization modeling and reporting for high-net-worth clients, with support for multi-year projections and advanced tax strategies.

## Development Commands

### Core Development
- `npm start` - Start development server (http://localhost:3000)
- `npm run build` - Build production version
- `npm test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint (enforces max 0 warnings)
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without changes

### Deployment & Maintenance
- `npm run deploy` - Deploy to GitHub Pages
- `npm run security` - Run security audit
- `npm run analyze` - Build and serve for analysis

### Backend (if needed)
- `cd backend && npm start` - Start backend server
- `cd backend && npm run dev` - Start backend with nodemon

## Architecture Overview

### Frontend Structure
- **React 18** with functional components and hooks
- **Tailwind CSS** with extensive custom theming and design system
- **Recharts** for data visualization
- **Create React App** as build system

### Key Components Architecture

#### Core Application Flow
```
App.js (main state management)
├── ClientInputSection (client data input)
├── StrategiesSection (tax strategy configuration)
├── ResultsDashboard (calculation results display)
├── InsightsSection (contextual recommendations)
├── StrategyInteractionAnalysis (AI-powered analysis)
├── ChartsSection (data visualization)
└── PrintableReport (client-ready output)
```

#### State Management
- **Centralized state** in `App.js` using `useState`
- **Scenario-based modeling** - each scenario contains client data and enabled strategies
- **Real-time calculations** using `useMemo` for performance
- **Strategy auto-enabling** based on input values

#### Tax Calculation Engine
- **Complex tax logic** in `src/utils/taxCalculations.js`
- **Multi-jurisdictional support** (NJ/NY state taxes)
- **Advanced strategies** including AMT calculations, QBI optimization, Section 179
- **Multi-year projections** with growth rate modeling

### Component Architecture Patterns

#### Reusable Form Components
- `InputField` - Currency input with formatting
- `SelectField` - Styled select dropdowns
- `Section` - Consistent section wrapper with titles

#### Data Flow Pattern
```
User Input → updateClientData → scenario state → performTaxCalculations → results → UI updates
```

#### Strategy Processing
- Each strategy has unique `id`, `inputRequired` field, and calculation logic
- Strategies are auto-enabled when user enters values > 0
- Complex strategy interactions handled in tax calculation engine

## Styling System

### Design Language
- **Swiss-inspired** professional design with precise typography
- **Custom CSS variables** for consistent theming
- **Responsive design** with mobile-first approach
- **Print-optimized** styles for client reports

### Key Design Tokens
- **Primary colors**: Navy blues and professional blues
- **Accent colors**: Gold accents for highlights
- **Typography**: Inter (sans-serif) and Playfair Display (serif)
- **Spacing**: Consistent 4px grid system

## Testing Strategy

### Test Coverage Requirements
- **Branches**: 10% minimum
- **Functions**: 21% minimum  
- **Lines**: 26% minimum
- **Statements**: 24% minimum

### Test Structure
- Component tests in `src/components/__tests__/`
- Focus on calculation logic and component behavior
- Uses React Testing Library and Jest

## Tax Strategy Implementation

### Strategy Categories
1. **Systematic Investment** (Quantino DEALS™)
2. **Business Tax Strategies** (Section 179, retirement plans)
3. **Alternative Investments** (Oil & Gas, Film financing)
4. **Philanthropic Planning** (Charitable CLAT)
5. **Income Optimization** (QBI deduction)

### Adding New Strategies
1. Add strategy definition to `STRATEGY_LIBRARY` in `constants.js`
2. Add corresponding input field to client data schema
3. Implement calculation logic in `taxCalculations.js`
4. Add strategy processing in `getTaxesForYear` function

### State-Specific Tax Logic
- **New Jersey**: Depreciation add-backs, retirement plan taxation differences
- **New York**: More favorable treatment for most deductions
- **AMT calculations**: Integrated with regular tax calculations

## Key Business Logic

### Multi-Year Projections
- Income growth applied annually using compound growth
- Strategies applied consistently across all years
- Cumulative savings calculated across projection period

### Capital Allocation Tracking
- Tracks total capital allocated to tax strategies
- Excludes QBI optimization (no capital requirement)
- Used for ROI calculations and insights

### Print Report Generation
- Dynamic React component rendering for print
- Fallback HTML generation for error scenarios
- Professional Swiss-style formatting

## Development Notes

### Code Style Preferences
- **Functional components** with hooks (no class components)
- **Explicit imports** for better tree-shaking
- **Descriptive variable names** for financial calculations
- **Consistent formatting** with Prettier configuration

### Performance Considerations
- **Memoized calculations** to prevent unnecessary recalculations
- **Callback optimization** for event handlers
- **Efficient re-renders** using React best practices

### Error Handling
- Comprehensive error handling in print functionality
- Graceful fallbacks for calculation errors
- Input validation and sanitization

## Deployment

- **GitHub Pages** deployment via automated workflow
- **Production build** optimization
- **Environment-specific** configurations supported