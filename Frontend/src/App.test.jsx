// Frontend/src/App.test.jsx
// Using React for JSX, even if not directly referenced
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import App from './App';
import '@testing-library/jest-dom';

// Import Jest globals
import { describe, beforeEach, test, expect } from '@jest/globals';

const mockStore = configureStore([]);

describe('App Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      user: {
        currentUser: null,
      },
      // Add other relevant initial states your App/Header might need
    });
  });

  test('renders without crashing and shows some initial content', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>
    );

    // Look for the "Welcome to Habitify" heading
    // The 'i' flag makes the match case-insensitive, which is robust.
    // 'name' option specifies looking for an element whose accessible name matches.
    const welcomeHeading = screen.getByRole('heading', { name: /Welcome to Habitify/i });
    expect(welcomeHeading).toBeInTheDocument();
  });
});
