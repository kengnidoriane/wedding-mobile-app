import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const usePinAuth = () => {
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    const checkModal = () => {
      if (authService.showPinModal !== showPinModal) {
        setShowPinModal(authService.showPinModal);
      }
    };

    const interval = setInterval(checkModal, 100);
    return () => clearInterval(interval);
  }, [showPinModal]);

  const handlePinConfirm = async (pin: string) => {
    await authService.handlePinSubmit(pin);
  };

  const handlePinCancel = () => {
    authService.handlePinCancel();
  };

  return {
    showPinModal,
    handlePinConfirm,
    handlePinCancel
  };
};