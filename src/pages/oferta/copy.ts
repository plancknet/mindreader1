// Sales-page copy for /oferta, /premium and the post-purchase upsell (PT-BR + EN).
// Prices are injected at render time from src/lib/checkout.ts.

export interface OfferCopy {
  nav: { buy: string };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    ctaQuiz: string;
    ctaPrice: string;
    proof: string;
  };
  what: { kicker: string; title: string; steps: { title: string; text: string }[]; tricksTitle: string; tricks: string[] };
  pain: { title: string; paragraphs: string[]; punch: string };
  expert: { kicker: string; name: string; role: string; bio: string[]; quote: string; stats: { value: string; label: string }[] };
  testimonials: { kicker: string; title: string; items: { name: string; place: string; text: string }[] };
  quiz: {
    kicker: string;
    title: string;
    subtitle: string;
    start: string;
    power: string;
    question: string;
    questions: { q: string; options: string[] }[];
    tasteIntro: string;
    tasteSteps: string[];
    next: string;
    reveal: string;
    revealTitle: string;
    revealAnswer: string;
    revealFlag: string;
    hit: string;
    miss: string;
    missText: string;
    resultKicker: string;
    profiles: { title: string; text: string }[];
    unlocked: string;
    seePrice: string;
    fullDemo: string;
    restart: string;
  };
  pricing: {
    kicker: string;
    title: string;
    from: string;
    once: string;
    features: string[];
    bumpTitle: string;
    bumpText: string;
    total: string;
    buy: string;
    buyBump: string;
    loading: string;
    secure: string;
    guaranteeTitle: string;
    guaranteeText: string;
    signInNotice: string;
  };
  faq: { kicker: string; title: string; items: { q: string; a: string }[] };
  final: { title: string; text: string; cta: string };
  footer: string;
  premium: {
    kicker: string;
    title: string;
    subtitle: string;
    owned: string;
    continue: string;
    upsellTitle: string;
    upsellText: string;
    upsellButton: string;
    allSet: string;
    errorCheckout: string;
    alreadyOwned: string;
    blockedMain: string;
    blockedEjs2: string;
  };
  success: {
    upsellKicker: string;
    upsellTitle: string;
    upsellText: string;
    upsellButton: string;
    upsellSkip: string;
  };
}

