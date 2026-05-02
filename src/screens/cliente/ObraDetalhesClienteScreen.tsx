import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { criarDemanda } from '../../services/demandaService';
import { useAuth } from '../../contexts/AuthContext';
import { Demanda, DemandaTipo, Obra } from '../../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function ObraDetalhesClienteScreen({ route }: any) {
  const { usuario } = useAuth();
  const [obra, setObra] = useState<Obra>(route.params.obra);
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<DemandaTipo>('mudanca');

  async function handleEnviarDemanda() {
    if (!titulo || !descricao) return Alert.alert('Preencha todos os campos');
    const nova: Demanda = {
      id: uuidv4(),
      titulo,
      descricao,
      tipo,
      status: 'pendente',
      clienteId: usuario!.id,
      dataCriacao: new Date().toISOString(),
    };
    try {
      await criarDemanda(obra.id, nova, obra.demandas);
      setObra({ ...obra, demandas: [...obra.demandas, nova] });
      setModalVisible(false);
      setTitulo('');
      setDescricao('');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a demanda');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{obra.titulo}</Text>
      <Text style={styles.local}>{obra.localizacao}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cronograma</Text>
        <Text style={styles.row}>Início: {new Date(obra.dataInicio).toLocaleDateString('pt-BR')}</Text>
        <Text style={styles.row}>Previsão de término: {new Date(obra.dataPrevisaoFim).toLocaleDateString('pt-BR')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demandas</Text>
        {obra.demandas.map((d) => (
          <View key={d.id} style={styles.demandaItem}>
            <Text style={styles.demandaTitulo}>{d.titulo}</Text>
            <Text style={styles.demandaStatus}>{d.status}</Text>
            {d.resposta && <Text style={styles.demandaResposta}>Resposta: {d.resposta}</Text>}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>+ Nova Demanda</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Nova Demanda</Text>
            <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />
            <View style={styles.tipoRow}>
              {(['mudanca', 'nova_demanda'] as DemandaTipo[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tipoBtn, tipo === t && styles.tipoBtnActive]}
                  onPress={() => setTipo(t)}
                >
                  <Text style={[styles.tipoBtnText, tipo === t && styles.tipoBtnTextActive]}>
                    {t === 'mudanca' ? 'Mudança' : 'Nova Demanda'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleEnviarDemanda}>
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  titulo: { fontSize: 22, fontWeight: 'bold', padding: 20, paddingBottom: 4, color: '#333' },
  local: { fontSize: 14, color: '#777', paddingHorizontal: 20, marginBottom: 16 },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 10, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  row: { fontSize: 14, color: '#555', marginBottom: 4 },
  demandaItem: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, marginTop: 10 },
  demandaTitulo: { fontSize: 14, fontWeight: '600', color: '#333' },
  demandaStatus: { fontSize: 12, color: '#F4821F', marginTop: 2 },
  demandaResposta: { fontSize: 13, color: '#555', marginTop: 4, fontStyle: 'italic' },
  button: { backgroundColor: '#F4821F', borderRadius: 8, padding: 14, alignItems: 'center', margin: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  tipoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  tipoBtn: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, alignItems: 'center' },
  tipoBtnActive: { borderColor: '#F4821F', backgroundColor: '#FFF3E8' },
  tipoBtnText: { color: '#555', fontSize: 13 },
  tipoBtnTextActive: { color: '#F4821F', fontWeight: 'bold' },
  cancelar: { textAlign: 'center', color: '#999', fontSize: 14, padding: 8 },
});
