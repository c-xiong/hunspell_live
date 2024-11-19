import React from "react";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ChakraProvider } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const App: React.FC = () => {
  return (
    <ChakraProvider>
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
    </ChakraProvider>
  );
};

export default App;
