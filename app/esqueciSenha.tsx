import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { estiloLogo, logo } from '../lib/imagens';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function EsqueceuSenhaScreen() {
  useTema();
  const router = useRouter();
  const [etapa, setEtapa] = useState('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');

  function handleConfirmarEmail() {
    if (email == '') {
      setErro('Digite o e-mail.');
      return;
    }

    setErro('');
    setEtapa('codigo');
  }

  function handleConfirmarCodigo() {
    if (codigo == '') {
      setErro('Digite o código.');
      return;
    }

    router.push('/novaSenha');
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
        {etapa === 'email' ? (
          <>
            <Text style={styles.pageTitle}>Email</Text>

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

            <Text style={styles.descriptionText}>
              Após confirmar seu email um código será enviado a caixa de entrada do seu email.
            </Text>

            {erro != '' ? <Text style={styles.erro}>{erro}</Text> : null}

            <TouchableOpacity style={styles.mainButton} onPress={handleConfirmarEmail}>
              <Text style={styles.mainButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.pageTitleCodigo}>Código</Text>

            <View style={styles.inputWrapperCodigo}>
              <TextInput
                style={styles.inputCodigo}
                placeholder="Código..."
                placeholderTextColor={cor('#8C837A')}
                value={codigo}
                onChangeText={setCodigo}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>

            {erro != '' ? <Text style={styles.erro}>{erro}</Text> : null}

            <TouchableOpacity style={styles.mainButton} onPress={handleConfirmarCodigo}>
              <Text style={styles.mainButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </>
        )}
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
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  pageTitleCodigo: {
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
  inputWrapperCodigo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 25,
    height: 50,
    justifyContent: 'center',
  },
  inputCodigo: {
    color: '#333',
    fontSize: 15,
  },
  descriptionText: {
    fontSize: 13,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 60,
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
