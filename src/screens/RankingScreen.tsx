import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function RankingScreen({ route, navigation }: any) {
  const { grupo } = route.params;
  const { session } = useAuth();
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarRanking();
    }, [])
  );

  async function carregarRanking() {
    setLoading(true);

    const { data, error } = await supabase
      .from('checkins')
      .select(`
        id_usuario,
        perfis (
          nome_completo,
          nome_usuario
        )
      `)
      .eq('id_grupo', grupo.id);

    if (error) {
      alert('Erro ao carregar ranking: ' + error.message);
      setLoading(false);
      return;
    }

    // Contar checkins por usuário
    const contagem: Record<string, { nome: string; total: number; id: string }> = {};

    data?.forEach((item: any) => {
      const id = item.id_usuario;
      const nome = item.perfis?.nome_completo || item.perfis?.nome_usuario || 'Usuário';

      if (!contagem[id]) {
        contagem[id] = { id, nome, total: 0 };
      }
      contagem[id].total++;
    });

    const rankingOrdenado = Object.values(contagem)
      .sort((a, b) => b.total - a.total);

    setRanking(rankingOrdenado);
    setLoading(false);
  }

  function formatarDataFim() {
    if (!grupo.data_fim) return '';
    const data = new Date(grupo.data_fim);
    return data.toLocaleDateString('pt-BR');
  }

  function diasRestantes() {
    if (!grupo.data_fim) return 0;
    const fim = new Date(grupo.data_fim);
    const hoje = new Date();
    const diff = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  function medalha(index: number) {
    if (index === 0) return <Image source={require('../../assets/medalha1-icon.png')} style={styles.medalhaIcone} />;
    if (index === 1) return <Image source={require('../../assets/medalha2-icon.png')} style={styles.medalhaIcone} />;
    if (index === 2) return <Image source={require('../../assets/medalha3-icon.png')} style={styles.medalhaIcone} />;
    return <Text style={styles.medalha}>{index + 1}º</Text>;
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1B4F8A" />
      </View>
    );
  }

  const dias = diasRestantes();
  const competicaoEncerrada = dias === 0;

  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.voltar}>← Voltar</Text>
      </TouchableOpacity>
      <View style={styles.tituloContainer}>
        <Text style={styles.title}>Ranking</Text>
      </View>
      <View style={{ width: 60 }} />
    </View>

      <Text style={styles.grupoNome}>{grupo.nome}</Text>

      <View style={[styles.statusCard, competicaoEncerrada ? styles.statusEncerrado : styles.statusAtivo]}>
        {competicaoEncerrada ? (
          <View style={styles.statusContainer}>
            <Image source={require('../../assets/flag-icon.png')} style={styles.statusIcone} />
            <Text style={styles.statusTexto}>Competição encerrada!</Text>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <Image source={require('../../assets/relogio-icon.png')} style={styles.statusIcone} />
            <Text style={styles.statusTexto}>{dias} dias restantes — até {formatarDataFim()}</Text>
          </View>
        )}
      </View>

      {ranking.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Nenhum check-in ainda.</Text>
          <Text style={styles.vazioSubtexto}>Seja o primeiro a aparecer no ranking!</Text>
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={[
              styles.card,
              item.id === session?.user.id && styles.cardDestaque,
              index === 0 && styles.cardPrimeiro,
            ]}>
              <View style={styles.medalhaContainer}>{medalha(index)}</View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNome}>
                  {item.nome} {item.id === session?.user.id ? '(você)' : ''}
                </Text>
                <Text style={styles.cardTotal}>{item.total} check-in{item.total !== 1 ? 's' : ''}</Text>
              </View>
              {index === 0 && <Text style={styles.lider}>Líder</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, marginBottom: 8 },
  voltar: { color: '#1B4F8A', fontSize: 16, width: 60 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B4F8A' },
  tituloContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tituloIcone: { width: 26, height: 26, resizeMode: 'contain' },
  grupoNome: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 16 },
  statusCard: { borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 20 },
  statusAtivo: { backgroundColor: '#EEF4FB' },
  statusEncerrado: { backgroundColor: '#FFF3CD' },
  statusTexto: { fontSize: 14, fontWeight: '600', color: '#333' },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vazioTexto: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  vazioSubtexto: { fontSize: 14, color: '#666' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF4FB', borderRadius: 12, padding: 16, marginBottom: 8 },
  cardPrimeiro: { backgroundColor: '#FFF8E1', borderWidth: 2, borderColor: '#FFD700' },
  cardDestaque: { borderWidth: 2, borderColor: '#1B4F8A' },
  medalha: { fontSize: 24, marginRight: 12, minWidth: 36, textAlign: 'center' },
  medalhaIcone: { width: 60, height: 40, resizeMode: 'contain' },
  medalhaContainer: { width: 40, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardTotal: { fontSize: 13, color: '#666', marginTop: 2 },
  lider: { fontSize: 12, fontWeight: 'bold', color: '#B8860B' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusIcone: { width: 40, height: 16, resizeMode: 'contain' },
});