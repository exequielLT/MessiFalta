import React from 'react';
import { AddFiguritaScreen } from '../screens/AddFiguritaScreen';

interface AddFiguritaWrapperProps {
  onClose: () => void;
}

export default function AddFiguritaWrapper({ onClose }: AddFiguritaWrapperProps) {
  return <AddFiguritaScreen onClose={onClose} />;
}
