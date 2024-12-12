import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import Login from '../pages/LoginPage';
import Register from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import ErrorPage from '../pages/ErrorPage';
import ProfilePage from '../pages/ProfilePage';
import AboutPage from '../pages/AboutPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/about',
        element: <AboutPage />,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;