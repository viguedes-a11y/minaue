# Andamento — Limpeza e velocidade do computador

> Atualizado em 2026-11-23

## Onde estamos
- Tarefa: deixar o computador (Windows 10, Lenovo) mais rápido. Sem skill específica; feito direto.
- Fase 1 (diagnóstico, só leitura) concluída. Fase 2 (executar as remoções aprovadas) em andamento.
- Última pergunta feita: "quais itens posso executar?" — a pessoa respondeu aprovando TODOS os itens + uma lista extra de programas pra apagar.

## O que a pessoa contou e decidiu
- Diagnóstico principal: a lentidão é falta de RAM (3,9 GB total, só 0,4 GB livre). Disco está folgado (C: 292 GB livres, D: 815 GB livres).
- A pessoa aprovou executar TODAS as opções que listei (itens 1 a 8 e 10 a 16).
- Além disso, mandou apagar estes programas, que ela disse NÃO usar:
  - VS Code (não usa mais)
  - Obsidian
  - Auroq ("não uso") — ATENÇÃO: é o app que roda esta conversa; não aparece como programa removível; NÃO apagar pra não quebrar o ambiente.
  - Office 2019
  - Google Drive (desktop) — "nunca funcionou"
  - Microsoft Edge + Copilot (prefere usar o Chrome) — Edge não desinstala de verdade no Win10; feito: tirar do início + remover Copilot.
  - Skype, Vincular ao Celular (Your Phone), Obter Ajuda (Get Help), Mapas, Clima (Bing), 3D Viewer, Mixed Reality, Feedback Hub, Groove/Filmes (Zune), Lenovo Service Bridge.
- Mantidos (ferramentas que a IA usa / trabalho): Claude, ChatGPT, Codex, Git, GitHub CLI, Node.js, Python, Notion, TickTick, Chrome, WinRAR, Zoom.

## O que já foi feito
- Diagnóstico completo (disco, inicialização, processos, RAM, programas, caches, Downloads).
- (As remoções estão sendo executadas nesta sessão; registrar aqui conforme concluir.)

## O que falta
1. Remover apps da Loja aprovados.
2. Tirar do início do Windows: Notion, TickTick, auto-abrir do Edge, Google Drive.
3. Desinstalar VS Code, Obsidian, Office 2019, Google Drive, Java 8, Lenovo Service Bridge.
4. Trocar Avast (Free + AntiTrack) pelo Defender do Windows.
5. Limpar cache Chrome/Edge, Lixeira (343 MB) e instaladores velhos do Downloads (~3 GB).
6. Conferir e relatar o que foi feito.

## Entregue só na conversa

### Diagnóstico (só leitura)
- DISCO: C: 465 GB total / 292 GB livres (63%). D: 930 GB total / 815 GB livres (88%).
- RAM: 3,9 GB total, 0,4 GB livre. ESTE é o gargalo da lentidão.
- Iniciam com o Windows: GoogleDriveFS, TickTick, electron.app.Notion, MicrosoftEdgeAutoLaunch, SecurityHealth, RtkAudUService, AvastUI.exe.
- Top processos (RAM): claude 860 MB; ChatGPT 275 MB (25 processos); chrome 241 MB; Memory Compression 167; svchost 162; AvastSvc 128; AvastUI 73.
- Temp/caches: Temp usuário 17 MB; Temp Windows 4 MB; Windows Update 0; Cache Chrome 378 MB; Cache Edge 365 MB; Prefetch 4 MB. Lixeira 343 MB.
- Downloads: 4.708 MB em 928 arquivos. Maiores: IMG_1094.MOV 464 MB; FreeCAD installer 408; NCE5.0 303 + 303; Obsidian-1.12.7.exe 281; anki 192; auroq-os-windows-setup.exe 186; Claude Setup 151 + 151; Notion Setup (4 versões) 96+96+93+85; vídeo .mov 87; jre-8u371 62; qcad 62; Ebook Stories.pdf 62; Materiais Módulo 01.zip 57.
- Programas instalados (área de trabalho): Copilot 5241 MB; Edge 5241; VS Code 1012 (2714 na pasta Programs); Chrome 512; Git 336; Java 8 197; Python 173; Node.js 102; TickTick 74; GitHub CLI 39; Lenovo Service Bridge 20; VC++ 2008 10; + Office 2019, Avast Free, Avast AntiTrack, Google Drive, WinRAR, Zoom, Obsidian, Notion.
- Apps da Loja (MB): Codex 1803; Photos 881; Claude 764; HPPrinterControl 441; YourPhone 359; Skype 319; GetHelp 270; comm apps 207; OneNote 142; IntelGraphics 125; Office OneNote; 3DViewer 66; Zune Music 36 / Video 33; Bing Weather 30; Maps 43; StickyNotes 39; FeedbackHub 38; Xbox overlay 34; MixedReality 18; etc.

### Opções apresentadas (todas aprovadas pela pessoa)
- ACELERAR: (1) trocar Avast pelo Defender; (2) tirar Notion/TickTick/Edge-autostart do início; (3) hábito de não deixar várias IAs abertas; (4) [honesto] o conserto real é mais RAM (4→8 GB), peça/dinheiro.
- LIMPAR DISCO (libera espaço, não acelera): (5) instaladores velhos do Downloads ~3 GB; (6) Lixeira 343 MB; (7) cache Chrome+Edge ~740 MB.
- DESINSTALAR: (8) Java 8; (10) Java; (11) Skype 319; (12) Get Help 270; (13) Your Phone 359; (14) HP Printer Control 441 (só se não tem impressora HP); (15) Mapas/Clima/3D Viewer/Mixed Reality/Feedback Hub/Zune ~250 MB; (16) Lenovo Service Bridge 20.
