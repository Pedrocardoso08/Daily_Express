// Endereço do back-end (pasta back/, rodando com "npm start").
// No navegador do computador, localhost funciona.
// No celular com Expo Go, troque localhost pelo IP do computador
// (o mesmo que aparece no terminal do Expo, ex.: http://10.10.84.111:3000).
export const API = 'http://localhost:3000';

// Pede uma lista ao back-end. Ex.: buscar('/pedidos?usuario=1')
export function buscar(rota: string) {
  return fetch(API + rota).then((response) => response.json());
}

// Manda dados para o back-end. Ex.: enviar('/endereco', { rua: 'Rua A', ... })
export function enviar(rota: string, dados: any) {
  return fetch(API + rota, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  }).then((response) => response.json());
}
