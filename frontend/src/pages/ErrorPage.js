import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouteError, Link } from 'react-router-dom';
const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);
    return (_jsxs("div", { className: "flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center dark:bg-slate-950", children: [_jsx("h1", { className: "text-4xl font-bold text-slate-900 dark:text-white", children: "Oops!" }), _jsx("p", { className: "text-slate-600 dark:text-slate-300", children: "Sorry, an unexpected error has occurred." }), _jsx("p", { className: "text-sm italic text-slate-400", children: error.statusText || error.message }), _jsx(Link, { to: "/", className: "mt-2 rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-700", children: "Back to home" })] }));
};
export default ErrorPage;
