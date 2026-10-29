// Dados compartilhados entre as telas enquanto o app está aberto.
// Produtos e cupons também são lidos do back-end (pastas back/ e database/).

import { API } from './api';

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

// --- DADOS ---

const IMG_CAPUCCINO = 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=400&auto=format&fit=crop';
const IMG_CROISSANT = 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=400&auto=format&fit=crop';
const IMG_CHEESECAKE = 'https://images.unsplash.com/photo-1533134242443-d4fd01530ae1?q=80&w=400&auto=format&fit=crop';
const IMG_MOCHA = 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&auto=format&fit=crop';
const IMG_COMBO = 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=400&auto=format&fit=crop';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  logadoEm: string;
};

export const loja = {
  // Preenchido no login (vem do back-end)
  usuario: null as Usuario | null,

  // Liberado na tela de funcionários depois do código
  acessoFuncionario: false,

  produtos: [
    {
      id: '1',
      nome: 'Capuccino clássico',
      desc: 'Leite vaporizado e expresso cremoso',
      nota: '4.9',
      precoAntigo: '18,90',
      precoNovo: '13,90',
      categoria: 'Promoção',
      imagem: IMG_CAPUCCINO,
    },
    {
      id: '2',
      nome: 'Latte + Cheesecake',
      desc: 'Latte suave com fatia de frutas vermelhas',
      nota: '4.7',
      precoAntigo: '35,80',
      precoNovo: '28,90',
      categoria: 'Promoção',
      imagem: IMG_CHEESECAKE,
    },
    {
      id: '3',
      nome: 'Combo Lanche Leve',
      desc: 'Sanduíche natural e chá gelado de pêssego',
      nota: '4.6',
      precoAntigo: '30,80',
      precoNovo: '25,90',
      categoria: 'Promoção',
      imagem: IMG_COMBO,
    },
    {
      id: '4',
      nome: 'Mocha Especial',
      desc: 'Leite vaporizado, calda de chocolate belga',
      nota: '4.7',
      precoAntigo: '15,90',
      precoNovo: '12,90',
      categoria: 'Promoção',
      imagem: IMG_MOCHA,
    },
    {
      id: '5',
      nome: 'Combo Choc. Quente',
      desc: 'Chocolate quente cremoso e biscoitos',
      nota: '4.9',
      precoAntigo: '35,80',
      precoNovo: '29,90',
      categoria: 'Promoção',
      imagem: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: '6',
      nome: 'Croissant Presunto',
      desc: 'Massa folhada recheada com queijo derretido',
      nota: '4.8',
      precoAntigo: '17,90',
      precoNovo: '14,90',
      categoria: 'Promoção',
      imagem: IMG_CROISSANT,
    },
    {
      id: '7',
      nome: 'Espresso + Cookie',
      desc: 'Espresso duplo e cookie com gotas de cacau',
      nota: '4.8',
      precoAntigo: '22,00',
      precoNovo: '16,50',
      categoria: 'Promoção',
      imagem: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: '8',
      nome: 'Frappuccino Caramelo',
      desc: 'Café batido gelado com chantilly e calda',
      nota: '4.9',
      precoAntigo: '24,90',
      precoNovo: '19,90',
      categoria: 'Promoção',
      imagem: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=400&auto=format&fit=crop',
    },
  ] as ProdutoCatalogo[],

  cupons: [
    { id: '1', codigo: 'CAFE10', titulo: '10% OFF', descricao: 'Valido até dia **/**/**', tipo: 'porcentagem', valor: 10 },
    { id: '2', codigo: 'FRETEGRÁTIS', titulo: 'Entrega grátis', descricao: 'Pedido acima de R$**,**', tipo: 'valor', valor: 5 },
    { id: '3', codigo: 'ANIVERSÁRIO', titulo: 'Sobremesa grátis', descricao: 'Válido até dia **/**/**', tipo: 'valor', valor: 11.9 },
  ] as CupomLoja[],

  carrinho: [] as ItemCarrinho[],
  favoritos: [] as ProdutoFavorito[],

  cartoes: [
    { id: '1', nome: 'Visa final 4821', numero: '**** **** **** 4821', validade: 'Validade 08/30' },
    { id: '2', nome: 'Mastercard final 9927', numero: '**** **** **** 9927', validade: 'Validade 11/29' },
    { id: '3', nome: 'Alimentação final 5371', numero: '**** **** **** 5371', validade: 'Validade 01/27' },
  ] as Cartao[],

  enderecos: [
    { id: '1', tipo: 'CASA', rua: 'Rua Exemplo', numero: '100', bairro: 'Centro', cidade: 'Criciúma - SC' },
    { id: '2', tipo: 'EMPRESA', rua: 'Rua Exemplo', numero: '200', bairro: 'Centro', cidade: 'Criciúma - SC' },
  ] as Endereco[],

  pedidos: [
    {
      id: '3',
      data: '01/10/2026',
      status: 'Entregue',
      modo: 'Levar',
      endereco: 'Rua Exemplo, 100 - Centro, Criciúma - SC',
      total: 28.8,
      itens: [
        { id: 'a1', nome: 'Capuccino clássico', desc: 'Leite vaporizado e expresso cremoso', tamanho: 'P', opcional: 'Sem açúcar', precoUnitario: 13.9, qtd: 1, imagem: IMG_CAPUCCINO },
        { id: 'a2', nome: 'Croissant Presunto', desc: 'Massa folhada recheada com queijo derretido', tamanho: 'P', opcional: '---', precoUnitario: 14.9, qtd: 1, imagem: IMG_CROISSANT },
      ],
    },
    {
      id: '2',
      data: '24/09/2026',
      status: 'Entregue',
      modo: 'Comer aqui',
      endereco: '',
      total: 25.8,
      itens: [
        { id: 'b1', nome: 'Capuccino clássico', desc: 'Leite vaporizado e expresso cremoso', tamanho: 'P', opcional: 'Sem açúcar', precoUnitario: 13.9, qtd: 1, imagem: IMG_CAPUCCINO },
        { id: 'b2', nome: 'Cheesecake', desc: 'Sobremesa gelada clássica', tamanho: 'P', opcional: '---', precoUnitario: 11.9, qtd: 1, imagem: IMG_CHEESECAKE },
      ],
    },
    {
      id: '1',
      data: '15/09/2026',
      status: 'Entregue',
      modo: 'Levar',
      endereco: 'Rua Exemplo, 200 - Centro, Criciúma - SC',
      total: 38.8,
      itens: [
        { id: 'c1', nome: 'Mocha Especial', desc: 'Leite vaporizado, calda de chocolate belga', tamanho: 'P', opcional: '---', precoUnitario: 12.9, qtd: 1, imagem: IMG_MOCHA },
        { id: 'c2', nome: 'Combo Lanche Leve', desc: 'Sanduíche natural e chá gelado de pêssego', tamanho: 'P', opcional: '---', precoUnitario: 25.9, qtd: 1, imagem: IMG_COMBO },
      ],
    },
  ] as Pedido[],

  idioma: 'pt' as 'pt' | 'en' | 'es',
  volume: 70,

  // Preenchidos durante a compra
  cupom: '',
  subtotal: 0,
  desconto: 0,
  modo: '',
  enderecoEntrega: '',
};

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

