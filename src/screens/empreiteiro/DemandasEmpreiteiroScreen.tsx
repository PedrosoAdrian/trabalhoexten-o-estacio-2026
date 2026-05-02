import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { responderDemanda } from '../../services/demandaService';
import { Demanda, DemandaStatus, Obra } from '../../types';

const STATUS_COLOR: Record<DemandaStatus, string> = {
  pendente: '#E67E22',
  em_analise: '#9B59B6',
  aprovada: '#27AE60',
  rejeitada: '#E74C3C',
};

export default function DemandasEmpreiteiroScreen({ route }: any) {
  const [obra, setObra] = useState<Obra>(route.params.obra);
  const [selected, setSelected] = useState<Demanda | null>(null);
  const [resposta, setResposta] = useState('');

  async function handleResponder(status: DemandaStatus) {
    if (!selected) return;
    try {
      await responderDemanda(obra.id, selected.id, status, resposta, obra.demandas);
      const atualizadas = obra.demandas.map((d) =>
        d.id === selected.id ? { ...d, status, resposta } : d
      );
      setObra({ ...obra, demandas: atualizadas });
      setSelected(null);
      setResposta('');
    } catch {
      Alert.alert('Erro', 'Não foi possível responder a demanda');
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={obra.demandas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setSelected(item); setResposta(item.resposta ?? ''); }}>
            <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] }]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
            <Text style={styles.cardTitulo}>{item.titulo}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.descricao}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma demanda</Text>}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>{selected?.titulo}</Text>
            <Text style={styles.modalDesc}>{selected?.descricao}</Text>
            <TextInput
              style={styles.input}
              placeholder="Escreva uma resposta..."
              value={resposta}
              onChangeText={setResposta}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#27AE60' }]} onPress={() => handleResponder('aprovada')}>
                <Text style={styles.btnText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#E74C3C' }]} onPress={() => handleResponder('rejeitada')}>
                <Text style={styles.btnText}>Rejeitar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 1 },
  badge: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardTitulo: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardDesc: { fontSize: 13, color: '#777', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 60, color: '#aaa' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  modalDesc: { fontSize: 14, color: '#555', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  btn: { flex: 1, borderRadius: 8, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelar: { textAlign: 'center', color: '#999', fontSize: 14, padding: 8 },
});
