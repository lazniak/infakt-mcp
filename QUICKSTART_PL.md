# inFakt MCP Server - Szybki Start

## Czym jest ten projekt?

To w pełni funkcjonalny serwer Model Context Protocol (MCP) dla API inFakt, który umożliwia asystentom AI (jak Claude) bezpośrednią integrację z systemem inFakt.

## Możliwości

### ✅ Faktury
- Wyświetlanie listy faktur z filtrami
- Pobieranie szczegółów faktury
- Tworzenie nowych faktur
- Aktualizacja istniejących faktur
- Usuwanie faktur
- Wysyłanie faktur e-mailem

### ✅ Klienci
- Lista wszystkich klientów
- Szczegóły klienta
- Dodawanie nowych klientów
- Edycja danych klientów
- Usuwanie klientów

### ✅ Produkty
- Katalog produktów/usług
- Tworzenie produktów
- Edycja produktów
- Usuwanie produktów

### ✅ Konta bankowe
- Lista kont bankowych
- Zarządzanie kontami
- Ustawianie konta domyślnego

### ✅ Płatności
- Historia płatności
- Rejestrowanie nowych płatności
- Filtrowanie po fakturach

## Instalacja - Krok po kroku

### 1. Pobierz kod

```bash
git clone https://github.com/lazniak/infakt-mcp.git
cd infakt-mcp
```

### 2. Zainstaluj zależności

```bash
npm install
```

### 3. Zbuduj projekt

```bash
npm run build
```

### 4. Pobierz klucz API z inFakt

1. Zaloguj się do inFakt: https://app.infakt.pl
2. Przejdź do: Ustawienia → Integracje
3. Skopiuj swój klucz API
4. Link bezpośredni: https://app.infakt.pl/app/ustawienia.integrations.html

### 5. Skonfiguruj klucz API

Utwórz plik `.env` w katalogu głównym projektu:

```
INFAKT_API_KEY=twoj_klucz_api_tutaj
```

**Uwaga:** Możesz też użyć `.env.local` - oba pliki są automatycznie wczytywane przez serwer.

### 6. Skonfiguruj Claude Desktop

Edytuj plik konfiguracyjny Claude Desktop:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Dodaj:

```json
{
  "mcpServers": {
    "infakt": {
      "command": "node",
      "args": [
        "A:\\code\\inFakt-mpc\\dist\\index.js"
      ],
      "env": {
        "INFAKT_API_KEY": "twoj_klucz_api_tutaj"
      }
    }
  }
}
```

**⚠️ WAŻNE:** Zmień ścieżkę `A:\\code\\inFakt-mpc\\dist\\index.js` na rzeczywistą ścieżkę do swojego projektu!

### 7. Uruchom Claude Desktop

Uruchom ponownie aplikację Claude Desktop. Serwer inFakt będzie automatycznie dostępny.

## Przykłady użycia

Po skonfigurowaniu możesz używać naturalnego języka w Claude:

### Faktury
- "Pokaż wszystkie faktury z października 2025"
- "Utwórz fakturę dla klienta o ID 123 z usługą: Tworzenie stron WWW, 8 godzin po 500 zł, VAT 23%"
- "Wyślij fakturę 456 na adres [email protected]"
- "Pokaż niezapłacone faktury"

### Klienci
- "Znajdź dane klienta ABC Firma"
- "Dodaj nowego klienta: XYZ Sp. z o.o., ul. Główna 10, Warszawa, 00-001, NIP: 1234567890"
- "Pokaż wszystkich klientów z Warszawy"

### Produkty
- "Dodaj produkt: Hosting WWW, 100 zł miesięcznie, VAT 23%"
- "Pokaż wszystkie produkty"
- "Zaktualizuj cenę produktu o ID 5 na 150 zł"

### Płatności
- "Pokaż wszystkie płatności dla faktury 789"
- "Zarejestruj płatność 500 zł dla faktury 123, data dzisiejsza, przelew"

## Wsparcie techniczne

### Rozwiązywanie problemów

**Serwer nie pojawia się w Claude:**
1. Sprawdź ścieżkę w `claude_desktop_config.json`
2. Upewnij się, że projekt jest zbudowany (`npm run build`)
3. Zweryfikuj klucz API
4. Uruchom ponownie Claude Desktop
5. Sprawdź logi Claude (patrz poniżej)

**Błędy API:**
- **401 Unauthorized**: Nieprawidłowy klucz API
- **404 Not Found**: Zasób o podanym ID nie istnieje
- **422 Unprocessable Entity**: Sprawdź wymagane pola w żądaniu

### Logi Claude Desktop

**Windows:** `%APPDATA%\Claude\logs\`
**macOS:** `~/Library/Logs/Claude/`

## Rozwój projektu

### Tryb deweloperski

```bash
npm run watch    # Automatyczne przebudowywanie
npm run dev      # Buduj i uruchom
```

### Struktura projektu

```
infakt-mcp/
├── src/
│   ├── index.ts          # Główny serwer MCP (31 narzędzi)
│   ├── infakt-client.ts  # Klient API inFakt
│   └── types.ts          # Definicje typów TypeScript
├── dist/                 # Skompilowany kod
├── package.json          # Zależności
└── README.md             # Dokumentacja (EN)
```

## Technologia

- **Język:** TypeScript
- **Runtime:** Node.js 18+
- **Protokół:** MCP (Model Context Protocol)
- **API:** inFakt REST API v3
- **Transport:** stdio (JSON-RPC 2.0)

## Licencja

MIT License - Darmowe użytkowanie i modyfikacja

## Linki

- **Repozytorium:** https://github.com/lazniak/infakt-mcp
- **inFakt API:** https://docs.infakt.pl/
- **Pomoc inFakt:** https://pomoc.infakt.pl/hc/pl/articles/115000174410-API
- **MCP Protocol:** https://modelcontextprotocol.io/
- **Anthropic MCP:** https://www.anthropic.com/news/model-context-protocol

## Status projektu

✅ **Gotowy do użycia**

Wszystkie 31 narzędzi jest w pełni zaimplementowanych, przetestowanych i udokumentowanych. Projekt jest gotowy do wdrożenia produkcyjnego.

---

**Autor:** lazniak  
**Wersja:** 1.0.0  
**Data:** 2025-10-31

