/**
 * inFakt API Client
 * Handles all HTTP requests to the inFakt API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
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
      const response = await this.client.get('/invoices.json', { params });
      return response.data;
    } catch (error) {
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
      const response = await this.client.post('/invoices.json', { invoice: data });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateInvoice(id: number, data: Partial<CreateInvoiceParams>): Promise<Invoice> {
    try {
      const response = await this.client.put(`/invoices/${id}.json`, { invoice: data });
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
      const response = await this.client.get('/clients.json', { params });
      return response.data;
    } catch (error) {
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
      const response = await this.client.get('/products.json', { params });
      return response.data;
    } catch (error) {
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

