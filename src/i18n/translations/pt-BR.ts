export const ptBR = {
  common: {
    back: 'Voltar',
    continue: 'Continuar',
    understood: 'Entendido',
    playAgain: 'Ler Novamente',
    backHome: 'Voltar ao Início',
    select: 'Selecionar',
    send: 'Enviar',
    logout: 'Sair',
  },
  auth: {
    title: 'MindReader',
    subtitle: 'Comece em segundos',
    googleButton: 'Continuar com Google',
    magicLinkButton: 'Enviar link de acesso',
    orDivider: 'Ou',
    emailLabel: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    passwordLabel: 'Senha',
    passwordPlaceholder: '********',
    submitLogin: 'Entrar',
    submitSignUp: 'Criar conta',
    toggleToSignUp: 'Criar nova conta',
    toggleToLogin: 'Já tem conta? Entrar',
    forgotPassword: 'Esqueci a senha',
    backToLogin: 'Voltar ao login',
    resetPasswordTitle: 'Recuperar senha',
    resetPasswordSubtitle: 'Digite seu e-mail para receber o link de recuperação',
    sendResetLink: 'Enviar link de recuperação',
    toast: {
      loginErrorTitle: 'Erro ao fazer login',
      loginCancelled: 'Login cancelado. Tentar novamente?',
      loginGeneric: 'Ops! Não conseguimos entrar. Tente de novo.',
      missingFieldsTitle: 'Campos obrigatórios',
      missingFieldsDescription: 'Preencha e-mail e senha.',
      weakPasswordTitle: 'Senha fraca',
      weakPasswordDescription: 'A senha deve ter pelo menos 8 caracteres.',
      signupSuccessTitle: 'Conta criada!',
      signupSuccessDescription: 'Você já pode começar a usar o MindReader.',
      authErrorTitle: 'Erro ao autenticar',
      invalidCredentials: 'Confira e-mail e senha.',
      magicLinkSentTitle: 'Link enviado!',
      magicLinkSentDescription: 'Verifique seu e-mail para acessar sua conta.',
      resetLinkSentTitle: 'Link de recuperação enviado!',
      resetLinkSentDescription: 'Verifique seu e-mail para redefinir sua senha.',
      missingEmailTitle: 'E-mail obrigatório',
      missingEmailDescription: 'Digite seu e-mail para continuar.',
    },
  },
  connectMind: {
    title: 'MindReader',
    initializing: 'Inicializando conexão mental...',
    waitingCamera: 'Aguardando câmera...',
    connectButton: 'Conectar a mente',
    instructionsButton: 'Instruções',
  },
  selectTheme: {
    title: 'O que está pensando?',
    subtitle: 'Escolha uma categoria e pense em uma palavra',
    tip: '💡 Dica: Pense em uma palavra assim que vir as opções',
  },
  startPrompt: {
    placeholder: 'Digite: {word}',
    letterCount: '{count}/{total} letras',
  },
  gameplay: {
    round: 'Rodada {round} • {count} palavras',
    thinkWord: 'Pense em uma palavra...',
    observePositions: 'Observe as novas posições...',
    eliminatingSide: 'Eliminando lado {side}...',
    left: 'esquerdo',
    right: 'direito',
  },
  result: {
    title: 'Li sua mente!',
    subtitle: 'A palavra que você pensou é:',
  },
  instructions: {
    title: 'Como Funciona',
    subtitle: 'Entenda o processo de detecção mental',
    step1Title: 'Detecção por Movimento de Cabeça',
    step1Text: 'Conseguimos identificar para qual lado você girou levemente a cabeça.',
    step2Title: 'Escolha Mental',
    step2Text: 'Gire DISCRETAMENTE a cabeça para um lado ou para outro. É IMPORTANTE SER DISCRETO, para que ninguém descubra esse segredo.',
    step3Title: 'Processo de Eliminação',
    step3Text: 'A cada rodada, metade das palavras são eliminadas baseadas na direção detectada. Gire a cabeça para o LADO que você quer ELIMINAR. O lado em que sua palavra está ficará com cores VERDE ou AMARELA.',
    step4Title: 'Método Principal: Detecção por Digitação',
    step4Text: 'Ao digitar a palavra para iniciar, você pode substituir a ÚLTIMA LETRA por uma letra que indica sua palavra pensada. Como cada palavra começa com uma letra diferente, basta digitar essa letra no final. Por exemplo: se pensou em "Brasil", digite "INICIAB" ao invés de "INICIAR".',
    tipsTitle: 'Dicas para Melhor Detecção',
    tip1: 'Mantenha a posição durante a contagem regressiva',
    tip2: 'E o principal. Seja DISCRETO, faça MOVIMENTOS SUAVES.',
  },
  mentalConversationInstructions: {
    title: 'Instruções para o Jogo Conversa Mental',
    subtitle: 'Siga os cartões para dominar o fluxo do jogo',
    step1Title: 'Atenção na Frase Inicial',
    step1Text: 'O app exibirá uma frase inicial. Guarde atentamente a última palavra dessa frase, pois ela define todo o resto do jogo.',
    step2Title: 'Contagem de Letras',
    step2Text: 'Conte quantas letras tem a ÚLTIMA palavra da frase inicial. Exemplo: se a última palavra for "Mistério", ela possui 8 letras.',
    step3Title: 'Posição da Palavra Misteriosa',
    step3Text: 'O número de letras obtido indica em qual posição a palavra do seu amigo aparecerá. No exemplo acima, a palavra surgirá na posição 8.',
    step4Title: 'Definindo a Palavra Misteriosa',
    step4Text: 'Se mais de uma palavra for apresentada, sua próxima interação define a opção correta: responda com 1 palavra para selecionar a 1ª opção, 2 palavras para a 2ª opção e 3 palavras para a 3ª opção.',
    tipsTitle: 'Dicas para Melhor Experiência',
    tip1: 'Escolha palavras claras e não muito abstratas',
    tip2: 'Responda consistentemente às perguntas',
  },
  mysteryWordInstructions: {
    title: 'Como Funciona a Palavra Misteriosa',
    subtitle: 'Aprenda a jogar este jogo de telepatia',
    step1Title: 'Categoria Escolhida',
    step1Text: 'A categoria escolhida será determinada pela quantidade de palavras da primeira interação. 1 palavra para a categoria "Animal", 2 palavras para a categoria "Fruta" e 3 palavras para a categoria "País".',
    step2Title: 'Indicação das letras da Palavra Misteriosa',
    step2Text: 'Nas próximas interações, a PRIMEIRA letra da ÚLTIMA palavra revelará uma letra da palavra misteriosa. Repita até indicar as três letras da palavra secreta.',
    step3Title: 'Lista de Possibilidades',
    step3Text: 'Se o app tiver mais de uma possibilidade com a categoria e as três letras indicadas, ele mostrará as opções disponíveis.',
    step4Title: 'Definindo a Palavra Misteriosa',
    step4Text: 'Se uma lista com várias palavras for exibida, sua próxima interação determinará a palavra correta pela quantidade de palavras: 1 palavra = 1ª opção, 2 palavras = 2ª opção, 3 palavras = 3ª opção.',
    tipsTitle: 'Dicas para Melhor Experiência',
    tip1: 'Escolha uma palavra clara e fácil de pronunciar',
    tip2: 'Clique em "Parar" quando quiser encerrar o jogo',
  },
  mysteryWord: {
    title: 'Palavra Misteriosa',
    startButton: 'Sim, vamos começar!',
    inputTitle: 'Digite sua palavra misteriosa',
    inputDescription: 'Digite secretamente uma palavra.',
    inputPlaceholder: 'Sua palavra secreta...',
    startPresentation: 'Iniciar Apresentação',
    stopButton: 'Parar',
    stoppedTitle: 'Li sua mente! ✨',
    stoppedSubtitle: 'E aí? Acertou?',
    menuButton: 'Voltar ao Menu',
    playAgain: 'Jogar Novamente',
    phrases: 'Bora começar!||Podemos começar o jogo de leitura de mente já?||Está pronto para o teste da mente? Estou ansioso. Me diga que sim.||Bora começar a leitura da sua mente logo?||Vamos iniciar o jogo psíquico agora?||Preparado para o truque mental mentes?||Podemos dar início à leitura. Vou revelar seu segredo.||Podemos abrir o portal do jogo da fantasia?||Vamos ativar o poder da telepatia?||Que tal começarmos o desafio da imaginação?'
  },
  mentalConversation: {
    instructions: '1. Sua primeira interação revela a categoria escolhida (1 palavra = Animal, 2 palavras = Fruta, 3 palavras = País).\n2. Nas três interações seguintes, a primeira letra da ÚLTIMA palavra indica a primeira letra da palavra do seu amigo. Repita isso 3 vezes.\n3. Se mesmo com as três letras o app não descobrir, ele mostrará uma lista de possibilidades.\n4. Faça mais uma interação com 1, 2 ou 3 palavras para indicar se a palavra correta é a 1ª, 2ª ou 3ª opção da lista.',
    title: 'Conversa Mental',
    messages: {
      greeting: 'Olá! Eu sou uma inteligência artificial com poderes de leitura mental. 🧠✨\n\nPeça ao seu amigo para pensar em um ANIMAL, FRUTA ou PAÍS. Não me conte qual é a categoria ou a palavra, apenas peça para ele pensar!',
      readyCheck: 'Seu amigo já escolheu e está pronto para começar?',
      startCollecting: 'Perfeito! Vou fazer algumas perguntas para ler a mente do seu amigo... Responda naturalmente! 🔮\n\nQual é a sua cor favorita?',
      askHobby: 'Interessante! E qual é o seu hobby preferido?',
      askSeason: 'Que legal! Última pergunta: qual é a sua estação do ano favorita?',
      singleResult: '🎯 Incrível! Estou captando uma energia muito forte...\n\n✨ A palavra em que seu amigo pensou é:\n\n🌟 **{word}** 🌟\n\nEstou certo? ✨',
      multipleOptions: 'Hmm... estou recebendo alguns sinais. Estas são as possibilidades que estou captando: {options}\n\nEstou no caminho certo?',
      noMatch: 'Ops! Parece que não consegui captar a palavra corretamente. Vamos tentar novamente? Digite "reiniciar" para começar de novo.',
      finalReveal: '🎊 EUREKA!\n\n🔮 **{word}** 🔮\n\nEu li a mente do seu amigo! A categoria era {category} e a palavra era {word}! 🧠✨\n\nQuer jogar novamente? Digite qualquer coisa para voltar ao menu!'
    },
    status: {
      processingAudio: 'Processando áudio...',
      speaking: 'Falando...'
    },
    input: {
      placeholder: 'Digite sua resposta...',
      recording: 'Gravando...'
    },
    toast: {
      errorTitle: 'Erro',
      audioProcessingFailed: 'Não foi possível processar o áudio. Tente novamente.',
      recordingTitle: 'Gravando',
      recordingDescription: 'Fale agora...',
      micErrorDescription: 'Não foi possível acessar o microfone.'
    },
    categories: {
      animal: 'ANIMAL',
      fruit: 'FRUTA',
      country: 'PAÍS'
    }
  },
  gameSelector: {
    heading: 'Leitores de Mente',
    subheading: 'Escolha uma experiência de leitura mental',
    play: 'Jogar',
    comingSoon: 'Em breve',
    underConstruction: 'Em construção',
    modalTitle: 'Como Jogar',
    cards: {
      mindReader: {
        title: 'Quadrante Mágico',
        description: 'Leia a mente através de movimentos sutis da cabeça'
      },
      mentalConversation: {
        title: 'Conversa Mental',
        description: 'Converse com uma IA que tenta adivinhar sua palavra'
      },
      mysteryWord: {
        title: 'Palavra Misteriosa',
        description: 'Revele secretamente sua palavra para o público'
      },
      myEmojis: {
        title: 'Meus Emojis',
        description: 'De quem é qual Emoji'
      }
    }
  },
};
