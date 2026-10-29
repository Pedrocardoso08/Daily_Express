import React, { useCallback, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { estiloLogo, logo } from '../lib/imagens';
import { buscarCupons, CupomLoja, loja } from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function CuponsScreen() {
  useTema();
  const router = useRouter();
  const [cupons, setCupons] = useState<CupomLoja[]>([...loja.cupons]);

  useFocusEffect(
    useCallback(() => {
      buscarCupons().then((lista) => setCupons(lista));
    }, [])
  );

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  }

  // Guarda o cupom escolhido e abre o carrinho, que aplica o desconto
  function usarCupom(codigo: string) {
    loja.cupom = codigo;
    router.push('/carrinho');
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

        <Text style={styles.screenTitle}>Cupons</Text>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterSubtitle}>Você possui</Text>
        <Text style={styles.counterTitle}>
          <Text style={styles.counterNumber}>{cupons.length} </Text>
          Cupons!
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: CupomLoja }) => (
    <View style={styles.couponCard}>
      <Text style={styles.couponCode}>{item.codigo}</Text>
      <Text style={styles.couponOffer}>{item.titulo}</Text>
      <Text style={styles.couponDetails}>{item.descricao}</Text>
      {item.validade !== '' && (
        <Text style={styles.couponDetails}>Válido até {item.validade}</Text>
      )}

      <TouchableOpacity
        style={styles.useButton}
        activeOpacity={0.85}
        onPress={() => usarCupom(item.codigo)}
      >
        <Text style={styles.useButtonText}>Usar Cupom</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>

      <FlatList
        data={cupons}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
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
    marginBottom: 6,
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

  counterContainer: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  counterSubtitle: {
    fontSize: 15,
    color: '#4A3525',
    fontWeight: '500',
    marginBottom: 4,
  },
  counterTitle: {
    fontSize: 16,
    color: '#4A3525',
    fontWeight: 'bold',
  },
  counterNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  couponCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  couponCode: {
    fontSize: 14,
    color: '#4A3525',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  couponOffer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  couponDetails: {
    fontSize: 12,
    color: '#4A3525',
    marginBottom: 18,
  },
  useButton: {
    backgroundColor: '#4A3525',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  navPlaceholder: {
    width: 38,
  },
});
