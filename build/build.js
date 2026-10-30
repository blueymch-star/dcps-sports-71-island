// 產生 sports-quest-island/index.html：以大庄 3D 引擎為底，植入「七一大庄、五力飛揚」6 島 19 地標、六道紫色跑道、五力集章護照、32項程序表與3D勝利煙火證書系統
// 用法：node build/build.js
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'dazhuang-island', 'index.html');
const OUT = path.join(__dirname, '..', 'index.html');

let html = fs.readFileSync(SRC, 'utf8');

// ---- 1. 取出原 DATA 的 roles / carries / evidence / phases ----
const lines = html.split('\n');
const dStart = lines.findIndex(l => l.startsWith('const DATA = {'));
const dEnd = lines.findIndex((l, i) => i > dStart && l.startsWith('// ================= A｜SCENE'));
if (dStart < 0 || dEnd < 0) throw new Error('找不到 DATA 區段');

const orig = new Function(lines.slice(dStart, dEnd).join('\n') + '\nreturn DATA;')();
const sqData = require('./data.js');

const roles = {
  ...JSON.parse(JSON.stringify(orig.roles)),
  ...(sqData.customRoles || {})
};
roles.student.look = '大庄運動服';

const DATA = {
  ...sqData,
  evidence: orig.evidence,
  phases: {
    1: { name: '開幕與律動 (08:00–09:25)', nameEn: 'Opening & Dance (08:00–09:25)' },
    2: { name: '趣味與徑賽 (09:30–12:00)', nameEn: 'Fun Games & Track (09:30–12:00)' },
    3: { name: '薪傳與閉幕 (12:00–13:00)', nameEn: 'Relay & Awards (12:00–13:00)' }
  },
  carries: orig.carries,
  roles,
  travelers: {
    ...orig.travelers,
    roles: sqData.travelers.roles,
    nick: orig.travelers.nick
  }
};

// ---- 2. 嚴格校驗外鍵閉包（islands, items, flows, dayCycle） ----
const knownModels = [
  'academy', 'stall', 'busstop', 'pavilion', 'library', 'bigbook', 'stage', 'river', 'lab', 'clock',
  'court', 'coin', 'observatory', 'classroom', 'globe', 'house', 'bikerack', 'clinic', 'flowerbed',
  'farm', 'track', 'tent', 'archgate', 'concert', 'robot', 'bank', 'newsroom', 'windvane', 'flagpole',
  'podium', 'lectern', 'parade', 'kiln', 'archery', 'teeball', 'mullet', 'smartclass', 'tennis',
  // 本專案新增客製 3D 模型
  'torch_altar', 'fan_ribbon', 'bulletin', 'baton_relay', 'stand', 'hula_barrel', 'mascot_corner',
  'podium_award', 'trophy_cup', 'calendar_kiosk'
];

const islandIds = new Set(DATA.islands.map(d => d.id));
const itemIds = new Set();
DATA.islands.forEach(d => {
  if (!roles[d.host]) throw new Error('Unknown host role: ' + d.host);
  d.items.forEach(it => {
    if (!knownModels.includes(it.model)) throw new Error('Unknown 3D model: ' + it.model);
    itemIds.add(it.id);
  });
});
DATA.flows.forEach(f => {
  if (!islandIds.has(f.from) || !islandIds.has(f.to)) throw new Error('Invalid flow island: ' + f.id);
  f.crew.forEach(c => { if (!roles[c]) throw new Error('Unknown crew role: ' + c); });
  if (!DATA.carries[f.carry]) throw new Error('Unknown carry: ' + f.carry);
});
DATA.dayCycle.forEach(s => {
  s.items.forEach(i => { if (!itemIds.has(i)) throw new Error('Unknown dayCycle item: ' + i); });
});

const dataJs = '// ================= DATA：奔馳榮耀島・校慶運動大冒險（由 build/build.js 產生） =================\nconst DATA = ' + JSON.stringify(DATA, null, 2) + ';\n\n';
html = lines.slice(0, dStart).join('\n') + '\n' + dataJs + lines.slice(dEnd).join('\n');

// ---- 3. 注入客製 3D 模型與六道立體紫色橡膠跑道 (track: kitMPurpleTrack) ----
const modelsCode = fs.readFileSync(path.join(__dirname, 'models.js'), 'utf8');
const rep = (a, b, all = false) => {
  if (!html.includes(a)) throw new Error('找不到目標字串：' + a.slice(0, 80));
  html = all ? html.split(a).join(b) : html.replace(a, b);
};

rep('function kitModel(name) {', modelsCode + '\nfunction kitModel(name) {');
rep('track: kitMTrack,', 'track: kitMPurpleTrack,');
rep(
  'smartclass: kitMSmartclass, tennis: kitMTennis',
  'smartclass: kitMSmartclass, tennis: kitMTennis,\n    torch_altar: kitMTorchAltar, fan_ribbon: kitMFanRibbon, bulletin: kitMBulletin, baton_relay: kitMBatonRelay, stand: kitMStand, hula_barrel: kitMHulaBarrel, mascot_corner: kitMMascotCorner, podium_award: kitMPodiumAward, trophy_cup: kitMTrophyCup, calendar_kiosk: kitMCalendarKiosk'
);

// ---- 4. 更新標題、Meta 與預設導覽順序 ----
rep('<title>大庄．窯海島</title>', '<title>奔馳榮耀島・校慶運動大冒險｜大庄國小 71 週年校慶「七一大庄、五力飛揚」</title>');
rep(
  '<meta name="description" content="新竹市香山區大庄國小的特色課程與年度活動，做成 14 座可以逛的 3D 小島：柴窯陶藝、射箭、樂樂棒球、食魚教育與永續智慧教室。">',
  '<meta name="description" content="新竹市香山區大庄國民小學「七一大庄、五力飛揚」71 週年校慶運動會 3D 動態島：踏上六道立體紫色橡膠跑道，領取五力集章護照，探索 32 項程序表與賽前個人賽英雄榜，引燃全景 3D 勝利煙火！">'
);
rep(
  '<meta property="og:title" content="大庄．窯海島｜大庄國小特色課程與年度活動">',
  '<meta property="og:title" content="奔馳榮耀島・校慶運動大冒險｜大庄國小 71 週年校慶">'
);
rep(
  "return ['z10', 'z01', 'z02', 'z11', 'z03', 'z04', 'z09', 'z12', 'z05', 'z06', 'z07', 'z08', 'z13', 'z14']",
  "return ['s01', 's02', 's05', 's03', 's04', 's06']"
);
rep("'dzps-tour-v1'", "'sq-tour-v1'", true);
rep("'dzps-big'", "'sq-big'", true);
rep("'dzps-traveler'", "'sq-traveler'", true);
rep("'dzps-passport'", "'sq-passport'", true);

// 調整 3D 海水與天空為更清爽的「香山海風藍 ✕ 青草地綠」色調
rep(
  'uShallow: { value: new THREE.Color(0xa4d4da) }, uDeep: { value: new THREE.Color(0x6fa9b8) }',
  'uShallow: { value: new THREE.Color(0x7dd3fc) }, uDeep: { value: new THREE.Color(0x0284c7) }'
);

// ---- 4b. 為 6 位運動歷史傳奇巨星設定專屬 3D 運動造型 (wkLook) ----
rep(
  "coubertin: { style: 'suit', robe: '#36363e', tie: '#8a2f34', hair: '#3a2e28', mustache: 'handlebar', extra: 'torch' },",
  `coubertin: { style: 'suit', robe: '#0284c7', tie: '#f59e0b', hair: '#3a2e28', mustache: 'handlebar', extra: 'torch' },
  brucelee: { style: 'uniform', robe: '#facc15', pants: '#1e293b', hair: '#111827', extra: 'bamboo' },
  chicheng: { style: 'uniform', robe: '#dc2626', pants: '#1e3a8a', hat: 'cap', hair: '#1f2937', extra: 'clipboard' },
  owens: { style: 'uniform', robe: '#f59e0b', pants: '#1e293b', hat: 'laurel', hair: '#111827', extra: 'torch' },
  jordan: { style: 'uniform', robe: '#e11d48', pants: '#111827', hairStyle: 'bald', hair: '#111827', extra: 'blocks' },
  yangck: { style: 'uniform', robe: '#0ea5e9', pants: '#0f172a', hat: 'laurel', hair: '#1f2937', extra: 'torch' },`
);
rep(
  "const wkWho = { student: ['同學', 'A student'], teacher: ['老師', 'A teacher'], parent: ['家長', 'A parent'], volunteer: ['志工', 'A volunteer'], scout: ['童軍', 'A scout'] };",
  "const wkWho = { student: ['大庄小選手', 'An athlete'], teacher: ['裁判老師', 'A coach'], parent: ['應援家長', 'A parent'], volunteer: ['校慶志工', 'A volunteer'], scout: ['聖火護衛隊', 'A torch guard'] };"
);

// ---- 4c. 全面替換基底模板殘留的「特色課程／教育家」文字為「71 週年校慶運動會／運動傳奇明星」主題 ----
rep('<div class="loader-title" data-en="Dazhuang · Kiln & Sea Isles">大庄．窯海島</div>', '<div class="loader-title" data-en="Da-Chuang 71st · Sports Quest Island">奔馳榮耀島・校慶運動大冒險</div>');
rep('<div id="loader-msg" data-en="Assembling the Dazhuang campus…">正在組合大庄校園…</div>', '<div id="loader-msg" data-en="Preparing the 6-lane purple track & 5-power arenas…">正在鋪設六道紫色跑道與五力賽場…</div>');

