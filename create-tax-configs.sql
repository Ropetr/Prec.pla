-- =============================================================================
-- CRIAÇÃO E POPULAÇÃO DA TABELA TAX_CONFIGS - PLANAC
-- =============================================================================
-- Configurações fiscais reais para operações interestaduais e dentro de SP
-- Data: 24/11/2025
-- =============================================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS tax_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cfop TEXT NOT NULL,
  uf_origin TEXT NOT NULL DEFAULT 'SP',
  uf_dest TEXT NOT NULL,
  operation_type TEXT,
  description TEXT,
  icms_rate REAL DEFAULT 0,
  icms_internal_rate REAL DEFAULT 0,
  mva REAL DEFAULT 0,
  difal_rate REAL DEFAULT 0,
  fcp_rate REAL DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Limpar dados existentes
DELETE FROM tax_configs;

-- =============================================================================
-- OPERAÇÕES DENTRO DE SÃO PAULO (SP -> SP)
-- =============================================================================

-- 5102 - Venda de mercadoria adquirida de terceiros (dentro de SP)
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('5102', 'SP', 'SP', 'venda', 'Venda dentro de SP - Consumidor Final', 18.0, 18.0, 0, 0, 0);

-- 5405 - Venda de mercadoria com ST (dentro de SP)
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('5405', 'SP', 'SP', 'venda_st', 'Venda com ST dentro de SP', 18.0, 18.0, 40.0, 0, 0);

-- 5403 - Venda para não contribuinte (dentro de SP)
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('5403', 'SP', 'SP', 'venda_consumidor', 'Venda para consumidor final SP', 18.0, 18.0, 0, 0, 0);

-- =============================================================================
-- OPERAÇÕES INTERESTADUAIS (SP -> OUTROS ESTADOS)
-- =============================================================================

-- Região Sul (PR, SC, RS) - Alíquota 12%
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'PR', 'venda_interestadual', 'Venda SP -> PR', 12.0, 18.0, 0, 6.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'SC', 'venda_interestadual', 'Venda SP -> SC', 12.0, 17.0, 0, 5.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'RS', 'venda_interestadual', 'Venda SP -> RS', 12.0, 18.0, 0, 6.0, 2.0);

-- Região Sudeste (MG, RJ, ES) - Alíquota 12%
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'MG', 'venda_interestadual', 'Venda SP -> MG', 12.0, 18.0, 0, 6.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'RJ', 'venda_interestadual', 'Venda SP -> RJ', 12.0, 20.0, 0, 8.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'ES', 'venda_interestadual', 'Venda SP -> ES', 12.0, 17.0, 0, 5.0, 2.0);

-- Região Norte e Nordeste - Alíquota 7%
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'BA', 'venda_interestadual', 'Venda SP -> BA', 7.0, 18.0, 0, 11.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'PE', 'venda_interestadual', 'Venda SP -> PE', 7.0, 18.0, 0, 11.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'CE', 'venda_interestadual', 'Venda SP -> CE', 7.0, 18.0, 0, 11.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'AM', 'venda_interestadual', 'Venda SP -> AM', 7.0, 18.0, 0, 11.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'PA', 'venda_interestadual', 'Venda SP -> PA', 7.0, 17.0, 0, 10.0, 2.0);

-- Região Centro-Oeste - Alíquota 7%
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'GO', 'venda_interestadual', 'Venda SP -> GO', 7.0, 17.0, 0, 10.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'MT', 'venda_interestadual', 'Venda SP -> MT', 7.0, 17.0, 0, 10.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'MS', 'venda_interestadual', 'Venda SP -> MS', 7.0, 17.0, 0, 10.0, 2.0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6102', 'SP', 'DF', 'venda_interestadual', 'Venda SP -> DF', 7.0, 18.0, 0, 11.0, 2.0);

-- =============================================================================
-- OPERAÇÕES COM SUBSTITUIÇÃO TRIBUTÁRIA
-- =============================================================================

-- ST dentro de SP - MVA típico para materiais de construção
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('5405', 'SP', 'SP', 'venda_st', 'Venda com ST - Materiais Construção SP', 18.0, 18.0, 40.0, 0, 0);

-- ST interestadual - Exemplo para principais estados
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6404', 'SP', 'RJ', 'venda_st_interestadual', 'Venda ST SP -> RJ', 12.0, 20.0, 45.0, 0, 0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('6404', 'SP', 'MG', 'venda_st_interestadual', 'Venda ST SP -> MG', 12.0, 18.0, 40.0, 0, 0);

-- =============================================================================
-- OPERAÇÕES DE ENTRADA (COMPRAS)
-- =============================================================================

-- 1102 - Compra para comercialização
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('1102', 'SP', 'SP', 'compra', 'Compra dentro de SP', 18.0, 18.0, 0, 0, 0);

-- 2102 - Compra interestadual
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('2102', 'PR', 'SP', 'compra_interestadual', 'Compra PR -> SP', 12.0, 18.0, 0, 0, 0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('2102', 'SC', 'SP', 'compra_interestadual', 'Compra SC -> SP', 12.0, 18.0, 0, 0, 0);

INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('2102', 'RS', 'SP', 'compra_interestadual', 'Compra RS -> SP', 12.0, 18.0, 0, 0, 0);

-- =============================================================================
-- CONFIGURAÇÕES ESPECIAIS
-- =============================================================================

-- Simples Nacional - Redução de base
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('5102', 'SP', 'SP', 'venda_simples', 'Venda Simples Nacional SP', 0, 18.0, 0, 0, 0);

-- Exportação
INSERT INTO tax_configs (cfop, uf_origin, uf_dest, operation_type, description, icms_rate, icms_internal_rate, mva, difal_rate, fcp_rate)
VALUES ('7102', 'SP', 'EX', 'exportacao', 'Exportação', 0, 0, 0, 0, 0);

SELECT 'Configurações fiscais criadas com sucesso!' as status;
SELECT COUNT(*) as total_configs FROM tax_configs;
