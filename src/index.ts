#!/usr/bin/env node

/**
 * inFakt MCP Server
 * 
 * A Model Context Protocol server that provides full access to inFakt API
 * Supports invoices, clients, products, payments, and bank accounts with CRUD operations
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { InFaktAPIClient } from './infakt-client.js';

// Load API key from environment
// Note: When using with Claude Desktop, set INFAKT_API_KEY in claude_desktop_config.json
// For local development, you can use a .env file with dotenv-cli: npx dotenv-cli node dist/index.js
const INFAKT_API_KEY = process.env.INFAKT_API_KEY;

if (!INFAKT_API_KEY) {
  console.error('Error: INFAKT_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize inFakt client
const infaktClient = new InFaktAPIClient(INFAKT_API_KEY);

// Create MCP server
const server = new Server(
  {
    name: 'infakt-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ==================== INVOICE TOOLS ====================

const invoiceTools = [
  {
    name: 'list_invoices',
    description: `List all invoices from inFakt with optional filtering.

USAGE GUIDE:
============
Use this to find invoices by:
- Date range (invoice_date_from/to)
- Status (draft, sent, paid)
- Payment status (paid: true/false)
- Search text (q: invoice number, client name, etc.)

COMMON QUERIES:
===============
"Show recent invoices" → No filters, returns last 25
"Show unpaid invoices" → paid: false
"Invoices from October" → invoice_date_from: "2025-10-01", invoice_date_to: "2025-10-31"
"Find invoice for ABC Company" → q: "ABC"

RESPONSE:
=========
Returns array of invoice objects with:
- id (use for get_invoice, update_invoice, etc.)
- invoice_number (e.g., "1/10/2025")
- client_company_name
- net_price, gross_price, tax_price
- status, paid
- dates (invoice_date, sale_date, payment_date)`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results to return (default: 25, max: 100)' },
        offset: { type: 'number', description: 'Number of results to skip for pagination (default: 0)' },
        q: { type: 'string', description: 'Search query: invoice number, client name, NIP, etc.' },
        invoice_date_from: { type: 'string', description: 'Filter by invoice date from (YYYY-MM-DD)' },
        invoice_date_to: { type: 'string', description: 'Filter by invoice date to (YYYY-MM-DD)' },
        sale_date_from: { type: 'string', description: 'Filter by sale date from (YYYY-MM-DD)' },
        sale_date_to: { type: 'string', description: 'Filter by sale date to (YYYY-MM-DD)' },
        status: { type: 'string', description: 'Filter by status: "draft", "sent", "paid", "cancelled"' },
        paid: { type: 'boolean', description: 'Filter by payment status: true (paid) or false (unpaid)' },
      },
    },
  },
  {
    name: 'get_invoice',
    description: 'Get details of a specific invoice by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Invoice ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_invoice',
    description: `Create a new invoice in inFakt system.

CRITICAL PRICE FORMATTING RULES:
================================
unit_net_price MUST be a decimal string with COMMA (Polish format):
  ✅ CORRECT: "500,00", "1800,00", "150,00", "99,50"
  ❌ WRONG: "500.00", "1800.00", "500", "1800", 150, 1800

POLISH NUMBER FORMAT REQUIRED:
- Use COMMA not DOT: "500,00" not "500.00"
- Always 2 decimal places
- This is CRITICAL for Polish API!

STEP-BY-STEP GUIDE:
===================
1. Get client_id from list_clients or get_client
2. Calculate dates:
   - invoice_date: YYYY-MM-DD format (e.g., "2025-10-31")
   - sale_date: Usually same as invoice_date
   - payment_date: Add payment term to invoice_date (e.g., 7 days = "2025-11-07")
3. Format each service with EXACT decimal format:
   {
     "name": "Service description",
     "unit_net_price": "AMOUNT,00",  ← MUST use COMMA not dot!
     "quantity": 1,
     "tax_symbol": 23,  ← VAT rate (23, 8, 5, 0)
     "unit": "usł"  ← Optional: szt, usł, godz, kg, etc.
   }

EXAMPLES:
=========
For 500 PLN netto:
  unit_net_price: "500,00" (NOT "500.00" or "500")

For 1800 PLN netto:
  unit_net_price: "1800,00" (NOT "1800.00" or "1800")

For 150 PLN per hour, 8 hours:
  unit_net_price: "150,00", quantity: 8

PAYMENT METHODS:
================
- "transfer" (przelew)
- "cash" (gotówka)  
- "card" (karta)
- "payu" (PayU)

The API will automatically calculate:
- net_price (unit_net_price × quantity)
- tax_price (net_price × tax_symbol / 100)
- gross_price (net_price + tax_price)`,
    inputSchema: {
      type: 'object',
      properties: {
        invoice_date: { 
          type: 'string', 
          description: 'Invoice issue date in YYYY-MM-DD format (e.g., "2025-10-31")' 
        },
        sale_date: { 
          type: 'string', 
          description: 'Sale/service date in YYYY-MM-DD format. Usually same as invoice_date' 
        },
        payment_date: { 
          type: 'string', 
          description: 'Payment due date in YYYY-MM-DD format (e.g., "2025-11-07" for 7 days from issue)' 
        },
        payment_method: { 
          type: 'string', 
          description: 'Payment method: "transfer", "cash", "card", "payu". In Polish context, usually "transfer"' 
        },
        client_id: { 
          type: 'number', 
          description: 'Client ID from inFakt system. Use list_clients to find it' 
        },
        services: {
          type: 'array',
          description: 'Array of services/products. Each service MUST have unit_net_price with COMMA: "500,00" not "500.00"',
          items: {
            type: 'object',
            properties: {
              name: { 
                type: 'string', 
                description: 'Service/product description (e.g., "Stworzenie strony WWW", "Konsultacje")' 
              },
              tax_symbol: { 
                type: 'number', 
                description: 'VAT rate: 23 (standard), 8, 5, 0, or -1 (exempt). Most common: 23' 
              },
              quantity: { 
                type: 'number', 
                description: 'Quantity (default: 1). Use for hourly rates (e.g., 8 hours) or multiple items' 
              },
              unit_net_price: { 
                type: 'string', 
                description: 'CRITICAL: Unit net price with COMMA (Polish format). Examples: "500,00" for 500 PLN, "1800,00" for 1800 PLN, "150,00" for 150 PLN. NEVER use dots: "500.00" is WRONG! Must be "500,00"' 
              },
              unit: { 
                type: 'string', 
                description: 'Unit of measurement: "szt" (pieces), "usł" (service), "godz" (hours), "kg", "m2", etc. Optional' 
              },
            },
            required: ['name', 'tax_symbol', 'quantity', 'unit_net_price'],
          },
        },
        notes: { 
          type: 'string', 
          description: 'Additional notes on invoice (optional). E.g., "Płatność przelewem", "Termin realizacji: 14 dni"' 
        },
        currency: { 
          type: 'string', 
          description: 'Currency code (default: "PLN"). Usually not needed for Polish clients' 
        },
      },
      required: ['invoice_date', 'sale_date', 'payment_date', 'payment_method', 'client_id', 'services'],
    },
  },
  {
    name: 'update_invoice',
    description: 'Update an existing invoice',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Invoice ID' },
        invoice_date: { type: 'string', description: 'Invoice date (YYYY-MM-DD)' },
        sale_date: { type: 'string', description: 'Sale date (YYYY-MM-DD)' },
        payment_date: { type: 'string', description: 'Payment due date (YYYY-MM-DD)' },
        payment_method: { type: 'string', description: 'Payment method' },
        client_id: { type: 'number', description: 'Client ID' },
        services: {
          type: 'array',
          description: 'Array of services/products',
          items: { type: 'object' },
        },
        notes: { type: 'string', description: 'Additional notes' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_invoice',
    description: 'Delete an invoice by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Invoice ID to delete' },
      },
      required: ['id'],
    },
  },
  {
    name: 'send_invoice',
    description: 'Send an invoice via email',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Invoice ID to send' },
        email: { type: 'string', description: 'Email address (optional, uses client email if not provided)' },
      },
      required: ['id'],
    },
  },
];

// ==================== CLIENT TOOLS ====================

const clientTools = [
  {
    name: 'list_clients',
    description: 'List all clients from inFakt',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results to return' },
        offset: { type: 'number', description: 'Number of results to skip' },
        q: { type: 'string', description: 'Search query string' },
      },
    },
  },
  {
    name: 'get_client',
    description: 'Get details of a specific client by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Client ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_client',
    description: `Create a new client in inFakt system.

REQUIRED FIELDS:
================
- company_name: Full company name or person name
- street: Street name (without number)
- city: City name
- country: Country (usually "Polska" or "Poland")
- postal_code: Format XX-XXX (e.g., "00-001")

OPTIONAL BUT RECOMMENDED:
=========================
- nip: Polish tax ID (10 digits, e.g., "1234567890")
- email: Client email for invoice delivery
- street_number: Building number (can include flat, e.g., "10/5")

EXAMPLES:
=========
Polish company:
{
  "company_name": "ABC Sp. z o.o.",
  "street": "Marszałkowska",
  "street_number": "10",
  "city": "Warszawa",
  "postal_code": "00-001",
  "country": "Polska",
  "nip": "1234567890",
  "email": "kontakt@abc.pl"
}

Individual person:
{
  "company_name": "Jan Kowalski",
  "street": "Główna",
  "street_number": "5",
  "city": "Kraków",
  "postal_code": "30-001",
  "country": "Polska",
  "email": "jan@example.com"
}

TIPS:
=====
- Always ask for NIP if it's a Polish company (required for VAT invoices)
- Email is important for automatic invoice sending
- Use first_name and last_name for individuals (optional)`,
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Company name or person full name (REQUIRED)' },
        first_name: { type: 'string', description: 'First name (for individuals, optional)' },
        last_name: { type: 'string', description: 'Last name (for individuals, optional)' },
        street: { type: 'string', description: 'Street name without number (REQUIRED)' },
        street_number: { type: 'string', description: 'Building number, can include flat (e.g., "10/5")' },
        flat_number: { type: 'string', description: 'Flat/apartment number (if separate from street_number)' },
        city: { type: 'string', description: 'City name (REQUIRED)' },
        country: { type: 'string', description: 'Country name (REQUIRED, e.g., "Polska", "Poland")' },
        postal_code: { type: 'string', description: 'Postal code XX-XXX format (REQUIRED, e.g., "00-001")' },
        nip: { type: 'string', description: 'Polish tax ID - 10 digits (IMPORTANT for companies)' },
        email: { type: 'string', description: 'Email address for invoice delivery (RECOMMENDED)' },
        phone: { type: 'string', description: 'Phone number (optional)' },
        bank_account: { type: 'string', description: 'Bank account number IBAN (optional)' },
        note: { type: 'string', description: 'Internal notes about client (optional)' },
      },
      required: ['company_name', 'street', 'city', 'country', 'postal_code'],
    },
  },
  {
    name: 'update_client',
    description: 'Update an existing client',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Client ID' },
        company_name: { type: 'string', description: 'Company name' },
        first_name: { type: 'string', description: 'First name' },
        last_name: { type: 'string', description: 'Last name' },
        street: { type: 'string', description: 'Street name' },
        city: { type: 'string', description: 'City' },
        postal_code: { type: 'string', description: 'Postal code' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        note: { type: 'string', description: 'Additional notes' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_client',
    description: 'Delete a client by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Client ID to delete' },
      },
      required: ['id'],
    },
  },
];

// ==================== PRODUCT TOOLS ====================

const productTools = [
  {
    name: 'list_products',
    description: 'List all products from inFakt',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results to return' },
        offset: { type: 'number', description: 'Number of results to skip' },
        q: { type: 'string', description: 'Search query string' },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get details of a specific product by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Product ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_product',
    description: 'Create a new product in inFakt',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name' },
        description: { type: 'string', description: 'Product description' },
        quantity: { type: 'number', description: 'Quantity' },
        unit: { type: 'string', description: 'Unit of measurement (e.g., szt, kg, usł)' },
        net_price: { type: 'string', description: 'Net price' },
        tax_symbol: { type: 'number', description: 'Tax rate (e.g., 23 for 23% VAT)' },
      },
      required: ['name', 'quantity', 'net_price', 'tax_symbol'],
    },
  },
  {
    name: 'update_product',
    description: 'Update an existing product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Product ID' },
        name: { type: 'string', description: 'Product name' },
        description: { type: 'string', description: 'Product description' },
        quantity: { type: 'number', description: 'Quantity' },
        unit: { type: 'string', description: 'Unit of measurement' },
        net_price: { type: 'string', description: 'Net price' },
        tax_symbol: { type: 'number', description: 'Tax rate' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_product',
    description: 'Delete a product by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Product ID to delete' },
      },
      required: ['id'],
    },
  },
];

// ==================== BANK ACCOUNT TOOLS ====================

const bankAccountTools = [
  {
    name: 'list_bank_accounts',
    description: 'List all bank accounts from inFakt',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_bank_account',
    description: 'Get details of a specific bank account by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Bank account ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_bank_account',
    description: 'Create a new bank account in inFakt',
    inputSchema: {
      type: 'object',
      properties: {
        bank_name: { type: 'string', description: 'Bank name' },
        account_number: { type: 'string', description: 'Bank account number (IBAN)' },
        swift: { type: 'string', description: 'SWIFT code' },
        default: { type: 'boolean', description: 'Set as default account' },
      },
      required: ['bank_name', 'account_number'],
    },
  },
  {
    name: 'update_bank_account',
    description: 'Update an existing bank account',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Bank account ID' },
        bank_name: { type: 'string', description: 'Bank name' },
        account_number: { type: 'string', description: 'Bank account number' },
        swift: { type: 'string', description: 'SWIFT code' },
        default: { type: 'boolean', description: 'Set as default account' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_bank_account',
    description: 'Delete a bank account by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Bank account ID to delete' },
      },
      required: ['id'],
    },
  },
];

// ==================== PAYMENT TOOLS ====================

const paymentTools = [
  {
    name: 'list_payments',
    description: 'List all payments from inFakt',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results to return' },
        offset: { type: 'number', description: 'Number of results to skip' },
        invoice_id: { type: 'number', description: 'Filter by invoice ID' },
      },
    },
  },
  {
    name: 'get_payment',
    description: 'Get details of a specific payment by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Payment ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_payment',
    description: 'Create a new payment record in inFakt',
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: { type: 'number', description: 'Invoice ID this payment is for' },
        paid_date: { type: 'string', description: 'Payment date (YYYY-MM-DD)' },
        paid_price: { type: 'string', description: 'Amount paid' },
        payment_method: { type: 'string', description: 'Payment method (e.g., transfer, cash, card)' },
        description: { type: 'string', description: 'Payment description' },
      },
      required: ['invoice_id', 'paid_date', 'paid_price', 'payment_method'],
    },
  },
];

// Combine all tools
const allTools = [
  ...invoiceTools,
  ...clientTools,
  ...productTools,
  ...bankAccountTools,
  ...paymentTools,
];

// ==================== HANDLERS ====================

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Invoice handlers
    if (name === 'list_invoices') {
      const invoices = await infaktClient.listInvoices((args || {}) as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(invoices, null, 2),
          },
        ],
      };
    }

    if (name === 'get_invoice') {
      const invoice = await infaktClient.getInvoice((args?.id || 0) as number);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(invoice, null, 2),
          },
        ],
      };
    }

    if (name === 'create_invoice') {
      const invoice = await infaktClient.createInvoice((args || {}) as any);
      return {
        content: [
          {
            type: 'text',
            text: `Invoice created successfully:\n${JSON.stringify(invoice, null, 2)}`,
          },
        ],
      };
    }

    if (name === 'update_invoice') {
      const { id, ...updateData } = (args || {}) as any;
      const invoice = await infaktClient.updateInvoice(id, updateData);
      return {
        content: [
          {
            type: 'text',
            text: `Invoice updated successfully:\n${JSON.stringify(invoice, null, 2)}`,
          },
        ],
      };
    }

    if (name === 'delete_invoice') {
      await infaktClient.deleteInvoice((args?.id || 0) as number);
      return {
        content: [
          {
            type: 'text',
            text: `Invoice ${args?.id || 0} deleted successfully`,
          },
        ],
      };
    }

    if (name === 'send_invoice') {
      await infaktClient.sendInvoice((args?.id || 0) as number, args?.email as string | undefined);
      return {
        content: [
          {
            type: 'text',
            text: `Invoice ${args?.id || 0} sent successfully via email`,
          },
        ],
      };
    }

    // Client handlers
    if (name === 'list_clients') {
      const clients = await infaktClient.listClients((args || {}) as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(clients, null, 2),
          },
        ],
      };
    }

    if (name === 'get_client') {
      const client = await infaktClient.getClient((args?.id || 0) as number);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(client, null, 2),
          },
        ],
      };
    }

    if (name === 'create_client') {
      const client = await infaktClient.createClient((args || {}) as any);
      return {
        content: [
          {
            type: 'text',
            text: `Client created successfully:\n${JSON.stringify(client, null, 2)}`,
          },
        ],
      };
    }

    if (name === 'update_client') {
      const { id, ...updateData } = (args || {}) as any;
      const client = await infaktClient.updateClient(id, updateData);
      return {
        content: [
          {
            type: 'text',
            text: `Client updated successfully:\n${JSON.stringify(client, null, 2)}`,
          },
        ],
      };
    }

    if (name === 'delete_client') {
      await infaktClient.deleteClient((args?.id || 0) as number);
      return {
        content: [
          {
            type: 'text',
            text: `Client ${args?.id || 0} deleted successfully`,
          },
        ],
      };
    }

    // Product handlers
    if (name === 'list_products') {
      const products = await infaktClient.listProducts((args || {}) as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(products, null, 2),
          },
        ],
      };
    }

    if (name === 'get_product') {
      const product = await infaktClient.getProduct((args?.id || 0) as number);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(product, null, 2),
          },
        ],
      };
    }

    if (name === 'create_product') {
      const product = await infaktClient.createProduct((args || {}) as any);
      return {
        content: [
          {
            type: 'text',
            text: `Product created successfully:\n${JSON.stringify(product, null, 2)}`,
          },
        ],
      };
    }

    if (name === 'update_product') {
      const { id, ...updateData } = (args || {}) as any;
      const product = await infaktClient.updateProduct(id, updateData);
      return {
        content: [
          {
            type: 'text',
            text: `Product updated successfully:\n${JSON.stringify(product, null, 2)}`,
          },
        ],
      };
    }

    if (name === 'delete_product') {
      await infaktClient.deleteProduct((args?.id || 0) as number);
      return {
        content: [
          {
            type: 'text',
            text: `Product ${args?.id || 0} deleted successfully`,
          },
        ],
      };
    }

    // Bank account handlers
    if (name === 'list_bank_accounts') {
      const accounts = await infaktClient.listBankAccounts();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(accounts, null, 2),
          },
        ],
      };
    }

    if (name === 'get_bank_account') {
      const account = await infaktClient.getBankAccount((args?.id || 0) as number);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(account, null, 2),
          },
        ],
      };
    }

    if (name === 'create_bank_account') {
      const account = await infaktClient.createBankAccount((args || {}) as any);
      return {
        content: [
          {
            type: 'text',
            text: `Bank account created successfully:\n${JSON.stringify(account, null, 2)}`,
          },
        ],
      };
    }

    if (name === 'update_bank_account') {
      const { id, ...updateData } = (args || {}) as any;
      const account = await infaktClient.updateBankAccount(id, updateData);
      return {
        content: [
          {
            type: 'text',
            text: `Bank account updated successfully:\n${JSON.stringify(account, null, 2)}`,
          },
        ],
      };
    }

    if (name === 'delete_bank_account') {
      await infaktClient.deleteBankAccount((args?.id || 0) as number);
      return {
        content: [
          {
            type: 'text',
            text: `Bank account ${args?.id || 0} deleted successfully`,
          },
        ],
      };
    }

    // Payment handlers
    if (name === 'list_payments') {
      const payments = await infaktClient.listPayments((args || {}) as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(payments, null, 2),
          },
        ],
      };
    }

    if (name === 'get_payment') {
      const payment = await infaktClient.getPayment((args?.id || 0) as number);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(payment, null, 2),
          },
        ],
      };
    }

    if (name === 'create_payment') {
      const payment = await infaktClient.createPayment((args || {}) as any);
      return {
        content: [
          {
            type: 'text',
            text: `Payment created successfully:\n${JSON.stringify(payment, null, 2)}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// ==================== START SERVER ====================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('inFakt MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

