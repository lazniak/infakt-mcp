# Ulepszona dokumentacja narzędzi MCP dla Claude

## Co zostało poprawione?

### Problem
Claude AI nie miał wystarczająco szczegółowych instrukcji jak używać narzędzi inFakt API, co prowadziło do błędów, szczególnie w formatowaniu cen.

### Rozwiązanie
Dodano **bardzo szczegółowe opisy** do każdego narzędzia MCP, które Claude widzi. Każdy opis zawiera teraz:

## 1. Narzędzie `create_invoice`

### Dodane sekcje:

#### CRITICAL PRICE FORMATTING RULES
```
✅ CORRECT: "500.00", "1800.00", "150.00", "99.50"
❌ WRONG: "500", "1800", 150, 1800
```

#### STEP-BY-STEP GUIDE
1. Jak znaleźć client_id
2. Jak obliczyć daty
3. Jak sformatować każdą usługę

#### EXAMPLES
Konkretne przykłady dla:
- 500 PLN netto
- 1800 PLN netto
- 150 PLN za godzinę × 8 godzin

#### PAYMENT METHODS
Lista dostępnych metod płatności z tłumaczeniami

### Rezultat
Claude teraz **WIE DOKŁADNIE**:
- Że ceny MUSZĄ mieć `.00`
- Jak znaleźć client_id
- Jakie formaty dat używać
- Jakie są dostępne metody płatności
- Jak wygląda poprawna struktura

## 2. Narzędzie `list_invoices`

### Dodane sekcje:

#### USAGE GUIDE
Lista wszystkich możliwości filtrowania

#### COMMON QUERIES
Typowe zapytania użytkownika i jak je przetłumaczyć na parametry API:
- "Pokaż ostatnie faktury" → brak filtrów
- "Niezapłacone faktury" → `paid: false`
- "Faktury z października" → date range
- "Faktura dla ABC" → `q: "ABC"`

#### RESPONSE
Co zawiera odpowiedź i jak interpretować pola

## 3. Narzędzie `create_client`

### Dodane sekcje:

#### REQUIRED FIELDS
Lista pól wymaganych z wyjaśnieniami

#### OPTIONAL BUT RECOMMENDED
Pola opcjonalne ale ważne (NIP, email)

#### EXAMPLES
Dwa kompletne przykłady:
1. Polska firma (Sp. z o.o.)
2. Osoba fizyczna

#### TIPS
Praktyczne wskazówki:
- Kiedy pytać o NIP
- Dlaczego email jest ważny
- Jak używać first_name/last_name

## Jak to działa?

### Przed zmianą:
```json
{
  "name": "create_invoice",
  "description": "Create a new invoice in inFakt"
}
```

Claude otrzymywał tylko krótki opis i musiał **zgadywać** jak formatować dane.

### Po zmianie:
```json
{
  "name": "create_invoice",
  "description": "Create a new invoice in inFakt system.

CRITICAL PRICE FORMATTING RULES:
================================
unit_net_price MUST be a decimal string with exactly 2 decimal places:
  ✅ CORRECT: \"500.00\", \"1800.00\", \"150.00\", \"99.50\"
  ❌ WRONG: \"500\", \"1800\", 150, 1800

STEP-BY-STEP GUIDE:
===================
1. Get client_id from list_clients or get_client
2. Calculate dates:
   - invoice_date: YYYY-MM-DD format (e.g., \"2025-10-31\")
   [...]

EXAMPLES:
=========
For 500 PLN netto:
  unit_net_price: \"500.00\" (NOT \"500\")
[...]"
}
```

Claude otrzymuje **dokładne instrukcje** jak używać narzędzia, z przykładami i ostrzeżeniami.

## Dodatkowa ochrona

### Warstwa 1: Instrukcje dla Claude
Szczegółowe opisy narzędzi pokazują Claude'owi **JAK** poprawnie formatować dane.

### Warstwa 2: Automatyczne formatowanie
Jeśli Claude mimo wszystko źle sformatuje cenę, serwer **automatycznie** ją poprawi (`formatPrice()`).

### Warstwa 3: Debug logging
Logi pokazują dokładnie co zostało wysłane do API.

## Rezultat

Claude ma teraz:
- ✅ **Szczegółową dokumentację** każdego narzędzia
- ✅ **Przykłady użycia** dla typowych przypadków
- ✅ **Ostrzeżenia** o krytycznych formatach (ceny!)
- ✅ **Step-by-step guides** jak wykonać operację
- ✅ **Listy wartości** (payment methods, tax rates, etc.)

To jest jak danie Claude'owi **podręcznika użytkownika API** wbudowanego w każde narzędzie!

## Testowanie

Po restarcie Claude Desktop, spróbuj:

```
Wystaw fakturę dla KDK na 500 złotych netto
```

Claude powinien teraz:
1. Przeczytać instrukcje w `create_invoice`
2. Zobaczyć przykład: "For 500 PLN netto: unit_net_price: \"500.00\""
3. Sformatować cenę jako `"500.00"` ✅
4. A jeśli nie - serwer i tak to poprawi! 🛡️

## Status

✅ **create_invoice** - Pełna dokumentacja z przykładami
✅ **list_invoices** - Usage guide i common queries
✅ **create_client** - Przykłady dla firm i osób fizycznych
🔄 **Pozostałe narzędzia** - Można dodać więcej szczegółów w przyszłości

Każde narzędzie ma teraz **kontekst** potrzebny Claude'owi do poprawnego użycia!

