import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/db/database';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}