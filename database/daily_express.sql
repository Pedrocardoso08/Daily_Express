-- =====================================================
-- BANCO DE DADOS DO APP DAILY COFFEE (MySQL)
-- Rodar o arquivo inteiro no MySQL Workbench ou no phpMyAdmin (XAMPP).
-- ATENÇÃO: se o banco daily_express já existir, ele é apagado e criado de novo.
-- Para só atualizar um banco que já existe, use atualizacao_exclusao_logica.sql.
--
-- EXCLUSÃO LÓGICA: nenhum dado é apagado com DELETE. Quando algo é removido
-- no app, a coluna ativo vira FALSE e o registro só deixa de aparecer.
-- =====================================================

DROP DATABASE IF EXISTS daily_express;

CREATE DATABASE daily_express CHARACTER SET utf8mb4;

USE daily_express;


-- =====================================================
-- USUÁRIOS
-- Telas: cadastro, login, perfil, fidelidade
-- A senha é guardada criptografada com bcrypt (por isso varchar 255).
-- =====================================================
CREATE TABLE usuarios(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    foto VARCHAR(255),
    data_nascimento DATE,
    pontos_fidelidade INT DEFAULT 0,
    ultimo_login DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- RECUPERAÇÃO DE SENHA
-- Telas: esqueciSenha (cria o código), novaSenha (usa o código)
-- =====================================================
CREATE TABLE recuperacao_senha(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    expira_em DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =====================================================
-- CATEGORIAS
-- Tela: menu (botões Promoção, Bebidas, Salgados, Doces)
-- =====================================================
CREATE TABLE categorias(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    icone VARCHAR(50) NOT NULL
);

-- =====================================================
-- PRODUTOS
-- Telas: menu (lista e busca), produto (detalhe)
-- preco = preço atual do copo pequeno, preco_antigo = preço riscado
-- =====================================================
CREATE TABLE produtos(
    id INT PRIMARY KEY AUTO_INCREMENT,
    categoria_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao_curta VARCHAR(150) NOT NULL,
    descricao_completa TEXT,
    preco DECIMAL(10,2) NOT NULL,
    preco_antigo DECIMAL(10,2),
    nota DECIMAL(2,1) DEFAULT 0,
    imagem VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- =====================================================
-- TAMANHOS
-- Tela: produto (o preço sobe conforme o tamanho)
-- =====================================================
CREATE TABLE tamanhos(
    sigla CHAR(1) PRIMARY KEY,
    nome VARCHAR(20) NOT NULL,
    acrescimo DECIMAL(10,2) NOT NULL
);

-- =====================================================
-- FAVORITOS
-- Telas: coração do menu e do produto, aba de favoritos
-- =====================================================
CREATE TABLE favoritos(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- =====================================================
-- CARRINHO
-- Telas: botão do carrinho no menu e no produto, "Pedir Novamente"
-- do histórico, carrinho (quantidade, lixeira)
-- =====================================================
CREATE TABLE carrinho_itens(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    tamanho CHAR(1) DEFAULT 'P',
    opcional VARCHAR(50) DEFAULT '---',
    quantidade INT DEFAULT 1,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (tamanho) REFERENCES tamanhos(sigla)
);

-- =====================================================
-- ENDEREÇOS
-- Telas: endereco (lista, adiciona, apaga), entrega ("Endereços salvos"
-- e endereço novo digitado na compra)
-- tipo: CASA ou EMPRESA
-- =====================================================
CREATE TABLE enderecos(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    rua VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =====================================================
-- CARTÕES
-- Tela: cartoes (lista, adiciona, apaga)
-- Nunca guardar o número completo nem o CVV, só os 4 últimos dígitos.
-- =====================================================
CREATE TABLE cartoes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nome VARCHAR(50) NOT NULL,
    ultimos_digitos CHAR(4) NOT NULL,
    validade CHAR(5) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =====================================================
-- CUPONS
-- Telas: cupons (lista), carrinho (botão Aplicar)
-- tipo: PORCENTAGEM (valor = %) ou VALOR (valor = reais)
-- =====================================================
CREATE TABLE cupons(
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    tipo VARCHAR(15) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    validade DATE,
    ativo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- CUPONS DE CADA USUÁRIO
-- Telas: cupons (quais o usuário tem), pagamento (marca como usado)
-- =====================================================
CREATE TABLE usuario_cupons(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    cupom_id INT NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (cupom_id) REFERENCES cupons(id)
);

-- =====================================================
-- PEDIDOS
-- Telas: carrinho (modo), entrega (endereço), pagamento (cria o pedido),
-- historicoPedidos (lista)
-- modo: Comer aqui ou Levar
-- O endereço e o cupom ficam em texto para o histórico não mudar
-- se o endereço for apagado depois.
-- =====================================================
CREATE TABLE pedidos(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    modo VARCHAR(15) NOT NULL,
    endereco_entrega VARCHAR(255),
    forma_pagamento VARCHAR(30) NOT NULL,
    cupom VARCHAR(30),
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Preparando',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =====================================================
-- ITENS DE CADA PEDIDO
-- Telas: pagamento (copia do carrinho), historicoPedidos (mostra e
-- "Pedir Novamente")
-- O preço fica salvo como era no dia da compra.
-- =====================================================
CREATE TABLE pedido_itens(
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    tamanho CHAR(1) DEFAULT 'P',
    opcional VARCHAR(50) DEFAULT '---',
    quantidade INT DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (tamanho) REFERENCES tamanhos(sigla)
);

-- =====================================================
-- RECOMPENSAS
-- Tela: fidelidade
-- =====================================================
CREATE TABLE recompensas(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    pontos INT NOT NULL
);

-- =====================================================
-- NOTIFICAÇÕES
-- Tela: notificacoes
-- =====================================================
CREATE TABLE notificacoes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    icone VARCHAR(50) NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICAÇÕES DE CADA USUÁRIO (lida ou não)
-- Tela: notificacoes ("Marcar tudo como lido")
-- =====================================================
CREATE TABLE usuario_notificacoes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    notificacao_id INT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (notificacao_id) REFERENCES notificacoes(id)
);

-- =====================================================
-- PREFERÊNCIAS
-- Telas: personalizacao (leite, açúcar, promoções),
-- configuracoes (localização, notificações, idioma, som)
-- idioma: pt, en ou es | volume: 0 a 100
-- =====================================================
CREATE TABLE preferencias(
    usuario_id INT PRIMARY KEY,
    tipo_leite VARCHAR(30) DEFAULT 'Integral',
    acucar VARCHAR(30) DEFAULT '2 colheres',
    receber_promocoes BOOLEAN DEFAULT FALSE,
    notificacoes_ativas BOOLEAN DEFAULT TRUE,
    localizacao_ativa BOOLEAN DEFAULT TRUE,
    modo_escuro BOOLEAN DEFAULT FALSE,
    idioma VARCHAR(2) DEFAULT 'pt',
    volume INT DEFAULT 70,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);


-- =====================================================
-- DADOS INICIAIS (os mesmos que aparecem hoje no app)
-- =====================================================

INSERT INTO categorias (id, nome, icone) VALUES
    (1, 'Promoção', 'gift'),
    (2, 'Bebidas', 'cafe'),
    (3, 'Salgados', 'fast-food'),
    (4, 'Doces', 'ice-cream');

INSERT INTO produtos (id, categoria_id, nome, descricao_curta, descricao_completa, preco, preco_antigo, nota, imagem) VALUES
    (1, 1, 'Capuccino clássico', 'Leite vaporizado e expresso cremoso',
     'O cappuccino clássico italiano é uma bebida equilibrada, famosa por sua textura aveludada. Na receita tradicional, ele tem 1/3 de café expresso, 1/3 de leite vaporizado e 1/3 de espuma de leite.',
     13.90, 18.90, 4.9, 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=400&auto=format&fit=crop'),
    (2, 1, 'Latte + Cheesecake', 'Latte suave com fatia de frutas vermelhas', NULL,
     28.90, 35.80, 4.7, 'https://images.unsplash.com/photo-1533134242443-d4fd01530ae1?q=80&w=400&auto=format&fit=crop'),
    (3, 1, 'Combo Lanche Leve', 'Sanduíche natural e chá gelado de pêssego', NULL,
     25.90, 30.80, 4.6, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=400&auto=format&fit=crop'),
    (4, 1, 'Mocha Especial', 'Leite vaporizado, calda de chocolate belga', NULL,
     12.90, 15.90, 4.7, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&auto=format&fit=crop'),
    (5, 1, 'Combo Choc. Quente', 'Chocolate quente cremoso e biscoitos', NULL,
     29.90, 35.80, 4.9, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=400&auto=format&fit=crop'),
    (6, 1, 'Croissant Presunto', 'Massa folhada recheada com queijo derretido', NULL,
     14.90, 17.90, 4.8, 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=400&auto=format&fit=crop'),
    (7, 1, 'Espresso + Cookie', 'Espresso duplo e cookie com gotas de cacau', NULL,
     16.50, 22.00, 4.8, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop'),
    (8, 1, 'Frappuccino Caramelo', 'Café batido gelado com chantilly e calda', NULL,
     19.90, 24.90, 4.9, 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=400&auto=format&fit=crop'),
    (9, 4, 'Cheesecake', 'Sobremesa gelada clássica', NULL,
     11.90, NULL, 4.8, 'https://images.unsplash.com/photo-1533134242443-d4fd01530ae1?q=80&w=400&auto=format&fit=crop');

INSERT INTO tamanhos (sigla, nome, acrescimo) VALUES
    ('P', 'Pequeno', 0.00),
    ('M', 'Médio', 2.00),
    ('G', 'Grande', 4.00);

INSERT INTO cupons (id, codigo, titulo, descricao, tipo, valor, validade) VALUES
    (1, 'CAFE10', '10% OFF', 'Desconto de 10% em qualquer pedido', 'PORCENTAGEM', 10.00, '2026-12-31'),
    (2, 'FRETEGRÁTIS', 'Entrega grátis', 'R$ 5,00 de desconto na entrega', 'VALOR', 5.00, '2026-12-31'),
    (3, 'ANIVERSÁRIO', 'Sobremesa grátis', 'Uma sobremesa grátis (R$ 11,90) no mês do seu aniversário', 'VALOR', 11.90, '2026-12-31');

INSERT INTO recompensas (id, nome, pontos) VALUES
    (1, 'Café expresso', 500),
    (2, 'Fatia de bolo', 500),
    (3, 'Combo café + croissant', 1000);

INSERT INTO notificacoes (id, titulo, descricao, icone) VALUES
    (1, 'Temos um novo café!', 'Venha experimentar nosso novo café, feito com grãos selecionados e de maneira sustentável!', 'cafe'),
    (2, 'Confira a semana de promoções!', 'Aproveite para vir tomar café na Daily Express na semana de promoções.', 'gift'),
    (3, 'Aproveite o dia do cliente!', 'Aproveite o dia do cliente e economize comendo mais do que gosta.', 'gift'),
    (4, 'Você ganhou cupons!', 'Feliz Aniversário! Você ganhou cupons de promoção!', 'pricetag');

-- Usuário de teste: e-mail fulano@email.com e senha 123456
-- (a senha abaixo é o 123456 criptografado com bcrypt, igual ao back-end de referência faz)
INSERT INTO usuarios (id, nome, email, senha, data_nascimento, pontos_fidelidade) VALUES
    (1, 'Fulano de tal', 'fulano@email.com', '$2b$12$CozHNJB.Q9KcH4JFgz7Imu53uWjiWznSYQP9aKijmR7Y9A4O4Jhly', '2008-10-08', 320);

INSERT INTO preferencias (usuario_id) VALUES
    (1);

INSERT INTO enderecos (id, usuario_id, tipo, rua, numero, bairro, cidade) VALUES
    (1, 1, 'CASA', 'Rua Exemplo', '100', 'Centro', 'Criciúma - SC'),
    (2, 1, 'EMPRESA', 'Rua Exemplo', '200', 'Centro', 'Criciúma - SC');

INSERT INTO cartoes (id, usuario_id, nome, ultimos_digitos, validade) VALUES
    (1, 1, 'Visa final 4821', '4821', '08/30'),
    (2, 1, 'Mastercard final 9927', '9927', '11/29'),
    (3, 1, 'Alimentação final 5371', '5371', '01/27');

INSERT INTO usuario_cupons (usuario_id, cupom_id) VALUES
    (1, 1),
    (1, 2),
    (1, 3);

INSERT INTO usuario_notificacoes (usuario_id, notificacao_id) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4);

INSERT INTO pedidos (id, usuario_id, modo, endereco_entrega, forma_pagamento, cupom, subtotal, desconto, total, status, criado_em) VALUES
    (1, 1, 'Levar', 'Rua Exemplo, 200 - Centro, Criciúma - SC', 'Pix', NULL, 38.80, 0.00, 38.80, 'Entregue', '2026-09-15 10:30:00'),
    (2, 1, 'Comer aqui', NULL, 'Cartão de crédito', NULL, 25.80, 0.00, 25.80, 'Entregue', '2026-09-24 15:10:00'),
    (3, 1, 'Levar', 'Rua Exemplo, 100 - Centro, Criciúma - SC', 'Dinheiro', NULL, 28.80, 0.00, 28.80, 'Entregue', '2026-10-01 09:00:00');

INSERT INTO pedido_itens (pedido_id, produto_id, tamanho, opcional, quantidade, preco_unitario) VALUES
    (1, 4, 'P', '---', 1, 12.90),
    (1, 3, 'P', '---', 1, 25.90),
    (2, 1, 'P', 'Sem açúcar', 1, 13.90),
    (2, 9, 'P', '---', 1, 11.90),
    (3, 1, 'P', 'Sem açúcar', 1, 13.90),
    (3, 6, 'P', '---', 1, 14.90);


-- =====================================================
-- CONSULTAS DE EXEMPLO
-- =====================================================

-- Cardápio: produtos de uma categoria
SELECT p.nome, p.preco, p.preco_antigo, p.nota
FROM produtos p
JOIN categorias c ON c.id = p.categoria_id
WHERE c.nome = 'Promoção' AND p.ativo = TRUE;

-- Preço de um produto em cada tamanho (tela do produto)
SELECT p.nome, t.nome AS tamanho, p.preco + t.acrescimo AS preco
FROM produtos p, tamanhos t
WHERE p.id = 1;

-- Histórico de pedidos do usuário, com os itens, o modo e o endereço
SELECT pe.id AS pedido, pe.criado_em, pe.status, pe.modo, pe.endereco_entrega,
       pr.nome AS produto, pi.tamanho, pi.quantidade, pe.total
FROM pedidos pe
JOIN pedido_itens pi ON pi.pedido_id = pe.id
JOIN produtos pr ON pr.id = pi.produto_id
WHERE pe.usuario_id = 1
ORDER BY pe.criado_em DESC;

-- Endereços salvos do usuário (tela de entrega)
SELECT tipo, rua, numero, bairro, cidade
FROM enderecos
WHERE usuario_id = 1;

-- Quantas notificações o usuário ainda não leu
SELECT COUNT(*) AS nao_lidas
FROM usuario_notificacoes
WHERE usuario_id = 1 AND lida = FALSE;
