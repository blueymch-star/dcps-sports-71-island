'use strict';

// English localization module for Da-Chuang ES 71st Anniversary Sports Day 3D Island
// Translates all content fields cleanly while strictly preserving student privacy masking (○).

const CLASS_LETTER = { '甲': 'A', '乙': 'B', '丙': 'C', '丁': 'D', '戊': 'E' };
const GRADE_DIGIT = { '一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6' };

function enClassName(c) {
  if (!c) return '';
  const s = String(c).trim();
  if (s.length === 2 && GRADE_DIGIT[s[0]] && CLASS_LETTER[s[1]]) {
    return GRADE_DIGIT[s[0]] + CLASS_LETTER[s[1]];
  }
  const m = s.match(/^([一二三四五六])年級$/);
  if (m) return 'Grade ' + GRADE_DIGIT[m[1]];
  return s;
}

const SURNAME_MAP = {
  '胡': 'Hu', '張': 'Chang', '徐': 'Hsu', '蘇': 'Su', '蔡': 'Tsai', '陳': 'Chen',
  '劉': 'Liu', '盧': 'Lu', '余': 'Yu', '李': 'Lee', '楊': 'Yang', '江': 'Chiang',
  '何': 'Ho', '趙': 'Chao', '許': 'Hsu', '郭': 'Kuo', '王': 'Wang', '施': 'Shih',
  '潘': 'Pan', '葉': 'Yeh', '萬': 'Wan', '林': 'Lin', '吳': 'Wu', '鍾': 'Chung',
  '任': 'Jen', '洪': 'Hung', '蕭': 'Hsiao', '鄭': 'Cheng', '韓': 'Han', '沈': 'Shen',
  '賴': 'Lai', '彭': 'Peng', '朱': 'Chu', '梁': 'Liang', '黃': 'Huang', '汪': 'Wang',
  '孫': 'Sun', '周': 'Chou', '范': 'Fan', '董': 'Tung', '康': 'Kang', '高': 'Kao',
  '宋': 'Sung', '齊': 'Chi', '傅': 'Fu', '詹': 'Chan', '呂': 'Lu', '鄧': 'Teng',
  '邱': 'Chiu', '柯': 'Ko', '簡': 'Chien', '杜': 'Tu', '方': 'Fang', '翁': 'Weng',
  '翟': 'Chai', '顏': 'Yen', '謝': 'Hsieh'
};

const GIVEN_CHAR_MAP = {
  '瑋': 'Wei', '米': 'Mi', '宸': 'Chen', '喜': 'Hsi', '倫': 'Lun', '奕': 'Yi',
  '然': 'Jan', '澄': 'Cheng', '軒': 'Hsuan', '冠': 'Kuan', '鋒': 'Feng', '昊': 'Hao',
  '翰': 'Han', '宇': 'Yu', '芸': 'Yun', '芊': 'Chien', '昀': 'Yun', '菲': 'Fei',
  '樂': 'Le', '慧': 'Hui', '恩': 'En', '若': 'Jo', '榕': 'Jung', '甯': 'Ning',
  '羽': 'Yu', '岑': 'Tsen', '語': 'Yu', '姿': 'Tzu', '潔': 'Chieh', '杰': 'Chieh',
  '鴻': 'Hung', '呈': 'Cheng', '凱': 'Kai', '晨': 'Chen', '吉': 'Chi', '叡': 'Jui',
  '銧': 'Kuang', '睿': 'Jui', '聿': 'Yu', '仁': 'Jen', '君': 'Chun', '煦': 'Hsu',
  '澤': 'Tse', '辰': 'Chen', '孜': 'Tzu', '芩': 'Chin', '瑜': 'Yu', '欣': 'Hsin',
  '霏': 'Fei', '瑄': 'Hsuan', '樺': 'Hua', '希': 'Hsi', '莃': 'Hsi', '妘': 'Yun',
  '儀': 'Yi', '妍': 'Yen', '函': 'Han', '僑': 'Chiao', '晟': 'Sheng', '皓': 'Hao',
  '芥': 'Chieh', '閎': 'Hung', '暉': 'Hui', '晏': 'Yen', '宗': 'Tsung', '滔': 'Tao',
  '曜': 'Yao', '亦': 'Yi', '崴': 'Wei', '誠': 'Cheng', '芯': 'Hsin', '凡': 'Fan',
  '妮': 'Ni', '雨': 'Yu', '悅': 'Yueh', '錦': 'Chin', '郁': 'Yu', '真': 'Chen',
  '尹': 'Yin', '容': 'Jung', '諺': 'Yen', '廷': 'Ting', '祐': 'Yu', '諳': 'An',
  '信': 'Hsin', '銘': 'Ming', '煊': 'Hsuan', '頤': 'Yi', '鋕': 'Chih', '佑': 'Yu',
  '遠': 'Yuan', '哲': 'Che', '翔': 'Hsiang', '珩': 'Heng', '嫿': 'Hua', '睎': 'Hsi',
  '桐': 'Tung', '伃': 'Yu', '榆': 'Yu', '婷': 'Ting', '怡': 'Yi', '昕': 'Hsin',
  '霖': 'Lin', '榤': 'Chieh', '碩': 'Shuo', '瑞': 'Jui', '昆': 'Kun', '承': 'Cheng',
  '昇': 'Sheng', '安': 'An', '詣': 'Yi', '毅': 'Yi', '熙': 'Hsi', '浩': 'Hao',
  '陽': 'Yang', '玲': 'Ling', '臻': 'Chen', '堂': 'Tang', '歆': 'Hsin', '茜': 'Chien',
  '姮': 'Heng', '薰': 'Hsun', '霓': 'Ni', '蕙': 'Hui', '佳': 'Chia', '禕': 'Yi',
  '旭': 'Hsu', '宏': 'Hung', '宥': 'Yu', '豪': 'Hao', '強': 'Chiang', '臣': 'Chen',
  '楷': 'Kai', '媃': 'Jou', '萱': 'Hsuan', '穎': 'Ying', '捷': 'Chieh', '琳': 'Lin',
  '予': 'Yu', '恬': 'Tien', '英': 'Ying', '柔': 'Jou', '能': 'Neng', '紘': 'Hung',
  '年': 'Nien', '傑': 'Chieh', '勳': 'Hsun', '淞': 'Sung', '秧': 'Yang', '玄': 'Hsuan',
  '喻': 'Yu', '蓉': 'Jung', '嫣': 'Yen', '晴': 'Ching', '倪': 'Ni', '喬': 'Chiao',
  '茹': 'Ju', '珊': 'Shan', '勛': 'Hsun', '綸': 'Lun', '左': 'Tso', '彥': 'Yen',
  '智': 'Chih', '杭': 'Hang', '雯': 'Wen', '妤': 'Yu', '婕': 'Chieh', '芮': 'Jui',
  '蓁': 'Chen', '馨': 'Hsin', '玹': 'Hsuan'
};

function romanizeMaskedName(name) {
  if (!name) return '';
  const m = String(name).trim().match(/^(.+?)(○+)(.*)$/);
  if (!m) return name;
  const sur = SURNAME_MAP[m[1]] || m[1];
  const tail = [...m[3]].map(ch => GIVEN_CHAR_MAP[ch] || ch).join('-');
  return tail ? `${sur} ${m[2]}-${tail}` : `${sur} ${m[2]}`;
}

