import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/HomePage';
import ErrorPage from '../pages/ErrorPage';
const router = createBrowserRouter([
    {
        path: '/',
        element: _jsx(App, {}),
        errorElement: _jsx(ErrorPage, {}),
        children: [
            {
                index: true,
                element: _jsx(HomePage, {}),
            },
        ],
    },
]);
const AppRouter = () => {
    return _jsx(RouterProvider, { router: router });
};
export default AppRouter;
