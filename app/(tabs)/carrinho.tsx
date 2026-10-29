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
import { origemImagem } from '../../lib/imagens';
import { buscarCupons, calcularDesconto, formatarPreco, ItemCarrinho, loja, NOMES_TAMANHO } from '../../lib/loja';
import { cor, criarEstilos, useTema } from '../../lib/tema';
 
export default function CarrinhoScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back(); 
    } else {
      router.replace('/menu');
    }
  }
 
  const [itens, setItens] = useState<ItemCarrinho[]>(loja.carrinho);
  const [cupom, setCupom] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState('');
  const [mensagemCupom, setMensagemCupom] = useState('');
  const [aviso, setAviso] = useState('');
  const [perguntaAberta, setPerguntaAberta] = useState(false);

  // Sempre que a tela abre, pega o carrinho atualizado e o cupom escolhido na tela de Cupons
  useFocusEffect(
    useCallback(() => {
      setItens([...loja.carrinho]);
      buscarCupons();
      setAviso('');
      if (loja.cupom !== '') {
        setCupom(loja.cupom);
        setCupomAplicado(loja.cupom);
        setMensagemCupom('Cupom ' + loja.cupom + ' aplicado!');
      } else {
        setCupom('');
        setCupomAplicado('');
        setMensagemCupom('');
      }
    }, [])
  );

  function atualizarItens(novaLista: ItemCarrinho[]) {
    loja.carrinho = novaLista;
    setItens(novaLista);
  }
 
  // Alteração de quantidade
  const alterarQtd = (id: string, delta: number) => {
    atualizarItens(
      itens.map((item) => {
        if (item.id === id) {
          const novaQtd = item.qtd + delta;
          return { ...item, qtd: novaQtd > 1 ? novaQtd : 1 };
        }
        return item;
      })
    );
  };
 
  // Remover item individual
  const removerItem = (id: string) => {
    atualizarItens(itens.filter((item) => item.id !== id));
  };
 
  // Esvaziar o carrinho
  const limparCarrinho = () => {
    atualizarItens([]);
  };

  function aplicarCupom() {
    if (cupom.trim() === '') {
      setMensagemCupom('Digite o código do cupom.');
      return;
    }
    if (calcularDesconto(cupom, 0) === -1) {
      setMensagemCupom('Cupom inválido.');
      setCupomAplicado('');
      loja.cupom = '';
      return;
    }
    const codigo = cupom.trim().toUpperCase();
    setCupom(codigo);
    setCupomAplicado(codigo);
    loja.cupom = codigo;
    setMensagemCupom('Cupom ' + codigo + ' aplicado!');
  }
 
  // Cálculos automáticos de subtotal e total
  const subTotal = itens.reduce((acc, item) => acc + item.precoUnitario * item.qtd, 0);
  const desconto = cupomAplicado !== '' ? Math.max(0, calcularDesconto(cupomAplicado, subTotal)) : 0;
  const totalPagar = Math.max(0, subTotal - desconto);

  function prosseguir() {
    if (itens.length === 0) {
      setAviso('Adicione algum produto ao carrinho.');
      return;
    }
    loja.subtotal = subTotal;
    loja.desconto = desconto;
    setPerguntaAberta(true);
  }

  // Resposta da pergunta "Vai comer aqui ou levar?"
  function escolherModo(modo: 'Comer aqui' | 'Levar') {
    setPerguntaAberta(false);
    loja.modo = modo;
    if (modo === 'Comer aqui') {
      loja.enderecoEntrega = '';
      router.push('/pagamento');
    } else {
      router.push('/entrega');
    }
  }
 
  // --- CABEÇALHO DO CARRINHO ---
  const renderHeader = () => (
<View style={styles.headerContainer}>
<View style={styles.topBar}>
<TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={voltar}
          activeOpacity={0.8}
>
<Ionicons name="chevron-back" size={26} color={cor('#4A3525')} />
</TouchableOpacity>
 
        <Text style={styles.headerTitle}>Carrinho</Text>
 
        <View style={styles.headerPlaceholder} />
</View>
 
      {/* Ação de mover tudo para a lixeira */}
      {itens.length > 0 && (
<TouchableOpacity 
          style={styles.clearAllBtn} 
          onPress={limparCarrinho}
          activeOpacity={0.7}
>
<Text style={styles.clearAllText}>Mover tudo{'\n'}para lixeira</Text>
<Ionicons name="trash-outline" size={22} color={cor('#4A3525')} />
</TouchableOpacity>
      )}
</View>
  );
 
  // --- CARD INDIVIDUAL DO ITEM ---
  const renderItem = ({ item }: { item: ItemCarrinho }) => (
<View style={styles.cartCard}>
      {/* Imagem do Produto */}
<Image source={origemImagem(item.imagem, item.nome)} style={styles.productImage} />
 
      {/* Informações e Detalhes */}
<View style={styles.productDetails}>
<Text style={styles.productName} numberOfLines={1}>{item.nome}</Text>
<Text style={styles.productDesc} numberOfLines={1}>{item.desc}</Text>
<View style={styles.sizeWrapper}>
<Text style={styles.productSize}>Tamanho: {NOMES_TAMANHO[item.tamanho]}</Text>
</View>
 
        <Text style={styles.optionalLabel}>Opcional</Text>
<Text style={styles.optionalValue}>{item.opcional}</Text>
 
        <Text style={styles.productPrice}>
          {formatarPreco(item.precoUnitario * item.qtd)}
</Text>
 
        {/* Linha de Quantidade e Exclusão */}
<View style={styles.controlsRow}>
<View style={styles.quantityControls}>
<TouchableOpacity 
              style={styles.quantityBtn} 
              onPress={() => alterarQtd(item.id, -1)}
>
<Ionicons name="remove" size={14} color={cor('#FFFFFF')} />
</TouchableOpacity>
 
            <Text style={styles.quantityText}>{item.qtd}</Text>
 
            <TouchableOpacity 
              style={styles.quantityBtn} 
              onPress={() => alterarQtd(item.id, 1)}
>
<Ionicons name="add" size={14} color={cor('#FFFFFF')} />
</TouchableOpacity>
</View>
 
          <TouchableOpacity 
            onPress={() => removerItem(item.id)}
            style={styles.deleteIconBtn}
>
<Ionicons name="trash-outline" size={20} color={cor('#4A3525')} />
</TouchableOpacity>
</View>
</View>
</View>
  );
 
  return (
<View style={styles.container}>
      {/* Pergunta: comer aqui ou levar */}
      <Modal
        visible={perguntaAberta}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPerguntaAberta(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Vai comer aqui ou levar?</Text>

            <TouchableOpacity style={styles.modalOption} onPress={() => escolherModo('Comer aqui')}>
              <Ionicons name="restaurant-outline" size={22} color={cor('#FFFFFF')} />
              <Text style={styles.modalOptionText}>Comer aqui</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={() => escolherModo('Levar')}>
              <Ionicons name="bag-handle-outline" size={22} color={cor('#FFFFFF')} />
              <Text style={styles.modalOptionText}>Levar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPerguntaAberta(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lista com scroll dos itens */}
<FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
<View style={styles.emptyContainer}>
<Ionicons name="cart-outline" size={60} color={cor('#8C837A')} />
<Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
</View>
        }
      />
 
      {/* PAINEL FIXO INFERIOR (CUPOM E FECHAMENTO DA COMPRA) */}
<View style={styles.checkoutPanel}>
        {/* Campo do Cupom */}
<View style={styles.couponContainer}>
<TextInput
            style={styles.couponInput}
            placeholder="Código do cupom..."
            placeholderTextColor={cor('#8C837A')}
            autoCapitalize="characters"
            value={cupom}
            onChangeText={setCupom}
          />
<TouchableOpacity style={styles.applyCouponBtn} activeOpacity={0.8} onPress={aplicarCupom}>
<Text style={styles.applyCouponText}>Aplicar</Text>
</TouchableOpacity>
</View>

        {mensagemCupom !== '' && <Text style={styles.couponMessage}>{mensagemCupom}</Text>}
 
        {/* Linhas de Resumo */}
<View style={styles.summaryRow}>
<Text style={styles.summaryLabel}>Sub total</Text>
<Text style={styles.summaryValue}>{formatarPreco(subTotal)}</Text>
</View>
 
        <View style={styles.summaryRow}>
<Text style={styles.summaryLabel}>Desconto</Text>
<Text style={styles.summaryValue}>-{formatarPreco(desconto)}</Text>
</View>
 
        <View style={styles.panelDivider} />
 
        {/* Total Geral */}
<View style={styles.totalRow}>
<Text style={styles.totalLabel}>Total a pagar</Text>
<Text style={styles.totalValue}>{formatarPreco(totalPagar)}</Text>
</View>

        {aviso !== '' && <Text style={styles.couponMessage}>{aviso}</Text>}
 
        {/* Botão Prosseguir */}
<TouchableOpacity
          style={styles.checkoutButton}
          activeOpacity={0.85}
          onPress={prosseguir}
        >
<Text style={styles.checkoutButtonText}>Prosseguir</Text>
</TouchableOpacity>
</View>
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
    paddingBottom: 20,
  },
 
  // CABEÇALHO
  headerContainer: {
    paddingTop: 45,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C9A075',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'serif',
    color: '#3B291A',
    fontWeight: 'bold',
  },
  headerPlaceholder: {
    width: 44,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginTop: 10,
    marginBottom: 6,
  },
  clearAllText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B291A',
    textAlign: 'right',
    lineHeight: 12,
  },
 
  // CARD DO PRODUTO
  cartCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2A1F17',
  },
  productDesc: {
    fontSize: 10,
    color: '#6B5849',
    marginTop: 1,
  },
  sizeWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#A08970',
    paddingBottom: 2,
    marginTop: 2,
    marginBottom: 4,
  },
  productSize: {
    fontSize: 10,
    fontWeight: '500',
    color: '#3B291A',
  },
  optionalLabel: {
    fontSize: 9,
    color: '#3B291A',
    fontWeight: '600',
  },
  optionalValue: {
    fontSize: 9,
    color: '#6B5849',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2A1F17',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4A3525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2A1F17',
  },
  deleteIconBtn: {
    padding: 2,
  },
 
  // LISTA VAZIA
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B5849',
    fontWeight: '500',
  },
 
  // PAINEL FIXO INFERIOR
  checkoutPanel: {
    backgroundColor: '#C9A075',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
  },
  couponContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 4,
    marginBottom: 16,
  },
  couponInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  applyCouponBtn: {
    backgroundColor: '#4A3525',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  applyCouponText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#2A1F17',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    color: '#2A1F17',
    fontWeight: '600',
  },
  panelDivider: {
    height: 1,
    backgroundColor: '#4A3525',
    marginVertical: 10,
    opacity: 0.6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2A1F17',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2A1F17',
  },
  checkoutButton: {
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  couponMessage: {
    fontSize: 12,
    color: '#3B291A',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 10,
  },

  // PERGUNTA COMER AQUI / LEVAR
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 20,
    padding: 24,
    gap: 14,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#3B291A',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 14,
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancel: {
    color: '#4A3525',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});