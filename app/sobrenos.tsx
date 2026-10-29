import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { estiloLogo, logo } from '../lib/imagens';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function SobreNosScreen() {
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topSection}>
          <View style={styles.curveContainer}>
            <View style={styles.topNav}>
              <TouchableOpacity onPress={voltar} style={styles.navButton}>
                <Ionicons name="chevron-back" size={30} color={cor('#4A3525')} />
              </TouchableOpacity>

              <Image
                source={logo}
                style={styles.headerLogo}
                resizeMode="contain"
              />

              <View style={styles.navPlaceholder} />
            </View>

            <Text style={styles.screenTitle}>Sobre Nós</Text>
          </View>
        </View>

        <View style={styles.brandSection}>
          <Image
            source={logo}
            style={styles.brandImage}
            resizeMode="contain"
          />
          <View style={styles.brandInfo}>
            <Text style={styles.brandTitle}>Daily Coffee</Text>
            <Text style={styles.brandSubtitle}>Desde 2020</Text>
            <Text style={styles.brandLocation}>Criciúma - SC</Text>
          </View>
        </View>

        <View style={styles.missionContainer}>
          <Text style={styles.missionText}>
            Nossa missão é oferecer cafés especiais, bebidas artesanais e doces preparados com ingredientes selecionados, criando momentos únicos para nossos clientes e preservando o meio ambiente com produtos reciclados.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={26} color={cor('#4A3525')} />
            <Text style={styles.sectionTitle}>Horário de funcionamento</Text>
          </View>
          <View style={styles.sectionBody}>
            <Text style={styles.scheduleText}>Segunda a Sexta  -  08h às 20h</Text>
            <Text style={styles.scheduleText}>Sábados  -  09h às 18h</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe-outline" size={26} color={cor('#4A3525')} />
            <Text style={styles.sectionTitle}>Redes sociais</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.socialRow}>
              <Ionicons name="logo-instagram" size={22} color={cor('#4A3525')} />
              <Text style={styles.socialText}>@dailyexpress.cafe</Text>
            </View>
            <View style={styles.socialRow}>
              <Ionicons name="logo-tiktok" size={22} color={cor('#4A3525')} />
              <Text style={styles.socialText}>@dailyexpress.cafe</Text>
            </View>
          </View>
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
  scrollContent: {
    paddingBottom: 40,
  },

  topSection: {
    marginBottom: 20,
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
  headerLogo: {
    ...estiloLogo,
  },
  screenTitle: {
    fontSize: 26,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 15,
  },
  brandImage: {
    ...estiloLogo,
  },
  brandInfo: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#4A3525',
    marginBottom: 8,
  },
  brandLocation: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },

  missionContainer: {
    paddingHorizontal: 30,
    marginTop: 15,
    marginBottom: 30,
  },
  missionText: {
    fontSize: 13,
    color: '#2A1F17',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },

  infoSection: {
    paddingHorizontal: 35,
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  sectionBody: {
    paddingLeft: 36,
    gap: 8,
  },
  scheduleText: {
    fontSize: 13,
    color: '#2A1F17',
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialText: {
    fontSize: 14,
    color: '#2A1F17',
    letterSpacing: 1.5,
  },

  navPlaceholder: {
    width: 38,
  },
});