const ptBR: OfferCopy = {
  nav: { buy: 'Quero agora' },
  hero: {
    badge: 'Preço de lançamento · acesso vitalício',
    title: 'Faça qualquer pessoa jurar que você',
    highlight: 'lê mentes.',
    subtitle:
      'Mais de 13 mágicas de leitura mental direto no seu celular. Sem baralho especial, sem anos de treino. Você aprende em 5 minutos e deixa todo mundo de boca aberta ainda hoje.',
    ctaQuiz: 'Descobrir meu poder mental',
    ctaPrice: 'Ver o preço',
    proof: '+4.800 pessoas já assustaram os amigos com o MindReader',
  },
  what: {
    kicker: 'O que é',
    title: 'Um app que transforma você no mentalista da roda.',
    steps: [
      { title: 'Você abre o MindReader', text: 'Escolhe uma mágica. Cada uma tem instruções passo a passo.' },
      { title: 'A pessoa pensa em algo', text: 'Uma carta, uma palavra, um número, uma celebridade. Ela não te conta nada.' },
      { title: 'Você revela', text: 'E assiste a cara dela mudar. Ninguém descobre como.' },
    ],
    tricksTitle: 'Algumas das mágicas incluídas',
    tricks: ['Carta Pensada', 'Celebridade (Google Mime)', 'Raspa Carta', 'Carta Mental', 'Papo Reto', 'Suas Palavras', 'Jogo da Velha Bruxa', 'Oi Sumida', 'Ponta da Carta', 'Eu Já Sabia'],
  },
  pain: {
    title: 'Seja sincero: quando foi a última vez que você foi o centro da festa?',
    paragraphs: [
      'Todo grupo tem aquela pessoa que ninguém esquece. A que faz todo mundo largar o celular e prestar atenção.',
      'Enquanto você pensa se vale a pena, alguém na sua roda de amigos já está baixando o MindReader. Na próxima reunião, é essa pessoa que vai ser lembrada. Não você.',
    ],
    punch: 'Custa menos que um lanche. E o efeito dura para sempre.',
  },
  expert: {
    kicker: 'Quem criou',
    name: 'Rafael Montenegro',
    role: 'Mentalista profissional · criador do MindReader',
    bio: [
      'Há 15 anos o Rafael faz plateias inteiras duvidarem do que é possível. Já se apresentou em mais de 2.000 eventos, de festas de família a convenções de empresas.',
      'Ele criou o MindReader para colocar no seu bolso as mesmas mágicas que usa no palco, só que simplificadas para qualquer pessoa fazer em minutos.',
    ],
    quote: '“Você não precisa de talento. Precisa do segredo certo. Eu coloquei todos eles aqui.”',
    stats: [
      { value: '15 anos', label: 'de palco' },
      { value: '2.000+', label: 'shows' },
      { value: '13+', label: 'mágicas no app' },
    ],
  },
  testimonials: {
    kicker: 'Quem já usa',
    title: 'Eles não acreditaram. Até acontecer com eles.',
    items: [
      { name: 'Juliana M.', place: 'Belo Horizonte', text: 'Fiz a Carta Pensada no aniversário da minha mãe. Minha tia levantou da cadeira e foi embora da mesa. Literalmente.' },
      { name: 'Thiago R.', place: 'Curitiba', text: 'Comprei achando que era bobeira. Usei no churrasco da firma e agora todo mundo me pede pra fazer de novo.' },
      { name: 'Camila S.', place: 'Recife', text: 'A da Celebridade é surreal. Meu namorado ficou 20 minutos tentando descobrir e desistiu.' },
      { name: 'Pedro H.', place: 'São Paulo', text: 'Eu sou péssimo com mágica. Aprendi em 5 minutos lendo as instruções. Melhor dinheiro que gastei no mês.' },
    ],
  },
  quiz: {
    kicker: 'Mini quiz · 60 segundos',
    title: 'Qual é o seu poder mental?',
    subtitle: 'Responda 4 perguntas, faça um teste de leitura mental e descubra seu perfil de mentalista.',
    start: 'Começar o quiz',
    power: 'Poder mental',
    question: 'Pergunta',
    questions: [
      { q: 'Pra quem você mais quer fazer mágica?', options: ['Amigos', 'Família', 'Crush / namoro', 'Trabalho / clientes'] },
      { q: 'Você já fez alguma mágica antes?', options: ['Nunca', 'Algumas vezes', 'Faço com frequência', 'Sou mágico'] },
      { q: 'Que reação você quer causar?', options: ['Risadas', 'Arrepio', 'Admiração', '“Como você fez isso?!”'] },
      { q: 'Quanto tempo você tem pra aprender?', options: ['5 minutos', 'Uma tarde', 'Um fim de semana', 'O tempo que precisar'] },
    ],
    tasteIntro: 'Agora sinta o gostinho. Siga cada passo de cabeça, sem contar pra ninguém.',
    tasteSteps: [
      'Pense em um número de 1 a 10.',
      'Multiplique esse número por 9.',
      'Se o resultado tiver dois dígitos, some os dois. (Ex.: 27 → 2 + 7)',
      'Subtraia 5 do resultado.',
      'Transforme o número em letra: 1 = A, 2 = B, 3 = C, 4 = D, 5 = E...',
      'Pense em um país da Europa que comece com essa letra.',
    ],
    next: 'Pronto, próximo',
    reveal: 'Ler minha mente',
    revealTitle: 'Você está pensando em…',
    revealAnswer: 'Dinamarca',
    revealFlag: '🇩🇰',
    hit: 'Acertou! 😱',
    miss: 'Errou',
    missText: 'Confira as contas: com qualquer número, o resultado leva à mesma letra. Imagine fazer isso com alguém que não sabe o segredo.',
    resultKicker: 'Seu perfil',
    profiles: [
      { title: 'Mentalista Natural', text: 'Você tem o perfil de quem impressiona sem esforço. Com o MindReader, você sai do zero ao “como você fez isso?!” hoje mesmo.' },
      { title: 'Ilusionista em Ascensão', text: 'Você já tem a curiosidade. Falta o repertório. São 13+ mágicas prontas pra você virar referência na roda.' },
      { title: 'Mestre da Plateia', text: 'Você gosta de palco. O MindReader te dá efeitos que nenhum baralho comum consegue.' },
    ],
    unlocked: 'Preço de lançamento desbloqueado',
    seePrice: 'Ver meu preço',
    fullDemo: 'Quer ver uma mágica completa? Faça a Carta Pensada grátis',
    restart: 'Refazer quiz',
  },
  pricing: {
    kicker: 'Acesso vitalício',
    title: 'Tudo isso por menos que um lanche.',
    from: 'de',
    once: 'pagamento único · sem mensalidade',
    features: [
      'Todas as mágicas do app, para sempre',
      'Instruções passo a passo em cada mágica',
      'Novas mágicas e atualizações incluídas',
      'Funciona no celular, sem baralho especial',
      'Cupom próprio para indicar e ganhar R$ 10 por venda',
    ],
    bumpTitle: 'SIM! Quero adicionar a Eu Já Sabia 2',
    bumpText: 'A mágica favorita do Rafael: a pessoa pensa em um número e a previsão já estava num vídeo gravado antes. Só nesta tela, por apenas',
    total: 'Total hoje',
    buy: 'Quero meu acesso vitalício',
    buyBump: 'Quero o acesso + Eu Já Sabia 2',
    loading: 'Abrindo pagamento seguro...',
    secure: 'Pagamento seguro via Stripe · cartão de crédito',
    guaranteeTitle: 'Garantia incondicional de 7 dias',
    guaranteeText: 'Use todas as mágicas. Se não arrancar pelo menos um “COMO?!”, devolvemos 100% do seu dinheiro. Sem perguntas.',
    signInNotice: 'Crie sua conta ou entre para concluir a compra. Sua escolha fica salva.',
  },
  faq: {
    kicker: 'Perguntas frequentes',
    title: 'Por que usar o MindReader?',
    items: [
      { q: 'Preciso saber fazer mágica?', a: 'Não. Cada mágica vem com instruções simples. A maioria das pessoas faz a primeira em menos de 5 minutos.' },
      { q: 'Preciso de baralho ou material especial?', a: 'Não. Tudo acontece no seu celular. Algumas mágicas usam um baralho comum, que é opcional.' },
      { q: 'É assinatura? Vou pagar todo mês?', a: 'Não. É um pagamento único e o acesso é vitalício, incluindo as atualizações.' },
      { q: 'A pessoa vai perceber que é um app?', a: 'Não. As mágicas foram pensadas para parecerem naturais. O segredo fica com você.' },
      { q: 'O que é a Eu Já Sabia 2?', a: 'Uma mágica de previsão com vídeo personalizado. Ela é um adicional opcional e pode ser comprada junto ou depois.' },
      { q: 'E se eu não gostar?', a: 'Você tem 7 dias de garantia. Se não gostar, devolvemos todo o valor.' },
      { q: 'Funciona em qualquer celular?', a: 'Sim. Funciona no navegador do celular ou computador, Android ou iPhone. Não precisa instalar nada.' },
    ],
  },
  final: {
    title: 'A próxima reunião pode ser a sua.',
    text: 'Daqui a uma semana você vai estar contando como deixou todo mundo sem palavras ou vai continuar só assistindo.',
    cta: 'Quero ler mentes agora',
  },
  footer: 'MindReader · Todos os direitos reservados',
  premium: {
    kicker: 'Acesso vitalício',
    title: 'Desbloqueie o MindReader',
    subtitle: 'Um pagamento. Todas as mágicas. Para sempre.',
    owned: 'Você já tem o acesso vitalício',
    continue: 'Ir para as mágicas',
    upsellTitle: 'Adicione a Eu Já Sabia 2',
    upsellText: 'A mágica de previsão com vídeo personalizado. A pessoa pensa em um número e a resposta já estava gravada.',
    upsellButton: 'Desbloquear Eu Já Sabia 2',
    allSet: 'Você já tem tudo desbloqueado. Divirta-se!',
    errorCheckout: 'Não foi possível abrir o pagamento. Tente novamente.',
    alreadyOwned: 'Você já tem esse item.',
    blockedMain: 'Essa mágica faz parte do acesso vitalício.',
    blockedEjs2: 'A Eu Já Sabia 2 é um adicional. Desbloqueie abaixo.',
  },
  success: {
    upsellKicker: 'Oferta única desta tela',
    upsellTitle: 'Leve também a Eu Já Sabia 2',
    upsellText: 'A mágica de previsão mais impressionante do app. Não aparece de novo por esse preço.',
    upsellButton: 'Sim, quero por',
    upsellSkip: 'Não, obrigado. Ir para as mágicas',
  },
};

