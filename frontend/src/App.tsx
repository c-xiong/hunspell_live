import React from "react";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const App: React.FC = () => {
  return (
    <>
      <Outlet />
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
