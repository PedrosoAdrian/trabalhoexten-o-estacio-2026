import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { buscarObra } from '../../services/obraService';
import { Obra } from '../../types';

export default function ObraDetalhesScreen({ route, navigation }: any) {
  const { obraId } = route.params;
  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarObra(obraId).then((data) => {
      setObra(data);
      setLoading(false);
    });
  }, [obraId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#F4821F" />;
  if (!obra) return <Text style={{ padding: 20 }}>Obra não encontrada</Text>;

  const custoMateriais = obra.materiais.reduce((s, m) => s + m.quantidade * m.valorUnitario, 0);
  const custoMdo = obra.maoDeObra.reduce((s, m) => s + m.valorDiaria * m.diasTrabalhados, 0);
  const custoTotal = custoMateriais + custoMdo;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{obra.titulo}</Text>
      <Text style={styles.local}>{obra.localizacao}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
        <Text style={styles.row}>Orçado: <Text style={styles.value}>R$ {obra.valorTotal.toLocaleString('pt-BR')}</Text></Text>
        <Text style={styles.row}>Realizado: <Text style={[styles.value, custoTotal > obra.valorTotal && { color: 'red' }]}>R$ {custoTotal.toLocaleString('pt-BR')}</Text></Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Materiais ({obra.materiais.length})</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Materiais', { obra })}>
            <Text style={styles.link}>Ver todos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mão de Obra ({obra.maoDeObra.length})</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MaoDeObra', { obra })}>
            <Text style={styles.link}>Ver todos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Demandas ({obra.demandas.length})</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Demandas', { obra })}>
            <Text style={styles.link}>Ver todas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  titulo: { fontSize: 22, fontWeight: 'bold', padding: 20, paddingBottom: 4, color: '#333' },
  local: { fontSize: 14, color: '#777', paddingHorizontal: 20, marginBottom: 16 },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 10, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  row: { fontSize: 15, color: '#555', marginBottom: 4 },
  value: { fontWeight: 'bold', color: '#333' },
  link: { color: '#F4821F', fontSize: 14 },
});