// 頂部品牌卡、工具列與快速入口
rep('<div class="ui-eyebrow" id="ui-brand-eyebrow" data-en="9 SIGNATURE COURSES · 5 YEARLY EVENTS">9 門特色課程 · 5 個年度活動</div>', '<div class="ui-eyebrow" id="ui-brand-eyebrow" data-en="DA-CHUANG 71ST · 6 ARENA ISLES · 32 EVENTS">71 週年校慶 · 6 座五力賽場島 · 32 項程序</div>');
rep('<h1 class="ui-brand-title" id="ui-brand-title" data-en="Dazhuang · Kiln & Sea Isles">大庄．窯海島</h1>', '<h1 class="ui-brand-title" id="ui-brand-title" data-en="Sports Quest Island">奔馳榮耀島・校慶運動大冒險</h1>');
rep('<div class="ui-brand-sub" id="ui-brand-sub" data-en="Dazhuang ES · Flexible curriculum &amp; yearly events">大庄國小・特色課程與年度活動</div>', '<div class="ui-brand-sub" id="ui-brand-sub" data-en="Da-Chuang\'s 71st: Soaring with the Five Powers">七一大庄、五力飛揚｜71 週年校慶運動會</div>');
rep(
  `$('ui-brand-eyebrow').textContent = tr(\`\${nC} 門特色課程 · \${nE} 個年度活動\`, \`\${nC} SIGNATURE COURSES · \${nE} YEARLY EVENTS\`);`,
  `$('ui-brand-eyebrow').textContent = tr('71 週年校慶 · 6 座五力賽場島 · 32 項程序', '71ST ANNIVERSARY · 6 ARENA ISLES · 32 EVENTS');`
);
rep(
  `q.querySelector('[data-quick="courses"]').innerHTML = tr(\`<b>\${nC}</b> 門課程\`, \`<b>\${nC}</b> courses\`);`,
  `q.querySelector('[data-quick="courses"]').innerHTML = tr(\`<b>\${nC}</b> 座競賽展演島\`, \`<b>\${nC}</b> arena isles\`);`
);
rep(
  `q.querySelector('[data-quick="events"]').innerHTML = tr(\`<b>\${nE}</b> 個活動\`, \`<b>\${nE}</b> events\`);`,
  `q.querySelector('[data-quick="events"]').innerHTML = tr(\`<b>\${nE}</b> 座典禮接力島\`, \`<b>\${nE}</b> ceremony isles\`);`
);
rep(
  '<button class="ui-btn ui-tool ui-tool-grade" id="ui-btn-grade" type="button" aria-pressed="false" data-en-title="Courses by grade" title="依年級看"><span class="ui-ic" data-icon="grade"></span><span class="ui-btn-txt" data-en="By grade">依年級看</span></button>',
  '<button class="ui-btn ui-tool ui-tool-grade" id="ui-btn-grade" type="button" aria-pressed="false" data-en-title="Events by grade" title="依年級看賽程"><span class="ui-ic" data-icon="grade"></span><span class="ui-btn-txt" data-en="By grade">依年級看賽程</span></button>'
);
rep(
  '<button class="ui-btn ui-tool" id="ui-btn-journey" type="button" data-en-title="Six-year journey" title="六年旅程"><span class="ui-ic" data-icon="play"></span><span class="ui-btn-txt" data-en="6-yr journey">六年旅程</span></button>',
  '<button class="ui-btn ui-tool" id="ui-btn-journey" type="button" data-en-title="Sports Day Tour" title="運動會全覽"><span class="ui-ic" data-icon="play"></span><span class="ui-btn-txt" data-en="Full Tour">運動會全覽</span></button>'
);
rep(
  '<button class="ui-btn ui-tool" id="ui-btn-news" type="button" aria-pressed="false" data-en-title="Campus news" title="校園動態"><span class="ui-ic" data-icon="news"></span><span class="ui-btn-txt" data-en="News">新聞</span></button>',
  '<button class="ui-btn ui-tool" id="ui-btn-news" type="button" aria-pressed="false" data-en-title="Race news & honors" title="賽況與英雄榜"><span class="ui-ic" data-icon="news"></span><span class="ui-btn-txt" data-en="Race News">賽況</span></button>'
);
rep(
  '<button class="ui-btn ui-tool" id="ui-btn-about" type="button" data-en-title="About Dazhuang" title="關於大庄"><span class="ui-ic" data-icon="school"></span><span class="ui-btn-txt" data-en="About">關於</span></button>',
  '<button class="ui-btn ui-tool" id="ui-btn-about" type="button" data-en-title="About Sports Day" title="大會簡介"><span class="ui-ic" data-icon="school"></span><span class="ui-btn-txt" data-en="About">大會</span></button>'
);
rep(
  '<button class="ui-qk ui-qk-grade" type="button" data-quick="grade" data-en="By grade ›">依年級看 ›</button>',
  '<button class="ui-qk ui-qk-grade" type="button" data-quick="grade" data-en="By grade ›">依年級看賽程 ›</button>'
);
rep(
  '<button class="ui-qk ui-qk-journey" type="button" data-quick="journey" data-en="▶ 6-yr journey">▶ 六年旅程</button>',
  '<button class="ui-qk ui-qk-journey" type="button" data-quick="journey" data-en="▶ Full Tour">▶ 運動會全覽</button>'
);

// 歡迎導覽卡 (#ui-tour) — 使用者截圖回報的重點區塊
rep(
  `<button class="ui-btn ui-btn-primary" id="ui-tour-skip" type="button" data-en="Courses by grade">依年級看課程</button>
      <button class="ui-btn" id="ui-tour-journey" type="button" data-en="▶ 6-yr journey">▶ 六年旅程</button>
      <button class="ui-btn" id="ui-tour-next" type="button" data-en="Explore the map">直接逛地圖</button>`,
  `<button class="ui-btn ui-btn-primary" id="ui-tour-skip" type="button" data-en="Events by grade">依年級看賽程</button>
      <button class="ui-btn" id="ui-tour-journey" type="button" data-en="▶ Sports Day Tour">▶ 運動會全覽</button>
      <button class="ui-btn" id="ui-tour-next" type="button" data-en="Explore the arenas">直接逛賽場</button>`
);
rep(
  `$('ui-tour-title').textContent = land ? tr('想知道孩子幾年級上什麼？', 'What does each grade take?') : tr('先看孩子這個年級上什麼', 'Start with your child’s grade');`,
  `$('ui-tour-title').textContent = land ? tr('想查看各年級參賽與表演時程？', 'Check your grade schedule?') : tr('歡迎蒞臨「七一大庄・五力飛揚」校慶運動會！', 'Welcome to Da-Chuang 71st Sports Day!');`
);
rep(
  `$('ui-tour-text').textContent = tr(\`每座島是一門特色課程（\${nC} 門）或一個年度活動（\${nE} 個）。按「依年級看課程」看低、中、高年級各上什麼、怎麼評量；也可以看「六年旅程」，或直接\${uiIsMobile() ? '點' : '點選'}島名。\`, \`Each isle is a course (\${nC}) or a yearly event (\${nE}). Pick a grade to see its courses and how they’re assessed, watch the six-year journey, or just tap an isle.\`);`,
  `$('ui-tour-text').textContent = tr('全場共 6 座五力主題賽場島（含六道立體紫色橡膠跑道與 32 項程序）。按「依年級看賽程」可查低、中、高年級參賽項目，或播放「運動會全覽」，並點選上方「五力集章護照」闖關領取金牌證書！', 'Explore 6 Five-Power Sports Day arena isles with the 6-lane purple track and 32 program events. Check schedules by grade, watch the guided tour, or complete the 5-Power Quest Passport!');`
);

// 右側清單與搜尋面板 (#ui-side)
rep('<div class="ui-eyebrow" data-en="DIRECTORY · TEXT VERSION">校園目錄・文字版</div>', '<div class="ui-eyebrow" data-en="ARENA DIRECTORY">運動會賽區目錄</div>');
rep('placeholder="搜尋課程、單元、新聞、教育家…"', 'placeholder="搜尋賽程、趣味競賽、紫色跑道、運動明星…"');
rep('<button class="ui-tab" role="tab" id="ui-tab-themes" aria-selected="true" aria-controls="ui-side-list" type="button" data-en="Isles">課程與活動</button>', '<button class="ui-tab" role="tab" id="ui-tab-themes" aria-selected="true" aria-controls="ui-side-list" type="button" data-en="Arena Isles">六大賽區島嶼</button>');
rep('<button class="ui-tab" role="tab" id="ui-tab-flows" aria-selected="false" tabindex="-1" aria-controls="ui-side-list" type="button" data-en="Isle stories">島與島的故事</button>', '<button class="ui-tab" role="tab" id="ui-tab-flows" aria-selected="false" tabindex="-1" aria-controls="ui-side-list" type="button" data-en="Relay routes">賽場動線與傳承</button>');
rep('課程：大庄國小 公開課程資訊與校園新聞；新聞：新竹市教育新聞網・本站為教學展示，非學校官方網站。', '依據：新竹市香山區大庄國小 115 學年度暨 71 週年校慶運動會程序表與競賽規程・本站為 3D 互動導覽展示。', true);
rep("tr('特色課程', 'SIGNATURE COURSES')", "tr('五力競賽與展演島', 'COMPETITION & SHOW ISLES')", true);
rep("tr('年度活動', 'YEARLY EVENTS')", "tr('校慶典禮與接力島', 'CEREMONY & RELAY ISLES')", true);
rep("tr('這個條件下沒有課程。', 'No courses match.')", "tr('這個條件下沒有符合的賽區。', 'No arena isles match.')");
rep("tr('這個年級沒有專屬的年度活動。', 'No yearly events for this grade.')", "tr('這個年級沒有專屬的典禮島。', 'No ceremony isles for this grade.')");
rep("tr('低年級,高年級,陶藝,射箭,樂樂棒球,得獎', 'Grade 7,AI,club,reading,sports')", "tr('紫色跑道,大隊接力,趣味競賽,扇耀舞台,紀政,李小龍', 'Purple track,Relay,Fun games,Dance,Chi Cheng,Bruce Lee')");
rep("tr('島與島的故事是讓地圖生動的故事設定；實線＝課程計畫寫明，其他是延伸連結。', 'Isle stories are a story layer; solid lines are written in the curriculum plan, others are further links.')", "tr('6 位世界運動傳奇巨星（古柏坦、李小龍、紀政、歐文斯、喬丹、楊傳廣）擔任各島島主，帶領大庄親師生在賽場間傳遞聖火與賽事裝備！', 'Six sports legends lead Dazhuang athletes and families across the six Sports Day arenas.')");

// 依年級看卡片 (gradeCard)
rep("tr(g + '年級一覽', 'Grade ' + num + ' at a glance')", "tr(g + '年級賽程與闖關一覽', 'Grade ' + num + ' Sports Day schedule')");
rep("<thead><tr><th scope=\"col\">${tr('課名', 'Course')}</th><th scope=\"col\">${tr('節數', 'Periods')}</th><th scope=\"col\">${tr('評量摘要', 'Assessment')}</th></tr></thead>", "<thead><tr><th scope=\"col\">${tr('賽場島嶼', 'Arena Isle')}</th><th scope=\"col\">${tr('登場時段', 'Schedule')}</th><th scope=\"col\">${tr('五力闖關任務', 'Quest Task')}</th></tr></thead>");
rep("<span>${tr('年度活動', 'Yearly events')}</span>", "<span>${tr('典禮與接力賽區', 'Ceremony & Relay')}</span>");
rep("tr('每週節數怎麼排', 'HOW THE WEEK IS SPLIT')", "tr('本年段參賽與表演時程重點', 'SCHEDULE HIGHLIGHTS')");

