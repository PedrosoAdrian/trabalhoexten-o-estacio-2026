import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarObra, vincularClientePorEmail, buscarClientesDaObra, desvincularCliente } from '../../services/obraService';
import { Obra } from '../../types';
import { Usuario } from '../../types';

export default function ObraDetalhesScreen({ route, navigation }: any) {
  const { obraId } = route.params;
  const [obra, setObra] = useState<Obra | null>(null);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [vinculando, setVinculando] = useState(false);

  async function carregarObra() {
    setLoading(true);
    const data = await buscarObra(obraId);
    setObra(data);
    if (data && data.clientesIds.length > 0) {
      const lista = await buscarClientesDaObra(data.clientesIds);
      setClientes(lista);
    } else {
      setClientes([]);
    }
    setLoading(false);
  }

  useFocusEffect(useCallback(() => { carregarObra(); }, [obraId]));

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () =>
          obra ? (
            <TouchableOpacity onPress={() => navigation.navigate('EditarObra', { obra })}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginRight: 4 }}>Editar</Text>
            </TouchableOpacity>
          ) : null,
      });
    }, [obra])
  );

  async function handleVincular() {
    if (!emailInput.trim()) return;
    setVinculando(true);
    try {
      const novosIds = await vincularClientePorEmail(obraId, emailInput.trim().toLowerCase(), obra!.clientesIds);
      setModalVisible(false);
      setEmailInput('');
      const lista = await buscarClientesDaObra(novosIds);
      setClientes(lista);
      setObra({ ...obra!, clientesIds: novosIds });
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setVinculando(false);
    }
  }

  async function handleDesvincular(clienteId: string, nome: string) {
    Alert.alert('Desvincular', `Remover ${nome} desta obra?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive', onPress: async () => {
          const novosIds = await desvincularCliente(obraId, clienteId, obra!.clientesIds);
          setClientes((prev) => prev.filter((c) => c.id !== clienteId));
          setObra({ ...obra!, clientesIds: novosIds });
        },
      },
    ]);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#F4821F" />;
  if (!obra) return <Text style={{ padding: 20 }}>Obra não encontrada</Text>;

  const custoMateriais = obra.materiais.reduce((s, m) => s + m.quantidade * m.valorUnitario, 0);
  const custoMdo = obra.maoDeObra.reduce((s, m) => s + m.valorDiaria * m.diasTrabalhados, 0);
  const custoTotal = custoMateriais + custoMdo;

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>{obra.titulo}</Text>
        <Text style={styles.local}>{obra.localizacao}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
          <Text style={styles.row}>Orçado: <Text style={styles.value}>R$ {obra.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text></Text>
          <Text style={styles.row}>Realizado: <Text style={[styles.value, custoTotal > obra.valorTotal && { color: '#E74C3C' }]}>R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text></Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clientes ({clientes.length})</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.link}>+ Vincular</Text>
            </TouchableOpacity>
          </View>
          {clientes.map((c) => (
            <View key={c.id} style={styles.clienteItem}>
              <View style={styles.clienteAvatar}>
                <Text style={styles.clienteAvatarText}>{c.nome.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.clienteNome}>{c.nome}</Text>
                <Text style={styles.clienteEmail}>{c.email}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDesvincular(c.id, c.nome)}>
                <Text style={styles.desvincular}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}
          {clientes.length === 0 && (
            <Text style={styles.emptySmall}>Nenhum cliente vinculado</Text>
          )}
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

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Vincular Cliente</Text>
            <Text style={styles.modalDesc}>Informe o e-mail cadastrado do cliente:</Text>
            <TextInput
              style={styles.input}
              placeholder="cliente@email.com"
              placeholderTextColor="#aaa"
              value={emailInput}
              onChangeText={setEmailInput}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
            <TouchableOpacity style={styles.button} onPress={handleVincular} disabled={vinculando}>
              <Text style={styles.buttonText}>{vinculando ? 'Vinculando...' : 'Vincular'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  titulo: { fontSize: 22, fontWeight: 'bold', padding: 20, paddingBottom: 4, color: '#333' },
  local: { fontSize: 14, color: '#777', paddingHorizontal: 20, marginBottom: 16 },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 10, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  row: { fontSize: 15, color: '#555', marginBottom: 4 },
  value: { fontWeight: 'bold', color: '#333' },
  link: { color: '#F4821F', fontSize: 14 },
  clienteItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  clienteAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F4821F', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  clienteAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  clienteNome: { fontSize: 14, fontWeight: '600', color: '#333' },
  clienteEmail: { fontSize: 12, color: '#888', marginTop: 1 },
  desvincular: { fontSize: 12, color: '#E74C3C', fontWeight: '600' },
  emptySmall: { fontSize: 13, color: '#aaa', paddingTop: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: '#333' },
  modalDesc: { fontSize: 14, color: '#666', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 15, color: '#333', marginBottom: 16 },
  button: { backgroundColor: '#F4821F', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cancelar: { textAlign: 'center', color: '#999', fontSize: 14, padding: 8 },
});
