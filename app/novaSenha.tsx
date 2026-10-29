import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { estiloLogo, logo } from '../lib/imagens';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function NovaSenhaScreen() {
  useTema();
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erro, setErro] = useState('');

  function handleConfirmar() {
    if (senha == '' || confirmarSenha == '') {
      setErro('Preencha os dois campos.');
      return;
    }

    if (senha != confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    router.replace({ pathname: '/login', params: { senhaAlterada: '1' } });
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.curveShape} />
        <View style={styles.logoContainer}>
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.pageTitle}>Nova senha</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="key" size={20} color={cor('#4A3525')} />
          <TextInput
            style={styles.input}
            placeholder="Nova senha"
            placeholderTextColor={cor('#8C837A')}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Ionicons name={mostrarSenha ? 'eye' : 'eye-off'} size={20} color={cor('#4A3525')} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="key" size={20} color={cor('#4A3525')} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor={cor('#8C837A')}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={!mostrarConfirmarSenha}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}>
            <Ionicons
              name={mostrarConfirmarSenha ? 'eye' : 'eye-off'}
              size={20}
              color={cor('#4A3525')}
            />
          </TouchableOpacity>
        </View>

        {erro != '' ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity style={styles.mainButton} onPress={handleConfirmar}>
          <Text style={styles.mainButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#EAD1A8',
  },
  topSection: {
    height: '35%',
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  curveShape: {
    position: 'absolute',
    bottom: 0,
    width: '150%',
    height: '150%',
    backgroundColor: '#C9A075',
    borderBottomLeftRadius: 400,
    borderBottomRightRadius: 400,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  logo: {
    ...estiloLogo,
    marginBottom: 10,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 40,
  },
  pageTitle: {
    fontSize: 20,
    color: '#4A3525',
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 25,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    fontSize: 15,
  },
  mainButton: {
    backgroundColor: '#4A3525',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  mainButtonDesativado: {
    opacity: 0.6,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'normal',
  },
  erro: {
    color: '#9B2335',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
});
