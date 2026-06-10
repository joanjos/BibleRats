import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function FeedGrupoScreen({ route, navigation }: any) {
  const { grupo } = route.params;
  const { session } = useAuth();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalDetalhes, setModalDetalhes] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarFeed();
    }, [])
  );

  async function carregarFeed() {
    setLoading(true);

    const { data, error } = await supabase
      .from('checkins')
      .select(`
        id,
        passagem_biblica,
        comentario,
        data_criacao,
        perfis (
          nome_usuario,
          nome_completo
        )
      `)
      .eq('id_grupo', grupo.id)
      .order('data_criacao', { ascending: false });

    if (error) {
      alert('Erro ao carregar feed: ' + error.message);
    } else {
      setCheckins(data || []);
    }

    setLoading(false);
  }

  async function handleSairGrupo() {
    const confirmar = window.confirm(`Tem certeza que deseja sair do grupo "${grupo.nome}"?`);
    if (!confirmar) return;

    const { error } = await supabase
      .from('membros_grupos')
      .delete()
      .eq('id_grupo', grupo.id)
      .eq('id_usuario', session?.user.id);

    if (error) {
      alert('Erro ao sair do grupo: ' + error.message);
    } else {
      alert('Você saiu do grupo com sucesso!');
      navigation.goBack();
    }
  }

  function formatarData(data: string) {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function formatarDataSimples(data: string) {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  function formatarPlano(tipo: string) {
    if (tipo === 'sequencial') return '📖 Sequencial (Gênesis ao Apocalipse)';
    if (tipo === 'anual') return '📅 Plano anual (Bíblia em 1 ano)';
    if (tipo === 'personalizado') return '✏️ O grupo escolhe a passagem';
    return tipo;
  }

  function diasRestantes() {
    if (!grupo.data_fim) return null;
    const fim = new Date(grupo.data_fim);
    const hoje = new Date();
    const diff = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  const isDono = grupo.id_dono === session?.user.id;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1B4F8A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{grupo.nome}</Text>
          <Text style={styles.codigo}>Código: {grupo.codigo}</Text>
        </View>
        <View style={styles.headerAcoes}>
          <TouchableOpacity onPress={() => setModalDetalhes(true)}>
            <Text style={styles.infoBtn}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Ranking', { grupo })}>
            <Text style={styles.rankingBtn}>🏆</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CheckIn', { grupo })}>
            <Text style={styles.checkinBtn}>✅</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isDono && (
        <TouchableOpacity style={styles.sairBtn} onPress={handleSairGrupo}>
          <Text style={styles.sairTexto}>Sair do grupo</Text>
        </TouchableOpacity>
      )}

      {checkins.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Nenhum check-in ainda.</Text>
          <Text style={styles.vazioSubtexto}>Seja o primeiro a registrar sua leitura hoje! 📖</Text>
        </View>
      ) : (
        <FlatList
          data={checkins}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={carregarFeed}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>
                    {(item.perfis?.nome_usuario || 'U')[0].toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.nomeUsuario}>{item.perfis?.nome_completo || item.perfis?.nome_usuario || 'Usuário'}</Text>
                  <Text style={styles.data}>{formatarData(item.data_criacao)}</Text>
                </View>
              </View>
              <View style={styles.passagemContainer}>
                <Text style={styles.passagem}>📖 {item.passagem_biblica}</Text>
              </View>
              <Text style={styles.comentario}>{item.comentario}</Text>
            </View>
          )}
        />
      )}

      {/* Modal de Detalhes */}
      <Modal
        visible={modalDetalhes}
        animationType="fade"
        transparent
        onRequestClose={() => setModalDetalhes(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalDetalhes(false)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>{grupo.nome}</Text>

            {grupo.descricao ? (
              <Text style={styles.modalDescricao}>{grupo.descricao}</Text>
            ) : null}

            <View style={styles.modalSeparador} />

            <View style={styles.modalLinha}>
              <Text style={styles.modalChave}>📋 Plano</Text>
              <Text style={styles.modalValor}>{formatarPlano(grupo.tipo_plano)}</Text>
            </View>

            {grupo.tipo_plano !== 'personalizado' && (
              <View style={styles.modalLinha}>
                <Text style={styles.modalChave}>📖 Capítulos/dia</Text>
                <Text style={styles.modalValor}>{grupo.capitulos_por_dia}</Text>
              </View>
            )}

            <View style={styles.modalLinha}>
              <Text style={styles.modalChave}>📅 Início</Text>
              <Text style={styles.modalValor}>{formatarDataSimples(grupo.data_inicio)}</Text>
            </View>

            <View style={styles.modalLinha}>
              <Text style={styles.modalChave}>🏁 Término</Text>
              <Text style={styles.modalValor}>{formatarDataSimples(grupo.data_fim)}</Text>
            </View>

            <View style={styles.modalLinha}>
              <Text style={styles.modalChave}>⏱️ Dias restantes</Text>
              <Text style={styles.modalValor}>
                {diasRestantes() === 0 ? 'Encerrado' : `${diasRestantes()} dias`}
              </Text>
            </View>

            
            <View style={styles.modalLinha}>
              <Text style={styles.modalChave}>✅ Check-in</Text>
              <Text style={styles.modalValor}>
                {grupo?.tipo_checkin === 'por_capitulo' ? '1 por capítulo lido' : '1 por dia'}
              </Text>
            </View>

            <View style={styles.modalLinha}>
              <Text style={styles.modalChave}>🔑 Código</Text>
              <Text style={styles.modalValor}>{grupo.codigo}</Text>
            </View>

            <TouchableOpacity
              style={styles.modalFecharBtn}
              onPress={() => setModalDetalhes(false)}
            >
              <Text style={styles.modalFecharTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, marginBottom: 24 },
  voltar: { color: '#1B4F8A', fontSize: 16, width: 60 },
  headerCenter: { alignItems: 'center', flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1B4F8A' },
  codigo: { fontSize: 12, color: '#999', marginTop: 2 },
  headerAcoes: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  infoBtn: { fontSize: 22 },
  rankingBtn: { fontSize: 22 },
  checkinBtn: { fontSize: 22 },
  sairBtn: { alignSelf: 'flex-end', marginBottom: 12 },
  sairTexto: { color: '#999', fontSize: 13, textDecorationLine: 'underline' },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vazioTexto: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  vazioSubtexto: { fontSize: 14, color: '#666', textAlign: 'center' },
  card: { backgroundColor: '#EEF4FB', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nomeUsuario: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  data: { fontSize: 12, color: '#999' },
  passagemContainer: { backgroundColor: '#C9DEF4', borderRadius: 8, padding: 8, marginBottom: 8 },
  passagem: { fontSize: 14, fontWeight: '600', color: '#1B4F8A' },
  comentario: { fontSize: 14, color: '#444', lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#1B4F8A', marginBottom: 4 },
  modalDescricao: { fontSize: 14, color: '#666', marginBottom: 12 },
  modalSeparador: { height: 1, backgroundColor: '#EEF4FB', marginBottom: 12 },
  modalLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  modalChave: { fontSize: 14, color: '#666', flex: 1 },
  modalValor: { fontSize: 14, fontWeight: '600', color: '#333', flex: 2, textAlign: 'right' },
  modalFecharBtn: { backgroundColor: '#1B4F8A', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  modalFecharTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});