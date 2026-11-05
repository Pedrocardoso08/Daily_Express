import React, { useEffect, useRef, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { buscar, enviar } from '../lib/api';
import { estiloLogo, logo, origemImagem } from '../lib/imagens';
import {
  buscarCupons,
  buscarProdutos,
  CategoriaProduto,
  CODIGO_FUNCIONARIO,
  CupomLoja,
  dataDeHoje,
  formatarData,
  formatarPreco,
  loja,
  ProdutoCatalogo,
  soNumeros,
  soNumerosComVirgula,
} from '../lib/loja';
import { cor, criarEstilos, useTema } from '../lib/tema';

const CATEGORIAS: CategoriaProduto[] = ['Promoção', 'Bebidas', 'Salgados', 'Doces'];

type Aba = 'pedidos' | 'produtos' | 'cupons' | 'avisos' | 'premios';

const ABAS: { id: Aba; titulo: string }[] = [
  { id: 'pedidos', titulo: 'Pedidos' },
  { id: 'produtos', titulo: 'Produtos' },
  { id: 'cupons', titulo: 'Cupons' },
  { id: 'avisos', titulo: 'Avisos' },
  { id: 'premios', titulo: 'Prêmios' },
];

// Os passos do pedido em andamento. O cliente vê o mesmo texto no histórico.
// Depois disso o pedido é fechado com o botão Finalizar. Cancelar é só o cliente, no histórico.
const STATUS_PEDIDO = ['Preparando', 'A caminho'];
const FILTROS_PEDIDO = ['Todos', 'Preparando', 'A caminho', 'Finalizado', 'Cancelado'];

// Ícones que dá para escolher no aviso (nomes do Ionicons)
const ICONES_AVISO = ['notifications', 'gift', 'cafe', 'time', 'megaphone', 'star'];

const ERRO_SERVIDOR = 'Não foi possível conectar ao servidor. Confira se o back-end e o MySQL estão ligados.';

// Pedido como vem da rota /pedidosLoja (os itens já vêm num texto só)
type PedidoLoja = {
  id: string;
  data: string;
  hora: string;
  status: string;
  modo: string;
  endereco: string;
  pagamento: string;
  total: number;
  cliente: string;
  itens: string;
};

type Aviso = { id: number; titulo: string; descricao: string; icone: any };

type Recompensa = { id: number; nome: string; pontos: number };

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
  const scrollRef = useRef<ScrollView>(null);
  const [liberado, setLiberado] = useState(loja.acessoFuncionario);
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [erroAcesso, setErroAcesso] = useState('');

  const [aba, setAba] = useState<Aba>('pedidos');
  // Toda vez que esse número muda, as listas são lidas de novo do banco
  const [recarregar, setRecarregar] = useState(0);

  const [pedidos, setPedidos] = useState<PedidoLoja[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([...loja.produtos]);
  const [cupons, setCupons] = useState<CupomLoja[]>([...loja.cupons]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);

  // Formulário de produto. editandoId vazio = produto novo.
  const [editandoId, setEditandoId] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaProduto>('Bebidas');
  const [preco, setPreco] = useState('');
  const [precoAntigo, setPrecoAntigo] = useState('');
  // Link (http...) ou caminho da imagem enviada da galeria (fotos/produto_...jpg)
  const [imagem, setImagem] = useState('');
  // ml dos copos pequeno, médio e grande (só bebidas)
  const [mlP, setMlP] = useState('');
  const [mlM, setMlM] = useState('');
  const [mlG, setMlG] = useState('');

  // Formulário de cupom
  const [codigo, setCodigo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricaoCupom, setDescricaoCupom] = useState('');
  const [tipo, setTipo] = useState<'porcentagem' | 'valor'>('porcentagem');
  const [valorCupom, setValorCupom] = useState('');
  const [validade, setValidade] = useState('');

  // Formulário de aviso
  const [tituloAviso, setTituloAviso] = useState('');
  const [descricaoAviso, setDescricaoAviso] = useState('');
  const [iconeAviso, setIconeAviso] = useState('notifications');

  // Formulário de prêmio
  const [nomePremio, setNomePremio] = useState('');
  const [pontosPremio, setPontosPremio] = useState('');

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!liberado) {
      return;
    }
    buscarProdutos(true).then((lista) => setProdutos(lista));
    buscarCupons(false).then((lista) => setCupons(lista));
    buscar('/pedidosLoja')
      .then((lista) => {
        if (Array.isArray(lista)) {
          setPedidos(lista);
        }
      })
      .catch(() => {});
    // usuario=0 é só para a rota funcionar sem cliente logado
    buscar('/notificacoes?usuario=0')
      .then((lista) => {
        if (Array.isArray(lista)) {
          setAvisos(lista);
        }
      })
      .catch(() => {});
    buscar('/recompensas')
      .then((lista) => {
        if (Array.isArray(lista)) {
          setRecompensas(lista);
        }
      })
      .catch(() => {});
  }, [liberado, recarregar]);

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

  function trocarAba(nova: Aba) {
    setAba(nova);
    limparAvisos();
  }

  // Manda os dados para o back-end, mostra a resposta e lê as listas de novo.
  // aoDarCerto roda só se o back-end não devolver erro (ex.: limpar o formulário).
  function mandar(rota: string, dados: any, aoDarCerto?: () => void) {
    limparAvisos();
    setCarregando(true);

    enviar(rota, dados)
      .then((resposta) => {
        setCarregando(false);

        if (resposta.error) {
          setErro(resposta.error);
          return;
        }

        setSucesso(resposta.message);
        if (aoDarCerto) {
          aoDarCerto();
        }
        setRecarregar(recarregar + 1);
      })
      .catch(() => {
        setCarregando(false);
        setErro(ERRO_SERVIDOR);
      });
  }

  // ---------- PEDIDOS ----------

  function mudarStatus(pedido: PedidoLoja, status: string) {
    mandar('/statusPedido', { id: pedido.id, status: status });
  }

  // ---------- PRODUTOS ----------

  function limparProduto() {
    setEditandoId('');
    setNome('');
    setDescricao('');
    setCategoria('Bebidas');
    setPreco('');
    setPrecoAntigo('');
    setImagem('');
    setMlP('');
    setMlM('');
    setMlG('');
  }

  // Abre a galeria (no navegador, a janela de escolher arquivo) e manda a imagem para o back-end
  function escolherImagem() {
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

      // No celular a imagem vem em "base64"; no navegador ela já vem dentro do "uri"
      const arquivo = resultado.assets[0].base64 ? resultado.assets[0].base64 : resultado.assets[0].uri;

      limparAvisos();
      setCarregando(true);

      enviar('/fotoProduto', { imagem: arquivo })
        .then((resposta) => {
          setCarregando(false);
          if (resposta.error) {
            setErro(resposta.error);
            return;
          }
          setImagem(resposta.foto);
          setSucesso('Imagem enviada! Agora é só salvar o produto.');
        })
        .catch(() => {
          setCarregando(false);
          setErro(ERRO_SERVIDOR);
        });
    });
  }

  // Coloca os dados do produto no formulário e sobe a tela até ele
  function editarProduto(item: ProdutoCatalogo) {
    limparAvisos();
    setEditandoId(item.id);
    setNome(item.nome);
    setDescricao(item.desc);
    setCategoria(item.categoria);
    setPreco(item.precoNovo);
    setPrecoAntigo(item.precoAntigo);
    setImagem(item.imagem);
    setMlP(String(item.ml.P));
    setMlM(String(item.ml.M));
    setMlG(String(item.ml.G));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
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
      if (antigoNumero <= precoNumero) {
        setErro('O preço anterior precisa ser maior que o preço atual.');
        return;
      }
      antigo = formatarCampoPreco(antigoNumero);
    }

    const link = imagem.trim();
    if (link !== '' && !link.startsWith('http') && !link.startsWith('fotos/')) {
      setErro('O link da imagem precisa começar com http.');
      return;
    }

    const ehBebida = categoria === 'Bebidas';
    const copoP = Number(mlP);
    const copoM = Number(mlM);
    const copoG = Number(mlG);
    if (ehBebida) {
      if (copoP <= 0 || copoM <= 0 || copoG <= 0) {
        setErro('Preencha os ml dos três copos.');
        return;
      }
      if (!(copoP < copoM && copoM < copoG)) {
        setErro('Os ml precisam crescer: pequeno < médio < grande.');
        return;
      }
    }

    mandar(
      '/produto',
      {
        id: editandoId === '' ? null : editandoId,
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria: categoria,
        preco: precoNumero,
        precoAntigo: antigo === '' ? null : lerNumero(antigo),
        imagem: link === '' ? null : link,
        mlP: ehBebida ? copoP : null,
        mlM: ehBebida ? copoM : null,
        mlG: ehBebida ? copoG : null,
      },
      limparProduto
    );
  }

  function mudarDisponivel(item: ProdutoCatalogo) {
    mandar('/disponivel', { id: item.id, disponivel: item.disponivel === false });
  }

  function pedirRemocaoProduto(item: ProdutoCatalogo) {
    confirmar('Remover produto', 'Tirar "' + item.nome + '" da loja?', () => {
      mandar('/removerProduto', { id: item.id });
    });
  }

  // ---------- CUPONS ----------

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

    // Digitada como 31/12/2026, vai para o banco como 2026-12-31
    let dataBanco = '';
    if (validade.trim() !== '') {
      const partes = validade.trim().split('/');
      if (partes.length !== 3 || partes[0].length !== 2 || partes[1].length !== 2 || partes[2].length !== 4) {
        setErro('Digite a validade assim: 31/12/2026.');
        return;
      }
      dataBanco = partes[2] + '-' + partes[1] + '-' + partes[0];
    }

    mandar(
      '/cupom',
      {
        codigo: codigo.trim(),
        titulo: titulo.trim(),
        descricao: descricaoCupom.trim(),
        tipo: tipo,
        valor: valor,
        validade: dataBanco === '' ? null : dataBanco,
      },
      () => {
        setCodigo('');
        setTitulo('');
        setDescricaoCupom('');
        setValorCupom('');
        setValidade('');
      }
    );
  }

  function pedirRemocaoCupom(item: CupomLoja) {
    confirmar('Remover cupom', 'Tirar o cupom ' + item.codigo + ' da loja?', () => {
      mandar('/removerCupom', { id: item.id });
    });
  }

  // ---------- AVISOS ----------

  function salvarAviso() {
    limparAvisos();

    if (tituloAviso.trim() === '' || descricaoAviso.trim() === '') {
      setErro('Preencha título e mensagem.');
      return;
    }

    mandar(
      '/notificacao',
      { titulo: tituloAviso.trim(), descricao: descricaoAviso.trim(), icone: iconeAviso },
      () => {
        setTituloAviso('');
        setDescricaoAviso('');
        setIconeAviso('notifications');
      }
    );
  }

  function pedirRemocaoAviso(item: Aviso) {
    confirmar('Remover aviso', 'Tirar o aviso "' + item.titulo + '"?', () => {
      mandar('/removerNotificacao', { id: item.id });
    });
  }

  // ---------- PRÊMIOS ----------

  function salvarPremio() {
    limparAvisos();

    const pontos = Number(pontosPremio.trim());
    if (nomePremio.trim() === '' || pontosPremio.trim() === '') {
      setErro('Preencha o nome e os pontos.');
      return;
    }
    if (!Number.isInteger(pontos) || pontos <= 0) {
      setErro('Os pontos precisam ser um número inteiro maior que zero.');
      return;
    }

    mandar('/recompensa', { nome: nomePremio.trim(), pontos: pontos }, () => {
      setNomePremio('');
      setPontosPremio('');
    });
  }

  function pedirRemocaoPremio(item: Recompensa) {
    confirmar('Remover prêmio', 'Tirar o prêmio "' + item.nome + '"?', () => {
      mandar('/removerRecompensa', { id: item.id });
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
            Digite o código de funcionário para cuidar dos pedidos, produtos, cupons, avisos e prêmios.
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

  // Resumo do dia: conta os pedidos com a data de hoje (os cancelados não entram)
  const hoje = dataDeHoje();
  let pedidosHoje = 0;
  let vendidoHoje = 0;
  let emPreparo = 0;
  pedidos.forEach((pedido) => {
    if (pedido.data === hoje && pedido.status !== 'Cancelado') {
      pedidosHoje = pedidosHoje + 1;
      vendidoHoje = vendidoHoje + pedido.total;
    }
    if (pedido.status === 'Preparando') {
      emPreparo = emPreparo + 1;
    }
  });

  // Cancelados saem da lista e só aparecem no filtro Cancelado
  const pedidosFiltrados = pedidos.filter((pedido) =>
    filtroStatus === 'Todos' ? pedido.status !== 'Cancelado' : pedido.status === filtroStatus
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Cabecalho titulo="Funcionários" onVoltar={() => voltarPara(router)} />

        <Text style={styles.aviso}>
          O que você cadastrar aqui é gravado no banco e aparece na loja.
        </Text>

        <View style={styles.resumo}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNumero}>{pedidosHoje}</Text>
            <Text style={styles.resumoTexto}>pedidos hoje</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNumero}>{formatarPreco(vendidoHoje)}</Text>
            <Text style={styles.resumoTexto}>vendido hoje</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNumero}>{emPreparo}</Text>
            <Text style={styles.resumoTexto}>em preparo</Text>
          </View>
        </View>

        <View style={styles.abas}>
          {ABAS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.aba, aba === item.id && styles.abaAtiva]}
              onPress={() => trocarAba(item.id)}
            >
              <Text style={[styles.abaTexto, aba === item.id && styles.abaTextoAtivo]}>{item.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {erro !== '' ? <Text style={styles.erro}>{erro}</Text> : null}
        {sucesso !== '' ? <Text style={styles.sucesso}>{sucesso}</Text> : null}

        {/* ---------- ABA PEDIDOS ---------- */}
        {aba === 'pedidos' ? (
          <View>
            <View style={[styles.chips, styles.filtros]}>
              {FILTROS_PEDIDO.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, filtroStatus === item && styles.chipAtivo]}
                  onPress={() => setFiltroStatus(item)}
                >
                  <Text style={[styles.chipTexto, filtroStatus === item && styles.chipTextoAtivo]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.atualizar} onPress={() => setRecarregar(recarregar + 1)}>
              <Ionicons name="refresh" size={18} color={cor('#4A3525')} />
              <Text style={styles.atualizarTexto}>Atualizar lista</Text>
            </TouchableOpacity>

            {pedidosFiltrados.length === 0 ? <Text style={styles.vazio}>Nenhum pedido por aqui.</Text> : null}

            {pedidosFiltrados.map((pedido) => (
              <View key={pedido.id} style={styles.pedido}>
                <Text style={styles.itemNome}>
                  Pedido #{pedido.id} · {pedido.cliente}
                </Text>
                <Text style={styles.itemDetalhe}>
                  {pedido.data} às {pedido.hora} · {pedido.modo} · {pedido.pagamento}
                </Text>
                <Text style={styles.pedidoItens}>{pedido.itens}</Text>
                {pedido.endereco !== '' ? (
                  <Text style={styles.itemDetalhe}>Entrega: {pedido.endereco}</Text>
                ) : null}
                <Text style={styles.pedidoTotal}>Total: {formatarPreco(pedido.total)}</Text>

                {/* Pedido fechado: só mostra como terminou */}
                {pedido.status === 'Finalizado' ? (
                  <Text style={styles.pedidoFinalizado}>Pedido finalizado</Text>
                ) : null}
                {pedido.status === 'Cancelado' ? (
                  <Text style={styles.pedidoCancelado}>
                    Pedido cancelado · {formatarPreco(pedido.total * 0.7)} (70%) devolvido ao cliente
                  </Text>
                ) : null}

                {/* Pedido em andamento: passos e botão para finalizar */}
                {pedido.status !== 'Finalizado' && pedido.status !== 'Cancelado' ? (
                  <View style={styles.pedidoAcoes}>
                    <View style={styles.chips}>
                      {STATUS_PEDIDO.map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[styles.chip, pedido.status === status && styles.chipAtivo]}
                          onPress={() => mudarStatus(pedido, status)}
                          disabled={carregando}
                        >
                          <Text style={[styles.chipTexto, pedido.status === status && styles.chipTextoAtivo]}>
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.botao}
                      onPress={() => mudarStatus(pedido, 'Finalizado')}
                      disabled={carregando}
                    >
                      <Text style={styles.botaoTexto}>Finalizar pedido</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ---------- ABA PRODUTOS ---------- */}
        {aba === 'produtos' ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>{editandoId === '' ? 'Novo produto' : 'Editar produto'}</Text>
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
                onChangeText={(texto: string) => setPreco(soNumerosComVirgula(texto))}
                placeholder="13,90"
                keyboardType="decimal-pad"
              />
              <Campo
                rotulo="Preço anterior (opcional)"
                value={precoAntigo}
                onChangeText={(texto: string) => setPrecoAntigo(soNumerosComVirgula(texto))}
                placeholder="18,90"
                keyboardType="decimal-pad"
              />
              {categoria === 'Bebidas' ? (
                <View>
                  <Text style={styles.rotulo}>Tamanho dos copos (ml)</Text>
                  <Text style={styles.legendaCampo}>
                    O preço acima é o do copo pequeno. O médio custa +R$2,00 e o grande +R$4,00.
                  </Text>
                  <View style={styles.linhaCampos}>
                    <View style={styles.campoTerco}>
                      <Campo
                        rotulo="Pequeno"
                        value={mlP}
                        onChangeText={(texto: string) => setMlP(soNumeros(texto))}
                        placeholder="200"
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.campoTerco}>
                      <Campo
                        rotulo="Médio"
                        value={mlM}
                        onChangeText={(texto: string) => setMlM(soNumeros(texto))}
                        placeholder="300"
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.campoTerco}>
                      <Campo
                        rotulo="Grande"
                        value={mlG}
                        onChangeText={(texto: string) => setMlG(soNumeros(texto))}
                        placeholder="400"
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                </View>
              ) : null}
              <Text style={styles.rotulo}>Imagem (opcional)</Text>
              <View style={styles.imagemLinha}>
                {imagem !== '' ? (
                  <Image source={origemImagem(imagem, nome)} style={styles.imagemPrevia} />
                ) : (
                  <View style={[styles.imagemPrevia, styles.imagemVazia]}>
                    <Ionicons name="image-outline" size={26} color={cor('#4A3525')} />
                  </View>
                )}
                <View style={styles.imagemBotoes}>
                  <TouchableOpacity style={styles.botaoSecundario} onPress={escolherImagem} disabled={carregando}>
                    <Text style={styles.botaoSecundarioTexto}>Escolher da galeria</Text>
                  </TouchableOpacity>
                  {imagem !== '' ? (
                    <TouchableOpacity onPress={() => setImagem('')}>
                      <Text style={styles.tirarImagem}>Tirar imagem</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              <Campo
                rotulo="Ou cole o link de uma imagem"
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
                <Text style={styles.botaoTexto}>
                  {carregando ? 'Salvando...' : editandoId === '' ? 'Cadastrar produto' : 'Salvar alterações'}
                </Text>
              </TouchableOpacity>
              {editandoId !== '' ? (
                <TouchableOpacity
                  style={styles.botaoSecundario}
                  onPress={() => {
                    limparProduto();
                    limparAvisos();
                  }}
                >
                  <Text style={styles.botaoSecundarioTexto}>Cancelar edição</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.listaTitulo}>Produtos na loja</Text>
            {produtos.map((item) => (
              <View key={item.id} style={[styles.item, item.disponivel === false && styles.itemEsgotado]}>
                <Image source={origemImagem(item.imagem, item.nome)} style={styles.itemImagem} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  <Text style={styles.itemDetalhe}>
                    {item.categoria} · R${item.precoNovo}
                    {item.categoria === 'Bebidas' ? ' · ' + item.ml.P + '/' + item.ml.M + '/' + item.ml.G + ' ml' : ''}
                    {item.disponivel === false ? ' · Esgotado' : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => editarProduto(item)} hitSlop={8}>
                  <Ionicons name="create-outline" size={22} color={cor('#4A3525')} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => mudarDisponivel(item)} hitSlop={8} disabled={carregando}>
                  <Ionicons
                    name={item.disponivel === false ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color={cor('#4A3525')}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => pedirRemocaoProduto(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={22} color={cor('#4A3525')} />
                </TouchableOpacity>
              </View>
            ))}
            <Text style={styles.legenda}>
              Lápis: editar · Olho: esgotar ou voltar ao cardápio · Lixeira: remover
            </Text>
          </View>
        ) : null}

        {/* ---------- ABA CUPONS ---------- */}
        {aba === 'cupons' ? (
          <View>
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
                onChangeText={(texto: string) => setValorCupom(soNumerosComVirgula(texto))}
                placeholder={tipo === 'porcentagem' ? '10' : '5,00'}
                keyboardType="decimal-pad"
              />
              <Campo
                rotulo="Validade (opcional)"
                value={validade}
                onChangeText={(texto: string) => setValidade(formatarData(texto))}
                placeholder="31/12/2026"
                keyboardType="number-pad"
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

            <Text style={styles.listaTitulo}>Cupons na loja</Text>
            {cupons.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.codigo}</Text>
                  <Text style={styles.itemDetalhe}>
                    {item.titulo} ·{' '}
                    {item.tipo === 'porcentagem' ? item.valor + '%' : formatarPreco(item.valor)}
                    {item.validade !== '' ? ' · até ' + item.validade : ' · sem prazo'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => pedirRemocaoCupom(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={22} color={cor('#4A3525')} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {/* ---------- ABA AVISOS ---------- */}
        {aba === 'avisos' ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Novo aviso</Text>
              <Text style={styles.itemDetalhe}>Aparece na aba Notificações de todos os clientes.</Text>
              <Campo
                rotulo="Título"
                value={tituloAviso}
                onChangeText={setTituloAviso}
                placeholder="Combo da tarde"
              />
              <Campo
                rotulo="Mensagem"
                value={descricaoAviso}
                onChangeText={setDescricaoAviso}
                placeholder="Café + pão de queijo por R$ 9,90 até as 18h"
                multiline
              />
              <Text style={styles.rotulo}>Ícone</Text>
              <View style={styles.chips}>
                {ICONES_AVISO.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, iconeAviso === item && styles.chipAtivo]}
                    onPress={() => setIconeAviso(item)}
                  >
                    <Ionicons
                      name={item as any}
                      size={20}
                      color={iconeAviso === item ? '#FFFFFF' : cor('#4A3525')}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.botao, carregando && styles.botaoDesativado]}
                onPress={salvarAviso}
                disabled={carregando}
                activeOpacity={0.85}
              >
                <Text style={styles.botaoTexto}>{carregando ? 'Enviando...' : 'Enviar aviso'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.listaTitulo}>Avisos enviados</Text>
            {avisos.length === 0 ? <Text style={styles.vazio}>Nenhum aviso ainda.</Text> : null}
            {avisos.map((item) => (
              <View key={item.id} style={styles.item}>
                <Ionicons name={item.icone} size={26} color={cor('#4A3525')} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.titulo}</Text>
                  <Text style={styles.itemDetalhe}>{item.descricao}</Text>
                </View>
                <TouchableOpacity onPress={() => pedirRemocaoAviso(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={22} color={cor('#4A3525')} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {/* ---------- ABA PRÊMIOS ---------- */}
        {aba === 'premios' ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Novo prêmio</Text>
              <Text style={styles.itemDetalhe}>Aparece na tela Fidelidade. Cada R$1,00 gasto vale 10 pontos.</Text>
              <Campo
                rotulo="Nome"
                value={nomePremio}
                onChangeText={setNomePremio}
                placeholder="Café expresso"
              />
              <Campo
                rotulo="Pontos"
                value={pontosPremio}
                onChangeText={(texto: string) => setPontosPremio(soNumeros(texto))}
                placeholder="500"
                keyboardType="number-pad"
              />
              <TouchableOpacity
                style={[styles.botao, carregando && styles.botaoDesativado]}
                onPress={salvarPremio}
                disabled={carregando}
                activeOpacity={0.85}
              >
                <Text style={styles.botaoTexto}>{carregando ? 'Salvando...' : 'Cadastrar prêmio'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.listaTitulo}>Prêmios da fidelidade</Text>
            {recompensas.length === 0 ? <Text style={styles.vazio}>Nenhum prêmio ainda.</Text> : null}
            {recompensas.map((item) => (
              <View key={item.id} style={styles.item}>
                <Ionicons name="gift" size={26} color={cor('#4A3525')} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={styles.itemDetalhe}>{item.pontos} pontos</Text>
                </View>
                <TouchableOpacity onPress={() => pedirRemocaoPremio(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={22} color={cor('#4A3525')} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}
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
  resumo: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  resumoItem: {
    flex: 1,
    backgroundColor: '#F6EBDD',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resumoNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B291A',
  },
  resumoTexto: {
    fontSize: 12,
    color: '#4A3525',
    marginTop: 2,
  },
  abas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    backgroundColor: '#F6EBDD',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    marginBottom: 12,
  },
  aba: {
    flexGrow: 1,
    minWidth: '30%',
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
  linhaCampos: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  campoTerco: {
    flex: 1,
  },
  legendaCampo: {
    fontSize: 12,
    color: '#4A3525',
    marginTop: 4,
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
  filtros: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  atualizar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  atualizarTexto: {
    color: '#4A3525',
    fontWeight: '600',
  },
  vazio: {
    marginHorizontal: 22,
    color: '#4A3525',
    fontSize: 14,
  },
  pedido: {
    backgroundColor: '#F6EBDD',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    gap: 6,
  },
  pedidoItens: {
    fontSize: 14,
    color: '#2C1810',
  },
  pedidoTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B291A',
  },
  pedidoAcoes: {
    gap: 6,
  },
  pedidoFinalizado: {
    color: '#2E5A32',
    fontWeight: '700',
  },
  pedidoCancelado: {
    color: '#8B2E2E',
    fontWeight: '700',
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
  botaoSecundario: {
    borderWidth: 1.5,
    borderColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoSecundarioTexto: {
    color: '#4A3525',
    fontSize: 15,
    fontWeight: '700',
  },
  imagemLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imagemPrevia: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  imagemVazia: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4D3C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagemBotoes: {
    flex: 1,
    gap: 8,
  },
  tirarImagem: {
    color: '#8B2E2E',
    fontWeight: '600',
    textAlign: 'center',
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
  legenda: {
    marginHorizontal: 22,
    marginTop: 4,
    fontSize: 12,
    color: '#4A3525',
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
  itemEsgotado: {
    opacity: 0.55,
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
