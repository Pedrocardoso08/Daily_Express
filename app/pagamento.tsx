import React, { useState } from 'react';
import { 
  Text, 
  TextInput,
  View, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { dataDeHoje, formatarPreco, loja } from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';
 
export default function PagamentoScreen() {
  useTema();
  const router = useRouter();
 
  // Estado da forma selecionada (Pix por padrão)
  const [formaSelecionada, setFormaSelecionada] = useState('Pix');
 
  // Estados dos campos do cartão
  const [nomeTitular, setNomeTitular] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
 
  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(loja.modo === 'Levar' ? '/entrega' : '/carrinho');
    }
  }

  const total = Math.max(0, loja.subtotal - loja.desconto);

  // Salva o pedido no histórico e esvazia o carrinho
  const handleFinalizar = () => {
    if (loja.carrinho.length > 0) {
      loja.pedidos.unshift({
        id: String(Date.now()),
        data: dataDeHoje(),
        status: 'Preparando',
        itens: loja.carrinho.map((item) => ({ ...item })),
        total,
        modo: loja.modo,
        endereco: loja.modo === 'Levar' ? loja.enderecoEntrega : '',
      });
    }

    loja.carrinho = [];
    loja.cupom = '';
    loja.subtotal = 0;
    loja.desconto = 0;
    router.replace('/finalizado');
  };
 
  // Verifica se a opção atual requer o preenchimento de dados do cartão
  const exibirFormularioCartao = 
    formaSelecionada === 'Cartão de crédito' || formaSelecionada === 'Cartão de débito';
 
  return (
<View style={styles.container}>
<ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
>
        {/* 1. NAVEGAÇÃO E TÍTULO */}
<View style={styles.headerRow}>
<TouchableOpacity 
            style={styles.backButtonCircle} 
            onPress={voltar}
            activeOpacity={0.8}
>
<Ionicons name="chevron-back" size={26} color={cor('#4A3525')} />
</TouchableOpacity>
 
          <Text style={styles.headerTitle}>Pagamento</Text>
 
          <View style={styles.headerPlaceholder} />
</View>
 
        {/* 2. RESUMO DOS VALORES */}
<View style={styles.summaryContainer}>
<View style={styles.summaryRow}>
<Text style={styles.summaryLabel}>Sub total</Text>
<Text style={styles.summaryValue}>{formatarPreco(loja.subtotal)}</Text>
</View>
 
          <View style={styles.summaryRow}>
<Text style={styles.summaryLabel}>Desconto</Text>
<Text style={styles.summaryValue}>-{formatarPreco(loja.desconto)}</Text>
</View>
 
          <View style={styles.summaryRow}>
<Text style={styles.summaryLabel}>{loja.modo === 'Levar' ? 'Levar' : 'Comer aqui'}</Text>
<Text style={[styles.summaryValue, styles.summaryAddress]} numberOfLines={2}>
              {loja.modo === 'Levar' ? loja.enderecoEntrega : 'Retirar no balcão'}
</Text>
</View>
 
          <View style={styles.divider} />
 
          {/* TOTAL A PAGAR */}
<View style={styles.totalRow}>
<Text style={styles.totalLabel}>Total a pagar</Text>
<Text style={styles.totalValue}>{formatarPreco(total)}</Text>
</View>
 
          <View style={styles.divider} />
</View>
 
        {/* 3. FORMAS DE PAGAMENTO */}
<View style={styles.paymentMethodsSection}>
<Text style={styles.sectionTitle}>Forma de pagamento</Text>
 
          {/* Opção: Cartão de crédito */}
<TouchableOpacity 
            style={styles.radioRow} 
            onPress={() => setFormaSelecionada('Cartão de crédito')}
            activeOpacity={0.7}
>
<View style={[
              styles.radioCircle, 
              formaSelecionada === 'Cartão de crédito' && styles.radioCircleActive
            ]}>
              {formaSelecionada === 'Cartão de crédito' ? (
<View style={styles.radioInnerHole} />
              ) : (
<View style={styles.radioDotFilled} />
              )}
</View>
<Text style={styles.radioLabel}>Cartão de crédito</Text>
</TouchableOpacity>
 
          {/* Opção: Cartão de débito */}
<TouchableOpacity 
            style={styles.radioRow} 
            onPress={() => setFormaSelecionada('Cartão de débito')}
            activeOpacity={0.7}
>
<View style={[
              styles.radioCircle, 
              formaSelecionada === 'Cartão de débito' && styles.radioCircleActive
            ]}>
              {formaSelecionada === 'Cartão de débito' ? (
<View style={styles.radioInnerHole} />
              ) : (
<View style={styles.radioDotFilled} />
              )}
</View>
<Text style={styles.radioLabel}>Cartão de débito</Text>
</TouchableOpacity>
 
          {/* 4. FORMULÁRIO DINÂMICO DE CARTÃO */}
          {exibirFormularioCartao && (
<View style={styles.cardFormContainer}>
              {/* Linha tracejada superior */}
<View style={styles.dashedLine} />
 
              {/* Seletor: Adicionar cartão existente */}
<TouchableOpacity style={styles.inputDropdown} activeOpacity={0.8}>
<Text style={styles.dropdownPlaceholder}>Adicionar cartão existente</Text>
<Ionicons name="chevron-down" size={20} color={cor('#4A3525')} />
</TouchableOpacity>
 
              {/* Input: Nome do titular */}
<View style={styles.inputPill}>
<TextInput
                  style={styles.inputText}
                  placeholder="Nome do titular.."
                  placeholderTextColor={cor('#A08970')}
                  value={nomeTitular}
                  onChangeText={setNomeTitular}
                />
<Ionicons name="pencil" size={16} color={cor('#A08970')} />
</View>
 
              {/* Input: Número do cartão */}
<View style={styles.inputPill}>
<TextInput
                  style={styles.inputText}
                  placeholder="Número do cartão.."
                  placeholderTextColor={cor('#A08970')}
                  keyboardType="numeric"
                  value={numeroCartao}
                  onChangeText={setNumeroCartao}
                />
<Ionicons name="pencil" size={16} color={cor('#A08970')} />
</View>
 
              {/* Linha com MM/AA e CVV */}
<View style={styles.smallInputsRow}>
<View style={styles.smallInputPill}>
<TextInput
                    style={styles.smallInputText}
                    placeholder="[MM/AA]"
                    placeholderTextColor={cor('#A08970')}
                    keyboardType="numeric"
                    maxLength={5}
                    value={validade}
                    onChangeText={setValidade}
                  />
</View>
 
                <View style={styles.smallInputPill}>
<TextInput
                    style={styles.smallInputText}
                    placeholder="CVV"
                    placeholderTextColor={cor('#A08970')}
                    keyboardType="numeric"
                    maxLength={4}
                    value={cvv}
                    onChangeText={setCvv}
                  />
</View>
</View>
 
              {/* Linha tracejada inferior */}
<View style={styles.dashedLine} />
</View>
          )}
 
          {/* Opção: Pix */}
<TouchableOpacity 
            style={styles.radioRow} 
            onPress={() => setFormaSelecionada('Pix')}
            activeOpacity={0.7}
>
<View style={[
              styles.radioCircle, 
              formaSelecionada === 'Pix' && styles.radioCircleActive
            ]}>
              {formaSelecionada === 'Pix' ? (
<View style={styles.radioInnerHole} />
              ) : (
<View style={styles.radioDotFilled} />
              )}
</View>
<Text style={styles.radioLabel}>Pix</Text>
</TouchableOpacity>
 
          {/* Opção: Dinheiro */}
<TouchableOpacity 
            style={styles.radioRow} 
            onPress={() => setFormaSelecionada('Dinheiro')}
            activeOpacity={0.7}
>
<View style={[
              styles.radioCircle, 
              formaSelecionada === 'Dinheiro' && styles.radioCircleActive
            ]}>
              {formaSelecionada === 'Dinheiro' ? (
<View style={styles.radioInnerHole} />
              ) : (
<View style={styles.radioDotFilled} />
              )}
</View>
<Text style={styles.radioLabel}>Dinheiro</Text>
</TouchableOpacity>
</View>
 
        {/* 5. BOTÃO FINALIZAR */}
<TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleFinalizar}
          activeOpacity={0.85}
