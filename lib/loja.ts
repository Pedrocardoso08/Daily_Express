// Dados compartilhados entre as telas enquanto o app está aberto.
// Os dados do cliente (pedidos, endereços, favoritos, cartões) vêm do back-end
// (pastas back/ e database/) pelas funções "buscar..." no fim deste arquivo.

import { Platform } from 'react-native';
import { buscar, enviar } from './api';

// P, M e G só para bebidas. U = tamanho único (doces, salgados e promoções).
export type Tamanho = 'P' | 'M' | 'G' | 'U';

// Quantos ml tem cada copo da bebida (o funcionário escolhe no cadastro do produto)
export type MlCopos = { P: number; M: number; G: number };

export type ItemCarrinho = {
  id: string;
  // Só nos itens do histórico (vem do banco), usado para avaliar o produto
  produtoId?: string;
  nome: string;
  desc: string;
  tamanho: Tamanho;
  // ml do copo escolhido. Vazio no tamanho único.
  ml?: number | null;
  opcional: string;
  precoUnitario: number;
  qtd: number;
  imagem: string;
};

export type ProdutoFavorito = {
  nome: string;
  desc: string;
  nota: string;
  preco: string;
  imagem: string;
  categoria?: string;
  ml: MlCopos;
};

export type Endereco = {
  id: string;
  tipo: 'CASA' | 'EMPRESA';
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
};

export type Cartao = {
  id: string;
  nome: string;
  numero: string;
  validade: string;
};

export type Pedido = {
  id: string;
  data: string;
  status: string;
  itens: ItemCarrinho[];
  total: number;
  modo: string;
  endereco: string;
};

export type CategoriaProduto = 'Promoção' | 'Bebidas' | 'Salgados' | 'Doces';

export type ProdutoCatalogo = {
  id: string;
  nome: string;
  desc: string;
  nota: string;
  precoAntigo: string;
  precoNovo: string;
  categoria: CategoriaProduto;
  imagem: string;
  // false = esgotado (só aparece na tela de funcionários)
  disponivel?: boolean;
  ml: MlCopos;
};

export type CupomLoja = {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: 'porcentagem' | 'valor';
  valor: number;
  validade: string;
};

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  logadoEm: string;
  // Caminho da foto no back-end, ex.: "fotos/usuario_1_123.jpg". Vazio = foto padrão.
  foto?: string;
};

// --- PREÇOS ---

// Usado nos produtos e pedidos de antes de o funcionário poder escolher os ml
export const ML_PADRAO: MlCopos = { P: 200, M: 300, G: 400 };

// "300 ml" nas bebidas e "Único" no resto
export function nomeTamanho(tamanho: Tamanho, ml?: number | null) {
  if (tamanho === 'U') {
    return 'Único';
  }
  return (ml ? ml : ML_PADRAO[tamanho]) + ' ml';
}

// Lê os ml_p, ml_m e ml_g que vêm do banco
function lerMl(item: any): MlCopos {
  return {
    P: item.ml_p ? Number(item.ml_p) : ML_PADRAO.P,
    M: item.ml_m ? Number(item.ml_m) : ML_PADRAO.M,
    G: item.ml_g ? Number(item.ml_g) : ML_PADRAO.G,
  };
}

// Quanto cada tamanho soma ao preço cadastrado (o preço do copo pequeno)
const ACRESCIMO_TAMANHO = { P: 0, M: 2, G: 4, U: 0 };

export function precoPorTamanho(precoBase: number, tamanho: Tamanho) {
  return precoBase + ACRESCIMO_TAMANHO[tamanho];
}

// Só bebidas têm tamanho (começa no copo pequeno). O resto é tamanho único.
export function tamanhoInicial(categoria?: string): Tamanho {
  return categoria === 'Bebidas' ? 'P' : 'U';
}

export function paraNumero(preco: string) {
  return Number(preco.replace(',', '.'));
}

export function formatarPreco(valor: number) {
  return 'R$' + valor.toFixed(2).replace('.', ',');
}

// --- CAMPOS NUMÉRICOS ---
// Usadas no onChangeText: o que não for número some assim que é digitado.

// Só os dígitos: "12a3" vira "123"
export function soNumeros(texto: string) {
  return texto.replace(/\D/g, '');
}

// Dígitos e uma vírgula só (o ponto vira vírgula): "12.9a0" vira "12,90"
export function soNumerosComVirgula(texto: string) {
  const partes = texto.replace(/\./g, ',').replace(/[^0-9,]/g, '').split(',');
  if (partes.length === 1) {
    return partes[0];
  }
  return partes[0] + ',' + partes.slice(1).join('');
}

// Só dígitos e coloca as barras sozinho: "1226" vira "12/26" e "31122026" vira "31/12/2026"
export function formatarData(texto: string) {
  const numeros = soNumeros(texto).slice(0, 8);
  if (numeros.length > 4) {
    return numeros.slice(0, 2) + '/' + numeros.slice(2, 4) + '/' + numeros.slice(4);
  }
  if (numeros.length > 2) {
    return numeros.slice(0, 2) + '/' + numeros.slice(2);
  }
  return numeros;
}

