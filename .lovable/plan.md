## Objetivo

Tornar a escolha de design (Clássico/Noir) e o modo (Claro/Escuro) uma **configuração global** definida pelo admin e aplicada a todos os usuários — inclusive na página `/auth` (antes do login).

---

## Mudanças

### 1. Backend — tabela de configurações globais

Nova tabela `public.app_settings` (singleton, uma linha):

```
id            uuid pk default gen_random_uuid()
singleton     boolean unique default true  -- garante 1 linha só
design_variant text not null default 'classic'  -- 'classic' | 'noir'
theme_mode     text not null default 'light'    -- 'light' | 'dark'
updated_at    timestamptz default now()
updated_by    uuid references auth.users(id)
```

GRANTs + RLS:
- `SELECT` liberado para `anon` e `authenticated` (precisa ser lida antes do login em `/auth`).
- `UPDATE` apenas para admins (`public.has_role(auth.uid(), 'admin')`).
- `INSERT` bloqueado no cliente; seed via migration insere a linha inicial.

Realtime: habilitar replicação na tabela para propagar mudança sem refresh.

### 2. Frontend — hook e provider global

- Novo `src/hooks/useGlobalDesign.tsx`:
  - Faz `SELECT` na `app_settings` no boot (antes de renderizar rotas).
  - Assina Realtime; quando muda, aplica `.theme-noir` e `.dark` no `<html>`.
  - Expõe `{ designVariant, themeMode, setDesign, setTheme }` (setters chamam `UPDATE`, permitido só para admin via RLS).
- `src/main.tsx`: remover leitura de `localStorage` do variant. Antes de montar, fazer fetch síncrono da linha (com fallback para defaults) para evitar flash. Aplicar classes no `<html>` imediatamente.
- `src/App.tsx`: envolver com `GlobalDesignProvider`.

### 3. Controles do admin

- `DesignVariantToggle.tsx`: passa a chamar `setDesign` global (não mais `localStorage`).
- `ThemeToggle.tsx`: quando o usuário for **admin**, alterna o modo global (grava na tabela). Para não-admins, o botão é ocultado (o modo é imposto globalmente) — ou fica desabilitado com tooltip "Definido pelo admin". Decisão default: **ocultar** para não-admins.
- `HeaderControls.tsx`: exibir `ThemeToggle` apenas se `isAdmin`.

### 4. Página /auth

- Já usa classes globais; ao aplicar `.theme-noir` / `.dark` no `<html>` no boot, herda automaticamente.
- Ajustar `Auth.tsx` para respeitar os tokens do design (hoje tem cores hardcoded `#191022`, `#7f13ec`, background image roxa fixa). Adicionar variante visual quando `.theme-noir` estiver ativo: fundo preto, acentos dourados, sem gradiente roxo. Mantém visual atual quando classic.

---

## Detalhes técnicos

**Migration** (schema + grants + RLS + seed + realtime):

```sql
create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null unique default true,
  design_variant text not null default 'classic' check (design_variant in ('classic','noir')),
  theme_mode text not null default 'light' check (theme_mode in ('light','dark')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

grant select on public.app_settings to anon, authenticated;
grant update on public.app_settings to authenticated;
grant all on public.app_settings to service_role;

alter table public.app_settings enable row level security;

create policy "read settings" on public.app_settings for select to anon, authenticated using (true);
create policy "admin update settings" on public.app_settings for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.app_settings (singleton) values (true) on conflict do nothing;

alter publication supabase_realtime add table public.app_settings;
```

**Boot flow em `main.tsx`**:
1. Fetch `app_settings` via `supabase.from('app_settings').select().single()`.
2. Aplicar `.theme-noir` e `.dark` no `<html>` conforme resposta.
3. Montar `<App />`. Se fetch falhar, aplicar defaults (`classic` + `light`).

**Realtime**: Provider assina `postgres_changes` em `app_settings` e re-aplica classes automaticamente em todos os clientes abertos.

---

## Arquivos afetados

- **novo**: migration SQL, `src/hooks/useGlobalDesign.tsx`
- **editado**: `src/main.tsx`, `src/App.tsx`, `src/components/DesignVariantToggle.tsx`, `src/components/ThemeToggle.tsx`, `src/components/HeaderControls.tsx`, `src/pages/Auth.tsx` (variante noir)

## Fora de escopo

- Preferência individual de tema por usuário (será removida — passa a ser global).
- Migração de valores antigos do `localStorage` (será ignorado a partir da mudança).
