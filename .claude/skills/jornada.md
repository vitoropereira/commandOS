---
name: jornada
description: Atualiza o diario de bordo do CommandOS (docs/JORNADA.md) com uma entrada narrativa do que foi feito na sessao atual. Use quando o usuario pedir para registrar o progresso, encerrar o dia, ou atualizar a jornada.
---

# Skill: /jornada

Voce e o cronista oficial do CommandOS. Sua missao e atualizar `docs/JORNADA.md` com uma nova entrada que conte a historia real do que aconteceu nesta sessao.

## Como executar

### 1. Ler o estado atual

Leia `docs/JORNADA.md` inteiro para entender:
- Qual e o ultimo dia registrado e seu numero
- O tom e estilo das entradas anteriores
- Onde inserir a nova entrada (antes da secao "Decisoes de Design")

### 2. Coletar o que aconteceu

Revise a conversa atual e identifique:
- **O que foi construido** — arquivos criados, features implementadas, bugs corrigidos
- **Decisoes tomadas** — por que fizemos X e nao Y, o raciocinio por tras
- **O que deu errado** — bugs encontrados, hipoteses que falharam, becos sem saida
- **Descobertas** — coisas que aprendemos, padroes que identificamos
- **Momentos marcantes** — o primeiro build passando, um bug misterioso, uma solucao elegante
- **Commits feitos** — hash e mensagem de cada commit da sessao
- **Status e proximos passos** — onde paramos e o que vem depois

### 3. Escrever no tom certo

A JORNADA.md **nao e changelog**. E um diario de bordo narrativo. Escreva assim:

**Tom:** Mix de tecnico e casual. Como se estivesse contando pra um colega desenvolvedor o que rolou no dia — com profundidade tecnica mas sem formalidade excessiva.

**Estrutura de cada dia:**
```markdown
---

## Dia N — YYYY-MM-DD | Titulo que resuma o dia

### [Subtitulo narrativo]

[Paragrafo contando o que aconteceu, por que, e como. Incluir contexto,
raciocinio, e detalhes tecnicos relevantes. Nao ter medo de contar o que
deu errado — os erros sao tao importantes quanto os acertos.]

### [Proximo subtitulo]

[Continuar a narrativa...]

### Commits do dia

- `hash` — mensagem do commit
- `hash` — mensagem do commit

### Proximos passos

- [ ] O que ficou pendente
- [ ] O que queremos fazer na proxima sessao
```

**Regras de escrita:**
- Contar o *por que* das decisoes, nao so o *o que*
- Incluir tentativas que falharam e becos sem saida
- Descrever hipoteses testadas e como foram validadas/descartadas
- Registrar sensacoes e momentos marcantes entre aspas ou de forma natural
- Codigo inline quando ajuda a explicar (`arquivo.ts`, `funcao()`, flags)
- Blocos de codigo quando mostra um resultado concreto (output de terminal, config)
- Cada dia e uma historia completa com comeco, meio e fim
- **Nunca** escrever como bullet list seca — sempre pargrafos com narrativa
- Portugues brasileiro sem acentos (padrao do projeto)

### 4. Inserir no lugar certo

A nova entrada vai **antes** da secao `## Decisoes de Design` (ou `## Roadmap` se nao existir secao de decisoes). Mantenha a separacao com `---` entre dias.

### 5. Se houver novas decisoes de design

Se durante a sessao alguma decisao arquitetural importante foi tomada, adicione na secao `## Decisoes de Design` tambem.

### 6. Commitar e pushar

Depois de escrever, faca:
```
git add docs/JORNADA.md
git commit -m "docs: update JORNADA.md — [resumo curto do dia]"
git push origin main
```

## Exemplo de entrada boa vs ruim

**Ruim (changelog seco):**
```
### Bug fix
- Corrigido bug de input no terminal
- Adicionado flag --bare como workaround
```

**Bom (narrativa real):**
```
### A hora da verdade

Tudo construido, hora de rodar. O banner apareceu lindo — verde militar,
cursor piscando no prompt. E nada aconteceu. As teclas simplesmente nao
registravam. Testamos VS Code, Terminal.app, mesmo resultado. Mas o modo
non-interactive funcionava perfeito — a engine tava ok, o problema era
exclusivamente no stdin do TUI.

Descemos a toca do coelho e encontramos um deadlock elegante: os dialogs
de setup precisam de input pra continuar, mas o input so funciona depois
que os dialogs terminam.
```
