import React, { useState } from 'react';
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

export default function AjudaScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  }

  const [faqAberto, setFaqAberto] = useState(true);
  const [termosUsoAberto, setTermosUsoAberto] = useState(false);
  const [termosPrivacidadeAberto, setTermosPrivacidadeAberto] = useState(false);

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
                style={styles.logo}
                resizeMode="contain"
              />

              <View style={styles.navPlaceholder} />
            </View>

            <Text style={styles.screenTitle}>Ajuda</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Como podemos ajudar?</Text>

        <View style={styles.accordionCard}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setFaqAberto(!faqAberto)}
            activeOpacity={0.8}
          >
            <View style={styles.headerTitleGroup}>
              <Ionicons name="help-outline" size={24} color={cor('#1A1A1A')} />
              <Text style={styles.accordionTitle}>Perguntas frequentes.</Text>
            </View>
            <Ionicons
              name={faqAberto ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={cor('#1A1A1A')}
            />
          </TouchableOpacity>

          {faqAberto && (
            <View style={styles.faqContent}>
              <View style={styles.faqBox}>
                <Text style={styles.faqQuestion}>Quanto tempo demora para meu pedido sair?</Text>
                <Text style={styles.faqAnswer}>
                  Queridos clientes, os pedidos levam em média de 2 a 5 minutos.
                </Text>
              </View>

              <View style={styles.faqBox}>
                <Text style={styles.faqQuestion}>Possuem opções sem glutém?</Text>
                <Text style={styles.faqAnswer}>
                  Queridos Clientes, nosso menu conta com uma boa variedade de produtos sem glutém.
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.accordionCard}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setTermosUsoAberto(!termosUsoAberto)}
            activeOpacity={0.8}
          >
            <View style={styles.headerTitleGroup}>
              <Ionicons name="document-text" size={24} color={cor('#4A3525')} />
              <Text style={styles.accordionTitle}>Termos de uso</Text>
            </View>
            <Ionicons
              name={termosUsoAberto ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={cor('#1A1A1A')}
            />
          </TouchableOpacity>

          {termosUsoAberto && (
            <View style={styles.faqContent}>
              <View style={styles.faqBox}>
                <Text style={styles.faqAnswer}>
                  Ao utilizar a aplicação Daily Coffee, você concorda com nossos termos de pedidos, retiradas e políticas de consumo na cafeteria.
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.accordionCard}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setTermosPrivacidadeAberto(!termosPrivacidadeAberto)}
            activeOpacity={0.8}
          >
            <View style={styles.headerTitleGroup}>
              <Ionicons name="lock-closed" size={24} color={cor('#4A3525')} />
              <Text style={styles.accordionTitle}>Termos de uso</Text>
            </View>
            <Ionicons
              name={termosPrivacidadeAberto ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={cor('#1A1A1A')}
            />
          </TouchableOpacity>

          {termosPrivacidadeAberto && (
            <View style={styles.faqContent}>
              <View style={styles.faqBox}>
                <Text style={styles.faqAnswer}>
                  Seus dados e históricos de compras são protegidos para garantir máxima comodidade e segurança durante sua experiência.
                </Text>
              </View>
            </View>
          )}
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

  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },

  accordionCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },

  faqContent: {
    marginTop: 16,
    gap: 12,
  },
  faqBox: {
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    padding: 14,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 12,
    color: '#4A3525',
    lineHeight: 18,
  },

  navPlaceholder: {
    width: 38,
  },
});
