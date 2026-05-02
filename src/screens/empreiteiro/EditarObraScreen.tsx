import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { atualizarObra } from '../../services/obraService';
import { Obra, ObraStatus } from '../../types';

const STATUS_OPTIONS: ObraStatus[] = ['planejamento', 'em_andamento', 'pausada', 'concluida'];
const STATUS_LABEL: Record<ObraStatus, string> = {
  planejamento: 'Planejamento',
  em_andamento: 'Em Andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
};

function aplicarMascara(texto: string): string {
  const nums = texto.replace(/\D/g, '').slice(0, 8);
  if (nums.length <= 2) return nums;
  if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
  return `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4)}`;
}

function isoParaBR(iso: string): string {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function brParaISO(data: string): string {
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
}

export default function EditarObraScreen({ route, navigation }: any) {
  const obra: Obra = route.params.obra;
  const [titulo, setTitulo] = useState(obra.titulo);
  const [localizacao, setLocalizacao] = useState(obra.localizacao);
  const [valorTotal, setValorTotal] = useState(String(obra.valorTotal));
  const [dataInicio, setDataInicio] = useState(isoParaBR(obra.dataInicio));
  const [dataPrevisaoFim, setDataPrevisaoFim] = useState(isoParaBR(obra.dataPrevisaoFim));
  const [status, setStatus] = useState<ObraStatus>(obra.status);
  const [loading, setLoading] = useState(false);

  async function handleSalvar() {
    if (!titulo || !localizacao || !valorTotal || !dataInicio || !dataPrevisaoFim) {
      return Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
    }
    if (dataInicio.length < 10 || dataPrevisaoFim.length < 10) {
      return Alert.alert('Erro', 'Datas inválidas. Use o formato DD/MM/AAAA');
    }
    setLoading(true);
    try {
      await atualizarObra(obra.id, {
        titulo,
        localizacao,
        valorTotal: parseFloat(valorTotal.replace(',', '.')),
        dataInicio: brParaISO(dataInicio),
        dataPrevisaoFim: brParaISO(dataPrevisaoFim),
        status,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>Título *</Text>
      <TextInput style={styles.input} placeholderTextColor="#aaa" value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Localização *</Text>
      <TextInput style={styles.input} placeholderTextColor="#aaa" value={localizacao} onChangeText={setLocalizacao} />

      <Text style={styles.label}>Valor Total Orçado (R$) *</Text>
      <TextInput style={styles.input} placeholderTextColor="#aaa" value={valorTotal} onChangeText={setValorTotal} keyboardType="numeric" />

      <Text style={styles.label}>Data de Início *</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        placeholderTextColor="#aaa"
        value={dataInicio}
        onChangeText={(t) => setDataInicio(aplicarMascara(t))}
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>Previsão de Término *</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        placeholderTextColor="#aaa"
        value={dataPrevisaoFim}
        onChangeText={(t) => setDataPrevisaoFim(aplicarMascara(t))}
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusBtn, status === s && styles.statusBtnActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.statusBtnText, status === s && styles.statusBtnTextActive]}>
              {STATUS_LABEL[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 16, fontSize: 15, color: '#333', backgroundColor: '#fff',
  },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  statusBtn: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff',
  },
  statusBtnActive: { borderColor: '#F4821F', backgroundColor: '#FFF3E8' },
  statusBtnText: { fontSize: 13, color: '#555' },
  statusBtnTextActive: { color: '#F4821F', fontWeight: 'bold' },
  button: {
    backgroundColor: '#F4821F', borderRadius: 8,
    padding: 14, alignItems: 'center', marginBottom: 40,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
