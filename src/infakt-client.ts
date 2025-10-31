/**
 * inFakt API Client
 * Handles all HTTP requests to the inFakt API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type {
  Invoice,
  InvoiceListParams,
  CreateInvoiceParams,
  UpdateInvoiceParams,
  Client,
  CreateClientParams,
  UpdateClientParams,
  Product,
  CreateProductParams,
  UpdateProductParams,
  BankAccount,
  CreateBankAccountParams,
  UpdateBankAccountParams,
  Payment,
  CreatePaymentParams,
  PaymentListParams,
  PaginationParams,
} from './types.js';

/**
 * Format price to ensure it has 2 decimal places with COMMA (Polish format)
 * API inFakt requires Polish number format: 500,00 not 500.00
 */
function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    throw new Error(`Invalid price value: ${price}`);
  }
  
  // Format with 2 decimals and replace dot with COMMA (Polish format)
  return numPrice.toFixed(2).replace('.', ',');
}

/**
 * Log to file for debugging
 */
const logFile = join(homedir(), 'infakt-mcp-debug.log');
function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  try {
    appendFileSync(logFile, logMessage);
  } catch (error) {
    // Ignore file write errors
  }
}

// Log startup
debugLog('inFakt MCP Client initialized');

/**
 * Normalize invoice services to ensure proper price formatting
 * Also calculates net_price, gross_price, and tax_price if not provided
 */
function normalizeInvoiceServices(services: any[]): any[] {
  return services.map(service => {
    const unitNetPrice = parseFloat(formatPrice(service.unit_net_price));
    const quantity = service.quantity || 1;
    const taxRate = service.tax_symbol / 100;
    
    // Calculate all prices
    const netPrice = unitNetPrice * quantity;
    const taxPrice = netPrice * taxRate;
    const grossPrice = netPrice + taxPrice;
    
    debugLog('Normalizing service', {
      input: service,
      calculated: {
        unitNetPrice,
        quantity,
        taxRate,
        netPrice,
        taxPrice,
        grossPrice
      }
    });
    
    return {
      ...service,
      unit_net_price: formatPrice(unitNetPrice),
      quantity: quantity,
      net_price: formatPrice(netPrice),
      gross_price: formatPrice(grossPrice),
      tax_price: formatPrice(taxPrice),
    };
  });
}

