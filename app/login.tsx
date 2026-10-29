import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { API } from '../lib/api';
import { estiloLogo, logo } from '../lib/imagens';
import { dataDeHoje, loja } from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function LoginScreen() {
  useTema();
  const { contaCriada, senhaAlterada } = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function handleEntrar() {
    if (email == '' || senha == '') {
      setErro('Preencha o e-mail e a senha.');
      return;
    }

    setErro('');
    setCarregando(true);

    fetch(API + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        senha: senha,
      }),
    })
      .then((response) => response.json())
      .then((dados) => {
        setCarregando(false);

        if (dados.error) {
          setErro(dados.error);
          setSenha('');
          return;
        }

        loja.usuario = {
          id: dados.usuario.id,
          nome: dados.usuario.nome,
          email: dados.usuario.email,
          logadoEm: dataDeHoje(),
        };
        router.replace('/menu');
      })
      .catch(() => {
        setCarregando(false);
        setErro('Não foi possível conectar ao servidor. Confira se o back-end e o MySQL estão ligados.');
      });
  }

  return (
    <View style={styles.container}>

      {/* 1. SECÇÃO SUPERIOR (Curva com Logótipo) */}
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

      {/* 2. SECÇÃO DE FORMULÁRIO */}
      <View style={styles.formContainer}>
        <Text style={styles.pageTitle}>LOGIN</Text>

        {contaCriada === '1' ? (
          <Text style={styles.sucesso}>Conta criada. Agora é só entrar.</Text>
        ) : null}
        {senhaAlterada === '1' ? (
          <Text style={styles.sucesso}>Senha alterada. Entre com a nova senha.</Text>
        ) : null}

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

        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={() => router.push('/esqueciSenha')}
        >
          <Text style={styles.forgotPasswordText}>Esqueci a senha</Text>
        </TouchableOpacity>

        {erro != '' ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={[styles.loginButton, carregando && styles.loginButtonDesativado]}
          onPress={handleEntrar}
          disabled={carregando}
        >
          <Text style={styles.loginButtonText}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não possui conta? </Text>
          <TouchableOpacity onPress={() => router.push('/cadastro')}>
            <Text style={styles.registerLink}>Criar conta</Text>
          </TouchableOpacity>
        </View>
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
    height: '42%',
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
    marginTop: 20,
  },
  logo: {
    ...estiloLogo,
    marginBottom: 10,
  },

  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 22,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 52,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    fontSize: 15,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#4A3525',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#4A3525',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDesativado: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#1A1A1A',
    fontSize: 14,
  },
  registerLink: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  sucesso: {
    color: '#1F7A4D',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  erro: {
    color: '#9B2335',
    marginBottom: 12,
    fontWeight: '600',
  },
});
