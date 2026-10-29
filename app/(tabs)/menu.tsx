import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ImageBackground,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { banner, estiloLogo, fotoDoUsuario, logo, origemImagem } from '../../lib/imagens';
import {
  adicionarAoCarrinho,
  alternarFavorito,
  buscarFavoritos,
  buscarProdutos,
  estaNoCarrinho,
  loja,
  paraNumero,
  ProdutoCatalogo,
  removerDoCarrinho,
  sair,
} from '../../lib/loja';
import { cor, criarEstilos, useTema } from '../../lib/tema';

const CATEGORIAS: { id: string; titulo: string; icone: any }[] = [
  { id: '1', titulo: 'Promoção', icone: 'gift' },
  { id: '2', titulo: 'Bebidas', icone: 'cafe' },
  { id: '3', titulo: 'Salgados', icone: 'fast-food' },
  { id: '4', titulo: 'Doces', icone: 'ice-cream' },
];

export default function HomeScreen() {
  const { escuro: modoEscuro, alternarTema } = useTema();
  const flatListRef = useRef<any>(null);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Promoção');
  const [menuAberto, setMenuAberto] = useState(false);
  // Nomes dos produtos favoritados e dos que estão no carrinho
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [noCarrinho, setNoCarrinho] = useState<string[]>([]);
  const [catalogo, setCatalogo] = useState<ProdutoCatalogo[]>([...loja.produtos]);

  // Toda vez que a tela aparece, lê o cardápio e os favoritos do banco e o carrinho da memória
  useFocusEffect(
    useCallback(() => {
      buscarProdutos().then((lista) => setCatalogo(lista));
      buscarFavoritos().then((lista) => setFavoritos(lista.map((produto) => produto.nome)));
      setNoCarrinho(loja.carrinho.map((item) => item.nome));
    }, [])
  );

  const produtosFiltrados = catalogo.filter((produto) => produto.categoria === categoriaAtiva);

  function favoritar(item: ProdutoCatalogo) {
    alternarFavorito({
      nome: item.nome,
      desc: item.desc,
      nota: item.nota,
      preco: item.precoNovo,
      imagem: item.imagem,
    });
    setFavoritos(loja.favoritos.map((produto) => produto.nome));
  }

  function alternarCarrinho(item: ProdutoCatalogo) {
    if (estaNoCarrinho(item.nome)) {
      removerDoCarrinho(item.nome);
    } else {
      adicionarAoCarrinho({
        nome: item.nome,
        desc: item.desc,
        tamanho: 'P',
        opcional: '---',
        precoUnitario: paraNumero(item.precoNovo),
        qtd: 1,
        imagem: item.imagem,
      });
    }
    setNoCarrinho(loja.carrinho.map((produto) => produto.nome));
  }

  const voltarAoTopo = () => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.heroWrapper}>
        <ImageBackground
          source={banner}
          style={styles.heroBackground}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => setMenuAberto(true)}>
                <Ionicons name="menu" size={32} color={cor('#fff')} />
              </TouchableOpacity>
              <Image source={logo} style={styles.miniLogo} resizeMode="contain" />
              <Image source={fotoDoUsuario()} style={styles.avatar} />
            </View>

            <Text style={styles.welcomeText}>Bem vindo!</Text>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={cor('#8C837A')} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar..."
                placeholderTextColor={cor('#8C837A')}
                value={busca}
                onChangeText={setBusca}
              />
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <FlatList
          data={CATEGORIAS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isAtivo = item.titulo === categoriaAtiva;
            return (
              <TouchableOpacity
                style={[styles.catButton, isAtivo && styles.catButtonActive]}
                onPress={() => setCategoriaAtiva(item.titulo)}
              >
                <Ionicons name={item.icone} size={24} color={cor(isAtivo ? '#4A3525' : '#fff')} />
                <Text style={[styles.catText, isAtivo && styles.catTextActive]}>{item.titulo}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );

  const renderProduto = ({ item }: { item: ProdutoCatalogo }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: '/produto',
          params: {
            nome: item.nome,
            descricao: item.desc,
            nota: item.nota,
            preco: item.precoNovo,
            imagem: item.imagem,
          },
        })
      }
    >
      <Image source={origemImagem(item.imagem, item.nome)} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.nome}</Text>
        <Text style={styles.productDesc} numberOfLines={1}>{item.desc}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color={cor('#4A3525')} />
          <Text style={styles.ratingText}>{item.nota}</Text>
        </View>

        <View style={styles.priceRow}>
          {item.precoAntigo !== '' && item.precoAntigo !== item.precoNovo ? (
            <Text style={styles.oldPrice}>R${item.precoAntigo}</Text>
          ) : null}
          <Text style={styles.newPrice}>R${item.precoNovo}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.cartButton, noCarrinho.includes(item.nome) && styles.cartButtonActive]}
            onPress={() => alternarCarrinho(item)}
          >
            <Ionicons
              name="cart"
              size={18}
              color={cor(noCarrinho.includes(item.nome) ? '#4A3525' : '#fff')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => favoritar(item)}>
            <Ionicons
              name={favoritos.includes(item.nome) ? 'heart' : 'heart-outline'}
              size={22}
              color={cor('#4A3525')}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
                  sair();
                  router.replace('/login');
                }}
              >
                <Ionicons name="exit-outline" size={22} color={cor('#4A3525')} />
                <Text style={styles.sidebarItemText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        ref={flatListRef}
        data={produtosFiltrados}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={renderProduto}
        ListFooterComponent={
          <TouchableOpacity style={styles.backToTopButton} onPress={voltarAoTopo}>
            <Ionicons name="chevron-up" size={20} color={cor('#fff')} />
            <Text style={styles.backToTopText}>Voltar ao topo</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingBottom: 110 }}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum produto nesta categoria.</Text>}
      />
    </View>
  );
}

const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#EAD1A8',
  },
  vazio: {
    textAlign: 'center',
    color: '#4A3525',
    fontSize: 15,
    marginTop: 24,
    marginHorizontal: 24,
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

  headerContainer: {
    marginBottom: 10,
  },
  heroWrapper: {
    height: 360,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
  },
  heroBackground: {
    flex: 1,
    width: '100%',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 53, 37, 0.4)',
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  miniLogo: {
    ...estiloLogo,
    tintColor: '#fff',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#C9A075',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    height: 45,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },

  categoriesSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A3525',
    marginBottom: 15,
  },
  categoriesList: {
    gap: 15,
    paddingRight: 20,
  },
  catButton: {
    backgroundColor: '#4A3525',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: 85,
  },
  catButtonActive: {
    backgroundColor: '#C9A075',
  },
  catText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  catTextActive: {
    color: '#4A3525',
    fontWeight: 'bold',
  },

  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: '#FFF4E3',
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  productInfo: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A3525',
  },
  productDesc: {
    fontSize: 9,
    color: '#8C837A',
    marginTop: 2,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 10,
    color: '#4A3525',
    marginLeft: 3,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  oldPrice: {
    fontSize: 10,
    color: '#8C837A',
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  newPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A3525',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#4A3525',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#4A3525',
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  cartButtonActive: {
    backgroundColor: '#fff',
  },

  backToTopButton: {
    backgroundColor: '#4A3525',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backToTopText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});
