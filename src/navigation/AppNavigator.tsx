import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import CheckInScreen from '../screens/CheckInScreen';
import GruposScreen from '../screens/GruposScreen';
import CriarGrupoScreen from '../screens/CriarGrupoScreen';
import FeedGrupoScreen from '../screens/FeedGrupoScreen';
import EntrarGrupoScreen from '../screens/EntrarGrupoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import EditarGrupoScreen from '../screens/EditarGrupoScreen';
import BibliaScreen from '../screens/BibliaScreen';
import LivroScreen from '../screens/LivroScreen';
import CapituloScreen from '../screens/CapituloScreen';
import RankingScreen from '../screens/RankingScreen';
import { Image } from 'react-native';
import CadastroScreen from '../screens/CadastroScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function GruposStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GruposList" component={GruposScreen} />
      <Stack.Screen name="CriarGrupo" component={CriarGrupoScreen} />
      <Stack.Screen name="EditarGrupo" component={EditarGrupoScreen} />
      <Stack.Screen name="FeedGrupo" component={FeedGrupoScreen} />
      <Stack.Screen name="EntrarGrupo" component={EntrarGrupoScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="Ranking" component={RankingScreen} />
    </Stack.Navigator>
  );
}

function BibliaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BibliaLista" component={BibliaScreen} />
      <Stack.Screen name="Livro" component={LivroScreen} />
      <Stack.Screen name="Capitulo" component={CapituloScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1B4F8A',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          paddingBottom: 16,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
    <Tab.Screen
      name="Início"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <Image
            source={require('../../assets/home.png')}
            style={{ width: 24, height: 24, tintColor: focused ? '#1B4F8A' : '#999' }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Bíblia"
      component={BibliaStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <Image
            source={require('../../assets/bible.png')}
            style={{ width: 24, height: 24, tintColor: focused ? '#1B4F8A' : '#999' }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Grupos"
      component={GruposStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <Image
            source={require('../../assets/group.png')}
            style={{ width: 24, height: 24, tintColor: focused ? '#1B4F8A' : '#999' }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Perfil"
      component={PerfilScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <Image
            source={require('../../assets/profile.png')}
            style={{ width: 24, height: 24, tintColor: focused ? '#1B4F8A' : '#999' }}
          />
        ),
      }}
    />
    </Tab.Navigator>
  );
}

function Routes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1B4F8A" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </AuthProvider>
  );
}