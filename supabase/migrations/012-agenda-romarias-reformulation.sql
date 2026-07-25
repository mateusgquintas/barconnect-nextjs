-- 012: Reformulação Agenda do Hotel, Gestão de Quartos e Gestão de Romarias
-- Consolida no repositório as migrações já aplicadas diretamente no banco (projeto
-- hotelconnect, ref mmbvtsirybkbweoffbre) durante esta rodada de trabalho. Todos os passos
-- são idempotentes (IF NOT EXISTS) — seguro rodar tanto num banco novo quanto no banco que já
-- recebeu essas mudanças via MCP.

-- 1) numero_of_people passa a ser um campo por OCORRÊNCIA (varia a cada vinda da romaria),
--    não mais do grupo (pilgrimages.number_of_people fica deprecated, mantido só por
--    compatibilidade com a coluna NOT NULL legada).
ALTER TABLE public.pilgrimage_occurrences
  ADD COLUMN IF NOT EXISTS number_of_people integer DEFAULT 0;

ALTER TABLE public.pilgrimages
  ALTER COLUMN arrival_date DROP NOT NULL,
  ALTER COLUMN departure_date DROP NOT NULL;

-- 2) Parcelamento e pagamento das reservas (bloco financeiro da Nova Reserva).
ALTER TABLE public.room_reservations
  ADD COLUMN IF NOT EXISTS invoice_issued boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.reservation_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_reservation_id uuid NOT NULL REFERENCES public.room_reservations(id) ON DELETE CASCADE,
  installment_number integer NOT NULL DEFAULT 1,
  amount numeric NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  status varchar NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  payment_method varchar,
  received_date date,
  transaction_id uuid REFERENCES public.transactions(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservation_payments_reservation ON public.reservation_payments(room_reservation_id);

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS transaction_date date DEFAULT CURRENT_DATE;

ALTER TABLE public.reservation_payments DISABLE ROW LEVEL SECURITY;

-- 3) occurrence_id como fonte de verdade em room_reservations/transactions (em vez de só
--    pilgrimage_id), para distinguir "vinda de julho" de "vinda de agosto" da mesma romaria —
--    causa raiz das inconsistências de quartos/valores vistas entre calendário, card de
--    detalhe e edição.
ALTER TABLE public.room_reservations
  ADD COLUMN IF NOT EXISTS occurrence_id uuid REFERENCES public.pilgrimage_occurrences(id);

CREATE INDEX IF NOT EXISTS idx_room_reservations_occurrence ON public.room_reservations(occurrence_id);

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS occurrence_id uuid REFERENCES public.pilgrimage_occurrences(id);

CREATE INDEX IF NOT EXISTS idx_transactions_occurrence ON public.transactions(occurrence_id);

-- Backfill: liga reservas antigas (sem occurrence_id) à ocorrência cujas datas batem
-- exatamente com o check-in/check-out gravado.
UPDATE public.room_reservations rr
SET occurrence_id = po.id
FROM public.pilgrimage_occurrences po
WHERE rr.occurrence_id IS NULL
  AND rr.pilgrimage_id = po.pilgrimage_id
  AND rr.check_in_date = po.arrival_date
  AND rr.check_out_date = po.departure_date;

-- 4) Acompanhantes nomeados (reserva avulsa com mais de 1 pessoa).
CREATE TABLE IF NOT EXISTS public.reservation_companions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_reservation_id uuid NOT NULL REFERENCES public.room_reservations(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservation_companions_reservation ON public.reservation_companions(room_reservation_id);

ALTER TABLE public.reservation_companions DISABLE ROW LEVEL SECURITY;

-- 5) Gestão de Romarias: local/origem da romaria + número de ônibus por ocorrência.
ALTER TABLE public.pilgrimages
  ADD COLUMN IF NOT EXISTS origin varchar;

ALTER TABLE public.pilgrimage_occurrences
  ADD COLUMN IF NOT EXISTS number_of_buses integer;
