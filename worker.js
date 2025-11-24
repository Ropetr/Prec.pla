// Worker para Scanner de Emails e Processamento de Notas Fiscais
// PLANAC - Sistema de Precificação

export default {
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
        pass: 'Rodelo122509.'
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
    
    const stmt = env.DB.prepare(query);
    if (params.length > 0) {
      stmt.bind(...params);
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
  }
};