import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/empreiteiro/DashboardScreen';
import ObraDetalhesScreen from '../screens/empreiteiro/ObraDetalhesScreen';
import DemandasEmpreiteiroScreen from '../screens/empreiteiro/DemandasEmpreiteiroScreen';

const Stack = createNativeStackNavigator();

export default function EmpreiteiroNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F4821F' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'ObrasTrack' }} />
      <Stack.Screen name="ObraDetalhes" component={ObraDetalhesScreen} options={{ title: 'Detalhes da Obra' }} />
      <Stack.Screen name="Demandas" component={DemandasEmpreiteiroScreen} options={{ title: 'Demandas' }} />
    </Stack.Navigator>
  );
}
