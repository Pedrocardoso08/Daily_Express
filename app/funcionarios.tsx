import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API } from '../lib/api';
import { estiloLogo, logo, origemImagem } from '../lib/imagens';
import {
  buscarCupons,
  buscarProdutos,
  CategoriaProduto,
  CODIGO_FUNCIONARIO,
  CupomLoja,
  formatarPreco,
  loja,
  ProdutoCatalogo,
} from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

const CATEGORIAS: CategoriaProduto[] = ['Promoção', 'Bebidas', 'Salgados', 'Doces'];

type Aba = 'produtos' | 'cupons';

function voltarPara(router: any) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/menu');
  }
}

function lerNumero(texto: string) {
  const numero = Number(texto.trim().replace(',', '.'));
  if (!Number.isFinite(numero)) {
    return null;
  }
  return numero;
}

function formatarCampoPreco(valor: number) {
  return valor.toFixed(2).replace('.', ',');
}

// No navegador o Alert do React Native não aparece, então lá usamos o confirm
function confirmar(titulo: string, mensagem: string, aoConfirmar: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(mensagem)) {
      aoConfirmar();
    }
    return;
  }

  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Remover', style: 'destructive', onPress: aoConfirmar },
  ]);
}

export default function FuncionariosScreen() {
  useTema();
  const router = useRouter();
  const [liberado, setLiberado] = useState(loja.acessoFuncionario);
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [erroAcesso, setErroAcesso] = useState('');

  const [aba, setAba] = useState<Aba>('produtos');
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([...loja.produtos]);
  const [cupons, setCupons] = useState<CupomLoja[]>([...loja.cupons]);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaProduto>('Bebidas');
  const [preco, setPreco] = useState('');
  const [precoAntigo, setPrecoAntigo] = useState('');
  const [nota, setNota] = useState('');
  const [imagem, setImagem] = useState('');

  const [codigo, setCodigo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricaoCupom, setDescricaoCupom] = useState('');
  const [tipo, setTipo] = useState<'porcentagem' | 'valor'>('porcentagem');
  const [valorCupom, setValorCupom] = useState('');

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!liberado) {
      return;
    }
    buscarProdutos().then((lista) => setProdutos(lista));
    buscarCupons().then((lista) => setCupons(lista));
  }, [liberado]);

  function entrar() {
    if (codigoAcesso.trim().toUpperCase() !== CODIGO_FUNCIONARIO) {
      setErroAcesso('Código incorreto.');
      return;
    }
    loja.acessoFuncionario = true;
    setLiberado(true);
    setErroAcesso('');
  }

  function limparAvisos() {
    setErro('');
    setSucesso('');
  }

  function salvarProduto() {
    limparAvisos();

    if (nome.trim() === '' || descricao.trim() === '' || preco.trim() === '') {
      setErro('Preencha nome, descrição e preço.');
      return;
    }

    const precoNumero = lerNumero(preco);
    if (precoNumero === null || precoNumero <= 0) {
      setErro('Informe um preço maior que zero.');
      return;
    }

    let antigo = '';
    if (precoAntigo.trim() !== '') {
      const antigoNumero = lerNumero(precoAntigo);
      if (antigoNumero === null || antigoNumero <= 0) {
        setErro('O preço anterior precisa ser maior que zero.');
        return;
      }
      antigo = formatarCampoPreco(antigoNumero);
    }

    let notaFinal = '5.0';
    if (nota.trim() !== '') {
      const notaNumero = lerNumero(nota);
      if (notaNumero === null || notaNumero < 0 || notaNumero > 5) {
        setErro('A nota fica entre 0 e 5.');
        return;
      }
      notaFinal = notaNumero.toFixed(1);
    }

    const link = imagem.trim();
    if (link !== '' && !link.startsWith('http')) {
      setErro('O link da imagem precisa começar com http.');
      return;
    }

    setCarregando(true);

    fetch(API + '/produto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria: categoria,
        preco: precoNumero,
        precoAntigo: antigo === '' ? null : lerNumero(antigo),
        nota: Number(notaFinal),
        imagem: link === '' ? null : link,
      }),
    })
      .then((response) => response.json())
      .then((dados) => {
        setCarregando(false);

        if (dados.error) {
          setErro(dados.error);
          return;
        }

        setNome('');
        setDescricao('');
        setPreco('');
        setPrecoAntigo('');
        setNota('');
        setImagem('');
        setSucesso('Produto cadastrado na loja.');
        buscarProdutos().then((lista) => setProdutos(lista));
      })
      .catch(() => {
        setCarregando(false);
        setErro('Não foi possível conectar ao servidor. Confira se o back-end e o MySQL estão ligados.');
      });
  }

  function salvarCupom() {
    limparAvisos();

    if (codigo.trim() === '' || titulo.trim() === '' || valorCupom.trim() === '') {
      setErro('Preencha código, título e valor.');
      return;
    }

    const valor = lerNumero(valorCupom);
    if (valor === null || valor <= 0) {
      setErro('Informe um valor maior que zero.');
      return;
    }
    if (tipo === 'porcentagem' && valor > 100) {
      setErro('A porcentagem não pode passar de 100.');
      return;
    }

    setCarregando(true);

    fetch(API + '/cupom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigo: codigo.trim(),
        titulo: titulo.trim(),
        descricao: descricaoCupom.trim(),
        tipo: tipo,
        valor: valor,
      }),
    })
      .then((response) => response.json())
      .then((dados) => {
        setCarregando(false);

        if (dados.error) {
          setErro(dados.error);
          return;
        }

        setCodigo('');
        setTitulo('');
        setDescricaoCupom('');
        setValorCupom('');
        setSucesso('Cupom cadastrado na loja.');
        buscarCupons().then((lista) => setCupons(lista));
      })
      .catch(() => {
        setCarregando(false);
        setErro('Não foi possível conectar ao servidor. Confira se o back-end e o MySQL estão ligados.');
      });
  }

  function pedirRemocaoProduto(item: ProdutoCatalogo) {
    confirmar('Remover produto', 'Tirar "' + item.nome + '" da loja?', () => {
      fetch(API + '/removerProduto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: item.id }),
      })
        .then((response) => response.json())
        .then((dados) => {
          if (dados.error) {
            setErro(dados.error);
            return;
          }
          limparAvisos();
          buscarProdutos().then((lista) => setProdutos(lista));
        })
        .catch(() => {
          setErro('Não foi possível conectar ao servidor. Confira se o back-end e o MySQL estão ligados.');
        });
    });
  }

  function pedirRemocaoCupom(item: CupomLoja) {
    confirmar('Remover cupom', 'Tirar o cupom ' + item.codigo + ' da loja?', () => {
      fetch(API + '/removerCupom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: item.id }),
      })
        .then((response) => response.json())
        .then((dados) => {
          if (dados.error) {
            setErro(dados.error);
            return;
          }
          limparAvisos();
          buscarCupons().then((lista) => setCupons(lista));
        })
        .catch(() => {
          setErro('Não foi possível conectar ao servidor. Confira se o back-end e o MySQL estão ligados.');
        });
    });
  }

  if (!liberado) {
    return (
      <View style={styles.container}>
        <Cabecalho titulo="Funcionários" onVoltar={() => voltarPara(router)} />
        <View style={styles.acessoBox}>
          <Ionicons name="lock-closed" size={36} color={cor('#4A3525')} style={styles.acessoIcone} />
          <Text style={styles.acessoTitulo}>Área restrita</Text>
          <Text style={styles.acessoTexto}>
            Digite o código de funcionário para cadastrar produtos e cupons.
          </Text>
          <TextInput
            style={[styles.campo, styles.acessoCampo]}
            placeholder="Código"
            placeholderTextColor={cor('#8C837A')}
            value={codigoAcesso}
            onChangeText={setCodigoAcesso}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {erroAcesso !== '' ? <Text style={[styles.erro, styles.erroAcesso]}>{erroAcesso}</Text> : null}
          <TouchableOpacity style={styles.botao} onPress={entrar} activeOpacity={0.85}>
            <Text style={styles.botaoTexto}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Cabecalho titulo="Funcionários" onVoltar={() => voltarPara(router)} />

        <Text style={styles.aviso}>
          O que você cadastrar aqui é gravado no banco e aparece na loja.
        </Text>

        <View style={styles.abas}>
          <TouchableOpacity
            style={[styles.aba, aba === 'produtos' && styles.abaAtiva]}
            onPress={() => {
              setAba('produtos');
              limparAvisos();
            }}
          >
            <Text style={[styles.abaTexto, aba === 'produtos' && styles.abaTextoAtivo]}>Produtos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aba, aba === 'cupons' && styles.abaAtiva]}
            onPress={() => {
              setAba('cupons');
              limparAvisos();
            }}
          >
            <Text style={[styles.abaTexto, aba === 'cupons' && styles.abaTextoAtivo]}>Cupons</Text>
          </TouchableOpacity>
        </View>

        {erro !== '' ? <Text style={styles.erro}>{erro}</Text> : null}
        {sucesso !== '' ? <Text style={styles.sucesso}>{sucesso}</Text> : null}

        {aba === 'produtos' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Novo produto</Text>
            <Campo rotulo="Nome" value={nome} onChangeText={setNome} placeholder="Ex.: Affogato" />
            <Campo
              rotulo="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descrição curta"
              multiline
            />
            <Text style={styles.rotulo}>Categoria</Text>
            <View style={styles.chips}>
              {CATEGORIAS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, categoria === item && styles.chipAtivo]}
                  onPress={() => setCategoria(item)}
                >
                  <Text style={[styles.chipTexto, categoria === item && styles.chipTextoAtivo]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Campo
              rotulo="Preço (R$)"
              value={preco}
              onChangeText={setPreco}
              placeholder="13,90"
              keyboardType="decimal-pad"
            />
            <Campo
              rotulo="Preço anterior (opcional)"
              value={precoAntigo}
              onChangeText={setPrecoAntigo}
              placeholder="18,90"
              keyboardType="decimal-pad"
            />
            <Campo
              rotulo="Nota de 0 a 5 (opcional)"
              value={nota}
              onChangeText={setNota}
              placeholder="4.8"
              keyboardType="decimal-pad"
            />
            <Campo
              rotulo="Link da imagem (opcional)"
              value={imagem}
              onChangeText={setImagem}
              placeholder="https://..."
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.botao, carregando && styles.botaoDesativado]}
              onPress={salvarProduto}
              disabled={carregando}
              activeOpacity={0.85}
            >
              <Text style={styles.botaoTexto}>{carregando ? 'Salvando...' : 'Cadastrar produto'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Novo cupom</Text>
            <Campo
              rotulo="Código"
              value={codigo}
              onChangeText={setCodigo}
              placeholder="CAFE20"
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Campo rotulo="Título" value={titulo} onChangeText={setTitulo} placeholder="20% OFF" />
            <Campo
              rotulo="Descrição (opcional)"
              value={descricaoCupom}
              onChangeText={setDescricaoCupom}
              placeholder="Válido nesta semana"
            />
            <Text style={styles.rotulo}>Tipo de desconto</Text>
            <View style={styles.chips}>
              <TouchableOpacity
                style={[styles.chip, tipo === 'porcentagem' && styles.chipAtivo]}
                onPress={() => setTipo('porcentagem')}
              >
                <Text style={[styles.chipTexto, tipo === 'porcentagem' && styles.chipTextoAtivo]}>
                  Porcentagem
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, tipo === 'valor' && styles.chipAtivo]}
                onPress={() => setTipo('valor')}
              >
                <Text style={[styles.chipTexto, tipo === 'valor' && styles.chipTextoAtivo]}>
                  Valor em R$
                </Text>
              </TouchableOpacity>
            </View>
            <Campo
              rotulo={tipo === 'porcentagem' ? 'Porcentagem' : 'Valor (R$)'}
              value={valorCupom}
              onChangeText={setValorCupom}
              placeholder={tipo === 'porcentagem' ? '10' : '5,00'}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity
              style={[styles.botao, carregando && styles.botaoDesativado]}
              onPress={salvarCupom}
              disabled={carregando}
              activeOpacity={0.85}
            >
              <Text style={styles.botaoTexto}>{carregando ? 'Salvando...' : 'Cadastrar cupom'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.listaTitulo}>
          {aba === 'produtos' ? 'Produtos na loja' : 'Cupons na loja'}
        </Text>

        {aba === 'produtos'
          ? produtos.map((item) => (
              <View key={item.id} style={styles.item}>
                <Image source={origemImagem(item.imagem, item.nome)} style={styles.itemImagem} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  <Text style={styles.itemDetalhe}>
                    {item.categoria} · R${item.precoNovo}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => pedirRemocaoProduto(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={22} color={cor('#4A3525')} />
                </TouchableOpacity>
              </View>
            ))
          : cupons.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.codigo}</Text>
                  <Text style={styles.itemDetalhe}>
                    {item.titulo} ·{' '}
                    {item.tipo === 'porcentagem' ? item.valor + '%' : formatarPreco(item.valor)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => pedirRemocaoCupom(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={22} color={cor('#4A3525')} />
                </TouchableOpacity>
              </View>
            ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Cabecalho({ titulo, onVoltar }: { titulo: string; onVoltar: () => void }) {
  return (
    <View style={styles.curveContainer}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onVoltar} style={styles.navButton}>
          <Ionicons name="chevron-back" size={30} color={cor('#4A3525')} />
        </TouchableOpacity>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.navPlaceholder} />
      </View>
      <Text style={styles.screenTitle}>{titulo}</Text>
    </View>
  );
}

// Caixa de texto com o título em cima. Recebe as mesmas coisas que um TextInput, mais o "rotulo".
function Campo(props: any) {
  return (
    <View style={styles.campoGrupo}>
      <Text style={styles.rotulo}>{props.rotulo}</Text>
      <TextInput
        placeholderTextColor={cor('#8C837A')}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        autoCorrect={props.autoCorrect}
        multiline={props.multiline}
        style={[styles.campo, props.multiline && styles.campoMultilinha]}
      />
    </View>
  );
}

const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#EAD1A8',
  },
  scroll: {
    paddingBottom: 40,
  },
  curveContainer: {
    backgroundColor: '#C9A075',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 45,
    paddingBottom: 25,
    paddingHorizontal: 20,
    marginBottom: 16,
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
  navPlaceholder: {
    width: 38,
  },
  screenTitle: {
    fontSize: 26,
    color: '#4A3525',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  aviso: {
    marginHorizontal: 20,
    marginBottom: 14,
    color: '#4A3525',
    fontSize: 13,
    textAlign: 'center',
  },
  abas: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F6EBDD',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  aba: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  abaAtiva: {
    backgroundColor: '#4A3525',
  },
  abaTexto: {
    color: '#4A3525',
    fontWeight: '600',
  },
  abaTextoAtivo: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 16,
    gap: 10,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B291A',
    marginBottom: 4,
  },
  campoGrupo: {
    gap: 6,
  },
  rotulo: {
    color: '#4A3525',
    fontSize: 13,
    fontWeight: '700',
  },
  campo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4D3C4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#2C1810',
    fontSize: 16,
  },
  campoMultilinha: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: '#4A3525',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipAtivo: {
    backgroundColor: '#4A3525',
  },
  chipTexto: {
    color: '#4A3525',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextoAtivo: {
    color: '#FFFFFF',
  },
  botao: {
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  botaoDesativado: {
    opacity: 0.6,
  },
  erro: {
    color: '#8B2E2E',
    marginHorizontal: 20,
    marginBottom: 8,
    fontWeight: '600',
  },
  sucesso: {
    color: '#2E5A32',
    marginHorizontal: 20,
    marginBottom: 8,
    fontWeight: '600',
  },
  listaTitulo: {
    marginHorizontal: 22,
    marginTop: 22,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B291A',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6EBDD',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    gap: 12,
  },
  itemImagem: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B291A',
  },
  itemDetalhe: {
    fontSize: 13,
    color: '#4A3525',
    marginTop: 2,
  },
  acessoBox: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    padding: 22,
    alignItems: 'stretch',
    gap: 10,
  },
  acessoCampo: {
    width: '100%',
  },
  erroAcesso: {
    marginHorizontal: 0,
    textAlign: 'center',
  },
  acessoIcone: {
    alignSelf: 'center',
  },
  acessoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B291A',
  },
  acessoTexto: {
    fontSize: 14,
    color: '#4A3525',
    textAlign: 'center',
    marginBottom: 6,
  },
});
