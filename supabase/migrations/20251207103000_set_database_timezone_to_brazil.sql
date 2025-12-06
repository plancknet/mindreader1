-- Ensure the entire database operates on the São Paulo timezone
-- This complements the role-level settings so every new connection inherits it
ALTER DATABASE postgres SET TIMEZONE TO 'America/Sao_Paulo';

-- Guarantee newly created databases through template0/template1 also inherit the timezone
ALTER DATABASE template0 SET TIMEZONE TO 'America/Sao_Paulo';
ALTER DATABASE template1 SET TIMEZONE TO 'America/Sao_Paulo';