function applyEnglishData(sqData) {
  if (!sqData) return sqData;

  if (sqData.city) {
    sqData.city.nameEn = "Da-Chuang's 71st Sports Day";
    sqData.city.titleEn = 'Glory Run · Five Powers';
    sqData.city.subEn = "Welcome to Da-Chuang Elementary School's 71st Anniversary Sports Day along the breezy Xiangshan 6-lane purple track! Explore 32 scheduled events and preliminary/final sprint records, collect all 5 Power Stamps, and ignite the 3D Victory Fireworks!";
  }

  if (sqData.winNotes) {
    if (sqData.winNotes.W) {
      sqData.winNotes.W.nameEn = 'W · Striving & Surpassing Self';
      sqData.winNotes.W.en = '[Learning & Inquiry · Knowledge Power] Competency-based inquiry ladders, digital literacy, and reading transform into smart-strategy fun races across grades on Sports Day.';
    }
    if (sqData.winNotes.I) {
      sqData.winNotes.I.nameEn = 'I · Kiln Life & Caring Growth';
      sqData.winNotes.I.en = '[Gratitude & Care · Moral & Team Power] Wood-fired kiln stewardship and edible campus gardens inspire athletes\' march-in, volunteer honors, and the cross-generation Heritage Relay.';
    }
    if (sqData.winNotes.N) {
      sqData.winNotes.N.nameEn = 'N · Railway Heritage & Arts Trip';
      sqData.winNotes.N.en = '[Health & Vitality · Aesthetic & Physical Power] Railway arts and active living shine in club street dance, six-grade choreographies, sprint finals, and class relays.';
    }
  }

  const ROLE_EN = {
    coubertin: ['Pierre de Coubertin (Olympic Founder)', 'Founder of the modern Olympic Games holding the ceremonial torch'],
    brucelee: ['Bruce Lee (Martial & Rhythm Legend)', 'Iconic yellow-and-black tracksuit celebrating movement and martial rhythm'],
    chicheng: ['Chi Cheng (The Flying Antelope)', 'Hsinchu-born track legend who set 50m/100m/200m world records'],
    owens: ['Jesse Owens (4-Gold Relay Legend)', 'Olympic champion across 100m, 200m, and the 4x100m relay'],
    jordan: ['Michael Jordan (Agility & Court Legend)', 'Iconic #23 jersey celebrating coordination, agility, and smart teamwork'],
    yangck: ['Yang Chuan-Kwang (Iron Man of Asia)', 'Taiwan Olympic decathlon icon symbolizing mastery of all Five Powers'],
    student: ['Da-Chuang Athlete', 'Da-Chuang PE uniform'],
    teacher: ['Referee & Coach', 'Sports polo with clipboard and whistle'],
    parent: ['Cheering Parent', 'Enthusiastic sideline supporter'],
    volunteer: ['Anniversary Volunteer', 'Service vest'],
    scout: ['Torch Honor Guard', 'Ceremonial torch guard scarf']
  };
  if (sqData.customRoles) {
    Object.keys(sqData.customRoles).forEach(k => {
      if (ROLE_EN[k]) {
        sqData.customRoles[k].nameEn = ROLE_EN[k][0];
        sqData.customRoles[k].lookEn = ROLE_EN[k][1];
      }
    });
  }

  const QUEST_EN = {
    q_moral: {
      powerEn: 'Moral Power',
      landmarkNameEn: "Principal's Podium & Honors Stage",
      titleEn: '[Moral Power Trial] Honoring Unsung Campus Heroes',
      clueEn: "Head to central 01 Grand Plaza and visit Principal Hsu's Podium & Honors Stage where gratitude awards are presented!",
      questionEn: 'Right after the 08:35 Opening Ceremony, which dedicated partners does Principal Hsu Ya-Hui honor with certificates and plaques?',
      optionsEn: [
        'Parents Association, Educational Benefactors & Senior Volunteers',
        'A pro baseball umpire crew',
        'An outer-space exploration squad'
      ],
      explainEn: 'Correct! Program Events 06–08 honor the Parents Association, Educational Benefactors, and Senior Volunteers—and Event 32 venue cleanup embodies Da-Chuang Moral Power (gratitude and responsibility)!'
    },
    q_aesthetic: {
      powerEn: 'Aesthetic Power',
      landmarkNameEn: 'Six-Grade Fan & Ribbon Sculpture',
      titleEn: '[Aesthetic Power Trial] Dancing Fans Across Da-Chuang',
      clueEn: 'Head east to 02 Arts Stage and inspect the Six-Grade Fan & Ribbon Sculpture or Open-Air Dance Stage!',
      questionEn: 'What is the title of Grade 6’s dramatic fan-dance showcase opening the grade performances at 08:55?',
      optionsEn: [
        'Rising Winds · Radiant Fans Stage',
        'Aim for Success, Dash Ahead',
        'Every Grain Counts'
      ],
      explainEn: 'Awesome! Grade 6 opens with "Rising Winds · Radiant Fans Stage" (08:55), followed by Grades 5, 1, 2, 3, 4 and Preschoolers\' Banana Boogie!'
    },
    q_physical: {
      powerEn: 'Physical Power',
      landmarkNameEn: '6-Lane Purple Rubber Track',
      titleEn: '[Physical Power Trial] Speed Legends on the Purple Track',
      clueEn: 'Head southeast to 03 Sprint Track and click the 6-Lane Purple Rubber Track marked for 50m, 60m, 100m, and 200m!',
      questionEn: 'In the pre-day individual track sprints (10/21–11/13), which distances did Middle Grades (G3–4) and Upper Grades (G5–6) race?',
      optionsEn: [
        'Middle Grades: 60m/100m; Upper Grades: 100m/200m',
        'All grades ran 400m hurdles',
        '3,000m marathon road race'
      ],
      explainEn: 'Spot on! Middle Grades raced 60m & 100m while Upper Grades raced 100m & 200m (top 3 win medals + certificates, 4th–6th win certificates); Lower Grades run 50m at 11:00 on Sports Day!'
    },
    q_group: {
      powerEn: 'Team Power',
      landmarkNameEn: 'Relay Breakline Curve Zone',
      titleEn: '[Team Power Trial] Safe Overtaking in the Class Relay',
      clueEn: 'Head southwest to 04 Relay Arena and inspect the Relay Breakline Curve Zone or Giant Golden Baton Landmark!',
      questionEn: 'According to the 71st Class Relay regulations, which side must a runner overtake on to pass safely and legally?',
      optionsEn: [
        'Pass on the right (outer lane) of the runner ahead',
        'Cut across the inner grass field',
        'Shout for the leader to yield Lane 1'
      ],
      explainEn: '100% right! Runners break for Lane 1 after Leg 3 (Middle) or Leg 2 (Upper), and must always overtake on the right (outer lane)—followed at 12:00 by the cross-generation Heritage Relay!'
    },
    q_knowledge: {
      powerEn: 'Knowledge Power',
      landmarkNameEn: 'Hula-Hoop & Barrel Obstacle Zone',
      titleEn: '[Knowledge Power Trial] Fun-Race Strategy Master',
      clueEn: 'Head west to 05 Fun Games Isle and check the Hula-Hoop & Barrel Obstacle Zone or Tigger & Family Photo Corner!',
      questionEn: 'During the 09:30–10:40 Knowledge Power fun races, what are the events for Grade 3 and Grade 6?',
      optionsEn: [
        'G3: Towel-Ball Relay; G6: Hula-Hoop Ironman',
        'G3: Bouncing Tiggers; G6: String-a-Chain',
        'G3: Tug-of-War; G6: Archery'
      ],
      explainEn: 'Well done! From Preschool String-a-Chain and G1 Bouncing Tiggers to G3 Towel-Ball Relay, G6 Hula-Hoop Ironman, and 10:40 Family Ring Sprint, every fun race tests coordination and smart strategy!'
    }
  };
  if (Array.isArray(sqData.quests)) {
    sqData.quests.forEach(q => {
      const en = QUEST_EN[q.id];
      if (en) Object.assign(q, en);
    });
  }

  const PROG_EN = {
    '01': { titleEn: 'Miki Street Dance', powerEn: 'Aesthetic Power', performerEn: 'Dance Club' },
    '02': { titleEn: 'Da-Chuang Taekwondo', powerEn: 'Aesthetic Power', performerEn: 'Taekwondo Club' },
    '03': { titleEn: 'Japanese Parasol Dance', powerEn: 'Aesthetic Power', performerEn: 'New-Immigrant Community Team' },
    '04': { titleEn: 'Athletes March-In', powerEn: 'Team Power', performerEn: 'All Students & Faculty' },
    '05': { titleEn: 'Opening Ceremony', powerEn: 'Moral Power', performerEn: 'All Students & Faculty' },
    '06': { titleEn: 'Parents Association Appointment Certificates', powerEn: 'Moral Power', performerEn: 'All Students & Faculty' },
    '07': { titleEn: 'Educational Benefactor Appreciation Plaques', powerEn: 'Moral Power', performerEn: 'All Students & Faculty' },
    '08': { titleEn: 'Senior Volunteer Commendation', powerEn: 'Moral Power', performerEn: 'All Students & Faculty' },
    '09': { titleEn: 'Dance Showcase: Rising Winds · Radiant Fans', powerEn: 'Aesthetic Power', performerEn: 'Grade 6' },
    '10': { titleEn: 'Dance Showcase: Festive Staff Celebration', powerEn: 'Aesthetic Power', performerEn: 'Grade 5' },
    '11': { titleEn: 'Dance Showcase: Aim for Success, Dash Ahead', powerEn: 'Aesthetic Power', performerEn: 'Grade 1' },
    '12': { titleEn: 'Dance Showcase: Big Dreamers', powerEn: 'Aesthetic Power', performerEn: 'Grade 2' },
    '13': { titleEn: 'Dance Showcase: Blossoming Spring Blooms', powerEn: 'Aesthetic Power', performerEn: 'Grade 3' },
    '14': { titleEn: 'Dance Showcase: Martial Leap · Brocade Soar', powerEn: 'Aesthetic Power', performerEn: 'Grade 4' },
    '15': { titleEn: 'Parent-Child Rhythm: Banana Boogie Together', powerEn: 'Aesthetic Power', performerEn: 'Preschoolers & Parents' },
    '16': { titleEn: 'Preschool Family Fun Race: String-a-Chain', powerEn: 'Knowledge Power', performerEn: 'Preschoolers & Parents' },
    '17': { titleEn: 'Fun Race: Towel-Ball Relay', powerEn: 'Knowledge Power', performerEn: 'Grade 3' },
    '18': { titleEn: 'Fun Race: Linked Can-Chain', powerEn: 'Knowledge Power', performerEn: 'Grade 4' },
    '19': { titleEn: 'Fun Race: Da-Chuang Leap Forward', powerEn: 'Knowledge Power', performerEn: 'Grade 5' },
    '20': { titleEn: 'Fun Race: Hula-Hoop Ironman', powerEn: 'Knowledge Power', performerEn: 'Grade 6' },
    '21': { titleEn: 'Fun Race: Every Grain Counts', powerEn: 'Knowledge Power', performerEn: 'Grade 2' },
    '22': { titleEn: 'Fun Race: Bouncing Tiggers', powerEn: 'Knowledge Power', performerEn: 'Grade 1' },
    '23': { titleEn: 'Parent-Child Fun Race: Ring-Power Sprint', powerEn: 'Knowledge Power', performerEn: 'Students & Parents' },
    '24': { titleEn: 'Parent-Child Grand Relay', powerEn: 'Physical Power', performerEn: 'Preschool' },
    '25': { titleEn: '50m Run & Walk', powerEn: 'Physical Power', performerEn: 'Grade 1' },
    '26': { titleEn: '50m Run & Walk', powerEn: 'Physical Power', performerEn: 'Grade 2' },
    '27': { titleEn: 'Class Relay Final (Grade 3)', powerEn: 'Physical Power', performerEn: 'Grade 3' },
    '28': { titleEn: 'Class Relay Final (Grade 4)', powerEn: 'Physical Power', performerEn: 'Grade 4' },
    '29': { titleEn: 'Class Relay Final (Grade 5)', powerEn: 'Physical Power', performerEn: 'Grade 5' },
    '30': { titleEn: 'Da-Chuang Heritage Relay', powerEn: 'Team Power', performerEn: 'Alumni, Staff & Parents' },
    '31': { titleEn: 'Closing Ceremony', powerEn: 'Moral Power', performerEn: 'All Students & Faculty' },
    '32': { titleEn: 'Campus Grounds Restoration', powerEn: 'Moral Power', performerEn: 'Student & General Affairs' }
  };
  if (Array.isArray(sqData.programSchedule)) {
    sqData.programSchedule.forEach(p => {
      const en = PROG_EN[p.no];
      if (en) Object.assign(p, en);
    });
  }

  const PRE_EN = [
    {
      dateEn: '10/21 (Mon)', stageEn: 'Prelims', itemEn: 'Middle Grades (G3–4) 60m Preliminaries',
      callTimeEn: '08:00–08:10', raceTimeEn: '08:10–08:40', statusEn: 'Completed',
      ruleEn: '3 boys & 3 girls per class across 3 heats; heat winners + top 3 times advance to finals.'
    },
    {
      dateEn: '10/27 (Tue)', stageEn: 'Prelims', itemEn: 'Upper Grades (G5–6) 100m Preliminaries',
      callTimeEn: '08:00–08:10', raceTimeEn: '08:10–08:40', statusEn: 'Completed',
      ruleEn: '3 boys & 3 girls per class across 3 heats; heat winners + top 3 times advance to finals.'
    },
    {
      dateEn: '10/28 (Wed)', stageEn: 'Prelims', itemEn: 'Middle Grades (G3–4) 100m Preliminaries',
      callTimeEn: '08:00–08:10', raceTimeEn: '08:10–08:40', statusEn: 'Completed',
      ruleEn: '3 boys & 3 girls per class across 3 heats; heat winners + top 3 times advance to finals.'
    },
    {
      dateEn: '10/30 (Fri)', stageEn: 'Prelims', itemEn: 'Upper Grades (G5–6) 200m Preliminaries',
      callTimeEn: '08:00–08:10', raceTimeEn: '08:10–08:40', statusEn: 'Completed',
      ruleEn: '3 boys & 3 girls per class across 3 heats; heat winners + top 3 times advance to finals.'
    },
    {
      dateEn: '11/10 (Tue)', stageEn: 'Finals', itemEn: 'Middle Grades (G3–4) 60m & 100m Finals',
      callTimeEn: '08:00–08:10', raceTimeEn: '08:10–08:40', statusEn: 'Completed',
      ruleEn: '6 boys & 6 girls per grade in finals; Top 3 earn medals + certificates, 4th–6th earn certificates.'
    },
    {
      dateEn: '11/13 (Fri)', stageEn: 'Finals', itemEn: 'Upper Grades (G5–6) 100m & 200m Finals',
      callTimeEn: '08:00–08:10', raceTimeEn: '08:10–08:40', statusEn: 'Completed',
      ruleEn: '6 boys & 6 girls per grade in finals; Top 3 earn medals + certificates, 4th–6th earn certificates.'
    },
    {
      dateEn: '11/25 (Wed)', stageEn: 'Team Final', itemEn: 'Grade 6 Class Relay Final',
      callTimeEn: '08:00–08:10', raceTimeEn: '08:10–08:20', statusEn: 'Completed',
      ruleEn: '8 girls (Legs 1–8) & 8 boys (Legs 9–16), 1 full lap each; Leg 2 breaks for Lane 1. Top 3 earn pennants.'
    },
    {
      dateEn: '12/12 (Sat)', stageEn: 'Main Day', itemEn: 'Lower Grades 50m & G3–5 Class Relay Finals',
      callTimeEn: 'After Fun Races', raceTimeEn: 'After Dances / 11:00+', statusEn: 'Sports Day',
      ruleEn: 'G3–4 run half-lap each (Leg 3 break); G5 runs full lap (Leg 2 break); always overtake on the right.'
    }
  ];
  if (Array.isArray(sqData.preEvents)) {
    sqData.preEvents.forEach((p, idx) => {
      if (PRE_EN[idx]) Object.assign(p, PRE_EN[idx]);
    });
  }

  const ISLAND_EN = {
    s01: {
      nameEn: 'Grand Plaza',
      fullEn: 'Grand Plaza · Moral & Team Welcome Hub',
      gradeEn: 'All Students, Staff & Guests',
      periodsEn: '08:15 March-In | 08:35 Opening | 08:50–08:54 Honors | 13:00 Cleanup',
      periodsShortEn: '08:15–08:54 | 13:00',
      leadEn: 'Moral Power × Team Power | Athletes march-in, Principal Hsu Ya-Hui opening address, Parents Association & Volunteer honors',
      summaryEn: 'Grand Plaza is the ceremonial heart of our 71st Anniversary! At 08:15, the school marches through the Rainbow Arch before Principal Hsu Ya-Hui presides over the Opening Ceremony, honors Parents Association officers, Educational Benefactors, and Senior Volunteers, and closes the day responsibly with 13:00 Grounds Restoration. Collect all 5 Power Stamps to ignite the central cauldron fireworks!',
      keywordsEn: ['Moral Power', 'Team Power', 'March-In', 'Opening Ceremony', 'Principal Hsu', 'Parents Association', 'Senior Volunteers', 'Cauldron'],
      assessEn: 'Complete any Moral Power landmark quest here to earn your [Moral Power Stamp].',
      skillsEn: ['Gratitude & Care', 'Team Discipline', 'Campus Stewardship'],
      unitsEn: [
        { semEn: '08:15', weeksEn: 'Event 04', nameEn: 'Athletes March-In (Whole School · Team Power)' },
        { semEn: '08:35', weeksEn: 'Event 05', nameEn: 'Opening Ceremony (Principal Hsu Ya-Hui · Moral Power)' },
        { semEn: '08:50', weeksEn: 'Events 06–08', nameEn: 'Parents Assoc. Certificates, Benefactor Plaques & Volunteer Honors' },
        { semEn: '13:00', weeksEn: 'Event 32', nameEn: 'Campus Grounds Restoration (Student & General Affairs · Moral Power)' }
      ],
      itemsEn: {
        s01i1: {
          nameEn: '71st Radiant Torch Cauldron',
          descEn: 'The centerpiece cauldron of our 71st Sports Day, crafted in Xiangshan sea-breeze blue and white stone. Collect all 5 stamps to launch 3D Victory Fireworks!',
          factsEn: ['71st Anniversary Main Cauldron', 'Sea-Breeze Blue Concentric Base', 'Ignites 3D Fireworks at 5 Stamps'],
          whenEn: '08:35 Torch Lighting | 12:20 Victory Fireworks (Core Landmark)',
          ch: {
            powerEn: 'Moral Power',
            titleEn: '[Cauldron Quest] Charge the Five-Power Torch',
            taskDescEn: 'Tap "🔥 Fan the Five-Power Flame" 5 times to charge the cauldron to 100%, then answer the theme question below!',
            actionBtnEn: '🔥 Fan the Five-Power Flame',
            actionDoneEn: '🔥 Flame at 100%! Sea-breeze blue and golden fire blaze brightly!',
            questionEn: 'Under the 71st theme "Da-Chuang’s 71st: Soaring with the Five Powers," what are Da-Chuang’s Five Powers?',
            optionsEn: [
              'Fire, Water, Wind, Electric & Geothermal Power',
              'Telepathy, Magic, Flight, Invisibility & Teleportation',
              'Moral, Team, Aesthetic, Knowledge & Physical Power'
            ],
            explainEn: 'Exact match! Da-Chuang’s Five Powers—Moral, Team, Aesthetic, Knowledge, and Physical—shine through all 32 Sports Day events!'
          }
        },
        s01i2: {
          nameEn: '71st Welcome Rainbow Arch',
          descEn: 'Starting gate for the 08:15 Athletes March-In, where classes stride onto the field in creative outfits showing Da-Chuang Team Power.',
          factsEn: ['08:15 Athletes March-In', '71st Anniversary Theme', 'Creative Class Parade'],
          whenEn: '08:15–08:35 | Event 04: All-School Athletes March-In',
          ch: {
            powerEn: 'Moral Power',
            titleEn: '[Rainbow Arch Quest] Parade Chant Rhythm',
            taskDescEn: 'At 08:15, classes march proudly through the arch! Tap the 3 parade chant buttons in order to rally the procession:',
            sequenceItemsEn: ['① 71st Da-Chuang', '② Five Powers Soar', '③ Glory Run'],
            actionBtnEn: '🚩 Rally the March-In Chant',
            actionDoneEn: '🎉 Crisp in unison! "71st Da-Chuang · Five Powers Soar · Glory Run" echoes across campus!',
            questionEn: 'When does Event 04 "Athletes March-In" begin, and who leads the procession onto the field?',
            optionsEn: [
              'Begins at 08:15 with all students & staff (led by Principal Hsu Ya-Hui)',
              'Only Grade 6 representatives march in',
              'Starts at 11:30 in the morning'
            ],
            explainEn: 'Correct! At 08:15, all classes and teachers march in proudly under Principal Hsu’s welcome, showing courtesy and teamwork!'
          }
        },
        s01i3: {
          nameEn: 'Ceremonial Flagpole Platform',
          descEn: 'Raising the meet and school flags into the Xiangshan sea breeze while athletes pledge fair play—graceful in victory and defeat.',
          factsEn: ['Meet Flag Raising Ceremony', 'Athletes Fair-Play Oath', 'All-School Anthem'],
          whenEn: '08:35–08:50 | Event 05: Flag Raising & Oath',
          ch: {
            powerEn: 'Moral Power',
            titleEn: '[Flagpole Quest] Hoist Flag & Athletes Oath',
            taskDescEn: 'Tap "🏳️ Pull Halyard to Hoist Meet Flag" 4 times to raise the flag to the peak, then choose the true meaning of sportsmanship!',
            actionBtnEn: '🏳️ Pull Halyard to Hoist Flag',
            actionDoneEn: '🏳️ The Meet Flag flutters high in the Xiangshan breeze as everyone salutes!',
            questionEn: 'At the Flagpole Platform, what behavior during the Athletes Oath reflects true Da-Chuang Moral Power?',
            optionsEn: [
              'Shoving opponents just to win a race',
              'Skipping the Closing Ceremony if not placed first',
              'Respecting rules & officials, graceful in victory and humble in defeat'
            ],
            explainEn: 'Well said! Respecting rules, officials, and fellow athletes is the core of Da-Chuang’s Moral Power!'
          }
        },
        s01i4: {
          nameEn: "Principal's Podium & Honors Stage",
          descEn: 'Principal Hsu Ya-Hui hosts the 08:35 Opening and presents certificates and plaques (08:50–08:54) to Parents Association officers, benefactors, and volunteers.',
          factsEn: ['08:50 Parents Assoc. Certificates', '08:52 Benefactor Plaques', '08:54 Volunteer Honors'],
          whenEn: '08:50–08:54 | Events 06–08: Gratitude Awards',
          ch: {
            powerEn: 'Moral Power',
            titleEn: '[Honors Stage Quest] Thank Our Campus Guardians',
            taskDescEn: 'Tap the 3 applause buttons in order to give a heartfelt ovation to the three groups who guard Da-Chuang:',
            sequenceItemsEn: ['👏 Thank Parents Assoc.', '👏 Thank Benefactors', '👏 Honor Volunteers'],
            actionBtnEn: '👏 Give Gratitude Applause',
            actionDoneEn: '💖 Thunderous applause! Thank you, Parents Association, benefactors, and senior volunteers!',
            questionEn: 'During Events 06–08 after the 08:35 Opening, which three partners are honored on stage by Principal Hsu Ya-Hui?',
            optionsEn: [
              'An outer-space exploration squad',
              'A pro baseball umpire crew',
              'Parents Association, Educational Benefactors & Senior Volunteers'
            ],
            explainEn: 'Spot on! Events 06–08 specifically honor the Parents Association, Educational Benefactors, and Senior Volunteers—a shining model of Moral Power!'
          }
        }
      }
    },
    s02: {
      nameEn: 'Arts Stage',
      fullEn: 'Arts Stage · Club Openers & Six-Grade Dances',
      gradeEn: 'Preschool–G6, Clubs & New-Immigrant Team',
      periodsEn: '08:00–08:15 Club Openers | 08:55–09:25 Grade Dances & Rhythm',
      periodsShortEn: '08:00–08:15 | 08:55–09:25',
      leadEn: 'Aesthetic Power | Street dance, Taekwondo, parasol dance openers, followed by Grades 1–6 showcases and preschool family rhythm',
      summaryEn: 'Arts Stage hosts our most colorful movement performances! Opening at 08:00 with Miki Street Dance, Da-Chuang Taekwondo, and the New-Immigrant Japanese Parasol Dance, followed at 08:55 by Grades 6 through 1 thematic dances and Preschoolers’ Banana Boogie!',
      keywordsEn: ['Aesthetic Power', 'Miki Street Dance', 'Taekwondo', 'Parasol Dance', 'Radiant Fans', 'Festive Staff', 'Banana Boogie'],
      assessEn: 'Complete any Aesthetic Power showcase quest here to earn your [Aesthetic Power Stamp].',
      skillsEn: ['Expressive Rhythm', 'Ensemble Performance', 'Multicultural Arts'],
      unitsEn: [
        { semEn: '08:00', weeksEn: 'Events 01–03', nameEn: 'Miki Street Dance, Taekwondo & Japanese Parasol Dance (Openers)' },
        { semEn: '08:55', weeksEn: 'Events 09–10', nameEn: 'G6 "Rising Winds · Radiant Fans" & G5 "Festive Staff Celebration"' },
        { semEn: '09:05', weeksEn: 'Events 11–12', nameEn: 'G1 "Aim for Success, Dash Ahead" & G2 "Big Dreamers"' },
        { semEn: '09:15', weeksEn: 'Events 13–15', nameEn: 'G3 "Spring Blooms", G4 "Martial Leap" & Preschool "Banana Boogie"' }
      ],
      itemsEn: {
        s02i1: {
          nameEn: 'Breeze Rhythm Open-Air Stage',
          descEn: 'From 08:00 street dance, Taekwondo, and Japanese parasol dance to Grades 1–6 and preschool family rhythm, students shine with confidence on stage.',
          factsEn: ['08:00 Miki Dance & Taekwondo', '08:10 Parasol Dance', '08:55–09:25 Seven Grade Showcases'],
          whenEn: '08:00–08:15 Club Openers | 08:55–09:25 Grade Dances',
          ch: {
            powerEn: 'Aesthetic Power',
            titleEn: '[Open-Air Stage Quest] Line Up the 3 Opening Shows',
            taskDescEn: 'Promptly at 08:00, three dynamic club and community performances kick off Sports Day! Light the spotlights in performance order:',
            sequenceItemsEn: ['① 08:00 Miki Street Dance', '② 08:05 Taekwondo', '③ 08:10 Parasol Dance'],
            actionBtnEn: '💡 Light Stage Spotlights',
            actionDoneEn: '✨ Spotlights ablaze! Dance Club, Taekwondo Club, and the Parasol Dance amaze the crowd!',
            questionEn: 'In the 08:00–08:15 opening trio alongside Miki Street Dance and Taekwondo, which special community team performs third?',
            optionsEn: [
              'New-Immigrant Community Team (Japanese Parasol Dance)',
              'Recorder Ensemble',
              'Percussion Ensemble'
            ],
            explainEn: 'Right! 08:00 Miki Street Dance, 08:05 Taekwondo Club, and 08:10 New-Immigrant Japanese Parasol Dance kick off with rich multicultural Aesthetic Power!'
          }
        },
        s02i2: {
          nameEn: 'Pro Audio & Lighting Truss',
          descEn: 'Equipped with pro stage trusses and audio consoles, delivering crisp beats across the Xiangshan campus for every dance cue.',
          factsEn: ['Pro Audio for Club Openers', 'Precision Cues for 6-Grade Dances', 'Upbeat Rhythm for Preschoolers'],
          whenEn: '08:00–09:25 | Events 01–03 & 09–15 Stage Audio',
          ch: {
            powerEn: 'Aesthetic Power',
            titleEn: '[Audio Truss Quest] DJ Rhythm Soundcheck',
            taskDescEn: 'Tap "🎧 Boost Main Stage Fader" 3 times to check bass and mic clarity, then identify the 09:25 Preschool parent-child dance!',
            actionBtnEn: '🎧 Boost Main Stage Fader',
            actionDoneEn: '🎵 Soundcheck complete! Energetic beats fill every corner of Da-Chuang!',
            questionEn: 'What is the title of the 09:25 Preschool parent-child rhythm dance performed with moms and dads?',
            optionsEn: [
              'Family Weightlifting Championship',
              'Skydiving Stunt Show',
              'Parent-Child Rhythm: Banana Boogie Together'
            ],
            explainEn: 'Adorable! Event 15 at 09:25 is the joyful Preschool Parent-Child Rhythm dance "Banana Boogie Together"!'
          }
        },
        s02i3: {
          nameEn: 'Six-Grade Fan & Ribbon Sculpture',
          descEn: 'A sculpted monument blending Grade 6 crimson-gold fans, Grade 5 martial staffs, Grade 4 ribbons, and Japanese paper parasols.',
          factsEn: ['G6: Rising Winds · Radiant Fans', 'G5: Festive Staff Celebration', 'G3–4: Spring Blooms & Martial Leap'],
          whenEn: '08:55–09:25 | Events 09–14: Grades 1–6 Dance Extravaganza',
          ch: {
            powerEn: 'Aesthetic Power',
            titleEn: '[Fan Sculpture Quest] Unlock All 6 Grade Dances',
            taskDescEn: 'Tap in sequence to wave the crimson-gold fan, festive staff, and spring ribbons to reveal all six grade dance showcases:',
            sequenceItemsEn: ['🪭 G6 Radiant Fans', '🥢 G5 Festive Staff', '🌸 G1–4 Spring & Martial Leap'],
            actionBtnEn: '🪭 Wave Dance Props',
            actionDoneEn: '🎨 Fans and ribbons flutter high! All six grade dance showcases shine in harmony!',
            questionEn: 'Which dance kicks off the grade showcases at 08:55 with dramatic opening-fan choreography by our 6th graders?',
            optionsEn: [
              'Big Dreamers',
              'Aim for Success, Dash Ahead',
              'Rising Winds · Radiant Fans Stage'
            ],
            explainEn: 'Correct! G6 "Rising Winds · Radiant Fans" leads at 08:55, followed by G5, G1, G2, G3 "Blossoming Spring Blooms", and G4 "Martial Leap · Brocade Soar"!'
          }
        }
      }
    },
    s03: {
      nameEn: 'Sprint Track',
      fullEn: 'Sprint Track · 6-Lane Purple Track & Sprint Heroes',
      gradeEn: 'Grades 1–6 Track Sprinters',
      periodsEn: '10/21–11/13 G3–6 Prelims & Finals | Today 11:00 G1–2 50m Run',
      periodsShortEn: '10/21–11/13 | 11:00 G1–2',
      leadEn: 'Physical Power | Signature 6-lane purple PU track with 50m/60m/100m/200m marks and official 16-event sprint results',
      summaryEn: 'Sprint Track faithfully recreates Da-Chuang’s signature 6-lane purple rubber track! It archives all 16 G3–6 individual sprint events (240 heats athletes and 96 finalists) completed between 10/21 and 11/13, with Top 3 earning medals + certificates and 4th–6th earning certificates!',
      keywordsEn: ['Physical Power', 'Purple Track', '50m', '60m', '100m', '200m', 'Sprint Finals'],
      assessEn: 'Complete any Physical Power speed quest here to earn your [Physical Power Stamp].',
      skillsEn: ['Explosive Sprint', 'Start Reaction', 'Sportsmanship'],
      unitsEn: [
        { semEn: '10/21-10/30', weeksEn: 'Prelims', nameEn: 'G3–4 (60m/100m) & G5–6 (100m/200m) Prelims (3 boys & 3 girls/class)' },
        { semEn: '11/10', weeksEn: 'G3–4 Finals', nameEn: 'Middle Grades 60m & 100m Finals (08:10–08:40 Completed)' },
        { semEn: '11/13', weeksEn: 'G5–6 Finals', nameEn: 'Upper Grades 100m & 200m Finals (08:10–08:40 Completed)' },
        { semEn: '11:00-11:10', weeksEn: 'Events 25–26', nameEn: 'Grade 1 & Grade 2 50m Run & Walk (Energetic Track Sprint)' }
      ],
      itemsEn: {
        s03i1: {
          nameEn: '6-Lane Purple Rubber Track',
          descEn: 'Da-Chuang’s iconic 6-lane purple PU rubber track featuring distinct start lines for 50m (yellow), 60m (blue), 100m (red-white), and 200m (green stagger).',
          factsEn: ['6-Lane Purple PU Track', '50m / 60m / 100m / 200m Start Lines', '11:00 G1–2 50m Run & Walk'],
          whenEn: '10/21–11/13 Prelim & Final Sprints | Today 11:00–11:20 G1–2 50m',
          ch: {
            powerEn: 'Physical Power',
            titleEn: '[Purple Track Quest] Starting-Gun Reaction Test',
            taskDescEn: 'Step into the blocks on our 6-lane purple track! Tap below to test your millisecond start reaction, then answer the sprint distances quiz:',
            actionBtnEn: '🔫 Start-Gun Reaction Test',
            reactReplayTextEn: '🔫 Retest Start-Gun Reaction',
            actionDoneEn: '⚡ BANG! Lightning launch down the purple track!',
            questionEn: 'On the 6-lane purple track with 50m, 60m, 100m, and 200m start lines, which distances do Lower, Middle, and Upper Grades race?',
            optionsEn: [
              'Only Upper Grades may run on the purple track',
              'Every grade runs 400m hurdles',
              'Lower (G1–2): 50m; Middle (G3–4): 60m/100m; Upper (G5–6): 100m/200m'
            ],
            explainEn: 'Right! G1–2 run 50m at 11:00–11:10 on Sports Day, G3–4 race 60m/100m, and G5–6 race 100m/200m!'
          }
        },
        s03i2: {
          nameEn: 'Finish-Line Chronometer Tower',
          descEn: 'Standing beside the finish tape, this digital timing tower records every millisecond from prelim heats to 6-lane finals.',
          factsEn: ['Heat Winner + Top 3 By Time', '6 Finalists per Division', '08:00–08:10 On-Time Check-In'],
          whenEn: '08:00–08:10 Check-In | 08:10–08:40 Timed Sprint Finals',
          ch: {
            powerEn: 'Physical Power',
            titleEn: '[Timing Tower Quest] Check-In & 6-Lane Advancement',
            taskDescEn: 'Tap the 3 steps in order from 08:00 athlete check-in to lining up the 6 finalists on our 6 lanes:',
            sequenceItemsEn: ['① 08:00 Roll-Call Check-In', '② 3 Heat Winners + Top 3 Times', '③ Top 6 Line Up in 6 Lanes'],
            actionBtnEn: '⏱️ Arm Finish-Line Timer',
            actionDoneEn: '⏱️ Chronometer zeroed and armed! All 6 finalists are set in their lanes!',
            questionEn: 'Each grade fields 3 boys & 3 girls per class across 3 prelim heats. How are the 6 finalists selected?',
            optionsEn: [
              'Draw lots to pack 20 runners onto the track',
              'Play rock-paper-scissors to pick finalists',
              'Top 1 from each of 3 heats (3) + next 3 fastest times = 6 finalists'
            ],
            explainEn: 'Spot on! 3 automatic heat winners (Q) plus 3 fastest qualifiers (q) fill all 6 purple lanes cleanly for the final!'
          }
        },
        s03i3: {
          nameEn: 'Sprint Heroes Honor Bulletin',
          descEn: 'Displays complete heats, lane assignments, times, and Top 6 finalists across all 16 G3–6 sprints (240 entries, 96 finalists)!',
          factsEn: ['240 G3–6 Sprinters Across 16 Events', '3 Heat Winners (Q) + 3 Fastest (q) Make Finals', 'Fastest Times: 4C Lin 9.90s · 6B Han 15.30s · 5B Cheng 31.27s'],
          whenEn: '11/10 (Tue) G3–4 Finals | 11/13 (Fri) G5–6 Finals Results Posted',
          ch: {
            powerEn: 'Physical Power',
            titleEn: '[Heroes Bulletin Quest] Unveil Pre-Day Sprint Champions',
            taskDescEn: 'Tap "📋 Post Sprint Finals Honor Roll" 3 times to unveil the 11/10 & 11/13 results, then answer the awards rule:',
            actionBtnEn: '📋 Post Sprint Finals Honor Roll',
            actionDoneEn: '🏅 Honor roll posted! All G3–6 60m, 100m, and 200m champions are officially on display!',
            questionEn: 'In each G3–6 individual sprint final (Top 6 boys & Top 6 girls), how are awards presented according to Meet Rules?',
            optionsEn: [
              'Top 3 earn Medals & Certificates; 4th–6th earn Certificates',
              'Only 1st place receives an award; others get none',
              'Everyone receives a movie ticket'
            ],
            explainEn: 'Correct! Top 3 receive medals & certificates, 4th–6th receive encouragement certificates, and each student enters at most 1 individual sprint event!'
          }
        }
      }
    },
    s04: {
      nameEn: 'Relay Arena',
      fullEn: 'Relay Arena · Class Relay Finals & Heritage Relay',
      gradeEn: 'Preschool, G3–6, Alumni, Staff & Parents',
      periodsEn: '11/25 G6 Done | Today 10:50 Pre, 11:20–11:40 G3–5, 12:00 Heritage',
      periodsShortEn: '11/25 | 10:50–12:00',
      leadEn: 'Team Power × Physical Power | 16-leg class relay tactical battles & 12:00 Da-Chuang Heritage Relay uniting all generations',
      summaryEn: 'Relay Arena draws the loudest cheers of the day! Each class fields 8 girls (Legs 1–8) and 8 boys (Legs 9–16): G3–4 run a half-lap (break at Leg 3), while G5–6 run a full lap (break at Leg 2). G6 finished on 11/25, leading into today’s 10:50 Preschool Relay, 11:20–11:40 G3–5 Finals, and 12:00 Heritage Relay!',
      keywordsEn: ['Team Power', 'Physical Power', 'Class Relay', 'Heritage Relay', 'Lane Break', 'Pass on Right', 'Pennant'],
      assessEn: 'Complete any Team Power relay quest here to earn your [Team Power Stamp].',
      skillsEn: ['Baton Exchange Sync', 'Breakline Tactics', 'Cross-Gen Heritage'],
      unitsEn: [
        { semEn: '11/25', weeksEn: 'Pre-Day Final', nameEn: 'Grade 6 Class Relay Final (Completed)' },
        { semEn: '10:50', weeksEn: 'Event 24', nameEn: 'Preschool Parent-Child Grand Relay' },
        { semEn: '11:20-11:40', weeksEn: 'Events 27–29', nameEn: 'Grade 3, Grade 4 & Grade 5 Class Relay Finals' },
        { semEn: '12:00', weeksEn: 'Event 30', nameEn: 'Da-Chuang Heritage Relay (Alumni, Faculty, Parents & Students)' }
      ],
      itemsEn: {
        s04i1: {
          nameEn: 'Giant Golden Baton Landmark',
          descEn: 'Twin golden and ocean-blue batons honoring the 12:00 Da-Chuang Heritage Relay—where alumni, teachers, parents, and students pass the school spirit forward.',
          factsEn: ['12:00 Heritage Relay', 'Alumni, Staff & Parents Race Together', 'Live Play-by-Play Sprint Coverage'],
          whenEn: '12:00–12:20 | Event 30: Da-Chuang Heritage Relay (Grand Finale Race)',
          ch: {
            powerEn: 'Team Power',
            titleEn: '[Golden Baton Quest] Light-Cued Acceleration Handoff',
            taskDescEn: 'The 12:00 Heritage Relay handoff is moments away! Watch the exchange-zone signal light and tap the instant it turns GREEN to accelerate:',
            actionBtnEn: '🚦 Watch Light & Accelerate',
            reactReplayTextEn: '🚦 Retest Signal-Light Acceleration',
            reactWaitTextEn: '🟡 YELLOW READY… Watch the light… (Tap on GREEN!)',
            reactGoTextEn: '🟢 GREEN LIGHT! Tap now to accelerate!',
            reactEarlyTextEn: '🔴 False start before green! Tap to reset light',
            reactDonePrefixEn: '⚡ Smooth acceleration handoff! Reaction: ',
            actionDoneEn: '🔥 Seamless speed match! Baton passed cleanly through the exchange zone!',
            questionEn: 'In both Class and Heritage Relays, when the outgoing runner sees the teammate cross the check mark, what is the key baton technique?',
            optionsEn: [
              'Stand still facing backwards waiting for the baton',
              'Accelerate inside the exchange zone to pass the baton at matching speed',
              'Toss the baton through the air to the next runner'
            ],
            explainEn: 'Pro technique! Accelerating in sync inside the exchange zone keeps momentum high and passes Da-Chuang’s 71st Team Power baton smoothly!'
          }
        },
        s04i2: {
          nameEn: 'Relay Breakline Curve Zone',
          descEn: 'Crucial tactical curve! G3–4 break for Lane 1 after Leg 3; G5–6 break after Leg 2. Always overtake ahead runners from their right (outer lane).',
          factsEn: ['Girls Legs 1–8 · Boys Legs 9–16', 'Middle Grades Half-Lap (Break Leg 3)', 'Upper Grades Full Lap (Break Leg 2)'],
          whenEn: '11/25 G6 Completed | Today 11:20–11:50 G3–5 Class Relay Finals',
          ch: {
            powerEn: 'Team Power',
            titleEn: '[Breakline Curve Quest] Relay Overtaking Tactics',
            taskDescEn: 'Tap the 3 tactical relay steps in sequence: Accelerate Exchange -> Break to Lane 1 -> Pass on the Right:',
            sequenceItemsEn: ['① Exchange Zone Acceleration', '② Break Cleanly into Lane 1', '③ Pass Ahead on Outer Right'],
            actionBtnEn: '🏃 Execute Curve Tactics',
            actionDoneEn: '⚡ Textbook curve tactics! Smooth Lane 1 break and clean outer-lane pass!',
            questionEn: 'Under the 71st Class Relay rules, which side must a runner use to overtake a competitor ahead?',
            optionsEn: [
              'Shout for them to step out of Lane 1',
              'Pass on the right (outer lane) of the runner ahead',
              'Shortcut across the inside grass field'
            ],
            explainEn: '100% right! Breaking on the designated leg and always overtaking on the right (outer lane) keeps every relay fast and safe!'
          }
        },
        s04i3: {
          nameEn: 'Alumni & Family Cheering Stands',
          descEn: 'Top 3 classes in each G3–6 relay earn honor pennants while classmates and parents pack the stands waving banners and cheering loudly.',
          factsEn: ['Top 3 Classes Win Pennants', '10:50 Preschool Family Relay', '11:20–11:40 G3–5 Finals'],
          whenEn: '10:50 Preschool Relay | 11:20–12:20 Non-Stop Stand Cheering',
          ch: {
            powerEn: 'Team Power',
            titleEn: '[Cheering Stands Quest] Stadium Wave Decibel Challenge',
            taskDescEn: 'Tap "📣 Wave Class Banners & Start Wave" 4 times to blast cheers to 100 dB, then answer the 16-leg relay lineup question!',
            actionBtnEn: '📣 Wave Banners & Cheer',
            actionDoneEn: '📣 Deafening 100 dB stadium roar fills our runners with unstoppable energy!',
            questionEn: 'Each G3–6 class enters 16 runners in the Class Relay (Top 3 win pennants). How are legs and lap distances divided?',
            optionsEn: [
              'Each runner runs 5 laps',
              'Teachers run all 16 legs for students',
              '8 girls run Legs 1–8 & 8 boys run Legs 9–16 (G3–4 half-lap; G5–6 full lap)'
            ],
            explainEn: 'Correct! 8 girls lead Legs 1–8 and 8 boys run Legs 9–16: G3–4 run a half-lap each (Leg 3 break) while G5–6 run a full lap each (Leg 2 break)!'
          }
        }
      }
    },
    s05: {
      nameEn: 'Fun Games Isle',
      fullEn: 'Fun Games Isle · 8 Knowledge Fun-Race Carnival',
      gradeEn: 'Preschool, Grades 1–6 & Parents',
      periodsEn: '09:30–10:40 Eight Fun-Race Events Back-to-Back',
      periodsShortEn: '09:30–10:40 (8 Fun Races)',
      leadEn: 'Knowledge Power | From String-a-Chain & Hula-Hoop Ironman to Family Ring Sprint—win with clever teamwork and coordination',
      summaryEn: 'Fun Games Isle turns the lawn into a joyful game carnival! From 09:30 to 10:40, eight Knowledge Power fun races roll out: Preschool "String-a-Chain", G3 "Towel-Ball Relay", G4 "Linked Can-Chain", G5 "Da-Chuang Leap Forward", G6 "Hula-Hoop Ironman", G2 "Every Grain Counts", G1 "Bouncing Tiggers", and 10:40 Family "Ring-Power Sprint"!',
      keywordsEn: ['Knowledge Power', 'Fun Races', 'String-a-Chain', 'Towel-Ball', 'Can-Chain', 'Da-Chuang Leap', 'Hula-Hoop Ironman', 'Every Grain Counts', 'Bouncing Tiggers', 'Ring Sprint'],
      assessEn: 'Complete any Knowledge Power fun-race quest here to earn your [Knowledge Power Stamp].',
      skillsEn: ['Smart Strategy', 'Hand-Eye Agility', 'Parent-Child Bond'],
      unitsEn: [
        { semEn: '09:30-09:50', weeksEn: 'Events 16–18', nameEn: 'Preschool "String-a-Chain", G3 "Towel-Ball Relay" & G4 "Linked Can-Chain"' },
        { semEn: '10:00-10:10', weeksEn: 'Events 19–20', nameEn: 'G5 "Da-Chuang Leap Forward" & G6 "Hula-Hoop Ironman"' },
        { semEn: '10:20-10:30', weeksEn: 'Events 21–22', nameEn: 'G2 "Every Grain Counts" & G1 "Bouncing Tiggers"' },
        { semEn: '10:40', weeksEn: 'Event 23', nameEn: 'Parent-Child Fun Race: "Ring-Power Sprint" (Families & Teachers)' }
      ],
      itemsEn: {
        s05i1: {
          nameEn: 'Colorful Fun-Race Pavilion',
          descEn: 'Equipment & staging hub where grade teachers check props and welcome each class onto the lawn for the 8 fun races.',
          factsEn: ['09:30–10:40 Eight Fun Races', 'Grade-Specific Game Props', 'Play-to-Learn Knowledge Power'],
          whenEn: '09:30–10:40 | Events 16–23: Fun-Race Staging HQ',
          ch: {
            powerEn: 'Knowledge Power',
            titleEn: '[Fun Pavilion Quest] Prop Check & Dispatch',
            taskDescEn: 'Tap "⛺ Inspect & Issue Fun-Race Props" 3 times to help teachers stage the equipment for all 8 events:',
            actionBtnEn: '⛺ Inspect & Issue Props',
            actionDoneEn: '⛺ All props staged cleanly! Eight fun races kick off right on schedule at 09:30!',
            questionEn: 'In our 71st program (Events 16–23, 09:30–10:40), which of the Five Powers do all eight fun races primarily represent?',
            optionsEn: [
              'Sleep Power',
              'Submarine Power',
              'Knowledge Power (coordination, clever strategy & teamwork)'
            ],
            explainEn: 'Right! All eight fun races (Events 16–23) showcase Knowledge Power—combining strategy, agility, and quick thinking!'
          }
        },
        s05i2: {
          nameEn: 'Hula-Hoop & Barrel Obstacle Zone',
          descEn: 'Showcases the game props for G6 Hula-Hoop Ironman, G5 Da-Chuang Leap Forward, G4 Linked Can-Chain, and G3 Towel-Ball Relay.',
          factsEn: ['09:40 G3 Towel-Ball Relay', '09:50 G4 Linked Can-Chain', '10:00 G5 Leap Forward & 10:10 G6 Hula-Hoop Ironman'],
          whenEn: '09:40–10:15 | Events 17–20: G3–G6 Fun Races',
          ch: {
            powerEn: 'Knowledge Power',
            titleEn: '[Obstacle Zone Quest] G3–G6 Prop Match-Up',
            taskDescEn: 'Tap the three grade prop stations in morning schedule order (09:40 -> 10:10):',
            sequenceItemsEn: ['① G3 Towel-Ball Relay', '② G4 Linked Can-Chain', '③ G5 Leap & G6 Hula-Hoop'],
            actionBtnEn: '⭕ Test G3–6 Game Props',
            actionDoneEn: '🧠 Top balance & clever technique! Every G3–6 prop course cleared!',
            questionEn: 'Between 09:40 and 10:10, which fun races belong to Grade 3 and Grade 6?',
            optionsEn: [
              'G3: Curling; G6: Pole Vault',
              'G3: Bouncing Tiggers; G6: String-a-Chain',
              'G3: Towel-Ball Relay; G6: Hula-Hoop Ironman'
            ],
            explainEn: 'Spot on! 09:40 G3 Towel-Ball Relay, 09:50 G4 Linked Can-Chain, 10:00 G5 Da-Chuang Leap Forward, and 10:10 G6 Hula-Hoop Ironman!'
          }
        },
        s05i3: {
          nameEn: 'Tigger & Family Photo Corner',
          descEn: 'Vibrant starting zone for Preschool String-a-Chain, G2 Every Grain Counts, G1 Bouncing Tiggers, and 10:40 Family Ring-Power Sprint.',
          factsEn: ['09:30 Preschool String-a-Chain', '10:20 G2 Grains & 10:30 G1 Tiggers', '10:40 Family Ring-Power Sprint'],
          whenEn: '09:30 Preschool | 10:20–10:40 Lower Grades & Family Sprint',
          ch: {
            powerEn: 'Knowledge Power',
            titleEn: '[Tigger Corner Quest] Triple Hop & Family Sprint',
            taskDescEn: 'Tap "🐯 Hop Along with Tigger!" 3 times to warm up, then identify the G2, G1, and Parent-Child fun races:',
            actionBtnEn: '🐯 Hop Along with Tigger!',
            actionDoneEn: '🐯 Three energetic hops! Smiles and laughter echo all across the grass!',
            questionEn: 'In order at 10:20, 10:30, and 10:40, what are the Grade 2, Grade 1, and Parent-Child fun races called?',
            optionsEn: [
              'All of them run 200m sprints',
              'Tug-of-War Tournament',
              'G2 Every Grain Counts, G1 Bouncing Tiggers & Family Ring-Power Sprint'
            ],
            explainEn: 'Correct! Together with Preschool "String-a-Chain" at 09:30, our youngest runners and parents share unforgettable lawn fun!'
          }
        }
      }
    },
    s06: {
      nameEn: 'Starlight Podium',
      fullEn: 'Starlight Podium · Medal Stage & Five-Power Certificate HQ',
      gradeEn: 'All Winners & Passport Challengers',
      periodsEn: '12:20 Closing Awards | All-Day Certificate Hub',
      periodsShortEn: '12:20 Closing | All Day',
      leadEn: 'All Five Powers | Sprint medals & certificates, class relay pennants, and your personalized Five-Power Gold Certificate at 5 stamps',
      summaryEn: 'Starlight Podium is the hall of fame for athletes and quest challengers alike! At the 12:20 Closing Ceremony, Principal Hsu Ya-Hui presents class relay pennants and honors. Once you collect all 5 stamps—Moral, Aesthetic, Physical, Team, and Knowledge—launch 3D Victory Fireworks and claim your personalized Gold Certificate!',
      keywordsEn: ['Closing Ceremony', 'Medal Podium', 'Pennants', 'Medals', 'Gold Certificate', 'Full Program'],
      assessEn: 'Collect all 5 Power Stamps to unlock 3D Victory Fireworks and your [Glory Run Gold Certificate]!',
      skillsEn: ['Honor & Pride', 'All-Around Five Powers', 'Mission Complete'],
      unitsEn: [
        { semEn: 'Individual', weeksEn: 'Grades 3–6', nameEn: 'Top 3 Boys & Girls win Medals + Certificates; 4th–6th win Certificates' },
        { semEn: 'Team Awards', weeksEn: 'Grades 3–6', nameEn: 'Top 3 Classes in Class Relay Finals awarded Honor Pennants' },
        { semEn: '12:20', weeksEn: 'Event 31', nameEn: 'Closing Ceremony (Principal Hsu Ya-Hui · Shared Campus Glory)' }
      ],
      itemsEn: {
        s06i1: {
          nameEn: '3-Tier Gold/Silver/Bronze Podium',
          descEn: 'Crowns our Top 6 finalists across 60m, 100m, and 200m sprints! Top 3 receive shining medals & certificates; 4th–6th receive certificates.',
          factsEn: ['Sprint Top 3: Medal + Certificate', 'Sprint 4th–6th: Certificate', 'Pride in Victory, Grace in Defeat'],
          whenEn: '12:20–12:50 | Event 31: Closing Ceremony Awards',
          ch: {
            powerEn: 'All Five Powers',
            titleEn: '[Medal Podium Quest] Champions Coronation Protocol',
            taskDescEn: 'Tap in sequence to cheer our Bronze, Silver, and Gold medalists ascending the Closing Ceremony podium:',
            sequenceItemsEn: ['🥉 Crown 3rd Place Bronze', '🥈 Crown 2nd Place Silver', '🥇 Crown 1st Place Gold'],
            actionBtnEn: '🥇 Begin Podium Ceremony',
            actionDoneEn: '🏅 The podium gleams with pride! Every athlete who gave their best is a Da-Chuang hero!',
            questionEn: 'What special team honor does each Top 3 class in the G3–6 Class Relay Finals receive from the school?',
            optionsEn: [
              'Class Honor Pennant',
              'A solid-gold racecar',
              'One month off school'
            ],
            explainEn: 'Right! Top 3 relay classes are awarded prestigious Honor Pennants—celebrating collective spirit!'
          }
        },
        s06i2: {
          nameEn: '71st Championship Mega Trophy',
          descEn: 'Showcases the G3–6 Class Relay honor pennants and the 71st Anniversary Perpetual Cup—symbolizing whole-class unity and effort.',
          factsEn: ['G3–6 Class Relay Pennants', '71st Five-Power Memorial Cup', 'Lights Up Isle Fireworks at 5 Stamps'],
          whenEn: '12:20 Closing Awards | 13:00 Event 32: Grounds Restoration',
          ch: {
            powerEn: 'Moral Power',
            titleEn: '[Champion Trophy Quest] Polish Cup & Field Cleanup',
            taskDescEn: 'Tap "✨ Polish 71st Championship Trophy" 3 times, then identify Event 32 at 13:00 that shows Moral Power from start to finish:',
            actionBtnEn: '✨ Polish Championship Trophy',
            actionDoneEn: '🏆 The trophy gleams like mirror gold, reflecting smiling faces across Da-Chuang!',
            questionEn: 'What is Event 32 (13:00), the final scheduled duty showing Da-Chuang’s Moral Power and care for our campus?',
            optionsEn: [
              'Dismantle the purple track',
              'Leave trash on the grass and head home',
              'Campus Grounds Restoration (Student & General Affairs leading schoolwide cleanup)'
            ],
            explainEn: 'Bravo! At 13:00, Event 32 "Campus Grounds Restoration" brings teachers and students together to leave our campus spotless—true Moral Power!'
          }
        },
        s06i3: {
          nameEn: 'All-Day Schedule Touch Kiosk',
          descEn: 'Digital kiosk with instant lookup for all 32 Sports Day events (08:00–13:00), 10/21–12/12 pre-day dates, and official Meet Rules.',
          factsEn: ['All 32 Main-Day Program Events', '10/21–11/25 Pre-Day Schedule', 'Filterable by Five Powers'],
          whenEn: '08:00–13:00 | Digital Schedule & Regulations Kiosk',
          ch: {
            powerEn: 'Knowledge Power',
            titleEn: '[Schedule Kiosk Quest] Unlock the 3-Stage Timeline',
            taskDescEn: 'Tap the three program phases—Morning Opening, Fun & Track, and Heritage & Closing—to sync the full 32-event timetable:',
            sequenceItemsEn: ['① 08:00 Openers & 08:35 Ceremony', '② 09:30 Fun Races & 11:00 Track', '③ 12:00 Heritage & 12:20 Closing'],
            actionBtnEn: '📅 Sync 3-Stage Program',
            actionDoneEn: '📅 All 32 Sports Day events and 16 sprint finals are synced to your kiosk!',
            questionEn: 'According to the 71st Sports Day official program, at what times are Event 05 (Opening Ceremony) and Event 31 (Closing Ceremony) held?',
            optionsEn: [
              'Opening Ceremony at 08:35; Closing Ceremony at 12:20',
              'Opening Ceremony at 12:00; Closing Ceremony at 12:05',
              'Opening Ceremony at 06:00; Closing Ceremony at 22:00'
            ],
            explainEn: 'Exact! Club openers begin at 08:00, Athletes March-In at 08:15, Opening Ceremony at 08:35, Closing Ceremony at 12:20, and Cleanup at 13:00!'
          }
        }
      }
    }
  };
  if (Array.isArray(sqData.islands)) {
    sqData.islands.forEach(isl => {
      const en = ISLAND_EN[isl.id];
      if (!en) return;
      isl.nameEn = en.nameEn;
      isl.fullEn = en.fullEn;
      isl.gradeEn = en.gradeEn;
      isl.periodsEn = en.periodsEn;
      isl.periodsShortEn = en.periodsShortEn;
      isl.leadEn = en.leadEn;
      isl.summaryEn = en.summaryEn;
      isl.keywordsEn = en.keywordsEn;
      isl.assessEn = en.assessEn;
      isl.skillsEn = en.skillsEn;
      if (Array.isArray(isl.units)) {
        isl.units.forEach((u, i) => {
          if (en.unitsEn[i]) Object.assign(u, en.unitsEn[i]);
        });
      }
      if (Array.isArray(isl.items)) {
        isl.items.forEach(it => {
          const ien = en.itemsEn[it.id];
          if (!ien) return;
          it.nameEn = ien.nameEn;
          it.descEn = ien.descEn;
          it.factsEn = ien.factsEn;
          it.whenEn = ien.whenEn;
          if (it.challenge && ien.ch) Object.assign(it.challenge, ien.ch);
        });
      }
    });
  }

  const FLOW_NOTES_EN = {
    f01: 'After the 08:35 Opening & Honors, Coubertin guides everyone to 02 Arts Stage for the 08:55 Six-Grade Dance Extravaganza.',
    f02: 'Warmed up from 09:25 Banana Boogie, Bruce Lee leads the prop crew west to 05 Fun Games Isle for 09:30 Fun Races!',
    f03: 'Following 10:40 Family Ring-Power Sprint, Michael Jordan escorts G1–2 sprinters onto the purple track for 11:00 50m races!',
    f04: 'With sprints complete, Chi Cheng leads G3–5 relay teams to 04 Relay Arena for the 11:20 Class Relay Finals!',
    f05: 'After the 12:00 Heritage Relay finish, Jesse Owens escorts relay pennants and medals to 06 Starlight Podium for 12:20 Closing!',
    f06: 'With all 5 stamps stamped, Yang Chuan-Kwang leads challengers back to 01 Grand Plaza to fire 3D fireworks & claim the Gold Certificate!'
  };
  if (Array.isArray(sqData.flows)) {
    sqData.flows.forEach(f => {
      if (FLOW_NOTES_EN[f.id]) f.noteEn = FLOW_NOTES_EN[f.id];
    });
  }

  const DAY_CYCLE_EN = [
    '08:00 Club Opening Shows (Dance · Taekwondo · Parasol)',
    '08:15 Athletes March-In & Opening Honors Ceremony',
    '08:55 Grades 1–6 Thematic Dances & Preschool Rhythm',
    '09:30–10:40 Eight Knowledge-Power Fun Races',
    '10:50 Preschool Relay & Lower Grades 50m Purple Track Sprint',
    '11:20 G3–5 Class Relays & 12:00 Heritage Relay',
    '12:20 Closing Awards Ceremony & 13:00 Campus Cleanup'
  ];
  if (Array.isArray(sqData.dayCycle)) {
    sqData.dayCycle.forEach((slot, idx) => {
      if (DAY_CYCLE_EN[idx]) slot.nameEn = DAY_CYCLE_EN[idx];
    });
  }

  const GLOSSARY_EN = {
    '七一大庄、五力飛揚': {
      termEn: "Da-Chuang's 71st: Soaring with the Five Powers",
      en: 'Official 71st Anniversary Sports Day theme representing Moral, Team, Aesthetic, Knowledge, and Physical Power.'
    },
    '六道紫色橡膠跑道': {
      termEn: '6-Lane Purple Rubber Track',
      en: 'Da-Chuang Elementary School’s signature 6-lane purple PU track marked for 50m, 60m, 100m, and 200m starts.'
    },
    '庄情薪傳接力賽': {
      termEn: 'Da-Chuang Heritage Relay',
      en: 'Traditional 12:00 finale race uniting alumni, faculty, Parents Association, and students passing the baton together.'
    },
    '搶跑道規則': {
      termEn: 'Breakline & Overtaking Rule',
      en: 'Middle Grades break for Lane 1 after Leg 3; Upper Grades break after Leg 2. Always overtake ahead runners from their right (outer lane).'
    }
  };
  if (Array.isArray(sqData.glossary)) {
    sqData.glossary.forEach(g => {
      const en = GLOSSARY_EN[g.term];
      if (en) Object.assign(g, en);
    });
  }

  if (sqData.gradeStory) {
    if (sqData.gradeStory['7']) {
      sqData.gradeStory['7'].titleEn = 'Lower Grades & Preschool | Joyful Start & Family Fun';
      sqData.gradeStory['7'].en = 'Preschool presents "Banana Boogie", "String-a-Chain" & Family Relay; G1 brings "Aim for Success" & "Bouncing Tiggers"; G2 performs "Big Dreamers" & "Every Grain Counts", then both hit the purple track at 11:00 for 50m Run & Walk!';
    }
    if (sqData.gradeStory['8']) {
      sqData.gradeStory['8'].titleEn = 'Middle Grades (G3–4) | Track Debut & Half-Lap Relays';
      sqData.gradeStory['8'].en = 'Grades 3–4 completed their 60m & 100m individual sprints ahead of Sports Day! On main day they showcase "Spring Blooms" & "Martial Leap", tackle "Towel-Ball" & "Linked Can-Chain", and race half-lap relays at 11:20!';
    }
    if (sqData.gradeStory['9']) {
      sqData.gradeStory['9'].titleEn = 'Upper Grades (G5–6) | Radiant Fans, 200m & Full-Lap Kings';
      sqData.gradeStory['9'].en = 'Grades 5–6 tackled 100m & 200m sprints (plus G6 Relay Final on 11/25)! On main day they open grade dances with "Radiant Fans" & "Festive Staff", conquer "Da-Chuang Leap" & "Hula-Hoop Ironman", and G5 storms full-lap relays at 11:40!';
    }
  }
  if (sqData.gradeGuide) {
    if (sqData.gradeGuide['7']) sqData.gradeGuide['7'].en = 'Lower Grades & Preschool Key Times: 09:05 G1–2 Dances · 09:25 Preschool Rhythm · 09:30/10:20/10:30 Fun Races · 10:50 Preschool Relay · 11:00–11:10 G1–2 50m Run & Walk.';
    if (sqData.gradeGuide['8']) sqData.gradeGuide['8'].en = 'Middle Grades Key Times: 10/21–11/10 60m/100m Sprints Completed · 09:15–09:20 G3–4 Dances · 09:40–09:50 Fun Races · 11:20–11:30 G3–4 Class Relay Finals.';
    if (sqData.gradeGuide['9']) sqData.gradeGuide['9'].en = 'Upper Grades Key Times: 10/27–11/13 100m/200m Sprints & 11/25 G6 Relay Completed · 08:55–09:00 G5–6 Dances · 10:00–10:10 Fun Races · 11:40 G5 Class Relay Final.';
  }

  const TOUR_EN = [
    'Stop 1 [01 Grand Plaza]: 08:15 Athletes March-In followed by Principal Hsu Ya-Hui’s Opening Ceremony and volunteer honors (Moral Power).',
    'Stop 2 [02 Arts Stage]: Watch Miki Street Dance, Taekwondo, Parasol Dance, all six grade dances, and Preschool Banana Boogie (Aesthetic Power).',
    'Stop 3 [05 Fun Games Isle]: 09:30–10:40 Eight energetic fun races from String-a-Chain and Towel-Ball to Hula-Hoop Ironman (Knowledge Power).',
    'Stop 4 [03 Sprint Track]: Step onto the 6-lane purple track (50m/60m/100m/200m) for G3–6 sprint champions and 11:00 G1–2 50m runs (Physical Power).',
    'Stop 5 [04 Relay Arena]: 11:20 G3–5 Class Relay Finals and the 12:00 Heritage Relay uniting alumni, staff, parents & students (Team Power).',
    'Final Stop [06 Starlight Podium]: Gather all 5 stamps, launch 3D Victory Fireworks at the Cauldron, and claim your Gold Certificate!'
  ];
  if (Array.isArray(sqData.tour)) {
    sqData.tour.forEach((t, idx) => {
      if (TOUR_EN[idx]) t.en = TOUR_EN[idx];
    });
  }

  const TRAVELER_ROLES_EN = {
    lower: ['Lower Grade Sprinter (G1–2)', 'Take on Bouncing Tiggers, Every Grain Counts & the 50m Purple Track Sprint!'],
    middle: ['Middle Grade Flyer (G3–4)', 'Conquer 60m/100m sprints, Towel-Ball Relay, Can-Chain & Half-Lap Relays!'],
    upper: ['Upper Grade Pacesetter (G5–6)', 'Lead Radiant Fans & Staff Dance, 100m/200m Finals & Full-Lap Relays!'],
    parent: ['Cheering Parent Supporter', 'Follow the 32-event schedule, Family Ring-Power Sprint & Heritage Relay!'],
    alumni: ['Distinguished Alumni Guest', 'Revisit the purple track and run together in the 12:00 Heritage Relay!']
  };
  if (sqData.travelers && Array.isArray(sqData.travelers.roles)) {
    sqData.travelers.roles.forEach(r => {
      const en = TRAVELER_ROLES_EN[r.id];
      if (en) {
        r.nameEn = en[0];
        r.hintEn = en[1];
      }
    });
    if (sqData.travelers.nick) {
      sqData.travelers.nick.ruleEn = sqData.travelers.nick.ruleEn || 'Up to 10 characters; saved only in this browser.';
    }
  }

  if (sqData.about) {
    sqData.about.sourceEn = 'Source: Hsinchu City Da-Chuang Elementary School 115th Academic Year & 71st Anniversary Sports Day Program & Regulations';
    if (Array.isArray(sqData.about.facts)) {
      const FACT_EN = [
        { kEn: 'Meet Theme', vEn: "Da-Chuang's 71st: Soaring with the Five Powers" },
        { kEn: 'Five Powers', vEn: 'Moral Power, Team Power, Aesthetic Power, Knowledge Power & Physical Power' },
        { kEn: 'Pre-Day Sprints', vEn: 'Oct 21 – Nov 25, 2026 (G3–6 60m/100m/200m Prelims & Finals; G6 Class Relay)' },
        { kEn: 'Main Sports Day', vEn: 'Saturday, Dec 12, 2026 | 08:00–13:00 (32 Complete Program Events)' }
      ];
      sqData.about.facts.forEach((f, idx) => {
        if (FACT_EN[idx]) Object.assign(f, FACT_EN[idx]);
      });
    }
    if (Array.isArray(sqData.about.sections) && sqData.about.sections[0]) {
      sqData.about.sections[0].titleEn = 'School Vision & the Five-Power Student Portrait';
      sqData.about.sections[0].bodyEn = [
        'Three Foundations of School Vision: [Gratitude], [Learning], and [Health].',
        'Three Curriculum Dimensions: [Gratitude & Care] (instructional excellence & innovation), [Learning & Inquiry] (striving & cooperation), and [Health & Vitality] (warm, supportive campus).',
        'Five-Power Student Portrait: Cultivating well-rounded 21st-century citizens balanced across Moral, Knowledge, Aesthetic, Physical, and Team Powers!',
        'WIN School Curriculum Framework: W · Striving & Surpassing Self (Knowledge inquiry), I · Kiln Life & Caring Growth (Moral & physical stewardship), N · Railway Heritage & Arts Trip (Aesthetic & joyful campus).'
      ];
    }
    if (Array.isArray(sqData.about.offices) && sqData.about.offices[0]) {
      sqData.about.offices[0].nameEn = 'Event Hosts & Organizing Staff';
      sqData.about.offices[0].dutiesEn = [
        'Overall Chair & Ceremonies: Principal Hsu Ya-Hui',
        'Club Openers MC: Teacher Ho Wei-Chieh',
        'Grade Dances MC: Teacher Chen Yi-Ling & Homeroom Teachers',
        'Preschool Parent-Child MC: Teacher Lee Ju-Ying',
        'Fun-Race MCs: Teachers Wang Chia-Wei, Chien Shu-Ling, Chen Chien-Hsin, Tsao Ya-Wen, Lin Jou-Hsien, Chiang Tsui-Hsia, Dir. Chi Yu-Chung & Chang Yung-Ming',
        'Track & Relay MCs: Teacher Chang Yung-Ming, Yang Tzu-Yi & Dir. Chi Yu-Chung',
        'Grounds Restoration: Office of Student Affairs & Office of General Affairs'
      ];
    }
  }

  if (sqData.honorKinds) {
    if (sqData.honorKinds.sprint) sqData.honorKinds.sprint.nameEn = 'Sprint Finals Heroes';
    if (sqData.honorKinds.relay) sqData.honorKinds.relay.nameEn = 'Class Relay Pennants';
    if (sqData.honorKinds.moral) sqData.honorKinds.moral.nameEn = 'Gratitude & Service Honors';
  }
  if (Array.isArray(sqData.honorTopics)) {
    const HT_EN = { sprint: 'Sprint Finals Heroes', relay: 'Class Relay Pennants', moral: 'Gratitude & Service Honors' };
    sqData.honorTopics.forEach(t => { if (HT_EN[t.id]) t.nameEn = HT_EN[t.id]; });
  }

  const NEWS_EN = {
    n01: {
      titleEn: '[All 16 Sprint Finals Completed] 48 Gold, Silver & Bronze Medalists Shine on the Purple Track!',
      summaryEn: 'All 16 Grade 3–6 individual sprints (60m/100m/200m) are officially complete! Congrats to all 96 finalists and our top 6 medal and certificate honorees!'
    },
    n02: {
      titleEn: '[Upper Boys Finals] 6B Han ○-Neng clocks 15.30s in 100m! 5B Cheng (31.27s) & 6A Yang (31.99s) strike 200m Gold!',
      summaryEn: 'Blazing upper-grade boys sprints! 6B Han ○-Neng sprinted a meet-best 15.30s in G6 100m, while 5B Cheng ○-Yi (31.27s) and 6A Yang ○-Han (31.99s) captured G5 & G6 200m gold!'
    },
    n03: {
      titleEn: '[Upper Girls Finals] 6B Hung ○-Yu dashes 16.25s for 100m Gold; Wang ○-Wen (33.53s) & Huang ○-Jou (33.75s) rule 200m!',
      summaryEn: 'Thrilling upper-grade girls finals! 6B Hung ○-Yu stormed 16.25s for G6 100m gold, while 6B Wang ○-Wen (33.53s) and 5A Huang ○-Jou (33.75s) powered to 200m victories!'
    },
    n04: {
      titleEn: '[Middle Boys Finals] 4C Lin ○-Chiao breaks 10s (9.92s) in 60m! 3A Hu ○-Wei wins G3 60m Gold in 10.17s!',
      summaryEn: 'Middle-grade boys brought the house down! 4C Lin ○-Chiao flew 9.92s—the sole sub-10s 60m clock—while 3A Hu ○-Wei claimed G3 60m gold in 10.17s!'
    },
    n05: {
      titleEn: '[Middle Girls 60m Finals] 4A Huang ○-Hsin (10.60s) & 3C Chiang ○-Yun (11.06s) sprint to Gold!',
      summaryEn: 'Fast middle-grade girls 60m duels saw 4A Huang ○-Hsin take G4 60m gold in 10.60s and 3C Chiang ○-Yun claim G3 gold in 11.06s!'
    },
    n06: {
      titleEn: '[Middle Boys 100m Finals] 4C Han ○-Yen wins in 16.22s; 3E Pan ○-Chieh takes G3 100m Crown in 17.99s!',
      summaryEn: '4C Han ○-Yen sprinted 16.22s for G4 Boys 100m gold, and 3E Pan ○-Chieh surged across the line in 17.99s to win Grade 3!'
    },
    n07: {
      titleEn: '[Middle Girls 100m Finals] 4D Lee ○-Hsi (17.87s) & 3A Liu ○-Tzu (19.17s) crowned 100m Champions!',
      summaryEn: '4D Lee ○-Hsi won G4 Girls 100m in 17.87s while 3A Liu ○-Tzu claimed the Grade 3 Girls 100m crown in 19.17s!'
    },
    n08: {
      titleEn: '[12:00 Heritage Relay Finale] Alumni, Staff, Parents Association & Students pass the Da-Chuang Baton!',
      summaryEn: 'Event 30 caps the day with four united squads—Alumni, Faculty, Parents Association & Current Students—carrying Da-Chuang’s 71st spirit across the track!'
    },
    n09: {
      titleEn: '[Class Relay Finals] 11:20 G3–5 Class Relays feature 16-runner squads & right-side passing rules!',
      summaryEn: 'With 8 girls running Legs 1–8 and 8 boys running Legs 9–16, middle grades break at Leg 3 and Grade 5 breaks at Leg 2 in an electrifying battle for pennants!'
    },
    n10: {
      titleEn: '[Fun Races Extravaganza] Eight Knowledge-Power Lawn Games kick off at 09:30 for Preschool through Families!',
      summaryEn: 'String-a-Chain, Bouncing Tiggers, Every Grain Counts, Towel-Ball, Linked Can-Chain, Da-Chuang Leap, Hula-Hoop Ironman & Ring-Power Sprint bring laughter for all!'
    },
    n11: {
      titleEn: '[Six-Grade Dance Showcase] From Radiant Fans to Banana Boogie, all grades light up the stage from 08:55!',
      summaryEn: 'Crimson-gold fans, martial staffs, spring blossoms, and upbeat preschoolers turn Breeze Rhythm Open-Air Stage into a celebration of Aesthetic Power!'
    },
    n12: {
      titleEn: '[Opening & March-In] Classes stride through the Rainbow Arch at 08:15 as Principal Hsu honors campus volunteers!',
      summaryEn: 'Spirited march-ins greet the grandstand before Principal Hsu Ya-Hui presents certificates to Parents Association officers, benefactors & senior volunteers!'
    }
  };
  if (Array.isArray(sqData.news)) {
    sqData.news.forEach(n => {
      const en = NEWS_EN[n.id];
      if (en) Object.assign(n, en);
    });
  }

  function translateRaceTitle(rName) {
    const m = String(rName).match(/^([一二三四五六])年級([男女])生組\s*(\d+)\s*公尺$/);
    if (!m) return rName;
    const g = GRADE_DIGIT[m[1]] || m[1];
    const sx = m[2] === '男' ? 'Boys' : 'Girls';
    return `Grade ${g} ${sx} ${m[3]}m`;
  }

  function fmtAwardLine(partsZh) {
    // Convert string containing medals & rank labels like "🥇金牌：三甲 胡○瑋 (10.17s)｜..."
    return String(partsZh)
      .replace(/🥇金牌：/g, '🥇 Gold: ')
      .replace(/🥈銀牌：/g, '🥈 Silver: ')
      .replace(/🥉銅牌：/g, '🥉 Bronze: ')
      .replace(/第\s*(\d+)\s*名：/g, (_, n) => `${n}th: `)
      .replace(/未出賽：/g, 'DNS: ')
      .replace(/\(未出賽\)/g, '(DNS)')
      .replace(/｜/g, ' | ')
      .replace(/([三四五六][甲乙丙丁戊])\s+([^\s()|]+○+[^\s()|]*)/g, (_, c, nm) => `${enClassName(c)} ${romanizeMaskedName(nm)}`);
  }

  if (Array.isArray(sqData.honors)) {
    sqData.honors.forEach(h => {
      if (h.id.startsWith('h_ir')) {
        const m = String(h.title).match(/【決賽英雄榜】([^：]+)：🥇([三四五六][甲乙丙丁戊])\s+([^\s()]+)\s+\(([^)]+)\)/);
        if (m) {
          h.titleEn = `[Finalists] ${translateRaceTitle(m[1])}: 🥇 ${enClassName(m[2])} ${romanizeMaskedName(m[3])} (${m[4]}) Gold!`;
        } else {
          h.titleEn = fmtAwardLine(h.title);
        }
        h.awardEn = fmtAwardLine(h.award);
        h.orgEn = fmtAwardLine(h.org);
      } else if (h.id === 'h_relay_g6') {
        h.titleEn = '[Completed] Grade 6 Class Relay Final (Girls Legs 1–8, Boys Legs 9–16, 1 lap each)';
        h.awardEn = 'Top 3 Classes awarded Honor Pennants';
        h.orgEn = '11/25 (Wed) 08:10–08:20 Completed (Leg 2 break into Lane 1)';
      } else if (h.id === 'h_relay_g345') {
        h.titleEn = 'Grades 3, 4 & 5 Class Relay Finals (11:20 G3 | 11:30 G4 | 11:40 G5)';
        h.awardEn = 'Top 3 Classes per grade awarded Honor Pennants';
        h.orgEn = 'G3–4 half-lap each (Leg 3 break) · G5 full lap each (Leg 2 break)';
      } else if (h.id === 'h_relay_legend') {
        h.titleEn = 'Da-Chuang Heritage Relay (12:00 Alumni, Faculty, Parents & Students)';
        h.awardEn = '71st Anniversary Cross-Generation Heritage Honor';
        h.orgEn = '115th Academic Year & 71st Anniversary Special Exhibition Race';
      } else if (h.id === 'h_moral_service') {
        h.titleEn = 'Parents Assoc. Certificates, Benefactor Plaques & Senior Volunteer Honors (08:50–08:54)';
        h.awardEn = 'Moral Power Exemplar Commendation';
        h.orgEn = 'Presented personally by Principal Hsu Ya-Hui';
      }
    });
  }

  if (Array.isArray(sqData.individualRaces)) {
    sqData.individualRaces.forEach(r => {
      r.nameEn = translateRaceTitle(r.name);
      r.gradeLabelEn = enClassName(r.gradeLabel);
      r.prelimDateEn = String(r.prelimDate || '').replace(/^115\./, '2026.');
      r.finalDateEn = String(r.finalDate || '').replace(/^115\./, '2026.');
      if (Array.isArray(r.finalists)) {
        r.finalists.forEach(f => {
          f.classNameEn = enClassName(f.className);
          f.nameEn = romanizeMaskedName(f.name);
          const isDns = f.finalRankLabel === '未出賽' || f.finalScore === '未出賽';
          f.finalRankLabelEn = isDns ? 'DNS' :
            (f.finalRank === 1 ? '1st' : f.finalRank === 2 ? '2nd' : f.finalRank === 3 ? '3rd' : `${f.finalRank}th`);
          f.awardEn = (f.award === '未出賽' || isDns) ? 'DNS' :
            f.finalRank === 1 ? '🥇 Gold (1st)' :
            f.finalRank === 2 ? '🥈 Silver (2nd)' :
            f.finalRank === 3 ? '🥉 Bronze (3rd)' :
            `${f.finalRank}th`;
          f.finalLaneEn = String(f.finalLane || '').replace(/^第?\s*(\d+)\s*道$/, 'Lane $1');
          f.prelimHeatEn = String(f.prelimHeat || '').replace(/^第\s*(\d+)\s*組$/, 'Heat $1');
          f.prelimLaneEn = String(f.prelimLane || '').replace(/^第?\s*(\d+)\s*道$/, 'L$1');
          f.prelimStatusEn = f.prelimStatus === '晉級 (Q)' ? 'Heat Winner (Q)' : f.prelimStatus === '擇優晉級 (q)' ? 'Fastest Time (q)' : (f.prelimStatus === '未出賽' ? 'DNS' : f.prelimStatus);
          if (f.finalScore === '未出賽') f.finalScoreEn = 'DNS';
          if (f.prelimScore === '未出賽') f.prelimScoreEn = 'DNS';
        });
      }
      if (Array.isArray(r.athletes)) {
        r.athletes.forEach(a => {
          a.classNameEn = enClassName(a.className);
          a.nameEn = romanizeMaskedName(a.name);
          a.heatEn = String(a.heat || '').replace(/^第\s*(\d+)\s*組$/, 'H$1');
          a.laneEn = String(a.lane || '').replace(/^第?\s*(\d+)\s*道$/, 'L$1');
          a.heatRankEn = a.heatRank === '未出賽' ? 'DNS' : String(a.heatRank || '').replace(/^第\s*(\d+)\s*名$/, '#$1');
          a.qualifiedEn = a.qualified === '晉級 (Q)' ? 'Auto (Q)' : a.qualified === '擇優晉級 (q)' ? 'Time (q)' : '';
          if (a.finalRank) {
            a.finalRankEn = a.finalRank === '未出賽' ? 'DNS' :
              String(a.finalRank).replace(/^第\s*(\d+)\s*名$/, (_, n) => (n === '1' ? '1st' : n === '2' ? '2nd' : n === '3' ? '3rd' : `${n}th`));
          }
          if (a.finalScore === '未出賽') a.finalScoreEn = 'DNS';
          if (a.score === '未出賽') a.scoreEn = 'DNS';
        });
      }
    });
  }

  return sqData;
}

module.exports = { applyEnglishData, romanizeMaskedName, enClassName };
