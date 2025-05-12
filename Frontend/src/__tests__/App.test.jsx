// import { render, screen } from '@testing-library/react'; // No need for 'within' with this approach
// import { Provider } from 'react-redux';
// import { configureStore } from '@reduxjs/toolkit';
// import App from '../App';
// import userReducer from '../../redux/user/userSlice';

// const mockStore = configureStore({
//   reducer: {
//     user: userReducer,
//   },
//   preloadedState: {
//     user: {
//       currentUser: null,
//       loading: false,
//       error: null,
//     },
//   },
// });

// test('renders Habitify header logo', () => { // Test name slightly more specific
//   render(
//     <Provider store={mockStore}>
//       <App />
//     </Provider>
//   );
//   // Find an h1 heading with the name "Habitify"
//   const headerLogo = screen.getByRole('heading', { name: /Habitify/i, level: 1 });
//   expect(headerLogo).toBeInTheDocument();
// });










// src/__tests__/App.test.jsx
// (Should be correct as per your previous version)
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import userReducer from '../../redux/user/userSlice';

const renderWithProvidersAndRouter = (ui, { route = '/', preloadedState = {} } = {}) => {
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState: {
      user: { currentUser: null, loading: false, error: null, ...preloadedState.user },
      ...preloadedState,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

test('renders Habitify header logo on landing page', () => {
  renderWithProvidersAndRouter(<App />, { route: '/' });
  const headerLogo = screen.getByRole('heading', { name: /Habitify/i, level: 1 });
  expect(headerLogo).toBeInTheDocument();
});

test('navigates to and renders Signup page', () => {
  renderWithProvidersAndRouter(<App />, { route: '/signup' });
  // Assuming your Signup page has a unique heading like "Create an Account"
  // Please adjust this to match the actual content of your Signup.jsx
//   const signupHeading = screen.getByRole('heading', { name: /Create an Account/i });
  const signupHeading = screen.getByRole('heading', { name: /Sign In/i });

  expect(signupHeading).toBeInTheDocument();
  expect(screen.queryByText(/Welcome to Habitify/i)).not.toBeInTheDocument();
});
