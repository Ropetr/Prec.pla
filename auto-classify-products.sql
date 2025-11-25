-- ============================================
-- CLASSIFICAÇÃO AUTOMÁTICA DE PRODUTOS - PLANAC
-- Data: 25/11/2025
-- ============================================

-- Este script aplica automaticamente grupos e tags aos produtos
-- baseado em regras de NCM e palavras-chave no nome

-- ============================================
-- PARTE 1: APLICAR GRUPOS POR NCM
-- ============================================

-- Perfis Metálicos (Grupo 1)
UPDATE products
SET group_id = 1
WHERE active = 1
  AND (
    ncm IN ('72166110', '72166190', '72162200', '73066100', '73089010')
    OR name LIKE '%MONTANTE%'
    OR name LIKE '%GUIA%'
    OR name LIKE '%CANTONEIRA%'
    OR name LIKE '%TABICA%'
    OR name LIKE '%TRAVESSA%'
    OR name LIKE '%PERFIL%'
  );

-- Chapas e Placas (Grupo 2)
UPDATE products
SET group_id = 2
WHERE active = 1
  AND (
    ncm IN ('68091100', '68091900', '68118200', '44101210', '44123900')
    OR name LIKE '%CHAPA GESSO%'
    OR name LIKE '%CHAPA CIMENTICIA%'
    OR name LIKE '%PLACA%'
    OR name LIKE '%OSB%'
    OR name LIKE '%COMPENSADO%'
  );

-- Forros (Grupo 3)
UPDATE products
SET group_id = 3
WHERE active = 1
  AND (
    ncm IN ('39162000', '39172900')
    OR name LIKE '%FORRO%'
    OR name LIKE '%RODAFORRO%'
  );

-- Portas e Esquadrias (Grupo 4)
UPDATE products
SET group_id = 4
WHERE active = 1
  AND (
    name LIKE '%PORTA%'
    OR name LIKE '%MARCO%'
    OR name LIKE '%BATENTE%'
    OR name LIKE '%KIT PORTA%'
    OR name LIKE '%PAINEL PORTA%'
  );

-- Ferragens (Grupo 5)
UPDATE products
SET group_id = 5
WHERE active = 1
  AND (
    name LIKE '%FECHADURA%'
    OR name LIKE '%DOBRADICA%'
    OR name LIKE '%PUXADOR%'
    OR name LIKE '%RODIZIO%'
    OR name LIKE '%TRINCO%'
    OR name LIKE '%MACANETA%'
  );

-- Fixadores (Grupo 6)
UPDATE products
SET group_id = 6
WHERE active = 1
  AND (
    ncm IN ('73181400', '73181200', '73181300', '72172090')
    OR name LIKE '%PARAFUSO%'
    OR name LIKE '%BUCHA%'
    OR name LIKE '%PREGO%'
    OR name LIKE '%ARAME%'
    OR name LIKE '%REBITE%'
  );

-- Acabamentos (Grupo 7)
UPDATE products
SET group_id = 7
WHERE active = 1
  AND (
    ncm IN ('32141010', '35061090', '39191010')
    OR name LIKE '%MASSA%'
    OR name LIKE '%FITA%'
    OR name LIKE '%RODAPE%'
    OR name LIKE '%CANTONEIRA PVC%'
    OR name LIKE '%TIRA DE PVC%'
  );

-- Materiais Gerais (Grupo 8) - produtos não classificados
UPDATE products
SET group_id = 8
WHERE active = 1
  AND (group_id IS NULL OR group_id = 0);

-- ============================================
-- PARTE 2: CRIAR TAGS SE NÃO EXISTIREM
-- ============================================

-- Tags de Marca
INSERT OR IGNORE INTO product_tags (name, color, description) VALUES
  ('BARBIERI', '#1E40AF', 'Marca - Perfis metálicos'),
  ('BELKA', '#1E3A8A', 'Marca - Forros PVC'),
  ('PLASBIL', '#1E3A8A', 'Marca - Forros PVC'),
  ('STEEL', '#1E40AF', 'Marca - Perfis'),
  ('KNAUF', '#1E40AF', 'Marca - Gesso'),
  ('PLACO', '#1E40AF', 'Marca - Gesso'),
  ('BRASILIT', '#1E40AF', 'Marca - Cimentícias'),
  ('INFIBRA', '#1E40AF', 'Marca - Cimentícias'),
  ('G-DOOR', '#1E40AF', 'Marca - Portas'),
  ('DRYBOX', '#1E40AF', 'Marca - Massas');

