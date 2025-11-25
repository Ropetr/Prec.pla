// Worker para Scanner de Emails e Processamento de Notas Fiscais
// PLANAC - Sistema de Precificação

export default {
  // ============================================
  // EMAIL HANDLER - Cloudflare Email Routing
  // ============================================
  async email(message, env, ctx) {
    console.log('📧 Email recebido:', message.from, message.to);

    try {
      // Get email type based on recipient
      const recipient = message.to.toLowerCase();
      let type = 'entrada'; // default

      if (recipient.includes('nfe-compra') || recipient.includes('financeiro') ||
          recipient.includes('marco') || recipient.includes('rodrigo')) {
        type = 'entrada';
      } else if (recipient.includes('nfe-venda') || recipient.includes('planacnotaseboletos')) {
        type = 'saida';
      }

      console.log(`📋 Tipo de nota identificado: ${type}`);

      // Process all XML attachments
      let processedCount = 0;
      const errors = [];

      for (const attachment of message.attachments) {
        const filename = attachment.filename.toLowerCase();

        if (filename.endsWith('.xml')) {
          try {
            console.log(`📄 Processando XML: ${attachment.filename}`);

            // Read attachment content
            const reader = attachment.body.getReader();
            const chunks = [];
            let done, value;

            while ({done, value} = await reader.read(), !done) {
              chunks.push(value);
            }

            // Convert to text
            const xmlContent = new TextDecoder().decode(
              new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []))
            );

            // Parse and save
            const nfeData = await this.parseNFeXML(xmlContent);
            const invoiceId = await this.saveInvoice(nfeData, type, env);

            processedCount++;
            console.log(`✅ XML processado com sucesso: ${invoiceId}`);

            // Register in history
            await this.registerEmailProcessing(env, {
              email_from: message.from,
              email_to: message.to,
              invoice_number: nfeData.nNF,
              invoice_id: invoiceId,
              type: type,
              status: 'success'
            });

          } catch (error) {
            console.error(`❌ Erro ao processar ${attachment.filename}:`, error);
            errors.push({ file: attachment.filename, error: error.message });

            // Register error
            await this.registerEmailProcessing(env, {
              email_from: message.from,
              email_to: message.to,
              type: type,
              status: 'error',
              error_message: error.message
            });
          }
        }
      }

      console.log(`✨ Processamento concluído: ${processedCount} XMLs processados, ${errors.length} erros`);

      // Optional: Send confirmation email back
      if (processedCount > 0) {
        await this.sendConfirmationEmail(env, message.from, processedCount, errors);
      }

    } catch (error) {
      console.error('❌ Erro geral no processamento de email:', error);
    }
  },

  async scheduled(event, env, ctx) {
    // Executado periodicamente pelo Cloudflare Cron
    await this.scanAllEmails(env);
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // API Routes
      switch (path) {
        case '/api/scan':
          return await this.handleManualScan(request, env, headers);
        
        case '/api/invoices':
          return await this.handleGetInvoices(request, env, headers);
        
        case '/api/invoice/upload':
          return await this.handleUploadXML(request, env, headers);
        
        case '/api/stats':
          return await this.handleGetStats(env, headers);
        
        case '/api/config':
          return await this.handleConfig(request, env, headers);

        case '/api/products':
          return await this.handleProducts(request, env, headers);

        case '/api/product':
          return await this.handleProduct(request, env, headers);

        case '/api/pricing/calculate':
          return await this.handlePricingCalculate(request, env, headers);

        case '/api/login':
          return await this.handleLogin(request, env, headers);

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

        default:
          return new Response('Not Found', { status: 404, headers });
      }
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers
      });
    }
  },

  // Scanner principal de emails
  async scanAllEmails(env) {
    const emails = [
      { address: 'financeiro@planacdivisorias.com.br', type: 'entrada' },
      { address: 'marco@planacdivisorias.com.br', type: 'entrada' },
      { address: 'rodrigo@planacdivisorias.com.br', type: 'entrada' },
      { address: 'planacnotaseboletos@planacdivisorias.com.br', type: 'saida' }
    ];

    const results = [];
    
    for (const email of emails) {
      try {
        const result = await this.scanEmailAccount(email, env);
        results.push(result);
        
        // Update last scan time
        await env.DB.prepare(
          'UPDATE email_configs SET last_scan = ? WHERE email_address = ?'
        ).bind(new Date().toISOString(), email.address).run();
      } catch (error) {
        console.error(`Error scanning ${email.address}:`, error);
        results.push({ email: email.address, error: error.message });
      }
    }

    return results;
  },

  // Scan individual email account
  async scanEmailAccount(emailConfig, env) {
    const { address, type } = emailConfig;
    
    // IMAP configuration
    const imapConfig = {
      host: 'imap.hostinger.com',
      port: 993,
      secure: true,
      auth: {
        user: address,
        pass: env.EMAIL_PASSWORD
      }
    };

    // For production, you'd use a proper IMAP library
    // For now, we'll simulate the connection
    const xmlAttachments = await this.fetchEmailAttachments(imapConfig);
    
    let processed = 0;
    
    for (const xml of xmlAttachments) {
      try {
        const nfeData = await this.parseNFeXML(xml.content);
        await this.saveInvoice(nfeData, type, env);
        processed++;
      } catch (error) {
        console.error(`Error processing XML: ${error.message}`);
      }
    }

    return {
      email: address,
      type,
      processed,
      timestamp: new Date().toISOString()
    };
  },

  // Simulated email fetching (replace with actual IMAP implementation)
  async fetchEmailAttachments(imapConfig) {
    // In production, use node-imap or similar library
    // This is a placeholder for the actual IMAP implementation
    return [];
  },

  // Parse NFe XML
  async parseNFeXML(xmlContent) {
    // Simple XML parsing without external libraries
    const getXMLValue = (xml, tag) => {
      const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
      const match = xml.match(regex);
      return match ? match[1] : '';
    };

    const getNestedValue = (xml, parent, child) => {
      const parentRegex = new RegExp(`<${parent}[^>]*>(.*?)</${parent}>`, 's');
      const parentMatch = xml.match(parentRegex);
      if (parentMatch) {
        return getXMLValue(parentMatch[1], child);
      }
      return '';
    };

    // Extract main NFe data
    const nfeData = {
      nNF: getXMLValue(xmlContent, 'nNF'),
      serie: getXMLValue(xmlContent, 'serie'),
      dhEmi: getXMLValue(xmlContent, 'dhEmi'),
      natOp: getXMLValue(xmlContent, 'natOp'),
      
      // Emitente
      emit_cnpj: getNestedValue(xmlContent, 'emit', 'CNPJ'),
      emit_nome: getNestedValue(xmlContent, 'emit', 'xNome'),
      
      // Destinatário
      dest_cnpj: getNestedValue(xmlContent, 'dest', 'CNPJ'),
      dest_nome: getNestedValue(xmlContent, 'dest', 'xNome'),
      
      // Valores
      vNF: getNestedValue(xmlContent, 'ICMSTot', 'vNF'),
      vProd: getNestedValue(xmlContent, 'ICMSTot', 'vProd'),
      vICMS: getNestedValue(xmlContent, 'ICMSTot', 'vICMS'),
      vST: getNestedValue(xmlContent, 'ICMSTot', 'vST'),
      vPIS: getNestedValue(xmlContent, 'ICMSTot', 'vPIS'),
      vCOFINS: getNestedValue(xmlContent, 'ICMSTot', 'vCOFINS'),
      vFrete: getNestedValue(xmlContent, 'ICMSTot', 'vFrete'),
      vDesc: getNestedValue(xmlContent, 'ICMSTot', 'vDesc'),
      
      // CFOP principal (do primeiro produto)
      CFOP: '',
      
      // Produtos
      produtos: []
    };

    // Extract products
    const prodRegex = /<det[^>]*>(.*?)<\/det>/gs;
    const produtos = xmlContent.matchAll(prodRegex);
    
    for (const prodMatch of produtos) {
      const prodXML = prodMatch[1];
      
      const produto = {
        cProd: getNestedValue(prodXML, 'prod', 'cProd'),
        xProd: getNestedValue(prodXML, 'prod', 'xProd'),
        NCM: getNestedValue(prodXML, 'prod', 'NCM'),
        CFOP: getNestedValue(prodXML, 'prod', 'CFOP'),
        uCom: getNestedValue(prodXML, 'prod', 'uCom'),
        qCom: getNestedValue(prodXML, 'prod', 'qCom'),
        vUnCom: getNestedValue(prodXML, 'prod', 'vUnCom'),
        vProd: getNestedValue(prodXML, 'prod', 'vProd'),
        
        // ICMS
        CST: getNestedValue(prodXML, 'ICMS\\d{2}', 'CST') || getNestedValue(prodXML, 'ICMSSN\\d{3}', 'CSOSN'),
        vBC: getNestedValue(prodXML, 'ICMS\\d{2}', 'vBC'),
        pICMS: getNestedValue(prodXML, 'ICMS\\d{2}', 'pICMS'),
        vICMS: getNestedValue(prodXML, 'ICMS\\d{2}', 'vICMS'),
        
        // ST
        vBCST: getNestedValue(prodXML, 'ICMS\\d{2}', 'vBCST'),
        pICMSST: getNestedValue(prodXML, 'ICMS\\d{2}', 'pICMSST'),
        vICMSST: getNestedValue(prodXML, 'ICMS\\d{2}', 'vICMSST'),
        pMVAST: getNestedValue(prodXML, 'ICMS\\d{2}', 'pMVAST'),
      };
      
      nfeData.produtos.push(produto);
      
      // Set main CFOP from first product
      if (!nfeData.CFOP && produto.CFOP) {
        nfeData.CFOP = produto.CFOP;
      }
    }

    return nfeData;
  },

  // Save invoice to database
  async saveInvoice(nfeData, type, env) {
    const id = crypto.randomUUID();
    
    // Save main invoice
    await env.DB.prepare(`
      INSERT INTO invoices (
        id, invoice_number, cfop, issue_date, type, 
        entity_name, total_invoice, value_icms, value_st
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      nfeData.nNF,
      nfeData.CFOP,
      nfeData.dhEmi,
      type,
      type === 'entrada' ? nfeData.emit_nome : nfeData.dest_nome,
      parseFloat(nfeData.vNF || 0),
      parseFloat(nfeData.vICMS || 0),
      parseFloat(nfeData.vST || 0)
    ).run();

    // Create invoice_items table if not exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        invoice_id TEXT NOT NULL,
        product_code TEXT,
        product_name TEXT,
        ncm TEXT,
        cfop TEXT,
        quantity REAL,
        unit_value REAL,
        total_value REAL,
        icms_value REAL,
        st_value REAL,
        mva REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
      )
    `).run();

    // Save invoice items
    for (const produto of nfeData.produtos) {
      await env.DB.prepare(`
        INSERT INTO invoice_items (
          invoice_id, product_code, product_name, ncm, cfop,
          quantity, unit_value, total_value, icms_value, st_value, mva
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        produto.cProd,
        produto.xProd,
        produto.NCM,
        produto.CFOP,
        parseFloat(produto.qCom || 0),
        parseFloat(produto.vUnCom || 0),
        parseFloat(produto.vProd || 0),
        parseFloat(produto.vICMS || 0),
        parseFloat(produto.vICMSST || 0),
        parseFloat(produto.pMVAST || 0)
      ).run();

      // Update product database with new cost if entrada
      if (type === 'entrada') {
        await this.updateProductCost(produto, env);
      }
    }

    return id;
  },

  // Update product cost based on invoice
  async updateProductCost(produto, env) {
    const existingProduct = await env.DB.prepare(
      'SELECT * FROM products WHERE ncm = ? OR product_code = ?'
    ).bind(produto.NCM, produto.cProd).first();

    if (existingProduct) {
      // Update with weighted average
      const newCost = parseFloat(produto.vUnCom || 0);
      const currentCost = parseFloat(existingProduct.cost_price || 0);
      const avgCost = (currentCost + newCost) / 2;

      await env.DB.prepare(`
        UPDATE products 
        SET cost_price = ?, 
            last_purchase_date = ?,
            last_purchase_value = ?
        WHERE id = ?
      `).bind(
        avgCost,
        new Date().toISOString(),
        newCost,
        existingProduct.id
      ).run();
    } else {
      // Create new product
      await env.DB.prepare(`
        INSERT INTO products (
          product_code, product_name, ncm, cost_price, 
          unit, product_group, has_st
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        produto.cProd,
        produto.xProd,
        produto.NCM,
        parseFloat(produto.vUnCom || 0),
        produto.uCom,
        this.determineProductGroup(produto.NCM),
        produto.vICMSST ? 1 : 0
      ).run();
    }
  },

  // Determine product group based on NCM
  determineProductGroup(ncm) {
    const groups = {
      '2523': 'Cimento e Cal',
      '3214': 'Massas e Selantes',
      '3916': 'Perfis e Acabamentos',
      '3917': 'Tubos e Conexões',
      '3919': 'Fitas e Adesivos',
      '3920': 'Chapas e Películas',
      '3925': 'Acessórios Construção',
      '6809': 'Gesso e Drywall',
      '7308': 'Estruturas Metálicas',
      '7318': 'Parafusos e Fixadores'
    };

    const prefix = ncm.substring(0, 4);
    return groups[prefix] || 'Outros';
  },

  // API Handlers
  async handleManualScan(request, env, headers) {
    const results = await this.scanAllEmails(env);
    return new Response(JSON.stringify({ success: true, results }), { headers });
  },

  async handleGetInvoices(request, env, headers) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('start');
    const endDate = url.searchParams.get('end');
    
    let query = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (startDate) {
      query += ' AND issue_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND issue_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY issue_date DESC LIMIT 100';

    let stmt = env.DB.prepare(query);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }

    const result = await stmt.all();
    
    return new Response(JSON.stringify(result), { headers });
  },

  async handleUploadXML(request, env, headers) {
    const formData = await request.formData();
    const file = formData.get('xml');
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers
      });
    }
    
    const xmlContent = await file.text();
    const nfeData = await this.parseNFeXML(xmlContent);
    
    // Determine type based on CFOP
    const type = nfeData.CFOP.startsWith('1') || nfeData.CFOP.startsWith('2') ? 'entrada' : 'saida';
    
    const invoiceId = await this.saveInvoice(nfeData, type, env);
    
    return new Response(JSON.stringify({ 
      success: true, 
      invoiceId,
      invoice: nfeData 
    }), { headers });
  },

  async handleGetStats(env, headers) {
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN type = 'entrada' THEN 1 END) as total_entrada,
        COUNT(CASE WHEN type = 'saida' THEN 1 END) as total_saida,
        SUM(total_invoice) as total_value,
        SUM(value_icms) as total_icms,
        SUM(value_st) as total_st
      FROM invoices
      WHERE issue_date >= date('now', '-30 days')
    `).first();
    
    const recentScans = await env.DB.prepare(`
      SELECT email_address, last_scan 
      FROM email_configs 
      ORDER BY last_scan DESC
    `).all();
    
    return new Response(JSON.stringify({ 
      stats,
      recentScans: recentScans.results 
    }), { headers });
  },

  async handleConfig(request, env, headers) {
    if (request.method === 'GET') {
      const config = await env.DB.prepare('SELECT * FROM email_configs').all();
      return new Response(JSON.stringify(config.results), { headers });
    }
    
    if (request.method === 'POST') {
      const data = await request.json();
      
      // Update email config
      if (data.email_address) {
        await env.DB.prepare(`
          INSERT OR REPLACE INTO email_configs (email_address, email_type, is_active)
          VALUES (?, ?, ?)
        `).bind(data.email_address, data.email_type, data.is_active).run();
      }
      
      return new Response(JSON.stringify({ success: true }), { headers });
    }
    
    return new Response('Method not allowed', { status: 405, headers });
  },

  // Products API
  async handleProducts(request, env, headers) {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const group = url.searchParams.get('group');

    let query = 'SELECT * FROM products WHERE active = 1';
    const params = [];

    if (search) {
      query += ' AND (code LIKE ? OR name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (group) {
      query += ' AND group_id = ?';
      params.push(parseInt(group));
    }

    query += ' ORDER BY name LIMIT 100';

    let stmt = env.DB.prepare(query);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }

    const result = await stmt.all();

    return new Response(JSON.stringify(result.results || []), { headers });
  },

  async handleProduct(request, env, headers) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response(JSON.stringify({ error: 'Product code required' }), {
        status: 400,
        headers
      });
    }

    const product = await env.DB.prepare(
      'SELECT * FROM products WHERE code = ?'
    ).bind(code).first();

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers
      });
    }

    return new Response(JSON.stringify(product), { headers });
  },

  // Pricing calculator
  async handlePricingCalculate(request, env, headers) {
    const data = await request.json();
    const { productCode, operation, uf, clientType, margin } = data;

    // Get product
    const product = await env.DB.prepare(
      'SELECT * FROM products WHERE code = ?'
    ).bind(productCode).first();

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers
      });
    }

    // Get tax config
    const taxConfig = await env.DB.prepare(
      'SELECT * FROM tax_configs WHERE cfop = ? AND uf_origin = ? AND uf_dest = ?'
    ).bind(operation, 'SP', uf || 'SP').first();

    const cost = parseFloat(product.cost || 0);
    const hasST = product.hasST === 1;

    // Calculate taxes
    let icmsRate = 0;
    let mvaRate = 0;
    let difalRate = 0;

    if (taxConfig) {
      icmsRate = parseFloat(taxConfig.icms_rate || 0);
      mvaRate = parseFloat(taxConfig.mva || 0);
      difalRate = parseFloat(taxConfig.difal_rate || 0);
    }

    // Base calculation
    let price = cost;

    // Add margin
    const marginPercent = parseFloat(margin || 30);
    price = price * (1 + marginPercent / 100);

    // Calculate ICMS
    const icmsValue = hasST ? 0 : price * (icmsRate / 100);

    // Calculate ST
    let stValue = 0;
    if (hasST) {
      const baseCalcST = price * (1 + mvaRate / 100);
      stValue = baseCalcST * (icmsRate / 100);
    }

    // Calculate DIFAL (for interstate)
    let difalValue = 0;
    if (uf && uf !== 'SP') {
      difalValue = price * (difalRate / 100);
    }

    // PIS/COFINS
    const pisValue = price * 0.0165;
    const cofinsValue = price * 0.076;

    // Final price
    const finalPrice = price + icmsValue + stValue + difalValue;

    return new Response(JSON.stringify({
      product: {
        code: product.code,
        name: product.name,
        cost: cost
      },
      calculation: {
        cost: cost.toFixed(2),
        margin: marginPercent.toFixed(2),
        basePrice: price.toFixed(2),
        icms: icmsValue.toFixed(2),
        st: stValue.toFixed(2),
        difal: difalValue.toFixed(2),
        pis: pisValue.toFixed(2),
        cofins: cofinsValue.toFixed(2),
        finalPrice: finalPrice.toFixed(2)
      },
      taxes: {
        icmsRate: icmsRate.toFixed(2),
        mvaRate: mvaRate.toFixed(2),
        difalRate: difalRate.toFixed(2),
        hasST: hasST
      }
    }), { headers });
  },

  // Login API
  async handleLogin(request, env, headers) {
    const data = await request.json();
    const { email, password } = data;

    // Hardcoded credentials for MVP
    const validUsers = [
      { email: 'rodrigo@planacdivisorias.com.br', password: 'Rodelo122509.', name: 'Rodrigo' },
      { email: 'marco@planacdivisorias.com.br', password: 'Rodelo122509.', name: 'Marco' }
    ];

    const user = validUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        email: user.email,
        name: user.name
      }
    }), { headers });
  },

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

  // ============================================
  // EMAIL ROUTING AUXILIARY FUNCTIONS
  // ============================================

  // Register email processing in database
  async registerEmailProcessing(env, data) {
    try {
      // Create table if not exists
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS email_processing_log (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          email_from TEXT,
          email_to TEXT,
          invoice_number TEXT,
          invoice_id TEXT,
          type TEXT,
          status TEXT,
          error_message TEXT,
          processed_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Insert log
      await env.DB.prepare(`
        INSERT INTO email_processing_log (
          email_from, email_to, invoice_number, invoice_id,
          type, status, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.email_from,
        data.email_to,
        data.invoice_number || null,
        data.invoice_id || null,
        data.type,
        data.status,
        data.error_message || null
      ).run();

      console.log('✅ Log de processamento registrado');
    } catch (error) {
      console.error('❌ Erro ao registrar log:', error);
    }
  },

  // Send confirmation email (optional)
  async sendConfirmationEmail(env, recipientEmail, processedCount, errors) {
    // This is a placeholder - you can implement actual email sending
    // using Cloudflare's Email Workers or external services like SendGrid

    const message = {
      from: 'noreply@planacdistribuidora.com.br',
      to: recipientEmail,
      subject: `PLANAC - ${processedCount} nota(s) fiscal(is) processada(s)`,
      text: `
🎉 Processamento de Notas Fiscais Concluído

✅ ${processedCount} XML(s) processado(s) com sucesso
${errors.length > 0 ? `⚠️ ${errors.length} erro(s) encontrado(s)` : ''}

${errors.length > 0 ? '\n❌ Erros:\n' + errors.map(e => `- ${e.file}: ${e.error}`).join('\n') : ''}

Este é um email automático do Sistema PLANAC.
      `.trim()
    };

    console.log('📧 Email de confirmação preparado:', message);

    // TODO: Implement actual email sending
    // For now, just log it
    return message;
  }
};