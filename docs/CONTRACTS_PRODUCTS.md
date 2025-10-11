# Contrato: Products

## Modelo
```
Product {
  id: string;
  name: string;             // Nome exibido
  price: number;            // Valor unitário em reais (decimal, sem toFixed armazenado)
  stock: number;            // Quantidade atual em unidades
  category?: string;        // Categoria macro (ex: bebidas)
  subcategory?: string;     // Detalhe (ex: latas)
}
```

## Invariantes
- `id` único (gerado pelo Supabase ou UUID client ao inserir offline se aplicável).
- `price` >= 0; valores salvos como número (nunca string formatada).
- `stock` >= 0 inteiro.
- Atualizações parciais não devem remover campos existentes a menos que explicitamente definidos como `null`/`undefined` no banco.

## Operações
| Operação        | Hook/Função          | Efeitos | Invalidação Cache |
|-----------------|----------------------|---------|-------------------|
| Listar          | `useProductsDB()`    | GET     | TTL (8s)          |
| Adicionar       | `addProduct`         | INSERT  | `products:list`   |
| Atualizar stock | `updateStock`        | UPDATE  | `products:list`   |
| Atualizar geral | `updateProduct`      | UPDATE  | `products:list`   |

## Erros & Feedback
- Toast de sucesso/erro via `sonner`.
- Em falha de rede, nenhuma mutação otimista é aplicada por enquanto (futuro: usar cache + rollback).

## Futuras Extensões
- Campo `cost` para margem.
- Campo `active` para soft-delete.
- Índices por categoria para filtragem servidor.
