import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { listarObrasPorCliente } from '../../services/obraService';
import { Obra } from '../../types';

const STATUS_LABEL: Record<string, string> = {
  planejamento: 'Planejamento',
  em_andamento: 'Em Andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
};

export default function MinhasObrasScreen({ navigation }: any) {
  const { usuario } = useAuth();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    listarObrasPorCliente(usuario.id).then((data) => {
      setObras(data);
      setLoading(false);
    });
  }, [usuario]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#F4821F" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Minhas Obras</Text>
      <FlatList
        data={obras}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ObraDetalhesCliente', { obra: item })}
          >
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.local}>{item.localizacao}</Text>
            <Text style={styles.status}>{STATUS_LABEL[item.status]}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma obra associada</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { fontSize: 22, fontWeight: 'bold', padding: 20, color: '#333' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 10, padding: 16, elevation: 2 },
  titulo: { fontSize: 16, fontWeight: '600', color: '#333' },
  local: { fontSize: 13, color: '#777', marginTop: 4 },
  status: { fontSize: 13, color: '#F4821F', fontWeight: 'bold', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 60, color: '#aaa', fontSize: 15 },
});
