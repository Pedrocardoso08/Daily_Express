import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API } from '../lib/api';
import { estiloLogo, logo } from '../lib/imagens';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function CadastroScreen() {
  useTema();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function voltarAoLogin() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  }

  function handleCadastrar() {
    if (nome == '' || email == '' || senha == '' || confirmarSenha == '') {
      setErro('Preencha todos os campos.');
      return;
    }

    if (senha != confirmarSenha) {
      setErro('As senhas não conferem.');
      setSenha('');
      setConfirmarSenha('');
      return;
    }

    setErro('');
    setCarregando(true);

    fetch(API + '/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: nome.trim(),
        email: email.trim(),
        senha: senha,
      }),
    })
      .then((response) => response.json())
      .then((dados) => {
        setCarregando(false);

        if (dados.error) {
          setErro(dados.error);
          return;
        }

        router.replace({ pathname: '/login', params: { contaCriada: '1' } });
      })
      .catch(() => {
        setCarregando(false);
        setErro('Não foi possível conectar ao servidor. Confira se o back-end e o MySQL estão ligados.');
      });
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

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>CRIAR CONTA</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="person" size={20} color={cor('#4A3525')} />
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor={cor('#8C837A')}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail" size={20} color={cor('#4A3525')} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={cor('#8C837A')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="key" size={20} color={cor('#4A3525')} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
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
            <Ionicons name={mostrarConfirmarSenha ? 'eye' : 'eye-off'} size={20} color={cor('#4A3525')} />
          </TouchableOpacity>
        </View>

        <Text style={styles.socialTitle}>Continuar com:</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={() => setErro('O cadastro com Google ainda não está disponível.')}>
            <Ionicons name="logo-google" size={22} color={cor('#4A3525')} />
            <Text style={styles.socialText}>google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => setErro('O cadastro com Facebook ainda não está disponível.')}>
            <Ionicons name="logo-facebook" size={22} color={cor('#4A3525')} />
            <Text style={styles.socialText}>facebook</Text>
          </TouchableOpacity>
        </View>

        {erro != '' ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={[styles.mainButton, carregando && styles.mainButtonDesativado]}
          onPress={handleCadastrar}
          disabled={carregando}
        >
          <Text style={styles.mainButtonText}>{carregando ? 'Criando conta...' : 'Criar conta'}</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Já possui uma conta? </Text>
          <TouchableOpacity onPress={voltarAoLogin}>
            <Text style={styles.footerLink}>Logar</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 30,
    paddingTop: 15,
  },
  pageTitle: {
    fontSize: 22,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    fontSize: 15,
  },
  socialTitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1A1A1A',
    marginTop: 10,
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  socialText: {
    fontSize: 15,
    color: '#4A3525',
  },
  mainButton: {
    backgroundColor: '#4A3525',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  mainButtonDesativado: {
    opacity: 0.6,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'normal',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#1A1A1A',
    fontSize: 13,
  },
  footerLink: {
    color: '#1A1A1A',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  erro: {
    color: '#9B2335',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
});
