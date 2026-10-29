import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { origemImagem } from '../lib/imagens';
import {
  adicionarAoCarrinho,
  alternarFavorito,
  buscarFavoritos,
  ehFavorito,
  formatarPreco,
  paraNumero,
  precoPorTamanho,
  sair,
} from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

const DESCRICAO_CAPUCCINO =
  'cappuccino clássico italiano é uma bebida equilibrada, famosa por sua textura aveludada e pela divisão visual perfeita de seus ingredientes. Na receita tradicional, ele é composto por três partes iguais: 1/3 de café expresso, 1/3 de leite vaporizado e 1/3 de espuma de leite.';

function texto(valor: string | string[] | undefined, padrao: string) {
  if (typeof valor === 'string' && valor !== '') {
    return valor;
  }
  return padrao;
}

export default function ProdutoDetalhesScreen() {
  const { escuro: modoEscuro, alternarTema } = useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  }
  const params = useLocalSearchParams<{
    nome?: string;
    descricao?: string;
    nota?: string;
    preco?: string;
    imagem?: string;
  }>();

  const nome = texto(params.nome, 'Capuccino clássico');
  const nota = texto(params.nota, '4.6');
  const preco = texto(params.preco, '13,90');
  const imagem = texto(
    params.imagem,
    'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800&auto=format&fit=crop'
  );
  const descricao =
    nome === 'Capuccino clássico' ? DESCRICAO_CAPUCCINO : texto(params.descricao, DESCRICAO_CAPUCCINO);

  const [menuAberto, setMenuAberto] = useState(false);
  const [favorito, setFavorito] = useState(ehFavorito(nome));
  const [tamanho, setTamanho] = useState<'P' | 'M' | 'G'>('P');
  const [quantidade, setQuantidade] = useState(1);

  // Confere no banco se o produto está nos favoritos
  useEffect(() => {
    buscarFavoritos().then(() => setFavorito(ehFavorito(nome)));
  }, [nome]);

  const aumentarQtd = () => setQuantidade((prev) => prev + 1);
  const diminuirQtd = () => setQuantidade((prev) => (prev > 1 ? prev - 1 : 1));

  // Preço de um copo no tamanho escolhido, vezes a quantidade
  const precoUnitario = precoPorTamanho(paraNumero(preco), tamanho);
  const precoTotal = precoUnitario * quantidade;

  function favoritar() {
    alternarFavorito({ nome, desc: texto(params.descricao, ''), nota, preco, imagem });
    setFavorito(!favorito);
  }

  function colocarNoCarrinho() {
    adicionarAoCarrinho({
      nome,
      desc: texto(params.descricao, ''),
      tamanho,
      opcional: '---',
      precoUnitario,
      qtd: quantidade,
      imagem,
    });
    router.push('/carrinho');
  }

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <ImageBackground source={origemImagem(imagem, nome)} style={styles.productBanner}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => setMenuAberto(true)} style={styles.iconButton}>
                <Ionicons name="menu" size={30} color={cor('#FFFFFF')} />
              </TouchableOpacity>

              <TouchableOpacity onPress={voltar} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={28} color={cor('#FFFFFF')} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.detailsContent}>
          <Text style={styles.productTitle}>{nome}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingInfo}>
              <Ionicons name="star" size={18} color={cor('#4A3525')} />
              <Text style={styles.ratingValue}>{nota}</Text>
            </View>

            <TouchableOpacity onPress={favoritar}>
              <Ionicons
                name={favorito ? 'heart' : 'heart-outline'}
                size={24}
                color={cor('#4A3525')}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Descrição</Text>
            <Text style={styles.descriptionText}>{descricao}</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Tamanho</Text>
            <View style={styles.sizeRow}>
              {(['P', 'M', 'G'] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.sizeButton, tamanho === item && styles.sizeButtonActive]}
                  onPress={() => setTamanho(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sizeText, tamanho === item && styles.sizeTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Quantidade</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity style={styles.quantityBtn} onPress={diminuirQtd} activeOpacity={0.7}>
                <Ionicons name="remove" size={20} color={cor('#FFFFFF')} />
              </TouchableOpacity>

              <Text style={styles.quantityNumber}>{quantidade}</Text>

              <TouchableOpacity style={styles.quantityBtn} onPress={aumentarQtd} activeOpacity={0.7}>
                <Ionicons name="add" size={20} color={cor('#FFFFFF')} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.priceText}>{formatarPreco(precoTotal)}</Text>

            <TouchableOpacity style={styles.cartButton} activeOpacity={0.85} onPress={colocarNoCarrinho}>
              <Ionicons name="cart" size={24} color={cor('#FFFFFF')} />
            </TouchableOpacity>
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
    paddingBottom: 40,
  },

  imageContainer: {
    height: 300,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  productBanner: {
    flex: 1,
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 20,
  },
  iconButton: {
    padding: 6,
  },

  detailsContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B291A',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#A08970',
    paddingBottom: 8,
    marginBottom: 14,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B291A',
  },

  sectionBlock: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B291A',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#3B291A',
    textAlign: 'justify',
  },

  sizeRow: {
    flexDirection: 'row',
    gap: 14,
  },
  sizeButton: {
    flex: 1,
    backgroundColor: '#4A3525',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonActive: {
    backgroundColor: '#2E1F14',
    borderWidth: 1.5,
    borderColor: '#FFFDF9',
  },
  sizeText: {
    color: '#EAD1A8',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sizeTextActive: {
    color: '#FFFFFF',
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  quantityBtn: {
    backgroundColor: '#4A3525',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B291A',
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B291A',
  },
  cartButton: {
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
});
