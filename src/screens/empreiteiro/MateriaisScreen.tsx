import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
  TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { adicionarMaterial } from '../../services/obraService';
import { Material, Obra } from '../../types';
import { generateId } from '../../utils/uuid';

export default function MateriaisScreen({ route }: any) {
  const [obra, setObra] = useState<Obra>(route.params.obra);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');

  async function handleAdicionar() {
    if (!nome || !quantidade || !unidade || !valorUnitario) {
      return Alert.alert('Erro', 'Preencha todos os campos');
    }
    const novo: Material = {
      id: generateId(),
      nome,
      quantidade: parseFloat(quantidade.replace(',', '.')),
      unidade,
      valorUnitario: parseFloat(valorUnitario.replace(',', '.')),
      dataCompra: new Date().toISOString().split('T')[0],
    };
    try {
      await adicionarMaterial(obra.id, novo, obra.materiais);
      setObra({ ...obra, materiais: [...obra.materiais, novo] });
      setModalVisible(false);
      setNome(''); setQuantidade(''); setUnidade(''); setValorUnitario('');
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o material');
    }
  }

  const totalMateriais = obra.materiais.reduce(
    (s, m) => s + m.quantidade * m.valorUnitario, 0
  );

  return (
    <View style={styles.container}>
      <View style={styles.resumo}>
        <Text style={styles.resumoLabel}>Total em Materiais</Text>
        <Text style={styles.resumoValor}>R$ {totalMateriais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
      </View>

      <FlatList
        data={obra.materiais}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardDetalhe}>{item.quantidade} {item.unidade} × R$ {item.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            </View>
            <Text style={styles.cardTotal}>
              R$ {(item.quantidade * item.valorUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum material cadastrado</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Adicionar</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.modal}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitulo}>Novo Material</Text>
              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.input} placeholder="Ex: Cimento CP-II" placeholderTextColor="#aaa" value={nome} onChangeText={setNome} />
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Quantidade</Text>
                  <TextInput style={styles.input} placeholder="Ex: 50" placeholderTextColor="#aaa" value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Unidade</Text>
                  <TextInput style={styles.input} placeholder="Ex: sc" placeholderTextColor="#aaa" value={unidade} onChangeText={setUnidade} />
                </View>
              </View>
              <Text style={styles.label}>Valor Unitário (R$)</Text>
              <TextInput style={styles.input} placeholder="Ex: 35,00" placeholderTextColor="#aaa" value={valorUnitario} onChangeText={setValorUnitario} keyboardType="numeric" />
              <TouchableOpacity style={styles.button} onPress={handleAdicionar}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelar}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  resumo: { backgroundColor: '#F4821F', padding: 20, alignItems: 'center' },
  resumoLabel: { color: '#fff', fontSize: 13, opacity: 0.85 },
  resumoValor: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 10, padding: 14, elevation: 1 },
  cardNome: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardDetalhe: { fontSize: 12, color: '#777', marginTop: 2 },
  cardTotal: { fontSize: 14, fontWeight: 'bold', color: '#F4821F' },
  empty: { textAlign: 'center', marginTop: 60, color: '#aaa', fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#F4821F', borderRadius: 28, paddingVertical: 14, paddingHorizontal: 20, elevation: 4 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, maxHeight: '85%' },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 11, marginBottom: 12, fontSize: 15, color: '#333' },
  row: { flexDirection: 'row' },
  button: { backgroundColor: '#F4821F', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cancelar: { textAlign: 'center', color: '#999', fontSize: 14, padding: 8 },
});
