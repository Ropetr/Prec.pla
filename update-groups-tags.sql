-- =============================================================================
-- ATUALIZAÇÃO: SISTEMA DE SUBGRUPOS E TAGS - PLANAC
-- =============================================================================

-- Adicionar coluna parent_group_id para subgrupos (se não existir)
ALTER TABLE product_groups ADD COLUMN parent_group_id INTEGER DEFAULT NULL;
ALTER TABLE product_groups ADD COLUMN description TEXT;
ALTER TABLE product_groups ADD COLUMN active INTEGER DEFAULT 1;

-- Criar tabela de tags
CREATE TABLE IF NOT EXISTS product_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relação produtos-tags (many-to-many)
CREATE TABLE IF NOT EXISTS product_tags_relation (
  product_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, tag_id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (tag_id) REFERENCES product_tags(id)
);

-- Tabela de histórico de custos
CREATE TABLE IF NOT EXISTS product_cost_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  old_cost REAL,
  new_cost REAL NOT NULL,
  invoice_id TEXT,
  invoice_number TEXT,
  supplier TEXT,
  changed_by TEXT DEFAULT 'sistema',
  change_reason TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Inserir subgrupos (filhos dos grupos principais)
INSERT OR IGNORE INTO product_groups (name, min_margin, max_margin, parent_group_id, description) VALUES
-- Subgrupos de Perfis Metálicos (id 1)
('Perfis Barbieri', 8.0, 12.0, 1, 'Linha Barbieri Z275 e Z120'),
('Perfis Steel', 10.0, 15.0, 1, 'Linha Steel Frame 0.95mm'),
('Perfis T Modular', 8.0, 12.0, 1, 'Perfis T para forro modular'),

-- Subgrupos de Chapas (id 2)
('Chapas Standard', 8.0, 12.0, 2, 'Chapas 12.5mm padrão'),
('Chapas RU', 10.0, 14.0, 2, 'Chapas resistentes à umidade'),
('Chapas RF', 12.0, 18.0, 2, 'Chapas resistentes ao fogo'),

-- Subgrupos de Forros (id 3)
('Forros Brancos', 12.0, 18.0, 3, 'Forros PVC cor branca'),
('Forros Madeira', 15.0, 22.0, 3, 'Forros PVC imitação madeira'),

-- Subgrupos de Fixadores (id 5)
('Parafusos Gesso', 18.0, 25.0, 5, 'Parafusos GN para gesso'),
('Parafusos Metálicos', 18.0, 25.0, 5, 'Parafusos para perfis'),
('Buchas e Fixadores', 22.0, 30.0, 5, 'Buchas de nylon e fixadores');

-- Inserir tags comuns
INSERT OR IGNORE INTO product_tags (name, color, description) VALUES
('Promocional', '#ef4444', 'Produtos em promoção'),
('Estoque Baixo', '#f59e0b', 'Produtos com estoque baixo - necessita reposição'),
('Alto Giro', '#10b981', 'Produtos de alta rotatividade'),
('Importado', '#3b82f6', 'Produtos importados'),
('Exclusivo', '#8b5cf6', 'Linha exclusiva PLANAC'),
('Lançamento', '#ec4899', 'Produtos novos no catálogo'),
('Sem ST', '#6b7280', 'Produtos sem substituição tributária'),
('Com ST', '#dc2626', 'Produtos com ST - atenção ao cálculo'),
('Revenda', '#14b8a6', 'Produtos destinados à revenda'),
('Obra', '#f97316', 'Produtos para construção civil'),
('Custo Alto', '#991b1b', 'Produtos com custo elevado - atenção à margem'),
('Alta Lucratividade', '#059669', 'Produtos com melhor margem de lucro'),
('Necessita Revisão', '#ea580c', 'Preço precisa ser revisado');

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_products_group ON products(group_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_relation_product ON product_tags_relation(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_relation_tag ON product_tags_relation(tag_id);
CREATE INDEX IF NOT EXISTS idx_product_groups_parent ON product_groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_cost_history_product ON product_cost_history(product_id);
CREATE INDEX IF NOT EXISTS idx_cost_history_date ON product_cost_history(created_at);

-- Marcar produtos com tags automáticas baseadas em características
-- Produtos com ST
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, (SELECT id FROM product_tags WHERE name = 'Com ST')
FROM products p
WHERE p.hasST = 1;

-- Produtos sem ST
INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
SELECT p.id, (SELECT id FROM product_tags WHERE name = 'Sem ST')
FROM products p
WHERE p.hasST = 0;

SELECT 'Sistema atualizado!' as status,
       (SELECT COUNT(*) FROM product_groups WHERE parent_group_id IS NOT NULL) as subgrupos,
       (SELECT COUNT(*) FROM product_tags) as tags,
       (SELECT COUNT(*) FROM product_tags_relation) as produtos_taggeados;