// 島嶼卡片、細項地標卡、動線卡、人物卡 (islandCard, itemCard, flowCard, walkerCard, unitsBlock)
rep("function uiKindName(k) { return k === 'event' ? tr('年度活動', 'YEARLY EVENT') : tr('特色課程', 'SIGNATURE COURSE'); }", "function uiKindName(k) { return k === 'event' ? tr('校慶盛典與接力島', 'CEREMONY & RELAY ISLE') : tr('五力競賽與展演島', 'COMPETITION & SHOW ISLE'); }");
rep("const NOW_TXT = () => tr('上課時段（模擬）', 'IN CLASS (SIM.)');", "const NOW_TXT = () => tr('賽事進行中（模擬）', 'EVENT LIVE (SIM.)');");
rep("tr('學什麼', 'Highlights')", "tr('賽場地標', 'Landmarks')");
rep("tr('學什麼', 'HIGHLIGHT')", "tr('賽場地標', 'LANDMARK')");
rep("d.kind === 'event' ? tr('流程', 'Steps') : tr('單元', 'Units')", "tr('賽程項目', 'Schedule')");
rep("tr('新聞', 'News')", "tr('賽況快訊', 'Highlights')", true);
rep("tr('榮譽', 'Honors')", "tr('完賽英雄榜', 'Honor Roll')", true);
rep("tr('開課期間：', 'When: ')", "tr('活動期間：', 'When: ')");
rep("tr('節數：', 'Periods: ')", "tr('賽程時段：', 'Schedule: ')");
rep("d.kind === 'event' ? tr('怎麼參與', 'HOW STUDENTS TAKE PART') : tr('怎麼評量', 'HOW IT IS ASSESSED')", "tr('五力集章闖關方式', 'QUEST PASSPORT CHALLENGE')");
rep("tr('學到什麼能力', 'SKILLS STUDENTS BUILD')", "tr('鍛鍊五力素養', 'FIVE POWERS BUILT')");
rep("tr('島主教育家', 'Isle host')", "tr('駐島運動傳奇', 'Sports Legend Host')");
rep("tr('課程計畫寫明', 'Written in the curriculum plan')", "tr('大會程序表主軸動線', 'Main Program Route')");
rep("const cnt = n => ev ? tr(n + ' 個流程', n + (n > 1 ? ' steps' : ' step')) : tr(n + ' 個單元', n + (n > 1 ? ' units' : ' unit'));", "const cnt = n => tr(n + ' 個賽程項目', n + (n > 1 ? ' events' : ' event'));");
rep("tr('第 ' + u.weeks + ' 週', 'Wk ' + u.weeks)", "tr(u.weeks, u.weeks)");
rep("tr(u.periods + ' 節', u.periods + (+u.periods === 1 ? ' period' : ' periods'))", "tr(u.periods + ' 場次/分鐘', u.periods + ' min')");
rep("tr('帶隊教育家', 'Led by')", "tr('領隊運動傳奇', 'Led by Legend')");
rep("role && role.ancient ? tr('教育家', 'EDUCATOR') : tr('大庄夥伴', 'DAZHUANG CREW')", "role && role.ancient ? tr('運動傳奇巨星', 'SPORTS LEGEND') : tr('大庄親師生選手', 'DAZHUANG ATHLETE')");
rep(
  "role && role.ancient ? (host ? tr(`「${host.name}」島的島主，正帶著大庄師生搬運課程需要的東西。`, `Host of the ${host.nameEn} isle, leading Dazhuang students and teachers with supplies.`) : tr('來到大庄的教育家，正帶著師生搬運課程資源。', 'An educator visiting Dazhuang, leading the crew with supplies.')) : tr('跟著教育家一起搬運的大庄師生與夥伴。', 'A Dazhuang student, teacher or helper carrying supplies with the educators.')",
  "role && role.ancient ? (host ? tr(`「${host.name}」的駐島運動傳奇巨星（${role.look || ''}），正帶領大庄親師生傳遞運動會聖火與賽事裝備！`, `Sports Legend host of ${host.nameEn || host.name}, leading Dazhuang athletes across the arena!`) : tr('受邀蒞臨大庄 71 週年校慶的運動傳奇巨星，為小選手們加油助陣！', 'A sports legend visiting Da-Chuang 71st Sports Day!')) : tr('跟著運動傳奇巨星一起在賽場間奔馳傳遞的大庄小選手、老師、應援家長與志工夥伴！', 'Dazhuang athletes, teachers, parents and volunteers on the Sports Day arena!')"
);

// 右上賽況日誌 (#ui-log) 與下方 HUD (#ui-hud)
rep('<span data-en="Campus news">校園動態</span>', '<span data-en="Sports Day Live">大會賽況</span>');
rep('<button class="ui-log-tab" role="tab" id="ui-logtab-news" aria-selected="true" aria-controls="ui-log-news" type="button" data-en="News">校園新聞</button>', '<button class="ui-log-tab" role="tab" id="ui-logtab-news" aria-selected="true" aria-controls="ui-log-news" type="button" data-en="Highlights">賽程快訊</button>');
rep('<button class="ui-log-tab" role="tab" id="ui-logtab-honors" aria-selected="false" tabindex="-1" aria-controls="ui-log-honors" type="button" data-en="Honors">榮譽榜</button>', '<button class="ui-log-tab" role="tab" id="ui-logtab-honors" aria-selected="false" tabindex="-1" aria-controls="ui-log-honors" type="button" data-en="Honors">完賽英雄榜</button>');
rep('<span data-en="Walkers">小人動態</span>', '<span data-en="Athletes">選手動態</span>');
rep('placeholder="搜尋新聞、榮譽…"', 'placeholder="搜尋賽程快訊、個人賽英雄榜…"');
rep("tr('等待第一筆往來…教育家正在出發。', 'Waiting for the first trip… the educators are setting off.')", "tr('等待第一批選手出發…運動傳奇巨星正在熱身帶隊！', 'Waiting for the first relay… sports legends are warming up!')");
rep('<span class="ui-btn-txt" data-en="About">關於大庄</span>', '<span class="ui-btn-txt" data-en="About">大會簡介</span>');
rep('<span class="ui-btn-txt" data-en="My traveler">我的旅人</span>', '<span class="ui-btn-txt" data-en="Athlete Card">選手身分</span>');
rep('<span class="ui-btn-txt" data-en="6-yr journey">六年旅程</span>', '<span class="ui-btn-txt" data-en="Full Tour">運動會全覽</span>');
rep('<div class="ui-clock-slot" id="ui-clock-slot">上課</div>', '<div class="ui-clock-slot" id="ui-clock-slot">運動會進行中</div>');

// 大庄國小官方學校願景與校訂課程三大主軸（https://www.ttps.hc.edu.tw/nss/p/wish）
rep(
  "const UI_WIN = { W: ['Inquiry', '在地探究', 'local inquiry'], I: ['Character', '品格生活', 'character & life'], N: ['Arts & sports', '藝能運動', 'arts & sports'] };",
  "const UI_WIN = { W: ['Inquiry', '庄進自強～超越自己', 'Self-improvement'], I: ['Character', '庄園窯啊餚～樂活成長', 'Kiln & Growth'], N: ['Arts & sports', '康庄鐵道行～藝術小旅行', 'Railway & Art'] };"
);
rep(
  "function uiWinTag(w) { const d = UI_WIN[w], n = DATA.winNotes && DATA.winNotes[w]; return d ? `<span class=\"ui-wintag\">${tr('課程類型', 'Type')}${tr('・', ' · ')}<b class=\"ui-win\" aria-hidden=\"true\">${w}</b>${uiEsc(n ? L(n, 'name') : tr(d[1].split('／')[0], d[0]))}</span>` : ''; }",
  "function uiWinTag(w) { const d = UI_WIN[w], n = DATA.winNotes && DATA.winNotes[w]; return d ? `<span class=\"ui-wintag\">${tr('校訂課程', 'Curriculum')}${tr('・', ' · ')}<b class=\"ui-win\" aria-hidden=\"true\">${w}</b>${uiEsc(n ? L(n, 'name') : tr(d[1].split('／')[0], d[0]))}</span>` : ''; }"
);
rep(
  "tr('「學校願景」是大庄的四個方向：探究、創藝、友善、健康。「課程類型」是大庄三大主軸：W 在地探究、I 品格生活、N 藝能運動。', '“Vision” is one of Dazhuang’s four aims (vitality, creativity, cooperation, reason). “Type” follows the school’s WIN framework: W integrated themes, I team building, N clubs & crafts.')",
  "tr('【學校願景】大庄三大核心基石：感恩、學習、健康（課程願景：友善關懷、學習探索、健康樂活），培育「道德力、知識力、美感力、體能力、群體力」五力均備之新世紀優質公民！【校訂課程三大主軸】W 庄進自強～超越自己、I 庄園窯啊餚～樂活成長、N 康庄鐵道行～藝術小旅行。', '“School Vision” follows Dazhuang ES official foundation: Gratitude, Learning, Health (Care, Inquiry, Vitality), building students with all Five Powers. Curriculum WIN: W Self-improvement, I Kiln & Growth, N Railway & Art.')"
);

// 說明面板 (#ui-help) 與關於面板 (#ui-about)
rep('<h2 id="ui-help-title" data-en="Fourteen isles, one school year">十四座島，一整個大庄學年</h2>', '<h2 id="ui-help-title" data-en="Six Arena Isles, One Glorious Sports Day">六座五力賽場島，一場熱血的 71 週年校慶運動會</h2>');
rep(
  '每座六角島是大庄國小的一門特色課程或一個年度活動。古今中外的教育家擔任島主，帶著學生、老師、家長、志工與童軍走過小橋，把一門課需要的東西送到下一站。',
  '每座六角島代表大庄國小 71 週年校慶「七一大庄、五力飛揚」的一大主題賽區（包含六道立體紫色橡膠跑道、風起律動舞台、趣味競賽嘉年華、大隊接力競技場與金銀銅頒獎台）。6 位世界運動傳奇巨星（古柏坦、李小龍、紀政、歐文斯、喬丹、楊傳廣）擔任駐島島主，帶著大庄小選手、裁判老師、應援家長、校慶志工與聖火護衛隊在賽場間奔馳！'
);
rep(
  '「故事設定」：島主教育家、走來走去的小人和島與島之間的協作線，是讓地圖生動的故事元素；課程內容本身依學校課程計畫。',
  '「故事設定」：6 位運動傳奇巨星島主與賽場間奔馳的小選手動線為趣味故事元素；32 項節目時間、個人賽與大隊接力規則皆依據大庄國小 71 週年校慶運動會正式程序表與競賽規程。'
);
rep('<div class="ui-eyebrow" data-en="ABOUT DAZHUANG">關於大庄</div>', '<div class="ui-eyebrow" data-en="ABOUT SPORTS DAY">大會簡介</div>');
rep('<button class="ui-tab" role="tab" id="ui-abtab-intro" aria-selected="true" aria-controls="ui-about-intro" type="button" data-en="The school">學校簡介</button>', '<button class="ui-tab" role="tab" id="ui-abtab-intro" aria-selected="true" aria-controls="ui-about-intro" type="button" data-en="Overview">大會總覽</button>');
rep('<button class="ui-tab" role="tab" id="ui-abtab-offices" aria-selected="false" tabindex="-1" aria-controls="ui-about-offices" type="button" data-en="Offices">各處室</button>', '<button class="ui-tab" role="tab" id="ui-abtab-offices" aria-selected="false" tabindex="-1" aria-controls="ui-about-offices" type="button" data-en="Staff">主持與裁判團隊</button>');
rep('<h2 id="ui-trav-title" data-en="Who’s visiting the isles?">你是哪一種旅人？</h2>', '<h2 id="ui-trav-title" data-en="Choose your athlete role">選擇你的運動員參賽身分</h2>');
rep('<section id="ui-journey" class="ui-glass" aria-label="六年旅程" data-en-label="Six-year journey" hidden>', '<section id="ui-journey" class="ui-glass" aria-label="運動會全覽" data-en-label="Sports Day Tour" hidden>');
rep('<li><b data-en="Click">點選</b><span data-en="an isle or a building to open its card: what students learn, how they are assessed, units and related news. Esc closes it.">島或建物，左側會開卡片：學什麼、怎麼評量、課程單元與相關新聞；Esc 關閉。</span></li>', '<li><b data-en="Click">點選</b><span data-en="an isle or landmark to open its card: event schedules, 5-Power Quest challenges, and race highlights. Esc closes it.">賽區島嶼或 3D 地標，左側會開卡片：賽場地標、五力集章闖關、賽程項目與完賽英雄榜；Esc 關閉。</span></li>');
rep('<li><b data-en="By grade">依年級看</b><span data-en="see what lower, middle or upper grades takes each week; the other isles dim on the map.">看低、中、高年級各上哪些課、幾節、怎麼評量；地圖上其他島會變暗。</span></li>', '<li><b data-en="By grade">依年級看賽程</b><span data-en="see what lower, middle or upper grades participate in on Sports Day.">查看低、中、高年級各自的舞蹈表演、趣味競賽、個人賽與大隊接力時段。</span></li>');
rep('<li><b data-en="Journey">六年旅程</b><span data-en="a guided ride from first day to graduation, with captions you can pause.">從新生入學到畢業典禮的自動導覽，有字幕，可暫停、下一站。</span></li>', '<li><b data-en="Tour">運動會全覽</b><span data-en="a guided ride from opening ceremony to victory fireworks, with captions you can pause.">從開幕進場、六學年舞蹈、趣味競賽、紫色跑道個人賽、大隊接力到閉幕頒獎的自動導覽。</span></li>');
rep('<li><b data-en="List">清單</b><span data-en="browse courses by grade and yearly events; search units and news titles too.">依年級瀏覽特色課程與年度活動；也能搜尋單元名稱與新聞標題。</span></li>', '<li><b data-en="List">清單</b><span data-en="browse the 6 arena isles by grade; search events, purple track, and sports legends.">依年級瀏覽六大賽區島嶼與賽場傳承動線；也能搜尋賽程項目與駐島運動傳奇巨星。</span></li>');
rep('<span><i class="ui-lgd-num" aria-hidden="true">01</i><span data-en="Signature course">特色課程</span></span>', '<span><i class="ui-lgd-num" aria-hidden="true">02</i><span data-en="Competition & Show Isle">五力競賽與展演島</span></span>');
rep('<span><i class="ui-lgd-num is-event" aria-hidden="true">10</i><span data-en="Yearly event (gold ring)">年度活動（金框）</span></span>', '<span><i class="ui-lgd-num is-event" aria-hidden="true">01</i><span data-en="Ceremony & Relay Isle (gold ring)">校慶盛典與接力島（金框）</span></span>');
rep("grp(tr('特色課程', 'Signature courses'), isl.filter(d => d.kind !== 'event'))}${grp(tr('年度活動', 'Yearly events')", "grp(tr('五力競賽與展演島', 'Competition Isles'), isl.filter(d => d.kind !== 'event'))}${grp(tr('校慶盛典與接力島', 'Ceremony Isles')");

