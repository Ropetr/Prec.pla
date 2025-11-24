-- =============================================================================
-- SISTEMA DE GRUPOS, SUBGRUPOS E TAGS - PLANAC
-- =============================================================================

-- Criar tabela de grupos (categorias principais)
CREATE TABLE IF NOT EXISTS product_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_margin REAL DEFAULT 0,
  parent_group_id INTEGER NULL,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_group_id) REFERENCES product_groups(id)
);

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

-- Atualizar tabela products para usar o novo sistema de grupos
-- (group_id já existe, mas vamos garantir que funciona com a nova estrutura)

-- Inserir grupos principais
INSERT OR IGNORE INTO product_groups (id, name, description, default_margin, parent_group_id) VALUES
(1, 'Perfis Metálicos', 'Perfis de aço galvanizado para drywall', 10.0, NULL),
(2, 'Chapas de Gesso', 'Placas de gesso acartonado', 10.0, NULL),
(3, 'Forros PVC', 'Forros e acabamentos em PVC', 15.0, NULL),
(4, 'Acabamentos PVC', 'Rodapés, cantoneiras e molduras', 15.0, NULL),
(5, 'Fixadores', 'Parafusos, buchas e fixadores', 20.0, NULL),
(6, 'Portas e Painéis', 'Portas prontas e painéis', 12.0, NULL),
(7, 'Acessórios', 'Dobradiças, fechaduras e ferragens', 18.0, NULL),
(8, 'Materiais Diversos', 'Massas, fitas, ferramentas', 15.0, NULL);

-- Inserir subgrupos (exemplos)
INSERT OR IGNORE INTO product_groups (name, description, default_margin, parent_group_id) VALUES
-- Subgrupos de Perfis Metálicos
('Perfis Barbieri', 'Linha Barbieri Z275 e Z120', 10.0, 1),
('Perfis Steel', 'Linha Steel Frame 0.95mm', 12.0, 1),
('Perfis T', 'Perfis T para forro modular', 10.0, 1),

-- Subgrupos de Chapas
('Chapas Standard', 'Chapas 12.5mm padrão', 10.0, 2),
('Chapas RU', 'Chapas resistentes à umidade', 12.0, 2),
('Chapas RF', 'Chapas resistentes ao fogo', 15.0, 2),

-- Subgrupos de Forros
('Forros Brancos', 'Forros PVC cor branca', 15.0, 3),
('Forros Coloridos', 'Forros PVC cores madeira', 18.0, 3),

-- Subgrupos de Fixadores
('Parafusos Gesso', 'Parafusos GN para gesso', 20.0, 5),
('Parafusos Metálicos', 'Parafusos para perfis', 20.0, 5),
('Buchas', 'Buchas de nylon e plástico', 25.0, 5);

-- Inserir tags comuns
INSERT OR IGNORE INTO product_tags (name, color, description) VALUES
('Promocional', '#ef4444', 'Produtos em promoção'),
('Estoque Baixo', '#f59e0b', 'Produtos com estoque baixo'),
('Alto Giro', '#10b981', 'Produtos de alta rotatividade'),
('Importado', '#3b82f6', 'Produtos importados'),
('Exclusivo', '#8b5cf6', 'Linha exclusiva'),
('Lançamento', '#ec4899', 'Produtos novos no catálogo'),
('Sem ST', '#6b7280', 'Produtos sem substituição tributária'),
('Com ST', '#dc2626', 'Produtos com ST'),
('Revenda', '#14b8a6', 'Produtos para revenda'),
('Obra', '#f97316', 'Produtos para obras');

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_products_group ON products(group_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_relation_product ON product_tags_relation(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_relation_tag ON product_tags_relation(tag_id);
CREATE INDEX IF NOT EXISTS idx_product_groups_parent ON product_groups(parent_group_id);

-- Tabela de histórico de custos
CREATE TABLE IF NOT EXISTS product_cost_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  old_cost REAL,
  new_cost REAL NOT NULL,
  invoice_id TEXT,
  changed_by TEXT,
  change_reason TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE INDEX IF NOT EXISTS idx_cost_history_product ON product_cost_history(product_id);
CREATE INDEX IF NOT EXISTS idx_cost_history_date ON product_cost_history(created_at);

SELECT 'Sistema de Grupos, Subgrupos e Tags criado com sucesso!' as status;
SELECT COUNT(*) as total_grupos FROM product_groups;
SELECT COUNT(*) as total_tags FROM product_tags;
