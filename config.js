(function () {
  'use strict';

  const CONFIG = {
    Screen: {
      width: 414,
      height: 828,
      ratio: 0.5,
      safeMargin: 20,
      mobileMaxWidth: 720,
      maxResponsiveWidth: 560,
      maxResponsiveHeight: 920
    },
    Storage: {
      dexKey: 'collegePersonaDex_v1',
      saveKey: 'collegePersonaSave_v1',
      mutedKey: 'collegePersonaMuted_v1',
      storyBookKey: 'collegePersonaStoryBook_v1'
    },
    Loader: {
      audioTimeoutMs: 1800,
      progressComplete: 100
    },
    Game: {
      totalWeeks: 16,
      totalActions: 40,
      minAttribute: 0,
      maxAttribute: 100,
      visibleCardCount: 3,
      firstChoiceCardIds: ['class', 'club', 'library'],
      tutorialMinMs: 1000,
      actionFeedbackMinMs: 1000,
      roastHoldMs: 1000,
      roastSkipMs: 800,
      recentRoastWindow: 5,
      maxVisibleHabits: 5,
      maxRepresentativeRoasts: 3,
      maxFloatingTexts: 7,
      studyGuaranteeMisses: 2,
      relaxGuaranteeMisses: 2,
      baseCardWeight: 10,
      stageCardBoost: 4,
      routeCardBoost: 2,
      comboCount: 2,
      habitStreakCount: 3,
      balancedCategoryCount: 3,
      pressureOverloadCount: 3,
      dexTotal: 15,
      fallbackRouteScore: 45,
      routeScoreCap: 100,
      newCollectionBonus: 10,
      positiveHabitScore: 6,
      negativeHabitScore: -3,
      habitScoreCap: 10,
      majorNegativeThreshold: -8,
      healthWarningThreshold: 25,
      lowAttributeThreshold: 30,
      socialLowThreshold: 35,
      identityLostThreshold: 25,
      stages: [
        { id: 1, name: '适应校园', range: '第1-4周', startWeek: 1, endWeek: 4, actionsPerWeek: 2, eventRate: 0.5 },
        { id: 2, name: '分支展开', range: '第5-8周', startWeek: 5, endWeek: 8, actionsPerWeek: 2, eventRate: 0.7 },
        { id: 3, name: '压力加速', range: '第9-12周', startWeek: 9, endWeek: 12, actionsPerWeek: 3, eventRate: 0.8 },
        { id: 4, name: '期末冲刺', range: '第13-16周', startWeek: 13, endWeek: 16, actionsPerWeek: 3, eventRate: 0.9 }
      ],
      tutorialPages: [
        '每周从 3 张行为卡里选 1 张，属性会立刻变化。',
        '连续选择类似行为，会形成习惯标签，有好处也有副作用。',
        '16 周后，系统会根据你的属性和习惯生成人格结局。'
      ],
      introSubtitle: '16 周后，你会进化成哪种大学人格？',
      firstRouteHint: '你身上开始冒出一点路线预兆了。',
      defaultRoast: '你的大学生活正在生成新的注释。',
      weekendNoEventTitle: '周末小结',
      weekendNoEventText: '这一周没有大事发生，但你的校园人设悄悄拐了个弯。'
    },
    Story: {
      baseRate: 0.35,
      eggRate: 0.08,
      conditionBoostRate: 0.2,
      washTopAlpha: 0.2,
      dialogueBgAlpha: 0.95,
      pityMisses: 4,
      pityRate: 0.6,
      weeklyExtendedLimit: 1,
      unlockedCharacterBoost: 0.1,
      maxTriggerRate: 0.95,
      conditionNameBoost: 8,
      storyLineMinHeight: 104,
      storyBookGridHeight: 548,
      narrationAutoMs: 1000,
      narrationSkipMs: 800,
      sceneFadeMs: 220,
      dialogueContinueMs: 1200,
      dialoguePromptMs: 3000,
      dialogueSmallTextLimit: 30,
      dialogueTinyTextLimit: 46,
      totalCharacters: 4,
      totalStories: 8,
      totalEggs: 4,
      tabs: [
        { id: 'characters', label: '人物' },
        { id: 'stories', label: '剧情' },
        { id: 'eggs', label: '彩蛋' }
      ],
      defaultNarration: { scene: 'background', sceneLabel: '校园角落', text: '校园广播轻轻响了一下，你的选择被手账记住了。' },
      quickNarrationTitle: '校园旁白',
      continueText: '继续',
      skipText: '跳过',
      newStoryStamp: '新剧情',
      knownStoryStamp: '已收录',
      newEggStamp: '新发现',
      knownEggStamp: '已收录',
      characterStamp: '人物解锁',
      progressTitle: '校园纪事'
    },
    UI: {
      cardWidth: 116,
      cardHeight: 226,
      cardGap: 9,
      cardTop: 386,
      cardLeft: 22,
      cardIconSize: 72,
      attrFloatStartX: 110,
      attrFloatSecondX: 292,
      attrFloatStartY: 116,
      attrFloatRowGap: 29,
      cardParticleYOffset: 112,
      eventParticleX: 207,
      eventParticleY: 430,
      habitParticleX: 207,
      habitParticleY: 348,
      endingParticleX: 207,
      endingParticleY: 212,
      buttonHeight: 46,
      pauseSize: 44,
      animationMs: 160,
      stickerMs: 220,
      floatMs: 900,
      floatPrimarySize: 22,
      floatSecondarySize: 16,
      floatPrimaryRise: 42,
      floatSecondaryRise: 28,
      shakeMinorFrames: 3,
      shakeMinorPower: 3,
      shakeMajorFrames: 4,
      shakeMajorPower: 5,
      shakeHealthFrames: 5,
      shakeHealthPower: 6,
      redFlashMs: 220,
      particles: {
        card: { count: 12, colors: ['#FFD166', '#7BDFF2'], radius: 40, ms: 500 },
        bigGain: { count: 18, colors: ['#FFFFFF'], radius: 56, ms: 700 },
        habit: { count: 28, colors: ['#FFB703', '#90BE6D', '#FFFFFF'], radius: 72, ms: 900 },
        event: { count: 16, colors: ['#F4A261', '#2A9D8F'], radius: 60, ms: 700 },
        ending: { count: 60, colors: ['#FFD166', '#7BDFF2', '#90BE6D', '#F4A261', '#E76F51', '#FFFFFF'], radius: 160, ms: 1400 }
      }
    },
    Colors: {
      paper: '#FFF7E8',
      ink: '#3D3325',
      teal: '#7BDFF2',
      yellow: '#FFD166',
      green: '#90BE6D',
      orange: '#F4A261',
      red: '#E76F51',
      blue: '#6C9BD2',
      purple: '#B49FCC',
      positive: '#2A9D8F',
      negative: '#E76F51',
      habit: '#FFB703'
    },
    Attributes: {
      academic: { label: '学业', short: '学', initial: 50, color: '#6C9BD2' },
      social: { label: '社交', short: '社', initial: 45, color: '#F4A261' },
      mood: { label: '情绪', short: '心', initial: 55, color: '#FFD166' },
      health: { label: '健康', short: '体', initial: 60, color: '#90BE6D' },
      skill: { label: '技能', short: '技', initial: 40, color: '#7BDFF2' },
      money: { label: '金钱', short: '钱', initial: 35, color: '#B49FCC' },
      identity: { label: '自我认同', short: '我', initial: 50, color: '#FFB703' }
    },
    Assets: {
      images: {
        background: { path: 'assets/images/campus_handbook_bg.png', role: '背景' },
        report: { path: 'assets/images/semester_report_panel.png', role: '结算背景' },
        card_class: { path: 'assets/images/behavior_icons_a_transparent_transparent_cut_1.png', role: '去上课图标' },
        card_sleep: { path: 'assets/images/behavior_icons_a_transparent_transparent_cut_2.png', role: '逃课睡觉图标' },
        card_club: { path: 'assets/images/behavior_icons_a_transparent_transparent_cut_3.png', role: '参加社团图标' },
        card_work: { path: 'assets/images/behavior_icons_a_transparent_transparent_cut_4.png', role: '打工兼职图标' },
        card_review: { path: 'assets/images/behavior_icons_a_transparent_transparent_cut_5.png', role: '复习考试图标' },
        card_game: { path: 'assets/images/behavior_icons_a_transparent_transparent_cut_6.png', role: '打游戏图标' },
        card_competition: { path: 'assets/images/behavior_icons_a_transparent_transparent_cut_7.png', role: '参加比赛图标' },
        card_love: { path: 'assets/images/behavior_icons_a_transparent_transparent_cut_8.png', role: '谈恋爱图标' },
        card_project: { path: 'assets/images/behavior_icons_a_transparent_transparent_cut_9.png', role: '做项目图标' },
        card_video: { path: 'assets/images/behavior_icons_b_transparent_transparent_cut_1.png', role: '刷短视频图标' },
        card_library: { path: 'assets/images/behavior_icons_b_transparent_transparent_cut_2.png', role: '去图书馆图标' },
        card_dinner: { path: 'assets/images/behavior_icons_b_transparent_transparent_cut_3.png', role: '宿舍聚餐图标' },
        card_sport: { path: 'assets/images/behavior_icons_b_transparent_transparent_cut_4.png', role: '运动休息图标' },
        card_intern: { path: 'assets/images/behavior_icons_b_transparent_transparent_cut_5.png', role: '实习图标' },
        card_startup: { path: 'assets/images/behavior_icons_b_transparent_transparent_cut_6.png', role: '创业图标' },
        card_graduate: { path: 'assets/images/behavior_icons_b_transparent_transparent_cut_7.png', role: '考研图标' },
        card_chat: { path: 'assets/images/behavior_icons_b_transparent_transparent_cut_8.png', role: '人际聊天图标' },
        card_reject: { path: 'assets/images/behavior_icons_b_transparent_transparent_cut_9.png', role: '拒绝活动图标' },
        avatar_study_king: { path: 'assets/images/personality_avatars_a_transparent_transparent_cut_1.png', role: '卷王头像' },
        avatar_fish_master: { path: 'assets/images/personality_avatars_a_transparent_transparent_cut_2.png', role: '摸鱼大师头像' },
        avatar_club_star: { path: 'assets/images/personality_avatars_a_transparent_transparent_cut_3.png', role: '社团达人头像' },
        avatar_grad_warrior: { path: 'assets/images/personality_avatars_a_transparent_transparent_cut_4.png', role: '考研战士头像' },
        avatar_love_brain: { path: 'assets/images/personality_avatars_a_transparent_transparent_cut_5.png', role: '恋爱脑头像' },
        avatar_intern_monster: { path: 'assets/images/personality_avatars_a_transparent_transparent_cut_6.png', role: '实习狂魔头像' },
        avatar_esports_player: { path: 'assets/images/personality_avatars_a_transparent_transparent_cut_7.png', role: '电竞选手头像' },
        avatar_startup_young: { path: 'assets/images/personality_avatars_a_transparent_transparent_cut_8.png', role: '创业青年头像' },
        avatar_library_ghost: { path: 'assets/images/personality_avatars_a_transparent_transparent_cut_9.png', role: '图书馆幽灵头像' },
        avatar_gpa_machine: { path: 'assets/images/personality_avatars_b_transparent_transparent_cut_1.png', role: '绩点机器头像' },
        avatar_dorm_slacker: { path: 'assets/images/personality_avatars_b_transparent_transparent_cut_2.png', role: '宿舍摆烂仙人头像' },
        avatar_network_radar: { path: 'assets/images/personality_avatars_b_transparent_transparent_cut_3.png', role: '人脉雷达头像' },
        avatar_project_burner: { path: 'assets/images/personality_avatars_b_transparent_transparent_cut_4.png', role: '项目爆肝人头像' },
        avatar_slash_allround: { path: 'assets/images/personality_avatars_b_transparent_transparent_cut_5.png', role: '全能斜杠青年头像' },
        avatar_balanced_life: { path: 'assets/images/personality_avatars_b_transparent_transparent_cut_6.png', role: '平衡生活家头像' },
        lock_1: { path: 'assets/images/personality_avatars_b_transparent_transparent_cut_7.png', role: '锁定占位' },
        lock_2: { path: 'assets/images/personality_avatars_b_transparent_transparent_cut_8.png', role: '锁定占位' },
        lock_3: { path: 'assets/images/personality_avatars_b_transparent_transparent_cut_9.png', role: '锁定占位' },
        story_scene_classroom: { path: 'assets/images/story_scene_classroom.png', role: '剧情教室场景' },
        story_scene_dorm: { path: 'assets/images/story_scene_dorm.png', role: '剧情宿舍场景' },
        story_scene_club: { path: 'assets/images/story_scene_club.png', role: '剧情社团场景' },
        story_char_roommate: { path: 'assets/images/story_characters_transparent_cut_1.png', role: '舍友立绘' },
        story_char_classmate: { path: 'assets/images/story_characters_transparent_cut_2.png', role: '同学A立绘' },
        story_char_teacher: { path: 'assets/images/story_characters_transparent_cut_3.png', role: '老师A立绘' },
        story_char_senior: { path: 'assets/images/story_characters_transparent_cut_4.png', role: '社团前辈立绘' },
        story_egg_note: { path: 'assets/images/story_event_illustrations_transparent_cut_1.png', role: '神秘便签彩蛋' },
        story_egg_snack: { path: 'assets/images/story_event_illustrations_transparent_cut_2.png', role: '宿舍零食宝箱彩蛋' },
        story_egg_cat: { path: 'assets/images/story_event_illustrations_transparent_cut_3.png', role: '校园猫彩蛋' },
        story_egg_packet: { path: 'assets/images/story_event_illustrations_transparent_cut_4.png', role: '期末资料包彩蛋' }
      },
      audio: {
        cardSelect: { path: 'assets/audio/card_select.mp3', volume: 0.55, loop: false },
        habitUnlock: { path: 'assets/audio/habit_unlock.mp3', volume: 0.65, loop: false },
        eventPopup: { path: 'assets/audio/event_popup.mp3', volume: 0.5, loop: false },
        endingFanfare: { path: 'assets/audio/ending_fanfare.mp3', volume: 0.7, loop: false },
        campusLoop: { path: 'assets/audio/campus_loop.mp3', volume: 0.28, loop: true },
        storyReveal: { path: 'assets/audio/story_reveal.mp3', volume: 0.52, loop: false }
      }
    },
    StoryCharacters: [
      { id: 'roommate', name: '舍友', asset: 'story_char_roommate', profile: '总能在你最混乱的时候递来零食和一句吐槽。', hint: '触发宿舍夜谈、零食或逃课补救相关剧情。', weightTags: ['宿舍', '休息'] },
      { id: 'classmate', name: '同学A', asset: 'story_char_classmate', profile: '像校园里的万能接口，知道作业、座位和八卦。', hint: '触发课堂、图书馆、项目或恋爱乌龙剧情。', weightTags: ['学习', '项目'] },
      { id: 'teacher', name: '老师A', asset: 'story_char_teacher', profile: '语气温和，但每句话都像期末倒计时。', hint: '触发课堂提醒、成绩预警或兼职撞课剧情。', weightTags: ['学业', '补救'] },
      { id: 'senior', name: '社团前辈', asset: 'story_char_senior', profile: '擅长把报名表递得像命运邀请函。', hint: '触发社团摊位或人际聊天剧情。', weightTags: ['社交', '社团'] }
    ],
    StoryCollectibles: [
      { id: 'egg_library_note', title: '神秘便签', asset: 'story_egg_note', hint: '去图书馆且学业不错时可能发现。', description: '写着“别只收藏资料”的便签。' },
      { id: 'egg_snack_cache', title: '宿舍零食宝箱', asset: 'story_egg_snack', hint: '情绪偏低后在宿舍放松时可能发现。', description: '抽屉深处的快乐存档。' },
      { id: 'egg_campus_cat', title: '校园猫巡逻', asset: 'story_egg_cat', hint: '社交或运动后有机会偶遇。', description: '像在审核你大学路线的猫。' },
      { id: 'egg_final_packet', title: '期末资料包传说', asset: 'story_egg_packet', hint: '期末复习、考研或学业告急时可能出现。', description: '打印机吐出的求生欲。' }
    ],
    StoryNarrations: {
      class: [
        { scene: 'story_scene_classroom', sceneLabel: '教室前排', text: '粉笔灰轻轻飘了一下，你把今天的路线往学业推近半步。' }
      ],
      sleep: [
        { scene: 'story_scene_dorm', sceneLabel: '宿舍被窝', text: '窗帘挡住了早八，也暂时挡住了绩点的眼神。' }
      ],
      club: [
        { scene: 'story_scene_club', sceneLabel: '社团摊位', text: '报名表在风里哗啦作响，你的人际地图多亮了一块。' }
      ],
      game: [
        { scene: 'story_scene_dorm', sceneLabel: '宿舍桌前', text: '键盘声和舍友吐槽混在一起，快乐值开始弹出连击。' }
      ],
      library: [
        { scene: 'story_scene_classroom', sceneLabel: '图书馆角落', text: '你和座位短暂达成协议：今天先不互相辜负。' }
      ],
      video: [
        { scene: 'story_scene_dorm', sceneLabel: '宿舍床边', text: '短视频滑过一条又一条，时间像被校园网偷偷缓存。' }
      ],
      dinner: [
        { scene: 'story_scene_dorm', sceneLabel: '宿舍小桌', text: '一次加餐把疲惫压低，也把钱包捏得更薄。' }
      ],
      sport: [
        { scene: 'story_scene_club', sceneLabel: '操场边', text: '风从操场绕过来，你的身体终于收到续费提醒。' }
      ],
      work: [
        { scene: 'story_scene_classroom', sceneLabel: '兼职路上', text: '课程表和排班表同时亮起，你开始练习现实副本。' }
      ],
      love: [
        { scene: 'story_scene_classroom', sceneLabel: '走廊转角', text: '一条消息跳出来，课表忽然多了心动的支线。' }
      ],
      chat: [
        { scene: 'story_scene_club', sceneLabel: '食堂长桌', text: '一句寒暄接住另一句寒暄，熟人列表悄悄扩容。' }
      ],
      reject: [
        { scene: 'story_scene_dorm', sceneLabel: '安静角落', text: '你把邀请暂时合上，给自己的社交电量留了余温。' }
      ],
      review: [
        { scene: 'story_scene_classroom', sceneLabel: '自习室夜灯', text: '复习资料摊开以后，期末倒计时终于有了实感。' }
      ],
      competition: [
        { scene: 'story_scene_club', sceneLabel: '报名海报前', text: '比赛海报像一扇门，你伸手推开了技能副本。' }
      ],
      project: [
        { scene: 'story_scene_classroom', sceneLabel: '项目桌面', text: '方案文件越改越长，你的技能树也跟着发芽。' }
      ],
      intern: [
        { scene: 'story_scene_classroom', sceneLabel: '实习通勤', text: '工牌还没挂稳，简历已经先一步进入大学生活。' }
      ],
      startup: [
        { scene: 'story_scene_club', sceneLabel: '路演海报旁', text: '一个点子被你认真写下，风险和期待同时抬头。' }
      ],
      graduate: [
        { scene: 'story_scene_classroom', sceneLabel: '考研自习位', text: '咖啡味在桌边散开，你的未来规划开始显影。' }
      ]
    },
    StoryEntries: [
      {
        id: 'story_class_first', title: '第一堂课的座位暗号', kind: 'story', condition: 'firstClass', priority: 100, scene: 'story_scene_classroom', sceneLabel: '教室', character: 'classmate', characterSide: 'right',
        narration: '第一堂课的铃声像新地图加载音。',
        dialogues: [
          { speaker: '同学A', text: '这里空着，老师刚刚说签到不是大学全部。' },
          { speaker: '同学A', text: '不过先坐下吧，至少今天你没有输给早八。' }
        ]
      },
      {
        id: 'story_library_note', title: '图书馆便签漂流', kind: 'egg', condition: 'libraryNote', priority: 82, scene: 'story_scene_classroom', sceneLabel: '图书馆角落', eggId: 'egg_library_note', illustration: 'story_egg_note', reward: { identity: 1 },
        narration: '你发现一张写着“别只收藏资料”的便签。',
        dialogues: [
          { speaker: '旁白', text: '便签夹在书页里，像上届同学留下的路线提示。' },
          { speaker: '旁白', text: '你把它收进手账，突然没那么想只收藏资料了。' }
        ]
      },
      {
        id: 'story_dorm_talk', title: '宿舍夜谈三分钟', kind: 'story', condition: 'dormTalkStory', priority: 74, scene: 'story_scene_dorm', sceneLabel: '宿舍', character: 'roommate', characterSide: 'left',
        narration: '关灯以后，宿舍的话题自动切到人生频道。',
        dialogues: [
          { speaker: '舍友', text: '零食给你，焦虑先放桌上，明天再领回去。' },
          { speaker: '舍友', text: '不过你这血条，真的需要一次正经睡眠。' }
        ]
      },
      {
        id: 'story_club_booth', title: '社团摊位风暴', kind: 'story', condition: 'clubBooth', priority: 76, scene: 'story_scene_club', sceneLabel: '社团摊位', character: 'senior', characterSide: 'right',
        narration: '帐篷、海报和扩音器把路口变成热闹副本。',
        dialogues: [
          { speaker: '社团前辈', text: '报名表不重，但接下来的热闹会有点费体力。' },
          { speaker: '社团前辈', text: '想来就来，记得给自己留一点安静时间。' }
        ]
      },
      {
        id: 'story_deadline_light', title: 'DDL 台灯还亮着', kind: 'key', condition: 'deadlineLight', priority: 95, scene: 'story_scene_classroom', sceneLabel: '自习室夜灯', character: 'classmate', characterSide: 'left',
        narration: '台灯照着第七版方案，deadline 也在旁边陪读。',
        dialogues: [
          { speaker: '同学A', text: '你还在改？这个项目路线已经很明显了。' },
          { speaker: '同学A', text: '别忘了存档，也别忘了把自己从文件夹里捞出来。' }
        ]
      },
      {
        id: 'story_skip_rescue', title: '逃课后的补救消息', kind: 'story', condition: 'skipRescue', priority: 88, scene: 'story_scene_dorm', sceneLabel: '宿舍床边', character: 'teacher', characterSide: 'right', reward: { academic: 1 },
        narration: '一条课程提醒穿过被窝，语气温和但很有重量。',
        dialogues: [
          { speaker: '老师A', text: '今天没见到你，课件已经放群里了，记得补上。' },
          { speaker: '老师A', text: '大学不是不能绕路，但最好知道怎么回到路上。' }
        ]
      },
      {
        id: 'story_love_mixup', title: '约会与课表乌龙', kind: 'story', condition: 'loveMixup', priority: 70, scene: 'story_scene_classroom', sceneLabel: '教学楼走廊', character: 'classmate', characterSide: 'left',
        narration: '课表被你盯出了另一种颜色，像心动支线提示。',
        dialogues: [
          { speaker: '同学A', text: '你刚刚是不是把高数看成约会冲突提醒了？' },
          { speaker: '同学A', text: '甜是甜，期末也是真的会来。' }
        ]
      },
      {
        id: 'story_work_shift', title: '兼职排班撞课前夜', kind: 'story', condition: 'workShiftStory', priority: 80, scene: 'story_scene_classroom', sceneLabel: '教学楼门口', character: 'teacher', characterSide: 'right', reward: { identity: 1 },
        narration: '排班表和课程表在屏幕上撞了个正着。',
        dialogues: [
          { speaker: '老师A', text: '经验很重要，课程也不是背景板。' },
          { speaker: '老师A', text: '你可以选择，但别让每次选择都只剩硬撑。' }
        ]
      },
      {
        id: 'egg_snack_cache', title: '宿舍零食宝箱', kind: 'egg', condition: 'snackCache', priority: 78, scene: 'story_scene_dorm', sceneLabel: '宿舍抽屉', eggId: 'egg_snack_cache', illustration: 'story_egg_snack', reward: { mood: 1 },
        narration: '你在抽屉深处发现了上周的快乐存档。',
        dialogues: [
          { speaker: '旁白', text: '一包零食安静躺着，像情绪低谷里的隐藏补给。' },
          { speaker: '旁白', text: '你收下它，决定暂时原谅今天。' }
        ]
      },
      {
        id: 'egg_campus_cat', title: '校园猫巡逻', kind: 'egg', condition: 'campusCat', priority: 68, scene: 'story_scene_club', sceneLabel: '操场边', eggId: 'egg_campus_cat', illustration: 'story_egg_cat', reward: { identity: 1 },
        narration: '校园猫路过，像是在审核你的大学路线。',
        dialogues: [
          { speaker: '旁白', text: '它看了你一眼，又看了看远处的社团摊位。' },
          { speaker: '旁白', text: '你忽然觉得自己的路线也可以慢慢选。' }
        ]
      },
      {
        id: 'egg_final_packet', title: '期末资料包传说', kind: 'egg', condition: 'finalPacketEgg', priority: 90, scene: 'story_scene_classroom', sceneLabel: '打印店门口', eggId: 'egg_final_packet', illustration: 'story_egg_packet', reward: { academic: 1 },
        narration: '打印机吐出的不只是资料，还有求生欲。',
        dialogues: [
          { speaker: '旁白', text: '资料包厚得像小砖头，封面写满了最后的倔强。' },
          { speaker: '旁白', text: '你把它抱紧，学业值似乎轻轻动了一下。' }
        ]
      },
      {
        id: 'story_midterm_echo', title: '期中后的走廊回声', kind: 'key', condition: 'midtermEcho', priority: 100, scene: 'story_scene_classroom', sceneLabel: '教学楼走廊', character: 'classmate', characterSide: 'right',
        narration: '期中后的走廊很安静，你的路线预兆被脚步声放大。',
        dialogues: [
          { speaker: '旁白', text: '目前最响的是{route}路线，{weak}也在提醒你别硬撑。' },
          { speaker: '同学A', text: '下半学期还来得及，别把自己交给随机抽卡。' }
        ]
      }
    ],
    Cards: [
      { id: 'class', name: '去上课', unlockWeek: 1, tags: ['学习', '课程'], bigCategory: '学习', primary: 'academic', icon: 'card_class', description: '稳住绩点的经典选择。', effects: { academic: 8, social: 0, mood: -2, health: -1, skill: 2, money: 0, identity: 1 } },
      { id: 'sleep', name: '逃课睡觉', unlockWeek: 1, tags: ['摸鱼', '休息'], bigCategory: '休息', primary: 'health', icon: 'card_sleep', description: '快速回血，但课表会记仇。', effects: { academic: -6, social: -1, mood: 4, health: 8, skill: 0, money: 0, identity: -2 } },
      { id: 'club', name: '参加社团', unlockWeek: 1, tags: ['社交', '社团'], bigCategory: '社交', primary: 'social', icon: 'card_club', description: '把校园地图点亮一大片。', effects: { academic: 0, social: 8, mood: 2, health: -2, skill: 1, money: -2, identity: 4 } },
      { id: 'game', name: '打游戏', unlockWeek: 1, tags: ['摸鱼', '电竞'], bigCategory: '放松', primary: 'mood', icon: 'card_game', description: '快乐涨得快，黑眼圈也快。', effects: { academic: -4, social: 1, mood: 7, health: -3, skill: 2, money: 0, identity: 0 } },
      { id: 'library', name: '去图书馆', unlockWeek: 1, tags: ['学习', '图书馆'], bigCategory: '学习', primary: 'academic', icon: 'card_library', description: '和座位建立稳定绑定。', effects: { academic: 7, social: -2, mood: -1, health: -1, skill: 1, money: 0, identity: 3 } },
      { id: 'video', name: '刷短视频', unlockWeek: 1, tags: ['摸鱼'], bigCategory: '放松', primary: 'mood', icon: 'card_video', description: '三分钟变三小时的魔法。', effects: { academic: -5, social: 0, mood: 5, health: -2, skill: -1, money: 0, identity: -3 } },
      { id: 'dinner', name: '宿舍聚餐', unlockWeek: 1, tags: ['社交', '休息'], bigCategory: '社交', primary: 'social', icon: 'card_dinner', description: '低压社交，高概率加餐。', effects: { academic: -2, social: 6, mood: 6, health: -3, skill: 0, money: -4, identity: 1 } },
      { id: 'sport', name: '运动休息', unlockWeek: 1, tags: ['健康', '休息'], bigCategory: '休息', primary: 'health', icon: 'card_sport', description: '给身体发一张续费券。', effects: { academic: -1, social: 0, mood: 4, health: 9, skill: 0, money: 0, identity: 1 } },
      { id: 'work', name: '打工兼职', unlockWeek: 5, tags: ['金钱', '职业'], bigCategory: '职业', primary: 'money', icon: 'card_work', description: '生活费回血，体力条掉线。', effects: { academic: -2, social: 0, mood: -1, health: -5, skill: 3, money: 10, identity: 2 } },
      { id: 'love', name: '谈恋爱', unlockWeek: 5, tags: ['恋爱', '社交'], bigCategory: '社交', primary: 'mood', icon: 'card_love', description: '心动加满，钱包扣血。', effects: { academic: -2, social: 5, mood: 8, health: -1, skill: 0, money: -5, identity: 3 } },
      { id: 'chat', name: '人际聊天', unlockWeek: 5, tags: ['社交'], bigCategory: '社交', primary: 'social', icon: 'card_chat', description: '稳定增加熟人密度。', effects: { academic: -1, social: 7, mood: 3, health: 0, skill: 0, money: 0, identity: 1 } },
      { id: 'reject', name: '拒绝活动', unlockWeek: 5, tags: ['独处', '防御'], bigCategory: '独处', primary: 'identity', icon: 'card_reject', description: '把社交电量存起来。', effects: { academic: 1, social: -5, mood: 2, health: 3, skill: 0, money: 0, identity: 2 } },
      { id: 'review', name: '复习考试', unlockWeek: 9, tags: ['学习', '压力', '复习'], bigCategory: '学习', primary: 'academic', icon: 'card_review', description: '高收益，也高咖啡因。', effects: { academic: 10, social: 0, mood: -4, health: -4, skill: 1, money: 0, identity: 2 } },
      { id: 'competition', name: '参加比赛', unlockWeek: 9, tags: ['竞赛', '压力', '技能'], bigCategory: '技能', primary: 'skill', icon: 'card_competition', description: '奖项和黑眼圈一起冲刺。', effects: { academic: 2, social: 1, mood: -3, health: -5, skill: 9, money: 2, identity: 6 } },
      { id: 'project', name: '做项目', unlockWeek: 9, tags: ['项目', '压力', '技能'], bigCategory: '技能', primary: 'skill', icon: 'card_project', description: '打开更多标签页的人生。', effects: { academic: 1, social: 0, mood: -2, health: -5, skill: 10, money: 1, identity: 5 } },
      { id: 'intern', name: '实习', unlockWeek: 9, tags: ['职业', '压力', '技能'], bigCategory: '职业', primary: 'skill', icon: 'card_intern', description: '简历比课表先成熟。', effects: { academic: -3, social: 1, mood: -2, health: -4, skill: 8, money: 6, identity: 4 } },
      { id: 'startup', name: '创业', unlockWeek: 9, tags: ['创业', '风险', '技能'], bigCategory: '技能', primary: 'identity', icon: 'card_startup', description: '高认同，高风险，高话题。', effects: { academic: -2, social: 2, mood: -3, health: -4, skill: 7, money: -6, identity: 8 } },
      { id: 'graduate', name: '考研', unlockWeek: 9, tags: ['学习', '考研', '压力'], bigCategory: '学习', primary: 'academic', icon: 'card_graduate', description: '未来规划开始散发咖啡味。', effects: { academic: 9, social: -3, mood: -3, health: -5, skill: 1, money: 0, identity: 4 } }
    ],
    CardGroups: {
      study: { label: '学习类行为', tags: ['学习', '图书馆', '复习', '考研'] },
      relax: { label: '放松/休息行为', tags: ['摸鱼', '休息', '健康'] },
      fishRest: { label: '摸鱼/休息行为', tags: ['摸鱼', '休息'] },
      social: { label: '社交类行为', tags: ['社交', '社团', '恋爱'] },
      pressure: { label: '压力行为', tags: ['压力', '风险'] },
      skill: { label: '技能类行为', tags: ['技能', '项目', '竞赛', '职业', '创业'] },
      clubChatDinner: { label: '社团/聊天/聚餐', ids: ['club', 'chat', 'dinner'] },
      graduateReview: { label: '考研/复习', ids: ['graduate', 'review'] },
      workIntern: { label: '打工/实习', ids: ['work', 'intern'] },
      startupProjectCompetition: { label: '创业/项目/比赛', ids: ['startup', 'project', 'competition'] },
      sleepVideoDinner: { label: '睡觉/短视频/聚餐', ids: ['sleep', 'video', 'dinner'] },
      projectCompetitionStartup: { label: '项目/比赛/创业', ids: ['project', 'competition', 'startup'] }
    },
    Habits: [
      { id: 'selfDiscipline', name: '自律惯性', trigger: 'studyStreak', quality: 1, positive: '学习类行为学业额外 +2', negative: '社交偏低时每周情绪 -1', roast: '不是在学习，是在给未来的自己转账。' },
      { id: 'procrastination', name: '拖延惯性', trigger: 'fishStreak', quality: -1, positive: '摸鱼类行为情绪额外 +2', negative: '下一次学习类行为学业收益 -3', roast: '你已经连续三天说“明天一定开始”了。' },
      { id: 'networkRadar', name: '人脉雷达', trigger: 'socialCount', quality: 1, positive: '社交收益 +1，社交事件更顺', negative: '每周健康 -1', roast: '你成功把社团当成第二专业。' },
      { id: 'nightEnergy', name: '夜间兴奋', trigger: 'nightCountHealthDrop', quality: -1, positive: '技能类和学习类主收益 +2', negative: '下周第 1 次行动健康额外 -4', roast: '白天离线，晚上满电。' },
      { id: 'socialShield', name: '社恐护盾', trigger: 'rejectOrLowSocial', quality: -1, positive: '负面社交事件损失减半', negative: '社交类行为收益 -2', roast: '你的社交能量正在以肉眼可见的速度蒸发。' },
      { id: 'loveFilter', name: '恋爱滤镜', trigger: 'loveCount', quality: 1, positive: '情绪收益 +3，恋爱事件更常出现', negative: '每周金钱 -2，学习类收益 -1', roast: '你看课表像在看约会冲突表。' },
      { id: 'workerAwake', name: '打工人觉醒', trigger: 'workInternCount', quality: 1, positive: '打工/实习金钱 +3、技能 +1', negative: '每周情绪 -2', roast: '你不是大学生，你是校园外包接口。' },
      { id: 'projectBurn', name: '项目燃烧', trigger: 'projectCount', quality: 1, positive: '技能类行为技能额外 +3', negative: '压力行为健康额外 -2', roast: '你的大学生活像一个打开了 38 个标签页的浏览器。' },
      { id: 'esportsSense', name: '电竞手感', trigger: 'gameCount', quality: 1, positive: '游戏行为技能 +3、情绪 +2', negative: '学习类行为学业额外 -2', roast: '这不是逃避现实，这是练习反应速度。' },
      { id: 'dormAura', name: '宿舍摆烂气场', trigger: 'dormCount', quality: -1, positive: '休息类行为情绪 +2、健康 +1', negative: '学业和技能结算分各 -8', roast: '你在宿舍完成了精神层面的飞升。' }
    ],
    WeeklyEffects: {
      balanced: { mood: 3, identity: 2 },
      pressureOverload: { health: -8, mood: -5 },
      selfDisciplineLowSocial: { mood: -1 },
      networkRadar: { health: -1 },
      loveFilter: { money: -2 },
      workerAwake: { mood: -2 }
    },
    Shortfalls: [
      { attr: 'academic', below: 30, text: '学业预警：补作业事件正在排队。' },
      { attr: 'social', below: 25, text: '社交预警：群聊已读不回的概率上升。' },
      { attr: 'mood', below: 25, text: '情绪预警：精神内耗正在加载。' },
      { attr: 'health', below: 25, text: '健康预警：身体准备强制关机。' },
      { attr: 'skill', below: 25, text: '技能预警：项目副本会更吃力。' },
      { attr: 'money', below: 15, text: '金钱预警：钱包薄得像打印错页的讲义。' },
      { attr: 'identity', below: 25, text: '自我认同预警：路线图开始被雨淋糊。' }
    ],
    Events: [
      {
        id: 'attendance', title: '学委突击签到', condition: 'academicRisk', minWeek: 1, maxWeek: 16, priority: 90,
        description: '学委突然追问课堂笔记，你的逃课雷达疯狂响。',
        options: [
          { label: '补交笔记', hint: '学业 +6 / 情绪 -2', effects: { academic: 6, mood: -2 } },
          { label: '装作没看见', hint: '情绪 +3 / 学业 -6', effects: { mood: 3, academic: -6 } },
          { label: '找同学借笔记', hint: '社交 +3 / 学业 +3 / 金钱 -2', effects: { social: 3, academic: 3, money: -2 } }
        ]
      },
      {
        id: 'clubInterview', title: '社团二面通知', condition: 'clubInterview', minWeek: 5, maxWeek: 8, priority: 70,
        description: '社团二面消息弹出，群里已经开始刷“收到”。',
        options: [
          { label: '认真准备', hint: '社交 +6 / 自我认同 +4 / 健康 -3', effects: { social: 6, identity: 4, health: -3 } },
          { label: '随缘参加', hint: '社交 +2 / 情绪 +2', effects: { social: 2, mood: 2 } },
          { label: '婉拒', hint: '健康 +3 / 社交 -4', effects: { health: 3, social: -4 } }
        ]
      },
      {
        id: 'workCrash', title: '兼职排班撞课', condition: 'workConflict', minWeek: 5, maxWeek: 16, priority: 80,
        description: '兼职排班和课程撞在一起，现实副本突然加难度。',
        options: [
          { label: '去上课', hint: '学业 +5 / 金钱 -5', effects: { academic: 5, money: -5 } },
          { label: '去兼职', hint: '金钱 +8 / 学业 -5 / 健康 -2', effects: { money: 8, academic: -5, health: -2 } },
          { label: '协商换班', hint: '社交 +3 / 技能 +2 / 情绪 -2', effects: { social: 3, skill: 2, mood: -2 } }
        ]
      },
      {
        id: 'midtermWarning', title: '期中成绩预警', condition: 'midterm', minWeek: 8, maxWeek: 8, forceWeek: 8, priority: 100,
        description: '期中成绩像一张截图，提醒你这学期不是无限存档。',
        options: [
          { label: '临时抱佛脚', hint: '学业 +10 / 健康 -5 / 情绪 -4', effects: { academic: 10, health: -5, mood: -4 } },
          { label: '接受现实', hint: '情绪 +5 / 自我认同 +2 / 学业 -4', effects: { mood: 5, identity: 2, academic: -4 } },
          { label: '找学习搭子', hint: '学业 +6 / 社交 +4 / 情绪 -2', effects: { academic: 6, social: 4, mood: -2 } }
        ]
      },
      {
        id: 'dormTalk', title: '宿舍夜谈', condition: 'dormTalk', minWeek: 1, maxWeek: 16, priority: 45,
        description: '灯关了，话题却自动从外卖升级到人生。',
        options: [
          { label: '深聊人生', hint: '社交 +4 / 自我认同 +5 / 健康 -2', effects: { social: 4, identity: 5, health: -2 } },
          { label: '早睡保命', hint: '健康 +5 / 社交 -1', effects: { health: 5, social: -1 } },
          { label: '开黑到天亮', hint: '情绪 +6 / 技能 +3 / 健康 -6', effects: { mood: 6, skill: 3, health: -6 } }
        ]
      },
      {
        id: 'competitionDeadline', title: '比赛报名截止', condition: 'competitionReady', minWeek: 9, maxWeek: 12, priority: 75,
        description: '报名截止倒计时出现，你的技能树正在发光。',
        options: [
          { label: '报名冲刺', hint: '技能 +9 / 自我认同 +6 / 健康 -5', effects: { skill: 9, identity: 6, health: -5 } },
          { label: '观望收藏', hint: '情绪 +2 / 技能 +1', effects: { mood: 2, skill: 1 } },
          { label: '拉队友一起', hint: '社交 +4 / 技能 +5 / 金钱 -2', effects: { social: 4, skill: 5, money: -2 } }
        ]
      },
      {
        id: 'loveProjectCrash', title: '恋爱纪念日撞项目', condition: 'loveProject', minWeek: 9, maxWeek: 16, priority: 95,
        description: '纪念日和 deadline 同一天，你的日程表发出尖叫。',
        options: [
          { label: '陪伴优先', hint: '情绪 +8 / 社交 +4 / 技能 -4', effects: { mood: 8, social: 4, skill: -4 } },
          { label: '项目优先', hint: '技能 +8 / 自我认同 +3 / 情绪 -5', effects: { skill: 8, identity: 3, mood: -5 } },
          { label: '诚实沟通', hint: '社交 +5 / 技能 +3 / 情绪 +1', effects: { social: 5, skill: 3, mood: 1 } }
        ]
      },
      {
        id: 'finalMaterials', title: '期末资料包', condition: 'finalMaterials', minWeek: 13, maxWeek: 16, priority: 65,
        description: '群里突然流出资料包，大家都假装自己早就开始复习。',
        options: [
          { label: '通宵整理', hint: '学业 +9 / 健康 -7 / 情绪 -4', effects: { academic: 9, health: -7, mood: -4 } },
          { label: '群里求助', hint: '社交 +4 / 学业 +5', effects: { social: 4, academic: 5 } },
          { label: '佛系随缘', hint: '情绪 +5 / 学业 -5', effects: { mood: 5, academic: -5 } }
        ]
      },
      {
        id: 'overnightBackfire', title: '熬夜反噬', condition: 'healthRisk', minWeek: 1, maxWeek: 16, priority: 85,
        description: '身体发来通知：再熬夜就要强制关机。',
        options: [
          { label: '补觉一天', hint: '健康 +10 / 学业 -4 / 技能 -2', effects: { health: 10, academic: -4, skill: -2 } },
          { label: '咖啡硬撑', hint: '学业 +5 / 技能 +4 / 健康 -6', effects: { academic: 5, skill: 4, health: -6 } },
          { label: '运动回血', hint: '健康 +7 / 情绪 +3 / 金钱 -2', effects: { health: 7, mood: 3, money: -2 } }
        ]
      },
      {
        id: 'startupPitch', title: '创业路演邀请', condition: 'startupPitch', minWeek: 9, maxWeek: 16, priority: 78,
        description: '路演邀请砸来，你的商业计划书突然有了观众。',
        options: [
          { label: '上台路演', hint: '自我认同 +9 / 技能 +5 / 金钱 -4', effects: { identity: 9, skill: 5, money: -4 } },
          { label: '先打磨产品', hint: '技能 +8 / 健康 -4', effects: { skill: 8, health: -4 } },
          { label: '放弃本轮', hint: '情绪 +4 / 自我认同 -3', effects: { mood: 4, identity: -3 } }
        ]
      }
    ],
    Roasts: [
      { id: 'study_collect', type: 'study', text: '你不是在学习，你是在收藏学习资料。' },
      { id: 'procrastination', type: 'fish', text: '你已经连续三天说“明天一定开始”了。' },
      { id: 'social_drain', type: 'socialLow', text: '你的社交能量正在以肉眼可见的速度蒸发。' },
      { id: 'club_overload', type: 'social', text: '你成功把社团当成第二专业。' },
      { id: 'project_overload', type: 'project', text: '你的大学生活像一个打开了 38 个标签页的浏览器。' },
      { id: 'library', type: 'library', text: '你和图书馆座位之间出现了稳定绑定关系。' },
      { id: 'fish', type: 'fish', text: '你把“放松一下”进化成了时间黑洞。' },
      { id: 'esports', type: 'game', text: '你说这是训练反应力，系统表示先记着。' },
      { id: 'love', type: 'love', text: '你的课表正在自动转换为约会冲突表。' },
      { id: 'work', type: 'work', text: '你不是来上大学的，你是来跑社会副本的。' },
      { id: 'graduate', type: 'graduate', text: '你的未来规划开始散发咖啡味。' },
      { id: 'healthLow', type: 'healthLow', text: '身体发来通知：再熬夜就要强制关机。' },
      { id: 'moneyLow', type: 'moneyLow', text: '钱包薄得像打印错页的讲义。' },
      { id: 'balanced', type: 'balanced', text: '你看起来像真的掌握了大学生活说明书。' },
      { id: 'dorm', type: 'dorm', text: '你在宿舍完成了精神层面的飞升。' },
      { id: 'lost', type: 'lost', text: '你的路线图像被雨淋过的校园地图。' },
      { id: 'class', type: 'class', text: '你终于出现在课堂，老师差点以为点名系统坏了。' },
      { id: 'sport', type: 'sport', text: '操场风一吹，你的生命值开始回蓝。' },
      { id: 'identity', type: 'identity', text: '你开始知道自己想要的不是同款人生。' },
      { id: 'moneyGain', type: 'moneyGain', text: '生活费余额短暂拥有了尊严。' }
    ],
    Midterm: {
      title: '期中反馈',
      strongestPrefix: '目前你最像：',
      weakPrefix: '短板提醒：',
      adviceTitle: '辅导员给你两条建议',
      advice: {
        academic: ['补两次基础课，别让绩点先写结局。', '找个学习搭子，把焦虑拆成清单。'],
        social: ['挑一个低压社交局，先从熟人开始。', '拒绝可以，但别把自己永久静音。'],
        mood: ['快乐不是奢侈品，给自己一次正经休息。', '少一点深夜内耗，多一点白天行动。'],
        health: ['睡眠不是支线任务，是主线血条。', '运动休息可以救很多隐藏崩盘。'],
        skill: ['试一个小项目，技能值会开始长草。', '比赛不一定拿奖，但能刷新路线。'],
        money: ['控制聚餐和约会开销，钱包也要期中复盘。', '兼职可以回血，但别用健康硬换。'],
        identity: ['别急着给自己定型，先选一件真的想做的事。', '路线摇摆很正常，关键是别完全交给随机。']
      }
    },
    Stars: [
      { min: 90, stars: 5, text: '这学期，你像开了校园说明书。' },
      { min: 75, stars: 4, text: '方向很明确，副作用也很真实。' },
      { min: 60, stars: 3, text: '普通但完整，像大多数人的大学生活。' },
      { min: 45, stars: 2, text: '有点混乱，但至少很有故事。' },
      { min: 0, stars: 1, text: '这学期主打一个重新加载。' }
    ],
    Endings: [
      { id: 'study_king', name: '卷王', rarity: '普通', rarityRank: 1, avatar: 'avatar_study_king', description: '你用计划表把学期压缩成了可执行脚本。', hint: '学业高、学习类行为多，并形成自律惯性。', priority: 20, scoring: { attrs: [{ key: 'academic', min: 75, points: 25 }], groups: [{ key: 'study', per: 4, max: 32 }], habits: [{ id: 'selfDiscipline', points: 20 }] } },
      { id: 'fish_master', name: '摸鱼大师', rarity: '普通', rarityRank: 1, avatar: 'avatar_fish_master', description: '你精准掌握了“看似很忙其实很松”的艺术。', hint: '摸鱼/休息很多，情绪高，学业不要太高。', priority: 18, scoring: { attrs: [{ key: 'mood', min: 70, points: 22 }, { key: 'academic', max: 65, points: 15 }], groups: [{ key: 'fishRest', per: 4, max: 32 }], habits: [{ id: 'procrastination', points: 20 }, { id: 'dormAura', points: 8 }] } },
      { id: 'club_star', name: '社团达人', rarity: '普通', rarityRank: 1, avatar: 'avatar_club_star', description: '校园里没有你进不去的群，也没有你不认识的部长。', hint: '社交高，社团/聊天/聚餐多，并形成人脉雷达。', priority: 19, scoring: { attrs: [{ key: 'social', min: 75, points: 25 }], groups: [{ key: 'clubChatDinner', per: 5, max: 35 }], habits: [{ id: 'networkRadar', points: 20 }] } },
      { id: 'grad_warrior', name: '考研战士', rarity: '稀有', rarityRank: 2, avatar: 'avatar_grad_warrior', description: '你从大一就开始散发上岸气息。', hint: '学业和自我认同高，考研/复习次数多。', priority: 30, scoring: { attrs: [{ key: 'academic', min: 80, points: 24 }, { key: 'identity', min: 65, points: 18 }], groups: [{ key: 'graduateReview', per: 5, max: 32 }], habits: [{ id: 'selfDiscipline', points: 12 }, { id: 'nightEnergy', points: 8 }] } },
      { id: 'love_brain', name: '恋爱脑', rarity: '普通', rarityRank: 1, avatar: 'avatar_love_brain', description: '你把大学生活玩成了心动日程管理器。', hint: '谈恋爱多，情绪和社交高，并形成恋爱滤镜。', priority: 22, scoring: { attrs: [{ key: 'mood', min: 70, points: 20 }, { key: 'social', min: 60, points: 16 }], cards: [{ id: 'love', per: 7, max: 35 }], habits: [{ id: 'loveFilter', points: 25 }] } },
      { id: 'intern_monster', name: '实习狂魔', rarity: '稀有', rarityRank: 2, avatar: 'avatar_intern_monster', description: '你的简历比课程表更早成熟。', hint: '打工/实习多，技能和金钱都不错。', priority: 28, scoring: { attrs: [{ key: 'skill', min: 65, points: 22 }, { key: 'money', min: 55, points: 18 }], groups: [{ key: 'workIntern', per: 5, max: 35 }], habits: [{ id: 'workerAwake', points: 18 }] } },
      { id: 'esports_player', name: '电竞选手', rarity: '普通', rarityRank: 1, avatar: 'avatar_esports_player', description: '你在峡谷和宿舍之间找到了人生主舞台。', hint: '打游戏多，技能和情绪足，并形成电竞手感。', priority: 18, scoring: { attrs: [{ key: 'skill', min: 55, points: 18 }, { key: 'mood', min: 60, points: 18 }], cards: [{ id: 'game', per: 6, max: 36 }], habits: [{ id: 'esportsSense', points: 24 }] } },
      { id: 'startup_young', name: '创业青年', rarity: '稀有', rarityRank: 2, avatar: 'avatar_startup_young', description: '你还没毕业，商业计划书已经迭代三版。', hint: '创业/项目/比赛多，技能和自我认同高。', priority: 29, scoring: { attrs: [{ key: 'skill', min: 65, points: 21 }, { key: 'identity', min: 75, points: 22 }], groups: [{ key: 'startupProjectCompetition', per: 5, max: 34 }], habits: [{ id: 'projectBurn', points: 18 }] } },
      { id: 'library_ghost', name: '图书馆幽灵', rarity: '普通', rarityRank: 1, avatar: 'avatar_library_ghost', description: '你不是缺席社交，你只是常驻图书馆刷新点。', hint: '图书馆次数多，学业高，社交偏低。', priority: 21, scoring: { attrs: [{ key: 'academic', min: 70, points: 23 }, { key: 'social', max: 45, points: 18 }], cards: [{ id: 'library', per: 6, max: 36 }], habits: [{ id: 'selfDiscipline', points: 14 }, { id: 'socialShield', points: 8 }] } },
      { id: 'gpa_machine', name: '绩点机器', rarity: '史诗', rarityRank: 3, avatar: 'avatar_gpa_machine', description: '你把绩点维护成了精密仪器。', hint: '学业极高，自我认同稳定，学习类行为很多。', priority: 38, scoring: { attrs: [{ key: 'academic', min: 90, points: 30 }, { key: 'identity', min: 60, points: 16 }], groups: [{ key: 'study', per: 4, max: 40 }], habits: [{ id: 'selfDiscipline', points: 18 }] } },
      { id: 'dorm_slacker', name: '宿舍摆烂仙人', rarity: '普通', rarityRank: 1, avatar: 'avatar_dorm_slacker', description: '你在被窝里参透了低能耗生存哲学。', hint: '睡觉/短视频/聚餐很多，情绪和健康不错，学业偏低。', priority: 18, scoring: { attrs: [{ key: 'mood', min: 70, points: 20 }, { key: 'health', min: 55, points: 16 }, { key: 'academic', max: 55, points: 14 }], groups: [{ key: 'sleepVideoDinner', per: 4, max: 36 }], habits: [{ id: 'dormAura', points: 22 }] } },
      { id: 'network_radar', name: '人脉雷达', rarity: '稀有', rarityRank: 2, avatar: 'avatar_network_radar', description: '你站在食堂门口都能自动刷新熟人。', hint: '社交极高，人脉雷达存在，社交类行为很多。', priority: 31, scoring: { attrs: [{ key: 'social', min: 85, points: 30 }], groups: [{ key: 'social', per: 4, max: 40 }], habits: [{ id: 'networkRadar', points: 24 }] } },
      { id: 'project_burner', name: '项目爆肝人', rarity: '稀有', rarityRank: 2, avatar: 'avatar_project_burner', description: '你用咖啡和 deadline 炼成了项目战斗力。', hint: '技能极高，有项目燃烧，健康偏低。', priority: 32, scoring: { attrs: [{ key: 'skill', min: 80, points: 30 }, { key: 'health', max: 45, points: 18 }], groups: [{ key: 'projectCompetitionStartup', per: 5, max: 34 }], habits: [{ id: 'projectBurn', points: 24 }] } },
      { id: 'slash_allround', name: '全能斜杠青年', rarity: '史诗', rarityRank: 3, avatar: 'avatar_slash_allround', description: '你不是选择困难，你是真的都能做一点。', hint: '学业、社交、技能、自我认同都高，所有短板都不低。', priority: 42, scoring: { attrs: [{ key: 'academic', min: 65, points: 15 }, { key: 'social', min: 65, points: 15 }, { key: 'skill', min: 65, points: 15 }, { key: 'identity', min: 65, points: 15 }], specials: [{ type: 'allCoreAttrs', points: 35 }] } },
      { id: 'balanced_life', name: '平衡生活家', rarity: '史诗', rarityRank: 3, avatar: 'avatar_balanced_life', description: '你像读懂了大学生活的隐藏说明书。', hint: '所有属性都不低，并多次触发均衡奖励。', priority: 44, scoring: { attrs: [{ key: 'academic', min: 55, points: 10 }, { key: 'social', min: 55, points: 10 }, { key: 'mood', min: 55, points: 10 }, { key: 'health', min: 55, points: 10 }, { key: 'skill', min: 55, points: 10 }, { key: 'money', min: 55, points: 10 }, { key: 'identity', min: 55, points: 10 }], specials: [{ type: 'balancedWeeks', count: 3, points: 35 }] } }
    ],
    FallbackEnding: {
      id: 'confused_freshman', name: '迷茫新生', rarity: '保底', rarityRank: 0, avatar: 'lock_1', description: '你的路线图像被雨淋过的校园地图，但至少故事很多。', hint: '路线分不足时出现，不计入 15 种图鉴。'
    }
  };

  CONFIG.screen = CONFIG.Screen;
  CONFIG.storySnippets = CONFIG.StoryEntries;
  CONFIG.storyCharacters = CONFIG.StoryCharacters;
  CONFIG.storyCollectibles = CONFIG.StoryCollectibles;
  window.CONFIG = CONFIG;
}());
