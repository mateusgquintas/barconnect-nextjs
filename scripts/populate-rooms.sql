-- Script para popular tabela rooms com 5 andares e 5 quartos por andar
-- Estrutura: id (serial), number (string), floor (int)

INSERT INTO rooms (number, floor)
VALUES
  ('101', 1), ('102', 1), ('103', 1), ('104', 1), ('105', 1),
  ('201', 2), ('202', 2), ('203', 2), ('204', 2), ('205', 2),
  ('301', 3), ('302', 3), ('303', 3), ('304', 3), ('305', 3),
  ('401', 4), ('402', 4), ('403', 4), ('404', 4), ('405', 4),
  ('501', 5), ('502', 5), ('503', 5), ('504', 5), ('505', 5);
