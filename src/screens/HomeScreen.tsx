import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getVersiculoDoDia, getSaudacao } from '../services/versiculoDoDia';
import { getStreak } from '../services/streak';

export default function HomeScreen() {
  const { session } = useAuth();
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [versiculo, setVersiculo] = useState<{ referencia: string; texto: string } | null>(null);
  const [loadingVersiculo, setLoadingVersiculo] = useState(true);
  const [streakAtual, setStreakAtual] = useState(0);
  const [streakMaximo, setStreakMaximo] = useState(0);
  const saudacao = getSaudacao();

  useEffect(() => {
    carregarPerfil();
    carregarVersiculo();
  }, []);

  async function carregarPerfil() {
    const { data } = await supabase
      .from('perfis')
      .select('nome_completo, nome_usuario')
      .eq('id', session?.user.id)
      .single();

    if (data) {
      setNomeUsuario(data.nome_completo || data.nome_usuario || '');
    }

    const { streakAtual, streakMaximo } = await getStreak(session?.user.id!);
    setStreakAtual(streakAtual);
    setStreakMaximo(streakMaximo);
  }

  async function carregarVersiculo() {
    setLoadingVersiculo(true);
    const versiculo2 = await getVersiculoDoDia();
    setVersiculo(versiculo2);
    setLoadingVersiculo(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const primeiroNome = nomeUsuario.split(' ')[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.saudacaoContainer}>
          <Text style={styles.saudacao}>{saudacao}{primeiroNome ? `, ${primeiroNome}` : ''}!</Text>
          <Image source={require('../../assets/saudacao-icon.png')} style={styles.saudacaoIcone} />
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.sair}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.streakContainer}>
        <View style={styles.streakCard}>
          <Image source={require('../../assets/fogo-icon.png')} style={styles.streakIcone} />
          <Text style={styles.streakNumero}>{streakAtual}</Text>
          <Text style={styles.streakLabel}>dias seguidos</Text>
        </View>
        <View style={styles.streakCard}>
          <Image source={require('../../assets/trofeu-icon.png')} style={styles.streakIcone} />
          <Text style={styles.streakNumero}>{streakMaximo}</Text>
          <Text style={styles.streakLabel}>recorde</Text>
        </View>
      </View>

      <View style={styles.versiculoCard}>
        <Text style={styles.versiculoLabel}>Versículo do Dia</Text>
        {loadingVersiculo ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
        ) : (
          <>
            <Text style={styles.versiculoReferencia}>{versiculo?.referencia}</Text>
            <Text style={styles.versiculoTexto}>{versiculo?.texto}</Text>
          </>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTexto}>Acesse seus grupos para ver a passagem do dia e fazer seu check-in!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 80, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, marginBottom: 24 },
  saudacao: { fontSize: 22, fontWeight: 'bold', color: '#1B4F8A' },
  saudacaoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saudacaoIcone: { width: 50, height: 30, resizeMode: 'contain' },
  sair: { color: '#e63946', fontSize: 15 },
  streakContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  streakCard: { flex: 1, backgroundColor: '#EEF4FB', borderRadius: 12, padding: 16, alignItems: 'center' },
  streakIcone: { width: 60, height: 40, marginBottom: 4, resizeMode: 'contain' },
  streakNumero: { fontSize: 28, fontWeight: 'bold', color: '#1B4F8A' },
  streakLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  versiculoCard: { backgroundColor: '#1B4F8A', borderRadius: 16, padding: 24, marginBottom: 16, minHeight: 120 },
  versiculoLabel: { color: '#C9DEF4', fontSize: 13, marginBottom: 8 },
  versiculoReferencia: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  versiculoTexto: { color: '#EEF4FB', fontSize: 16, lineHeight: 26, fontStyle: 'italic' },
  infoCard: { backgroundColor: '#EEF4FB', borderRadius: 12, padding: 16 },
  infoTexto: { color: '#1B4F8A', fontSize: 14, lineHeight: 22 },
});