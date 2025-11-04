# ✅ CHECKLIST DE EXECUÇÃO - Migração BarConnect

> Use este arquivo para acompanhar o progresso da migração

---

## 📋 **FASE 1: PREPARAÇÃO E DIAGNÓSTICO**

### Backup e Segurança
- [ ] Criar backup manual no Supabase (Settings > Database > Backups)
- [ ] Download do backup (opcional, para segurança local)
- [ ] Notificar usuários sobre manutenção (se aplicável)
- [ ] Escolher horário de baixo tráfego

### Diagnóstico
- [ ] Abrir Supabase SQL Editor
- [ ] Executar: `supabase/verificar-tabelas.sql`
- [ ] Anotar resultados:
  ```
  □ Tabelas existentes: _______________________
  □ hotel_rooms: _____ registros
  □ hotel_guests: _____ registros
  □ hotel_reservations: _____ registros
  □ hotel_room_charges: _____ registros
  □ guests: _____ registros
  □ rooms: _____ registros
  □ pilgrimages: _____ registros
  ```

### Análise dos Resultados
- [ ] Todas as tabelas `hotel_*` estão vazias? (Sim/Não: _____)
- [ ] Tabela `guests` está vazia? (Sim/Não: _____)
- [ ] Tabela `rooms` tem dados? (Sim/Não: _____)
- [ ] Tabela `pilgrimages` tem dados? (Sim/Não: _____)

---

## 🗑️ **FASE 2: LIMPEZA (SE TABELAS VAZIAS)**

### Verificações de Segurança
- [ ] Confirmado: tabelas `hotel_*` estão vazias
- [ ] Backup criado e confirmado
- [ ] Código da aplicação não usa tabelas `hotel_*`

### Execução da Limpeza
- [ ] Abrir: `supabase/migrations/000-cleanup-unused-tables.sql`
- [ ] Ler script completo
- [ ] Executar no Supabase SQL Editor
- [ ] Verificar logs de execução
- [ ] Confirmar mensagem: "✅ Limpeza concluída com sucesso!"

### Validação Pós-Limpeza
- [ ] Executar: `SELECT tablename FROM pg_tables WHERE tablename LIKE 'hotel_%';`
- [ ] Resultado esperado: 0 linhas (tabelas removidas)
- [ ] Aplicação continua funcionando normalmente

---

## 🏗️ **FASE 3: MIGRAÇÃO DA ESTRUTURA**

### Pré-Migração
- [ ] Backup ainda válido (criado há menos de 1 hora)
- [ ] Sistema PDV testado (comandas, vendas funcionando)
- [ ] Usuários notificados (se aplicável)

### Execução da Migração
- [ ] Abrir: `supabase/migrations/001-hotel-restructure.sql`
- [ ] Ler script completo (entender o que será feito)
- [ ] Executar no Supabase SQL Editor
- [ ] Aguardar conclusão (pode levar 1-2 minutos)
- [ ] Verificar logs:
  ```
  □ ✅ Tabela rooms renomeada para rooms_old
  □ ✅ Novas tabelas criadas
  □ ✅ Catálogo de quartos migrado
  □ ✅ Alocações de romarias migradas
  □ ✅ View de compatibilidade criada
  □ ✅ Triggers criados
  □ 🎉 Migração concluída com sucesso!
  ```

### Validação Pós-Migração
- [ ] Verificar tabelas criadas:
  ```sql
  SELECT tablename FROM pg_tables 
  WHERE tablename IN ('rooms_master', 'pilgrimage_rooms', 'rooms_old')
  ORDER BY tablename;
  ```
- [ ] Resultado esperado: 3 linhas
- [ ] Verificar view:
  ```sql
  SELECT viewname FROM pg_views WHERE viewname = 'rooms';
  ```
- [ ] Resultado esperado: 1 linha

### Verificar Integridade dos Dados
- [ ] Contar quartos migrados:
  ```sql
  SELECT COUNT(*) FROM rooms_master;
  SELECT COUNT(DISTINCT number) FROM rooms_old;
  ```
- [ ] Números devem ser iguais
- [ ] Contar alocações migradas:
  ```sql
  SELECT COUNT(*) FROM pilgrimage_rooms;
  SELECT COUNT(*) FROM rooms_old WHERE pilgrimage_id IS NOT NULL;
  ```
