import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

interface RouterError {
  statusText?: string;
  message?: string;
}

const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouterError;
  console.error(error);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Oops!</h1>
      <p className="text-slate-600 dark:text-slate-300">
        Sorry, an unexpected error has occurred.
      </p>
      <p className="text-sm italic text-slate-400">
        {error.statusText || error.message}
      </p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-700"
      >
        Back to home
      </Link>
    </div>
  );
};

export default ErrorPage;
