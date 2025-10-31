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
    description: 'List all invoices with optional filters. Returns a list of invoices from inFakt.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results to return (default: 25)' },
        offset: { type: 'number', description: 'Number of results to skip (default: 0)' },
        q: { type: 'string', description: 'Search query string' },
        invoice_date_from: { type: 'string', description: 'Filter by invoice date from (YYYY-MM-DD)' },
        invoice_date_to: { type: 'string', description: 'Filter by invoice date to (YYYY-MM-DD)' },
        sale_date_from: { type: 'string', description: 'Filter by sale date from (YYYY-MM-DD)' },
        sale_date_to: { type: 'string', description: 'Filter by sale date to (YYYY-MM-DD)' },
        status: { type: 'string', description: 'Filter by status (e.g., draft, sent, paid)' },
        paid: { type: 'boolean', description: 'Filter by paid status' },
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
    description: 'Create a new invoice in inFakt. The API automatically calculates net_price, gross_price, and tax_price based on unit_net_price, quantity, and tax_symbol. IMPORTANT: unit_net_price must be provided as a decimal string (e.g., "1800.00" for 1800 PLN, not "1800").',
    inputSchema: {
      type: 'object',
      properties: {
        invoice_date: { type: 'string', description: 'Invoice date (YYYY-MM-DD)' },
        sale_date: { type: 'string', description: 'Sale date (YYYY-MM-DD)' },
        payment_date: { type: 'string', description: 'Payment due date (YYYY-MM-DD)' },
        payment_method: { type: 'string', description: 'Payment method (e.g., transfer, cash, card)' },
        client_id: { type: 'number', description: 'Client ID' },
        services: {
          type: 'array',
          description: 'Array of services/products on the invoice',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Service/product name' },
              tax_symbol: { type: 'number', description: 'Tax rate (e.g., 23 for 23% VAT)' },
              quantity: { type: 'number', description: 'Quantity' },
              unit_net_price: { type: 'string', description: 'Unit net price as decimal string (e.g., "1800.00" not "1800"). API will calculate total amounts.' },
              unit: { type: 'string', description: 'Unit of measurement (e.g., szt, usł)' },
            },
            required: ['name', 'tax_symbol', 'quantity', 'unit_net_price'],
          },
        },
        notes: { type: 'string', description: 'Additional notes' },
        currency: { type: 'string', description: 'Currency code (default: PLN)' },
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
    description: 'Create a new client in inFakt',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Company name' },
        first_name: { type: 'string', description: 'First name' },
        last_name: { type: 'string', description: 'Last name' },
        street: { type: 'string', description: 'Street name' },
        street_number: { type: 'string', description: 'Street number' },
        flat_number: { type: 'string', description: 'Flat number' },
        city: { type: 'string', description: 'City' },
        country: { type: 'string', description: 'Country' },
        postal_code: { type: 'string', description: 'Postal code' },
        nip: { type: 'string', description: 'Tax ID (NIP)' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        bank_account: { type: 'string', description: 'Bank account number' },
        note: { type: 'string', description: 'Additional notes' },
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