rep('<button class="ui-trav-badge" id="ui-trav-badge" type="button" hidden></button>', `<button class="ui-trav-badge" id="ui-trav-badge" type="button" hidden></button>
      <div class="sq-brand-actions" id="sq-brand-actions">
        <button type="button" class="sq-brand-pill is-gold" id="sq-btn-cert" title="查看五力集章進度與領取金牌證書">🏅 五力護照 <span id="sq-progress-txt">0/5章</span></button>
        <button type="button" class="sq-brand-pill" id="sq-btn-schedule" title="查看當日 08:00–13:00 完整 32 項程序表">📅 程序表(32)</button>
        <button type="button" class="sq-brand-pill" id="sq-btn-pre" title="查看 10/21–11/25 賽前已完賽個人賽與大隊接力戰報">🏃 賽前戰報</button>
        <button type="button" class="sq-brand-pill" id="sq-btn-athlete" title="設定運動員姓名與參賽身分"><span id="sq-athlete-icon">🐯</span> <span id="sq-athlete-label">選手設定</span></button>
      </div>`);

// 將建築卡片中的「進行時間（上學期／下學期／全學年）」改為校慶運動會專屬「登場時段・運動會三階段」＋「建築物專屬五力闖關挑戰卡」
rep(
  `const ip = itemPhase(it);
    const steps = it.phase === 3 && ip !== uiPhaseName(3) ? \`<div class="ui-step is-cur"><i></i>\${uiEsc(ip)}</div>\` : [1, 2, 3].map(p => \`<div class="ui-step \${p === it.phase || (it.phase === 3 && p < 3) ? 'is-cur' : ''}"><i></i>\${uiEsc(uiPhaseName(p))}</div>\`).join('');
    const now = uiSlotItems().includes(id);
    return \`<button class="ui-back" type="button" data-sel="island:\${d.id}">\${uiSvg('back').replace('<svg', '<svg width="14" height="14" style="stroke:currentColor;fill:none;stroke-width:2.4"')}\${d.num} \${uiEsc(L(d, 'full'))}</button>
      <div class="ui-eyebrow">\${tr('賽場地標', 'LANDMARK')} \${UI_CIRCLED[r.index] || r.index + 1} <span data-now-flag="\${id}">\${now ? '· ' + NOW_TXT() : ''}</span></div>
      <h2>\${uiEsc(L(it, 'name'))}</h2>
      <div class="ui-thumb" id="ui-thumb"><div class="ui-thumb-ph">\${glyph(d)}<span>\${uiEsc(it.model)}</span></div></div>
      <p>\${glossify(uiEsc(L(it, 'desc')), new Set())}</p>
      \${tiles ? \`<div class="ui-sec"><span class="ui-eyebrow">\${tr('重點', 'HIGHLIGHTS')}</span><div class="ui-tiles" style="--n:\${facts.length}">\${tiles}</div></div>\` : ''}
      <div class="ui-sec"><span class="ui-eyebrow">\${tr('進行時間', 'WHEN')}</span><div class="ui-timeline">\${steps}</div></div>\`;`,
  `const steps = [1, 2, 3].map(p => \`<div class="ui-step \${p === it.phase ? 'is-cur' : ''}"><i></i>\${uiEsc(uiPhaseName(p))}</div>\`).join('');
    const now = uiSlotItems().includes(id);
    const whenHtml = it.when ? \`<div class="sq-when-badge">⏰ <strong>登場時段：</strong>\${uiEsc(it.when)}</div>\` : '';
    return \`<button class="ui-back" type="button" data-sel="island:\${d.id}">\${uiSvg('back').replace('<svg', '<svg width="14" height="14" style="stroke:currentColor;fill:none;stroke-width:2.4"')}\${d.num} \${uiEsc(L(d, 'full'))}</button>
      <div class="ui-eyebrow">\${tr('賽場地標', 'LANDMARK')} \${UI_CIRCLED[r.index] || r.index + 1} <span data-now-flag="\${id}">\${now ? '· ' + NOW_TXT() : ''}</span></div>
      <h2>\${uiEsc(L(it, 'name'))}</h2>
      <div class="ui-thumb" id="ui-thumb"><div class="ui-thumb-ph">\${glyph(d)}<span>\${uiEsc(it.model)}</span></div></div>
      <p>\${glossify(uiEsc(L(it, 'desc')), new Set())}</p>
      <div id="sq-item-quest-mount" data-item-id="\${uiEsc(it.id)}"></div>
      \${tiles ? \`<div class="ui-sec"><span class="ui-eyebrow">\${tr('賽場重點', 'HIGHLIGHTS')}</span><div class="ui-tiles" style="--n:\${facts.length}">\${tiles}</div></div>\` : ''}
      <div class="ui-sec"><span class="ui-eyebrow">\${tr('登場時段・運動會三階段', 'EVENT SCHEDULE & STAGE')}</span>\${whenHtml}<div class="ui-timeline">\${steps}</div></div>\`;`
);
const customStyles = `
/* ================= 奔馳榮耀島・藍綠白清爽色系與五力集章護照 UI ================= */
:root {
  --ui-bg: rgba(240, 253, 250, 0.92) !important;
  --ui-bg-solid: #f0fdfa !important;
  --ui-card: rgba(255, 255, 255, 0.96) !important;
  --ui-ink: #0f172a !important;
  --ui-sub: #334155 !important;
  --ui-muted: #64748b !important;
  --ui-line: rgba(14, 165, 233, 0.22) !important;
  --ui-accent: #0284c7 !important;
  --ui-accent-soft: rgba(2, 132, 199, 0.12) !important;
  --sq-blue: #0284c7;
  --sq-sky: #38bdf8;
  --sq-green: #10b981;
  --sq-mint: #34d399;
  --sq-purple: #7c3aed;
  --sq-gold: #f59e0b;
}

/* 大庄國小官方學校願景標籤色系（感恩・學習・健康・五力均備） */
.ui-vis-gratitude, .ui-vis-cooperative { --v: #059669 !important; background: #059669 !important; color: #ffffff !important; }
.ui-vis-learning, .ui-vis-rational { --v: #0284c7 !important; background: #0284c7 !important; color: #ffffff !important; }
.ui-vis-health, .ui-vis-vital { --v: #ea580c !important; background: #ea580c !important; color: #ffffff !important; }
.ui-vis-five_powers, .ui-vis-creative { --v: #d97706 !important; background: #d97706 !important; color: #ffffff !important; }
.ui-wintag { font-weight: 800; border: 1px solid rgba(2, 132, 199, 0.25); background: #ffffff; }
.ui-isl-tags summary { font-size: 13.5px; font-weight: 800; color: #0284c7; }
.ui-help-note { line-height: 1.6; font-size: 13px; color: #334155; }

/* Modern Web Guidance: Prevent scroll chaining on modal dialogs and their backdrops */
dialog:modal {
  overscroll-behavior: contain;
}
dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
  background-color: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(5px);
}

/* 品牌卡內嵌功能列（取代原本頂部懸浮狀態列） */
.sq-brand-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 7px;
  padding-top: 7px;
  border-top: 1px solid rgba(2, 132, 199, 0.16);
}
.sq-brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
  border: 1.5px solid rgba(2, 132, 199, 0.3);
  background: rgba(255, 255, 255, 0.92);
  color: #0369a1;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.sq-brand-pill:hover {
  background: #e0f2fe;
  border-color: #0284c7;
  transform: translateY(-1px);
}
.sq-brand-pill.is-gold {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: #f59e0b;
  color: #92400e;
}

/* 建築卡片內「登場時段」醒目膠囊 */
.sq-when-badge {
  margin: 4px 0 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.85), rgba(209, 250, 229, 0.85));
  border-left: 4px solid #0284c7;
  font-size: 13px;
  color: #0c4a6e;
  line-height: 1.45;
}

/* 建築物卡片內的「專屬闖關挑戰卡」 */
.sq-bldg-quest {
  margin: 14px 0;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(160deg, #f0f9ff 0%, #ecfdf5 100%);
  border: 2px solid rgba(2, 132, 199, 0.35);
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.1);
}
.sq-bldg-quest.is-cleared {
  border-color: #10b981;
  background: linear-gradient(160deg, #ecfdf5 0%, #fef3c7 100%);
}
.sq-bq-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.sq-bq-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
  background: #0284c7;
  color: #ffffff;
}
.sq-bq-status {
  font-size: 11.5px;
  font-weight: 800;
  color: #047857;
}
.sq-bq-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}
.sq-bq-desc {
  margin: 0 0 10px;
  font-size: 12.5px;
  color: #334155;
  line-height: 1.45;
}
.sq-bq-stage1 {
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px dashed #38bdf8;
  margin-bottom: 10px;
}
.sq-bq-seq-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sq-bq-seq-btn {
  flex: 1;
  min-width: 110px;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1.5px solid #94a3b8;
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sq-bq-seq-btn.is-done {
  border-color: #10b981;
  background: #d1fae5;
  color: #065f46;
}
.sq-bq-meter {
  height: 8px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
  margin-top: 8px;
}
.sq-bq-meter-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #0284c7, #10b981, #f59e0b);
  transition: width 0.25s ease;
}
.sq-bq-done-msg {
  margin-top: 7px;
  font-size: 12.5px;
  font-weight: 800;
  color: #047857;
}
.sq-bq-q {
  margin: 8px 0;
  font-size: 13.5px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.4;
}
.sq-bq-opts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sq-bq-opt {
  padding: 8px 11px;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #1e293b;
  font-size: 12.5px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sq-bq-opt:hover {
  border-color: #0284c7;
  background: #f0f9ff;
}
.sq-bq-opt.is-correct {
  border-color: #10b981;
  background: #d1fae5;
  color: #065f46;
}
.sq-bq-opt.is-wrong {
  border-color: #ef4444;
  background: #fee2e2;
  color: #991b1b;
}
.sq-bq-fb {
  margin-top: 8px;
  padding: 9px 11px;
  border-radius: 10px;
  background: #ecfdf5;
  border: 1.5px solid #10b981;
  color: #065f46;
  font-size: 12.5px;
  line-height: 1.45;
}
.sq-bq-foot {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(2, 132, 199, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11.5px;
  color: #475569;
}

.sq-act-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  border: 1.5px solid rgba(2, 132, 199, 0.3);
  background: #ffffff;
  color: #0369a1;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.sq-act-btn:hover {
  background: #e0f2fe;
  border-color: #0284c7;
}
.sq-act-btn.is-gold {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: #f59e0b;
  color: #92400e;
  animation: sqPulseGold 2s infinite;
}
@keyframes sqPulseGold {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45); }
  50% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
}

/* 通用現代 Dialog 樣式 */
.sq-dialog {
  border: none;
  border-radius: 24px;
  padding: 0;
  max-width: 620px;
  width: calc(100vw - 28px);
  max-height: 88vh;
  background: linear-gradient(165deg, #ffffff 0%, #f0f9ff 55%, #ecfdf5 100%);
  color: #0f172a;
  box-shadow: 0 24px 60px rgba(2, 132, 199, 0.28), 0 0 0 2px rgba(16, 185, 129, 0.3);
  font-family: system-ui, -apple-system, "Segoe UI", "Microsoft JhengHei", sans-serif;
}
.sq-dialog.sq-dialog-wide {
  max-width: 820px;
}
.sq-dlg-inner {
  padding: 22px 24px;
  overflow-y: auto;
  max-height: 86vh;
}
.sq-dlg-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1.5px solid rgba(2, 132, 199, 0.15);
  padding-bottom: 12px;
  margin-bottom: 16px;
}
.sq-dlg-kicker {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  color: #0284c7;
  background: #e0f2fe;
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 4px;
}
.sq-dlg-title {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}
.sq-dlg-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
}
.sq-dlg-close:hover { background: #f1f5f9; }

/* 運動員註冊卡 */
.sq-form-group { margin-bottom: 16px; }
.sq-form-label {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}
.sq-name-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  border: 2px solid #bae6fd;
  background: #ffffff;
  color: #0f172a;
}
.sq-name-input:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.18);
}
.sq-role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}
.sq-role-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}
.sq-role-card:hover { border-color: #7dd3fc; background: #f8fafc; }
.sq-role-card.is-active {
  border-color: #0284c7;
  background: linear-gradient(135deg, #e0f2fe, #d1fae5);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
}
.sq-role-card strong { font-size: 14px; color: #0f172a; }
.sq-role-card span { font-size: 11.5px; color: #475569; line-height: 1.35; }

.sq-primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 18px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #0284c7 0%, #10b981 100%);
  color: #ffffff;
  font-size: 15.5px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.3);
  transition: transform 0.15s ease;
}
.sq-primary-btn:hover { transform: translateY(-1px); }

/* 闖關問答卡 */
.sq-clue-box {
  padding: 11px 14px;
  border-radius: 12px;
  background: rgba(224, 242, 254, 0.75);
  border-left: 4px solid #0284c7;
  font-size: 13.5px;
  color: #0c4a6e;
  margin-bottom: 14px;
}
.sq-quiz-q {
  font-size: 16.5px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px;
  line-height: 1.45;
}
.sq-opt-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}
.sq-opt-btn {
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid #cbd5e1;
  background: #ffffff;
  color: #1e293b;
  font-size: 14.5px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sq-opt-btn:hover { border-color: #0284c7; background: #f0f9ff; }
.sq-opt-btn.is-correct {
  border-color: #10b981;
  background: #d1fae5;
  color: #065f46;
}
.sq-opt-btn.is-wrong {
  border-color: #ef4444;
  background: #fee2e2;
  color: #991b1b;
}
.sq-quiz-feedback {
  padding: 12px 14px;
  border-radius: 12px;
  background: #ecfdf5;
  border: 1.5px solid #10b981;
  color: #065f46;
  font-size: 13.5px;
  line-height: 1.5;
  margin-bottom: 12px;
}

/* 程序表與賽前戰報表格 */
.sq-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.sq-tab {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.sq-tab.is-active {
  background: linear-gradient(135deg, #0284c7, #10b981);
  color: #ffffff;
  border-color: transparent;
}
.sq-filter-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.sq-chip {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
}
.sq-chip.is-active {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}
.sq-table-wrap {
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
}
.sq-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.sq-table th {
  background: linear-gradient(90deg, #0284c7, #0d9488);
  color: #ffffff;
  padding: 9px 10px;
  text-align: left;
  white-space: nowrap;
}
.sq-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
}
.sq-table tr:hover td { background: #f0f9ff; }
.sq-power-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
}
.sq-p-美感力 { background: #cffafe; color: #0e7490; }
.sq-p-群體力 { background: #d1fae5; color: #047857; }
.sq-p-道德力 { background: #e0f2fe; color: #0369a1; }
.sq-p-知識力 { background: #ccfbf1; color: #0f766e; }
.sq-p-體能力 { background: #ede9fe; color: #6d28d9; }

/* 金牌證書畫布 */
.sq-cert-preview {
  width: 100%;
  border-radius: 16px;
  border: 3px solid #f59e0b;
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.25);
  display: block;
  margin-bottom: 14px;
}
.sq-cert-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.sq-cert-actions button { flex: 1; min-width: 180px; }

/* 島嶼卡片內的「挑戰五力闖關」醒目按鈕 */
.sq-card-quest-cta {
  margin: 10px 0;
  padding: 10px 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #e0f2fe 0%, #d1fae5 100%);
  border: 1.5px solid #0284c7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.sq-card-quest-cta button {
  padding: 7px 14px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #0284c7, #10b981);
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

`;

