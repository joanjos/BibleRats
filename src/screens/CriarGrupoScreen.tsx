import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  { valor: 'diario', label: '📅 Dias ativos', descricao: 'O usuário pode fazer apenas um check-in por dia' },
  { valor: 'por_capitulo', label: '📖 Contagem de check-ins', descricao: 'O usuário pode fazer check-in para cada capítulo lido' },
];

export default function CriarGrupoScreen({ navigation }: any) {
  const { session } = useAuth();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoPlano, setTipoPlano] = useState('sequencial');
  const [capsPorDia, setCapsPorDia] = useState(1);
  const [duracaoMeses, setDuracaoMeses] = useState(1);
  const [tipoCheckin, setTipoCheckin] = useState('diario');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tipoPlano === 'anual') {
      setDuracaoMeses(12);
      if (capsPorDia < 3) setCapsPorDia(3);
      setTipoCheckin('diario');
    }
  }, [tipoPlano]);

  async function handleCriarGrupo() {
    if (nome.trim().length < 3) {
      alert('O nome do grupo precisa ter pelo menos 3 caracteres.');
      return;
    }

    setLoading(true);

    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setMonth(dataFim.getMonth() + duracaoMeses);

    const { data, error } = await supabase.from('grupos').insert({
      nome: nome.trim(),
      descricao: descricao.trim(),
      id_dono: session?.user.id,
      tipo_plano: tipoPlano,
      capitulos_por_dia: capsPorDia,
      data_inicio: dataInicio.toISOString().split('T')[0],
      data_fim: dataFim.toISOString().split('T')[0],
      tipo_checkin: tipoCheckin,
    }).select().single();

    if (error) {
      alert('Erro ao criar grupo: ' + error.message);
      setLoading(false);
      return;
    }

    await supabase.from('membros_grupos').insert({
      id_grupo: data.id,
      id_usuario: session?.user.id,
    });

    setLoading(false);
    alert('Grupo criado com sucesso! 🎉');
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.voltar}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Criar Novo Grupo</Text>

      <Text style={styles.label}>Nome do grupo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Família Silva, Célula Jovens..."
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>Descrição (opcional)</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Sobre o que é esse grupo?"
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

      {loading ? (
        <ActivityIndicator size="large" color="#1B4F8A" style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCriarGrupo}>
          <Text style={styles.buttonText}>Criar Grupo</Text>
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
  button: { backgroundColor: '#1B4F8A', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});