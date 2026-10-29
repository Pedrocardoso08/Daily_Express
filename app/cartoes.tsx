import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { estiloLogo, logo } from '../lib/imagens';
import { Cartao, loja } from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function CartoesScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/perfil');
    }
  }

  const [cartoes, setCartoes] = useState(loja.cartoes);

  // Formulário de novo cartão
  const [formAberto, setFormAberto] = useState(false);
  const [nomeCartao, setNomeCartao] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [erro, setErro] = useState('');

  function atualizarCartoes(novaLista: Cartao[]) {
    loja.cartoes = novaLista;
    setCartoes(novaLista);
  }

  const removerCartao = (id: string) => {
    atualizarCartoes(cartoes.filter((item) => item.id !== id));
  };

  function fecharFormulario() {
    setFormAberto(false);
    setNomeCartao('');
    setNumeroCartao('');
    setValidade('');
    setErro('');
  }

  function salvarCartao() {
    const somenteNumeros = numeroCartao.replace(/\D/g, '');

    if (nomeCartao.trim() === '' || somenteNumeros.length < 13 || validade.length !== 5) {
      setErro('Preencha o nome, o número completo e a validade (MM/AA).');
      return;
    }

    // Só os 4 últimos dígitos ficam salvos
    const finalCartao = somenteNumeros.slice(-4);
    const novoCartao: Cartao = {
      id: String(Date.now()),
      nome: `${nomeCartao.trim()} final ${finalCartao}`,
      numero: `**** **** **** ${finalCartao}`,
      validade: `Validade ${validade}`,
    };

    atualizarCartoes([...cartoes, novoCartao]);
    fecharFormulario();
  }

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
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

        <Text style={styles.screenTitle}>Cartões</Text>
      </View>

      <Text style={styles.sectionTitle}>Seus cartões</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Cartao }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardHeaderRow}>
        <Ionicons name="card" size={26} color={cor('#4A3525')} />
        <Text style={styles.cardName}>{item.nome}</Text>
      </View>

      <Text style={styles.cardNumber}>{item.numero}</Text>

      <View style={styles.cardFooterRow}>
        <Text style={styles.cardExpiry}>{item.validade}</Text>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removerCartao(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={22} color={cor('#4A3525')} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Modal
        visible={formAberto}
        animationType="fade"
        transparent={true}
        onRequestClose={fecharFormulario}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo cartão</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome (ex.: Visa, Nubank...)"
              placeholderTextColor={cor('#A08970')}
              value={nomeCartao}
              onChangeText={setNomeCartao}
            />
            <TextInput
              style={styles.input}
              placeholder="Número do cartão"
              placeholderTextColor={cor('#A08970')}
              keyboardType="numeric"
              maxLength={19}
              value={numeroCartao}
              onChangeText={setNumeroCartao}
            />
            <TextInput
              style={styles.input}
              placeholder="Validade (MM/AA)"
              placeholderTextColor={cor('#A08970')}
              keyboardType="numeric"
              maxLength={5}
              value={validade}
              onChangeText={setValidade}
            />

            {erro !== '' && <Text style={styles.erroText}>{erro}</Text>}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={fecharFormulario}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={salvarCartao}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={cartoes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setFormAberto(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={22} color={cor('#FFFFFF')} />
            <Text style={styles.addButtonText}>Adicionar cartão</Text>
          </TouchableOpacity>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#EAD1A8',
  },
  listContent: {
    paddingBottom: 40,
  },

  headerWrapper: {
    marginBottom: 10,
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
    marginBottom: 8,
  },
  navButton: {
    padding: 4,
  },
  navPlaceholder: {
    width: 38,
  },
  logo: {
    ...estiloLogo,
  },
  screenTitle: {
    fontSize: 26,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 24,
    marginTop: 22,
    marginBottom: 6,
  },

  cardItem: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  cardNumber: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 18,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardExpiry: {
    fontSize: 13,
    color: '#4A3525',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 18,
    padding: 22,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B291A',
    textAlign: 'center',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2A1F17',
  },
  erroText: {
    color: '#B3261E',
    fontSize: 12,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4A3525',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
