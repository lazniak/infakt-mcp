# inFakt MCP Server - Integracja API inFakt z Claude AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

**Serwer Model Context Protocol (MCP) dla API inFakt** - profesjonalne narzędzie do automatyzacji fakturowania i księgowości w Polsce za pomocą sztucznej inteligencji Claude AI.

🇬🇧 **[English version](README.en.md)**

## 📋 Spis treści

- [Czym jest inFakt MCP?](#czym-jest-infakt-mcp)
- [Funkcje i możliwości](#funkcje-i-możliwości)
- [Wymagania systemowe](#wymagania-systemowe)
- [Instalacja](#instalacja)
- [Konfiguracja](#konfiguracja)
- [Dostępne narzędzia](#dostępne-narzędzia)
- [Przykłady użycia](#przykłady-użycia)
- [Rozwój projektu](#rozwój-projektu)
- [Wyłączenie odpowiedzialności](#wyłączenie-odpowiedzialności)
- [Wsparcie i pomoc](#wsparcie-i-pomoc)
- [Licencja](#licencja)

## Czym jest inFakt MCP?

**inFakt MCP Server** to innowacyjne rozwiązanie umożliwiające integrację systemu fakturowania **inFakt** z asystentem AI **Claude Desktop** poprzez protokół Model Context Protocol (MCP). Dzięki temu możesz zarządzać fakturami, klientami, produktami i płatnościami używając naturalnego języka polskiego.

### Kluczowe korzyści:

✅ **Automatyzacja fakturowania** - Twórz faktury konwersacyjnie, bez klikania w interfejsie  
✅ **Pełna kontrola nad danymi** - Wszystkie operacje CRUD na fakturach, klientach, produktach  
✅ **Naturalny język polski** - Rozmawiaj z AI po polsku o swoich fakturach  
✅ **Bezpieczeństwo** - Klucz API przechowywany lokalnie, bez dostępu stron trzecich  
✅ **Open source** - Kod dostępny publicznie, możliwość audytu i modyfikacji  
✅ **Darmowe** - Licencja MIT, bez opłat za oprogramowanie  

## Funkcje i możliwości

### 🧾 Faktury (6 narzędzi)
- **Przeglądanie faktur** - Lista wszystkich faktur z zaawansowanym filtrowaniem (daty, status, zapłacone/niezapłacone)
- **Szczegóły faktury** - Pełne informacje o wybranej fakturze
- **Tworzenie faktur** - Automatyczne generowanie faktur z usługami i produktami
- **Edycja faktur** - Aktualizacja istniejących dokumentów
- **Usuwanie faktur** - Bezpieczne usuwanie niepotrzebnych faktur
- **Wysyłka e-mail** - Automatyczne wysyłanie faktur do klientów

### 👥 Klienci (5 narzędzi)
- **Baza klientów** - Zarządzanie danymi kontrahentów
- **Dodawanie klientów** - Szybkie wprowadzanie nowych kontrahentów z pełnymi danymi (NIP, adres, kontakt)
- **Edycja danych** - Aktualizacja informacji o klientach
- **Wyszukiwanie** - Szybkie odnajdywanie klientów po nazwie lub NIP
- **Usuwanie** - Bezpieczne usuwanie nieaktywnych klientów

### 📦 Produkty i usługi (5 narzędzi)
- **Katalog produktowy** - Zarządzanie ofertą usług i produktów
- **Ceny i VAT** - Automatyczne obliczanie cen netto/brutto z VAT
- **Edycja produktów** - Aktualizacja cen i opisów
- **Jednostki miary** - Obsługa różnych jednostek (szt, kg, usł, godz.)

### 🏦 Konta bankowe (5 narzędzi)
- **Zarządzanie rachunkami** - Lista kont firmowych
- **Dodawanie kont** - IBAN, SWIFT, nazwa banku
- **Domyślne konto** - Ustawianie preferowanego rachunku

### 💰 Płatności (3 narzędzia)
- **Historia płatności** - Śledzenie wpłat
- **Rejestrowanie wpłat** - Automatyczne oznaczanie faktur jako opłacone
- **Raportowanie** - Analiza płatności według faktur

## Wymagania systemowe

- **Node.js** w wersji 18.0.0 lub nowszej ([Pobierz Node.js](https://nodejs.org/))
- **Konto inFakt** z aktywnym dostępem API ([Załóż konto](https://app.infakt.pl/))
- **Claude Desktop** ([Pobierz Claude](https://claude.ai/download))
- **Klucz API inFakt** ([Wygeneruj klucz](https://app.infakt.pl/app/ustawienia.integrations.html))

## Instalacja

### Krok 1: Pobierz kod źródłowy

```bash
git clone https://github.com/lazniak/infakt-mcp.git
cd infakt-mcp
```

### Krok 2: Zainstaluj zależności

```bash
npm install
```

### Krok 3: Zbuduj projekt

```bash
npm run build
```

Projekt zostanie skompilowany do katalogu `dist/`.

## Konfiguracja

### 1. Pobierz klucz API z inFakt

1. Zaloguj się do swojego konta: [https://app.infakt.pl](https://app.infakt.pl)
2. Przejdź do: **Ustawienia → Integracje → API**
3. Skopiuj swój unikalny klucz API
4. Link bezpośredni: [https://app.infakt.pl/app/ustawienia.integrations.html](https://app.infakt.pl/app/ustawienia.integrations.html)

### 2. Konfiguracja dla Claude Desktop

Edytuj plik konfiguracyjny Claude Desktop:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

Dodaj następującą konfigurację (zamień ścieżkę i klucz API):

```json
{
  "mcpServers": {
    "infakt": {
      "command": "node",
      "args": [
        "C:\\Users\\TwojUser\\infakt-mcp\\dist\\index.js"
      ],
      "env": {
        "INFAKT_API_KEY": "twoj_rzeczywisty_klucz_api_z_infakt"
      }
    }
  }
}
```

**⚠️ WAŻNE:**
- Podmień `C:\\Users\\TwojUser\\infakt-mpc\\dist\\index.js` na **rzeczywistą ścieżkę** do swojej instalacji
- Na Windows używaj **podwójnych ukośników** (\\\\) w ścieżce
- Wklej swój **prawdziwy klucz API** (nie zostawiaj przykładowego)
- Klucz API **MUSI** być w sekcji `env` - serwer nie używa plików `.env` w Claude Desktop

### 3. Uruchom Claude Desktop

Po zapisaniu konfiguracji uruchom ponownie aplikację Claude Desktop. Serwer inFakt zostanie automatycznie załadowany.

### 4. Weryfikacja działania

Po uruchomieniu Claude Desktop, w nowej konwersacji powinieneś móc używać poleceń związanych z inFakt. Sprawdź czy działa:

> "Pokaż listę moich ostatnich faktur"

Jeśli wszystko jest poprawnie skonfigurowane, Claude wyświetli Twoje faktury z inFakt.

## Dostępne narzędzia

Serwer udostępnia **31 narzędzi** do zarządzania systemem inFakt:

### Operacje na fakturach
| Narzędzie | Opis | Przykład użycia |
|-----------|------|-----------------|
| `list_invoices` | Lista faktur z filtrami | "Pokaż faktury z października" |
| `get_invoice` | Szczegóły faktury | "Szczegóły faktury 12345" |
| `create_invoice` | Nowa faktura | "Utwórz fakturę dla firmy ABC" |
| `update_invoice` | Edycja faktury | "Zmień datę płatności faktury 123" |
| `delete_invoice` | Usunięcie faktury | "Usuń fakturę 456" |
| `send_invoice` | Wysyłka e-mail | "Wyślij fakturę 789 do klienta" |

### Operacje na klientach
| Narzędzie | Opis | Przykład użycia |
|-----------|------|-----------------|
| `list_clients` | Lista klientów | "Pokaż wszystkich klientów" |
| `get_client` | Dane klienta | "Dane firmy XYZ" |
| `create_client` | Nowy klient | "Dodaj klienta ABC Sp. z o.o." |
| `update_client` | Edycja klienta | "Zmień adres klienta 123" |
| `delete_client` | Usunięcie klienta | "Usuń klienta 456" |

### Operacje na produktach
| Narzędzie | Opis | Przykład użycia |
|-----------|------|-----------------|
| `list_products` | Katalog produktów | "Pokaż wszystkie usługi" |
| `get_product` | Szczegóły produktu | "Szczegóły produktu 123" |
| `create_product` | Nowy produkt | "Dodaj usługę Hosting WWW" |
| `update_product` | Edycja produktu | "Zmień cenę produktu 123 na 150 zł" |
| `delete_product` | Usunięcie produktu | "Usuń produkt 456" |

## Przykłady użycia

Po poprawnej konfiguracji możesz używać naturalnego języka polskiego do zarządzania inFakt:

### 📊 Przeglądanie faktur

```
Ty: Pokaż mi wszystkie faktury z października 2025
Claude: [wyświetla listę faktur]

Ty: Które faktury są niezapłacone?
Claude: [filtruje i pokazuje niezapłacone]

Ty: Pokaż szczegóły faktury numer FV/2025/10/123
Claude: [wyświetla pełne dane faktury]
```

### ➕ Tworzenie nowej faktury

```
Ty: Utwórz fakturę dla klienta o ID 123, data wystawienia dzisiaj, 
    termin płatności za 14 dni, przelew. Dodaj usługę: Tworzenie 
    strony WWW, 40 godzin po 150 zł netto, VAT 23%
    
Claude: [tworzy fakturę i wyświetla potwierdzenie]
```

### 👤 Zarządzanie klientami

```
Ty: Znajdź dane kontaktowe firmy "ABC Software"
Claude: [wyszukuje i wyświetla dane klienta]

Ty: Dodaj nowego klienta: XYZ Sp. z o.o., ul. Główna 10, 
    Warszawa 00-001, NIP: 1234567890, email: [email protected]
    
Claude: [dodaje klienta i potwierdza]
```

### 📦 Produkty i usługi

```
Ty: Dodaj nowy produkt do katalogu: Hosting WWW Premium, 
    cena 200 zł miesięcznie, VAT 23%, jednostka: usługa
    
Claude: [dodaje produkt]

Ty: Zaktualizuj cenę produktu "Hosting WWW Premium" na 250 zł
Claude: [aktualizuje i potwierdza]
```

### 💸 Płatności

```
Ty: Zarejestruj płatność 1500 zł dla faktury 789, 
    data wpłaty dzisiaj, przelew bankowy
    
Claude: [rejestruje płatność i oznacza fakturę jako opłaconą]

Ty: Pokaż wszystkie płatności z ostatniego miesiąca
Claude: [wyświetla historię płatności]
```

### 📧 Wysyłka faktur

```
Ty: Wyślij fakturę 456 na adres [email protected]
Claude: [wysyła fakturę emailem]
```

## Rozwój projektu

### Testowanie lokalne

Do testowania bez Claude Desktop, użyj pliku `.env`:

```bash
# Utwórz plik .env
cp env.example .env

# Edytuj .env i dodaj klucz API
echo "INFAKT_API_KEY=twoj_klucz" > .env

# Uruchom z automatycznym wczytaniem .env
npm run dev
```

### Struktura projektu

```
infakt-mcp/
├── src/
│   ├── index.ts          # Główny serwer MCP (31 narzędzi)
│   ├── infakt-client.ts  # Klient API inFakt
│   └── types.ts          # Definicje typów TypeScript
├── dist/                 # Skompilowany kod (po npm run build)
├── package.json          # Zależności i skrypty
├── tsconfig.json         # Konfiguracja TypeScript
└── README.md             # Ten plik
```

### Skrypty NPM

```bash
npm run build    # Kompilacja TypeScript do JavaScript
npm run watch    # Automatyczna rekompilacja przy zmianach
npm run dev      # Buduj i uruchom z .env
```

## Wyłączenie odpowiedzialności

**⚠️ WAŻNE - PRZECZYTAJ UWAŻNIE**

### Użycie na własne ryzyko

To oprogramowanie jest dostarczane **"takie jakie jest"**, bez jakichkolwiek gwarancji. Autor i współtwórcy **nie ponoszą odpowiedzialności** za:

- ❌ Błędy w wystawionych fakturach lub dokumentach księgowych
- ❌ Nieprawidłowe obliczenia VAT lub innych podatków
- ❌ Utratę danych lub przerwanie działalności
- ❌ Naruszenie przepisów podatkowych lub księgowych
- ❌ Jakiekolwiek szkody finansowe wynikające z użycia oprogramowania

### Twoja odpowiedzialność

**UŻYTKOWNIK** przyjmuje pełną odpowiedzialność za:

✅ **Weryfikację** - Sprawdzanie poprawności wszystkich generowanych dokumentów  
✅ **Zgodność prawna** - Przestrzeganie przepisów podatkowych i księgowych  
✅ **Bezpieczeństwo** - Ochronę kluczy API i danych dostępowych  
✅ **Konsekwencje** - Skutki użycia oprogramowania w środowisku produkcyjnym  

### Zalecenia

🔒 **To NIE jest certyfikowane narzędzie księgowe**

Przed użyciem w firmie:
1. Skonsultuj się z księgowym lub doradcą podatkowym
2. Przetestuj dokładnie w środowisku testowym
3. Zawsze weryfikuj generowane dokumenty
4. Zachowaj kopie zapasowe danych

📖 **Pełna treść licencji i wyłączenia odpowiedzialności:** [LICENSE](LICENSE)

## Wsparcie i pomoc

### Problemy techniczne

**Serwer nie pojawia się w Claude:**
1. ✅ Sprawdź ścieżkę w `claude_desktop_config.json` (użyj pełnej, bezwzględnej ścieżki)
2. ✅ Upewnij się że projekt jest zbudowany (`npm run build`)
3. ✅ Zweryfikuj klucz API (skopiuj ponownie z inFakt)
4. ✅ Uruchom Claude Desktop całkowicie od nowa (zakończ proces i uruchom ponownie)
5. ✅ Sprawdź logi Claude (patrz poniżej)

**Błędy API:**
- **401 Unauthorized** → Nieprawidłowy lub wygasły klucz API
- **404 Not Found** → Zasób o podanym ID nie istnieje w Twoim koncie
- **422 Unprocessable Entity** → Brakujące lub nieprawidłowe dane w żądaniu

### Logi Claude Desktop

**Windows:**
```
%APPDATA%\Claude\logs\
```

**macOS:**
```
~/Library/Logs/Claude/
```

**Linux:**
```
~/.config/Claude/logs/
```

### Zgłaszanie błędów

Znalazłeś błąd? Masz pomysł na nową funkcję?

1. 🐛 **Zgłoś problem:** [GitHub Issues](https://github.com/lazniak/infakt-mcp/issues)
2. 💡 **Zaproponuj funkcję:** [GitHub Discussions](https://github.com/lazniak/infakt-mcp/discussions)
3. 🔧 **Pull Request:** Każdy wkład jest mile widziany!

## Dodatkowe zasoby

### Dokumentacja

- 📘 [inFakt API Documentation](https://docs.infakt.pl/) - Oficjalna dokumentacja API
- 📗 [Pomoc inFakt](https://pomoc.infakt.pl/hc/pl/articles/115000174410-API) - Centrum pomocy
- 📙 [Model Context Protocol](https://modelcontextprotocol.io/) - Specyfikacja MCP
- 📕 [Claude AI](https://www.anthropic.com/claude) - Informacje o Claude

### Technologie

Projekt wykorzystuje:
- **[TypeScript 5.7](https://www.typescriptlang.org/)** - Typowany JavaScript
- **[Node.js 18+](https://nodejs.org/)** - Runtime
- **[Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)** - Protokół MCP
- **[Axios](https://axios-http.com/)** - Klient HTTP
- **[inFakt API v3](https://docs.infakt.pl/)** - REST API

## Licencja

**Licencja MIT** - Zobacz pełny tekst w pliku [LICENSE](LICENSE)

- ✅ Komercyjne użycie dozwolone
- ✅ Modyfikacje dozwolone
- ✅ Dystrybucja dozwolona
- ✅ Użycie prywatne dozwolone
- ❌ Brak gwarancji
- ❌ Autor nie ponosi odpowiedzialności

## Autor i społeczność

**Autor:** [lazniak](https://github.com/lazniak)  
**Repository:** [github.com/lazniak/infakt-mcp](https://github.com/lazniak/infakt-mcp)  
**Wersja:** 1.0.0

### Podziękowania

- 🙏 **Anthropic** - za stworzenie Model Context Protocol
- 🙏 **inFakt** - za udostępnienie API
- 🙏 **Społeczność Open Source** - za wsparcie i feedback

### Wsparcie projektu

Jeśli ten projekt jest dla Ciebie przydatny:

⭐ **Zostaw gwiazdkę na GitHub** - pomaga innym znaleźć projekt  
🐛 **Zgłaszaj błędy** - pomóż w rozwoju  
💻 **Kod** - pull requesty są mile widziane  
📢 **Udostępnij** - powiedz o projekcie innym  

---

**Made with ❤️ for Polish entrepreneurs and developers**

**Keywords:** inFakt API, Claude AI, MCP server, automatyzacja fakturowania, AI księgowość, faktury API, inFakt integracja, Model Context Protocol, Claude Desktop, TypeScript, Node.js, automatyzacja biznesu, sztuczna inteligencja w księgowości
