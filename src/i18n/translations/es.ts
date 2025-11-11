export const es = {
  common: {
    back: 'Volver',
    continue: 'Continuar',
    understood: 'Entendido',
    playAgain: 'Jugar de Nuevo',
    backHome: 'Volver al Inicio',
    select: 'Seleccionar',
    send: 'Enviar',
    logout: 'Cerrar sesión',
  },
  auth: {
    title: 'MindReader',
    subtitle: 'Comienza en segundos',
    googleButton: 'Continuar con Google',
    magicLinkButton: 'Enviar enlace de acceso',
    orDivider: 'O',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@email.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: '********',
    submitLogin: 'Iniciar sesión',
    submitSignUp: 'Crear cuenta',
    toggleToSignUp: 'Crear una cuenta nueva',
    toggleToLogin: '¿Ya tienes cuenta? Inicia sesión',
    forgotPassword: 'Olvidé mi contraseña',
    backToLogin: 'Volver al inicio de sesión',
    resetPasswordTitle: 'Recuperar contraseña',
    resetPasswordSubtitle: 'Ingresa tu correo para recibir el enlace de recuperación',
    sendResetLink: 'Enviar enlace de recuperación',
    toast: {
      loginErrorTitle: 'Error al iniciar sesión',
      loginCancelled: 'Inicio de sesión cancelado. ¿Intentar nuevamente?',
      loginGeneric: '¡Ups! No pudimos iniciar la sesión. Intenta de nuevo.',
      missingFieldsTitle: 'Campos obligatorios',
      missingFieldsDescription: 'Completa el correo y la contraseña.',
      weakPasswordTitle: 'Contraseña débil',
      weakPasswordDescription: 'La contraseña debe tener al menos 8 caracteres.',
      signupSuccessTitle: '¡Cuenta creada!',
      signupSuccessDescription: 'Ya puedes empezar a usar MindReader.',
      authErrorTitle: 'Error de autenticación',
      invalidCredentials: 'Verifica tu correo y contraseña.',
      magicLinkSentTitle: '¡Enlace enviado!',
      magicLinkSentDescription: 'Revisa tu correo para acceder a tu cuenta.',
      resetLinkSentTitle: '¡Enlace de recuperación enviado!',
      resetLinkSentDescription: 'Revisa tu correo para restablecer tu contraseña.',
      missingEmailTitle: 'Correo obligatorio',
      missingEmailDescription: 'Ingresa tu correo para continuar.',
    },
  },
  connectMind: {
    title: 'MindReader',
    initializing: 'Inicializando conexión mental...',
    waitingCamera: 'Esperando cámara...',
    connectButton: 'Conectar a la mente',
    instructionsButton: 'Instrucciones',
  },
  selectTheme: {
    title: '¿Qué estás pensando?',
    subtitle: 'Elige una categoría y piensa en una palabra',
    tip: '💡 Consejo: Piensa en una palabra tan pronto como veas las opciones',
  },
  startPrompt: {
    placeholder: 'Escribe: {word}',
    letterCount: '{count}/{total} letras',
  },
  gameplay: {
    round: 'Ronda {round} • {count} palabras',
    thinkWord: 'Piensa en una palabra...',
    observePositions: 'Observa las nuevas posiciones...',
    eliminatingSide: 'Eliminando lado {side}...',
    left: 'izquierdo',
    right: 'derecho',
  },
  result: {
    title: '¡Leí tu mente!',
    subtitle: 'La palabra en la que pensaste es:',
  },
  instructions: {
    title: 'Cómo Funciona',
    subtitle: 'Comprende el proceso de detección mental',
    step1Title: 'Detección por Movimiento de Cabeza',
    step1Text: 'Podemos identificar hacia qué lado giraste levemente la cabeza.',
    step2Title: 'Elección Mental',
    step2Text: 'Gira la cabeza DISCRETAMENTE hacia un lado u otro. Es IMPORTANTE SER DISCRETO, para que nadie descubra este secreto.',
    step3Title: 'Proceso de Eliminación',
    step3Text: 'En cada ronda, la mitad de las palabras se eliminan según la dirección detectada. Gira la cabeza hacia el LADO que quieres ELIMINAR. El lado donde está tu palabra tendrá colores VERDE o AMARILLO.',
    step4Title: 'Método Principal: Detección por Escritura',
    step4Text: 'Al escribir la palabra inicial, puedes reemplazar la ÚLTIMA LETRA con una letra que indique tu palabra pensada. Como cada palabra comienza con una letra diferente, solo escribe esa letra al final. Por ejemplo: si pensaste en "Brasil", escribe "INICIAB" en lugar de "INICIAR".',
    tipsTitle: 'Consejos para una Mejor Detección',
    tip1: 'Mantén la posición durante la cuenta regresiva',
    tip2: 'Y lo más importante. Sé DISCRETO, haz MOVIMIENTOS SUAVES.',
  },
  mentalConversationInstructions: {
    title: 'Cómo Funciona la Conversación Mental',
    subtitle: 'Aprende a jugar este juego de adivinanza',
    step1Title: 'Piensa en una Palabra',
    step1Text: 'Piensa en una palabra y manténla en secreto. Puede ser cualquier palabra que quieras.',
    step2Title: 'Conversa con la IA',
    step2Text: 'La IA hará preguntas para intentar adivinar tu palabra. Responde solo con SÍ o NO.',
    step3Title: 'Sé Honesto',
    step3Text: 'Para que el juego funcione, debes responder honestamente a las preguntas de la IA.',
    step4Title: 'Revelación Mágica',
    step4Text: '¡Después de algunas preguntas, la IA revelará tu palabra con un efecto mágico especial!',
    tipsTitle: 'Consejos para Mejor Experiencia',
    tip1: 'Elige palabras claras y no demasiado abstractas',
    tip2: 'Responde consistentemente a las preguntas',
  },
  mysteryWordInstructions: {
    title: 'Cómo Funciona la Palabra Misteriosa',
    subtitle: 'Aprende a jugar este juego de telepatía',
    step1Title: 'Categoría Elegida',
    step1Text: 'La cantidad de palabras en la primera interacción define la categoría: 1 palabra = Animal, 2 palabras = Fruta, 3 palabras = País.',
    step2Title: 'Revelando las letras secretas',
    step2Text: 'En las siguientes interacciones, la PRIMERA letra de la ÚLTIMA palabra revela una letra de la palabra misteriosa. Repite hasta tener tres letras.',
    step3Title: 'Lista de posibilidades',
    step3Text: 'Si más de una palabra coincide con la categoría y las letras, la app mostrará las opciones disponibles.',
    step4Title: 'Selección final',
    step4Text: 'Envía otra respuesta con 1, 2 o 3 palabras para indicar si la respuesta es la 1.ª, 2.ª o 3.ª opción.',
  },
  mysteryWord: {
    title: 'Palabra Misteriosa',
    startButton: '¡Sí, empecemos!',
    inputTitle: 'Escribe tu palabra misteriosa',
    inputDescription: 'Escribe una palabra en secreto.',
    inputPlaceholder: 'Tu palabra secreta...',
    startPresentation: 'Iniciar presentación',
    stopButton: 'Detener',
    stoppedTitle: '¡Leí tu mente! ✨',
    stoppedSubtitle: '¿Acerté?',
    menuButton: 'Volver al menú',
    playAgain: 'Jugar otra vez',
    phrases: '¡Vamos a empezar!||¿Listo para un juego de lectura mental?||¿Puedo empezar a leer tus pensamientos?||¿Activamos el poder de la telepatía?||¿Arrancamos el desafío psíquico?'
  },
  mentalConversation: {
    instructions: '1. Tu primera interacción revela la categoría elegida (1 palabra = Animal, 2 palabras = Fruta, 3 palabras = País).\n2. En las siguientes tres interacciones, la primera letra de la ÚLTIMA palabra indica la primera letra de la palabra de tu amigo. Repite esto 3 veces.\n3. Si con esas tres letras la app aún no acierta, mostrará una lista de posibilidades.\n4. Haz otra interacción con 1, 2 o 3 palabras para indicar si la respuesta correcta es la 1.ª, 2.ª o 3.ª opción.',
    title: 'Conversación Mental',
    messages: {
      greeting: '¡Hola! Soy una inteligencia artificial con poderes de lectura mental. 🧠✨\n\nPídele a tu amigo que piense en un ANIMAL, FRUTA o PAÍS. No me cuentes la categoría ni la palabra, ¡solo pídele que piense!',
      readyCheck: '¿Tu amigo ya eligió y está listo para comenzar?',
      startCollecting: '¡Perfecto! Haré algunas preguntas para leer la mente de tu amigo... ¡Responde naturalmente! 🔮\n\n¿Cuál es tu color favorito?',
      askHobby: '¡Interesante! ¿Cuál es tu pasatiempo preferido?',
      askSeason: '¡Genial! Última pregunta: ¿cuál es tu estación del año favorita?',
      singleResult: '🎯 ¡Increíble! Estoy captando una energía muy fuerte...\n\n✨ La palabra en la que pensó tu amigo es:\n\n🌟 **{word}** 🌟\n\n¿Acerté? ✨',
      multipleOptions: 'Hmm... estoy recibiendo algunas señales. \n\nEstas son las posibilidades que capto: {options}\n\n¿Voy por el camino correcto?',
      noMatch: '¡Ups! Parece que no pude captar la palabra. ¿Volvemos a intentar? Escribe "reiniciar" para empezar de nuevo.',
      finalReveal: '🎊 ¡EUREKA!\n\n🔮 **{word}** 🔮\n\n¡Leí la mente de tu amigo! La categoría era {category} y la palabra era {word}. 🧠✨\n\n¿Quieres jugar otra vez? Escribe cualquier cosa para volver al menú.'
    },
    status: {
      processingAudio: 'Procesando audio...',
      speaking: 'Hablando...'
    },
    input: {
      placeholder: 'Escribe tu respuesta...',
      recording: 'Grabando...'
    },
    toast: {
      errorTitle: 'Error',
      audioProcessingFailed: 'No fue posible procesar el audio. Intenta nuevamente.',
      recordingTitle: 'Grabando',
      recordingDescription: 'Habla ahora...',
      micErrorDescription: 'No fue posible acceder al micrófono.'
    },
    categories: {
      animal: 'ANIMAL',
      fruit: 'FRUTA',
      country: 'PAÍS'
    }
  },
  gameSelector: {
    heading: 'Lectores de Mentes',
    subheading: 'Elige una experiencia de lectura mental',
    play: 'Jugar',
    comingSoon: 'Próximamente',
    underConstruction: 'En construcción',
    modalTitle: 'Cómo jugar',
    cards: {
      mindReader: {
        title: 'Cuadrante Mágico',
        description: 'Lee la mente mediante movimientos sutiles de la cabeza'
      },
      mentalConversation: {
        title: 'Conversación Mental',
        description: 'Conversa con una IA que intenta adivinar tu palabra'
      },
      mysteryWord: {
        title: 'Palabra Misteriosa',
        description: 'Revela tu palabra en secreto al público'
      },
      myEmojis: {
        title: 'Mis Emojis',
        description: '¿De quién es cada emoji?'
      }
    }
  },
};
