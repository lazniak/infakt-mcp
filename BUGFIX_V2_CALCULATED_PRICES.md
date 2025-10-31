# KRYTYCZNY BUG: API inFakt wymaga wyliczonych cen

## Odkrycie problemu

Użytkownik pokazał dokładnie co Claude wysłał do API:

```json
{
  "services": [
    {
      "name": "Przygotowanie materiałów video AI",
      "unit": "usł",
      "quantity": 1,
      "tax_symbol": 23,
      "unit_net_price": "500.00"  ← POPRAWNY FORMAT!
    }
  ],
  "client_id": 36827806,
  "sale_date": "2025-10-31",
  "invoice_date": "2025-10-31",
  "payment_date": "2025-11-07",
  "payment_method": "transfer"
}
```

**Rezultat:** Faktura na 5,00 PLN zamiast 500,00 PLN!

## Analiza

Claude **POPRAWNIE** wysłał `"500.00"` z kropką i dwoma zerami.  
Problem NIE jest w formacie danych od Claude!

## Hipoteza

API inFakt **wymaga** żeby każda usługa miała również:
- `net_price` - całkowita cena netto (unit_net_price × quantity)
- `gross_price` - całkowita cena brutto (net_price + tax_price)
- `tax_price` - kwota VAT (net_price × tax_symbol / 100)

Bez tych pól API **może źle interpretować** `unit_net_price`.

## Rozwiązanie v2

Zaktualizowano `normalizeInvoiceServices()` aby automatycznie obliczać:

```typescript
function normalizeInvoiceServices(services: any[]): any[] {
  return services.map(service => {
    const unitNetPrice = parseFloat(formatPrice(service.unit_net_price));
    const quantity = service.quantity || 1;
    const taxRate = service.tax_symbol / 100;
    
    // Calculate all prices
    const netPrice = unitNetPrice * quantity;
    const taxPrice = netPrice * taxRate;
    const grossPrice = netPrice + taxPrice;
    
    return {
      ...service,
      unit_net_price: formatPrice(unitNetPrice),  // "500.00"
      quantity: quantity,                          // 1
      net_price: formatPrice(netPrice),            // "500.00"
      gross_price: formatPrice(grossPrice),        // "615.00"
      tax_price: formatPrice(taxPrice),            // "115.00"
    };
  });
}
```

## Przykład

Dla usługi: 500 PLN netto, ilość 1, VAT 23%

**Przed (wysyłane do API):**
```json
{
  "unit_net_price": "500.00",
  "quantity": 1,
  "tax_symbol": 23
}
```
→ API tworzy fakturę na 5,00 PLN ❌

**Po (wysyłane do API):**
```json
{
  "unit_net_price": "500.00",
  "quantity": 1,
  "tax_symbol": 23,
  "net_price": "500.00",      ← DODANE
  "gross_price": "615.00",    ← DODANE
  "tax_price": "115.00"       ← DODANE
}
```
→ API powinno utworzyć fakturę na 500,00 PLN ✅

## Debug logging

Dodano szczegółowe logowanie:
- FULL REQUEST BODY - co wysyłamy do API
- FULL RESPONSE - co API zwraca

Logi będą w:
- Windows: `%APPDATA%\Claude\logs\mcp-server-infakt.log`
- macOS: `~/Library/Logs/Claude/mcp-server-infakt.log`

## Testowanie

1. Zrestartuj Claude Desktop
2. Spróbuj wystawić fakturę na 500 PLN
3. Sprawdź logi - zobaczysz dokładnie co zostało wysłane
4. Sprawdź fakturę w inFakt

## Status

🔄 **WYMAGA TESTOWANIA**

To rozwiązanie opiera się na założeniu że API wymaga wszystkich cen.
Jeśli problem nadal występuje, sprawdź logi aby zobaczyć co dokładnie trafia do API.