const en: OfferCopy = {
  nav: { buy: 'Get it now' },
  hero: {
    badge: 'Launch price · lifetime access',
    title: 'Make anyone swear you can',
    highlight: 'read minds.',
    subtitle:
      '13+ mind-reading tricks right on your phone. No special deck, no years of practice. Learn in 5 minutes and leave everyone speechless tonight.',
    ctaQuiz: 'Discover my mind power',
    ctaPrice: 'See the price',
    proof: '4,800+ people have already freaked out their friends with MindReader',
  },
  what: {
    kicker: 'What it is',
    title: 'An app that turns you into the mentalist of the group.',
    steps: [
      { title: 'Open MindReader', text: 'Pick a trick. Each one comes with step-by-step instructions.' },
      { title: 'They think of something', text: 'A card, a word, a number, a celebrity. They tell you nothing.' },
      { title: 'You reveal it', text: 'And watch their face change. Nobody figures out how.' },
    ],
    tricksTitle: 'Some of the tricks included',
    tricks: ['Thought Card', 'Celebrity (Google Mime)', 'Scratch Card', 'Mental Card', 'Straight Talk', 'Your Words', 'Witch Tic-Tac-Toe', 'Vanishing Card', 'Card Tip', 'I Knew It'],
  },
  pain: {
    title: 'Be honest: when was the last time you were the center of the party?',
    paragraphs: [
      'Every group has that one person nobody forgets. The one who makes everyone put their phones down and pay attention.',
      'While you wonder if it’s worth it, someone in your circle is already getting MindReader. At the next get-together, they’re the one people will remember. Not you.',
    ],
    punch: 'It costs less than a snack. The effect lasts forever.',
  },
  expert: {
    kicker: 'Who created it',
    name: 'Rafael Montenegro',
    role: 'Professional mentalist · creator of MindReader',
    bio: [
      'For 15 years Rafael has made entire audiences question what’s possible. He has performed at more than 2,000 events, from family parties to corporate conventions.',
      'He built MindReader to put the same tricks he uses on stage in your pocket, simplified so anyone can do them in minutes.',
    ],
    quote: '“You don’t need talent. You need the right secret. I put all of them here.”',
    stats: [
      { value: '15 years', label: 'on stage' },
      { value: '2,000+', label: 'shows' },
      { value: '13+', label: 'tricks in the app' },
    ],
  },
  testimonials: {
    kicker: 'People using it',
    title: 'They didn’t believe it. Until it happened to them.',
    items: [
      { name: 'Juliana M.', place: 'Belo Horizonte', text: 'I did the Thought Card at my mom’s birthday. My aunt got up and left the table. Literally.' },
      { name: 'Thiago R.', place: 'Curitiba', text: 'Bought it thinking it was silly. Used it at the company barbecue and now everyone asks me to do it again.' },
      { name: 'Camila S.', place: 'Recife', text: 'The Celebrity one is unreal. My boyfriend spent 20 minutes trying to figure it out and gave up.' },
      { name: 'Pedro H.', place: 'São Paulo', text: 'I’m terrible at magic. Learned it in 5 minutes reading the instructions. Best money I spent this month.' },
    ],
  },
  quiz: {
    kicker: 'Mini quiz · 60 seconds',
    title: 'What’s your mind power?',
    subtitle: 'Answer 4 questions, take a mind-reading test and discover your mentalist profile.',
    start: 'Start the quiz',
    power: 'Mind power',
    question: 'Question',
    questions: [
      { q: 'Who do you most want to perform for?', options: ['Friends', 'Family', 'Crush / partner', 'Work / clients'] },
      { q: 'Have you ever done a magic trick?', options: ['Never', 'A few times', 'Often', 'I’m a magician'] },
      { q: 'What reaction do you want?', options: ['Laughter', 'Chills', 'Admiration', '“How did you do that?!”'] },
      { q: 'How much time do you have to learn?', options: ['5 minutes', 'An afternoon', 'A weekend', 'As long as it takes'] },
    ],
    tasteIntro: 'Now get a taste. Follow each step in your head and don’t tell anyone.',
    tasteSteps: [
      'Think of a number from 1 to 10.',
      'Multiply it by 9.',
      'If the result has two digits, add them together. (e.g. 27 → 2 + 7)',
      'Subtract 5.',
      'Turn the number into a letter: 1 = A, 2 = B, 3 = C, 4 = D, 5 = E...',
      'Think of a European country that starts with that letter.',
    ],
    next: 'Done, next',
    reveal: 'Read my mind',
    revealTitle: 'You’re thinking of…',
    revealAnswer: 'Denmark',
    revealFlag: '🇩🇰',
    hit: 'Nailed it! 😱',
    miss: 'Missed',
    missText: 'Check the math: any number leads to the same letter. Now imagine doing this to someone who doesn’t know the secret.',
    resultKicker: 'Your profile',
    profiles: [
      { title: 'Natural Mentalist', text: 'You have the profile of someone who impresses effortlessly. With MindReader you go from zero to “how did you do that?!” today.' },
      { title: 'Rising Illusionist', text: 'You already have the curiosity. You just need the repertoire: 13+ ready-made tricks to become the go-to person.' },
      { title: 'Crowd Master', text: 'You love the stage. MindReader gives you effects no ordinary deck can.' },
    ],
    unlocked: 'Launch price unlocked',
    seePrice: 'See my price',
    fullDemo: 'Want to see a full trick? Try the Thought Card for free',
    restart: 'Retake quiz',
  },
  pricing: {
    kicker: 'Lifetime access',
    title: 'All of this for less than a snack.',
    from: 'was',
    once: 'one-time payment · no subscription',
    features: [
      'Every trick in the app, forever',
      'Step-by-step instructions for each trick',
      'New tricks and updates included',
      'Works on your phone, no special deck',
      'Your own coupon to refer friends and earn per sale',
    ],
    bumpTitle: 'YES! Add Eu Já Sabia 2',
    bumpText: 'Rafael’s favorite: they think of a number and the prediction was already in a video recorded beforehand. Only on this screen, for just',
    total: 'Total today',
    buy: 'Get my lifetime access',
    buyBump: 'Get access + Eu Já Sabia 2',
    loading: 'Opening secure checkout...',
    secure: 'Secure payment via Stripe · credit card',
    guaranteeTitle: '7-day unconditional guarantee',
    guaranteeText: 'Use every trick. If you don’t get at least one “HOW?!”, we refund 100% of your money. No questions asked.',
    signInNotice: 'Create your account or sign in to finish your purchase. Your choice is saved.',
  },
  faq: {
    kicker: 'FAQ',
    title: 'Why use MindReader?',
    items: [
      { q: 'Do I need to know magic?', a: 'No. Every trick comes with simple instructions. Most people do their first one in under 5 minutes.' },
      { q: 'Do I need a deck or special props?', a: 'No. Everything happens on your phone. A few tricks use an ordinary deck, which is optional.' },
      { q: 'Is it a subscription?', a: 'No. It’s a one-time payment with lifetime access, updates included.' },
      { q: 'Will people notice it’s an app?', a: 'No. The tricks are designed to feel natural. The secret stays with you.' },
      { q: 'What is Eu Já Sabia 2?', a: 'A prediction trick with a personalized video. It’s an optional add-on you can buy now or later.' },
      { q: 'What if I don’t like it?', a: 'You have a 7-day guarantee. If you don’t like it, we refund you in full.' },
      { q: 'Does it work on any phone?', a: 'Yes. It runs in your phone or computer browser, Android or iPhone. Nothing to install.' },
    ],
  },
  final: {
    title: 'The next get-together could be yours.',
    text: 'A week from now you’ll either be telling how you left everyone speechless, or still just watching.',
    cta: 'I want to read minds now',
  },
  footer: 'MindReader · All rights reserved',
  premium: {
    kicker: 'Lifetime access',
    title: 'Unlock MindReader',
    subtitle: 'One payment. Every trick. Forever.',
    owned: 'You already have lifetime access',
    continue: 'Go to the tricks',
    upsellTitle: 'Add Eu Já Sabia 2',
    upsellText: 'The prediction trick with a personalized video. They think of a number and the answer was already recorded.',
    upsellButton: 'Unlock Eu Já Sabia 2',
    allSet: 'Everything is unlocked. Have fun!',
    errorCheckout: 'Couldn’t open checkout. Please try again.',
    alreadyOwned: 'You already own this.',
    blockedMain: 'This trick is part of lifetime access.',
    blockedEjs2: 'Eu Já Sabia 2 is an add-on. Unlock it below.',
  },
  success: {
    upsellKicker: 'One-time offer',
    upsellTitle: 'Get Eu Já Sabia 2 too',
    upsellText: 'The most impressive prediction trick in the app. You won’t see this price again.',
    upsellButton: 'Yes, I want it for',
    upsellSkip: 'No thanks, take me to the tricks',
  },
};

export const getOfferCopy = (language: string): OfferCopy =>
  language.toLowerCase().startsWith('pt') ? ptBR : en;
