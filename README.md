# discord-bot-mockery
**Documento de Especificação do Projeto**

# Bot: **Soberaninha**

## Visão Geral
Soberaninha é um bot de Discord com personalidade de uma adolescente sarcástica e debochada. Seu objetivo é interagir de forma divertida e provocativa com os integrantes do servidor, utilizando respostas de texto, reações com emojis e GIFs, criando uma atmosfera espontânea e gamer-friendly.

Soberaninha é inteligente o suficiente para adaptar suas respostas ao contexto, identificar quem está jogando, reagir a respostas direcionadas a ela e estimular a conversa dentro do servidor.

---

## Funcionalidades

### 1. **Zoar mensagens de forma automática**
- Analisa mensagens enviadas no servidor.
- Identifica ganchos para zoeira (mensagens longas, erros de digitação, reclamações, gabar-se etc).
- Responde com piadas sarcásticas, divertidas e leves.
- Contextualiza com referências a MMORPGs, shooters e survival games quando pertinente.

### 2. **Chamados Aleatórios para Jogos e Conversa**
- Comando `/ativar-chamados [duração]` ativa modo de "chamados".
- Em intervalos aleatórios (30-90 minutos), Soberaninha puxa conversa no chat:
  - Incentiva o pessoal a jogar.
  - Reclama do chat parado de forma engraçada.
  - Manda mensagens improvisadas e provocativas.
- Comando `/desativar-chamados` encerra o modo.

### 3. **Controle de Role para Zoar**
- Comando `/setar-role-zoeira @role` define qual Role pode ser zoada.
- Apenas membros com essa Role receberão zoeiras.
- Comando `/resetar-role-zoeira` remove a restrição.

### 4. **Uso Aleatório de GIFs do Tanner**
- 20-30% das interações podem incluir GIFs do Tanner.
- GIFs são escolhidos conforme o tema da zoeira:
  - Rindo, facepalm, bocejando, provocando etc.
- Mantém a interação divertida e espontânea.

### 5. **Zoar Membros que Estão Jogando**
- Monitora status de atividade dos membros.
- Se detectar que um membro da role zoável está jogando:
  - Aleatoriamente (~20% das vezes) zoa o membro com base no jogo detectado.
  - Jogos populares têm piadas específicas (Valorant, LoL, Rust, etc.).

### 6. **Rebater Respostas dos Usuários**
- Após zoar alguém, monitora replies e menções por 2-5 minutos.
- Analisa o tom da resposta:
  - Defesa séria: zoa com ironia.
  - Brincadeira: embarca na zoeira.
  - Contra-ataque: responde com sarcasmo afiado.
- Mantém o diálogo leve e divertido.

### 7. **Reagir com Emojis Inteligentes**
- Pode reagir às mensagens com emojis apropriados antes ou junto com a resposta.
- Emojis baseados no contexto:
  - Vergonha: 🫣 🤦‍♀️
  - Meme/riso: 😂 🤣
  - Tristeza: 😢 😭
  - Gabar-se: 🙄 😏
  - Erro ou bug: 🤔 🤔
  - Derrota: 💀
  - Jogo: 🎮 🕹️
  - Mensagem sem sentido: 🤡
  - Mensagem muito longa: 📜 💥

---

## Comandos Disponíveis

| Comando | Função |
|:---|:---|
| `/zoar @pessoa` | Zoar manualmente uma pessoa |
| `/humilhar` | Escolhe uma pessoa aleatória para zoar |
| `/apelido @pessoa` | Sugere um apelido zoeiro |
| `/ranking` | Mostra o ranking de mais zoados |
| `/ativar-chamados [duração]` | Ativa os chamados aleatórios |
| `/desativar-chamados` | Desativa os chamados |
| `/setar-role-zoeira @role` | Define a role autorizada para ser zoada |
| `/resetar-role-zoeira` | Remove a restrição de roles |

---

## Estilo e Personalidade da Soberaninha

- Adolescente sarcástica, debochada e cheia de gírias.
- Adora zoar, mas sempre de forma leve e divertida.
- Faz referências frequentes à cultura gamer (MMORPG, Shooters, Survival).
- Usa GIFs e Emojis para complementar suas provocações.
- Responde como se estivesse sempre se divertindo.

---

## Roadmap de Desenvolvimento

| Etapa | Feature | Tempo Estimado |
|:---|:---|:---|
| 1 | Setup inicial do bot, conexão Discord API, estrutura de eventos | 1 dia |
| 2 | Implementação da zoeira automática baseada em mensagens | 2 dias |
| 3 | Implementação dos comandos `/zoar`, `/humilhar`, `/apelido`, `/ranking` | 2 dias |
| 4 | Sistema de Role configurável para zoeira (`/setar-role-zoeira`, `/resetar-role-zoeira`) | 1 dia |
| 5 | Sistema de Chamados Aleatórios | 2 dias |
| 6 | Implementação de GIFs aleatórios em respostas | 1 dia |
| 7 | Monitoramento de status de jogos e zoeira baseada em jogo ativo | 2 dias |
| 8 | Sistema de escuta para rebater respostas | 2 dias |
| 9 | Reação com emojis inteligentes | 1 dia |
| 10 | Testes integrados, ajustes de comportamento e refinamento | 3 dias |

**Tempo Total Estimado: Aproximadamente 17 dias**

---

## Observações Finais

Soberaninha deve se manter sempre divertida, nunca excessivamente agressiva.  
O foco é criar um ambiente descontraído, dinâmico e cheio de interações inesperadas.

A ideia é que os integrantes do servidor sintam que a Soberaninha é praticamente mais uma pessoa participando da bagunça — e não apenas um bot qualquer.

---