export function alternarFavorito(produto: ProdutoFavorito) {
  if (ehFavorito(produto.nome)) {
    loja.favoritos = loja.favoritos.filter((item) => item.nome !== produto.nome);
  } else {
    loja.favoritos.push(produto);
  }
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

export function cadastrarProduto(dados: Omit<ProdutoCatalogo, 'id'>) {
  loja.produtos.unshift({ ...dados, id: String(Date.now()) });
}

export function removerProduto(id: string) {
  loja.produtos = loja.produtos.filter((produto) => produto.id !== id);
}

export function cadastrarCupom(dados: Omit<CupomLoja, 'id'>) {
  const codigo = dados.codigo.trim().toUpperCase();
  const repetido = loja.cupons.some((cupom) => cupom.codigo.toUpperCase() === codigo);
  if (repetido) {
    return false;
  }
  loja.cupons.unshift({ ...dados, codigo, id: String(Date.now()) });
  return true;
}

export function removerCupom(id: string) {
  const cupom = loja.cupons.find((item) => item.id === id);
  loja.cupons = loja.cupons.filter((item) => item.id !== id);
  if (cupom && loja.cupom.toUpperCase() === cupom.codigo.toUpperCase()) {
    loja.cupom = '';
    loja.desconto = 0;
  }
}

function textoPreco(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') {
    return '';
  }
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    return '';
  }
  return numero.toFixed(2).replace('.', ',');
}

// Lê o cardápio do banco. Se o servidor estiver desligado, fica a lista que já estava na tela.
export function buscarProdutos() {
  return fetch(API + '/produtos')
    .then((response) => response.json())
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
        imagem: item.imagem
          ? item.imagem
          : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop',
      }));

      return [...loja.produtos];
    })
    .catch(() => [...loja.produtos]);
}

// Lê os cupons do banco. O carrinho usa essa lista para calcular o desconto.
export function buscarCupons() {
  return fetch(API + '/cupons')
    .then((response) => response.json())
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
      }));

      return [...loja.cupons];
    })
    .catch(() => [...loja.cupons]);
}
