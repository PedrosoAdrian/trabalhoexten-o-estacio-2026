import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { listarObrasPorEmpreiteiro } from '../../services/obraService';
import { Obra } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  planejamento: '#9B59B6',
  em_andamento: '#27AE60',
  pausada: '#E67E22',
  concluida: '#2980B9',
};

export default function DashboardScreen({ navigation }: any) {
  const { usuario } = useAuth();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    listarObrasPorEmpreiteiro(usuario.id).then((data) => {
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
            onPress={() => navigation.navigate('ObraDetalhes', { obraId: item.id })}
          >
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.obraTitulo}>{item.titulo}</Text>
              <Text style={styles.obraLocal}>{item.localizacao}</Text>
            </View>
            <Text style={styles.obraValor}>R$ {item.valorTotal.toLocaleString('pt-BR')}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma obra cadastrada</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NovaObra')}>
        <Text style={styles.fabText}>+ Nova Obra</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { fontSize: 22, fontWeight: 'bold', padding: 20, color: '#333' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  obraTitulo: { fontSize: 16, fontWeight: '600', color: '#333' },
  obraLocal: { fontSize: 13, color: '#777', marginTop: 2 },
  obraValor: { fontSize: 14, fontWeight: 'bold', color: '#F4821F' },
  empty: { textAlign: 'center', marginTop: 60, color: '#aaa', fontSize: 15 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#F4821F',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
