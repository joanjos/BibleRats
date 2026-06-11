import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const GENEROS = [
  { valor: 'masculino', label: 'Masculino' },
  { valor: 'feminino', label: 'Feminino' },
];

export default function PerfilScreen({ navigation }: any) {
  const { session } = useAuth();
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [igreja, setIgreja] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    setLoading(true);

    const { data } = await supabase
      .from('perfis')
      .select('nome_usuario, nome_completo, data_nascimento, genero, igreja')
      .eq('id', session?.user.id)
      .single();

    if (data) {
      setNomeUsuario(data.nome_usuario || '');
      setNomeCompleto(data.nome_completo || '');
      setGenero(data.genero || '');
      setIgreja(data.igreja || '');

      if (data.data_nascimento) {
        const partes = data.data_nascimento.split('-');
        setDataNascimento(`${partes[2]}/${partes[1]}/${partes[0]}`);
      }
    }

    setLoading(false);
  }

  function formatarData(texto: string) {
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  }

  function validarData(data: string): boolean {
    const partes = data.split('/');
    if (partes.length !== 3) return false;
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    const ano = parseInt(partes[2]);
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
    if (dia < 1 || dia > 31) return false;
    if (mes < 1 || mes > 12) return false;
    if (ano < 1900 || ano > new Date().getFullYear()) return false;
    return true;
  }

  async function handleSalvar() {
    if (nomeUsuario.trim().length < 3) {
      alert('O nome de usuário precisa ter pelo menos 3 caracteres.');
      return;
    }

    if (dataNascimento && !validarData(dataNascimento)) {
      alert('Digite uma data de nascimento válida (DD/MM/AAAA).');
      return;
    }

    setSalvando(true);

    let dataNascimentoISO = null;
    if (dataNascimento && validarData(dataNascimento)) {
      const partes = dataNascimento.split('/');
      dataNascimentoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    const { error } = await supabase
      .from('perfis')
      .update({
        nome_usuario: nomeUsuario.trim(),
        nome_completo: nomeCompleto.trim(),
        data_nascimento: dataNascimentoISO,
        genero: genero || null,
        igreja: igreja.trim() || null,
      })
      .eq('id', session?.user.id);

    setSalvando(false);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      alert('Perfil atualizado!');
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1B4F8A" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarTexto}>
          {(nomeUsuario || 'U')[0].toUpperCase()}
        </Text>
      </View>

      <Text style={styles.email}>{session?.user.email}</Text>

      <Text style={styles.label}>Nome completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: João Silva"
        value={nomeCompleto}
        onChangeText={setNomeCompleto}
      />

      <Text style={styles.label}>Nome de usuário</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: joaosilva"
        value={nomeUsuario}
        onChangeText={setNomeUsuario}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Data de nascimento</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        value={dataNascimento}
        onChangeText={(t) => setDataNascimento(formatarData(t))}
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>Gênero</Text>
      <View style={styles.generoContainer}>
        {GENEROS.map((g) => (
          <TouchableOpacity
            key={g.valor}
            style={[styles.generoBtn, genero === g.valor && styles.generoBtnSelecionado]}
            onPress={() => setGenero(g.valor)}
          >
            <Text style={[styles.generoBtnTexto, genero === g.valor && styles.generoBtnTextoSelecionado]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Igreja / Comunidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Igreja Cristã Casa Favorita"
        value={igreja}
        onChangeText={setIgreja}
      />

      {salvando ? (
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
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1, paddingBottom: 80 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 48, marginBottom: 24, color: '#1B4F8A' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 12 },
  avatarTexto: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 32 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#C9DEF4', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 16 },
  generoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  generoBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#C9DEF4' },
  generoBtnSelecionado: { backgroundColor: '#1B4F8A', borderColor: '#1B4F8A' },
  generoBtnTexto: { fontSize: 14, color: '#333' },
  generoBtnTextoSelecionado: { color: '#fff', fontWeight: 'bold' },
  button: { backgroundColor: '#1B4F8A', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});