/**
 * API Client para o Sistema de Precificação PLANAC
 * Conecta o frontend ao Worker do Cloudflare
 */

const API_BASE_URL = 'https://precplanac.planacacabamentos.workers.dev/api';

class PlanacAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Login
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login falhou');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Buscar produtos
   */
  async getProducts(search = '', group = null) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (group) params.append('group', group);

      const response = await fetch(`${this.baseUrl}/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }

      return await response.json();
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  /**
   * Buscar produto específico por código
   */
  async getProduct(code) {
    try {
      const response = await fetch(`${this.baseUrl}/product?code=${encodeURIComponent(code)}`);

      if (!response.ok) {
        throw new Error('Produto não encontrado');
      }

      return await response.json();
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  /**
   * Calcular precificação
   */
  async calculatePricing(productCode, operation, uf, clientType, margin) {
    try {
      const response = await fetch(`${this.baseUrl}/pricing/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productCode,
          operation,
          uf,
          clientType,
          margin
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao calcular preço');
      }

      return await response.json();
    } catch (error) {
      console.error('Calculate pricing error:', error);
      throw error;
    }
  }

  /**
   * Buscar notas fiscais
   */
  async getInvoices(type = null, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const response = await fetch(`${this.baseUrl}/invoices?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar notas fiscais');
      }

      return await response.json();
    } catch (error) {
      console.error('Get invoices error:', error);
      throw error;
    }
  }

  /**
   * Upload de XML de nota fiscal
   */
  async uploadXML(file) {
    try {
      const formData = new FormData();
      formData.append('xml', file);

      const response = await fetch(`${this.baseUrl}/invoice/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar XML');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload XML error:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas
   */
  async getStats() {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }

      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  /**
   * Trigger manual de scan de emails
   */
  async manualScan() {
    try {
      const response = await fetch(`${this.baseUrl}/scan`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Erro ao executar scan');
      }

      return await response.json();
    } catch (error) {
      console.error('Manual scan error:', error);
      throw error;
    }
  }

  /**
   * Buscar configurações
   */
  async getConfig() {
    try {
      const response = await fetch(`${this.baseUrl}/config`);

      if (!response.ok) {
        throw new Error('Erro ao buscar configurações');
      }

      return await response.json();
    } catch (error) {
      console.error('Get config error:', error);
      throw error;
    }
  }

  /**
   * Atualizar configurações
   */
  async updateConfig(config) {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar configurações');
      }

      return await response.json();
    } catch (error) {
      console.error('Update config error:', error);
      throw error;
    }
  }
}

// Exportar instância global
const api = new PlanacAPI();
