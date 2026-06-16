import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wwnubuqqstssaazisvjy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bnVidXFxc3Rzc2Fhemlzdmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTYyMzQsImV4cCI6MjA4Njc3MjIzNH0.iWvTcuTS0U5y8xeSfRFP3tyrK2sW5KQ0KoIs7KOo0WY'
)

const GUSTAVO_ID = '3eb2bd57-da2d-42be-be3a-8e009a19e33f'

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

type SeedTicket = {
  title: string; description: string; type: string; status: string
  priority?: string; assignee_id: string | null; created_at: string; closed_at?: string
}

const tickets: SeedTicket[] = [
  {
    title: 'Sistema de pagamentos fora do ar',
    description: 'O gateway de pagamento PagSeguro está retornando erro 503 para todas as transações desde as 14h30. Aproximadamente 250 clientes foram afetados, com perda estimada de R$ 48.000 em vendas nas últimas 2 horas. O erro aparece tanto no checkout web quanto no app mobile. Equipe de infraestrutura já foi acionada.',
    type: 'INCIDENT',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignee_id: GUSTAVO_ID,
    created_at: daysAgo(2),
  },
  {
    title: 'Falha na sincronização de estoque entre filiais',
    description: 'A sincronização automática de estoque entre a filial de Belo Horizonte e a matriz está falhando desde a última atualização do ERP (v3.2.1). Pedidos duplicados estão sendo gerados para itens já esgotados. Clientes estão recebendo confirmação de pedidos sem disponibilidade real em estoque.',
    type: 'INCIDENT',
    priority: 'MEDIUM',
    status: 'TODO',
    assignee_id: null,
    created_at: daysAgo(1),
  },
  {
    title: 'Timeout no relatório de vendas mensais',
    description: 'O relatório de vendas mensais está expirando após 30 segundos antes de completar a geração. Afeta apenas relatórios com filtro de período superior a 3 meses. Workaround: dividir o período em consultas mensais separadas.',
    type: 'INCIDENT',
    priority: 'LOW',
    status: 'DONE',
    assignee_id: GUSTAVO_ID,
    created_at: daysAgo(5),
    closed_at: daysAgo(4),
  },
  {
    title: 'Investigação: degradação de performance na API de consultas',
    description: 'Nos últimos 7 dias foi identificado um aumento de 340% no tempo de resposta médio do endpoint /api/v2/queries. P95 passou de 120ms para 520ms. Análise preliminar aponta possível índice ausente ou problema de query N+1. Profiling com New Relic em andamento. Sem impacto direto ao usuário final ainda, mas tendência preocupante.',
    type: 'PROBLEM',
    status: 'IN_PROGRESS',
    assignee_id: GUSTAVO_ID,
    created_at: daysAgo(3),
  },
  {
    title: 'Vazamento de memória no serviço de notificações',
    description: 'O microserviço notification-svc está consumindo memória de forma crescente até atingir OOM após aproximadamente 72h de uptime, forçando reinicialização manual. O ciclo se repete a cada restart. Bloqueado aguardando acesso de leitura aos logs de produção no ambiente AWS — solicitação aberta com o time de cloud há 3 dias.',
    type: 'PROBLEM',
    status: 'BLOCKED',
    assignee_id: null,
    created_at: daysAgo(6),
  },
  {
    title: 'Módulo de aprovação de orçamentos com workflow multinível',
    description: 'Desenvolver fluxo de aprovação de orçamentos com múltiplos níveis hierárquicos. Requisitos: alçadas por valor (Gerente até R$10k, Diretor até R$50k, VP acima disso), notificações automáticas por e-mail e WhatsApp, prazo de resposta configurável por nível com escalada automática, histórico completo de aprovações auditável por compliance.',
    type: 'DEMAND',
    status: 'TODO',
    assignee_id: null,
    created_at: daysAgo(4),
  },
  {
    title: 'Integração com plataforma de e-learning corporativo (Moodle)',
    description: 'Integrar o portal de RH com a plataforma Moodle corporativo para sincronização automática de matrículas, progresso e emissão de certificados. Escopo técnico: SSO via SAML 2.0, webhook para eventos de conclusão de curso, API REST para matrícula em lote e dashboard consolidado no portal de RH com indicadores de adesão por departamento.',
    type: 'DEMAND',
    status: 'IN_PROGRESS',
    assignee_id: GUSTAVO_ID,
    created_at: daysAgo(7),
  },
  {
    title: 'Exportação em Excel no relatório de clientes ativos',
    description: 'Adicionar botão de exportação em formato .xlsx no relatório de clientes ativos. O arquivo deve incluir todas as colunas visíveis na tabela com cabeçalhos em português, formatação de datas no padrão dd/mm/aaaa, valores monetários formatados e uma planilha separada com resumo estatístico (total de clientes, ticket médio, distribuição por região).',
    type: 'REQUEST',
    status: 'DONE',
    assignee_id: GUSTAVO_ID,
    created_at: daysAgo(8),
    closed_at: daysAgo(7),
  },
  {
    title: 'Autenticação de dois fatores obrigatória para perfis administrativos',
    description: 'Implementar 2FA obrigatório para todos os usuários com perfil "administrador" e "gerente". Suportar TOTP (compatível com Google Authenticator e Authy) como método primário e SMS como fallback. Incluir tela de configuração no painel de conta, fluxo de recuperação de acesso e período de carência de 7 dias para adoção.',
    type: 'REQUEST',
    status: 'TODO',
    assignee_id: null,
    created_at: daysAgo(2),
  },
  {
    title: 'Atualização da política de senhas conforme novas diretrizes de segurança',
    description: 'Atualizar validação de senha para conformidade com diretrizes de TI: mínimo 12 caracteres, obrigatório letras maiúsculas e minúsculas, números e símbolos especiais. Implementar verificação contra lista de senhas comprometidas via HaveIBeenPwned API, histórico de últimas 6 senhas e notificação de expiração com 30 dias de antecedência.',
    type: 'REQUEST',
    status: 'DONE',
    assignee_id: GUSTAVO_ID,
    created_at: daysAgo(10),
    closed_at: daysAgo(9),
  },
]

let created = 0
for (const ticket of tickets) {
  const { error } = await supabase.from('tickets').insert(ticket)
  if (error) {
    console.error(`✗ "${ticket.title}": ${error.message}`)
  } else {
    console.log(`✓ ${ticket.type} [${ticket.status}] — ${ticket.title}`)
    created++
  }
}

console.log(`\n${created}/${tickets.length} chamados criados.`)

// Check storage bucket
const { data: buckets } = await supabase.storage.listBuckets()
const hasBucket = buckets?.some(b => b.name === 'ticket-attachments')
if (hasBucket) {
  console.log('\n✓ Bucket "ticket-attachments" encontrado no Storage.')
} else {
  console.log('\n⚠ Bucket "ticket-attachments" NÃO encontrado.')
  console.log('  Para habilitar anexos, crie o bucket no painel do Supabase:')
  console.log('  Storage → New bucket → Name: "ticket-attachments" → Public: ON')
}
