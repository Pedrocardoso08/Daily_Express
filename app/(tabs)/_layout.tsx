import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { cor, criarEstilos, fundo, useTema } from '../../lib/tema';

export default function TabLayout() {
  useTema();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#EAD1A8',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: styles.barra,
        sceneStyle: { backgroundColor: fundo('#EAD1A8') },
      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          tabBarStyle: { display: 'none' },
          tabBarIcon: () => (
            <View style={styles.botaoCentro}>
              <Ionicons name="cart" size={28} color={cor('#4A3525')} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notificacoes"
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} />,
        }}
      />

      {/* Rotas que existem na pasta mas não aparecem na barra */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

const styles = criarEstilos({
  barra: {
    position: 'absolute',
    bottom: 15,
    marginHorizontal: 20,
    height: 60,
    paddingBottom: 0,
    borderRadius: 30,
    borderTopWidth: 0,
    backgroundColor: '#4A3525',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  botaoCentro: {
    backgroundColor: '#C9A075',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#EAD1A8',
    marginTop: -30,
  },
});
