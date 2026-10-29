-- =====================================================
-- ATUALIZAÇÃO: EXCLUSÃO LÓGICA
-- Para quem já tem o banco daily_express criado e não quer perder os dados.
-- Rodar UMA vez no phpMyAdmin (XAMPP) ou no MySQL Workbench.
-- (Quem rodar o daily_express.sql do zero já recebe essas colunas.)
-- =====================================================

USE daily_express;

ALTER TABLE cupons ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE enderecos ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE cartoes ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE favoritos ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE carrinho_itens ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