-- Tags de Material
INSERT OR IGNORE INTO product_tags (name, color, description) VALUES
  ('METAL', '#15803D', 'Material - Metal'),
  ('PVC', '#166534', 'Material - PVC'),
  ('GESSO', '#15803D', 'Material - Gesso'),
  ('MADEIRA', '#92400E', 'Material - Madeira'),
  ('CIMENTO', '#15803D', 'Material - Cimento'),
  ('PLASTICO', '#166534', 'Material - Plástico'),
  ('ACO_GALVANIZADO', '#15803D', 'Material - Aço galvanizado');

-- Tags de Aplicação
INSERT OR IGNORE INTO product_tags (name, color, description) VALUES
  ('DRYWALL', '#6B21A8', 'Aplicação - Drywall'),
  ('STEEL_FRAME', '#7C3AED', 'Aplicação - Steel Frame'),
  ('FORRO', '#7C3AED', 'Aplicação - Forro'),
  ('DIVISORIA', '#6B21A8', 'Aplicação - Divisória'),
  ('PORTA', '#7C3AED', 'Aplicação - Porta'),
  ('PAREDE', '#6B21A8', 'Aplicação - Parede'),
  ('TETO', '#7C3AED', 'Aplicação - Teto');

-- Tags de Característica
INSERT OR IGNORE INTO product_tags (name, color, description) VALUES
  ('RESISTENTE_UMIDADE', '#C2410C', 'Característica - RU'),
  ('RESISTENTE_FOGO', '#DC2626', 'Característica - RF'),
  ('GALVANIZADO', '#D97706', 'Característica - Galvanizado'),
  ('PINTADO', '#D97706', 'Característica - Pintado'),
  ('EXTERNO', '#C2410C', 'Característica - Uso externo'),
  ('INTERNO', '#16A34A', 'Característica - Uso interno');

-- Tags de Performance
INSERT OR IGNORE INTO product_tags (name, color, description) VALUES
  ('ALTO_GIRO', '#16A34A', 'Performance - Alto giro'),
  ('BAIXO_GIRO', '#EAB308', 'Performance - Baixo giro'),
  ('ESTRATEGICO', '#0891B2', 'Performance - Estratégico');

-- ============================================
-- PARTE 3: APLICAR TAGS AUTOMATICAMENTE
-- ============================================

-- Tags de Marca
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'BARBIERI'
  AND p.name LIKE '%BARBIERI%';

INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'BELKA'
  AND p.name LIKE '%BELKA%';

INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'PLASBIL'
  AND p.name LIKE '%PLASBIL%';

INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'STEEL'
  AND p.name LIKE '%STEEL%';

INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'DRYBOX'
  AND p.name LIKE '%DRYBOX%';

INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'G-DOOR'
  AND p.name LIKE '%G-DOOR%';

-- Tags de Material: Metal
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'METAL'
  AND (
    p.ncm IN ('72166110', '72166190', '73181400', '73181200')
    OR p.name LIKE '%MONTANTE%'
    OR p.name LIKE '%GUIA%'
    OR p.name LIKE '%CANTONEIRA%'
    OR p.name LIKE '%PERFIL%'
  );

-- Tags de Material: Galvanizado
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'ACO_GALVANIZADO'
  AND (
    p.ncm = '72166110'
    OR p.name LIKE '%GALVANIZADO%'
    OR p.name LIKE '%Z120%'
    OR p.name LIKE '%Z275%'
  );

-- Tags de Material: PVC
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'PVC'
  AND (
    p.ncm = '39162000'
    OR p.name LIKE '%PVC%'
    OR p.name LIKE '%FORRO%'
  );

-- Tags de Material: Gesso
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'GESSO'
  AND (
    p.ncm IN ('68091100', '68091900')
    OR p.name LIKE '%GESSO%'
  );

-- Tags de Material: Cimento
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'CIMENTO'
  AND (
    p.ncm = '68118200'
    OR p.name LIKE '%CIMENTICIA%'
  );

