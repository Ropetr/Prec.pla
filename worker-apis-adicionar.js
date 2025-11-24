// =============================================================================
// NOVAS APIS PARA ADICIONAR NO WORKER.JS
// Adicionar estas rotas no switch case e os métodos no final do objeto
// =============================================================================

// ========== ADICIONAR NO SWITCH CASE (linha ~54) ==========
/*
        case '/api/groups':
          return await this.handleGroups(request, env, headers);

        case '/api/groups/subgroups':
          return await this.handleSubgroups(request, env, headers);

        case '/api/tags':
          return await this.handleTags(request, env, headers);

        case '/api/products/tags':
          return await this.handleProductTags(request, env, headers);

        case '/api/reports/groups':
          return await this.handleReportByGroups(env, headers);

        case '/api/reports/tags':
          return await this.handleReportByTags(env, headers);

        case '/api/cost-history':
          return await this.handleCostHistory(request, env, headers);
*/

// ========== ADICIONAR ANTES DO ÚLTIMO } (final do arquivo) ==========

  // Groups API
  async handleGroups(request, env, headers) {
    if (request.method === 'GET') {
      // Get all groups with product count
      const groups = await env.DB.prepare(`
        SELECT
          g.*,
          COUNT(p.id) as product_count,
          AVG(p.cost) as avg_cost
        FROM product_groups g
        LEFT JOIN products p ON p.group_id = g.id
        WHERE g.parent_group_id IS NULL
        GROUP BY g.id
        ORDER BY g.name
      `).all();

      return new Response(JSON.stringify(groups.results || []), { headers });
    }

    if (request.method === 'POST') {
      const data = await request.json();
      const { name, description, min_margin, max_margin, parent_group_id } = data;

      await env.DB.prepare(`
        INSERT INTO product_groups (name, description, min_margin, max_margin, parent_group_id)
        VALUES (?, ?, ?, ?, ?)
      `).bind(name, description, min_margin, max_margin, parent_group_id || null).run();

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (request.method === 'PUT') {
      const data = await request.json();
      const { id, name, description, min_margin, max_margin } = data;

      await env.DB.prepare(`
        UPDATE product_groups
        SET name = ?, description = ?, min_margin = ?, max_margin = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(name, description, min_margin, max_margin, id).run();

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');

      await env.DB.prepare('DELETE FROM product_groups WHERE id = ?').bind(id).run();

      return new Response(JSON.stringify({ success: true }), { headers });
    }
  },

  // Subgroups API
  async handleSubgroups(request, env, headers) {
    const url = new URL(request.url);
    const parentId = url.searchParams.get('parent');

    if (!parentId) {
      return new Response(JSON.stringify({ error: 'Parent group ID required' }), {
        status: 400,
        headers
      });
    }

    const subgroups = await env.DB.prepare(`
      SELECT
        g.*,
        COUNT(p.id) as product_count
      FROM product_groups g
      LEFT JOIN products p ON p.group_id = g.id
      WHERE g.parent_group_id = ?
      GROUP BY g.id
      ORDER BY g.name
    `).bind(parentId).all();

    return new Response(JSON.stringify(subgroups.results || []), { headers });
  },

  // Tags API
  async handleTags(request, env, headers) {
    if (request.method === 'GET') {
      const tags = await env.DB.prepare(`
        SELECT
          t.*,
          COUNT(ptr.product_id) as product_count
        FROM product_tags t
        LEFT JOIN product_tags_relation ptr ON ptr.tag_id = t.id
        GROUP BY t.id
        ORDER BY t.name
      `).all();

      return new Response(JSON.stringify(tags.results || []), { headers });
    }

    if (request.method === 'POST') {
      const data = await request.json();
      const { name, color, description } = data;

      await env.DB.prepare(`
        INSERT INTO product_tags (name, color, description)
        VALUES (?, ?, ?)
      `).bind(name, color, description).run();

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');

      // Remove relations first
      await env.DB.prepare('DELETE FROM product_tags_relation WHERE tag_id = ?').bind(id).run();
      await env.DB.prepare('DELETE FROM product_tags WHERE id = ?').bind(id).run();

      return new Response(JSON.stringify({ success: true }), { headers });
    }
  },

  // Product Tags Management
  async handleProductTags(request, env, headers) {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const productId = url.searchParams.get('product_id');

      if (!productId) {
        return new Response(JSON.stringify({ error: 'Product ID required' }), {
          status: 400,
          headers
        });
      }

      const tags = await env.DB.prepare(`
        SELECT t.*
        FROM product_tags t
        INNER JOIN product_tags_relation ptr ON ptr.tag_id = t.id
        WHERE ptr.product_id = ?
      `).bind(productId).all();

      return new Response(JSON.stringify(tags.results || []), { headers });
    }

    if (request.method === 'POST') {
      const data = await request.json();
      const { product_id, tag_id } = data;

      await env.DB.prepare(`
        INSERT OR IGNORE INTO product_tags_relation (product_id, tag_id)
        VALUES (?, ?)
      `).bind(product_id, tag_id).run();

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (request.method === 'DELETE') {
      const data = await request.json();
      const { product_id, tag_id } = data;

      await env.DB.prepare(`
        DELETE FROM product_tags_relation
        WHERE product_id = ? AND tag_id = ?
      `).bind(product_id, tag_id).run();

      return new Response(JSON.stringify({ success: true }), { headers });
    }
  },

  // Report by Groups
  async handleReportByGroups(env, headers) {
    const report = await env.DB.prepare(`
      SELECT
        g.name as group_name,
        g.min_margin,
        g.max_margin,
        COUNT(p.id) as product_count,
        AVG(p.cost) as avg_cost,
        MIN(p.cost) as min_cost,
        MAX(p.cost) as max_cost,
        SUM(p.cost * COALESCE(p.stock_quantity, 0)) as stock_value
      FROM product_groups g
      LEFT JOIN products p ON p.group_id = g.id
      WHERE g.parent_group_id IS NULL
      GROUP BY g.id
      ORDER BY product_count DESC
    `).all();

    return new Response(JSON.stringify(report.results || []), { headers });
  },

  // Report by Tags
  async handleReportByTags(env, headers) {
    const report = await env.DB.prepare(`
      SELECT
        t.name as tag_name,
        t.color,
        COUNT(DISTINCT ptr.product_id) as product_count,
        AVG(p.cost) as avg_cost
      FROM product_tags t
      LEFT JOIN product_tags_relation ptr ON ptr.tag_id = t.id
      LEFT JOIN products p ON p.id = ptr.product_id
      GROUP BY t.id
      ORDER BY product_count DESC
    `).all();

    return new Response(JSON.stringify(report.results || []), { headers });
  },

  // Cost History
  async handleCostHistory(request, env, headers) {
    const url = new URL(request.url);
    const productId = url.searchParams.get('product_id');
    const productCode = url.searchParams.get('code');

    let query = `
      SELECT
        ch.*,
        p.code as product_code,
        p.name as product_name
      FROM product_cost_history ch
      INNER JOIN products p ON p.id = ch.product_id
      WHERE 1=1
    `;
    const params = [];

    if (productId) {
      query += ' AND ch.product_id = ?';
      params.push(productId);
    }

    if (productCode) {
      query += ' AND p.code = ?';
      params.push(productCode);
    }

    query += ' ORDER BY ch.created_at DESC LIMIT 50';

    let stmt = env.DB.prepare(query);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }

    const result = await stmt.all();

    return new Response(JSON.stringify(result.results || []), { headers });
  },

  // Enhanced Product API with tags
  async handleProductsWithTags(request, env, headers) {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const groupId = url.searchParams.get('group');
    const tagId = url.searchParams.get('tag');

    let query = `
      SELECT DISTINCT
        p.*,
        g.name as group_name,
        GROUP_CONCAT(t.name) as tags
      FROM products p
      LEFT JOIN product_groups g ON g.id = p.group_id
      LEFT JOIN product_tags_relation ptr ON ptr.product_id = p.id
      LEFT JOIN product_tags t ON t.id = ptr.tag_id
      WHERE p.active = 1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.code LIKE ? OR p.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (groupId) {
      query += ' AND p.group_id = ?';
      params.push(parseInt(groupId));
    }

    if (tagId) {
      query += ' AND ptr.tag_id = ?';
      params.push(parseInt(tagId));
    }

    query += ' GROUP BY p.id ORDER BY p.name LIMIT 100';

    let stmt = env.DB.prepare(query);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }

    const result = await stmt.all();

    return new Response(JSON.stringify(result.results || []), { headers });
  },
