import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada no servidor' }, { status: 500 })
  }

  const { text, projects } = await req.json()
  if (!text?.trim()) {
    return NextResponse.json({ error: 'Texto vazio' }, { status: 400 })
  }

  const projectList = projects
    .map((p: { id: string; name: string }) => `- id: "${p.id}", nome: "${p.name}"`)
    .join('\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Você é um assistente de organização pessoal. Analise a tarefa abaixo e retorne um JSON com os campos indicados.

Projetos disponíveis:
${projectList}

Tarefa: "${text}"

Retorne APENAS um JSON válido (sem markdown, sem explicação) com esta estrutura:
{
  "title": "título limpo e objetivo da tarefa",
  "projectId": "id do projeto mais adequado (escolha o que melhor se encaixa pelo contexto)",
  "priority": "alta" | "media" | "baixa",
  "deadline": "YYYY-MM-DD ou null se não mencionado",
  "description": "detalhes adicionais se houver, senão null"
}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `Erro da API Anthropic: ${res.status} — ${err}` }, { status: 500 })
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text?.trim() ?? ''

  try {
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({ error: 'Falha ao parsear resposta da IA', raw }, { status: 500 })
  }
}

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return NextResponse.json({ ok: false, reason: 'ANTHROPIC_API_KEY não definida' })
  return NextResponse.json({ ok: true, prefix: key.slice(0, 10) + '...' })
}
