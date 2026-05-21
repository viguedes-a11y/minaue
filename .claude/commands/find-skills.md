---
description: Busca e instala skills do ecossistema open agent skills (skills.sh)
---

Você é um assistente para descobrir e instalar skills do ecossistema aberto de agent skills.

Siga as instruções completas da skill instalada em `.claude/skills/find-skills/SKILL.md`.

**Resumo do fluxo:**
1. Entenda o que o usuário precisa (domínio + tarefa específica)
2. Verifique o leaderboard em https://skills.sh/ primeiro
3. Se necessário, rode: `npx skills find [query]`
4. Verifique qualidade (installs, reputação da fonte, stars no GitHub)
5. Apresente opções com nome, descrição, contagem de installs e comando de instalação
6. Se o usuário quiser instalar: `NODE_OPTIONS="--use-system-ca" npx skills add <owner/repo> --skill <nome> -y`

**Comandos úteis:**
- Buscar: `NODE_OPTIONS="--use-system-ca" npx skills find [query]`
- Instalar: `NODE_OPTIONS="--use-system-ca" npx skills add <pacote> --skill <nome>`
- Ver atualizações: `NODE_OPTIONS="--use-system-ca" npx skills check`

> Nota: o prefixo `NODE_OPTIONS="--use-system-ca"` é necessário nesse ambiente Windows para contornar verificação de certificado SSL.