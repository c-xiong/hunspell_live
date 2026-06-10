import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouteError } from 'react-router-dom';
const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);
    return (_jsxs("div", Object.assign({ id: "error-page" }, { children: [_jsx("h1", { children: "Oops!" }), _jsx("p", { children: "Sorry, an unexpected error has occurred." }), _jsx("p", { children: _jsx("i", { children: error.statusText || error.message }) })] })));
};
export default ErrorPage;
