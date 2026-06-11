import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function GruposScreen({ navigation }: any) {
  const { session } = useAuth();
  const [grupos, setGrupos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grupoDetalhes, setGrupoDetalhes] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      carregarGrupos();
    }, [])
  );

  async function carregarGrupos() {
    setLoading(true);

    const { data, error } = await supabase
      .from('membros_grupos')
      .select(`
        id_grupo,
        grupos (
          id,
          nome,
          descricao,
          codigo,
          id_dono,
          tipo_plano,
          capitulos_por_dia,
          data_inicio,
          data_fim,
          tipo_checkin
        )
      `)
      .eq('id_usuario', session?.user.id);

    if (error) {
      alert('Erro ao carregar grupos: ' + error.message);
    }

    if (data && data.length > 0) {
      setGrupos(data.map((item: any) => item.grupos).filter(Boolean));
    } else {
      setGrupos([]);
    }

    setLoading(false);
  }

  async function handleExcluir(grupo: any) {
    if (grupo.id_dono !== session?.user.id) {
      alert('Apenas o dono do grupo pode excluí-lo.');
      return;
    }

    const confirmar = window.confirm(`Tem certeza que deseja excluir o grupo "${grupo.nome}"? Esta ação não pode ser desfeita.`);
    if (!confirmar) return;

    const { error } = await supabase.from('grupos').delete().eq('id', grupo.id);

    if (error) {
      alert('Erro ao excluir grupo: ' + error.message);
    } else {
      alert('Grupo excluído com sucesso!');
      carregarGrupos();
    }
  }

  function formatarData(data: string) {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  function formatarPlano(tipo: string) {
    if (tipo === 'sequencial') return 'Sequencial (Gênesis ao Apocalipse)';
    if (tipo === 'anual') return 'Plano anual (Bíblia em 1 ano)';
    if (tipo === 'personalizado') return 'O grupo escolhe a passagem';
    return tipo;
  }

  function diasRestantes(dataFim: string) {
    if (!dataFim) return null;
    const fim = new Date(dataFim);
    const hoje = new Date();
    const diff = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

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
        <View style={styles.tituloContainer}>
          <Image source={require('../../assets/group.png')} style={styles.tituloIcone} />
          <Text style={styles.title}>Meus Grupos</Text>
        </View>
        <View style={styles.headerBotoes}>
          <TouchableOpacity onPress={() => navigation.navigate('EntrarGrupo')}>
            <Text style={styles.entrar}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CriarGrupo')}>
            <Text style={styles.novo}>+ Novo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {grupos.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Você ainda não participa de nenhum grupo.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CriarGrupo')}>
            <Text style={styles.buttonText}>Criar meu primeiro grupo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('FeedGrupo', { grupo: item })}
            >
              <View style={styles.cardConteudo}>
                <Text style={styles.cardTitulo}>{item.nome}</Text>
                <Text style={styles.cardDescricao}>{item.descricao || 'Sem descrição'}</Text>
              </View>
              <View style={styles.cardAcoes}>
                <TouchableOpacity
                  onPress={() => setGrupoDetalhes(item)}
                  style={styles.acaoBtn}
                >
                  <Image source={require('../../assets/balao-icon.png')} style={styles.acaoIcone} />
                </TouchableOpacity>
                {item.id_dono === session?.user.id && (
                  <>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('EditarGrupo', { grupo: item })}
                      style={styles.acaoBtn}
                    >
                      <Image source={require('../../assets/lapis-icon.png')} style={styles.acaoIcone} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleExcluir(item)}
                      style={styles.acaoBtn}
                    >
                      <Image source={require('../../assets/lixo-icon.png')} style={styles.acaoIcone} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal de Detalhes */}
      <Modal
        visible={!!grupoDetalhes}
        animationType="fade"
        transparent
        onRequestClose={() => setGrupoDetalhes(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setGrupoDetalhes(null)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>{grupoDetalhes?.nome}</Text>

            {grupoDetalhes?.descricao ? (
              <Text style={styles.modalDescricao}>{grupoDetalhes.descricao}</Text>
            ) : null}

            <View style={styles.modalSeparador} />

            <View style={styles.modalLinha}>
              <View style={styles.modalChaveContainer}>
                <Text style={styles.modalChave}>Plano</Text>
              </View>
              <Text style={styles.modalValor}>{formatarPlano(grupoDetalhes?.tipo_plano)}</Text>
            </View>

            {grupoDetalhes?.tipo_plano !== 'personalizado' && (
              <View style={styles.modalLinha}>
                <View style={styles.modalChaveContainer}>
                  <Text style={styles.modalChave}>Capítulos/dia</Text>
                </View>
                <Text style={styles.modalValor}>{grupoDetalhes?.capitulos_por_dia}</Text>
              </View>
            )}

            <View style={styles.modalLinha}>
              <View style={styles.modalChaveContainer}>
                <Text style={styles.modalChave}>Início</Text>
              </View>
              <Text style={styles.modalValor}>{formatarData(grupoDetalhes?.data_inicio)}</Text>
            </View>

            <View style={styles.modalLinha}>
              <View style={styles.modalChaveContainer}>
                <Text style={styles.modalChave}>Término</Text>
              </View>
              <Text style={styles.modalValor}>{formatarData(grupoDetalhes?.data_fim)}</Text>
            </View>

            <View style={styles.modalLinha}>
              <View style={styles.modalChaveContainer}>
                <Text style={styles.modalChave}>Dias restantes</Text>
              </View>
              <Text style={styles.modalValor}>
                {diasRestantes(grupoDetalhes?.data_fim) === 0
                  ? 'Encerrado'
                  : `${diasRestantes(grupoDetalhes?.data_fim)} dias`}
              </Text>
            </View>

            <View style={styles.modalLinha}>
              <View style={styles.modalChaveContainer}>
                <Text style={styles.modalChave}>Código</Text>
              </View>
              <Text style={styles.modalValor}>{grupoDetalhes?.codigo}</Text>
            </View>

            <View style={styles.modalLinha}>
              <View style={styles.modalChaveContainer}>
                <Text style={styles.modalChave}>Check-in</Text>
              </View>
              <Text style={styles.modalValor}>
                {grupoDetalhes?.tipo_checkin === 'por_capitulo' ? '1 por capítulo lido' : '1 por dia'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalFecharBtn}
              onPress={() => setGrupoDetalhes(null)}
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
  container: { flex: 1, padding: 24, backgroundColor: '#fff', paddingBottom: 80 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4F8A' },
  tituloContainer: { flexDirection: 'row', alignItems: 'center' },
  tituloIcone: { width: 36, height: 22, marginRight: 8, tintColor: '#1B4F8A' },
  headerBotoes: { flexDirection: 'row', gap: 12 },
  entrar: { color: '#666', fontSize: 16 },
  novo: { color: '#1B4F8A', fontSize: 16, fontWeight: 'bold' },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vazioTexto: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#1B4F8A', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#EEF4FB', borderRadius: 12, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  cardConteudo: { flex: 1 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1B4F8A', marginBottom: 4 },
  cardDescricao: { fontSize: 14, color: '#666' },
  cardAcoes: { flexDirection: 'row', gap: 8 },
  acaoBtn: { padding: 4 },
  acaoIcone: { width: 35, height: 20, resizeMode: 'contain' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#1B4F8A', marginBottom: 4 },
  modalDescricao: { fontSize: 14, color: '#666', marginBottom: 12 },
  modalSeparador: { height: 1, backgroundColor: '#EEF4FB', marginBottom: 12 },
  modalLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalChaveContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  modalIcone: { width: 18, height: 18, resizeMode: 'contain' },
  modalChave: { fontSize: 14, color: '#666' },
  modalValor: { fontSize: 14, fontWeight: '600', color: '#333', flex: 2, textAlign: 'right' },
  modalFecharBtn: { backgroundColor: '#1B4F8A', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  modalFecharTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});