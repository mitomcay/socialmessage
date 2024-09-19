// src/components/Counter.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('renders Counter component', () => {
  const { getByText } = render(<Counter />);
  const linkElement = getByText(/Count/i);
  expect(linkElement).toBeInTheDocument();
});

test('increments count', () => {
  const { getByText } = render(<Counter />);
  const button = getByText(/Increase/i);
  fireEvent.click(button);
  const countText = getByText(/Count: 1/i);
  expect(countText).toBeInTheDocument();
});