export class InFaktAPIClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://api.infakt.pl/v3',
      headers: {
        'X-inFakt-ApiKey': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Handle API errors and format them nicely
   */
  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data as any;
      
      const errorMessage = data?.error || data?.message || axiosError.message;
      throw new Error(`inFakt API Error (${status}): ${errorMessage}`);
    }
    throw error;
  }

  // ==================== INVOICE METHODS ====================

  async listInvoices(params?: InvoiceListParams): Promise<Invoice[]> {
    try {
      // Set default limit to avoid overwhelming the API
      const safeParams = {
        limit: 25,  // Default to 25 instead of unlimited
        ...params
      };
      
      debugLog('list_invoices called with params:', safeParams);
      const response = await this.client.get('/invoices.json', { params: safeParams });
      debugLog('list_invoices response:', { count: response.data?.length });
      return response.data;
    } catch (error) {
      debugLog('ERROR list_invoices:', error);
      this.handleError(error);
    }
  }

  async getInvoice(id: number): Promise<Invoice> {
    try {
      const response = await this.client.get(`/invoices/${id}.json`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createInvoice(data: CreateInvoiceParams): Promise<Invoice> {
    try {
      debugLog('=== CREATE INVOICE CALLED ===');
      debugLog('Input data:', data);
      
      // Normalize services to ensure proper price formatting
      const normalizedData = {
        ...data,
        services: normalizeInvoiceServices(data.services),
      };
      
      debugLog('Normalized data:', normalizedData);
      debugLog('FULL REQUEST BODY to API:', { invoice: normalizedData });
      
      const response = await this.client.post('/invoices.json', { invoice: normalizedData });
      
      debugLog('API Response:', response.data);
      debugLog('Invoice created - Net price from API:', response.data.net_price);
      
      return response.data;
    } catch (error) {
      debugLog('ERROR creating invoice:', error);
      this.handleError(error);
    }
  }

  async updateInvoice(id: number, data: Partial<CreateInvoiceParams>): Promise<Invoice> {
    try {
      // Normalize services if they are being updated
      const normalizedData = data.services 
        ? { ...data, services: normalizeInvoiceServices(data.services) }
        : data;
        
      const response = await this.client.put(`/invoices/${id}.json`, { invoice: normalizedData });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteInvoice(id: number): Promise<void> {
    try {
      await this.client.delete(`/invoices/${id}.json`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async sendInvoice(id: number, email?: string): Promise<void> {
    try {
      const data = email ? { email } : {};
      await this.client.post(`/invoices/${id}/deliver_via_email.json`, data);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== CLIENT METHODS ====================

  async listClients(params?: PaginationParams): Promise<Client[]> {
    try {
      // Set default limit to avoid overwhelming the API
      const safeParams = {
        limit: 25,  // Default to 25 instead of unlimited
        ...params
      };
      
      debugLog('list_clients called with params:', safeParams);
      const response = await this.client.get('/clients.json', { params: safeParams });
      debugLog('list_clients response:', { count: response.data?.length });
      return response.data;
    } catch (error) {
      debugLog('ERROR list_clients:', error);
      this.handleError(error);
    }
  }

  async getClient(id: number): Promise<Client> {
    try {
      const response = await this.client.get(`/clients/${id}.json`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createClient(data: CreateClientParams): Promise<Client> {
    try {
      const response = await this.client.post('/clients.json', { client: data });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateClient(id: number, data: Partial<CreateClientParams>): Promise<Client> {
    try {
      const response = await this.client.put(`/clients/${id}.json`, { client: data });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteClient(id: number): Promise<void> {
    try {
      await this.client.delete(`/clients/${id}.json`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== PRODUCT METHODS ====================

  async listProducts(params?: PaginationParams): Promise<Product[]> {
    try {
      // Set default limit to avoid overwhelming the API
      const safeParams = {
        limit: 25,
        ...params
      };
      
      debugLog('list_products called with params:', safeParams);
      const response = await this.client.get('/products.json', { params: safeParams });
      debugLog('list_products response:', { count: response.data?.length });
      return response.data;
    } catch (error) {
      debugLog('ERROR list_products:', error);
      this.handleError(error);
    }
  }

  async getProduct(id: number): Promise<Product> {
    try {
      const response = await this.client.get(`/products/${id}.json`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createProduct(data: CreateProductParams): Promise<Product> {
    try {
      const response = await this.client.post('/products.json', { product: data });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProduct(id: number, data: Partial<CreateProductParams>): Promise<Product> {
    try {
      const response = await this.client.put(`/products/${id}.json`, { product: data });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await this.client.delete(`/products/${id}.json`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== BANK ACCOUNT METHODS ====================

  async listBankAccounts(): Promise<BankAccount[]> {
    try {
      const response = await this.client.get('/bank_accounts.json');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getBankAccount(id: number): Promise<BankAccount> {
    try {
      const response = await this.client.get(`/bank_accounts/${id}.json`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createBankAccount(data: CreateBankAccountParams): Promise<BankAccount> {
    try {
      const response = await this.client.post('/bank_accounts.json', { bank_account: data });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateBankAccount(id: number, data: Partial<CreateBankAccountParams>): Promise<BankAccount> {
    try {
      const response = await this.client.put(`/bank_accounts/${id}.json`, { bank_account: data });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteBankAccount(id: number): Promise<void> {
    try {
      await this.client.delete(`/bank_accounts/${id}.json`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== PAYMENT METHODS ====================

  async listPayments(params?: PaymentListParams): Promise<Payment[]> {
    try {
      const response = await this.client.get('/payments.json', { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPayment(id: number): Promise<Payment> {
    try {
      const response = await this.client.get(`/payments/${id}.json`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createPayment(data: CreatePaymentParams): Promise<Payment> {
    try {
      const response = await this.client.post('/payments.json', { payment: data });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

