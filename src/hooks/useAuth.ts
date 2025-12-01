/**
 * Hook pour gérer l'authentification admin
 */

import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalData, setPinModalData] = useState({
    title: '',
    message: ''
  });

  useEffect(() => {
    const checkPinModal = () => {
      if (authService.showPinModal && !showPinModal) {
        setShowPinModal(true);
        setPinModalData({
          title: 'Authentification Admin',
          message: 'Entrez le code PIN administrateur :'
        });
      }
    };

    const interval = setInterval(checkPinModal, 100);
    return () => clearInterval(interval);
  }, [showPinModal]);

  const handlePinConfirm = async (pin: string) => {
    setShowPinModal(false);
    await authService.handlePinSubmit(pin);
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
    authService.handlePinCancel();
  };

  return {
    showPinModal,
    pinModalData,
    handlePinConfirm,
    handlePinCancel
  };
};