// Código da área de funcionários (maiúsculas ou minúsculas tanto faz).
// Vale só no app, enquanto ele estiver aberto.
export const CODIGO_FUNCIONARIO = 'EXPRESSADMIN';

function acharCupom(codigo: string) {
  return loja.cupons.find((item) => item.codigo.toUpperCase() === codigo.trim().toUpperCase());
}

// Retorna o desconto em reais, ou -1 se o cupom não existir
export function calcularDesconto(codigo: string, subtotal: number) {
  const cupom = acharCupom(codigo);
  if (!cupom) {
    return -1;
  }
  const desconto = cupom.tipo === 'porcentagem' ? (subtotal * cupom.valor) / 100 : cupom.valor;
  return Math.min(desconto, subtotal);
}

// Cupom que fala de entrega (ex.: FRETEGRÁTIS) só vale quando o pedido é para levar
export function cupomSoDeEntrega(codigo: string) {
  const cupom = acharCupom(codigo);
  if (!cupom) {
    return false;
  }
  return (cupom.titulo + ' ' + cupom.descricao).toLowerCase().includes('entrega');
}

// --- LOGIN SALVO ---
// No navegador, o usuário fica guardado no localStorage e o login continua
// depois de recarregar a página. No celular (Expo Go) não existe localStorage,
// então lá o login some quando o app fecha.

function temLocalStorage() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage;
}

function lerUsuarioSalvo() {
  if (!temLocalStorage()) {
    return null;
  }
  const texto = window.localStorage.getItem('usuario');
  if (!texto) {
    return null;
  }
  return JSON.parse(texto) as Usuario;
}

// --- DADOS ---

export const loja = {
  // Preenchido no login (vem do back-end)
  usuario: lerUsuarioSalvo(),

  // Liberado na tela de funcionários depois do código
  acessoFuncionario: false,

  // Cardápio e cupons: começam vazios e vêm do banco (cadastrados na Área do funcionário)
  produtos: [] as ProdutoCatalogo[],
  cupons: [] as CupomLoja[],

  // O carrinho fica só na memória do app
  carrinho: [] as ItemCarrinho[],

  // Estes vêm do banco, pelas funções "buscar..." lá embaixo
  favoritos: [] as ProdutoFavorito[],
  cartoes: [] as Cartao[],
  enderecos: [] as Endereco[],
  pedidos: [] as Pedido[],

  // Preenchidos durante a compra
  cupom: '',
  subtotal: 0,
  desconto: 0,
  modo: '',
  enderecoEntrega: '',
};

// Id do usuário logado, usado em todas as rotas do cliente
export function idUsuario() {
  return loja.usuario ? loja.usuario.id : 0;
}

export function salvarUsuario(usuario: Usuario | null) {
  loja.usuario = usuario;

  if (temLocalStorage()) {
    if (usuario) {
      window.localStorage.setItem('usuario', JSON.stringify(usuario));
    } else {
      window.localStorage.removeItem('usuario');
    }
  }
}

// Sai da conta e limpa os dados do usuário que estava logado
export function sair() {
  salvarUsuario(null);
  loja.acessoFuncionario = false;
  loja.carrinho = [];
  loja.favoritos = [];
  loja.cartoes = [];
  loja.enderecos = [];
  loja.pedidos = [];
  loja.cupom = '';
  loja.subtotal = 0;
  loja.desconto = 0;
}

// --- FUNÇÕES DO CARRINHO ---

export function adicionarAoCarrinho(novo: Omit<ItemCarrinho, 'id'>) {
  const existente = loja.carrinho.find(
    (item) => item.nome === novo.nome && item.tamanho === novo.tamanho
  );
  if (existente) {
    existente.qtd += novo.qtd;
  } else {
    loja.carrinho.push({ ...novo, id: String(Date.now()) + loja.carrinho.length });
  }
}

export function estaNoCarrinho(nome: string) {
  return loja.carrinho.some((item) => item.nome === nome);
}

export function removerDoCarrinho(nome: string) {
  loja.carrinho = loja.carrinho.filter((item) => item.nome !== nome);
}

// --- FUNÇÕES DOS FAVORITOS ---

export function ehFavorito(nome: string) {
  return loja.favoritos.some((produto) => produto.nome === nome);
}

// Muda na tela na hora e manda para o banco sem esperar a resposta
export function alternarFavorito(produto: ProdutoFavorito) {
  const favorito = !ehFavorito(produto.nome);

  if (favorito) {
    loja.favoritos.push(produto);
  } else {
    loja.favoritos = loja.favoritos.filter((item) => item.nome !== produto.nome);
  }

  enviar('/favorito', { usuario: idUsuario(), nome: produto.nome, favorito: favorito }).catch(() => {});
}

