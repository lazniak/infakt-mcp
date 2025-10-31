/**
 * TypeScript type definitions for inFakt API entities
 */

// Common types
export interface PaginationParams {
  limit?: number;
  offset?: number;
  q?: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  message: string;
}

// Invoice types
export interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  client_company_name: string;
  invoice_date: string;
  sale_date: string;
  payment_date: string;
  payment_method: string;
  status: string;
  paid_price: string;
  net_price: string;
  gross_price: string;
  tax_price: string;
  currency: string;
  notes?: string;
  services: InvoiceService[];
  recipient_signature?: string;
  buyer_signature?: string;
  paid: boolean;
}

export interface InvoiceService {
  id?: number;
  name: string;
  tax_symbol: number;
  quantity: number;
  unit_net_price: string;
  net_price: string;
  gross_price: string;
  tax_price: string;
  unit?: string;
}

export interface CreateInvoiceParams {
  invoice_date: string;
  sale_date: string;
  payment_date: string;
  payment_method: string;
  client_id: number;
  services: InvoiceService[];
  notes?: string;
  currency?: string;
  kind?: string;
}

export interface UpdateInvoiceParams extends Partial<CreateInvoiceParams> {
  id: number;
}

export interface InvoiceListParams extends PaginationParams {
  invoice_date_from?: string;
  invoice_date_to?: string;
  sale_date_from?: string;
  sale_date_to?: string;
  status?: string;
  paid?: boolean;
}

// Client types
export interface Client {
  id: number;
  company_name: string;
  first_name?: string;
  last_name?: string;
  street: string;
  street_number?: string;
  flat_number?: string;
  city: string;
  country: string;
  postal_code: string;
  nip?: string;
  email?: string;
  phone?: string;
  bank_account?: string;
  note?: string;
}

export interface CreateClientParams {
  company_name: string;
  first_name?: string;
  last_name?: string;
  street: string;
  street_number?: string;
  flat_number?: string;
  city: string;
  country: string;
  postal_code: string;
  nip?: string;
  email?: string;
  phone?: string;
  bank_account?: string;
  note?: string;
}

export interface UpdateClientParams extends Partial<CreateClientParams> {
  id: number;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  net_price: string;
  tax_symbol: number;
  gross_price: string;
}

export interface CreateProductParams {
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  net_price: string;
  tax_symbol: number;
}

export interface UpdateProductParams extends Partial<CreateProductParams> {
  id: number;
}

// Bank Account types
export interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  swift?: string;
  default: boolean;
}

export interface CreateBankAccountParams {
  bank_name: string;
  account_number: string;
  swift?: string;
  default?: boolean;
}

export interface UpdateBankAccountParams extends Partial<CreateBankAccountParams> {
  id: number;
}

// Payment types
export interface Payment {
  id: number;
  invoice_id: number;
  paid_date: string;
  paid_price: string;
  payment_method: string;
  description?: string;
}

export interface CreatePaymentParams {
  invoice_id: number;
  paid_date: string;
  paid_price: string;
  payment_method: string;
  description?: string;
}

export interface PaymentListParams extends PaginationParams {
  invoice_id?: number;
}

