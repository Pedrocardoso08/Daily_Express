import React, { useCallback, useState } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { buscar, enviar } from '../lib/api';
import { estiloLogo, logo, origemImagem } from '../lib/imagens';
import {
  adicionarAoCarrinho,
  buscarPedidos,
  formatarPreco,
  idUsuario,
  ItemCarrinho,
  loja,
  NOMES_TAMANHO,
  Pedido,
} from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function HistoricoPedidosScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  }

  const [busca, setBusca] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([...loja.pedidos]);
  // Notas que o cliente já deu, pelo id do produto. Ex.: { '3': 5, '7': 2 }
  const [notas, setNotas] = useState<any>({});
  const [aviso, setAviso] = useState('');

  // Toda vez que a tela aparece, lê os pedidos e as avaliações do banco
  useFocusEffect(
    useCallback(() => {
      buscarPedidos().then((lista) => setPedidos(lista));
      buscar('/avaliacoes?usuario=' + idUsuario())
        .then((lista) => {
          if (!Array.isArray(lista)) {
            return;
          }
          const novasNotas: any = {};
          lista.forEach((item) => {
            novasNotas[String(item.produto_id)] = item.nota;
          });
          setNotas(novasNotas);
        })
        .catch(() => {});
    }, [])
  );

  // Toque numa estrela = essa nota. Tocar de novo na mesma estrela tira uma (assim dá para dar 0).
  function avaliar(produto: ItemCarrinho, estrela: number) {
    if (!produto.produtoId) {
      return;
    }
    const nota = notas[produto.produtoId] === estrela ? estrela - 1 : estrela;

    setNotas({ ...notas, [produto.produtoId]: nota });
    setAviso('');

    enviar('/avaliacao', { usuario: idUsuario(), produto: produto.produtoId, nota: nota })
      .then((resposta) => {
        setAviso(resposta.error ? resposta.error : 'Você deu ' + nota + ' de 5 para ' + produto.nome + '.');
      })
      .catch(() => {
        setAviso('Não foi possível salvar a avaliação.');
      });
  }

  // Mostra só os pedidos que têm algum produto com o nome pesquisado
  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.itens.some((item) => item.nome.toLowerCase().includes(busca.toLowerCase()))
  );

  // Coloca os itens do pedido no carrinho e abre o carrinho
  function pedirNovamente(pedido: Pedido) {
    pedido.itens.forEach((item) => {
      adicionarAoCarrinho({
        nome: item.nome,
        desc: item.desc,
        tamanho: item.tamanho,
        opcional: item.opcional,
        precoUnitario: item.precoUnitario,
        qtd: item.qtd,
        imagem: item.imagem,
      });
    });
    router.push('/carrinho');
  }

  const renderHeader = () => (
    <View style={styles.topSection}>
      <View style={styles.curveContainer}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={voltar} style={styles.navButton}>
            <Ionicons name="chevron-back" size={30} color={cor('#4A3525')} />
          </TouchableOpacity>

          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.navPlaceholder} />
        </View>

        <Text style={styles.screenTitle}>Histórico de Pedidos</Text>

        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={20} color={cor('#8C837A')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar pedidos..."
            placeholderTextColor={cor('#8C837A')}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      </View>

      <Text style={styles.dicaAvaliar}>Toque nas estrelas para avaliar o que você pediu.</Text>
      {aviso !== '' ? <Text style={styles.avisoAvaliar}>{aviso}</Text> : null}
    </View>
  );

  const renderItem = ({ item }: { item: Pedido }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderTitle}>Pedido do dia  {item.data}</Text>

      <View style={styles.statusRow}>
        <Ionicons name={item.status === 'Cancelado' ? 'close' : 'checkmark'} size={18} color={cor('#4A3525')} />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      {item.status === 'Cancelado' ? (
        <Text style={styles.canceladoText}>
          Pedido cancelado pela loja. {formatarPreco(item.total * 0.7)} (70% do valor) será devolvido.
        </Text>
      ) : null}

      <View style={styles.itemsList}>
        {item.itens.map((prod) => (
          <View key={prod.id} style={styles.productRow}>
            <Image source={origemImagem(prod.imagem, prod.nome)} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {prod.qtd}x {prod.nome} ({NOMES_TAMANHO[prod.tamanho]})
              </Text>
              {prod.produtoId ? (
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <TouchableOpacity key={estrela} onPress={() => avaliar(prod, estrela)} hitSlop={4}>
                      <Ionicons
                        name={notas[prod.produtoId as string] >= estrela ? 'star' : 'star-outline'}
                        size={20}
                        color={cor('#4A3525')}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.orderInfoRow}>
        <Ionicons
          name={item.modo === 'Comer aqui' ? 'restaurant-outline' : 'location-outline'}
          size={16}
          color={cor('#4A3525')}
        />
        <Text style={styles.orderInfoText}>
          {item.modo === 'Comer aqui' ? 'Comer aqui' : item.endereco}
        </Text>
      </View>

      <Text style={styles.orderPrice}>{formatarPreco(item.total)}</Text>

      <TouchableOpacity style={styles.reorderButton} onPress={() => pedirNovamente(item)}>
        <Text style={styles.reorderButtonText}>Pedir Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#EAD1A8',
  },
  listContainer: {
    paddingBottom: 40,
  },

  topSection: {
    marginBottom: 20,
  },
  curveContainer: {
    backgroundColor: '#C9A075',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 45,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    padding: 4,
  },
  logo: {
    ...estiloLogo,
  },
  screenTitle: {
    fontSize: 26,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  searchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },

  orderCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 22,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A3525',
    textAlign: 'center',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#4A3525',
    fontWeight: '500',
  },
  canceladoText: {
    fontSize: 13,
    color: '#8B2E2E',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -12,
    marginBottom: 16,
  },
  itemsList: {
    gap: 14,
    marginBottom: 22,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    color: '#4A3525',
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dicaAvaliar: {
    marginTop: 14,
    marginHorizontal: 20,
    textAlign: 'center',
    fontSize: 13,
    color: '#4A3525',
  },
  avisoAvaliar: {
    marginTop: 6,
    marginHorizontal: 20,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#2E5A32',
  },
  productImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  orderInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#4A3525',
  },
  emptyText: {
    textAlign: 'center',
    color: '#4A3525',
    fontSize: 14,
    marginTop: 20,
  },
  orderPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A3525',
    marginBottom: 16,
  },
  reorderButton: {
    backgroundColor: '#4A3525',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  navPlaceholder: {
    width: 38,
  },
});
