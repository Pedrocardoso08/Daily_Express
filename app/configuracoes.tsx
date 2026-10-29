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
import { estiloLogo, logo } from '../lib/imagens';
import { enviar } from '../lib/api';
import { buscarPerfil, idUsuario } from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

type Idioma = 'pt' | 'en' | 'es';

const IDIOMAS: { id: Idioma; nome: string }[] = [
  { id: 'pt', nome: 'Português - Brasil' },
  { id: 'en', nome: 'English' },
  { id: 'es', nome: 'Español' },
];

const TEXTOS = {
  pt: { titulo: 'Configurações', localizacao: 'Ativar localização', notificacoes: 'Ativar notificações', sons: 'Sons' },
  en: { titulo: 'Settings', localizacao: 'Enable location', notificacoes: 'Enable notifications', sons: 'Sounds' },
  es: { titulo: 'Configuración', localizacao: 'Activar ubicación', notificacoes: 'Activar notificaciones', sons: 'Sonidos' },
};

export default function ConfiguracoesScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/perfil');
    }
  }

  const [localizacaoAtiva, setLocalizacaoAtiva] = useState(true);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [volume, setVolume] = useState(70);
  const [larguraBarra, setLarguraBarra] = useState(0);

  const [idioma, setIdioma] = useState<Idioma>('pt');
  const [listaIdiomasAberta, setListaIdiomasAberta] = useState(false);
  const textos = TEXTOS[idioma];

  // Lê as configurações salvas no banco quando a tela abre
  useEffect(() => {
    buscarPerfil().then((perfil) => {
      // Sem a linha de preferências no banco, fica tudo no padrão
      if (!perfil || perfil.idioma === null) {
        return;
      }
      setLocalizacaoAtiva(perfil.localizacao_ativa == 1);
      setNotificacoesAtivas(perfil.notificacoes_ativas == 1);
      setVolume(perfil.volume);
      setIdioma(perfil.idioma);
    });
  }, []);

  // Salva no banco só o que mudou, ex.: salvar({ idioma: 'en' })
  function salvar(preferencias: any) {
    enviar('/preferencias', { usuario: idUsuario(), preferencias: preferencias }).catch(() => {});
  }

  function mudarVolume(novoVolume: number) {
    const valor = Math.round(Math.max(0, Math.min(100, novoVolume)));
    setVolume(valor);
    return valor;
  }

  const diminuirVolume = () => salvar({ volume: mudarVolume(volume - 10) });
  const aumentarVolume = () => salvar({ volume: mudarVolume(volume + 10) });

  function alternarLocalizacao() {
    setLocalizacaoAtiva(!localizacaoAtiva);
    salvar({ localizacao_ativa: !localizacaoAtiva });
  }

  function alternarNotificacoes() {
    setNotificacoesAtivas(!notificacoesAtivas);
    salvar({ notificacoes_ativas: !notificacoesAtivas });
  }

  // Converte a posição do dedo na barra em porcentagem
  function tocarNaBarra(posicaoX: number) {
    if (larguraBarra > 0) {
      mudarVolume((posicaoX / larguraBarra) * 100);
    }
  }

  function escolherIdioma(novoIdioma: Idioma) {
    setIdioma(novoIdioma);
    setListaIdiomasAberta(false);
    salvar({ idioma: novoIdioma });
  }

  const nomeIdioma = IDIOMAS.find((item) => item.id === idioma)?.nome;

  const renderSwitch = (ativo: boolean, onToggle: () => void) => (
    <TouchableOpacity
      style={styles.switchContainer}
      onPress={onToggle}
      activeOpacity={0.85}
    >
      {ativo ? (
        <>
          <View style={styles.switchThumbActive}>
            <Ionicons name="checkmark" size={16} color={cor('#3B291A')} />
          </View>
          <Ionicons name="close" size={16} color={cor('#EAD1A8')} style={styles.switchIconRight} />
        </>
      ) : (
        <>
          <Ionicons name="checkmark" size={16} color={cor('#EAD1A8')} style={styles.switchIconLeft} />
          <View style={styles.switchThumbInactive}>
            <Ionicons name="close" size={16} color={cor('#FFFFFF')} />
          </View>
        </>
      )}
    </TouchableOpacity>
  );

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

          <Text style={styles.screenTitle}>{textos.titulo}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.languageSelector}
            activeOpacity={0.8}
            onPress={() => setListaIdiomasAberta(!listaIdiomasAberta)}
          >
            <Ionicons
              name={listaIdiomasAberta ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={cor('#3B291A')}
            />
            <View style={styles.languageTextGroup}>
              <Ionicons name="globe-outline" size={18} color={cor('#8C837A')} />
              <Text style={styles.languageText}>{nomeIdioma}</Text>
            </View>
          </TouchableOpacity>

          {listaIdiomasAberta && (
            <View style={styles.languageList}>
              {IDIOMAS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.languageOption}
                  onPress={() => escolherIdioma(item.id)}
                >
                  <Text style={styles.languageOptionText}>{item.nome}</Text>
                  {item.id === idioma && <Ionicons name="checkmark" size={18} color={cor('#4A3525')} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color={cor('#3B291A')} />
            <Text style={styles.cardLabel}>{textos.localizacao}</Text>
          </View>

          <View style={styles.switchRow}>
            {renderSwitch(localizacaoAtiva, alternarLocalizacao)}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications-outline" size={20} color={cor('#3B291A')} />
            <Text style={styles.cardLabel}>{textos.notificacoes}</Text>
          </View>

          <View style={styles.switchRow}>
            {renderSwitch(notificacoesAtivas, alternarNotificacoes)}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="volume-medium-outline" size={22} color={cor('#3B291A')} />
            <Text style={styles.cardLabel}>{textos.sons} ({volume}%)</Text>
          </View>

          <View style={styles.sliderContainer}>
            <TouchableOpacity onPress={diminuirVolume} style={styles.sliderStepBtn}>
              <Ionicons name="remove" size={18} color={cor('#3B291A')} />
            </TouchableOpacity>

            {/* Área de toque maior que a linha, para dar para arrastar com o dedo */}
            <View
              style={styles.sliderTouchArea}
              onLayout={(e) => setLarguraBarra(e.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => tocarNaBarra(e.nativeEvent.locationX)}
              onResponderMove={(e) => tocarNaBarra(e.nativeEvent.locationX)}
              onResponderRelease={() => salvar({ volume: volume })}
            >
              <View style={styles.sliderTrack} pointerEvents="none">
                <View style={[styles.sliderFill, { width: `${volume}%` }]} />
                <View style={[styles.sliderThumb, { left: `${volume}%` }]} />
              </View>
            </View>

            <TouchableOpacity onPress={aumentarVolume} style={styles.sliderStepBtn}>
              <Ionicons name="add" size={18} color={cor('#3B291A')} />
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
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

  card: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  languageSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  languageTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageText: {
    fontSize: 14,
    color: '#8C837A',
    fontWeight: '500',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  switchRow: {
    alignItems: 'center',
  },
  switchContainer: {
    width: 86,
    height: 38,
    backgroundColor: '#4A3525',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    justifyContent: 'space-between',
  },
  switchThumbActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#C9A075',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchThumbInactive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7A6250',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchIconLeft: {
    marginLeft: 8,
  },
  switchIconRight: {
    marginRight: 8,
  },

  sliderContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  sliderStepBtn: {
    padding: 4,
  },
  sliderTouchArea: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7B199',
    justifyContent: 'center',
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A1A1A',
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    marginLeft: -8,
  },

  languageList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 8,
    paddingVertical: 4,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  languageOptionText: {
    fontSize: 14,
    color: '#3B291A',
    fontWeight: '500',
  },
});
