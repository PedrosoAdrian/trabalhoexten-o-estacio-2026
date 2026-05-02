import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import EmpreiteiroNavigator from './EmpreiteiroNavigator';
import ClienteNavigator from './ClienteNavigator';

export default function AppNavigator() {
  const { user, usuario, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#F4821F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : usuario?.tipo === 'empreiteiro' ? (
        <EmpreiteiroNavigator />
      ) : (
        <ClienteNavigator />
      )}
    </NavigationContainer>
  );
}
