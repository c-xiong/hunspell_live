import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
const App = () => {
    return (_jsxs(_Fragment, { children: [_jsx(Outlet, {}), _jsx(ToastContainer, { position: "top-center", autoClose: 1500, hideProgressBar: false, newestOnTop: false, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, pauseOnHover: true })] }));
};
export default App;
