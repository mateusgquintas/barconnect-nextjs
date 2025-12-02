# ✅ Checklist de Execução - Organização do Banco de Dados

> **Data:** 31 de Outubro de 2025  
> **Objetivo:** Organizar e otimizar a estrutura do banco de dados

---

## 📋 **ETAPA 1: ANÁLISE INICIAL** ⏱️ 10 minutos

- [ ] **1.1** Abrir Supabase SQL Editor
- [ ] **1.2** Executar verificação de tabelas existentes:
  ```sql
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name;
  ```
- [ ] **1.3** Anotar quais tabelas `hotel_*` existem
- [ ] **1.4** Verificar se há dados nas tabelas (executar `cleanup-unused-tables.sql` ETAPA 1)

**Resultado esperado:**
- Lista completa de tabelas
- Contagem de registros em cada tabela `hotel_*`

---

## 📋 **ETAPA 2: BACKUP** ⏱️ 15 minutos

- [ ] **2.1** Fazer backup completo do banco via Supabase Dashboard
  - Ir em Settings → Database → Create backup
- [ ] **2.2** Exportar dados das tabelas `hotel_*` (se houver dados)
  ```sql
  COPY hotel_rooms TO '/tmp/hotel_rooms_backup.csv' CSV HEADER;
  COPY hotel_guests TO '/tmp/hotel_guests_backup.csv' CSV HEADER;
  COPY hotel_reservations TO '/tmp/hotel_reservations_backup.csv' CSV HEADER;
  ```
- [ ] **2.3** Confirmar que backup foi criado com sucesso
- [ ] **2.4** Anotar timestamp do backup para referência

**Resultado esperado:**
- Backup completo do banco disponível
- Arquivos CSV (se houver dados)

---

## 📋 **ETAPA 3: LIMPEZA (Opcional)** ⏱️ 5 minutos

⚠️ **Execute apenas se verificado que tabelas `hotel_*` estão vazias ou não são necessárias**

- [ ] **3.1** Revisar arquivo `cleanup-unused-tables.sql`
- [ ] **3.2** Executar ETAPA 3 do script (limpeza)
- [ ] **3.3** Verificar logs de execução (ETAPA 4 do script)
- [ ] **3.4** Confirmar remoção das tabelas duplicadas

**Resultado esperado:**
- 4 tabelas removidas: `hotel_rooms`, `hotel_guests`, `hotel_reservations`, `hotel_room_charges`
- Sistema continua funcionando normalmente

---

## 📋 **ETAPA 4: DOCUMENTAÇÃO** ⏱️ 5 minutos

- [ ] **4.1** Revisar `schema-pdv.sql` → Sistema PDV completo
- [ ] **4.2** Revisar `schema-hotel.sql` → Sistema Hotel atual
- [ ] **4.3** Revisar `relatorios.sql` → Queries úteis
- [ ] **4.4** Revisar `GUIA-RAPIDO.md` → Referência rápida

**Resultado esperado:**
- Compreensão clara da estrutura
- Documentação completa disponível

---

## 📋 **ETAPA 5: VALIDAÇÃO** ⏱️ 10 minutos

- [ ] **5.1** Testar autenticação (login no sistema)
- [ ] **5.2** Testar criação de comanda
- [ ] **5.3** Testar venda direta
- [ ] **5.4** Testar gestão de produtos
- [ ] **5.5** Testar romarias (se usado)
- [ ] **5.6** Testar quartos (se usado)
- [ ] **5.7** Verificar relatórios

**Resultado esperado:**
- Todas as funcionalidades funcionando
- Zero erros no console do navegador
- Zero erros no Supabase logs

---

## 📋 **ETAPA 6: COMMIT E PUSH** ⏱️ 5 minutos

- [ ] **6.1** Revisar arquivos criados na pasta `supabase/`
- [ ] **6.2** Adicionar ao git:
  ```bash
  git add supabase/
  git commit -m "docs: organizar estrutura do banco de dados"
  ```
- [ ] **6.3** Push para GitHub:
  ```bash
  git push origin master
  ```
- [ ] **6.4** Verificar no GitHub que arquivos foram commitados

**Resultado esperado:**
- Documentação versionada no repositório
- Histórico de mudanças preservado

---

## 🎯 **RESUMO DE TEMPO**

| Etapa | Tempo | Status |
|-------|-------|--------|
| 1. Análise Inicial | 10 min | ⬜ |
| 2. Backup | 15 min | ⬜ |
| 3. Limpeza (Opcional) | 5 min | ⬜ |
| 4. Documentação | 5 min | ⬜ |
| 5. Validação | 10 min | ⬜ |
| 6. Commit e Push | 5 min | ⬜ |
| **TOTAL** | **50 min** | |

---

## ✅ **CRITÉRIOS DE SUCESSO**

- [ ] Sistema funcionando 100%
- [ ] Documentação completa criada
- [ ] Backup realizado
- [ ] Tabelas duplicadas removidas (se aplicável)
- [ ] Código commitado e pushed
- [ ] Zero downtime para usuários

---

## 🚨 **PLANO DE ROLLBACK** (Se algo der errado)

### Se a limpeza causar problemas:

1. **Restaurar backup:**
   - Ir em Supabase → Settings → Database → Restore backup

2. **Re-criar tabelas removidas** (se necessário):
   ```sql
   -- Execute o schema_hotel.sql original novamente
   ```

3. **Verificar logs:**
   - Supabase → Logs → Database logs

4. **Contatar suporte:**
   - Se necessário, abrir ticket no Supabase

---

## 📞 **NOTAS FINAIS**

- ✅ Todas as queries estão em `relatorios.sql`
- ✅ Exemplos práticos estão em `GUIA-RAPIDO.md`
- ✅ Schemas completos estão em `schema-pdv.sql` e `schema-hotel.sql`
- ✅ Este checklist pode ser impresso ou usado como referência

---

**Boa execução! 🚀**