// --- OUTRAS ---

export function textoEndereco(endereco: Endereco) {
  return `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade}`;
}

export function dataDeHoje() {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${hoje.getFullYear()}`;
}

// 13.9 vira "13,90". Vazio quando não tem preço (ex.: produto sem preço antigo).
function textoPreco(valor: any) {
  if (valor === null || valor === undefined || valor === '') {
    return '';
  }
  return Number(valor).toFixed(2).replace('.', ',');
}

// Média das avaliações: 4.666 vira "4.7". Sem nenhuma avaliação, aparece "Novo".
function textoNota(valor: any) {
  if (valor === null || valor === undefined) {
    return 'Novo';
  }
  return Number(valor).toFixed(1);
}

// --- BUSCAR NO BANCO ---
// Cada função pede a lista ao back-end, guarda no objeto loja e devolve a lista.
// Se o servidor estiver desligado, devolve o que já estava guardado.

// todos = true (tela de funcionários): traz também os produtos esgotados
export function buscarProdutos(todos = false) {
  return buscar(todos ? '/produtos?todos=1' : '/produtos')
    .then((lista) => {
      if (!Array.isArray(lista)) {
        return [...loja.produtos];
      }

      loja.produtos = lista.map((item) => ({
        id: String(item.id),
        nome: item.nome,
        desc: item.descricao_curta,
        nota: textoNota(item.nota),
        precoAntigo: textoPreco(item.preco_antigo),
        precoNovo: textoPreco(item.preco),
        categoria: item.categoria,
        imagem: item.imagem ? item.imagem : '',
        disponivel: item.disponivel !== 0,
        ml: lerMl(item),
      }));

      return [...loja.produtos];
    })
    .catch(() => [...loja.produtos]);
}

// O carrinho usa essa lista para calcular o desconto.
// doCliente = true: só os cupons que o usuário logado ainda pode usar.
// doCliente = false (tela de funcionários): todos os cupons da loja.
export function buscarCupons(doCliente = true) {
  return buscar(doCliente ? '/cupons?usuario=' + idUsuario() : '/cupons')
    .then((lista) => {
      if (!Array.isArray(lista)) {
        return [...loja.cupons];
      }

      loja.cupons = lista.map((item) => ({
        id: String(item.id),
        codigo: item.codigo,
        titulo: item.titulo,
        descricao: item.descricao ? item.descricao : '',
        tipo: item.tipo === 'PORCENTAGEM' ? 'porcentagem' : 'valor',
        valor: Number(item.valor),
        validade: item.validade ? item.validade : '',
      }));

      return [...loja.cupons];
    })
    .catch(() => [...loja.cupons]);
}

export function buscarFavoritos() {
  return buscar('/favoritos?usuario=' + idUsuario())
    .then((lista) => {
      if (!Array.isArray(lista)) {
        return [...loja.favoritos];
      }

      loja.favoritos = lista.map((item) => ({
        nome: item.nome,
        desc: item.descricao_curta,
        nota: textoNota(item.nota),
        preco: textoPreco(item.preco),
        imagem: item.imagem ? item.imagem : '',
        categoria: item.categoria,
        ml: lerMl(item),
      }));

      return [...loja.favoritos];
    })
    .catch(() => [...loja.favoritos]);
}

// O back-end já devolve os pedidos no formato do tipo Pedido
export function buscarPedidos() {
  return buscar('/pedidos?usuario=' + idUsuario())
    .then((lista) => {
      if (Array.isArray(lista)) {
        loja.pedidos = lista;
      }
      return [...loja.pedidos];
    })
    .catch(() => [...loja.pedidos]);
}

export function buscarEnderecos() {
  return buscar('/enderecos?usuario=' + idUsuario())
    .then((lista) => {
      if (!Array.isArray(lista)) {
        return [...loja.enderecos];
      }

      loja.enderecos = lista.map((item) => ({
        id: String(item.id),
        tipo: item.tipo,
        rua: item.rua,
        numero: item.numero,
        bairro: item.bairro,
        cidade: item.cidade,
      }));

      return [...loja.enderecos];
    })
    .catch(() => [...loja.enderecos]);
}

export function buscarCartoes() {
  return buscar('/cartoes?usuario=' + idUsuario())
    .then((lista) => {
      if (!Array.isArray(lista)) {
        return [...loja.cartoes];
      }

      loja.cartoes = lista.map((item) => ({
        id: String(item.id),
        nome: item.nome,
        numero: '**** **** **** ' + item.ultimos_digitos,
        validade: 'Validade ' + item.validade,
      }));

      return [...loja.cartoes];
    })
    .catch(() => [...loja.cartoes]);
}

// Nome, pontos e preferências. Devolve null se o servidor estiver desligado.
export function buscarPerfil() {
  return buscar('/perfil?usuario=' + idUsuario())
    .then((perfil) => (perfil.error ? null : perfil))
    .catch(() => null);
}
