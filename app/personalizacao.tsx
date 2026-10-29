import React, { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { enviar } from '../lib/api';
import { estiloLogo, fotoDoUsuario, logo } from '../lib/imagens';
import { buscarPerfil, idUsuario, loja, salvarUsuario } from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

export default function PersonalizacaoScreen() {
  useTema();
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/perfil');
    }
  }

  const [nomeUsuario, setNomeUsuario] = useState(loja.usuario ? loja.usuario.nome : '');
  const [tipoLeite, setTipoLeite] = useState('Integral');
  const [acucar, setAcucar] = useState('2 colheres');
  const [receberPromocoes, setReceberPromocoes] = useState('Não');
  const [aviso, setAviso] = useState('');
  const [foto, setFoto] = useState(fotoDoUsuario());

  // Lê o nome, a foto e as preferências do banco quando a tela abre
  useEffect(() => {
    buscarPerfil().then((perfil) => {
      if (!perfil) {
        return;
      }
      setNomeUsuario(perfil.nome);
      if (loja.usuario && perfil.foto) {
        salvarUsuario({ ...loja.usuario, foto: perfil.foto });
        setFoto(fotoDoUsuario());
      }
      // Sem a linha de preferências no banco, fica tudo no padrão
      if (perfil.tipo_leite !== null) {
        setTipoLeite(perfil.tipo_leite);
        setAcucar(perfil.acucar);
        setReceberPromocoes(perfil.receber_promocoes ? 'Sim' : 'Não');
      }
    });
  }, []);

  // Abre a galeria (no navegador, a janela de escolher arquivo) e manda a foto para o back-end
  function trocarFoto() {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    }).then((resultado) => {
      if (resultado.canceled) {
        return;
      }

      // No celular a foto vem em "base64"; no navegador ela já vem dentro do "uri"
      const imagem = resultado.assets[0].base64 ? resultado.assets[0].base64 : resultado.assets[0].uri;
      setAviso('Enviando foto...');

      enviar('/foto', { usuario: idUsuario(), imagem: imagem })
        .then((dados) => {
          if (dados.error) {
            setAviso(dados.error);
            return;
          }
          // Sem "foto" na resposta, o back-end está com o código antigo
          if (!dados.foto) {
            setAviso('O back-end não conhece a rota da foto. Reinicie o back-end (Ctrl+C e npm start).');
            return;
          }
          if (loja.usuario) {
            salvarUsuario({ ...loja.usuario, foto: dados.foto });
          }
          setFoto(fotoDoUsuario());
          setAviso('Foto trocada!');
        })
        .catch(() => {
          setAviso('Não foi possível enviar a foto.');
        });
    });
  }

  function salvar() {
    if (nomeUsuario.trim() === '') {
      setAviso('Digite o seu nome.');
      return;
    }

    enviar('/preferencias', {
      usuario: idUsuario(),
      nome: nomeUsuario.trim(),
      preferencias: {
        tipo_leite: tipoLeite,
        acucar: acucar,
        receber_promocoes: receberPromocoes === 'Sim',
      },
    })
      .then((dados) => {
        if (dados.error) {
          setAviso(dados.error);
          return;
        }

        // Atualiza o nome que aparece no perfil
        if (loja.usuario) {
          salvarUsuario({ ...loja.usuario, nome: nomeUsuario.trim() });
        }
        setAviso('Salvo!');
      })
      .catch(() => {
        setAviso('Não foi possível conectar ao servidor.');
      });
  }

  const opcoesLeiteCol1 = ['Normal', 'Integral', 'Desnatado'];
  const opcoesLeiteCol2 = ['Sem lactose', 'Vegetal', 'Vegano'];

  const opcoesAcucarCol1 = ['1 colher', '2 colheres', '3 colheres'];
  const opcoesAcucarCol2 = ['Sem açucar', 'Adoçante', 'Eu coloco'];

  const renderRadioItem = (item: string, selecionado: boolean, aoPressionar: () => void) => (
    <TouchableOpacity
      key={item}
      style={styles.radioRow}
      onPress={aoPressionar}
      activeOpacity={0.7}
    >
      <View style={[styles.radioCircle, selecionado && styles.radioCircleAtivo]}>
        {selecionado ? (
          <View style={styles.radioInnerEmpty} />
        ) : (
          <View style={styles.radioDot} />
        )}
      </View>
      <Text style={styles.radioText}>{item}</Text>
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

          <Text style={styles.screenTitle}>Personalização</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topCardsRow}>
          <View style={[styles.cardBase, styles.nameCard]}>
            <Text style={styles.cardHeaderTitle}>Nome de usuário</Text>
            <View style={styles.inputUnderlineWrapper}>
              <TextInput
                style={styles.nameInput}
                value={nomeUsuario}
                onChangeText={setNomeUsuario}
              />
              <Ionicons name="pencil" size={14} color={cor('#4A3525')} style={styles.pencilIcon} />
            </View>
          </View>

          <TouchableOpacity style={[styles.cardBase, styles.photoCard]} activeOpacity={0.8} onPress={trocarFoto}>
            <View style={styles.photoContainer}>
              <Image
                source={foto}
                style={styles.photoImage}
              />
            </View>
            <Text style={styles.changePhotoText}>Trocar foto</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.cardBase, styles.optionsCard]}>
          <Text style={styles.cardHeaderTitle}>Tipo de leite</Text>
          <View style={styles.columnsContainer}>
            <View style={styles.column}>
              {opcoesLeiteCol1.map((opcao) =>
                renderRadioItem(opcao, tipoLeite === opcao, () => setTipoLeite(opcao))
              )}
            </View>
            <View style={styles.column}>
              {opcoesLeiteCol2.map((opcao) =>
                renderRadioItem(opcao, tipoLeite === opcao, () => setTipoLeite(opcao))
              )}
            </View>
          </View>
        </View>

        <View style={[styles.cardBase, styles.optionsCard]}>
          <Text style={styles.cardHeaderTitle}>Açucar</Text>
          <View style={styles.columnsContainer}>
            <View style={styles.column}>
              {opcoesAcucarCol1.map((opcao) =>
                renderRadioItem(opcao, acucar === opcao, () => setAcucar(opcao))
              )}
            </View>
            <View style={styles.column}>
              {opcoesAcucarCol2.map((opcao) =>
                renderRadioItem(opcao, acucar === opcao, () => setAcucar(opcao))
              )}
            </View>
          </View>
        </View>

        <View style={[styles.cardBase, styles.optionsCard]}>
          <Text style={styles.cardHeaderTitle}>Receber Promoções</Text>
          <View style={styles.promoList}>
            {['Sim', 'Não'].map((opcao) =>
              renderRadioItem(opcao, receberPromocoes === opcao, () => setReceberPromocoes(opcao))
            )}
          </View>
        </View>

        {aviso !== '' && <Text style={styles.aviso}>{aviso}</Text>}

        <TouchableOpacity style={styles.saveButton} onPress={salvar} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
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

  cardBase: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  topCardsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  nameCard: {
    flex: 1.1,
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  photoCard: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  inputUnderlineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#4A3525',
    paddingBottom: 2,
    marginTop: 10,
  },
  nameInput: {
    flex: 1,
    fontSize: 13,
    color: '#3B291A',
    paddingVertical: 2,
  },
  pencilIcon: {
    marginLeft: 4,
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },

  optionsCard: {
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    gap: 12,
  },
  promoList: {
    gap: 12,
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A3525',
  },
  radioCircleAtivo: {
    borderWidth: 2,
    borderColor: '#4A3525',
    backgroundColor: '#F6EBDD',
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4A3525',
  },
  radioInnerEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A3525',
  },
  radioText: {
    fontSize: 13,
    color: '#3B291A',
    fontWeight: '500',
  },

  aviso: {
    fontSize: 13,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
