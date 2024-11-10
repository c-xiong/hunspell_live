import React from "react";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ChakraProvider } from '@chakra-ui/react'
import HomePage from './components/HomePage'

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <HomePage />
    </ChakraProvider>
  );
};

export default App;
