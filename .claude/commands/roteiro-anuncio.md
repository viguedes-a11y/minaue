---
name: roteiro-anuncio
description: >
  Gera roteiros de vídeo para anúncios na Meta Ads dentro dos conceitos do Meta Andromeda.
  Cria 3 variações de hook, corpo e CTA calibrados para o Floral Fluido e a persona Camila.
  Inclui briefing pronto para a Taina editar.
  Use quando a Vivi disser "cria um roteiro de anúncio", "faz um criativo pra Meta",
  "preciso de hook pra anúncio", "roteiro de ad", "criativo pra tráfego".
---

# /roteiro-anuncio — Roteiro de Anúncio Meta Ads

## Dependências

- `_contexto/empresa.md`
- `_contexto/preferencias.md`
- `_contexto/personas.md`

---

## Conceitos do Meta Andromeda embutidos nesta skill

O Meta Andromeda é o sistema de IA da Meta que decide quem vê cada anúncio. Ele aprende com base no criativo — não na segmentação manual. Isso muda tudo na hora de criar o roteiro:

1. **O hook (0–3s) é o ativo mais importante.** A IA usa a taxa de retenção nos primeiros 3 segundos para decidir se continua distribuindo o anúncio. Hook fraco = alcance caro.
2. **Público amplo funciona melhor.** O algoritmo encontra quem vai comprar se o criativo for específico o suficiente. Não segmentar demais.
3. **Variações de hook são obrigatórias.** Testar 3 hooks no mesmo corpo permite que o Andromeda otimize automaticamente. Sempre gerar 3 versões.
4. **Autenticidade supera produção.** Vídeo de processo real, câmera próxima, mão pintando — converte mais que anúncio polido de estúdio.
5. **Legenda sempre ativa.** A maioria assiste sem som. O texto na tela e o áudio precisam funcionar de forma independente.
6. **CTA direto, sem rodeios.** "Link na bio", "Clica no link" — sem criar suspense ou enrolar.

---

## Workflow

### Passo 1 — Perguntar o objetivo

Perguntar à Vivi:

1. **Objetivo do anúncio:**
   - A) Atrair (fazer novas pessoas descobrirem o curso — topo de funil)
   - B) Converter (fazer quem já conhece comprar — fundo de funil)
   - C) Retargeting (falar com quem já visitou a página ou salvou post)

2. **Tem algum ângulo ou ideia específica que quer explorar?** (pode deixar em branco para a skill decidir)

### Passo 2 — Ler o contexto

Ler `_contexto/empresa.md`, `_contexto/preferencias.md` e `_contexto/personas.md` para calibrar:
- Persona alvo (para anúncio de curso: Camila)
- Tom (próximo, direto, espiritual mas ancorado no concreto)
- O que evitar (travessão, imperativo pesado, metáforas vazias)

### Passo 3 — Gerar o roteiro

Gerar sempre nesta estrutura:

---

#### BLOCO 1 — 3 VARIAÇÕES DE HOOK (0–3s)

Cada hook é uma frase dita ou texto na tela nos primeiros 3 segundos. Deve parar o scroll. Testar ângulos diferentes: curiosidade, identificação com dor, afirmação contraintuitiva.

Formato de cada hook:
```
Hook A: [frase de abertura]
Hook B: [frase de abertura alternativa]
Hook C: [frase de abertura alternativa]
```

Regras do hook:
- Máximo 10 palavras
- Começa com o mais forte — não com apresentação
- Específico para a persona Camila (artista que quer viver do que faz)
- Nenhum hook começa com "Você sabia que..." ou "Oi, eu sou..."
- Pode ser pergunta, afirmação ousada ou frase incompleta que força o cérebro a continuar

---

#### BLOCO 2 — CORPO DO VÍDEO (3–20s)

Segue o hook escolhido. Quebra a objeção principal da Camila ou aprofunda a promessa.
Escrito em narração (o que a Vivi fala) + instrução visual (o que aparece na tela).

Formato:
```
[0-3s] VISUAL: [descrever o que mostrar]
        FALA: [hook escolhido]

[3-10s] VISUAL: [descrever o que mostrar]
         FALA: [corpo — quebra de objeção ou desenvolvimento da promessa]

[10-20s] VISUAL: [descrever o que mostrar]
          FALA: [continuação + transição para CTA]
```

---

#### BLOCO 3 — CTA (20–25s)

Direto. Sem suspense. Sem criatividade forçada.

Formato:
```
[20-25s] VISUAL: [tela final ou resultado da mandala]
          FALA: [CTA direto]
          TEXTO NA TELA: [versão do CTA para quem assiste sem som]
```

CTAs que funcionam (escolher o mais adequado ao objetivo):
- "O link tá na bio, o curso começa hoje."
- "Clica no link e vê como funciona."
- "Acessa o curso — o link tá aqui."

---

#### BLOCO 4 — BRIEFING PARA A TAINA

Resumo prático para enviar para edição:

```
BRIEFING — ANÚNCIO [objetivo]
Duração: 25s
Formato: 9:16 (Reels/Stories)

CLIPS NECESSÁRIOS:
- [listar os clips específicos que a Vivi precisa separar do acervo]

EDIÇÃO:
- Corte no ritmo da fala, sem música que cubra a narração
- Legenda sempre visível (fonte clara, contraste alto)
- Sem transições elaboradas — foco no material
- Resultado final nos primeiros 3 segundos

TEXTO NA TELA:
- [listar os textos que aparecem em cada momento]
```

---

### Passo 4 — Salvar

Salvar em `conteudo/anuncios/roteiro-anuncio-[objetivo]-[data].md`

Se a pasta não existir, criar.

---

## Regras desta skill

- Sempre gerar 3 variações de hook — nunca só 1
- Nenhum roteiro começa com apresentação da Vivi ou do curso
- O visual e a fala precisam funcionar de forma independente (quem assiste sem som entende tudo pelo texto na tela)
- Tom segue `_contexto/preferencias.md` estritamente — sem imperativo pesado, sem metáforas vazias
- O roteiro é escrito para a Camila, não para qualquer artista genérica
- Cada roteiro gerado é um criativo separado — não misturar objetivos no mesmo vídeo
- Após gerar, perguntar: "Quer que eu faça variações com outro ângulo de hook?"
