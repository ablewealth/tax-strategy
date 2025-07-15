import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock the recharts components to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}));

describe('Tax Strategy Optimizer App', () => {
  test('renders the app without crashing', async () => {
    render(<App />);

    // Wait for the app to render and check for a specific heading
    await waitFor(() => {
      const mainHeading = screen.getByText('Advanced Tax Strategy Optimizer');
      expect(mainHeading).toBeInTheDocument();
    });
  });

  test('renders main heading', async () => {
    render(<App />);

    await waitFor(() => {
      const heading = screen.getByText('Advanced Tax Strategy Optimizer');
      expect(heading).toBeInTheDocument();
    });
  });

  test('renders client input section', async () => {
    render(<App />);

    await waitFor(() => {
      // Look for specific client profile heading
      const clientHeading = screen.getByText('📋 Client Profile & Projections');
      expect(clientHeading).toBeInTheDocument();
    });
  });
});
