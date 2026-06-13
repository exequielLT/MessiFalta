import React from 'react';
import { NavigationContext } from '@react-navigation/native';
import { AddFiguritaScreen } from '../screens/AddFiguritaScreen';

interface AddFiguritaWrapperProps {
  onClose: () => void;
}

export default function AddFiguritaWrapper({ onClose }: AddFiguritaWrapperProps) {
  const mockNavigation = {
    goBack: () => {
      onClose();
    },
    isFocused: () => true,
    addListener: () => () => {},
    removeListener: () => {},
  };

  return (
    <NavigationContext.Provider value={mockNavigation as any}>
      <AddFiguritaScreen />
    </NavigationContext.Provider>
  );
}
