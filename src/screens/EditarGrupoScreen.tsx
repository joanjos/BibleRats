import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const TIPOS_PLANO = [
  { valor: 'sequencial', label: '📖 Sequencial (Gênesis ao Apocalipse)' },
  { valor: 'anual', label: '📅 Plano anual (Bíblia em 1 ano)' },
  { valor: 'personalizado', label: '✏️ O grupo escolhe a passagem' },
];

const CAPITULOS_POR_DIA = [1, 2, 3, 4, 5];
const CAPITULOS_POR_DIA_ANUAL = [3, 4, 5];

const DURACOES = [
  { valor: 1, label: '1 mês' },
  { valor: 3, label: '3 meses' },
  { valor: 6, label: '6 meses' },
  { valor: 12, label: '1 ano' },
];

const TIPOS_CHECKIN = [
  { valor: 'diario', label: '📅 1 check-in por dia', descricao: 'O usuário pode fazer apenas 1 check-in por dia' },
  { valor: 'por_capitulo', label: '📖 1 check-in por capítulo lido', descricao: 'O usuário pode fazer check-in para cada capítulo lido' },
];

export default function EditarGrupoScreen({ route, navigation }: any) {
  const { grupo } = route.params;
  const [nome, setNome] = useState(grupo.nome);
  const [descricao, setDescricao] = useState(grupo.descricao || '');
  const [tipoPlano, setTipoPlano] = useState(grupo.tipo_plano || 'sequencial');
  const [capsPorDia, setCapsPorDia] = useState(grupo.capitulos_por_dia || 1);
  const [tipoCheckin, setTipoCheckin] = useState(grupo.tipo_checkin || 'diario');
  const [loading, setLoading] = useState(false);

  function calcularMesesRestantes(): number {
    if (!grupo.data_fim) return 1;
    const fim = new Date(grupo.data_fim);
    const inicio = new Date(grupo.data_inicio);
    const meses = Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return meses;
  }

  const [duracaoMeses, setDuracaoMeses] = useState(calcularMesesRestantes());

  useEffect(() => {
    if (tipoPlano === 'anual') {
      setDuracaoMeses(12);
      if (capsPorDia < 3) setCapsPorDia(3);
    }
  }, [tipoPlano]);

  async function handleSalvar() {
    if (nome.trim().length < 3) {
      alert('O nome do grupo precisa ter pelo menos 3 caracteres.');
      return;
    }

    setLoading(true);

    const dataFim = new Date(grupo.data_inicio);
    dataFim.setMonth(dataFim.getMonth() + duracaoMeses);

    const { error } = await supabase
      .from('grupos')
      .update({
        nome: nome.trim(),
        descricao: descricao.trim(),
        tipo_plano: tipoPlano,
        capitulos_por_dia: capsPorDia,
        data_fim: dataFim.toISOString().split('T')[0],
        tipo_checkin: tipoCheckin,
      })
      .eq('id', grupo.id);

    setLoading(false);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      alert('Grupo atualizado com sucesso! ✅');
      navigation.goBack();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.voltar}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Editar Grupo</Text>

      <Text style={styles.label}>Nome do grupo</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Descrição (opcional)</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Plano de leitura</Text>
      {TIPOS_PLANO.map((tipo) => (
        <TouchableOpacity
          key={tipo.valor}
          style={[styles.opcao, tipoPlano === tipo.valor && styles.opcaoSelecionada]}
          onPress={() => setTipoPlano(tipo.valor)}
        >
          <Text style={[styles.opcaoTexto, tipoPlano === tipo.valor && styles.opcaoTextoSelecionado]}>
            {tipo.label}
          </Text>
        </TouchableOpacity>
      ))}

      {tipoPlano !== 'personalizado' && (
        <>
          <Text style={[styles.label, { marginTop: 16 }]}>Capítulos por dia</Text>
          <View style={styles.capsContainer}>
            {(tipoPlano === 'anual' ? CAPITULOS_POR_DIA_ANUAL : CAPITULOS_POR_DIA).map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.capBtn, capsPorDia === n && styles.capBtnSelecionado]}
                onPress={() => setCapsPorDia(n)}
              >
                <Text style={[styles.capBtnTexto, capsPorDia === n && styles.capBtnTextoSelecionado]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={[styles.label, { marginTop: 16 }]}>✅ Regra de check-in</Text>
      {tipoPlano === 'anual' ? (
        <View style={styles.duracaoTravada}>
          <Text style={styles.duracaoTravadaTexto}>📅 Fixado em 1 check-in por dia (plano anual)</Text>
        </View>
      ) : (
        TIPOS_CHECKIN.map((tipo) => (
          <TouchableOpacity
            key={tipo.valor}
            style={[styles.opcao, tipoCheckin === tipo.valor && styles.opcaoSelecionada]}
            onPress={() => setTipoCheckin(tipo.valor)}
          >
            <Text style={[styles.opcaoTexto, tipoCheckin === tipo.valor && styles.opcaoTextoSelecionado]}>
              {tipo.label}
            </Text>
            <Text style={[styles.opcaoDescricao, tipoCheckin === tipo.valor && styles.opcaoDescricaoSelecionada]}>
              {tipo.descricao}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={[styles.label, { marginTop: 16 }]}>⏱️ Duração da competição</Text>
      {tipoPlano === 'anual' ? (
        <View style={styles.duracaoTravada}>
          <Text style={styles.duracaoTravadaTexto}>📅 Fixado em 1 ano (plano anual)</Text>
        </View>
      ) : (
        <View style={styles.duracaoContainer}>
          {DURACOES.map((d) => (
            <TouchableOpacity
              key={d.valor}
              style={[styles.duracaoBtn, duracaoMeses === d.valor && styles.duracaoBtnSelecionado]}
              onPress={() => setDuracaoMeses(d.valor)}
            >
              <Text style={[styles.duracaoBtnTexto, duracaoMeses === d.valor && styles.duracaoBtnTextoSelecionado]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.codigoTexto}>Código do grupo: <Text style={styles.codigo}>{grupo.codigo}</Text></Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1B4F8A" style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSalvar}>
          <Text style={styles.buttonText}>Salvar alterações</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  voltar: { color: '#1B4F8A', fontSize: 16, marginTop: 48, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1B4F8A' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#C9DEF4', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 16 },
  inputMultiline: { minHeight: 80 },
  opcao: { borderWidth: 1, borderColor: '#C9DEF4', borderRadius: 8, padding: 14, marginBottom: 8 },
  opcaoSelecionada: { backgroundColor: '#1B4F8A', borderColor: '#1B4F8A' },
  opcaoTexto: { fontSize: 15, color: '#333' },
  opcaoTextoSelecionado: { color: '#fff', fontWeight: 'bold' },
  opcaoDescricao: { fontSize: 12, color: '#999', marginTop: 4 },
  opcaoDescricaoSelecionada: { color: '#C9DEF4' },
  capsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  capBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#C9DEF4', justifyContent: 'center', alignItems: 'center' },
  capBtnSelecionado: { backgroundColor: '#1B4F8A', borderColor: '#1B4F8A' },
  capBtnTexto: { fontSize: 16, color: '#333' },
  capBtnTextoSelecionado: { color: '#fff', fontWeight: 'bold' },
  duracaoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  duracaoBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#C9DEF4' },
  duracaoBtnSelecionado: { backgroundColor: '#1B4F8A', borderColor: '#1B4F8A' },
  duracaoBtnTexto: { fontSize: 14, color: '#333' },
  duracaoBtnTextoSelecionado: { color: '#fff', fontWeight: 'bold' },
  duracaoTravada: { backgroundColor: '#EEF4FB', borderRadius: 8, padding: 14, marginBottom: 16 },
  duracaoTravadaTexto: { color: '#1B4F8A', fontSize: 14, fontWeight: '600' },
  codigoTexto: { fontSize: 14, color: '#666', marginTop: 8, marginBottom: 16 },
  codigo: { fontWeight: 'bold', color: '#1B4F8A' },
  button: { backgroundColor: '#1B4F8A', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});