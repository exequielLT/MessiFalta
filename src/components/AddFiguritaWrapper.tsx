import React from 'react';
import { AddFiguritaScreen } from '@/screens/AddFiguritaScreen';
import { Figurita } from '../types';

interface AddFiguritaWrapperProps {
  onClose: () => void;
  figurita?: Figurita;
}

export default function AddFiguritaWrapper({ onClose, figurita }: AddFiguritaWrapperProps) {
  return <AddFiguritaScreen onClose={onClose} figurita={figurita} />;
}

