# Controle por Comandos de Voz — Teachable Machine + TensorFlow.js

> Projeto acadêmico — Inteligencia Artificial  
> Nome: **Lucas Gabriel**

## Descrição

Aplicação web que usa um modelo de reconhecimento de áudio treinado no
[Teachable Machine](https://teachablemachine.withgoogle.com/) (projeto de
**Áudio**) para reconhecer comandos de voz pelo microfone em tempo real e
controlar automaticamente um player de vídeo — sem nenhum clique manual do
usuário.

- Comando **"Play"** → dá play no vídeo
- Comando **"Pausar"** → pausa o vídeo
- **Background Noise** (ruído de fundo) → nenhuma ação — classe neutra usada
  para evitar que o modelo dispare ações à toa quando ninguém está falando

## Demonstração

<!-- Substituam por um GIF ou print da aplicação funcionando -->
`[GIF/print aqui]`

## Sobre o modelo

- Treinado em: Teachable Machine (projeto de **Áudio**)
- Classes: `Play`, `Pausar`, `Background Noise` (esta última é a classe
  padrão gerada automaticamente pelo Teachable Machine em projetos de áudio)
- Exportado no formato: **TensorFlow.js**
- Limiar de confiança usado para disparar ação: **85%** (configurável em
  `CONFIG.CONFIDENCE_THRESHOLD` no `script.js`)

## Estrutura do projeto

```
.
├── index.html      # estrutura da página (player + painel de escuta)
├── style.css       # estilo visual (painel de escuta com pulso de microfone)
├── script.js       # carregamento do modelo, escuta e lógica de ação
├── sample-video.mp4 # vídeo local usado no player (sem dependência externa)
├── model.json      # topologia do modelo exportado do Teachable Machine
├── metadata.json   # classes e config exportadas do Teachable Machine
├── weights.bin     # pesos do modelo exportados do Teachable Machine
└── README.md
```

## Como rodar localmente

1. Clone o repositório:
   ```bash
   git clone [link-do-repositorio]
   cd [nome-da-pasta]
   ```
2. Os arquivos exportados do Teachable Machine (`model.json`, `metadata.json`,
   `weights.bin`) já estão na raiz do projeto, junto com o código.
3. Como o navegador bloqueia carregar o modelo e acessar o microfone direto
   do `file://`, sirva a pasta com um servidor local simples. Qualquer uma
   dessas opções funciona:
   ```bash
   # Opção 1 — Python
   python3 -m http.server 8080

   # Opção 2 — VSCode: extensão "Live Server"

   # Opção 3 — Node
   npx serve .
   ```
4. Copie e abra `http://localhost:8080` no navegador (o `script.js` calcula a URL
   absoluta da pasta automaticamente, então funciona em qualquer porta ou
   caminho — só precisa ser servido via `http://`/`https://`, nunca abrindo
   o `index.html` direto como arquivo).
5. Clique em **"Iniciar microfone e modelo"** e permita o acesso ao
   microfone.
6. Diga os comandos treinados perto do microfone e observe o player reagir.

## Comandos

1 - Comandos de **"Play"**

`Play`  
`Start`  
`Começar`  
`Retomar`  
`Iniciar`  

2 - Comandos de **"Pause"**

`Pause`  
`Stop`  
`Parar`  
`Pare`  
`Pausar`  

## Requisitos

- Navegador atualizado com suporte a Web Audio API (Chrome/Edge recomendados)
- Microfone funcional
- Conexão com internet (para carregar TensorFlow.js e a biblioteca
  `speech-commands` via CDN)

## Autoria

Projeto desenvolvido em dupla como parte da disciplina de Inteligencia Artificial