// Dados compartilhados entre as telas enquanto o app está aberto.
// Os dados do cliente (pedidos, endereços, favoritos, cartões) vêm do back-end
// (pastas back/ e database/) pelas funções "buscar..." no fim deste arquivo.

import { Platform } from 'react-native';
import { buscar, enviar } from './api';

export type Tamanho = 'P' | 'M' | 'G';

export type ItemCarrinho = {
  id: string;
  nome: string;
  desc: string;
  tamanho: Tamanho;
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

export const NOMES_TAMANHO = { P: 'Pequeno', M: 'Médio', G: 'Grande' };

// Quanto cada tamanho soma ao preço do copo pequeno
const ACRESCIMO_TAMANHO = { P: 0, M: 2, G: 4 };

export function precoPorTamanho(precoBase: number, tamanho: Tamanho) {
  return precoBase + ACRESCIMO_TAMANHO[tamanho];
}

export function paraNumero(preco: string) {
  return Number(preco.replace(',', '.'));
}

export function formatarPreco(valor: number) {
  return 'R$' + valor.toFixed(2).replace('.', ',');
}

// Código da área de funcionários. Vale só no app, enquanto ele estiver aberto.
export const CODIGO_FUNCIONARIO = 'DAILY';

// Retorna o desconto em reais, ou -1 se o cupom não existir
export function calcularDesconto(codigo: string, subtotal: number) {
  const cupom = loja.cupons.find(
    (item) => item.codigo.toUpperCase() === codigo.trim().toUpperCase()
  );
  if (!cupom) {
    return -1;
  }
  const desconto = cupom.tipo === 'porcentagem' ? (subtotal * cupom.valor) / 100 : cupom.valor;
  return Math.min(desconto, subtotal);
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

// Fotos usadas só quando o servidor está desligado
const IMG_CAPUCCINO = 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=400&auto=format&fit=crop';
const IMG_CROISSANT = 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=400&auto=format&fit=crop';
const IMG_CHEESECAKE = 'https://images.unsplash.com/photo-1533134242443-d4fd01530ae1?q=80&w=400&auto=format&fit=crop';
const IMG_MOCHA = 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&auto=format&fit=crop';
const IMG_COMBO = 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=400&auto=format&fit=crop';

export const loja = {
  // Preenchido no login (vem do back-end)
  usuario: lerUsuarioSalvo(),

  // Liberado na tela de funcionários depois do código
  acessoFuncionario: false,

  // Cardápio e cupons de reserva, usados só se o servidor estiver desligado
  produtos: [
    { id: '1', nome: 'Capuccino clássico', desc: 'Leite vaporizado e expresso cremoso', nota: '4.9', precoAntigo: '18,90', precoNovo: '13,90', categoria: 'Promoção', imagem: IMG_CAPUCCINO },
    { id: '2', nome: 'Latte + Cheesecake', desc: 'Latte suave com fatia de frutas vermelhas', nota: '4.7', precoAntigo: '35,80', precoNovo: '28,90', categoria: 'Promoção', imagem: IMG_CHEESECAKE },
    { id: '3', nome: 'Combo Lanche Leve', desc: 'Sanduíche natural e chá gelado de pêssego', nota: '4.6', precoAntigo: '30,80', precoNovo: '25,90', categoria: 'Promoção', imagem: IMG_COMBO },
    { id: '4', nome: 'Mocha Especial', desc: 'Leite vaporizado, calda de chocolate belga', nota: '4.7', precoAntigo: '15,90', precoNovo: '12,90', categoria: 'Promoção', imagem: IMG_MOCHA },
    { id: '5', nome: 'Combo Choc. Quente', desc: 'Chocolate quente cremoso e biscoitos', nota: '4.9', precoAntigo: '35,80', precoNovo: '29,90', categoria: 'Promoção', imagem: '' },
    { id: '6', nome: 'Croissant Presunto', desc: 'Massa folhada recheada com queijo derretido', nota: '4.8', precoAntigo: '17,90', precoNovo: '14,90', categoria: 'Promoção', imagem: IMG_CROISSANT },
    { id: '7', nome: 'Espresso + Cookie', desc: 'Espresso duplo e cookie com gotas de cacau', nota: '4.8', precoAntigo: '22,00', precoNovo: '16,50', categoria: 'Promoção', imagem: '' },
    { id: '8', nome: 'Frappuccino Caramelo', desc: 'Café batido gelado com chantilly e calda', nota: '4.9', precoAntigo: '24,90', precoNovo: '19,90', categoria: 'Promoção', imagem: '' },
  ] as ProdutoCatalogo[],

  cupons: [
    { id: '1', codigo: 'CAFE10', titulo: '10% OFF', descricao: 'Desconto de 10% em qualquer pedido', tipo: 'porcentagem', valor: 10, validade: '31/12/2026' },
    { id: '2', codigo: 'FRETEGRÁTIS', titulo: 'Entrega grátis', descricao: 'R$ 5,00 de desconto na entrega', tipo: 'valor', valor: 5, validade: '31/12/2026' },
    { id: '3', codigo: 'ANIVERSÁRIO', titulo: 'Sobremesa grátis', descricao: 'Uma sobremesa grátis (R$ 11,90) no mês do seu aniversário', tipo: 'valor', valor: 11.9, validade: '31/12/2026' },
  ] as CupomLoja[],

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

// --- BUSCAR NO BANCO ---
// Cada função pede a lista ao back-end, guarda no objeto loja e devolve a lista.
// Se o servidor estiver desligado, devolve o que já estava guardado.

export function buscarProdutos() {
  return buscar('/produtos')
    .then((lista) => {
      if (!Array.isArray(lista)) {
        return [...loja.produtos];
      }

      loja.produtos = lista.map((item) => ({
        id: String(item.id),
        nome: item.nome,
        desc: item.descricao_curta,
        nota: Number(item.nota).toFixed(1),
        precoAntigo: textoPreco(item.preco_antigo),
        precoNovo: textoPreco(item.preco),
        categoria: item.categoria,
        imagem: item.imagem ? item.imagem : '',
      }));

      return [...loja.produtos];
    })
    .catch(() => [...loja.produtos]);
}

// O carrinho usa essa lista para calcular o desconto
export function buscarCupons() {
  return buscar('/cupons')
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
        nota: Number(item.nota).toFixed(1),
        preco: textoPreco(item.preco),
        imagem: item.imagem ? item.imagem : '',
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
