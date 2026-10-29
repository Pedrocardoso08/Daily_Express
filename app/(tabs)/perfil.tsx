import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { fotoDoUsuario } from '../../lib/imagens';
import { loja, sair } from '../../lib/loja';
import { cor, criarEstilos, useTema } from '../../lib/tema';

const FUNCOES: { id: string; titulo: string; icone: any }[] = [
  { id: '1', titulo: 'Fidelidade', icone: 'star' },
  { id: '2', titulo: 'Personalização', icone: 'pencil' },
  { id: '3', titulo: 'Cartões', icone: 'card' },
  { id: '4', titulo: 'Configurações', icone: 'settings' },
  { id: '5', titulo: 'Senha', icone: 'lock-closed' },
  { id: '6', titulo: 'Sair', icone: 'exit-outline' },
];

export default function PerfilScreen() {
  const { escuro: modoEscuro, alternarTema } = useTema();
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [nome, setNome] = useState(loja.usuario ? loja.usuario.nome : 'Visitante');
  const [foto, setFoto] = useState(fotoDoUsuario());

  // Pega o nome e a foto de novo quando volta da tela de Personalização
  useFocusEffect(
    useCallback(() => {
      setNome(loja.usuario ? loja.usuario.nome : 'Visitante');
      setFoto(fotoDoUsuario());
    }, [])
  );

  function sairDaConta() {
    setConfirmarSaida(false);
    sair();
    router.replace('/login');
  }

  const handleFuncaoPress = (id: string) => {
    if (id === '1') {
      router.push('/fidelidade');
    }
    if (id === '2') {
      router.push('/personalizacao');
    }
    if (id === '3') {
      router.push('/cartoes');
    }
    if (id === '4') {
      router.push('/configuracoes');
    }
    if (id === '5') {
      router.push('/esqueciSenha');
    }
    if (id === '6') {
      setConfirmarSaida(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Alerta: tem certeza que quer sair? */}
      <Modal
        visible={confirmarSaida}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setConfirmarSaida(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertCard}>
            <Ionicons name="exit-outline" size={36} color={cor('#4A3525')} />
            <Text style={styles.alertTitle}>Sair da conta</Text>
            <Text style={styles.alertMessage}>Tem certeza que quer sair da sua conta?</Text>

            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.alertCancelButton}
                onPress={() => setConfirmarSaida(false)}
              >
                <Text style={styles.alertCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.alertConfirmButton} onPress={sairDaConta}>
                <Text style={styles.alertConfirmText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={menuAberto}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuAberto(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setMenuAberto(false)}
          />

          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <TouchableOpacity
                style={styles.themeToggle}
                onPress={alternarTema}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="sunny"
                  size={16}
                  color={!modoEscuro ? '#F59E0B' : '#8C837A'}
                />
                <Ionicons
                  name="moon"
                  size={16}
                  color={modoEscuro ? '#F8F4EC' : '#8C837A'}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMenuAberto(false)}>
                <Ionicons name="chevron-back" size={26} color={cor('#4A3525')} />
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarMenu}>
              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push('/funcionarios');
                }}
              >
                <Ionicons name="briefcase-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Área do funcionário</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push('/historicoPedidos');
                }}
              >
                <Ionicons name="folder-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Histórico de pedidos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push('/cupons');
                }}
              >
                <Ionicons name="pricetag-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Cupons</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push('/endereco');
                }}
              >
                <Ionicons name="location-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Endereços salvos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push('/ajuda');
                }}
              >
                <Ionicons name="help-circle-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Ajuda/FAQ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push('/faleconosco');
                }}
              >
                <Ionicons name="call-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Fale conosco</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push('/sobrenos');
                }}
              >
                <Ionicons name="information-circle-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Sobre nós</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setMenuAberto(false);
                  setConfirmarSaida(true);
                }}
              >
                <Ionicons name="exit-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topSection}>
          <View style={styles.curveHeader}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuAberto(true)}
            >
              <Ionicons name="menu" size={32} color={cor('#3B291A')} />
            </TouchableOpacity>

            <View style={styles.avatarWrapper}>
              <Image
                source={foto}
                style={styles.avatarImage}
              />
            </View>
          </View>
        </View>

        <View style={styles.userInfoSection}>
          <Text style={styles.userName}>{nome}</Text>
          <Text style={styles.userLoginDate}>
            {loja.usuario ? 'Logado em ' + loja.usuario.logadoEm : 'Não logado'}
          </Text>
        </View>

        <View style={styles.functionsSection}>
          <Text style={styles.sectionTitle}>Funções</Text>

          <View style={styles.gridContainer}>
            {FUNCOES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.functionCard}
                onPress={() => handleFuncaoPress(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icone} size={34} color={cor('#3B291A')} />
                <Text style={styles.functionCardText} numberOfLines={1}>
                  {item.titulo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#EAD1A8',
  },
  scrollContent: {
    paddingBottom: 110,
  },

  topSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  curveHeader: {
    width: '100%',
    height: 250,
    backgroundColor: '#C9A075',
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    top: 45,
    left: 20,
    padding: 6,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3.5,
    borderColor: '#007AFF',
    overflow: 'hidden',
    backgroundColor: '#FFF',
    marginTop: 20,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  userInfoSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 26,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B291A',
    marginBottom: 4,
  },
  userLoginDate: {
    fontSize: 13,
    color: '#3B291A',
    fontWeight: '500',
  },

  functionsSection: {
    paddingHorizontal: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B291A',
    marginBottom: 16,
    marginLeft: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  functionCard: {
    width: '30.5%',
    aspectRatio: 1,
    backgroundColor: '#F6EBDD',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  functionCardText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B291A',
    marginTop: 8,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sidebar: {
    width: '68%',
    height: '100%',
    backgroundColor: '#F6EBDD',
    paddingTop: 50,
    paddingHorizontal: 22,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 4, height: 0 },
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingRight: 6,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A3525',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 8,
  },
  sidebarMenu: {
    gap: 22,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sidebarItemText: {
    fontSize: 15,
    color: '#4A3525',
    fontWeight: '500',
  },

  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  alertCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#F6EBDD',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B291A',
    marginTop: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#4A3525',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertCancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alertCancelText: {
    color: '#4A3525',
    fontWeight: 'bold',
  },
  alertConfirmButton: {
    flex: 1,
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alertConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
