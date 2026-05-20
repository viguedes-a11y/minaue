# Minaue — Claude Code OS

## O que é esse workspace

Workspace de trabalho da Vivi Guedes para o projeto Minaue — arte de mandalas com técnica própria (Floral Fluido). Central de criação de conteúdo, gestão dos produtos digitais e organização do caminho para renda 100% online e multilíngue.

**Estrutura de pastas:**
- `conteudo/` — roteiros, carrosseis e legendas para redes sociais
- `projetos/` — cada produto digital tem sua subpasta
- `idiomas/` — materiais em espanhol e inglês (traduções, dublagens, adaptações)
- `encomendas/` — gestão das encomendas de mandalas pintadas
- `dados/` — drop zone para arquivos a analisar (vídeos, imagens, CSVs, PDFs)
- `templates/skills/` — templates de skills prontos para personalizar com /mapear
- `templates/ferramentas/catalogo.md` — APIs e ferramentas disponíveis para usar em skills

## Sobre o negócio

Minaue é a marca de arte de Viviane Guedes (Vivi), fundada em 2015. A técnica é o Floral Fluido — uma metodologia e identidade artística própria desenvolvida ao longo de 11 anos. O slogan é "Mandalas que Florescem". O grande objetivo por trás de tudo é conquistar liberdade geográfica e se mudar para Valencia, Espanha, em 2028. Os produtos digitais — vendáveis online em qualquer idioma — são o caminho para isso.

## Produtos

- **Curso Básico** (gravado em 2022) — sendo dublado para espanhol (Vivi) e inglês (Connie, cunhada)
- **Ebook "Sua Mandala no Mundo"** — em produção, ensina artistas a venderem sua arte nas redes sociais
- **Curso Avançado** — planejado para o futuro
- **Encomendas** — mandalas pintadas à mão, por enquanto só para o Brasil (limitação de envio)
- Outros produtos menores em mente

## Equipe

- **Vivi** — tudo
- **Taina** (filha, 18 anos) — edição de vídeo
- **Connie** (cunhada) — dublagem do curso para inglês e tráfego pago para os EUA

## Estratégia de conteúdo

Pintar 2 mandalas por semana, gravar de múltiplos ângulos, editar com legendas em 3 idiomas (PT, ES, EN). Publicar no Instagram, TikTok, YouTube Shorts e talvez Pinterest. Link na bio → seletor de idioma → página do curso no idioma correspondente. Foco em atingir público global.

## Tom de voz

Voz próxima e direta, como conversa com alguém de confiança. Frases com detalhes reais e concretos. Tom espiritual mas acessível, nunca hermético. Seguro, sem hesitação.

## Ferramentas conectadas

- Notion — organização e planejamento
- Canva — criação visual
- Google Drive — armazenamento dos vídeos editados

---

## Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (se existirem e estiverem configurados):

1. `_contexto/empresa.md` — quem é a Vivi, o que faz, como funciona o negócio
2. `_contexto/preferencias.md` — tom de voz, estilo de escrita, o que evitar
3. `_contexto/estrategia.md` — foco atual, prioridades, o que pode esperar

Usar essas informações como base para qualquer resposta ou decisão. Ao sugerir prioridades, formatos ou abordagens, considerar o foco atual descrito em `estrategia.md`.

Para qualquer tarefa visual (carrossel, proposta, slide, landing page), consultar `marca/design-guide.md` como referência de estilo.

Não é necessário listar o que foi lido nem confirmar a leitura. Apenas usar o contexto naturalmente.

---

## Fluxo de trabalho

Antes de executar qualquer tarefa, verificar se existe uma skill relevante em `.claude/skills/` ou `.claude/commands/`.
Se encontrar, seguir as instruções da skill.
Se não encontrar, executar a tarefa normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível, perguntar:

> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

Não perguntar para tarefas pontuais ou perguntas simples. Só quando o padrão de repetição for claro.

---

## Aprender com correções

Quando a Vivi corrigir algo, melhorar uma resposta ou dar uma instrução que parece permanente, perguntar:

> "Quer que eu salve isso pra não precisar repetir?"

Se sim, identificar onde faz mais sentido salvar:

- **Sobre o negócio** → `_contexto/empresa.md`
- **Sobre preferências e estilo** → `_contexto/preferencias.md`
- **Sobre prioridades e foco atual** → `_contexto/estrategia.md`
- **Regra de comportamento nessa pasta** → `CLAUDE.md`

---

## Manter contexto atualizado

Ao terminar uma tarefa que mudou algo relevante no projeto, perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize os arquivos de memória?"

**Quando NÃO perguntar:**
- Tarefas pontuais que não mudam o contexto
- Perguntas simples ou conversas sem ação

---

## Criação de skills

Quando a Vivi pedir para criar uma nova skill:

1. Verificar se existe um template relevante em `templates/skills/`
2. Perguntar: "Essa skill é específica pra esse projeto ou vai ser útil em qualquer projeto?"
3. Ler `_contexto/empresa.md` e `_contexto/preferencias.md` para calibrar o conteúdo ao contexto do negócio
4. Se precisar de arquivos de apoio, criar dentro da pasta da skill
