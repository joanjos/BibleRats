import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { getCapitulo } from '../services/bibliaApi';

export default function CapituloScreen({ route, navigation }: any) {
  const { livro, capitulo } = route.params;
  const [versiculos, setVersiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCapitulo();
  }, []);

  async function carregarCapitulo() {
    setLoading(true);
    try {
      const data = await getCapitulo(livro.id, capitulo);
      setVersiculos(data.verses || []);
    } catch {
      alert('Erro ao carregar capítulo.');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        {capitulo > 1 && (
          <TouchableOpacity onPress={() => navigation.replace('Capitulo', { livro, capitulo: capitulo - 1 })}>
            <Text style={styles.navBtn}>‹ Anterior</Text>
          </TouchableOpacity>
        )}
        {capitulo < livro.capitulos && (
          <TouchableOpacity onPress={() => navigation.replace('Capitulo', { livro, capitulo: capitulo + 1 })}>
            <Text style={styles.navBtn}>Próximo ›</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>{livro.nome} {capitulo}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1B4F8A" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {versiculos.map((v: any) => (
            <View key={v.verse} style={styles.versiculo}>
              <Text style={styles.numero}>{v.verse}</Text>
              <Text style={styles.texto}>{v.text.trim()}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, marginBottom: 16 },
  voltar: { color: '#1B4F8A', fontSize: 16 },
  navBtn: { color: '#3A7FC1', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4F8A', marginBottom: 24 },
  versiculo: { flexDirection: 'row', marginBottom: 12 },
  numero: { fontSize: 12, fontWeight: 'bold', color: '#3A7FC1', marginRight: 8, marginTop: 2, minWidth: 20 },
  texto: { flex: 1, fontSize: 16, color: '#333', lineHeight: 26 },
});