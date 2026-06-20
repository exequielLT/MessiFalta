import React from 'react';
import { View } from 'react-native';

export default function ResetPasswordRoute() {
  // En Expo Router, este componente define la ruta /reset-password.
  // La visualización de la pantalla de recuperación real se gestiona condicionalmente en src/app/_layout.tsx
  // mostrando <ActualizarContrasenaScreen /> cuando el estado global `isPasswordRecovery` es true.
  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
}
