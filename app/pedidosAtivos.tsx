import React, { useCallback, useState } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { enviar } from '../lib/api';
import { estiloLogo, logo, origemImagem } from '../lib/imagens';
import {
  buscarPedidos,
  detalheItem,
  formatarPreco,
  idUsuario,
  loja,
  Pedido,
  soNumeros,
} from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

// Pedido ativo = ainda não foi finalizado nem cancelado. Só esses podem ser cancelados.
const STATUS_ATIVOS = ['Preparando', 'A caminho'];

function soAtivos(lista: Pedido[]) {
  return lista.filter((pedido) => STATUS_ATIVOS.includes(pedido.status));
}

export default function PedidosAtivosScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  }

  const [pedidos, setPedidos] = useState<Pedido[]>(soAtivos(loja.pedidos));
  const [aviso, setAviso] = useState('');

  // Caixa de cancelar pedido: aberta quando "cancelando" tem um pedido
  const [cancelando, setCancelando] = useState<Pedido | null>(null);
  const [codigoCancelar, setCodigoCancelar] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [erroCancelar, setErroCancelar] = useState('');

  // Toda vez que a tela aparece, lê os pedidos do banco
  useFocusEffect(
    useCallback(() => {
      buscarPedidos().then((lista) => setPedidos(soAtivos(lista)));
    }, [])
  );

  // Abre a caixa com um código novo de 3 dígitos (de 100 a 999)
  function abrirCancelamento(pedido: Pedido) {
    setCancelando(pedido);
    setCodigoCancelar(String(Math.floor(100 + Math.random() * 900)));
    setCodigoDigitado('');
    setErroCancelar('');
  }

  function confirmarCancelamento() {
    if (!cancelando) {
      return;
    }
    if (codigoDigitado !== codigoCancelar) {
      setErroCancelar('Código errado. Digite ' + codigoCancelar + ' para confirmar.');
      return;
    }

    enviar('/cancelarPedido', { usuario: idUsuario(), id: cancelando.id })
      .then((resposta) => {
        if (resposta.error) {
          setErroCancelar(resposta.error);
          return;
        }
        setCancelando(null);
        setAviso(resposta.message);
        buscarPedidos().then((lista) => setPedidos(soAtivos(lista)));
      })
      .catch(() => {
        setErroCancelar('Não foi possível cancelar o pedido.');
      });
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

        <Text style={styles.screenTitle}>Pedidos Ativos</Text>
      </View>

      <Text style={styles.dica}>Acompanhe aqui os pedidos em preparo ou a caminho.</Text>
      {aviso !== '' ? <Text style={styles.aviso}>{aviso}</Text> : null}
    </View>
  );

  const renderItem = ({ item }: { item: Pedido }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderTitle}>Pedido do dia  {item.data}</Text>

      <View style={styles.statusRow}>
        <Ionicons
          name={item.status === 'A caminho' ? 'bicycle-outline' : 'time-outline'}
          size={18}
          color={cor('#4A3525')}
        />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      <View style={styles.itemsList}>
        {item.itens.map((prod) => (
          <View key={prod.id} style={styles.productRow}>
            <Image source={origemImagem(prod.imagem, prod.nome)} style={styles.productImage} />
            <Text style={styles.productName}>
              {prod.qtd}x {prod.nome} ({detalheItem(prod)})
            </Text>
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

      <TouchableOpacity style={styles.cancelButton} onPress={() => abrirCancelamento(item)}>
        <Text style={styles.cancelButtonText}>Cancelar pedido</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVazio = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="receipt-outline" size={48} color={cor('#4A3525')} />
      <Text style={styles.emptyTitle}>Nenhum pedido ativo</Text>
      <Text style={styles.emptyText}>Quando você fizer um pedido, ele aparece aqui até ser finalizado.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader()}
        renderItem={renderItem}
        ListEmptyComponent={renderVazio()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        visible={cancelando !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelando(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Digite {codigoCancelar} para cancelar</Text>
            {cancelando ? (
              <View style={styles.modalInfo}>
                <Text style={styles.modalTexto}>
                  Pedido do dia {cancelando.data}, pago {formatarPreco(cancelando.total)}.
                </Text>
                <Text style={styles.modalAvisoTaxa}>
                  Atenção: cancelar gera uma taxa de 30% do valor pago ({formatarPreco(cancelando.total * 0.3)}).
                  Só 70% ({formatarPreco(cancelando.total * 0.7)}) volta para você.
                </Text>
              </View>
            ) : null}
            <TextInput
              style={styles.modalCampo}
              placeholder="000"
              placeholderTextColor={cor('#8C837A')}
              value={codigoDigitado}
              onChangeText={(texto) => setCodigoDigitado(soNumeros(texto))}
              keyboardType="number-pad"
              maxLength={3}
            />
            {erroCancelar !== '' ? <Text style={styles.modalErro}>{erroCancelar}</Text> : null}
            <View style={styles.modalBotoes}>
              <TouchableOpacity style={[styles.modalVoltar, styles.modalBotao]} onPress={() => setCancelando(null)}>
                <Text style={styles.modalVoltarTexto}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmar, styles.modalBotao]} onPress={confirmarCancelamento}>
                <Text style={styles.modalConfirmarTexto}>Cancelar pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexGrow: 1,
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
  navPlaceholder: {
    width: 38,
  },
  screenTitle: {
    fontSize: 26,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dica: {
    marginTop: 14,
    marginHorizontal: 20,
    textAlign: 'center',
    fontSize: 13,
    color: '#4A3525',
  },
  aviso: {
    marginTop: 6,
    marginHorizontal: 20,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#2E5A32',
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
  itemsList: {
    gap: 14,
    marginBottom: 22,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: '#4A3525',
    fontWeight: '500',
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
  orderPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A3525',
    marginBottom: 16,
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: '#8B2E2E',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8B2E2E',
    fontSize: 15,
    fontWeight: '600',
  },

  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A3525',
  },
  emptyText: {
    fontSize: 14,
    color: '#4A3525',
    textAlign: 'center',
  },

  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCaixa: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B291A',
    textAlign: 'center',
  },
  modalInfo: {
    gap: 8,
  },
  modalTexto: {
    fontSize: 14,
    color: '#4A3525',
    textAlign: 'center',
  },
  modalAvisoTaxa: {
    fontSize: 14,
    color: '#8B2E2E',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalCampo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4D3C4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#2C1810',
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
  },
  modalErro: {
    color: '#8B2E2E',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBotoes: {
    flexDirection: 'row',
    gap: 8,
  },
  modalBotao: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalVoltar: {
    borderWidth: 1.5,
    borderColor: '#4A3525',
  },
  modalVoltarTexto: {
    color: '#4A3525',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmar: {
    backgroundColor: '#8B2E2E',
  },
  modalConfirmarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
