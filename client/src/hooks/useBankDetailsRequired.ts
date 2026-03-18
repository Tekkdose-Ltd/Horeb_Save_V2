import { useState } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to check if user has completed bank details and show modal if needed
 */
export function useBankDetailsRequired() {
  const { user } = useAuth();
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);

  /**
   * Check if user has bank details on file
   */
  const hasBankDetails = () => {
    if (!user) return false;
    
    // Check if user has completed bank details
    return !!(
      user.bankAccountHolderName &&
      user.bankAccountNumber &&
      user.bankSortCode &&
      user.bankDetailsVerified
    );
  };

  /**
   * Require bank details before allowing an action
   * @param action - Callback to execute if bank details are complete
   * @returns true if bank details exist, false if modal was shown
   */
  const requireBankDetails = (action?: () => void): boolean => {
    if (hasBankDetails()) {
      // Bank details exist, execute action if provided
      if (action) action();
      return true;
    } else {
      // Show modal to collect bank details
      setShowBankDetailsModal(true);
      return false;
    }
  };

  /**
   * Handle successful bank details submission
   * @param callback - Optional callback to execute after successful submission
   */
  const handleBankDetailsSuccess = (callback?: () => void) => {
    setShowBankDetailsModal(false);
    if (callback) {
      // Small delay to allow modal to close smoothly
      setTimeout(callback, 300);
    }
  };

  return {
    hasBankDetails: hasBankDetails(),
    showBankDetailsModal,
    setShowBankDetailsModal,
    requireBankDetails,
    handleBankDetailsSuccess,
  };
}
