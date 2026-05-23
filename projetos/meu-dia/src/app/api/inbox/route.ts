import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { text, projects } = await req.json()

  if (!text?.trim()) {
    return NextResponse.json({ error: 'Texto vazio' }, { status: 400 })
  }

  const projectList = projects
    .map((p: { id: string; name: string }) => `- id: "${p.id}", nome: "${p.name}"`)
    .join('\n')

  const message = await client.messages.create({
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
  })

  const raw = (message.content[0] as { type: string; text: string }).text.trim()

  try {
    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Falha ao parsear resposta da IA', raw }, { status: 500 })
  }
}
