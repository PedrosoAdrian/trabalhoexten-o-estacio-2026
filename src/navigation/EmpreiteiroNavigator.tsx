import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/empreiteiro/DashboardScreen';
import ObraDetalhesScreen from '../screens/empreiteiro/ObraDetalhesScreen';
import DemandasEmpreiteiroScreen from '../screens/empreiteiro/DemandasEmpreiteiroScreen';
import NovaObraScreen from '../screens/empreiteiro/NovaObraScreen';
import EditarObraScreen from '../screens/empreiteiro/EditarObraScreen';
import MateriaisScreen from '../screens/empreiteiro/MateriaisScreen';
import MaoDeObraScreen from '../screens/empreiteiro/MaoDeObraScreen';

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
      <Stack.Screen name="NovaObra" component={NovaObraScreen} options={{ title: 'Nova Obra' }} />
      <Stack.Screen name="EditarObra" component={EditarObraScreen} options={{ title: 'Editar Obra' }} />
      <Stack.Screen name="Materiais" component={MateriaisScreen} options={{ title: 'Materiais' }} />
      <Stack.Screen name="MaoDeObra" component={MaoDeObraScreen} options={{ title: 'Mão de Obra' }} />
    </Stack.Navigator>
  );
}
