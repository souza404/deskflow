<div align="center">

# DeskFlow

**Helpdesk moderno com visual Liquid Glass Dark**

React 19 · Vite 6 · Tailwind CSS 4

</div>

---

## Visão geral

DeskFlow é uma SPA de helpdesk com três módulos principais:

| Módulo | Descrição |
|--------|-----------|
| **Portal** | Abertura de chamados pelo usuário final, com upload de anexos |
| **Kanban** | Board com drag-and-drop para agentes gerenciarem chamados |
| **Dashboard** | Métricas de SLA, tempo de resposta e status geral |

Inclui exportação de relatórios em PDF e timers de SLA com alerta de violação de prazo.

## Requisitos

- Node.js 18+

## Instalação

```bash
git clone <repo>
cd deskflow
npm install
cp .env.example .env
```

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento em http://localhost:3000
npm run build    # Build de produção (saída em dist/)
npm run preview  # Serve o build de produção localmente
npm run lint     # Type-check TypeScript (tsc --noEmit)
```

## Estrutura principal

```
src/
├── views/
│   ├── Portal.tsx              # Submissão de chamados
│   ├── Kanban.tsx              # Board de agentes
│   └── Dashboard.tsx           # Analytics e SLA
├── components/
│   ├── layout/Layout.tsx       # Nav bar e chrome global
│   ├── ui/GlassCard.tsx        # Primitivo visual base
│   ├── SLATimer.tsx            # Countdown com alerta de breach
│   └── TicketDetailModal.tsx   # Modal de visualização/edição
└── data/mock.ts                # Dados em memória (tickets, clientes, agentes)
```

## Stack

- **React 19** + **Vite 6**
- **Tailwind CSS 4** — tema Liquid Glass Dark
- **better-sqlite3** — instalado, pronto para persistência futura
