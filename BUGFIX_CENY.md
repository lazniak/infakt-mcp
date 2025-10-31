# BUGFIX: Automatyczne formatowanie cen w fakturach

## Problem

Claude AI często przekazywał ceny w nieprawidłowym formacie:
- ❌ `"500"` zamiast `"500.00"` → API inFakt traktowało to jako 5.00 PLN
- ❌ `"1800"` zamiast `"1800.00"` → API inFakt traktowało to jako 18.00 PLN

## Rozwiązanie

Dodano automatyczne formatowanie cen po stronie serwera w pliku `src/infakt-client.ts`:

### Funkcje pomocnicze:

1. **`formatPrice(price: string | number): string`**
   - Konwertuje cenę do formatu z 2 miejscami po przecinku
   - Obsługuje zarówno stringi jak i liczby
   - Przykłady:
     - `formatPrice("500")` → `"500.00"`
     - `formatPrice("1800")` → `"1800.00"`
     - `formatPrice(150)` → `"150.00"`
     - `formatPrice("99.99")` → `"99.99"`

2. **`normalizeInvoiceServices(services: any[]): any[]`**
   - Automatycznie formatuje `unit_net_price` dla wszystkich usług
   - Ustawia domyślną ilość `quantity: 1` jeśli nie podano

### Zmiany w metodach:

- **`createInvoice()`** - automatycznie normalizuje ceny przed wysłaniem do API
- **`updateInvoice()`** - normalizuje ceny przy aktualizacji faktury

## Przykłady działania

### Przed poprawką:
```typescript
// Claude wysyła:
{
  services: [{
    name: "Usługa",
    unit_net_price: "500",  // ❌ Brak .00
    quantity: 1,
    tax_symbol: 23
  }]
}

// API inFakt interpretuje jako: 5.00 PLN
```

### Po poprawce:
```typescript
// Claude wysyła:
{
  services: [{
    name: "Usługa",
    unit_net_price: "500",  // Nadal nieprawidłowe
    quantity: 1,
    tax_symbol: 23
  }]
}

// Serwer automatycznie konwertuje na:
{
  services: [{
    name: "Usługa",
    unit_net_price: "500.00",  // ✅ Poprawnie sformatowane
    quantity: 1,
    tax_symbol: 23
  }]
}

// API inFakt otrzymuje: 500.00 PLN ✅
```

## Testowanie

Aby przetestować poprawkę:

```bash
# Przebuduj projekt
npm run build

# Uruchom ponownie Claude Desktop
# Spróbuj wystawić fakturę z różnymi formatami cen:
```

Przykłady testowe w Claude:
- "Wystaw fakturę na 500 PLN netto"
- "Faktura na 1800 złotych netto"
- "Cena jednostkowa 150 zł"
- "Po 99.99 PLN za sztukę"

Wszystkie powinny działać poprawnie!

## Historia problemu

1. **v1.0.0** - Początkowa wersja, brak walidacji cen
2. **Commit d3a06f0** - Dodano instrukcje w opisie narzędzia (niewystarczające)
3. **Ten commit** - Dodano automatyczne formatowanie po stronie serwera ✅

## Status

✅ **NAPRAWIONE** - Serwer automatycznie formatuje ceny niezależnie od tego co wysyła Claude

