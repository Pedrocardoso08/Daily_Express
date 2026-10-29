import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { estiloLogo, fotoPerfil, logo } from '../../lib/imagens';
import { cor, criarEstilos, useTema } from '../../lib/tema';

type NomeIcone = React.ComponentProps<typeof Ionicons>['name'];

type Notificacao = {
  id: string;
  icone: NomeIcone;
  titulo: string;
  descricao: string;
};

// --- DADOS DAS NOTIFICAÇÕES ---
const NOTIFICACOES_INICIAIS: Notificacao[] = [
  {
    id: '1',
    icone: 'cafe',
    titulo: 'Temos um novo café!',
    descricao: 'Venha experimentar nosso novo café, feito com grãos selecionados e de maneira sustentável!',
  },
  {
    id: '2',
    icone: 'gift',
    titulo: 'Confira a semana de promoções!',
    descricao: 'Aproveite para vir tomar café na Daily Express na semana de promoções.',
  },
  {
    id: '3',
    icone: 'gift',
    titulo: 'Aproveite o dia do cliente!',
    descricao: 'Aproveite o dia do cliente e economize comendo mais do que gosta.',
  },
  {
    id: '4',
    icone: 'pricetag',
    titulo: 'Você ganhou cupons!',
    descricao: 'Feliz Aniversário! Você ganhou cupons de promoção!',
  },
];

export default function NotificacoesScreen() {
  const { escuro: modoEscuro, alternarTema } = useTema();
  const router = useRouter();

  // Estados de controle da gaveta lateral, tema e lista
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_INICIAIS);
  const [todasLidas, setTodasLidas] = useState(false);

  const marcarComoLidas = () => {
    setTodasLidas(true);
  };

  function irPara(rota: '/historicoPedidos' | '/cupons' | '/endereco' | '/ajuda' | '/faleconosco' | '/sobrenos') {
    setMenuAberto(false);
    router.push(rota);
  }

  // --- CABEÇALHO COM CURVA SUPERIOR E SUBTÍTULOS ---
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topSection}>
        <View style={styles.curveContainer}>
          <View style={styles.topNav}>
            {/* Botão para abrir o menu lateral */}
            <TouchableOpacity onPress={() => setMenuAberto(true)} style={styles.navButton}>
              <Ionicons name="menu" size={30} color={cor('#3B291A')} />
            </TouchableOpacity>

            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
            />

            <Image
              source={fotoPerfil}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.screenTitle}>Notificações</Text>
        </View>
      </View>

      {/* Texto de Apresentação e Botão de Ação */}
      <View style={styles.subHeaderArea}>
        <Text style={styles.introText}>Veja o que temos de{'\n'}novidade para você!</Text>

        <TouchableOpacity
          style={[styles.markReadButton, todasLidas && styles.markReadButtonActive]}
          onPress={marcarComoLidas}
          activeOpacity={0.8}
        >
          <Text style={styles.markReadText}>
            {todasLidas ? 'Tudo lido' : 'Marcar tudo como lido'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- CARD INDIVIDUAL DE NOTIFICAÇÃO ---
  const renderItem = ({ item }: { item: Notificacao }) => (
    <View style={styles.notificationCard}>
      <View style={styles.cardHeaderRow}>
        <Ionicons name={item.icone} size={22} color={cor('#4A3525')} />
        <Text style={styles.cardTitle}>{item.titulo}</Text>
      </View>
      <Text style={styles.cardDescription}>{item.descricao}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 1. SIDEBAR LATERAL (MODAL) */}
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
              <TouchableOpacity style={styles.sidebarItem} onPress={() => irPara('/historicoPedidos')}>
                <Ionicons name="folder-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Histórico de pedidos</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => irPara('/cupons')}>
                <Ionicons name="pricetag-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Cupons</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => irPara('/endereco')}>
                <Ionicons name="location-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Endereços salvos</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => irPara('/ajuda')}>
                <Ionicons name="help-circle-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Ajuda/FAQ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => irPara('/faleconosco')}>
                <Ionicons name="call-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Fale conosco</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => irPara('/sobrenos')}>
                <Ionicons name="information-circle-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Sobre nós</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. LISTA DE NOTIFICAÇÕES */}
      <FlatList
        data={notificacoes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// --- ESTILIZAÇÃO RESPONSIVA ---
const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#EAD1A8',
  },
  listContent: {
    paddingBottom: 110, // Espaço para a barra de navegação inferior
  },

  // CABEÇALHO CURVO
  headerContainer: {
    marginBottom: 8,
  },
  topSection: {
    marginBottom: 16,
  },
  curveContainer: {
    backgroundColor: '#C9A075',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 45,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  navButton: {
    padding: 4,
  },
  logo: {
    ...estiloLogo,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#C9A075',
  },
  screenTitle: {
    fontSize: 26,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // SUB-CABEÇALHO
  subHeaderArea: {
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 10,
  },
  introText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A1F17',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 14,
  },
  markReadButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A3525',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  markReadButtonActive: {
    backgroundColor: '#7A6250',
  },
  markReadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // CARTÃO DE NOTIFICAÇÃO
  notificationCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2A1F17',
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    color: '#3B291A',
    lineHeight: 17,
  },

  // SIDEBAR (MODAL)
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
});
