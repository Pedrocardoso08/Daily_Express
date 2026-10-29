import React, { useEffect, useState } from 'react';
import { 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  Image, 
  ScrollView 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { mapa } from '../lib/imagens';
import { enviar } from '../lib/api';
import { buscarEnderecos, Endereco, idUsuario, loja, textoEndereco } from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';
 
export default function EntregaScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/carrinho');
    }
  }
 
  // Estados dos campos de endereço
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
 
  // Tipo de endereço selecionado ('Casa' ou 'Empresa')
  const [tipoLocal, setTipoLocal] = useState<'Casa' | 'Empresa'>('Casa');

  // Lista de endereços salvos (abre ao tocar em "Endereço....")
  const [enderecos, setEnderecos] = useState([...loja.enderecos]);
  const [listaAberta, setListaAberta] = useState(false);
  const [erro, setErro] = useState('');

  // Lê os endereços salvos no banco quando a tela abre
  useEffect(() => {
    buscarEnderecos().then((lista) => setEnderecos(lista));
  }, []);

  // Preenche o formulário com um endereço salvo
  function escolherEndereco(endereco: Endereco) {
    setCidade(endereco.cidade);
    setBairro(endereco.bairro);
    setRua(endereco.rua);
    setNumero(endereco.numero);
    setTipoLocal(endereco.tipo === 'CASA' ? 'Casa' : 'Empresa');
    setListaAberta(false);
    setErro('');
  }
 
  const handleProsseguir = () => {
    if (cidade.trim() === '' || bairro.trim() === '' || rua.trim() === '' || numero.trim() === '') {
      setErro('Escolha um endereço salvo ou preencha todos os campos.');
      return;
    }

    const endereco: Endereco = {
      id: String(Date.now()),
      tipo: tipoLocal === 'Casa' ? 'CASA' : 'EMPRESA',
      rua: rua.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
    };

    // Se for um endereço novo, ele é salvo no banco e aparece na tela de Endereços
    const jaSalvo = enderecos.some(
      (item) => textoEndereco(item) === textoEndereco(endereco)
    );
    if (!jaSalvo) {
      enviar('/endereco', { ...endereco, usuario: idUsuario() }).catch(() => {});
    }

    loja.enderecoEntrega = textoEndereco(endereco);
    router.push('/pagamento');
  };
 
  return (
<View style={styles.container}>
<ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
>
        {/* 1. CABEÇALHO COM BOTÃO VOLTAR E TÍTULO */}
<View style={styles.headerRow}>
<TouchableOpacity 
            style={styles.backButtonCircle} 
            onPress={voltar}
            activeOpacity={0.8}
>
<Ionicons name="chevron-back" size={26} color={cor('#4A3525')} />
</TouchableOpacity>
 
          <Text style={styles.headerTitle}>Entrega</Text>
 
          <View style={styles.headerPlaceholder} />
</View>
 
        {/* 2. SELETOR DE ENDEREÇO SALVO (DROPDOWN) */}
<TouchableOpacity
          style={styles.addressDropdown}
          activeOpacity={0.85}
          onPress={() => setListaAberta(!listaAberta)}
>
<Ionicons name="location-sharp" size={20} color={cor('#4A3525')} />
<Text style={styles.dropdownPlaceholder}>Endereços salvos....</Text>
<Ionicons name={listaAberta ? 'chevron-up' : 'chevron-down'} size={20} color={cor('#4A3525')} />
</TouchableOpacity>

        {listaAberta && (
          <View style={styles.savedList}>
            {enderecos.length === 0 && (
              <Text style={styles.savedEmpty}>Nenhum endereço salvo.</Text>
            )}
            {enderecos.map((endereco) => (
              <TouchableOpacity
                key={endereco.id}
                style={styles.savedItem}
                onPress={() => escolherEndereco(endereco)}
              >
                <Ionicons
                  name={endereco.tipo === 'CASA' ? 'home-outline' : 'business-outline'}
                  size={18}
                  color={cor('#4A3525')}
                />
                <Text style={styles.savedText}>{textoEndereco(endereco)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
 
        {/* 3. CARTÃO DO MAPA COM PRÉ-VISUALIZAÇÃO */}
<View style={styles.mapCard}>
          {/* Ilustração / Visualização do Mapa */}
<View style={styles.mapArea}>
<Image 
              source={mapa} 
              style={styles.mapImage}
            />
            {/* Marcador central do mapa */}
<View style={styles.markerBadge}>
<Ionicons name="location" size={28} color={cor('#4A3525')} />
</View>
</View>
 
          {/* Dados do endereço exibido pelo mapa */}
<View style={styles.mapAddressInfo}>
<Text style={styles.mapAddressText}>
              Cidade {cidade || '********'}; Bairro {bairro || '******'}; Rua {rua || '******'}
</Text>
<Text style={styles.mapAddressText}>
              Número {numero || '********'}
</Text>
</View>
</View>
 
        {/* 4. FORMULÁRIO DE ENDEREÇO */}
<View style={styles.formContainer}>
          {/* Campo: Cidade */}
<View style={styles.inputField}>
<Ionicons name="business" size={20} color={cor('#4A3525')} />
<TextInput
              style={styles.inputText}
              placeholder="Cidade...."
              placeholderTextColor={cor('#A08970')}
              value={cidade}
              onChangeText={setCidade}
            />
</View>
 
          {/* Campo: Bairro */}
<View style={styles.inputField}>
<MaterialCommunityIcons name="sign-direction" size={20} color={cor('#4A3525')} />
<TextInput
              style={styles.inputText}
              placeholder="Bairro...."
              placeholderTextColor={cor('#A08970')}
              value={bairro}
              onChangeText={setBairro}
            />
</View>
 
          {/* Linha: Rua e Número */}
<View style={styles.inputsRow}>
            {/* Campo: Rua */}
<View style={[styles.inputField, styles.halfInput]}>
<MaterialCommunityIcons name="road-variant" size={20} color={cor('#4A3525')} />
<TextInput
                style={styles.inputText}
                placeholder="Rua...."
                placeholderTextColor={cor('#A08970')}
                value={rua}
                onChangeText={setRua}
              />
</View>
 
            {/* Campo: Número */}
<View style={[styles.inputField, styles.halfInput]}>
<Ionicons name="home" size={18} color={cor('#4A3525')} />
<TextInput
                style={styles.inputText}
                placeholder="Numero...."
                placeholderTextColor={cor('#A08970')}
                keyboardType="numeric"
                value={numero}
                onChangeText={setNumero}
              />
</View>
</View>
 
          {/* Botões de Seleção: Casa / Empresa */}
<View style={styles.typeButtonsRow}>
<TouchableOpacity 
              style={[
                styles.typeButton,
                tipoLocal === 'Casa' && styles.typeButtonActive
              ]}
              onPress={() => setTipoLocal('Casa')}
              activeOpacity={0.8}
>
<Text style={styles.typeButtonText}>Casa</Text>
</TouchableOpacity>
 
            <TouchableOpacity 
              style={[
                styles.typeButton,
                tipoLocal === 'Empresa' && styles.typeButtonActive
              ]}
              onPress={() => setTipoLocal('Empresa')}
              activeOpacity={0.8}
>
<Text style={styles.typeButtonText}>Empresa</Text>
</TouchableOpacity>
</View>
</View>
 
        {erro !== '' && <Text style={styles.erroText}>{erro}</Text>}

        {/* 5. BOTÃO PROSSEGUIR */}
<TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleProsseguir}
          activeOpacity={0.85}
>
<Text style={styles.continueButtonText}>Prosseguir</Text>
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
    marginBottom: 24,
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
 
  // SELETOR DE ENDEREÇO
  addressDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#8C837A',
    marginLeft: 10,
    fontWeight: '500',
  },
  savedList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    marginTop: -10,
    marginBottom: 18,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  savedText: {
    flex: 1,
    fontSize: 13,
    color: '#2A1F17',
  },
  savedEmpty: {
    fontSize: 13,
    color: '#8C837A',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  erroText: {
    color: '#B3261E',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
 
  // CARTÃO DO MAPA
  mapCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  mapArea: {
    height: 180,
    backgroundColor: '#E5DFD7',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.65,
  },
  markerBadge: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  mapAddressInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F6EBDD',
  },
  mapAddressText: {
    fontSize: 11,
    color: '#2A1F17',
    fontWeight: '500',
    lineHeight: 16,
  },
 
  // FORMULÁRIO DE ENTRADA
  formContainer: {
    gap: 12,
    marginBottom: 24,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  inputText: {
    flex: 1,
    fontSize: 13,
    color: '#2A1F17',
    marginLeft: 10,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
 
  // BOTÕES CASA / EMPRESA
  typeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 4,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#5A4333',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4A3525',
    borderWidth: 1.5,
    borderColor: '#F6EBDD',
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
 
  // BOTÃO PROSSEGUIR
  continueButton: {
    backgroundColor: '#4A3525',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});