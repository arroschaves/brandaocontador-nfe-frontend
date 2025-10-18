# Frontend — React + Vite

Aplicação frontend do Sistema NFe construída com React + Vite.

## Requisitos
- Node `>=20` (alinhado com CI/Vercel)
- npm 9+ recomendado

## Desenvolvimento
```bash
npm ci          # instala dependências
npm run dev     # inicia servidor de desenvolvimento
```
- Abra `http://localhost:3000/`.
- HMR habilitado; alterações em `src/` recarregam automaticamente.

## Build e Preview
```bash
npm run build    # gera build de produção em dist/
npm run preview  # serve dist/ para validação (porta padrão 4173)
```

## Ambiente
- Variáveis `VITE_*` via `.env.development`, `.env.production` e `vercel.json`.
- Principal: `VITE_API_URL` (URL do backend).
- Em desenvolvimento, há um banner de status do backend (usa `VITE_API_URL`).

## Deploy (Vercel)
- Push no repositório `frontend` aciona build automático na Vercel.
- Build usa Node 20 e `vite build`; saída publicada de `dist/`.

## Configurações
- Porta de dev: configurada em `vite.config.ts` (`server.port = 3000`).
- Alias `@` aponta para `src/`.

## Referências
- Vite: https://vitejs.dev
- React: https://react.dev
