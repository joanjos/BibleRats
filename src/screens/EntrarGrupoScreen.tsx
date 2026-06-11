import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function EntrarGrupoScreen({ navigation }: any) {
  const { session } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEntrar() {
    if (codigo.trim().length < 6) {
      alert('Digite o código completo do grupo (6 caracteres).');
      return;
    }

    setLoading(true);

    const { data: grupo, error } = await supabase
      .from('grupos')
      .select('id, nome')
      .eq('codigo', codigo.trim().toUpperCase())
      .single();

    if (error || !grupo) {
      alert('Grupo não encontrado. Verifique o código e tente novamente.');
      setLoading(false);
      return;
    }

    const { data: membro } = await supabase
      .from('membros_grupos')
      .select('id')
      .eq('id_grupo', grupo.id)
      .eq('id_usuario', session?.user.id)
      .single();

    if (membro) {
      alert('Você já faz parte desse grupo!');
      setLoading(false);
      return;
    }

    const { error: erroEntrar } = await supabase.from('membros_grupos').insert({
      id_grupo: grupo.id,
      id_usuario: session?.user.id,
    });

    setLoading(false);

    if (erroEntrar) {
      alert('Erro ao entrar no grupo: ' + erroEntrar.message);
    } else {
      alert(`Você entrou no grupo ${grupo.nome}!`);
      navigation.goBack();
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.voltar}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Entrar em um Grupo</Text>
      <Text style={styles.subtitle}>Digite o código de 6 letras compartilhado pelo líder do grupo.</Text>

      <TextInput
        style={styles.input}
        placeholder="Ex: AB12CD"
        value={codigo}
        onChangeText={setCodigo}
        autoCapitalize="characters"
        maxLength={6}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#1B4F8A" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleEntrar}>
          <Text style={styles.buttonText}>Entrar no Grupo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  voltar: { color: '#1B4F8A', fontSize: 16, marginTop: 48, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#1B4F8A' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#C9DEF4', borderRadius: 8, padding: 12, fontSize: 24, textAlign: 'center', letterSpacing: 8, marginBottom: 16 },
  button: { backgroundColor: '#1B4F8A', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});