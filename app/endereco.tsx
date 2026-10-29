import React, { useEffect, useState } from 'react';
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
import { enviar } from '../lib/api';
import { buscarEnderecos, Endereco, idUsuario, loja } from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function EnderecosScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  }

  const [enderecos, setEnderecos] = useState([...loja.enderecos]);

  // Formulário de novo endereço
  const [formAberto, setFormAberto] = useState(false);
  const [tipo, setTipo] = useState<'CASA' | 'EMPRESA'>('CASA');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [erro, setErro] = useState('');

  // Lê os endereços do banco quando a tela abre
  useEffect(() => {
    buscarEnderecos().then((lista) => setEnderecos(lista));
  }, []);

  const removerEndereco = (id: string) => {
    enviar('/removerEndereco', { id: id })
      .then(() => buscarEnderecos())
      .then((lista) => setEnderecos(lista))
      .catch(() => {});
  };

  function fecharFormulario() {
    setFormAberto(false);
    setTipo('CASA');
    setRua('');
    setNumero('');
    setBairro('');
    setCidade('');
    setErro('');
  }

  function salvarEndereco() {
    if (rua.trim() === '' || numero.trim() === '' || bairro.trim() === '' || cidade.trim() === '') {
      setErro('Preencha todos os campos.');
      return;
    }

    enviar('/endereco', {
      usuario: idUsuario(),
      tipo: tipo,
      rua: rua.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
    })
      .then((dados) => {
        if (dados.error) {
          setErro(dados.error);
          return;
        }
        fecharFormulario();
        buscarEnderecos().then((lista) => setEnderecos(lista));
      })
      .catch(() => {
        setErro('Não foi possível conectar ao servidor.');
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

        <Text style={styles.screenTitle}>Endereços</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Endereco }) => (
    <View style={styles.addressCard}>
      <View style={styles.titleRow}>
        <Ionicons name="location-sharp" size={20} color={cor('#4A3525')} />
        <Text style={styles.addressType}>{item.tipo}</Text>
      </View>

      <Text style={styles.streetText}>
        {item.rua}, {item.numero} - {item.bairro}
      </Text>
      <Text style={styles.cityText}>{item.cidade}</Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removerEndereco(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={22} color={cor('#4A3525')} />
      </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Novo endereço</Text>

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeButton, tipo === 'CASA' && styles.typeButtonActive]}
                onPress={() => setTipo('CASA')}
              >
                <Text style={[styles.typeText, tipo === 'CASA' && styles.typeTextActive]}>Casa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, tipo === 'EMPRESA' && styles.typeButtonActive]}
                onPress={() => setTipo('EMPRESA')}
              >
                <Text style={[styles.typeText, tipo === 'EMPRESA' && styles.typeTextActive]}>Empresa</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Rua"
              placeholderTextColor={cor('#A08970')}
              value={rua}
              onChangeText={setRua}
            />
            <TextInput
              style={styles.input}
              placeholder="Número"
              placeholderTextColor={cor('#A08970')}
              keyboardType="numeric"
              value={numero}
              onChangeText={setNumero}
            />
            <TextInput
              style={styles.input}
              placeholder="Bairro"
              placeholderTextColor={cor('#A08970')}
              value={bairro}
              onChangeText={setBairro}
            />
            <TextInput
              style={styles.input}
              placeholder="Cidade"
              placeholderTextColor={cor('#A08970')}
              value={cidade}
              onChangeText={setCidade}
            />

            {erro !== '' && <Text style={styles.erroText}>{erro}</Text>}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={fecharFormulario}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={salvarEndereco}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={enderecos}
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
            <Text style={styles.addButtonText}>Adicionar endereço</Text>
          </TouchableOpacity>
        }
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
    marginBottom: 25,
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

  addressCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  streetText: {
    fontSize: 14,
    color: '#4A3525',
    fontWeight: '500',
    marginBottom: 6,
  },
  cityText: {
    fontSize: 14,
    color: '#4A3525',
    fontWeight: '500',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
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
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4A3525',
  },
  typeText: {
    color: '#4A3525',
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: '#FFFFFF',
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
