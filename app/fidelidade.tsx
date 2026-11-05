import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { buscar } from '../lib/api';
import { estiloLogo, logo } from '../lib/imagens';
import { buscarPerfil } from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function FidelidadeScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/perfil');
    }
  }

  const [pontos, setPontos] = useState(0);
  // Prêmios cadastrados na Área do funcionário (vêm do menor para o maior)
  const [recompensas, setRecompensas] = useState<{ id: number; nome: string; pontos: number }[]>([]);

  // Lê os pontos e os prêmios do banco quando a tela abre
  useEffect(() => {
    buscarPerfil().then((perfil) => {
      if (perfil) {
        setPontos(perfil.pontos_fidelidade);
      }
    });
    buscar('/recompensas')
      .then((lista) => {
        if (Array.isArray(lista)) {
          setRecompensas(lista);
        }
      })
      .catch(() => {});
  }, []);

  // A mensagem fala do próximo prêmio da lista
  let mensagem = 'A loja ainda não cadastrou prêmios. Continue juntando pontos!';
  if (recompensas.length > 0) {
    const proximo = recompensas.find((item) => item.pontos > pontos);
    if (proximo) {
      mensagem = 'Faltam ' + (proximo.pontos - pontos) + ' pontos para ganhar ' + proximo.nome + '!';
    } else {
      mensagem = 'Você já pode trocar seus pontos por ' + recompensas[recompensas.length - 1].nome + '!';
    }
  }

  // A cápsula tem 4 partes; cada 250 pontos enche uma (de baixo para cima)
  const partesCheias = Math.min(4, Math.floor(pontos / 250));

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

          <Text style={styles.screenTitle}>Fidelidade</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pointsTitleContainer}>
          <Text style={styles.pointsTitle}>Seus pontos</Text>
          <View style={styles.titleUnderline} />
        </View>

        <Text style={styles.pointsValue}>{pontos} / 1000</Text>

        <View style={styles.meterContainer}>
          <View style={styles.capsuleMeter}>
            <View style={[styles.segment, partesCheias >= 4 ? styles.segmentFilledTop : styles.segmentEmpty]} />
            <View style={[styles.segment, partesCheias >= 3 ? styles.segmentFilledTop : styles.segmentEmpty]} />
            <View style={[styles.segment, partesCheias >= 2 ? styles.segmentFilledTop : styles.segmentEmpty]} />
            <View style={[styles.segment, partesCheias >= 1 ? styles.segmentFilledBottom : styles.segmentEmpty]} />
          </View>
        </View>

        <View style={styles.bubbleWrapper}>
          <View style={styles.bubbleCard}>
            <Text style={styles.bubbleText}>{mensagem}</Text>
          </View>
          <View style={styles.bubbleTail} />
        </View>

        <View style={styles.divider} />

        <View style={styles.rewardsSection}>
          <Text style={styles.rewardsTitle}>Recompensas</Text>

          {recompensas.map((item) => (
            <View key={item.id} style={styles.rewardItem}>
              <Ionicons name="gift" size={30} color={cor('#4A3525')} />
              <Text style={styles.rewardText} numberOfLines={1}>
                {item.nome} - {item.pontos} pontos
              </Text>
            </View>
          ))}

          {recompensas.length === 0 ? (
            <Text style={styles.rewardText}>Nenhum prêmio cadastrado ainda.</Text>
          ) : null}
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
    marginBottom: 16,
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

  pointsTitleContainer: {
    alignSelf: 'flex-start',
    marginLeft: 28,
    marginTop: 10,
    marginBottom: 18,
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B291A',
  },
  titleUnderline: {
    height: 2.5,
    backgroundColor: '#007AFF',
    marginTop: 2,
    width: '100%',
  },
  pointsValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 14,
  },

  meterContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  capsuleMeter: {
    width: 62,
    height: 104,
    borderRadius: 31,
    borderWidth: 1.5,
    borderColor: '#C7B199',
    overflow: 'hidden',
    backgroundColor: '#F6EBDD',
  },
  segment: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#D3BFAB',
  },
  segmentEmpty: {
    backgroundColor: '#F6EBDD',
  },
  segmentFilledTop: {
    backgroundColor: '#B59E87',
  },
  segmentFilledBottom: {
    backgroundColor: '#A89078',
    borderBottomWidth: 0,
  },

  bubbleWrapper: {
    marginHorizontal: 30,
    marginBottom: 24,
  },
  bubbleCard: {
    backgroundColor: '#F6EBDD',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  bubbleText: {
    fontSize: 13,
    color: '#2A1F17',
    fontWeight: '500',
    lineHeight: 18,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F6EBDD',
    marginLeft: 18,
  },

  divider: {
    height: 1,
    backgroundColor: '#3B291A',
    marginHorizontal: 26,
    marginBottom: 20,
    opacity: 0.7,
  },

  rewardsSection: {
    paddingHorizontal: 26,
  },
  rewardsTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#3B291A',
    marginBottom: 18,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  rewardText: {
    flex: 1,
    fontSize: 13,
    color: '#2A1F17',
    fontWeight: '500',
  },
});