rep('</style>', customStyles + '\n</style>');

// ---- 6. 注入 HTML Dialogs（移除頂部 #sq-hud，改為嵌入各座島嶼與 19 座建築卡片關卡） ----
const customHtml = `
<!-- 1. 運動員註冊卡 Dialog -->
<dialog id="sq-reg-dialog" class="sq-dialog" closedby="any" aria-labelledby="sq-reg-title">
  <div class="sq-dlg-inner">
    <div class="sq-dlg-head">
      <div>
        <span class="sq-dlg-kicker">新竹市香山區大庄國小 71 週年校慶運動會</span>
        <h2 class="sq-dlg-title" id="sq-reg-title">🏃 運動員入場註冊・領取五力集章護照</h2>
      </div>
      <button type="button" class="sq-dlg-close" data-sq-close="sq-reg-dialog" aria-label="關閉">✕</button>
    </div>
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.5;">
      歡迎登上<strong>《奔馳榮耀島・五力飛揚》</strong>！請輸入你的姓名並選擇代表身分。點選地圖上 <strong>6 座島嶼中的 19 座建築地標</strong>，每座建築都有專屬的<strong>互動闖關任務</strong>，集滿 5 枚五力印章就能引燃中央聖火台<strong>全景 3D 勝利煙火</strong>並獲得專屬金牌證書！
    </p>
    <div class="sq-form-group">
      <label class="sq-form-label" for="sq-input-name">✍️ 運動員／挑戰者姓名（將印製於五力金牌證書上）：</label>
      <input type="text" id="sq-input-name" class="sq-name-input" placeholder="例如：王小明、三年甲班陳同學、熱血林爸爸" maxlength="20" />
    </div>
    <div class="sq-form-group">
      <label class="sq-form-label">🎽 選擇你的參賽代表身分：</label>
      <div class="sq-role-grid" id="sq-role-grid">
        <button type="button" class="sq-role-card is-active" data-role="低年級小選手" data-icon="🐯">
          <strong>🐯 低年級小選手</strong>
          <span>50m 紫色跑道跑走、跳跳虎、粒粒皆辛苦</span>
        </button>
        <button type="button" class="sq-role-card" data-role="中年級飛毛腿" data-icon="⚡">
          <strong>⚡ 中年級飛毛腿</strong>
          <span>60m/100m 衝刺、巾球運送、罐罐相連、半圈接力</span>
        </button>
        <button type="button" class="sq-role-card" data-role="高年級破風手" data-icon="🔥">
          <strong>🔥 高年級破風手</strong>
          <span>扇耀舞台、棍舞盛典、100m/200m 與全圈接力</span>
        </button>
        <button type="button" class="sq-role-card" data-role="熱血應援家長" data-icon="📸">
          <strong>📸 熱血應援家長</strong>
          <span>親子圈力衝刺、蕉你一起動一動、全程應援</span>
        </button>
        <button type="button" class="sq-role-card" data-role="親善校友貴賓" data-icon="🏅">
          <strong>🏅 親善校友貴賓</strong>
          <span>重溫六道紫色跑道、12:00 庄情薪傳接力賽</span>
        </button>
      </div>
    </div>
    <button type="button" class="sq-primary-btn" id="sq-reg-submit">🚀 領取五力集章護照，進入島嶼建築闖關！</button>
  </div>
</dialog>

<!-- 2. 五力闖關問答任務 Dialog -->
<dialog id="sq-quiz-dialog" class="sq-dialog" closedby="any" aria-labelledby="sq-quiz-title">
  <div class="sq-dlg-inner">
    <div class="sq-dlg-head">
      <div>
        <span class="sq-dlg-kicker" id="sq-quiz-kicker">五力集章任務</span>
        <h2 class="sq-dlg-title" id="sq-quiz-title">五力試煉</h2>
      </div>
      <button type="button" class="sq-dlg-close" data-sq-close="sq-quiz-dialog" aria-label="關閉">✕</button>
    </div>
    <div class="sq-clue-box" id="sq-quiz-clue"></div>
    <p class="sq-quiz-q" id="sq-quiz-question"></p>
    <div class="sq-opt-list" id="sq-quiz-options"></div>
    <div class="sq-quiz-feedback" id="sq-quiz-feedback" hidden></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button type="button" class="sq-primary-btn" id="sq-quiz-next" style="flex:1;">前往下一座尚未蓋章的島嶼 👉</button>
    </div>
  </div>
</dialog>

<!-- 3. 大會日程表（32項）＆賽前完賽個人賽戰報＆3D地標模型清單 Dialog -->
<dialog id="sq-schedule-dialog" class="sq-dialog sq-dialog-wide" closedby="any" aria-labelledby="sq-sched-title">
  <div class="sq-dlg-inner">
    <div class="sq-dlg-head">
      <div>
        <span class="sq-dlg-kicker">Da-Chuang's 71st: Soaring with the Five Powers</span>
        <h2 class="sq-dlg-title" id="sq-sched-title">📅 「七一大庄、五力飛揚」校慶運動會程序表＆競賽規程</h2>
      </div>
      <button type="button" class="sq-dlg-close" data-sq-close="sq-schedule-dialog" aria-label="關閉">✕</button>
    </div>
    <div class="sq-tabs">
      <button type="button" class="sq-tab is-active" data-sq-tab="prog">📅 當日程序表（01–32 項）</button>
      <button type="button" class="sq-tab" data-sq-tab="pre">🏃 賽前已完賽個人賽＆大隊接力規程</button>
      <button type="button" class="sq-tab" data-sq-tab="models">🗺️ 六島 19 座 3D 地標模型總覽</button>
    </div>
    <div id="sq-pane-prog">
      <div class="sq-filter-row" id="sq-prog-filters">
        <button type="button" class="sq-chip is-active" data-pfilter="ALL">全部 (32)</button>
        <button type="button" class="sq-chip" data-pfilter="美感力">🎨 美感力</button>
        <button type="button" class="sq-chip" data-pfilter="群體力">🤝 群體力</button>
        <button type="button" class="sq-chip" data-pfilter="道德力">💖 道德力</button>
        <button type="button" class="sq-chip" data-pfilter="知識力">🧠 知識力</button>
        <button type="button" class="sq-chip" data-pfilter="體能力">⚡ 體能力</button>
      </div>
      <div class="sq-table-wrap">
        <table class="sq-table">
          <thead>
            <tr>
              <th>項目</th>
              <th>時間</th>
              <th>節目名稱</th>
              <th>大庄五力</th>
              <th>表演者／參賽者</th>
              <th>主持人</th>
              <th>3D 定位</th>
            </tr>
          </thead>
          <tbody id="sq-prog-tbody"></tbody>
        </table>
      </div>
    </div>
    <div id="sq-pane-pre" hidden>
      <div class="sq-clue-box" style="margin-bottom:12px;">
        <strong>📌 71 週年校慶運動會競賽規程重點（比賽時間：115 年 10 月 21 日至 12 月 12 日）：</strong><br>
        • <strong>個人項目</strong>：三～六年級男、女生各取前三名頒發獎牌及獎狀，四～六名頒發獎狀。中年級跑 60m、100m；高年級跑 100m、200m（預賽每班男女各派 3 人分 3 組，每組取 1 名＋擇優 3 名晉級 6 人決賽）。<br>
        • <strong>團體大隊接力</strong>：三～六年級前三名班級頒發錦旗。每班女生 8 人（前 8 棒）、男生 8 人（後 8 棒）。中年級每人跑半圈（第 3 棒搶第 1 道）；高年級每人跑一圈（第 2 棒搶第 1 道）。<strong>※ 超越前方選手時，應加速從前方選手的右側（外側跑道）超越！</strong>
      </div>
      <div class="sq-table-wrap">
        <table class="sq-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>階段</th>
              <th>比賽項目</th>
              <th>點名時間</th>
              <th>比賽時間</th>
              <th>狀態與規程說明</th>
            </tr>
          </thead>
          <tbody id="sq-pre-tbody"></tbody>
        </table>
      </div>
    </div>
    <div id="sq-pane-models" hidden>
      <div class="sq-table-wrap">
        <table class="sq-table">
          <thead>
            <tr>
              <th>島嶼</th>
              <th>代表五力</th>
              <th>3D 模型代號</th>
              <th>地標名稱</th>
              <th>地標特色說明</th>
              <th>飛往地標</th>
            </tr>
          </thead>
          <tbody id="sq-models-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>
</dialog>

<!-- 4. 奔馳榮耀五力金牌證書 Dialog -->
<dialog id="sq-cert-dialog" class="sq-dialog sq-dialog-wide" closedby="any" aria-labelledby="sq-cert-title">
  <div class="sq-dlg-inner">
    <div class="sq-dlg-head">
      <div>
        <span class="sq-dlg-kicker">🎉 五力集章榮耀達成・全景 3D 聖火煙火慶典</span>
        <h2 class="sq-dlg-title" id="sq-cert-title">🏆 奔馳榮耀・五力金牌證書</h2>
      </div>
      <button type="button" class="sq-dlg-close" data-sq-close="sq-cert-dialog" aria-label="關閉">✕</button>
    </div>
    <p id="sq-cert-hint" style="margin:0 0 12px;font-size:13.5px;color:#334155;"></p>
    <canvas id="sq-cert-canvas" width="1200" height="820" class="sq-cert-preview"></canvas>
    <div class="sq-cert-actions">
      <button type="button" class="sq-primary-btn" id="sq-btn-dl-cert">💾 下載高畫質金牌證書 (PNG)</button>
      <button type="button" class="sq-act-btn is-gold" id="sq-btn-fireworks" style="justify-content:center;font-size:14.5px;padding:11px 16px;">🎆 飛往聖火台・再次施放 3D 勝利煙火！</button>
    </div>
  </div>
</dialog>
`;

