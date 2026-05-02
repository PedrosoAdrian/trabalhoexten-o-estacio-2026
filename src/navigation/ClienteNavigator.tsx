import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MinhasObrasScreen from '../screens/cliente/MinhasObrasScreen';
import ObraDetalhesClienteScreen from '../screens/cliente/ObraDetalhesClienteScreen';

const Stack = createNativeStackNavigator();

export default function ClienteNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F4821F' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="MinhasObras" component={MinhasObrasScreen} options={{ title: 'Minhas Obras' }} />
      <Stack.Screen name="ObraDetalhesCliente" component={ObraDetalhesClienteScreen} options={{ title: 'Detalhes da Obra' }} />
    </Stack.Navigator>
  );
}
