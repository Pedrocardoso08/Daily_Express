import { ImageSourcePropType } from 'react-native';

// Logo da cafeteria, pasta imagens/
export const logo = require('../imagens/logo.png');

// Mesmo tamanho em todas as telas
export const estiloLogo = {
  width: 200,
  height: 160,
};

export const banner = require('../imagens/banner.jpg');
export const fotoPerfil = require('../imagens/perfil.jpg');
export const mapa = require('../imagens/mapa.jpg');

const capuccino = require('../imagens/capuccino.jpg');
const croissant = require('../imagens/croissant.jpg');
const cheesecake = require('../imagens/cheesecake.jpg');
const mocha = require('../imagens/mocha.jpg');
const combo = require('../imagens/combo.jpg');
const chocolate = require('../imagens/chocolate.jpg');
const cookie = require('../imagens/cookie.jpg');
const frappe = require('../imagens/frappe.jpg');
const latte = require('../imagens/latte.jpg');

const porNome: Record<string, ImageSourcePropType> = {
  'Capuccino clássico': capuccino,
  'Latte + Cheesecake': latte,
  'Combo Lanche Leve': combo,
  'Mocha Especial': mocha,
  'Combo Choc. Quente': chocolate,
  'Croissant Presunto': croissant,
  'Espresso + Cookie': cookie,
  'Frappuccino Caramelo': frappe,
  Cheesecake: cheesecake,
};

// Foto local do produto. Links de fora (Unsplash, Imgur) não carregam nesta rede.
export function origemImagem(imagem?: string | null, nome?: string) {
  if (nome && porNome[nome]) {
    return porNome[nome];
  }

  if (
    !imagem ||
    imagem.includes('unsplash.com') ||
    imagem.includes('imgur.com') ||
    imagem.includes('randomuser.me')
  ) {
    return capuccino;
  }

  return { uri: imagem };
}
