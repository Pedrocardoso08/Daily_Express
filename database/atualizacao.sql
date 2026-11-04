-- =====================================================
-- ATUALIZAÇÃO DO BANCO
-- Para quem já tem o banco daily_express criado e não quer perder os dados.
-- Rodar no phpMyAdmin (XAMPP) ou no MySQL Workbench.
-- (Quem rodar o daily_express.sql do zero já recebe tudo isso.)
-- Pode rodar mais de uma vez: o que já foi aplicado é pulado.
-- O "ADD COLUMN IF NOT EXISTS" funciona no MariaDB, que é o banco do XAMPP.
-- =====================================================

USE daily_express;

-- -----------------------------------------------------
-- EXCLUSÃO LÓGICA
-- Quando algo é removido no app, a coluna ativo vira FALSE
-- e o registro só deixa de aparecer.
-- -----------------------------------------------------
ALTER TABLE cupons ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE enderecos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE favoritos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE carrinho_itens ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- -----------------------------------------------------
-- CATEGORIAS DOS PRODUTOS EM PROMOÇÃO
-- Os produtos continuam na aba Promoção porque têm preço antigo (riscado).
-- 2 = Bebidas, 3 = Salgados, 4 = Doces
-- -----------------------------------------------------
UPDATE produtos SET categoria_id = 2 WHERE id IN (1, 4, 5, 8);
UPDATE produtos SET categoria_id = 3 WHERE id IN (3, 6);
UPDATE produtos SET categoria_id = 4 WHERE id IN (2, 7);
