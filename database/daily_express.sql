-- =====================================================
-- BANCO DE DADOS DO APP DAILY EXPRESS (MySQL)
-- Rodar o arquivo inteiro no MySQL Workbench ou no phpMyAdmin (XAMPP).
-- ATENÇÃO: se o banco daily_express já existir, ele é apagado e criado de novo.
--
-- Este arquivo só cria as tabelas, sem nenhum dado:
-- - produtos, cupons, avisos e prêmios são cadastrados na Área do funcionário (tela de login);
-- - as categorias e os tamanhos (P, M, G) o back-end cria sozinho na primeira vez que precisar;
-- - os clientes se cadastram pelo app.
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
    -- Vale de até R$15 trocado por 1000 pontos na tela fidelidade (some quando é usado)
    tem_vale BOOLEAN DEFAULT FALSE,
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
-- ml_p, ml_m, ml_g = ml dos copos pequeno, médio e grande (só bebidas; o funcionário escolhe)
-- sabores = opções separadas por vírgula, ex.: "Chocolate, Morango" (o cliente escolhe uma; vai para pedido_itens.opcional)
-- disponivel = FALSE quando o produto está esgotado (some do cardápio por um tempo)
-- A nota do produto não fica aqui: é a média da tabela avaliacoes.
-- =====================================================
CREATE TABLE produtos(
    id INT PRIMARY KEY AUTO_INCREMENT,
    categoria_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao_curta VARCHAR(150) NOT NULL,
    descricao_completa TEXT,
    preco DECIMAL(10,2) NOT NULL,
    preco_antigo DECIMAL(10,2),
    imagem VARCHAR(255),
    ml_p INT,
    ml_m INT,
    ml_g INT,
    sabores VARCHAR(255),
    -- Avisa quem escolheu "Sem açúcar" na personalizacao
    tem_acucar BOOLEAN DEFAULT FALSE,
    disponivel BOOLEAN DEFAULT TRUE,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- =====================================================
-- TAMANHOS
-- Tela: produto (o preço sobe conforme o tamanho)
-- P, M e G = copos pequeno, médio e grande (só bebidas; os ml ficam no produto); U = tamanho único (o resto)
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
-- status: Preparando, A caminho, Finalizado (muda na Área do funcionário) ou Cancelado (só o cliente cancela, na tela Pedidos ativos)
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
    -- TRUE quando o cliente usou o vale da fidelidade (volta para ele se cancelar)
    usou_vale BOOLEAN DEFAULT FALSE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =====================================================
-- ITENS DE CADA PEDIDO
-- Telas: pagamento (copia do carrinho), historicoPedidos (mostra e
-- "Pedir Novamente")
-- O preço e o ml do copo ficam salvos como eram no dia da compra.
-- =====================================================
CREATE TABLE pedido_itens(
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    tamanho CHAR(1) DEFAULT 'P',
    ml INT,
    opcional VARCHAR(50) DEFAULT '---',
    quantidade INT DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (tamanho) REFERENCES tamanhos(sigla)
);

-- =====================================================
-- AVALIAÇÕES
-- Telas: historicoPedidos (o cliente dá de 0 a 5 estrelas no que já pediu),
-- menu e produto (mostram a média das notas)
-- Cada cliente tem uma nota por produto: se avaliar de novo, a nota é trocada.
-- =====================================================
CREATE TABLE avaliacoes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    nota INT NOT NULL,
    UNIQUE (usuario_id, produto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- =====================================================
-- RECOMPENSAS
-- Telas: fidelidade (lista), funcionarios (cadastra e remove)
-- =====================================================
CREATE TABLE recompensas(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    pontos INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- NOTIFICAÇÕES
-- Telas: notificacoes (lista), funcionarios (cadastra e remove)
-- =====================================================
CREATE TABLE notificacoes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    icone VARCHAR(50) NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
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
-- configuracoes (localização, notificações, idioma)
-- idioma: pt, en ou es
-- O modo escuro fica salvo no aparelho (lib/tema.tsx), não aqui.
-- =====================================================
CREATE TABLE preferencias(
    usuario_id INT PRIMARY KEY,
    tipo_leite VARCHAR(30) DEFAULT 'Integral',
    acucar VARCHAR(30) DEFAULT '2 colheres',
    receber_promocoes BOOLEAN DEFAULT FALSE,
    notificacoes_ativas BOOLEAN DEFAULT TRUE,
    localizacao_ativa BOOLEAN DEFAULT TRUE,
    idioma VARCHAR(2) DEFAULT 'pt',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);