>
<Text style={styles.submitButtonText}>Finalizar</Text>
</TouchableOpacity>
</ScrollView>
</View>
  );
}
 
// --- ESTILIZAÇÃO RESPONSIVA ---
const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#EAD1A8',
  },
  scrollContent: {
    paddingTop: 45,
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
 
  // CABEÇALHO
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34,
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
    fontSize: 28,
    fontFamily: 'serif',
    color: '#3B291A',
    fontWeight: 'bold',
  },
  headerPlaceholder: {
    width: 44,
  },
 
  // RESUMO
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  summaryAddress: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#4A3525',
    marginVertical: 12,
    opacity: 0.6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A1F17',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A1F17',
  },
 
  // FORMAS DE PAGAMENTO
  paymentMethodsSection: {
    marginTop: 8,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2A1F17',
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A3525',
  },
  radioCircleActive: {
    borderWidth: 2.5,
    borderColor: '#4A3525',
    backgroundColor: '#EAD1A8',
  },
  radioDotFilled: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4A3525',
  },
  radioInnerHole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A3525',
  },
  radioLabel: {
    fontSize: 13,
    color: '#2A1F17',
    fontWeight: '500',
  },
 
  // FORMULÁRIO DO CARTÃO
  cardFormContainer: {
    marginVertical: 6,
    gap: 10,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#4A3525',
    borderStyle: 'dashed',
    marginVertical: 8,
    marginHorizontal: 12,
  },
  inputDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dropdownPlaceholder: {
    fontSize: 12,
    color: '#A08970',
    fontWeight: '500',
  },
  inputPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  inputText: {
    flex: 1,
    fontSize: 12,
    color: '#2A1F17',
    paddingVertical: 4,
  },
  smallInputsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 2,
  },
  smallInputPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 34,
    width: 86,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallInputText: {
    fontSize: 12,
    color: '#2A1F17',
    textAlign: 'center',
  },
 
  // BOTÃO FINALIZAR
  submitButton: {
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});