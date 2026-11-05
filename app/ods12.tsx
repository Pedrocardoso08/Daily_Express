import React from 'react';
import { Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COR_ODS12 } from '../components/SeloOds12';
import { estiloLogo, logo } from '../lib/imagens';
import { cor, criarEstilos, useTema } from '../lib/tema';

// O que a loja faz para seguir a ODS 12, com a meta da ONU de cada ação
const COMPROMISSOS: { icone: any; titulo: string; texto: string; meta: string }[] = [
  {
    icone: 'reload',
    titulo: 'Embalagens recicladas',
    texto: 'Copos, tampas e sacolas são feitos de material reciclado e podem ser reciclados de novo.',
    meta: '12.5',
  },
  {
    icone: 'cafe',
    titulo: 'Traga sua caneca',
    texto: 'Caneca ou copo próprio é sempre bem-vindo: é um descartável a menos no lixo.',
    meta: '12.5',
  },
  {
    icone: 'restaurant',
    titulo: 'Desperdício zero',
    texto: 'Preparamos em pequenas quantidades ao longo do dia. O que acaba sai do cardápio do app na hora, sem sobras.',
    meta: '12.3',
  },
  {
    icone: 'flower',
    titulo: 'Borra de café vira adubo',
    texto: 'A borra que sobra do café vai para a compostagem e volta para a terra.',
    meta: '12.5',
  },
  {
    icone: 'storefront',
    titulo: 'Produtores da região',
    texto: 'Compramos de fornecedores locais: menos transporte e uso mais eficiente dos recursos.',
    meta: '12.2',
  },
  {
    icone: 'phone-portrait',
    titulo: 'Tudo pelo app, sem papel',
    texto: 'Pedido, pagamento, cupons e histórico ficam no celular. Nada de comanda ou panfleto impresso.',
    meta: '12.5',
  },
];

// Metas oficiais da ODS 12 que a Daily Express segue
const METAS: { numero: string; texto: string }[] = [
  { numero: '12.2', texto: 'Usar os recursos naturais de forma sustentável e eficiente.' },
  { numero: '12.3', texto: 'Reduzir pela metade o desperdício de alimentos.' },
  { numero: '12.5', texto: 'Diminuir a geração de lixo com prevenção, redução, reciclagem e reúso.' },
  { numero: '12.8', texto: 'Garantir que as pessoas tenham informação para um estilo de vida sustentável.' },
];

const DICAS = [
  'Traga sua caneca ou copo reutilizável.',
  'Escolha "Comer aqui" quando puder: louça lavável no lugar da embalagem.',
  'Peça só o que vai consumir.',
  'Jogue o copo e a tampa no lixo reciclável.',
  'Use o comprovante e os cupons pelo app, sem imprimir.',
];

export default function Ods12Screen() {
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topSection}>
          <View style={styles.curveContainer}>
            <View style={styles.topNav}>
              <TouchableOpacity onPress={voltar} style={styles.navButton}>
                <Ionicons name="chevron-back" size={30} color={cor('#4A3525')} />
              </TouchableOpacity>

              <Image source={logo} style={styles.logo} resizeMode="contain" />

              <View style={styles.navPlaceholder} />
            </View>

            <Text style={styles.screenTitle}>Nossa ODS 12</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroNumeroLinha}>
            <Text style={styles.heroNumero}>12</Text>
            <Ionicons name="infinite" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitulo}>CONSUMO E PRODUÇÃO RESPONSÁVEIS</Text>
          <Text style={styles.heroSubtitulo}>Objetivo de Desenvolvimento Sustentável da ONU · Agenda 2030</Text>
          <View style={styles.heroDivisor} />
          <Text style={styles.heroTexto}>
            A Daily Express segue a ODS 12 em tudo o que faz: do grão de café até a embalagem que chega na sua mão.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>O que é a ODS 12?</Text>
          <View style={styles.cartao}>
            <Text style={styles.paragrafo}>
              É um dos Objetivos de Desenvolvimento Sustentável da ONU. Ela pede que empresas e pessoas produzam e
              consumam de forma responsável: gastar menos recursos naturais, desperdiçar menos comida e gerar menos lixo.
            </Text>
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Nossos compromissos</Text>
          {COMPROMISSOS.map((item) => (
            <View key={item.titulo} style={styles.compromisso}>
              <View style={styles.compromissoIcone}>
                <Ionicons name={item.icone} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.compromissoInfo}>
                <View style={styles.compromissoTopo}>
                  <Text style={styles.compromissoTitulo}>{item.titulo}</Text>
                  <Text style={styles.metaEtiqueta}>Meta {item.meta}</Text>
                </View>
                <Text style={styles.compromissoTexto}>{item.texto}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Metas da ODS 12 que seguimos</Text>
          {METAS.map((item) => (
            <View key={item.numero} style={styles.meta}>
              <Text style={styles.metaNumero}>{item.numero}</Text>
              <Text style={styles.metaTexto}>{item.texto}</Text>
            </View>
          ))}
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Como você pode ajudar</Text>
          <View style={styles.cartao}>
            {DICAS.map((dica) => (
              <View key={dica} style={styles.dica}>
                <Ionicons name="checkmark-circle" size={20} color={COR_ODS12} />
                <Text style={styles.dicaTexto}>{dica}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.rodape}>
          <Ionicons name="infinite" size={20} color={COR_ODS12} />
          <Text style={styles.rodapeTexto}>Daily Express · Empresa comprometida com a ODS 12 da ONU</Text>
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
  navPlaceholder: {
    width: 38,
  },
  screenTitle: {
    fontSize: 26,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  hero: {
    backgroundColor: COR_ODS12,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  heroNumeroLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroNumero: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
  },
  heroTitulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroSubtitulo: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  heroDivisor: {
    height: 2,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: 16,
  },
  heroTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 21,
  },

  secao: {
    marginTop: 26,
    marginHorizontal: 20,
    gap: 10,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A3525',
  },
  cartao: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  paragrafo: {
    fontSize: 14,
    color: '#2A1F17',
    lineHeight: 21,
  },

  compromisso: {
    flexDirection: 'row',
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderLeftWidth: 5,
    borderLeftColor: COR_ODS12,
  },
  compromissoIcone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COR_ODS12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compromissoInfo: {
    flex: 1,
    gap: 4,
  },
  compromissoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  compromissoTitulo: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3B291A',
  },
  metaEtiqueta: {
    fontSize: 11,
    fontWeight: '800',
    color: COR_ODS12,
  },
  compromissoTexto: {
    fontSize: 13,
    color: '#4A3525',
    lineHeight: 18,
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6EBDD',
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  metaNumero: {
    fontSize: 20,
    fontWeight: '900',
    color: COR_ODS12,
    minWidth: 52,
  },
  metaTexto: {
    flex: 1,
    fontSize: 13,
    color: '#2A1F17',
    lineHeight: 18,
  },

  dica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dicaTexto: {
    flex: 1,
    fontSize: 14,
    color: '#2A1F17',
  },

  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 30,
    marginHorizontal: 20,
  },
  rodapeTexto: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3525',
    textAlign: 'center',
  },
});