-- Tags de Aplicação: Drywall
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'DRYWALL'
  AND (
    p.name LIKE '%MONTANTE%'
    OR p.name LIKE '%GUIA%'
    OR p.name LIKE '%CANTONEIRA%'
    OR p.name LIKE '%CHAPA GESSO%'
    OR p.name LIKE '%MASSA DRYBOX%'
  );

-- Tags de Aplicação: Steel Frame
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'STEEL_FRAME'
  AND (
    p.name LIKE '%STEEL%'
    OR (p.name LIKE '%MONTANTE%' AND p.name NOT LIKE '%48%')
    OR (p.name LIKE '%GUIA%' AND p.name NOT LIKE '%48%')
  );

-- Tags de Aplicação: Forro
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'FORRO'
  AND p.name LIKE '%FORRO%';

-- Tags de Característica: Resistente Umidade
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'RESISTENTE_UMIDADE'
  AND (
    p.name LIKE '%RU%'
    OR p.name LIKE '%RESISTENTE UMIDADE%'
    OR p.name LIKE '%RESIST. UMIDADE%'
  );

-- Tags de Característica: Resistente Fogo
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'RESISTENTE_FOGO'
  AND (
    p.name LIKE '%RF%'
    OR p.name LIKE '%RESISTENTE FOGO%'
    OR p.name LIKE '%RESIST. FOGO%'
  );

-- Tags de Característica: Galvanizado
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'GALVANIZADO'
  AND (
    p.name LIKE '%GALVANIZADO%'
    OR p.name LIKE '%Z120%'
    OR p.name LIKE '%Z275%'
  );

-- Tags de Característica: Externo
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'EXTERNO'
  AND (
    p.name LIKE '%CIMENTICIA%'
    OR p.name LIKE '%EXTERNO%'
    OR p.name LIKE '%EXTERNA%'
  );

-- Tags de Característica: Interno
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, t.id
FROM products p, product_tags t
WHERE p.active = 1
  AND t.name = 'INTERNO'
  AND (
    p.name LIKE '%GESSO%'
    OR p.name LIKE '%FORRO PVC%'
    OR p.name LIKE '%INTERNO%'
  );

-- ============================================
-- PARTE 4: VERIFICAÇÃO E ESTATÍSTICAS
-- ============================================

-- Produtos por grupo
SELECT
  pg.name as grupo,
  COUNT(p.id) as total_produtos
FROM product_groups pg
LEFT JOIN products p ON p.group_id = pg.id AND p.active = 1
GROUP BY pg.id, pg.name
ORDER BY total_produtos DESC;

-- Produtos sem grupo
SELECT COUNT(*) as sem_grupo
FROM products
WHERE active = 1 AND (group_id IS NULL OR group_id = 0);

-- Tags mais aplicadas
SELECT
  t.name as tag,
  t.description as descricao,
  COUNT(pta.product_id) as total_produtos
FROM product_tags t
LEFT JOIN product_tags_relation pta ON t.id = pta.tag_id
GROUP BY t.id, t.name, t.description
ORDER BY total_produtos DESC;

-- Produtos sem tags
SELECT
  p.code,
  p.name,
  pg.name as grupo
FROM products p
LEFT JOIN product_groups pg ON p.group_id = pg.id
LEFT JOIN product_tags_relation pta ON p.id = pta.product_id
WHERE p.active = 1
  AND pta.product_id IS NULL
ORDER BY p.code;

-- Resumo final
SELECT
  'Total Produtos Ativos' as metrica,
  COUNT(*) as valor
FROM products
WHERE active = 1

UNION ALL

SELECT
  'Produtos com Grupo',
  COUNT(*)
FROM products
WHERE active = 1 AND group_id IS NOT NULL AND group_id > 0

UNION ALL

SELECT
  'Produtos com Tags',
  COUNT(DISTINCT p.id)
FROM products p
INNER JOIN product_tags_relation pta ON p.id = pta.product_id
WHERE p.active = 1

UNION ALL

SELECT
  'Total de Tags Criadas',
  COUNT(*)
FROM product_tags

UNION ALL

SELECT
  'Total de Associações Tag-Produto',
  COUNT(*)
FROM product_tags_relation;
