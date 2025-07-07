import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Tax Strategy Optimizer app', () => {
  render(<App />);
  
  // Check if the main heading is present
  const heading = screen.getByRole('heading', { level: 1 });
  expect(heading).toBeInTheDocument();
  
  // Check if the app renders without crashing
  expect(heading).toHaveTextContent(/tax/i);
});

test('renders client input section', () => {
  render(<App />);
  
  // Check if key sections are present
  const clientSection = screen.getByText(/client/i);
  expect(clientSection).toBeInTheDocument();
});

test('app renders without crashing', () => {
  render(<App />);
  // If we get here, the app rendered successfully
  expect(true).toBe(true);
});
