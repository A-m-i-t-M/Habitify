// src/__tests__/Signup.test.jsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Signup from '../pages/Signup'; // Corrected path from previous step
import userReducer from '../../redux/user/userSlice'; // Ensure this path is correct

// Mock components for testing navigation
const MockVerificationPage = () => <div>Verification Page Reached</div>;
const MockSigninPage = () => <div>Sign In Page Reached</div>; // For testing "Log In" link

const renderSignupPage = (initialRouteState = {}) => {
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState: {
      user: { currentUser: null, loading: false, error: null },
    },
  });

  const initialEntries = [{ pathname: '/signup', state: initialRouteState }];

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<MockVerificationPage />} />
          <Route path="/signin" element={<MockSigninPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('Signup Page', () => {
  // Restore fetch mock after each test
  afterEach(() => {
    if (global.fetch && global.fetch.mockClear) {
      global.fetch.mockClear();
      delete global.fetch;
    }
  });

  test('renders all form fields and the submit button', () => {
    renderSignupPage();
    expect(screen.getByRole('heading', { name: /Sign In/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Age')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Select Gender')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SIGN UP/i })).toBeInTheDocument();
    expect(screen.getByText('Have an account?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
  });

  test('allows typing into input fields', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const ageInput = screen.getByPlaceholderText('Age');
    const genderSelect = screen.getByRole('combobox');

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(ageInput, '25');
    await user.selectOptions(genderSelect, 'Male');

    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(ageInput).toHaveValue('25');
    expect(genderSelect).toHaveValue('Male');
  });

  test('handles successful form submission and navigates to verification', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    renderSignupPage();
    const testEmail = 'test@example.com';
    await user.type(screen.getByPlaceholderText('Username'), 'testuser');
    await user.type(screen.getByPlaceholderText('Email'), testEmail);
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.type(screen.getByPlaceholderText('Age'), '30');
    await user.selectOptions(screen.getByRole('combobox'), 'Female');

    const submitButton = screen.getByRole('button', { name: /SIGN UP/i });
    await user.click(submitButton);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/backend/auth/signup',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: testEmail,
          age: '30',
          gender: 'Female',
          password: 'password123',
        }),
      })
    );

    await waitFor(() => {
      expect(screen.getByText('Verification Page Reached')).toBeInTheDocument();
    });
  });

  test('displays error message on failed form submission', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true, // Even if success: false, an HTTP 200 can still return a JSON with an error message
        json: () => Promise.resolve({ success: false, message: 'Signup failed due to an error.' }),
      })
    );

    renderSignupPage();

    // Fill in form to enable submission (if needed) or ensure button is clickable
    await user.type(screen.getByPlaceholderText('Username'), 'failuser');
    await user.type(screen.getByPlaceholderText('Email'), 'fail@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'failpassword');
    await user.type(screen.getByPlaceholderText('Age'), '20');
    await user.selectOptions(screen.getByRole('combobox'), 'Other');

    const submitButton = screen.getByRole('button', { name: /SIGN UP/i });
    await user.click(submitButton);

    // Your component sets error to data.message: setError(data.message)
    // And renders: {error && <p className='text-red-500 mt-5'>{error}</p>}
    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument(); // Look for "Error occurred"
    });
  });

  test('navigates to signin page when "Log In" link is clicked', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const loginLink = screen.getByRole('link', { name: /Log In/i });
    await user.click(loginLink);

    await waitFor(() => {
      expect(screen.getByText('Sign In Page Reached')).toBeInTheDocument();
    });
  });

  test('uses email from location state if provided and sent in API call', async () => {
    const user = userEvent.setup();
    const initialEmail = "passedfromstate@example.com";
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }), // Assuming success for this test
      })
    );

    renderSignupPage({ email: initialEmail }); // Pass email in location.state via helper

    // Fill other required fields for submission
    await user.type(screen.getByPlaceholderText('Username'), 'stateuser');
    // Email field might not be typed into if eemail is used by the component logic
    await user.type(screen.getByPlaceholderText('Password'), 'statepassword123');
    await user.type(screen.getByPlaceholderText('Age'), '28');
    await user.selectOptions(screen.getByRole('combobox'), 'Male');

    const submitButton = screen.getByRole('button', { name: /SIGN UP/i });
    await user.click(submitButton);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/backend/auth/signup',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ // Expect the full body with the email from state
          username: 'stateuser',
          email: initialEmail,
          age: '28',
          gender: 'Male',
          password: 'statepassword123',
        }),
      })
    );
    // Optionally, check for navigation if that's part of the success flow
    await waitFor(() => {
      expect(screen.getByText('Verification Page Reached')).toBeInTheDocument();
    });
  });
});
