import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { estiloLogo, logo } from '../lib/imagens';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function FaleConoscoScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  }

  return (
    <View style={styles.container}>

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

          <Text style={styles.screenTitle}>Fale Conosco</Text>
        </View>
      </View>

      <View style={styles.contentArea}>
        <View style={styles.contactCard}>
          <View style={styles.contactItem}>
            <View style={styles.contactHeader}>
              <Ionicons name="call" size={24} color={cor('#4A3525')} />
              <Text style={styles.contactLabel}>Telefone</Text>
            </View>
            <Text style={styles.contactValue}>(**) ****-****</Text>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactHeader}>
              <Ionicons name="mail" size={24} color={cor('#4A3525')} />
              <Text style={styles.contactLabel}>Email</Text>
            </View>
            <Text style={styles.contactValue}>contato@cafeteria.com</Text>
          </View>

          <View style={[styles.contactItem, styles.lastItem]}>
            <View style={styles.contactHeader}>
              <Ionicons name="logo-whatsapp" size={24} color={cor('#4A3525')} />
              <Text style={styles.contactLabel}>Whatsapp</Text>
            </View>
            <Text style={styles.contactValue}>(**) ****-****</Text>
          </View>
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

  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  contactItem: {
    marginBottom: 32,
  },
  lastItem: {
    marginBottom: 0,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  contactValue: {
    fontSize: 14,
    color: '#4A3525',
    marginLeft: 36,
  },

  navPlaceholder: {
    width: 38,
  },
});