- [ ] Números devem ser iguais

---

## 🧪 **FASE 4: TESTES DA APLICAÇÃO**

### Testes do Sistema PDV (NÃO DEVE SER AFETADO)
- [ ] Criar nova comanda
- [ ] Adicionar itens
- [ ] Fechar comanda
- [ ] Criar venda direta
- [ ] Verificar estoque atualizado
- [ ] Abrir dashboard (métricas corretas)

### Testes do Sistema Hotel (DEVE CONTINUAR FUNCIONANDO)
- [ ] Listar romarias existentes
- [ ] Criar nova romaria
- [ ] Editar romaria
- [ ] Ver detalhes de romaria
- [ ] Listar quartos (deve funcionar via view)

### Testes Visuais
- [ ] Interface carrega sem erros
- [ ] Console do navegador sem erros
- [ ] Dados aparecem corretamente
- [ ] Filtros funcionam
- [ ] Busca funciona

---

## 💻 **FASE 5: DESENVOLVIMENTO (NOVO CÓDIGO)**

### Criar Novo Hook: useRoomsMasterDB.ts
- [ ] Criar arquivo: `hooks/useRoomsMasterDB.ts`
- [ ] Implementar:
  - [ ] `fetchRooms()` - listar quartos
  - [ ] `addRoom()` - adicionar quarto
  - [ ] `updateRoom()` - atualizar quarto
  - [ ] `deleteRoom()` - remover quarto
- [ ] Testar hook isoladamente

### Criar Novo Hook: usePilgrimageRoomsDB.ts
- [ ] Criar arquivo: `hooks/usePilgrimageRoomsDB.ts`
- [ ] Implementar:
  - [ ] `fetchRoomsByPilgrimage()` - listar quartos de romaria
  - [ ] `allocateRoom()` - alocar quarto
  - [ ] `deallocateRoom()` - desalocar quarto
  - [ ] `checkIn()` - fazer check-in
  - [ ] `checkOut()` - fazer check-out
- [ ] Testar hook isoladamente

### Criar Componente: RoomsMasterManager.tsx
- [ ] Criar arquivo: `components/RoomsMasterManager.tsx`
- [ ] Implementar:
  - [ ] Lista de quartos
  - [ ] Formulário de adicionar quarto
  - [ ] Edição de quarto
  - [ ] Remoção de quarto
  - [ ] Filtros (por tipo, andar, etc.)
- [ ] Testar componente

### Criar Componente: PilgrimageRoomAllocation.tsx
- [ ] Criar arquivo: `components/PilgrimageRoomAllocation.tsx`
- [ ] Implementar:
  - [ ] Seleção de romaria
  - [ ] Lista de quartos disponíveis
  - [ ] Formulário de alocação
  - [ ] Lista de quartos alocados
  - [ ] Botões de check-in/check-out
- [ ] Testar componente

### Melhorar: HotelPilgrimages.tsx
- [ ] Adicionar aba "Quartos Alocados"
- [ ] Mostrar quartos na modal de detalhes
- [ ] Integrar `usePilgrimageRoomsDB`
- [ ] Adicionar botão "Alocar Quartos"
- [ ] Testar todas as funcionalidades

---

## 🧪 **FASE 6: TESTES COMPLETOS**

### Testes de Funcionalidade
- [ ] **Cenário 1: Criar Romaria e Alocar Quartos**
  - [ ] Criar nova romaria "Teste 2025"
  - [ ] Alocar 3 quartos (101, 102, 103)
  - [ ] Preencher dados de hóspedes
  - [ ] Verificar no banco:
    ```sql
    SELECT * FROM pilgrimage_rooms WHERE pilgrimage_id = '<id-da-romaria>';
    ```
  - [ ] Resultado esperado: 3 linhas

- [ ] **Cenário 2: Check-in**
  - [ ] Fazer check-in do quarto 101
  - [ ] Verificar status mudou para 'checked_in'
  - [ ] Ver quarto na lista de "Ocupados"

- [ ] **Cenário 3: Check-out**
  - [ ] Fazer check-out do quarto 101
  - [ ] Verificar status mudou para 'checked_out'
  - [ ] Ver quarto na lista de "Disponíveis"

- [ ] **Cenário 4: Editar Alocação**
  - [ ] Editar dados do hóspede do quarto 102
  - [ ] Verificar alteração salva

