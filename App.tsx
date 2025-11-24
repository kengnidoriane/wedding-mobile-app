import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/db/database';

export default function App() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return <AppNavigator />;
}