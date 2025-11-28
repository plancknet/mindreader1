export const en = {
  common: {
    back: 'Back',
    continue: 'Continue',
    understood: 'Understood',
    playAgain: 'Play Again',
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
    videoTitle: 'Watch the Quadrante Mágico video',
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
    tip2: 'And most importantly. Be DISCREET, make SMOOTH MOVEMENTS.',
  },
  mentalConversationInstructions: {
    title: 'How Mental Conversation Works',
    subtitle: 'Learn to play this guessing game',
    videoTitle: 'Watch the highlighted video',
    videoDescription: 'Preview the mobile-friendly walkthrough before starting Mental Conversation.',
    step1Title: 'Think of a Word',
    step1Text: 'Think of a word and keep it secret. It can be any word you want.',
    step2Title: 'Chat with the AI',
    step2Text: 'The AI will ask questions to try to guess your word. Answer only with YES or NO.',
    step3Title: 'Be Honest',
    step3Text: 'For the game to work, you need to answer the AI\'s questions honestly.',
    step4Title: 'Magical Revelation',
    step4Text: 'After some questions, the AI will reveal your word with a special magical effect!',
    tipsTitle: 'Tips for Better Experience',
    tip1: 'Choose clear words, not too abstract',
    tip2: 'Answer questions consistently',
  },
  mysteryWordInstructions: {
    title: 'How Mystery Word Works',
    subtitle: 'Learn to play this telepathy game',
    videoTitle: 'Watch the highlight video',
    videoDescription: 'Review the mobile-friendly walkthrough before you start the routine.',
    step1Title: 'Chosen Category',
    step1Text: 'The number of words in the first interaction defines the category: 1 word = Animal, 2 words = Fruit, 3 words = Country.',
    step2Title: 'Revealing the Secret Letters',
    step2Text: 'In the next interactions, the FIRST letter of the LAST word reveals one letter of the secret word. Repeat until you have three letters.',
    step3Title: 'List of Possibilities',
    step3Text: 'If more than one word matches the category and letters, the app will display the available options.',
    step4Title: 'Final Selection',
    step4Text: 'Send one more reply with 1, 2, or 3 words to indicate whether the answer is the 1st, 2nd, or 3rd option.',
  },
  mysteryWord: {
    title: 'Mystery Word',
    startButton: "Yes, let's begin!",
    inputTitle: 'Type your mystery word',
    inputDescription: 'Secretly type a word.',
    inputPlaceholder: 'Your secret word...',
    startPresentation: 'Start Presentation',
    stopButton: 'Stop',
    stoppedTitle: 'I read your mind! ✨',
    stoppedSubtitle: 'Did I get it right?',
    menuButton: 'Back to Menu',
    playAgain: 'Play Again',
    phrases: "Let's get started!||Ready for a mind-reading game?||Can I begin reading your thoughts?||Shall we awaken our telepathy powers?||How about starting the psychic challenge?"
  },
  mixDeCartas: {
    chooseTitle: "Choose a Card",
    chooseSubtitle: "Select any card from the deck",
    revealTitle: "Secret Revelation",
    revealSubtitle: "Click Shuffle to generate new revelation cards",
    chosenCard: "Chosen card:",
    shuffleButton: "Shuffle",
    magicTip: "Each shuffle generates a new sequence that uniquely encodes your card!",
  },
  cartaMental: {
    title: 'Carta Mental',
    subtitle: 'Use the MindReader-branded back to silently transmit the card your friend picked.',
    gridInstruction: 'Tap one of the 12 invisible positions. Each tap represents cards from 2 to K.',
    aceHint: 'Leave the grid untouched to signal that the thought-of card was an Ace.',
    suitsInstruction: 'Use the ?Reveal card? bar and press one of its four invisible segments to choose the suit.',
    revealButton: 'Reveal card',
    revealButtonAria: 'Reveal card by choosing the {suit} suit',
    rankButtonAria: 'Select value {rank}',
    selectedRank: 'Selected value: {rank}',
    noRank: 'No value selected (assuming Ace)',
    revealedTitle: 'Selected card',
    revealedDescription: '{rank} of {suit}',
    noSuitSelected: 'Tap one side of the ?Reveal card? bar to show the suit.',
    reset: 'Clear selection',
    suits: {
      spades: 'Spades',
      hearts: 'Hearts',
      diamonds: 'Diamonds',
      clubs: 'Clubs',
    },
  },
  raspaCarta: {
    title: 'Raspa Carta',
    subtitle: 'Secretly pick a Jack, Queen, or King and reveal it by scratching the screen.',
    gridInstruction: 'Use the first column for Jacks, the second for Queens, and the third for Kings (Spades, Hearts, Diamonds, Clubs).',
    scratchHint: 'Slide your finger like a digital eraser to gradually uncover the chosen card.',
    revealedMessage: 'Full reveal complete! Pick another card to keep the mystery going.',
    reset: 'Pick another card',
    columns: {
      jacks: 'Jacks',
      queens: 'Queens',
      kings: 'Kings',
    },
    faces: {
      jack: 'Jack',
      queen: 'Queen',
      king: 'King',
    },
    gridButtonAria: 'Select the {rank} of {suit}',
  },
  mentalConversation: {
    instructions: '1. Your first reply reveals the chosen category (1 word = Animal, 2 words = Fruit, 3 words = Country).\n2. In the next three replies, the first letter of the LAST word tells the app the first letter of your friend’s word. Repeat this three times.\n3. If the app still hasn’t guessed after three letters, it will display a list of possibilities.\n4. Send one more reply with 1, 2, or 3 words to indicate whether the answer is the 1st, 2nd, or 3rd option.',
    title: 'Mental Conversation',
    messages: {
      greeting: "Hi! I'm an artificial intelligence with mind-reading powers. 🧠✨\n\nAsk your friend to think of an ANIMAL, FRUIT, or COUNTRY. Don't tell me the category or the word, just ask them to think about it!",
      readyCheck: 'Has your friend already chosen and is ready to begin?',
      startCollecting: "Perfect! I'll ask a few questions to read your friend's mind... Answer naturally! 🔮\n\nWhat is your favorite color?",
      askHobby: 'Interesting! And what is your favorite hobby?',
      askSeason: 'Great! Last question: what is your favorite season of the year?',
      singleResult: '🎯 Amazing! I am sensing a very strong energy...\n\n✨ The word your friend thought of is:\n\n🌟 **{word}** 🌟\n\nAm I right? ✨',
      multipleOptions: 'Hmm... I’m receiving some signals. n\nThese are the possibilities I’m picking up: {options}\n\nAm I on the right track?',
      noMatch: 'Oops! I couldn’t quite capture the word. Shall we try again? Type "reiniciar" to start over.',
      finalReveal: '🎊 EUREKA!\n\n🔮 **{word}** 🔮\n\nI read your friend’s mind! The category was {category} and the word was {word}! 🧠✨\n\nWant to play again? Type anything to go back to the menu!'
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
      selectLetterDescription: 'Tap the hidden grid on the card to send the next letter.',
    },
  },
  gameSelector: {
    heading: 'Mind Readers',
    subheading: 'Choose a mind-reading experience',
    play: 'Play',
    comingSoon: 'Coming soon',
    underConstruction: 'Under construction',
    modalTitle: 'How to Play',
    cards: {
      mindReader: {
        title: 'Magic Quadrant',
        description: 'Read minds through subtle head movements'
      },
      mixDeCartas: {
        title: 'Card Mix',
        description: 'Encode a hidden card using a six-card color pattern'
      },
      cartaMental: {
        title: 'Carta Mental',
        description: 'Use the secret back to reveal both value and suit'
      },
      raspaCarta: {
        title: 'Raspa Carta',
        description: 'Scratch the magic foil to reveal a hidden Jack, Queen, or King'
      },
      suasPalavras: {
        title: 'Your Words',
        description: 'Enter five personal words to reveal the secret'
      },
      mentalConversation: {
        title: 'Mental Conversation',
        description: 'Chat with an AI that tries to guess your word'
      },
      papoReto: {
        title: 'Papo Reto',
        description: 'Use the card prompts to reveal the chosen word.'
      },
      mysteryWord: {
        title: 'Mystery Word',
        description: 'Secretly reveal your word to the audience'
      },
      euJaSabia: {
        title: 'I Already Knew',
        description: 'Capture the chosen number before revealing it with the video'
      },
      myEmojis: {
        title: 'My Emojis',
        description: 'Figure out whose emoji belongs to whom'
      }
    }
  },
};
