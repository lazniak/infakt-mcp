# inFakt MCP Server

A comprehensive Model Context Protocol (MCP) server providing full integration with the inFakt API. This server enables AI assistants like Claude to interact with inFakt's invoicing and accounting platform.

## Features

This MCP server provides complete CRUD operations for:

- **Invoices** - Create, read, update, delete, and send invoices
- **Clients** - Manage customer/client information
- **Products** - Manage your product/service catalog
- **Bank Accounts** - Manage company bank account details
- **Payments** - Track and record payments

## Prerequisites

- Node.js 18 or higher
- An inFakt account with API access
- inFakt API key ([Get your API key](https://app.infakt.pl/app/ustawienia/inne_opcje/api))

## Installation

### Clone and Install

```bash
git clone https://github.com/lazniak/infakt-mcp.git
cd infakt-mcp
npm install
```

### Build

```bash
npm run build
```

**Note:** The server now supports loading API keys from `.env` files when running locally using `npm run dev` (which uses dotenv-cli). For Claude Desktop integration, always set the API key in `claude_desktop_config.json`.

## Configuration

### 1. Set up your API key

**For Claude Desktop:** Set the API key in your Claude Desktop configuration (see step 2 below).

**For local development/testing:** Create a `.env` file in the project root:

```bash
cp env.example .env
```

Edit `.env` and add your inFakt API key:

```
INFAKT_API_KEY=your_actual_api_key_here
```

Then run with: `npm run dev`

### 2. Configure Claude Desktop

Add this server to your Claude Desktop configuration file:

**On macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**On Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "infakt": {
      "command": "node",
      "args": [
        "A:\\code\\inFakt-mpc\\dist\\index.js"
      ],
      "env": {
        "INFAKT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Note:** Replace the path with the actual path to your installation.

**Important:** The API key MUST be set in the `env` section of the configuration above. The server does not use `.env` files when running through Claude Desktop (to avoid stdio conflicts).

### 3. Restart Claude Desktop

After updating the configuration, restart Claude Desktop to load the MCP server.

## Available Tools

### Invoice Operations

- `list_invoices` - List all invoices with optional filters
  - Filters: date ranges, status, paid status, search query
- `get_invoice` - Get detailed information about a specific invoice
- `create_invoice` - Create a new invoice
- `update_invoice` - Update an existing invoice
- `delete_invoice` - Delete an invoice
- `send_invoice` - Send an invoice via email

### Client Operations

- `list_clients` - List all clients with pagination
- `get_client` - Get detailed information about a specific client
- `create_client` - Create a new client
- `update_client` - Update an existing client
- `delete_client` - Delete a client

### Product Operations

- `list_products` - List all products with pagination
- `get_product` - Get detailed information about a specific product
- `create_product` - Create a new product
- `update_product` - Update an existing product
- `delete_product` - Delete a product

### Bank Account Operations

- `list_bank_accounts` - List all bank accounts
- `get_bank_account` - Get detailed information about a specific bank account
- `create_bank_account` - Create a new bank account
- `update_bank_account` - Update an existing bank account
- `delete_bank_account` - Delete a bank account

### Payment Operations

- `list_payments` - List all payments with optional filters
- `get_payment` - Get detailed information about a specific payment
- `create_payment` - Create a new payment record

## Usage Examples

Once configured with Claude Desktop, you can use natural language to interact with your inFakt account:

### Example Prompts

**List recent invoices:**
> "Show me all invoices from the last month"

**Create a new invoice:**
> "Create an invoice for client ID 123 dated today with one service: Web Development, 8 hours at 500 PLN per hour, 23% VAT"

**Find a client:**
> "Find client information for 'ABC Company'"

**Create a new client:**
> "Add a new client: XYZ Corp, street: Główna 10, city: Warsaw, postal code: 00-001, country: Poland, NIP: 1234567890"

**Check payments:**
> "Show me all payments for invoice 456"

**Send an invoice:**
> "Send invoice 789 via email to [email protected]"

## Development

### Build and Watch

For development with automatic rebuilding:

```bash
npm run watch
```

### Run Locally

```bash
npm run dev
```

## Project Structure

```
infakt-mcp/
├── src/
│   ├── index.ts          # Main MCP server implementation
│   ├── infakt-client.ts  # inFakt API client wrapper
│   └── types.ts          # TypeScript type definitions
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── env.example           # Example environment variables
└── README.md
```

## API Documentation

For detailed information about the inFakt API, visit:
- [inFakt API Documentation](https://docs.infakt.pl/)
- [inFakt Help Center](https://pomoc.infakt.pl/hc/pl/articles/115000174410-API)

## Model Context Protocol

Learn more about MCP:
- [MCP Official Website](https://modelcontextprotocol.io/)
- [MCP Announcement](https://www.anthropic.com/news/model-context-protocol)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)

## Troubleshooting

### Server not appearing in Claude

1. Check that the path in `claude_desktop_config.json` is correct
2. Ensure the project is built (`npm run build`)
3. Verify your API key is set correctly
4. Restart Claude Desktop completely
5. Check Claude's log files for errors

### API Errors

- **401 Unauthorized**: Check your API key is correct
- **404 Not Found**: Verify the resource ID exists
- **422 Unprocessable Entity**: Check required fields in your request

### Getting Logs

Claude Desktop logs can be found at:
- **macOS**: `~/Library/Logs/Claude/`
- **Windows**: `%APPDATA%\Claude\logs\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this in your own projects.

## Support

For issues related to:
- **This MCP server**: [Open an issue on GitHub](https://github.com/lazniak/infakt-mcp/issues)
- **inFakt API**: Contact inFakt support
- **Claude/MCP**: Refer to Anthropic's documentation

## Author

Created by [lazniak](https://github.com/lazniak)

## Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Integrates with [inFakt API](https://docs.infakt.pl/)
- Inspired by Anthropic's vision for connected AI systems

