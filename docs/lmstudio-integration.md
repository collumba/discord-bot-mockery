# Integração com LM Studio

Este projeto utiliza o LM Studio para rodar um modelo local de linguagem (LLM) para gerar as respostas da Soberaninha.

## Pré-requisitos

1. Baixe e instale o [LM Studio](https://lmstudio.ai/) em sua máquina.
2. Baixe o modelo Zephyr na aplicação do LM Studio.

## Configuração

### 1. Configure o LM Studio

1. Abra o LM Studio em sua máquina
2. Baixe e selecione o modelo Zephyr (HuggingFaceH4/zephyr-7b-beta ou qualquer versão compatível)
3. Clique em "Start Server" dentro do LM Studio
4. Certifique-se de que o servidor está rodando em `http://localhost:1234`

![LM Studio Local Server](https://i.imgur.com/0y0HyHk.png)

### 2. Configure o Ambiente do Bot

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
# Discord Token e outras configurações
DISCORD_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui

# Configuração do LM Studio (padrão)
LMSTUDIO_API_URL=http://localhost:1234/v1
```

Se você estiver usando uma porta diferente ou outro host, ajuste o valor de `LMSTUDIO_API_URL` conforme necessário.

## Testando a Integração

Para testar se a integração com o LM Studio está funcionando corretamente, execute:

```bash
npm run test-roast
```

Este comando enviará uma mensagem de teste para o LM Studio e exibirá a resposta gerada. Certifique-se de que o LM Studio esteja rodando com o servidor ativo antes de executar o teste.

## Solução de Problemas

### O teste falha com erro de conexão

- Verifique se o LM Studio está em execução
- Certifique-se de que o botão "Start Server" no LM Studio foi clicado
- Verifique se a URL configurada em `.env` está correta
- Se você modificou a porta padrão no LM Studio, atualize a variável `LMSTUDIO_API_URL`

### As respostas são muito lentas

- O tempo de resposta depende da capacidade do seu hardware
- Considere usar um modelo menor ou ajustar a configuração no LM Studio para otimizar a velocidade

### As respostas não são apropriadas

- Verifique se está utilizando um modelo Zephyr ou outro modelo compatível com instruções
- O prompt pode precisar de ajustes para melhor se adequar ao modelo que você está usando
