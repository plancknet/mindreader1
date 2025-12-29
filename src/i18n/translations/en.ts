export const en = {
  common: {
    back: 'Back',
    continue: 'Continue',
    understood: 'Got it',
    playAgain: 'Read Again',
    backHome: 'Back to Home',
    select: 'Select',
    send: 'Send',
    logout: 'Log out',
  },
  auth: {
    title: 'MindReader',
    subtitle: 'Get started in seconds',
    googleButton: 'Continue with Google',
    magicLinkButton: 'Send access link',
    orDivider: 'Or',
    emailLabel: 'Email',
    emailPlaceholder: 'you@email.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '********',
    submitLogin: 'Sign in',
    submitSignUp: 'Sign up',
    toggleToSignUp: 'Create a new account',
    toggleToLogin: 'Already have an account? Sign in',
    forgotPassword: 'Forgot password',
    backToLogin: 'Back to login',
    resetPasswordTitle: 'Reset password',
    resetPasswordSubtitle: 'Enter your email to receive the recovery link',
    sendResetLink: 'Send recovery link',
    toast: {
      loginErrorTitle: 'Login error',
      loginCancelled: 'Login canceled. Try again?',
      loginGeneric: "Oops! We couldn't log you in. Please try again.",
      missingFieldsTitle: 'Required fields',
      missingFieldsDescription: 'Fill in email and password.',
      weakPasswordTitle: 'Weak password',
      weakPasswordDescription: 'Password must be at least 8 characters.',
      signupSuccessTitle: 'Account created!',
      signupSuccessDescription: 'You can start using MindReader now.',
      authErrorTitle: 'Authentication error',
      invalidCredentials: 'Check your email and password.',
      magicLinkSentTitle: 'Link sent!',
      magicLinkSentDescription: 'Check your email to access your account.',
      resetLinkSentTitle: 'Recovery link sent!',
      resetLinkSentDescription: 'Check your email to reset your password.',
      missingEmailTitle: 'Email required',
      missingEmailDescription: 'Enter your email to continue.',
    },
  },
  connectMind: {
    title: 'MindReader',
    initializing: 'Initializing mental connection...',
    waitingCamera: 'Waiting for camera...',
    connectButton: 'Connect to mind',
    instructionsButton: 'Instructions',
  },
  selectTheme: {
    title: 'What are you thinking?',
    subtitle: 'Choose a category and think of a word',
    tip: '💡 Tip: Think of a word as soon as you see the options',
  },
  startPrompt: {
    placeholder: 'Type: {word}',
    letterCount: '{count}/{total} letters',
  },
  gameplay: {
    round: 'Round {round} • {count} words',
    thinkWord: 'Think of a word...',
    observePositions: 'Observe the new positions...',
    eliminatingSide: 'Eliminating {side} side...',
    left: 'left',
    right: 'right',
  },
  result: {
    title: 'I read your mind!',
    subtitle: 'The word you thought of is:',
  },
  instructions: {
    title: 'How It Works',
    subtitle: 'Understand the mental detection process',
    videoTitle: 'Watch the Magic Quadrant video',
    videoDescription: 'Preview the mobile-friendly walkthrough before starting the game.',
    step1Title: 'Head Movement Detection',
    step1Text: 'We can identify which way you slightly turned your head.',
    step2Title: 'Mental Choice',
    step2Text: 'Turn your head DISCREETLY to one side or the other. It is IMPORTANT TO BE DISCREET, so that no one discovers this secret.',
    step3Title: 'Elimination Process',
    step3Text: 'In each round, half of the words are eliminated based on the detected direction. Turn your head to the SIDE you want to ELIMINATE. The side where your word is will have GREEN or YELLOW colors.',
    step4Title: 'Main Method: Typing Detection',
    step4Text: 'When typing the start word, you can replace the LAST LETTER with a letter that indicates your thought word. Since each word starts with a different letter, just type that letter at the end. For example: if you thought of "Brazil", type "STARB" instead of "START".',
    tipsTitle: 'Tips for Better Detection',
    tip1: 'Keep your position during the countdown',
    tip2: 'And most importantly: Be DISCREET, make SMOOTH MOVEMENTS.',
  },
  mentalConversationInstructions: {
    title: 'Mental Conversation Instructions',
    subtitle: 'Follow the cards to master the flow',
    videoTitle: 'Watch the demo video',
    videoDescription: 'Preview the mobile-friendly walkthrough before starting Mental Conversation.',
    step1Title: 'Chosen Category',
    step1Text: 'The category is determined by the word count in the first interaction. 1 word = Animal, 2 words = Fruit, 3 words = Country.',
    step2Title: 'Revealing Secret Letters',
    step2Text: 'In the next interactions, the FIRST letter of the LAST word reveals one letter of the secret word. Repeat until you indicate three letters.',
    step3Title: 'List of Possibilities',
    step3Text: 'If the app finds more than one match for the category and three letters, it will show the available options.',
    step4Title: 'Final Selection',
    step4Text: 'Say 1 word to indicate the 1st option. Say 2 words to indicate the 2nd option. And so on...',
  },
  mysteryWordInstructions: {
    title: 'How Mystery Word Works',
    subtitle: 'Learn to use this telepathy mode',
    videoTitle: 'Watch the step-by-step video',
    videoDescription: 'Preview the mobile-friendly tutorial before starting the presentation.',
    step1Title: 'Pay Attention to the Opening Phrase',
    step1Text: 'The app will display an opening phrase. Carefully remember the last word of that phrase, as it determines everything else.',
    step2Title: 'Count the Letters',
    step2Text: 'Count how many letters the LAST word of the opening phrase has. Example: if the last word is "Mystery", it has 7 letters.',
    step3Title: 'Position of the Mystery Word',
    step3Text: 'The number of letters indicates at which position your friend\'s word will appear. In the example above, the word will appear at position 7.',
    step4Title: 'Defining the Mystery Word',
    step4Text: 'If more than one word is displayed, your next interaction defines the correct option: respond with 1 word for the 1st option, 2 words for the 2nd option, and 3 words for the 3rd option.',
  },
  mysteryWord: {
    title: 'Mystery Word',
    startButton: "Yes, let's begin!",
    inputTitle: 'Type your mystery word',
    inputDescription: 'Secretly type a word.',
    inputPlaceholder: 'Your secret word...',
    startPresentation: 'Start Presentation',
    stopButton: 'Stop',
    stoppedTitle: 'I read your mind!',
    stoppedSubtitle: 'Did I get it right?',
    menuButton: 'Back to Menu',
    playAgain: 'Use Again',
    phrases: "Let's get started!||Ready for a mind-reading game?||Can I begin reading your thoughts?||Shall we awaken our telepathy powers?||How about starting the psychic challenge?"
  },
  mixDeCartas: {
    chooseTitle: 'Choose a Card',
    chooseSubtitle: 'Select any card from the deck',
    revealTitle: 'Card Mix',
    revealSubtitle: 'Tap Shuffle to generate new revelation cards',
    chosenCard: '',
    shuffleButton: 'Shuffle',
    resetButton: 'Reset',
    magicTip: '',
  },
  pontaCarta: {
    chooseTitle: 'Card Edge',
    chooseSubtitle: 'Select one of the cards and shuffle.',
    shuffleButton: 'Shuffle',
    hint: '',
    resetButton: 'Reset',
  },
  cartaMental: {
    title: 'Mental Card',
    subtitle: 'Use the custom MindReader back to mentally transmit the card chosen by your friend.',
    gridInstruction: 'Discreetly tap one of the 12 invisible positions. Each tap represents cards from 2 to K.',
    aceHint: 'If no tap is made, you indicate that the thought-of card was an Ace.',
    suitsInstruction: 'Use the Reveal card button and press one of the four quadrants to indicate the desired suit.',
    revealButton: 'Reveal card',
    revealButtonAria: 'Reveal card by choosing the {suit} suit',
    rankButtonAria: 'Select value {rank}',
    selectedRank: 'Selected value: {rank}',
    noRank: 'No value selected (assuming Ace)',
    revealedTitle: 'Selected card',
    revealedDescription: '{rank} of {suit}',
    noSuitSelected: 'Tap one side of the Reveal card button to show the suit.',
    reset: 'Clear selection',
    suits: {
      spades: 'Spades',
      hearts: 'Hearts',
      diamonds: 'Diamonds',
      clubs: 'Clubs',
    },
  },
  raspaCarta: {
    title: 'Scratch Card',
    subtitle: 'What is your favorite face card (Jack, Queen or King)? Which suit?',
    gridInstruction: '',
    scratchHint: 'Slide your finger like a magic eraser to reveal the chosen card.',
    revealedMessage: 'Card revealed! Choose another card to continue the presentation.',
    reset: 'Choose another card',
    columns: {
      jacks: '',
      queens: '',
      kings: '',
    },
    faces: {
      jack: '',
      queen: '',
      king: '',
    },
    gridButtonAria: 'Select the {rank} of {suit}',
  },
  mentalConversation: {
    instructions: '1. Your first interaction reveals the chosen category (1 word = Animal, 2 words = Fruit, 3 words = Country).\n2. In the next three interactions, the first letter of the LAST word indicates the first letter of your friend\'s word. Repeat this 3 times.\n3. If the app still hasn\'t guessed after three letters, it will display a list of possibilities.\n4. Make one more interaction with 1, 2, or 3 words to indicate whether the correct word is the 1st, 2nd, or 3rd option.',
    title: 'Mental Conversation',
    messages: {
      greeting: "Hi! I'm an artificial intelligence with mind-reading powers. 🧠✨\n\nAsk your friend to think of an ANIMAL, FRUIT, or COUNTRY. Don't tell me the category or the word, just ask them to think about it!",
      readyCheck: 'Has your friend already chosen and is ready to begin?',
      startCollecting: "Perfect! I'll ask a few questions to read your friend's mind... Answer naturally! 📝\n\nWhat is your favorite color?",
      askHobby: 'Interesting! And what is your favorite hobby?',
      askSeason: 'Great! Last question: what is your favorite season of the year?',
      singleResult: '🎯 Amazing! I am sensing a very strong energy...\n\n🎉 The word your friend thought of is:\n\n🔮 **{word}** 🔮\n\nAm I right? 🎉',
      multipleOptions: 'Hmm... I\'m receiving some signals.\n\nThese are the possibilities I\'m picking up: {options}\n\nAm I on the right track?',
      noMatch: 'Oops! I couldn\'t quite capture the word. Shall we try again? Type "restart" to start over.',
      finalReveal: '🎊 EUREKA!\n\n🔮 **{word}** 🔮\n\nI read your friend\'s mind! The category was {category} and the word was {word}! 🧠✨\n\nWant to play again? Type anything to go back to the menu!'
    },
    status: {
      processingAudio: 'Processing audio...',
      speaking: 'Speaking...'
    },
    input: {
      placeholder: 'Type your answer...',
      recording: 'Recording...'
    },
    toast: {
      errorTitle: 'Error',
      audioProcessingFailed: "Couldn't process the audio. Please try again.",
      recordingTitle: 'Recording',
      recordingDescription: 'Speak now...',
      micErrorDescription: "Couldn't access the microphone."
    },
    categories: {
      animal: 'ANIMAL',
      fruit: 'FRUIT',
      country: 'COUNTRY'
    }
  },
  papoReto: {
    letterButtonAria: 'Select letter {letter}',
    selectedLetter: 'Letter {letter} selected.',
    toast: {
      selectLetterTitle: 'Select a letter',
      selectLetterDescription: 'Discreetly tap the card to send the next letter.',
    },
  },
  gameSelector: {
    heading: 'Mind Readers',
    subheading: 'Choose a mind-reading experience',
    play: 'Start',
    comingSoon: 'Coming soon',
    underConstruction: 'Under construction',
    modalTitle: 'How?',
    cards: {
      mindReader: {
        title: 'Magic Quadrant',
        description: 'In which quadrant is the chosen word?'
      },
      mixDeCartas: {
        title: 'Card Mix',
        description: 'Connect your mind and discover the card'
      },
      pontaCarta: {
        title: 'Card Edge',
        description: 'Select special cards and reveal only the edge'
      },
      oiSumida: {
        title: 'Hi There',
        description: 'Card grid with instant shuffle'
      },
      jogoVelhaBruxa: {
        title: 'Witch Tic-Tac-Toe',
        description: 'Challenge the witch in a mystical X and O duel'
      },
      cartaMental: {
        title: 'Mental Card',
        description: 'Connect your friend\'s mind and discover the card'
      },
      raspaCarta: {
        title: 'Scratch Card',
        description: 'Scratch the digital screen to reveal the secret King, Queen or Jack'
      },
      suasPalavras: {
        title: 'Your Words',
        description: 'Use five personal words to reveal the secret'
      },
      cartaPensada: {
        title: 'Thought Card',
        description: 'Classic 21-card trick to discover the thought'
      },
      mentalConversation: {
        title: 'Mental Conversation',
        description: 'Chat with an AI that tries to guess your word'
      },
      papoReto: {
        title: 'Straight Talk',
        description: 'Questions inside the card to reveal the thought word.'
      },
      mysteryWord: {
        title: 'Mystery Word',
        description: 'Secretly reveal your word to the audience'
      },
      euJaSabia: {
        title: 'I Already Knew',
        description: 'Record the thought number and reveal it during the video'
      },
      euJaSabia2: {
        title: 'I Already Knew 2',
        description: 'Reveal the number using illustrated masks.'
      },
      myEmojis: {
        title: 'My Emojis',
        description: 'Figure out whose emoji belongs to whom'
      },
      googleMime: {
        title: 'Google Mime',
        description: 'Simulate a Google search and reveal the thought celebrity'
      }
    }
  },
  premium: {
    title: 'Choose Your Plan',
    upgradeRequired: 'Upgrade required',
    gameBlocked: 'The game "{gameTitle}" requires the {planName} plan or higher.',
    free: {
      name: 'Free Plan',
      features: [
        'Level 1 magic tricks unlimited',
        'Level 2 and 3 magic tricks limited to 3 uses each',
      ],
      button: 'Continue on Free',
    },
    standard: {
      name: 'Standard Plan',
      features: [
        'Lifetime access with a single payment',
        'Levels 1, 2, 3 and 4 unlocked without limits',
        'Future updates included',
        'Priority Support',
      ],
      button: 'Upgrade to Standard',
      currentButton: 'Continue on Standard',
    },
    influencer: {
      name: 'Influencer Plan',
      features: [
        'All Lifetime benefits',
        'Level 5 unlocked without limits',
        'MindReader group and co-creation of new tricks',
        '30% discount coupons for followers',
        'Commission for each redeemed coupon',
      ],
      button: 'Upgrade to Influencer',
      currentButton: 'Continue on Influencer',
    },
    loading: 'Loading...',
    processingPayment: 'Processing payment...',
    errorLoadingProfile: 'Could not load your information.',
    paymentError: 'Could not start checkout. Please try again.',
    paymentCanceled: 'Payment canceled. You can try again whenever you want.',
  },
  welcome: {
    title: 'Welcome to MindReader!',
    subtitle: 'You are now ready to amaze your friends with mental magic tricks.',
    startButton: 'Start Playing',
  },
};
