import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './Router';

/*
Creating the Router Provider from the exportet Route
 */
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