rep('<script type="importmap">', customHtml + '\n<script type="importmap">');

// ---- 7. 注入五力護照互動邏輯、3D 勝利煙火粒子系統與金牌證書繪製引擎 ----
const customLogic = `
// ================= 五力集章護照（Quest Passport）＆ 3D 勝利煙火系統 =================
function initSportsQuest(ctx) {
  window.__ctx = ctx;
  const STORAGE_KEY = 'sq-passport-v1';
  let state = {
    name: '',
    role: '低年級小選手',
    icon: '🐯',
    stamps: {},
    clearedItems: {},
    registered: false,
    celebrated: false
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      state = { ...state, ...saved };
      state.stamps = state.stamps || {};
      state.clearedItems = state.clearedItems || {};
    }
  } catch (e) {}

  const saveState = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  };

  // Modern Web Guidance: Fallback for browsers without native <dialog closedby="any"> support
  document.querySelectorAll('dialog.sq-dialog').forEach(dialog => {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  });

  document.querySelectorAll('[data-sq-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dlg = document.getElementById(btn.dataset.sqClose);
      if (dlg && dlg.open) dlg.close();
    });
  });

  const regDlg = document.getElementById('sq-reg-dialog');
  const quizDlg = document.getElementById('sq-quiz-dialog');
  const schedDlg = document.getElementById('sq-schedule-dialog');
  const certDlg = document.getElementById('sq-cert-dialog');

  // 更新左上品牌卡內嵌的微型護照進度（不再佔用畫面頂部中央狀態條）
  function renderHud() {
    const quests = DATA.quests || [];
    const stampedCount = quests.filter(q => state.stamps[q.id]).length;
    const clearedCount = Object.keys(state.clearedItems || {}).filter(k => state.clearedItems[k]).length;
    const icEl = document.getElementById('sq-athlete-icon');
    const lbEl = document.getElementById('sq-athlete-label');
    const prEl = document.getElementById('sq-progress-txt');
    if (icEl) icEl.textContent = state.icon || '🐯';
    if (lbEl) lbEl.textContent = state.name || state.role;
    if (prEl) prEl.textContent = stampedCount + '/5章 · ' + clearedCount + '/19關';
  }

  // 1. 運動員註冊卡邏輯
  const nameInput = document.getElementById('sq-input-name');
  const roleCards = document.querySelectorAll('#sq-role-grid .sq-role-card');
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
      state.role = card.dataset.role;
      state.icon = card.dataset.icon;
    });
  });

  document.getElementById('sq-btn-athlete')?.addEventListener('click', () => {
    nameInput.value = state.name || '';
    if (!regDlg.open) regDlg.showModal();
  });

  document.getElementById('sq-reg-submit')?.addEventListener('click', () => {
    state.name = (nameInput.value || '').trim() || '大庄小健將';
    state.registered = true;
    saveState();
    renderHud();
    if (regDlg.open) regDlg.close();
  });

  // 2. 19 座建築物卡片內嵌「專屬闖關挑戰」渲染器
  function mountBuildingChallenge(itemId) {
    const mount = document.getElementById('sq-item-quest-mount');
    if (!mount) return;
    const ref = ctx.itemById.get(itemId);
    if (!ref || !ref.item || !ref.item.challenge) return;
    const it = ref.item;
    const isl = ref.island.data;
    const ch = it.challenge;
    const isCleared = !!state.clearedItems[it.id];
    const quests = DATA.quests || [];
    const stampedCount = quests.filter(q => state.stamps[q.id]).length;
    const clearedCount = Object.keys(state.clearedItems || {}).filter(k => state.clearedItems[k]).length;

    let stage1Done = isCleared;
    let tapCount = isCleared ? (ch.targetCount || 3) : 0;
    let seqIdx = isCleared ? ((ch.sequenceItems || []).length) : 0;

    let stage1Html = '';
    if (ch.mode === 'tap_charge') {
      const target = ch.targetCount || 3;
      const pct = Math.min(100, Math.round((tapCount / target) * 100));
      stage1Html =
        '<div class="sq-bq-stage1">' +
          '<button type="button" class="sq-act-btn" id="sq-bq-act-btn" style="width:100%;justify-content:center;padding:8px 12px;font-size:13px;">' +
            ch.actionBtn + ' (<span id="sq-bq-tap-num">' + tapCount + '/' + target + '</span>)' +
          '</button>' +
          '<div class="sq-bq-meter"><div class="sq-bq-meter-fill" id="sq-bq-meter-fill" style="width:' + pct + '%;"></div></div>' +
          '<div class="sq-bq-done-msg" id="sq-bq-stage1-msg" ' + (stage1Done ? '' : 'hidden') + '>' + ch.actionDone + '</div>' +
        '</div>';
    } else if (ch.mode === 'sequence') {
      const items = ch.sequenceItems || [];
      stage1Html =
        '<div class="sq-bq-stage1">' +
          '<div class="sq-bq-seq-row" id="sq-bq-seq-row">' +
            items.map((label, idx) =>
              '<button type="button" class="sq-bq-seq-btn ' + (isCleared ? 'is-done' : '') + '" data-seq-idx="' + idx + '">' + label + '</button>'
            ).join('') +
          '</div>' +
          '<div class="sq-bq-done-msg" id="sq-bq-stage1-msg" ' + (stage1Done ? '' : 'hidden') + '>' + ch.actionDone + '</div>' +
        '</div>';
    } else if (ch.mode === 'reaction') {
      stage1Html =
        '<div class="sq-bq-stage1">' +
          '<button type="button" class="sq-act-btn" id="sq-bq-react-btn" style="width:100%;justify-content:center;padding:8px 12px;font-size:13px;">' +
            (isCleared ? '⚡ 再次實測紫色跑道聽槍起跑反應' : ch.actionBtn) +
          '</button>' +
          '<div class="sq-bq-done-msg" id="sq-bq-stage1-msg" ' + (stage1Done ? '' : 'hidden') + '>' + ch.actionDone + '</div>' +
        '</div>';
    }

    mount.innerHTML =
      '<div class="sq-bldg-quest ' + (isCleared ? 'is-cleared' : '') + '" id="sq-bldg-quest-card">' +
        '<div class="sq-bq-head">' +
          '<span class="sq-bq-tag">🎯 建築關卡｜' + ch.power + '</span>' +
          '<span class="sq-bq-status" id="sq-bq-status">' + (isCleared ? '✅ 本建築已過關' : '⏳ 待闖關挑戰') + '</span>' +
        '</div>' +
        '<h3 class="sq-bq-title">' + ch.title + '</h3>' +
        '<p class="sq-bq-desc">' + ch.taskDesc + '</p>' +
        stage1Html +
        '<div id="sq-bq-quiz-wrap">' +
          '<p class="sq-bq-q">❓ ' + ch.question + '</p>' +
          '<div class="sq-bq-opts" id="sq-bq-opts">' +
            (ch.options || []).map((opt, idx) =>
              '<button type="button" class="sq-bq-opt ' + (isCleared && idx === ch.answer ? 'is-correct' : '') + '" data-opt-idx="' + idx + '">' +
                ['A. ', 'B. ', 'C. '][idx] + opt +
              '</button>'
            ).join('') +
          '</div>' +
          '<div class="sq-bq-fb" id="sq-bq-fb" ' + (isCleared ? '' : 'hidden') + '>' +
            (isCleared ? '🎖️ <strong>已通過本建築關卡並蓋下【' + ch.power + '】印章！</strong><br>' + ch.explain : '') +
          '</div>' +
        '</div>' +
        '<div class="sq-bq-foot">' +
          '<span id="sq-bq-prog-foot">🏅 五力印章：<strong>' + stampedCount + '/5</strong> ｜ 建築關卡：<strong>' + clearedCount + '/19</strong></span>' +
          '<div style="display:flex;gap:5px;">' +
            '<button type="button" class="sq-brand-pill" id="sq-bq-next-btn">👉 下一個建築關卡</button>' +
            '<button type="button" class="sq-brand-pill is-gold" id="sq-bq-cert-btn">🏆 護照與證書</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    // 綁定第一階段互動事件
    const msgEl = document.getElementById('sq-bq-stage1-msg');
    if (ch.mode === 'tap_charge') {
      const target = ch.targetCount || 3;
      const actBtn = document.getElementById('sq-bq-act-btn');
      const numEl = document.getElementById('sq-bq-tap-num');
      const fillEl = document.getElementById('sq-bq-meter-fill');
      actBtn?.addEventListener('click', () => {
        tapCount = Math.min(target, tapCount + 1);
        if (numEl) numEl.textContent = tapCount + '/' + target;
        if (fillEl) fillEl.style.width = Math.round((tapCount / target) * 100) + '%';
        if (tapCount >= target) {
          stage1Done = true;
          if (msgEl) msgEl.hidden = false;
        }
      });
    } else if (ch.mode === 'sequence') {
      const seqBtns = mount.querySelectorAll('.sq-bq-seq-btn');
      seqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.seqIdx);
          if (idx === seqIdx || idx <= seqIdx) {
            btn.classList.add('is-done');
            if (idx === seqIdx) seqIdx++;
            if (seqIdx >= seqBtns.length) {
              stage1Done = true;
              if (msgEl) msgEl.hidden = false;
            }
          } else {
            if (msgEl) {
              msgEl.hidden = false;
              msgEl.textContent = '💡 請按照 ① ➔ ② ➔ ③ 的順序依序點擊喔！';
            }
          }
        });
      });
    } else if (ch.mode === 'reaction') {
      const reactBtn = document.getElementById('sq-bq-react-btn');
      let waitingGun = false, gunTime = 0, timerId = 0;
      reactBtn?.addEventListener('click', () => {
        if (!waitingGun && !gunTime) {
          waitingGun = true;
          reactBtn.textContent = '⏳ 各就各位…預備…（等鳴槍變綠色立即點！）';
          reactBtn.style.background = '#fef3c7';
          timerId = setTimeout(() => {
            waitingGun = false;
            gunTime = performance.now();
            reactBtn.textContent = '🔫 砰！現在立刻點擊起跑！';
            reactBtn.style.background = '#d1fae5';
          }, 700 + Math.random() * 900);
        } else if (waitingGun) {
          clearTimeout(timerId);
          waitingGun = false;
          reactBtn.textContent = '⚠️ 搶跑犯規！點此重新預備起跑';
          reactBtn.style.background = '#fee2e2';
        } else if (gunTime) {
          const rt = ((performance.now() - gunTime) / 1000).toFixed(3);
          gunTime = 0;
          stage1Done = true;
          reactBtn.textContent = '⚡ 起跑成功！反應時間：' + rt + ' 秒（點此可再測）';
          reactBtn.style.background = '#ffffff';
          if (msgEl) {
            msgEl.hidden = false;
            msgEl.textContent = '⚡ 砰！你在六道紫色跑道的起跑反應為 ' + rt + ' 秒！接著請回答下方問題：';
          }
        }
      });
    }

    // 綁定第二階段選擇題作答事件
    const fbEl = document.getElementById('sq-bq-fb');
    mount.querySelectorAll('.sq-bq-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.optIdx);
        if (idx === ch.answer) {
          btn.classList.add('is-correct');
          state.clearedItems[it.id] = true;
          if (ch.questId === 'ALL') {
            (DATA.quests || []).forEach(q => { state.stamps[q.id] = true; });
          } else if (ch.questId) {
            state.stamps[ch.questId] = true;
          }
          saveState();
          renderHud();

          const cardEl = document.getElementById('sq-bldg-quest-card');
          if (cardEl) cardEl.classList.add('is-cleared');
          const stEl = document.getElementById('sq-bq-status');
          if (stEl) stEl.textContent = '✅ 本建築已過關';
          if (msgEl) msgEl.hidden = false;

          const newStamped = (DATA.quests || []).filter(q => state.stamps[q.id]).length;
          const newCleared = Object.keys(state.clearedItems || {}).filter(k => state.clearedItems[k]).length;
          const footEl = document.getElementById('sq-bq-prog-foot');
          if (footEl) footEl.innerHTML = '🏅 五力印章：<strong>' + newStamped + '/5</strong> ｜ 建築關卡：<strong>' + newCleared + '/19</strong>';

          if (fbEl) {
            fbEl.hidden = false;
            fbEl.innerHTML = '🎉 <strong>恭喜過關！成功通過「' + it.name + '」關卡並蓋下【' + ch.power + '】印章！</strong><br>' + ch.explain;
          }

          if (newStamped >= (DATA.quests || []).length && !state.celebrated) {
            state.celebrated = true;
            saveState();
            setTimeout(() => triggerGrandFinale(), 1200);
          }
        } else {
          btn.classList.add('is-wrong');
          if (fbEl) {
            fbEl.hidden = false;
            fbEl.innerHTML = '💡 差一點點！請看上方建築介紹與重點提示，再試另一個選項！';
          }
        }
      });
    });

    // 下一個建築關卡按鈕
    document.getElementById('sq-bq-next-btn')?.addEventListener('click', () => {
      const allItems = [];
      (DATA.islands || []).forEach(d => (d.items || []).forEach(x => allItems.push(x.id)));
      const curIdx = allItems.indexOf(it.id);
      let nextId = allItems.find((id, i) => i > curIdx && !state.clearedItems[id]) ||
                   allItems.find(id => !state.clearedItems[id]) ||
                   allItems[(curIdx + 1) % allItems.length];
      if (nextId && ctx.select) ctx.select('item', nextId);
    });

    document.getElementById('sq-bq-cert-btn')?.addEventListener('click', () => {
      triggerGrandFinale();
    });
  }

  // 當打開「島嶼卡（islandCard）」時，在島嶼卡裡的建築清單標示每棟建築的闖關狀態
  function decorateIslandCard(islId) {
    const cardBody = document.getElementById('ui-card-body');
    if (!cardBody) return;
    const isl = ctx.islandById.get(islId)?.data;
    if (!isl) return;
    const q = (DATA.quests || []).find(x => x.islandId === islId);
    const totalBldgs = (isl.items || []).length;
    const doneBldgs = (isl.items || []).filter(it => state.clearedItems[it.id]).length;
    const stampDone = q ? !!state.stamps[q.id] : Object.keys(state.stamps).length >= 5;

    let banner = cardBody.querySelector('.sq-card-quest-cta');
    if (banner) banner.remove();
    banner = document.createElement('div');
    banner.className = 'sq-card-quest-cta';
    banner.innerHTML =
      '<div>' +
        '<strong style="font-size:13.5px;color:#0369a1;">' + (q ? q.icon + ' 本島五力印章：【' + q.power + '】' : '🏆 五力榮耀星光總部') + (stampDone ? '（✅ 已蓋章）' : '（⏳ 待蓋章）') + '</strong>' +
        '<div style="font-size:12px;color:#475569;">本島共有 <strong>' + totalBldgs + ' 座建築關卡</strong>（已完成 ' + doneBldgs + '/' + totalBldgs + '），點選下方任一建築即可進入專屬闖關！</div>' +
      '</div>' +
      '<button type="button">' + (doneBldgs < totalBldgs ? '🎯 前往建築闖關' : '🏅 查看建築關卡') + '</button>';
    banner.querySelector('button').addEventListener('click', () => {
      const targetItem = (isl.items || []).find(it => !state.clearedItems[it.id]) || isl.items[0];
      if (targetItem && ctx.select) ctx.select('item', targetItem.id);
    });
    const tabsEl = cardBody.querySelector('.ui-ctabs');
    if (tabsEl) tabsEl.parentNode.insertBefore(banner, tabsEl);
    else cardBody.prepend(banner);

    // 為島嶼卡裡的每個建築列加上「🎯 闖關：...」或「✅ 已過關」標籤
    cardBody.querySelectorAll('[data-sel^="item:"]').forEach(btn => {
      const itemId = btn.dataset.sel.slice(5);
      const it = ctx.itemById.get(itemId)?.item;
      if (!it || !it.challenge) return;
      const cleared = !!state.clearedItems[itemId];
      const tag = btn.querySelector('[data-now-item], .sq-row-qtag');
      if (tag) {
        tag.removeAttribute('data-now-item');
        tag.classList.add('sq-row-qtag');
        tag.textContent = cleared ? '✅ 已過關' : '🎯 點此闖關';
        tag.style.background = cleared ? '#d1fae5' : '#e0f2fe';
        tag.style.color = cleared ? '#065f46' : '#0369a1';
        tag.style.fontWeight = '800';
      }
    });
  }

  function onSelectionChange(sel) {
    if (!sel) return;
    if (sel.type === 'item') mountBuildingChallenge(sel.id);
    else if (sel.type === 'island') decorateIslandCard(sel.id);
  }

  ctx.on('selection', onSelectionChange);
  if (ctx.selection) onSelectionChange(ctx.selection);

  // 3. 大會程序表 (32項) ＆ 賽前個人賽戰報 ＆ 3D 地標模型總覽
  function renderScheduleTables(powerFilter = 'ALL') {
    const progTbody = document.getElementById('sq-prog-tbody');
    const rows = (DATA.programSchedule || []).filter(r => powerFilter === 'ALL' || r.power === powerFilter);
    progTbody.innerHTML = rows.map(r => {
      const isl = ctx.islandById.get(r.island)?.data;
      return '<tr>' +
        '<td><strong>' + r.no + '</strong></td>' +
        '<td><strong>' + r.time + '</strong></td>' +
        '<td>' + r.title + '</td>' +
        '<td><span class="sq-power-badge sq-p-' + r.power + '">' + r.power + '</span></td>' +
        '<td>' + r.performer + '</td>' +
        '<td>' + r.host + '</td>' +
        '<td><button type="button" class="sq-chip" data-fly-isl="' + r.island + '">📍 ' + (isl ? isl.name : r.island) + '</button></td>' +
      '</tr>';
    }).join('');

    progTbody.querySelectorAll('[data-fly-isl]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (schedDlg.open) schedDlg.close();
        if (ctx.select) ctx.select('island', btn.dataset.flyIsl);
        else if (ctx.frameIsland) ctx.frameIsland(btn.dataset.flyIsl);
      });
    });

    const preTbody = document.getElementById('sq-pre-tbody');
    preTbody.innerHTML = (DATA.preEvents || []).map(p =>
      '<tr>' +
        '<td><strong>' + p.date + '</strong></td>' +
        '<td><span class="sq-power-badge sq-p-體能力">' + p.stage + '</span></td>' +
        '<td><strong>' + p.item + '</strong></td>' +
        '<td>' + p.callTime + '</td>' +
        '<td>' + p.raceTime + '</td>' +
        '<td>' + p.rule + '</td>' +
      '</tr>'
    ).join('');

    const modelsTbody = document.getElementById('sq-models-tbody');
    const modelRows = [];
    (DATA.islands || []).forEach(isl => {
      const q = (DATA.quests || []).find(x => x.islandId === isl.id);
      const pName = q ? q.power : '五力大圓滿';
      isl.items.forEach(it => {
        const cleared = !!state.clearedItems[it.id];
        modelRows.push(
          '<tr>' +
            '<td><strong>' + isl.num + ' ' + isl.name + '</strong></td>' +
            '<td><span class="sq-power-badge sq-p-' + pName + '">' + pName + '</span></td>' +
            '<td><strong>' + it.name + '</strong><div style="font-size:11.5px;color:#0369a1;margin-top:2px;">⏰ ' + (it.when || '') + '</div></td>' +
            '<td>' + (it.challenge ? '<strong>' + it.challenge.title + '</strong><div style="font-size:11.5px;color:#475569;">' + it.challenge.taskDesc + '</div>' : it.desc) + '</td>' +
            '<td>' + (cleared ? '<span style="color:#059669;font-weight:800;">✅ 已過關</span>' : '<span style="color:#d97706;font-weight:700;">⏳ 待闖關</span>') + '</td>' +
            '<td><button type="button" class="sq-chip is-active" data-fly-item="' + it.id + '">🎯 前往建築闖關</button></td>' +
          '</tr>'
        );
      });
    });
    modelsTbody.innerHTML = modelRows.join('');
    modelsTbody.querySelectorAll('[data-fly-item]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (schedDlg.open) schedDlg.close();
        if (ctx.select) ctx.select('item', btn.dataset.flyItem);
      });
    });
  }

  document.querySelectorAll('#sq-prog-filters .sq-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#sq-prog-filters .sq-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      renderScheduleTables(chip.dataset.pfilter);
    });
  });

  function switchSchedTab(tabName) {
    document.querySelectorAll('#sq-schedule-dialog .sq-tab').forEach(t => {
      t.classList.toggle('is-active', t.dataset.sqTab === tabName);
    });
    document.getElementById('sq-pane-prog').hidden = tabName !== 'prog';
    document.getElementById('sq-pane-pre').hidden = tabName !== 'pre';
    document.getElementById('sq-pane-models').hidden = tabName !== 'models';
  }

  document.querySelectorAll('#sq-schedule-dialog .sq-tab').forEach(t => {
    t.addEventListener('click', () => switchSchedTab(t.dataset.sqTab));
  });

  document.getElementById('sq-btn-schedule').addEventListener('click', () => {
    renderScheduleTables('ALL');
    switchSchedTab('prog');
    if (!schedDlg.open) schedDlg.showModal();
  });

  document.getElementById('sq-btn-pre').addEventListener('click', () => {
    renderScheduleTables('ALL');
    switchSchedTab('pre');
    if (!schedDlg.open) schedDlg.showModal();
  });

  // 4. 全景 3D 勝利煙火粒子系統（在中央七一耀動聖火台上方綻放）
  const fireworks = [];
  function spawn3DFireworks() {
    if (!ctx.scene) return;
    const centerIsl = ctx.islandById.get('s01');
    const origin = centerIsl ? centerIsl.center : { x: 0, y: 1.5, z: 0 };
    const palette = [0xf59e0b, 0x38bdf8, 0x10b981, 0xf43f5e, 0xa855f7, 0xfde047, 0xffffff];

    for (let burst = 0; burst < 7; burst++) {
      setTimeout(() => {
        const bx = origin.x + (Math.random() - 0.5) * 4.5;
        const by = 2.6 + Math.random() * 2.2;
        const bz = origin.z + (Math.random() - 0.5) * 4.5;
        const col = palette[burst % palette.length];
        const group = [];
        const geom = new THREE.SphereGeometry(0.065, 6, 6);
        const mat = new THREE.MeshBasicMaterial({ color: col });
        for (let i = 0; i < 36; i++) {
          const mesh = new THREE.Mesh(geom, mat);
          mesh.position.set(bx, by, bz);
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const speed = 1.6 + Math.random() * 2.4;
          const vx = Math.sin(phi) * Math.cos(theta) * speed;
          const vy = Math.cos(phi) * speed + 0.8;
          const vz = Math.sin(phi) * Math.sin(theta) * speed;
          ctx.scene.add(mesh);
          group.push({ mesh, vx, vy, vz });
        }
        fireworks.push({ age: 0, maxAge: 2.2, particles: group, geom, mat });
        ctx.markDirty();
      }, burst * 320);
    }
  }

  ctx.onFrame.push((dt) => {
    if (!fireworks.length) return;
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const fw = fireworks[i];
      fw.age += dt;
      if (fw.age >= fw.maxAge) {
        fw.particles.forEach(pt => ctx.scene.remove(pt.mesh));
        fw.geom.dispose();
        fw.mat.dispose();
        fireworks.splice(i, 1);
        continue;
      }
      const scale = Math.max(0.01, 1 - fw.age / fw.maxAge);
      fw.particles.forEach(pt => {
        pt.mesh.position.x += pt.vx * dt;
        pt.mesh.position.y += pt.vy * dt;
        pt.mesh.position.z += pt.vz * dt;
        pt.vy -= 2.8 * dt;
        pt.mesh.scale.setScalar(scale);
      });
    }
    ctx.markDirty();
  });

  // 5. 繪製高解析「奔馳榮耀・五力金牌證書」Canvas
  function drawCertificate() {
    const canvas = document.getElementById('sq-cert-canvas');
    if (!canvas) return;
    const c = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // 藍綠白海風漸層背景
    const bg = c.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#f0f9ff');
    bg.addColorStop(0.5, '#ffffff');
    bg.addColorStop(1, '#ecfdf5');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    // 雙層皇家金與海風藍邊框
    c.strokeStyle = '#0284c7';
    c.lineWidth = 14;
    c.strokeRect(28, 28, W - 56, H - 56);
    c.strokeStyle = '#f59e0b';
    c.lineWidth = 6;
    c.strokeRect(46, 46, W - 92, H - 92);

    // 頂部標題橫幅
    c.fillStyle = '#0369a1';
    c.font = 'bold 28px "Microsoft JhengHei", sans-serif';
    c.textAlign = 'center';
    c.fillText('新竹市香山區大庄國民小學 71 週年校慶運動會', W / 2, 115);

    c.fillStyle = '#0f172a';
    c.font = 'bold 52px "Microsoft JhengHei", sans-serif';
    c.fillText('🏆 奔馳榮耀・五力飛揚金牌證書 🏆', W / 2, 185);

    c.fillStyle = '#0d9488';
    c.font = 'bold 22px "Segoe UI", sans-serif';
    c.fillText("Da-Chuang's 71st Anniversary: Soaring with the Five Powers", W / 2, 225);

    // 參賽者姓名與身分
    const playerName = state.name || '大庄運動小健將';
    c.fillStyle = '#1e293b';
    c.font = '28px "Microsoft JhengHei", sans-serif';
    c.fillText('茲證明　' + state.icon + ' 【' + state.role + '】', W / 2, 295);

    c.fillStyle = '#0284c7';
    c.font = 'bold 60px "Microsoft JhengHei", sans-serif';
    c.fillText(playerName, W / 2, 372);

    c.strokeStyle = '#f59e0b';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(W / 2 - 220, 392);
    c.lineTo(W / 2 + 220, 392);
    c.stroke();

    c.fillStyle = '#334155';
    c.font = '25px "Microsoft JhengHei", sans-serif';
    c.fillText('於大庄國小「七一大庄、五力飛揚」3D 動態運動會島嶼探險中，', W / 2, 445);
    c.fillText('完成六道紫色跑道、美感律動、趣味智慧與庄情薪傳巡禮，表現優異！', W / 2, 485);

    // 五力印章徽章列
    const quests = DATA.quests || [];
    const startX = 190, gap = 205, cy = 590;
    quests.forEach((q, idx) => {
      const x = startX + idx * gap;
      const done = !!state.stamps[q.id];
      c.save();
      c.beginPath();
      c.arc(x, cy, 62, 0, Math.PI * 2);
      c.fillStyle = done ? '#fef3c7' : '#f1f5f9';
      c.fill();
      c.lineWidth = 5;
      c.strokeStyle = done ? '#f59e0b' : '#cbd5e1';
      c.stroke();

      c.fillStyle = done ? '#b45309' : '#64748b';
      c.font = 'bold 26px "Microsoft JhengHei", sans-serif';
      c.fillText(q.power, x, cy - 5);
      c.font = 'bold 18px "Microsoft JhengHei", sans-serif';
      c.fillText(done ? '★ 已認證 ★' : '待闖關', x, cy + 28);
      c.restore();
    });

    // 底部簽章與日期
    const stampedCount = quests.filter(q => state.stamps[q.id]).length;
    c.fillStyle = '#0f172a';
    c.font = 'bold 24px "Microsoft JhengHei", sans-serif';
    c.fillText('五力集章進度：' + stampedCount + ' / 5 章　｜　校長：許雅惠　｜　中華民國 115 年 12 月 12 日', W / 2, 735);
  }

  function triggerGrandFinale() {
    if (ctx.frameIsland) ctx.frameIsland('s01');
    spawn3DFireworks();
    drawCertificate();
    const quests = DATA.quests || [];
    const stampedCount = quests.filter(q => state.stamps[q.id]).length;
    document.getElementById('sq-cert-hint').innerHTML = stampedCount >= quests.length
      ? '🎉 <strong>太棒了！你已集滿全部 5 枚大庄五力印章！</strong>中央「七一耀動聖火台」已為你點燃 3D 勝利煙火，你可以直接截圖或點擊下方按鈕下載證書保存！'
      : '💡 目前已收集 <strong>' + stampedCount + ' / 5</strong> 枚印章。集滿 5 章即可解鎖全金徽章與聖火台煙火！（你也可以隨時預覽或下載目前證書）';
    if (!certDlg.open) certDlg.showModal();
  }

  document.getElementById('sq-btn-cert').addEventListener('click', () => {
    triggerGrandFinale();
  });

  document.getElementById('sq-btn-fireworks').addEventListener('click', () => {
    if (certDlg.open) certDlg.close();
    if (ctx.frameIsland) ctx.frameIsland('s01');
    spawn3DFireworks();
  });

  document.getElementById('sq-btn-dl-cert').addEventListener('click', () => {
    drawCertificate();
    const canvas = document.getElementById('sq-cert-canvas');
    const a = document.createElement('a');
    a.download = '大庄國小71週年校慶_五力金牌證書_' + (state.name || '運動健將') + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });

  renderHud();

  // 首次進入島嶼時自動彈出「運動員註冊卡」
  if (!state.registered) {
    setTimeout(() => {
      const origTrav = document.getElementById('ui-trav');
      if (origTrav) origTrav.hidden = true;
      if (!regDlg.open) regDlg.showModal();
    }, 900);
  }
}
`;

rep('if (typeof initUI === \'function\') initUI(ctx);         // C', 'if (typeof initUI === \'function\') initUI(ctx);         // C\n    if (typeof initSportsQuest === \'function\') initSportsQuest(ctx);');
rep('// ================= BOOT：載入 CDN、依序初始化各 part =================', customLogic + '\n// ================= BOOT：載入 CDN、依序初始化各 part =================');

fs.writeFileSync(OUT, html, 'utf8');

// 語法檢查
const m = html.match(/<script type="module">([\s\S]*?)<\/script>/);
const checkPath = path.join(__dirname, 'check.mjs');
fs.writeFileSync(checkPath, m[1], 'utf8');
console.log('BUILD SUCCESS:', OUT, (html.length / 1024).toFixed(0) + ' KB', 'islands:', DATA.islands.length, 'items:', itemIds.size, 'schedule:', DATA.programSchedule.length);
