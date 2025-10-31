# inFakt API - Asynchroniczne tworzenie faktur

## Endpointy do tworzenia faktur

inFakt API oferuje dwa sposoby tworzenia faktur:

### 1. Synchroniczny (obecnie używany)
```
POST /v3/invoices.json
```
- Zwraca od razu utworzoną fakturę
- Prostszy w implementacji
- **TO UŻYWAMY OBECNIE**

### 2. Asynchroniczny (dokumentacja użytkownika)
```
POST /v3/async/invoices.json
```
- Zwraca `invoice_task_reference_number`
- Wymaga sprawdzania statusu:
  ```
  GET /v3/async/invoices/status/{invoice_task_reference_number}.json
  ```

## Kody statusu asynchronicznego:

| Kod | Opis |
|-----|------|
| 100 | Zlecenie przyjęte |
| 120 | Zlecenie czeka na przetworzenie |
| 140 | Zlecenie jest w trakcie przetwarzania |
| 201 | Faktura stworzona ✅ |
| 422 | Nie udało się stworzyć faktury ❌ |

## Pytanie: Czy powinniśmy używać async?

### Zalety async:
- Lepsze dla wielu równoczesnych operacji
- Nie blokuje w przypadku długiego przetwarzania

### Wady async:
- Bardziej skomplikowana implementacja
- Wymaga pollingu statusu
- Wolniejsze dla pojedynczych faktur

## Obecna implementacja

Nasz serwer używa **synchronicznego** endpointa:
```typescript
POST /invoices.json
```

To jest **prawidłowe** dla większości przypadków użycia z Claude Desktop.

## Czy to może być źródłem problemu z cenami?

**Prawdopodobnie NIE** - endpoint synchroniczny też powinien działać poprawnie.

Problem z cenami (500 → 5.00) jest bardziej związany z:
- Formatowaniem danych wejściowych
- Parsowaniem stringów jako liczb

Rozwiązanie z automatycznym formatowaniem (`formatPrice()`) powinno działać na obu endpointach.

