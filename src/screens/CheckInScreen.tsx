import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { calcularPassagemDoDia } from '../services/planoLeitura';
import { atualizarStreak } from '../services/streak';
import { getLivros } from '../services/bibliaApi';
import { proximaPassagem, passagemParaIndice, indiceParaPassagem } from '../services/sequenciaLeitura';

const LIVROS = getLivros();

export default function CheckInScreen({ route, navigation }: any) {
  const { session } = useAuth();
  const { grupo } = route.params || {};
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [passagemHoje, setPassagemHoje] = useState('');
  const [proximaPassagemValida, setProximaPassagemValida] = useState<{ livro: any; capitulo: number } | null>(null);
  const [livroSelecionado, setLivroSelecionado] = useState<any>(null);
  const [capituloSelecionado, setCapituloSelecionado] = useState<number | null>(null);
  const [modalLivro, setModalLivro] = useState(false);
  const [modalCapitulo, setModalCapitulo] = useState(false);
  const [buscaLivro, setBuscaLivro] = useState('');

  useEffect(() => {
    async function carregarPassagem() {
      if (!grupo) return;

      if (grupo.tipo_plano === 'sequencial') {
        await carregarProximaSequencial();
      } else if (grupo.tipo_plano !== 'personalizado') {
        const passagem = await calcularPassagemDoDia(grupo);
        setPassagemHoje(passagem);
      }
    }
    carregarPassagem();
  }, []);

  async function carregarProximaSequencial() {
    const capsPorDia = grupo.capitulos_por_dia || 1;

    const { data } = await supabase
      .from('checkins')
      .select('passagem_biblica')
      .eq('id_usuario', session?.user.id)
      .eq('id_grupo', grupo.id)
      .order('data_criacao', { ascending: false })
      .limit(1);

    let indiceInicio = 0;

    if (data && data.length > 0) {
      const ultimaPassagem = data[0].passagem_biblica;

      // Extrair o último capítulo do range (ex: "Gênesis 6-10" → pegar o 10)
      const partes = ultimaPassagem.split(' ');
      const rangeCapitulos = partes[partes.length - 1]; // "6-10" ou "10"

      if (rangeCapitulos.includes('-')) {
        // É um range — pegar o último número
        const ultimoCapitulo = parseInt(rangeCapitulos.split('-')[1]);
        // Encontrar o livro dessa passagem
        const nomelivro = partes.slice(0, partes.length - 1).join(' ');
        const livro = LIVROS.find(l => l.nome === nomelivro);
        if (livro) {
          const indiceUltimo = passagemParaIndice(`${livro.nome} ${ultimoCapitulo}`);
          indiceInicio = indiceUltimo + 1;
        }
      } else {
        // Capítulo único
        const indiceUltimo = passagemParaIndice(ultimaPassagem);
        indiceInicio = indiceUltimo + 1;
      }
    }

    const primeiraCap = indiceParaPassagem(indiceInicio);
    const ultimaCap = indiceParaPassagem(indiceInicio + capsPorDia - 1);

    if (primeiraCap && ultimaCap) {
      let passagemTexto = '';

      if (primeiraCap.livro.id === ultimaCap.livro.id) {
        if (capsPorDia === 1) {
          passagemTexto = `${primeiraCap.livro.nome} ${primeiraCap.capitulo}`;
        } else {
          passagemTexto = `${primeiraCap.livro.nome} ${primeiraCap.capitulo}-${ultimaCap.capitulo}`;
        }
      } else {
        passagemTexto = `${primeiraCap.livro.nome} ${primeiraCap.capitulo} - ${ultimaCap.livro.nome} ${ultimaCap.capitulo}`;
      }

      setPassagemHoje(passagemTexto);
      setProximaPassagemValida(primeiraCap);
      setLivroSelecionado(primeiraCap.livro);
      setCapituloSelecionado(primeiraCap.capitulo);
    }
  }

  function getPassagemSelecionada(): string {
    if (!livroSelecionado) return '';
    if (!capituloSelecionado) return livroSelecionado.nome;
    return `${livroSelecionado.nome} ${capituloSelecionado}`;
  }

  function validarSequencial(): boolean {
    if (!proximaPassagemValida) return true;
    const esperado = `${proximaPassagemValida.livro.nome} ${proximaPassagemValida.capitulo}`;
    const selecionado = `${livroSelecionado?.nome} ${capituloSelecionado}`;
    if (selecionado !== esperado) {
      alert(`Sequência inválida! O próximo capítulo deve ser ${passagemHoje}. 📖`);
      return false;
    }
    return true;
  }

  async function validarRegraCheckin(): Promise<boolean> {
    if (!grupo) return true;

    const hoje = new Date().toISOString().split('T')[0];

    if (grupo.tipo_checkin === 'diario') {
      const { data } = await supabase
        .from('checkins')
        .select('id')
        .eq('id_usuario', session?.user.id)
        .eq('id_grupo', grupo.id)
        .gte('data_criacao', `${hoje}T00:00:00`)
        .lte('data_criacao', `${hoje}T23:59:59`);

      if (data && data.length > 0) {
        alert('Você já fez seu check-in hoje neste grupo! Volte amanhã. 😊');
        return false;
      }
    }

    if (grupo.tipo_checkin === 'por_capitulo') {
      const passagemFinal = grupo.tipo_plano === 'personalizado'
        ? getPassagemSelecionada()
        : passagemHoje;

      const { data } = await supabase
        .from('checkins')
        .select('id')
        .eq('id_usuario', session?.user.id)
        .eq('id_grupo', grupo.id)
        .eq('passagem_biblica', passagemFinal)
        .gte('data_criacao', `${hoje}T00:00:00`)
        .lte('data_criacao', `${hoje}T23:59:59`);

      if (data && data.length > 0) {
        alert('Você já fez check-in para essa passagem hoje! Selecione outro capítulo. 😊');
        return false;
      }
    }

    return true;
  }

  async function handleCheckIn() {
    if (comentario.trim().length < 10) {
      alert('Escreva pelo menos 10 caracteres sobre o que você leu.');
      return;
    }

    if (grupo?.tipo_plano === 'personalizado' && !livroSelecionado) {
      alert('Selecione a passagem que você leu hoje.');
      return;
    }

    if (grupo?.tipo_plano === 'sequencial' && !validarSequencial()) return;

    setLoading(true);

    const valido = await validarRegraCheckin();
    if (!valido) {
      setLoading(false);
      return;
    }

    const passagemFinal = grupo?.tipo_plano === 'personalizado'
      ? getPassagemSelecionada()
      : passagemHoje;

    const { error } = await supabase.from('checkins').insert({
      id_usuario: session?.user.id,
      id_grupo: grupo?.id || null,
      passagem_biblica: passagemFinal,
      comentario: comentario.trim(),
    });

    if (error) {
      alert('Erro ao salvar: ' + error.message);
      setLoading(false);
    } else {
      const novoStreak = await atualizarStreak(session?.user.id!);
      setLoading(false);
      if (novoStreak && novoStreak > 1) {
        alert(`Check-in realizado! 🎉\n🔥 ${novoStreak} dias seguidos! Continue assim!`);
      } else {
        alert('Check-in realizado! 🎉 Parabéns por ler a Bíblia hoje!');
      }
      navigation.goBack();
    }
  }

  const livrosFiltrados = LIVROS.filter(l =>
    l.nome.toLowerCase().includes(buscaLivro.toLowerCase())
  );

  const capitulos = livroSelecionado
    ? Array.from({ length: livroSelecionado.capitulos }, (_, i) => i + 1)
    : [];

  const isSequencial = grupo?.tipo_plano === 'sequencial';
  const isPersonalizado = grupo?.tipo_plano === 'personalizado';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Check-in do Dia ✅</Text>
        <View style={{ width: 70 }} />
      </View>

      {grupo?.tipo_checkin && (
        <View style={styles.regraCard}>
          <Text style={styles.regraTexto}>
            {grupo.tipo_checkin === 'diario'
              ? '📅 Este grupo permite 1 check-in por dia'
              : '📖 Este grupo permite 1 check-in por capítulo lido'}
          </Text>
        </View>
      )}

      {/* Plano sequencial — mostra próxima passagem com seletor travado */}
      {isSequencial && (
        <>
          <Text style={styles.label}>Próxima passagem da sequência:</Text>
          <View style={styles.card}>
            <Text style={styles.passagem}>📖 {passagemHoje || 'Carregando...'}</Text>
            <Text style={styles.texto}>Esta é a próxima passagem na sequência do seu grupo.</Text>
          </View>
        </>
      )}

      {/* Plano anual — mostra passagem calculada */}
      {!isSequencial && !isPersonalizado && (
        <View style={styles.card}>
          <Text style={styles.passagem}>📖 {passagemHoje}</Text>
          <Text style={styles.texto}>Leia o capítulo indicado e compartilhe sua reflexão.</Text>
        </View>
      )}

      {/* Plano personalizado — seletor livre */}
      {isPersonalizado && (
        <>
          <Text style={styles.label}>Qual passagem você leu hoje?</Text>
          <TouchableOpacity
            style={styles.seletorBtn}
            onPress={() => setModalLivro(true)}
          >
            <Text style={livroSelecionado ? styles.seletorTexto : styles.seletorPlaceholder}>
              {livroSelecionado ? livroSelecionado.nome : 'Selecionar livro...'}
            </Text>
            <Text style={styles.seletorIcone}>▼</Text>
          </TouchableOpacity>

          {livroSelecionado && (
            <TouchableOpacity
              style={styles.seletorBtn}
              onPress={() => setModalCapitulo(true)}
            >
              <Text style={capituloSelecionado ? styles.seletorTexto : styles.seletorPlaceholder}>
                {capituloSelecionado ? `Capítulo ${capituloSelecionado}` : 'Selecionar capítulo...'}
              </Text>
              <Text style={styles.seletorIcone}>▼</Text>
            </TouchableOpacity>
          )}

          {livroSelecionado && (
            <View style={styles.passagemSelecionada}>
              <Text style={styles.passagemSelecionadaTexto}>
                📖 {getPassagemSelecionada()}
              </Text>
            </View>
          )}
        </>
      )}

      <Text style={styles.label}>O que esse trecho significa para você?</Text>
      <TextInput
        style={styles.inputMultiline}
        placeholder="Escreva seu comentário aqui... (mínimo 10 caracteres)"
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <Text style={styles.contador}>{comentario.length} caracteres</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1B4F8A" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
          <Text style={styles.buttonText}>✅ Confirmar Check-in</Text>
        </TouchableOpacity>
      )}

      {/* Modal de Livros — apenas para plano personalizado */}
      <Modal visible={modalLivro} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Livro</Text>
            <TouchableOpacity onPress={() => setModalLivro(false)}>
              <Text style={styles.modalFechar}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalBusca}
            placeholder="Buscar livro..."
            value={buscaLivro}
            onChangeText={setBuscaLivro}
          />

          <FlatList
            data={livrosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalItem, livroSelecionado?.id === item.id && styles.modalItemSelecionado]}
                onPress={() => {
                  setLivroSelecionado(item);
                  setCapituloSelecionado(null);
                  setModalLivro(false);
                  setBuscaLivro('');
                }}
              >
                <Text style={[styles.modalItemTexto, livroSelecionado?.id === item.id && styles.modalItemTextoSelecionado]}>
                  {item.nome}
                </Text>
                <Text style={styles.modalItemCaps}>{item.capitulos} cap.</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Modal de Capítulos — apenas para plano personalizado */}
      <Modal visible={modalCapitulo} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Capítulo</Text>
            <TouchableOpacity onPress={() => setModalCapitulo(false)}>
              <Text style={styles.modalFechar}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={capitulos}
            keyExtractor={(item) => item.toString()}
            numColumns={5}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.capBtn, capituloSelecionado === item && styles.capBtnSelecionado]}
                onPress={() => {
                  setCapituloSelecionado(item);
                  setModalCapitulo(false);
                }}
              >
                <Text style={[styles.capBtnTexto, capituloSelecionado === item && styles.capBtnTextoSelecionado]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 48, marginBottom: 24 },
  voltar: { color: '#1B4F8A', fontSize: 16, width: 70 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B4F8A', textAlign: 'center' },
  regraCard: { backgroundColor: '#C9DEF4', borderRadius: 8, padding: 10, marginBottom: 16 },
  regraTexto: { fontSize: 13, color: '#1B4F8A', fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#EEF4FB', borderRadius: 12, padding: 20, marginBottom: 24 },
  passagem: { fontSize: 18, fontWeight: 'bold', color: '#1B4F8A', marginBottom: 8 },
  texto: { fontSize: 14, color: '#444', lineHeight: 22 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  inputMultiline: { borderWidth: 1, borderColor: '#C9DEF4', borderRadius: 8, padding: 12, fontSize: 15, minHeight: 140, marginBottom: 8 },
  contador: { fontSize: 12, color: '#999', textAlign: 'right', marginBottom: 24 },
  button: { backgroundColor: '#1B4F8A', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  seletorBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#C9DEF4', borderRadius: 8, padding: 12, marginBottom: 12 },
  seletorTexto: { fontSize: 15, color: '#333' },
  seletorPlaceholder: { fontSize: 15, color: '#999' },
  seletorIcone: { color: '#1B4F8A', fontSize: 12 },
  passagemSelecionada: { backgroundColor: '#EEF4FB', borderRadius: 8, padding: 12, marginBottom: 16 },
  passagemSelecionadaTexto: { fontSize: 15, fontWeight: 'bold', color: '#1B4F8A' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#EEF4FB' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B4F8A' },
  modalFechar: { fontSize: 20, color: '#999' },
  modalBusca: { borderWidth: 1, borderColor: '#C9DEF4', borderRadius: 8, padding: 12, fontSize: 15, margin: 16 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EEF4FB' },
  modalItemSelecionado: { backgroundColor: '#EEF4FB' },
  modalItemTexto: { fontSize: 16, color: '#333' },
  modalItemTextoSelecionado: { color: '#1B4F8A', fontWeight: 'bold' },
  modalItemCaps: { fontSize: 13, color: '#999' },
  capBtn: { flex: 1, margin: 4, aspectRatio: 1, backgroundColor: '#EEF4FB', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  capBtnSelecionado: { backgroundColor: '#1B4F8A' },
  capBtnTexto: { fontSize: 15, fontWeight: 'bold', color: '#1B4F8A' },
  capBtnTextoSelecionado: { color: '#fff' },
});