- [ ] **Cenário 5: Remover Alocação**
  - [ ] Remover alocação do quarto 103
  - [ ] Verificar quarto voltou para disponível

### Testes de Integridade
- [ ] Executar queries de validação:
  ```sql
  -- Verificar foreign keys
  SELECT * FROM pilgrimage_rooms pr
  WHERE NOT EXISTS (SELECT 1 FROM pilgrimages p WHERE p.id = pr.pilgrimage_id);
  -- Resultado esperado: 0 linhas

  SELECT * FROM pilgrimage_rooms pr
  WHERE NOT EXISTS (SELECT 1 FROM rooms_master rm WHERE rm.number = pr.room_number);
  -- Resultado esperado: 0 linhas
  ```

### Testes de Performance
- [ ] Listar 100+ romarias (deve ser rápido < 1s)
- [ ] Listar quartos de romaria com 10+ quartos (deve ser rápido < 1s)
- [ ] Filtrar romarias (deve ser instantâneo < 500ms)

---

## 📊 **FASE 7: RELATÓRIOS E MONITORAMENTO**

### Criar Queries de Monitoramento
- [ ] Taxa de ocupação diária
- [ ] Quartos disponíveis por tipo
- [ ] Romarias ativas no momento
- [ ] Previsão de check-ins (próximos 7 dias)
- [ ] Histórico de ocupação por quarto

### Dashboard de Hotel (Opcional)
- [ ] Card: Taxa de Ocupação
- [ ] Card: Quartos Disponíveis
- [ ] Card: Romarias Ativas
- [ ] Card: Check-ins Hoje
- [ ] Gráfico: Ocupação Mensal

---

## 🧹 **FASE 8: LIMPEZA FINAL (APÓS 1 SEMANA)**

### Verificações Antes da Limpeza
- [ ] Sistema funcionando estável por 7 dias
- [ ] Zero bugs reportados
- [ ] Todos os testes passando
- [ ] Usuários satisfeitos com nova estrutura

### Executar Limpeza
- [ ] Criar novo backup
- [ ] Executar:
  ```sql
  DROP TABLE IF EXISTS rooms_old CASCADE;
  ```
- [ ] Verificar aplicação continua funcionando
- [ ] (Opcional) Remover view de compatibilidade:
  ```sql
  DROP VIEW IF EXISTS rooms;
  ```
- [ ] Atualizar hooks para usar tabelas novas diretamente

---

## 📝 **ANOTAÇÕES E OBSERVAÇÕES**

### Problemas Encontrados
```
Data: ___/___/___
Problema: _________________________________
Solução: __________________________________

Data: ___/___/___
Problema: _________________________________
Solução: __________________________________
```

### Melhorias Identificadas
```
□ ________________________________________
□ ________________________________________
□ ________________________________________
```

### Próximas Funcionalidades
```
□ ________________________________________
□ ________________________________________
□ ________________________________________
```

---

## 🎯 **RESUMO DO PROGRESSO**

```
PREPARAÇÃO      [ ] 0% → [ ] 25% → [ ] 50% → [ ] 75% → [ ] 100%
LIMPEZA         [ ] 0% → [ ] 25% → [ ] 50% → [ ] 75% → [ ] 100%
MIGRAÇÃO        [ ] 0% → [ ] 25% → [ ] 50% → [ ] 75% → [ ] 100%
TESTES          [ ] 0% → [ ] 25% → [ ] 50% → [ ] 75% → [ ] 100%
DESENVOLVIMENTO [ ] 0% → [ ] 25% → [ ] 50% → [ ] 75% → [ ] 100%
VALIDAÇÃO       [ ] 0% → [ ] 25% → [ ] 50% → [ ] 75% → [ ] 100%
LIMPEZA FINAL   [ ] 0% → [ ] 25% → [ ] 50% → [ ] 75% → [ ] 100%

PROGRESSO GERAL: _____ %
```

---

## ✅ **CONCLUSÃO**

- [ ] Migração concluída com sucesso
- [ ] Sistema funcionando perfeitamente
- [ ] Documentação atualizada
- [ ] Equipe treinada (se aplicável)
- [ ] Usuários satisfeitos

**Data de Conclusão:** ___/___/___  
**Responsável:** _________________  
**Observações Finais:** ___________
