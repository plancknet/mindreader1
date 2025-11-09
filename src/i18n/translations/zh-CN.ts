export const zhCN = {
  common: {
    back: '返回',
    continue: '继续',
    understood: '明白了',
    playAgain: '再玩一次',
    backHome: '返回首页',
    select: '选择',
    send: '??',
    logout: '????',
  },
  auth: {
    title: 'MindReader',
    subtitle: '几秒内开始使用',
    googleButton: '使用 Google 继续',
    magicLinkButton: '发送访问链接',
    orDivider: '或',
    emailLabel: '电子邮箱',
    emailPlaceholder: 'you@example.com',
    passwordLabel: '密码',
    passwordPlaceholder: '********',
    submitLogin: '登录',
    submitSignUp: '创建账户',
    toggleToSignUp: '创建新账户',
    toggleToLogin: '已经有账户？登录',
    forgotPassword: '忘记密码',
    backToLogin: '返回登录',
    resetPasswordTitle: '重置密码',
    resetPasswordSubtitle: '输入您的电子邮箱以接收恢复链接',
    sendResetLink: '发送恢复链接',
    toast: {
      loginErrorTitle: '登录错误',
      loginCancelled: '登录已取消。要再试一次吗？',
      loginGeneric: '哎呀！我们未能让你登录，请重试。',
      missingFieldsTitle: '必填字段',
      missingFieldsDescription: '请输入邮箱和密码。',
      weakPasswordTitle: '密码太弱',
      weakPasswordDescription: '密码至少需要 8 个字符。',
      signupSuccessTitle: '账户已创建！',
      signupSuccessDescription: '你现在可以开始使用 MindReader。',
      authErrorTitle: '身份验证错误',
      invalidCredentials: '请检查邮箱和密码。',
      magicLinkSentTitle: '链接已发送！',
      magicLinkSentDescription: '请检查您的电子邮箱以访问您的账户。',
      resetLinkSentTitle: '恢复链接已发送！',
      resetLinkSentDescription: '请检查您的电子邮箱以重置您的密码。',
      missingEmailTitle: '需要电子邮箱',
      missingEmailDescription: '请输入您的电子邮箱以继续。',
    },
  },
  connectMind: {
    title: 'MindReader',
    initializing: '正在初始化心灵连接...',
    waitingCamera: '等待摄像头...',
    connectButton: '连接心灵',
    instructionsButton: '使用说明',
  },
  selectTheme: {
    title: '你在想什么？',
    subtitle: '选择一个类别并想一个词',
    tip: '💡 提示：一看到选项就想一个词',
  },
  startPrompt: {
    placeholder: '输入：{word}',
    letterCount: '{count}/{total} 个字符',
  },
  gameplay: {
    round: '第 {round} 轮 • {count} 个词',
    thinkWord: '想一个词...',
    observePositions: '观察新位置...',
    eliminatingSide: '正在消除{side}侧...',
    left: '左',
    right: '右',
  },
  result: {
    title: '我读到了你的心！',
    subtitle: '你想的词是：',
  },
  instructions: {
    title: '工作原理',
    subtitle: '了解心灵检测过程',
    step1Title: '头部动作检测',
    step1Text: '我们可以识别出你稍微转头的方向。',
    step2Title: '心灵选择',
    step2Text: '谨慎地将头转向一侧或另一侧。重要的是要谨慎，这样就没有人会发现这个秘密。',
    step3Title: '消除过程',
    step3Text: '在每一轮中，根据检测到的方向消除一半的词。将头转向你想要消除的一侧。你的词所在的一侧将显示绿色或黄色。',
    step4Title: '替代方法：打字检测',
    step4Text: '输入起始词时，您可以将最后一个字母替换为表示您想到的单词的字母。由于每个单词都以不同的字母开头，因此只需在末尾输入该字母即可。例如：如果您想到"巴西"，请输入"开始B"而不是"开始"。',
    tipsTitle: '更好检测的提示',
    tip1: '在倒计时期间保持位置',
    tip2: '最重要的是。要谨慎，做平滑的动作。',
  },
  mentalConversationInstructions: {
    title: '心灵对话如何工作',
    subtitle: '学习玩这个猜谜游戏',
    step1Title: '想一个词',
    step1Text: '想一个词并保密。可以是你想要的任何词。',
    step2Title: '与AI对话',
    step2Text: 'AI会提问试图猜测你的词。只用是或否回答。',
    step3Title: '诚实回答',
    step3Text: '为了让游戏正常进行，你需要诚实回答AI的问题。',
    step4Title: '神奇的揭示',
    step4Text: '经过几个问题后，AI会用特殊的魔法效果揭示你的词！',
    tipsTitle: '更好体验的提示',
    tip1: '选择清晰且不太抽象的词',
    tip2: '始终如一地回答问题',
  },
  mysteryWordInstructions: {
    title: '神秘词如何工作',
    subtitle: '学习玩这个心灵感应游戏',
    step1Title: '初始短语',
    step1Text: '游戏将以随机短语开始。短语编号决定你的词将在哪个位置揭示。',
    step2Title: '输入你的秘密词',
    step2Text: '秘密输入你想到的词。没有人需要看到它。',
    step3Title: '词的展示',
    step3Text: '随机词将在屏幕上出现，每个持续3秒。你的词将在初始短语定义的位置显示。',
    step4Title: '音频和揭示',
    step4Text: '每个词都会被朗读出来。当你的词出现时，它将被揭示给所有人！',
    tipsTitle: '更好体验的提示',
    tip1: '选择一个清晰且容易发音的词',
    tip2: '当你想结束游戏时点击"停止"',
  },
  mysteryWord: {
    title: '神秘单词',
    startButton: '开始吧！',
    inputTitle: '输入你的神秘单词',
    inputDescription: '悄悄输入一个单词。',
    inputPlaceholder: '你的秘密单词...',
    startPresentation: '开始展示',
    stopButton: '停止',
    stoppedTitle: '我读到你的心了！✨',
    stoppedSubtitle: '猜对了吗？',
    menuButton: '返回菜单',
    playAgain: '再玩一次',
    phrases: '准备好开始了吗？||我们来玩读心游戏吧？||让我来扫描你的想法可以吗？||一起唤醒心灵感应？||启动超能力挑战吧？'
  },
  mentalConversation: {
    instructions: '1. 第一次回复用 1、2 或 3 个词告诉应用类别（1 = 动物，2 = 水果，3 = 国家）。
2. 接下来的 3 次回复里，最后一个词的首字母就是你朋友单词的首字母。
3. 如果得到 3 个字母后仍没猜对，应用会显示可能的单词列表。
4. 再用 1、2 或 3 个词回答，表示正确答案在列表中的第 1、2 或 3 个位置。',
    title: '心灵对话',
    messages: {
      greeting: '你好！我是一个拥有读心术的 AI。🧠✨

请让你的朋友想一个动物、水果或国家，不要告诉我类别或单词，只要让 TA 想好！',
      readyCheck: '你的朋友已经选好并准备开始了吗？',
      startCollecting: '太好了！我会问几个问题来读取你朋友的想法……自然回答就行！🔮

你最喜欢的颜色是什么？',
      askHobby: '有意思！你最喜欢的爱好是什么？',
      askSeason: '不错！最后一个问题：你最喜欢哪个季节？',
      singleResult: '🎯 太棒了！我感受到非常强的能量……

✨ 你朋友想到的单词是：

🌟 **{word}** 🌟

我猜对了吗？✨',
      multipleOptions: '嗯……我收到了一些信号。这个单词以“{letters}”开头……

我捕捉到的可能性有：{options}

我走在正确的方向吗？',
      noMatch: '哎呀！我没能捕捉到这个单词。要不要再试一次？输入“reiniciar”重新开始。',
      finalReveal: '🎊 成功啦！

🔮 **{word}** 🔮

我读到了你朋友的想法！类别是 {category}，单词是 {word}！🧠✨

还想再玩一局吗？输入任何内容即可返回菜单。'
    },
    status: {
      processingAudio: '正在处理音频...',
      speaking: '播放中...'
    },
    input: {
      placeholder: '输入你的回答...',
      recording: '录音中...'
    },
    toast: {
      errorTitle: '错误',
      audioProcessingFailed: '无法处理音频，请重试。',
      recordingTitle: '录音中',
      recordingDescription: '现在开始说话...',
      micErrorDescription: '无法访问麦克风。'
    },
    categories: {
      animal: '动物',
      fruit: '水果',
      country: '国家'
    }
  },
  gameSelector: {
    heading: '读心者',
    subheading: '选择一次读心体验',
    play: '开始',
    comingSoon: '敬请期待',
    modalTitle: '玩法说明',
    cards: {
      mindReader: {
        title: '魔法象限',
        description: '通过细微的头部动作读取想法'
      },
      mentalConversation: {
        title: '心灵对话',
        description: '与尝试猜词的 AI 进行对话'
      },
      mysteryWord: {
        title: '神秘单词',
        description: '把你的单词悄悄展示给观众'
      }
    }
  },

};
