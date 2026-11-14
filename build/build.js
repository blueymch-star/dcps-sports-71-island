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
  evidence: {
    plan: {
      name: '大會程序表正式依據（實線橋）',
      nameEn: 'Official Program Schedule (Solid)'
    },
    news: {
      name: '賽事活動紀實報導',
      nameEn: 'Event & News Record'
    },
    link: {
      name: '五力傳承主題閉環（虛線橋）',
      nameEn: 'Five Powers Thematic Link (Dashed)'
    }
  },
  phases: {
    1: { name: '開幕與律動 (08:00–09:25)', nameEn: 'Opening & Dance (08:00–09:25)' },
    2: { name: '趣味與徑賽 (09:30–12:00)', nameEn: 'Fun Games & Track (09:30–12:00)' },
    3: { name: '薪傳與閉幕 (12:00–13:00)', nameEn: 'Relay & Awards (12:00–13:00)' }
  },
  carries: {
    ...orig.carries,
    note: { name: '大會程序手冊', nameEn: 'Program Handbook' },
    toolbox: { name: '趣味競賽道具箱', nameEn: 'Games Gear Box' },
    medal: { name: '個人賽獎牌', nameEn: 'Sprint Medals' },
    baton: { name: '黃金接力棒', nameEn: 'Golden Relay Baton' },
    diploma: { name: '大隊接力錦旗與獎狀', nameEn: 'Relay Banners & Awards' },
    trophy: { name: '五力金牌榮譽勳章', nameEn: 'Five Powers Gold Trophy' }
  },
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

// 頂部品牌卡（支援 方案一：收合卡片 與 方案二：頂部真・動態島 試用切換）
const origBrandHeader = `<header id="ui-brand" class="ui-glass">
      <div class="ui-eyebrow" id="ui-brand-eyebrow" data-en="9 SIGNATURE COURSES · 5 YEARLY EVENTS">9 門特色課程 · 5 個年度活動</div>
      <h1 class="ui-brand-title" id="ui-brand-title" data-en="Dazhuang · Kiln & Sea Isles">大庄．窯海島</h1>
      <div class="ui-brand-sub" id="ui-brand-sub" data-en="Dazhuang ES · Flexible curriculum &amp; yearly events">大庄國小・特色課程與年度活動</div>
      <div class="ui-brand-sub ui-brand-mob" id="ui-brand-mob"></div>
      <button class="ui-trav-badge" id="ui-trav-badge" type="button" hidden></button>
    </header>`;

const sportsBrandHeader = `<header id="ui-brand" class="ui-glass sq-brand-root">
      <!-- 精巧膠囊（收合狀態顯示） -->
      <button type="button" class="sq-capsule-pill" id="sq-capsule-pill" aria-label="展開校慶運動會導覽卡片">
        <span class="sq-pill-icon">🏃</span>
        <span class="sq-pill-title">奔馳榮耀島</span>
        <span class="sq-pill-dot">·</span>
        <span class="sq-pill-badge" id="sq-pill-prog">🏅 0/5章 · 0/19關</span>
        <span class="sq-pill-arrow">▾</span>
      </button>

      <!-- 展開卡片主體 -->
      <div class="sq-brand-body" id="sq-brand-body">
        <div class="sq-brand-header-actions">
          <div class="ui-eyebrow" id="ui-brand-eyebrow" data-en="DA-CHUANG 71ST · 6 ARENA ISLES · 32 EVENTS">71 週年校慶 · 6 座五力賽場島 · 32 項程序</div>
          <button type="button" class="sq-fold-btn" id="sq-fold-btn" title="收起卡片，釋放 3D 賽場視野" aria-label="收起卡片">
            <span class="sq-fold-txt">收合</span> <span class="sq-fold-icon">▲</span>
          </button>
        </div>
        <h1 class="ui-brand-title" id="ui-brand-title" data-en="Sports Quest Island">奔馳榮耀島・校慶運動大冒險</h1>
        <div class="ui-brand-sub" id="ui-brand-sub" data-en="Da-Chuang's 71st: Soaring with the Five Powers">七一大庄、五力飛揚｜71 週年校慶運動會</div>
        <div class="ui-brand-sub ui-brand-mob" id="ui-brand-mob"></div>
        <button class="ui-trav-badge" id="ui-trav-badge" type="button" hidden></button>
        <div class="sq-brand-actions" id="sq-brand-actions">
          <button type="button" class="sq-brand-pill is-gold" id="sq-btn-cert" title="查看五力集章進度與領取金牌證書">🏅 五力護照 <span id="sq-progress-txt">0/5章</span></button>
          <button type="button" class="sq-brand-pill" id="sq-btn-schedule" title="查看當日 08:00–13:00 完整 32 項程序表">📅 程序表(32)</button>
          <button type="button" class="sq-brand-pill" id="sq-btn-pre" title="查看 16 項個人賽決賽成績、榮譽榜與完整戰報">🏃 決賽戰報</button>
          <button type="button" class="sq-brand-pill is-audio" id="sq-btn-audio" title="切換闖關背景音樂">🎵 闖關音樂🔊</button>
          <button type="button" class="sq-brand-pill" id="sq-btn-athlete" title="設定運動員姓名與參賽身分"><span id="sq-athlete-icon">🐯</span> <span id="sq-athlete-label">選手設定</span></button>
        </div>
      </div>
    </header>`;
rep(origBrandHeader, sportsBrandHeader);
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
rep('placeholder="搜尋課程、單元、新聞、教育家…"', 'placeholder="搜尋賽程、趣味競賽、跑道、巨星"');
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
rep(
  `const story = gs ? \`<div class="ui-gstory"><b>\${uiEsc(L(gs, 'title') || '')}</b><p>\${uiEsc(LANG === 'en' ? gs.en || gs.zh : gs.zh)}</p></div>\` : '';`,
  `const gsTitle = (gs && L(gs, 'title')) || '';
    const gsBar = gsTitle.indexOf('｜');
    const gsPill = gsBar > -1 ? gsTitle.slice(0, gsBar).trim() : '';
    const gsSub = gsBar > -1 ? gsTitle.slice(gsBar + 1).trim() : gsTitle;
    const story = gs ? \`<div class="ui-gstory"><div class="sq-gstory-head">\${gsPill ? \`<span class="sq-power-badge sq-p-道德力">\${uiEsc(gsPill)}</span>\` : ''}<b class="sq-gstory-sub">\${uiEsc(gsSub)}</b></div><p>\${uiEsc(LANG === 'en' ? gs.en || gs.zh : gs.zh)}</p></div>\` : '';`
);
rep(
  `const rows = cs.map(i => { const d = i.data, a = L(d, 'assess'); return \`<tr><th scope="row">\${isl(d)}</th><td>\${uiEsc(uiPeriodsShort(d))}</td><td>\${a ? uiEsc(uiFirstSentence(a, 40)) : '<span class="ui-muted">—</span>'}</td></tr>\`; }).join('');`,
  `const rows = cs.map(i => {
      const d = i.data, a = L(d, 'assess');
      const leadRaw = L(d, 'lead') || '';
      const barIdx = leadRaw.indexOf('｜');
      const pName = barIdx > -1 ? leadRaw.slice(0, barIdx).trim() : '';
      const pCls = pName.includes('五力') ? 'sq-p-五力大圓滿' : pName.includes('美感') ? 'sq-p-美感力' : pName.includes('知識') ? 'sq-p-知識力' : pName.includes('道德') ? 'sq-p-道德力' : pName.includes('群體') ? 'sq-p-群體力' : 'sq-p-體能力';
      const pTag = pName ? \`<span class="sq-power-badge sq-gt-pbadge \${pCls}">\${uiEsc(pName)}</span>\` : '';
      const gp = L(d, 'gradePeriods');
      const schedStr = (gp && gp[num]) || uiPeriodsShort(d) || '';
      const times = schedStr.split('｜').map(s => s.trim()).filter(Boolean).map(t => \`<span class="sq-gt-time">⏰ \${uiEsc(t)}</span>\`).join('');
      return \`<tr><th scope="row">\${isl(d)}\${pTag}</th><td>\${times || uiEsc(schedStr)}</td><td>\${a ? uiEsc(uiFirstSentence(a, 40)) : '<span class="ui-muted">—</span>'}</td></tr>\`;
    }).join('');`
);

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
rep(
  "const meta = [term && tr('活動期間：', 'When: ') + term, L(d, 'periods') && tr('賽程時段：', 'Schedule: ') + L(d, 'periods')].filter(Boolean).map(x => `<span class=\"ui-meta-chip\">${uiEsc(x)}</span>`).join('');",
  "const periodSegs = String(L(d, 'periods') || '').split(/[｜|]/).map(s => s.trim()).filter(Boolean);\n    const metaParts = [];\n    if (term) metaParts.push(`<span class=\"ui-meta-chip sq-card-timechip\">📅 ${uiEsc(tr('活動期間：', 'When: ') + term)}</span>`);\n    if (periodSegs.length) {\n      metaParts.push(`<span class=\"sq-card-metalbl\">${uiEsc(tr('賽程時段', 'Schedule'))}</span>`);\n      periodSegs.forEach(p => metaParts.push(`<span class=\"ui-meta-chip sq-card-timechip\">⏰ ${uiEsc(p)}</span>`));\n    }\n    const meta = metaParts.join('');"
);
rep(
  "const leadHtml = glossify(uiEsc(lead), used), sumHtml = glossify(uiEsc(L(d, 'summary')), used);",
  "const fullRaw = L(d, 'full') || '';\n    const fullSep = fullRaw.includes('・') ? '・' : ' · ';\n    const fullParts = fullRaw.split(fullSep);\n    const titleHtml = fullParts.length > 1 ? `<span class=\"sq-card-title\">${uiEsc(fullParts[0])}</span><span class=\"sq-card-sub\">${uiEsc(fullParts.slice(1).join(fullSep))}</span>` : `<span class=\"sq-card-title\">${uiEsc(fullRaw)}</span>`;\n    const leadParts = String(lead || '').split('｜');\n    const powerHtml = leadParts.length > 1 ? `<div class=\"sq-card-powerrow\">${leadParts[0].split('✕').map(p => p.trim()).filter(Boolean).map(p => `<span class=\"sq-power-badge sq-p-${uiEsc(p)}\">${uiEsc(p)}</span>`).join('<span class=\"sq-p-cross\">✕</span>')}</div>` : '';\n    const leadDesc = leadParts.length > 1 ? leadParts.slice(1).join('｜').trim() : lead;\n    const leadHtml = glossify(uiEsc(leadDesc), used), sumHtml = glossify(uiEsc(L(d, 'summary')), used);"
);
rep(
  "<div class=\"ui-head\">${glyph(d)}<div><h2>${uiEsc(L(d, 'full'))}</h2></div></div>\n      <p class=\"ui-lead\">${leadHtml}</p>",
  "<div class=\"ui-head\">${glyph(d)}<div><h2>${titleHtml}</h2></div></div>\n      ${powerHtml}\n      <p class=\"ui-lead\">${leadHtml}</p>"
);
rep(
  "${meta ? `<div class=\"ui-meta\">${meta}</div>` : ''}",
  "${meta ? `<div class=\"ui-meta sq-card-meta\">${meta}</div>` : ''}"
);
rep("d.kind === 'event' ? tr('怎麼參與', 'HOW STUDENTS TAKE PART') : tr('怎麼評量', 'HOW IT IS ASSESSED')", "tr('五力集章闖關方式', 'QUEST PASSPORT CHALLENGE')");
rep("tr('學到什麼能力', 'SKILLS STUDENTS BUILD')", "tr('鍛鍊五力素養', 'FIVE POWERS BUILT')");
rep("tr('島主教育家', 'Isle host')", "tr('駐島運動傳奇', 'Sports Legend Host')");
rep("tr('課程計畫寫明', 'Written in the curriculum plan')", "tr('大會程序表主軸動線', 'Main Program Route')");
rep("<dt>${tr('證據等級', 'Evidence')}</dt>", "<dt>${tr('動線依據等級', 'Evidence Level')}</dt>");
rep("case 'medal':", "case 'trophy':\n    case 'medal':", true);
rep("case 'diploma':", "case 'baton':\n    case 'diploma':", true);
rep("const cnt = n => ev ? tr(n + ' 個流程', n + (n > 1 ? ' steps' : ' step')) : tr(n + ' 個單元', n + (n > 1 ? ' units' : ' unit'));", "const cnt = n => tr(n + ' 個賽程項目', n + (n > 1 ? ' events' : ' event'));");
rep("tr('第 ' + u.weeks + ' 週', 'Wk ' + u.weeks)", "tr(u.weeks, u.weeks)", true);
rep("tr(u.periods + ' 節', u.periods + (+u.periods === 1 ? ' period' : ' periods'))", "((String(u.sem || '').includes('獎項')) ? tr(u.periods + ' 項', u.periods + (+u.periods === 1 ? ' item' : ' items')) : tr(u.periods + ' 分鐘', u.periods + ' min'))", true);
rep(
  "<span class=\"ui-unit-name\">${uiEsc(L(u, 'name'))}</span>",
  "<span class=\"ui-unit-name\">${(() => { const nm = String(L(u, 'name') || ''); if (nm.includes('、') && !/[一二三四五六]、/.test(nm)) { return nm.split('、').map((seg, si, arr) => `<span class=\"sq-unit-seg\">${uiEsc(seg + (si < arr.length - 1 ? '、' : ''))}</span>`).join(''); } return uiEsc(nm); })()}</span>"
);
rep("if (type === 'island') { d = ctx.islandById.get(id)?.data; t = d ? d.num + ' ' + L(d, 'full') : ''; }", "if (type === 'island') { d = ctx.islandById.get(id)?.data; t = d ? d.num + ' ' + L(d, 'name') : ''; }");
rep(
  "const hkShort = k => tr({ school: '學校', teacher: '教師', student: '學生' }[k] || k, hkName(k));",
  "const hkShort = k => tr({ school: '學校', teacher: '教師', student: '學生', sprint: '個人賽', relay: '大隊接力', moral: '感恩榮譽' }[k] || k, { sprint: 'Sprint', relay: 'Relay', moral: 'Moral' }[k] || hkName(k));"
);
rep(
  "return `<li class=\"ui-honor-item ${hit ? 'is-hit' : ''}\" data-honor-card=\"${uiEsc(h.id)}\" ${hidden ? 'hidden' : ''}><span class=\"ui-news-date\">${uiEsc(h.date)}<span class=\"ui-hk ui-hk-${uiEsc(h.kind)}\">${uiEsc(hkShort(h.kind))}</span></span><span class=\"ui-honor-ttl\">${uiEsc(L(h, 'title'))}${src}</span></li>`;",
  "const rawTtl = String(L(h, 'title') || '');\n    let ttlHtml = uiEsc(rawTtl);\n    if (rawTtl.includes('：')) {\n      const [evPart, ...restParts] = rawTtl.split('：');\n      ttlHtml = `<span class=\"sq-honor-event\">${uiEsc(evPart)}</span><span class=\"sq-honor-winner\">${uiEsc(restParts.join('：').trim())}</span>`;\n    } else if (rawTtl.includes('（') && rawTtl.length > 20) {\n      const idx = rawTtl.indexOf('（');\n      ttlHtml = `<span class=\"sq-honor-event\">${uiEsc(rawTtl.slice(0, idx))}</span><span class=\"sq-honor-sub\">${uiEsc(rawTtl.slice(idx))}</span>`;\n    }\n    return `<li class=\"ui-honor-item ${hit ? 'is-hit' : ''}\" data-honor-card=\"${uiEsc(h.id)}\" ${hidden ? 'hidden' : ''}><span class=\"ui-news-date\">${uiEsc(h.date)}<span class=\"ui-hk ui-hk-${uiEsc(h.kind)}\">${uiEsc(hkShort(h.kind))}</span></span><span class=\"ui-honor-ttl\">${ttlHtml}${src}</span></li>`;"
);
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

// 說明面板：更新清單說明、協作動線圖例、校訂課程三大主軸 (WIN) 與官方資料來源
rep(
  '<li><b data-en="Campus news">校園動態</b><span data-en="campus news and the honor roll (newest first, filter by isle or topic); &quot;Walkers&quot; shows the little animated trips between isles (an animation, not real events). Use the arrow keys inside a list.">看「校園新聞」「榮譽榜」（新到舊，可依島或主題篩選）；「小人動態」是島與島之間的搬運動畫，不是真實事件。清單裡用上下鍵移動。</span></li>',
  '<li><b data-en="News &amp; Honors">大會賽況</b><span data-en="race news and the honor roll (newest first, filter by sprint, relay or ceremony); &quot;Walkers&quot; shows athlete animations on the bridges. Use the arrow keys inside a list.">看「賽程快訊」「完賽英雄榜」（依個人賽、大隊接力、感恩榮譽分類）；「小人動態」為小選手與島主在賽場動線奔馳的動畫。清單裡可用上下鍵移動。</span></li>'
);
rep(
  '<li><b data-en="About">關於</b><span data-en="the school\'s profile, history and what each office does.">大庄國小的簡介、沿革與各處室業務。</span></li>',
  '<li><b data-en="About">大會簡介</b><span data-en="the event overview, school vision, five powers, and event hosting &amp; organizing staff.">大會主題、學校願景五力圖像與大會主持與籌備團隊。</span></li>'
);
rep(
  `<div class="ui-eyebrow" data-en="LINK LINES (STORY)">協作線圖例（故事設定）</div>
      <div class="ui-legend">
        <span><i class="ui-sw ui-sw-plan"></i><span data-en="In the curriculum plan">課程計畫有據</span></span>
        <span><i class="ui-sw ui-sw-news"></i><span data-en="Reported in school news">新聞報導</span></span>
        <span><i class="ui-sw ui-sw-link"></i><span data-en="Thematic link">主題連結</span></span>
      </div>`,
  `<div class="ui-eyebrow" data-en="LINK LINES (STORY)">協作動線圖例（故事設定）</div>
      <div class="ui-legend">
        <span><i class="ui-sw ui-sw-plan"></i><span data-en="Official Program Schedule (Solid)">大會程序表依據（實線橋）</span></span>
        <span><i class="ui-sw ui-sw-news"></i><span data-en="Event &amp; News Record">賽事紀實報導</span></span>
        <span><i class="ui-sw ui-sw-link"></i><span data-en="Five Powers Thematic Link (Dashed)">五力傳承主題閉環（虛線橋）</span></span>
      </div>`
);
rep(
  `<div class="ui-eyebrow" data-en="DAZHUANG WIN">大庄三大主軸</div>
      <div class="ui-legend">
        <span><b class="ui-win">W</b><span data-en="Local inquiry">W 在地探究</span></span>
        <span><b class="ui-win">I</b><span data-en="Character & life">I 品格生活</span></span>
        <span><b class="ui-win">N</b><span data-en="Arts &amp; sports">N 藝能運動</span></span>
      </div>`,
  `<div class="ui-eyebrow" data-en="DAZHUANG WIN CURRICULUM">大庄校訂課程三大主軸（WIN 架構）</div>
      <div class="ui-legend">
        <span><b class="ui-win">W</b><span data-en="W: Self-transcendence (Learning &amp; Knowledge)">W 庄進自強～超越自己（學習探索・閱讀奠基知識力）</span></span>
        <span><b class="ui-win">I</b><span data-en="I: Joyful Growth (Caring, Morality &amp; Fitness)">I 庄園窯啊餚～樂活成長（友善關懷・柴燒窯與可食植物實踐道德與體能力）</span></span>
        <span><b class="ui-win">N</b><span data-en="N: Railway Journey (Health, Aesthetics &amp; Fitness)">N 康庄鐵道行～藝術小旅行（健康樂活・鐵道鄉土美學策展）</span></span>
      </div>`
);
rep(
  '<p class="ui-help-note" data-en="Sources — courses: Dazhuang ES public curriculum info; news: Hsinchu City Education News (schnews.hc.edu.tw). News summaries are rewritten without personal names.">資料來源：課程：大庄國小 公開課程資訊與校園新聞；新聞：新竹市教育新聞網（schnews.hc.edu.tw）。新聞摘要已改寫，不含個人姓名。</p>',
  '<p class="ui-help-note" data-en="Sources — School Vision &amp; WIN Curriculum: Dazhuang ES Official Website (www.ttps.hc.edu.tw/nss/p/wish); Program &amp; Rules: 115th Academic Year &amp; 71st Anniversary Sports Day Regulations and Schedule; Race Results: Sports Day Individual Finals Database. All student names are de-identified with masking.">資料來源：學校願景三大基石與校訂課程三大主軸依據大庄國小官方網站（www.ttps.hc.edu.tw/nss/p/wish）；運動會賽程與各項規程依據大庄國小 115 學年度暨 71 週年校慶運動會競賽規程與程序表；個人賽決賽成績依據校慶賽況資料庫。所有小選手姓名皆落實去識別化遮罩。</p>'
);

// 手機版首頁介紹文字完整顯示（取消兩行截斷）
rep(
  `/* 手機品牌副標：最多兩行；開卡片／清單／旅程時收起，把畫面讓給地圖 */
@media (max-width:800px),(max-height:500px) and (orientation:landscape){
  .ui-brand-mob{display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  body.ui-card-open .ui-brand-mob,body.ui-side-open .ui-brand-mob,body.ui-journey-open .ui-brand-mob{display:none!important}
}`,
  `/* 手機品牌副標：完整顯示介紹文字；開卡片／清單／旅程時收起，把畫面讓給地圖 */
@media (max-width:800px),(max-height:500px) and (orientation:landscape){
  .ui-brand-mob{display:block!important;white-space:normal;overflow:visible;line-height:1.45;margin-top:4px}
  body.ui-card-open .ui-brand-mob,body.ui-side-open .ui-brand-mob,body.ui-journey-open .ui-brand-mob{display:none!important}
}`
);

// 六大賽區島嶼清單：標題與副標語意斷句、不截斷、五力藥丸標籤置頂呈現
rep(
  `return \`<details class="ui-isl" data-island="\${d.id}" \${isOpen ? 'open' : ''}>
          <summary>\${glyph(d)}<span class="ui-row-main"><span class="ui-row-name">\${d.num} \${hl(L(d, 'full'), terms)}</span><span class="ui-row-sub">\${sub.map(x => hl(x, terms)).join(' · ')}</span></span></summary>
          \${q ? '' : \`<p class="ui-isl-sum">\${uiEsc(L(d, 'lead') || L(d, 'summary'))}</p>\`}`,
  `const fullTitle = L(d, 'full') || '';
        const dotIdx = fullTitle.indexOf('・');
        const mainTitle = dotIdx > -1 ? fullTitle.slice(0, dotIdx) : fullTitle;
        const subTitle = dotIdx > -1 ? fullTitle.slice(dotIdx + 1) : '';
        const metaParts = [L(d, 'grade'), ...(uiPeriodsShort(d) || '').split('｜').map(s => s.trim()).filter(Boolean)].filter(Boolean);
        const leadRaw = L(d, 'lead') || L(d, 'summary') || '';
        const barIdx = leadRaw.indexOf('｜');
        const leadPower = barIdx > -1 ? leadRaw.slice(0, barIdx).trim() : '';
        const leadDesc = barIdx > -1 ? leadRaw.slice(barIdx + 1).trim() : leadRaw;
        const pClass = leadPower.includes('五力') ? 'sq-p-五力大圓滿'
          : leadPower.includes('美感') ? 'sq-p-美感力'
          : leadPower.includes('知識') ? 'sq-p-知識力'
          : leadPower.includes('道德') ? 'sq-p-道德力'
          : leadPower.includes('群體') ? 'sq-p-群體力'
          : 'sq-p-體能力';
        return \`<details class="ui-isl" data-island="\${d.id}" \${isOpen ? 'open' : ''}>
          <summary>\${glyph(d)}<span class="ui-row-main"><span class="ui-row-name sq-isl-namewrap"><span class="sq-isl-mainname">\${d.num} \${hl(mainTitle, terms)}</span>\${subTitle ? \`<span class="sq-isl-subname">\${hl(subTitle, terms)}</span>\` : ''}</span><span class="ui-row-sub sq-isl-submeta">\${metaParts.map((x, idx) => \`<span class="sq-isl-meta-line">\${idx === 0 ? '👥 ' : '⏰ '}\${hl(x, terms)}</span>\`).join('')}</span></span></summary>
          \${q ? '' : \`<div class="ui-isl-sum sq-isl-sumbox">\${leadPower ? \`<span class="sq-power-badge \${pClass}">\${uiEsc(leadPower)}</span>\` : ''}<span class="sq-isl-desc">\${uiEsc(leadDesc)}</span></div>\`}`
);

// sq-brand-actions 已內建於 sportsBrandHeader

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
  `const steps = [1, 2, 3].map(p => { const pn = String(uiPhaseName(p) || ''); const lp = pn.indexOf('('); const labelHtml = lp > 0 ? \`<span class="sq-step-name">\${uiEsc(pn.slice(0, lp).trim())}</span><span class="sq-step-time">\${uiEsc((pn.endsWith(')') ? pn.slice(lp + 1, -1) : pn.slice(lp + 1)).trim())}</span>\` : \`<span class="sq-step-name">\${uiEsc(pn)}</span>\`; return \`<div class="ui-step \${p === it.phase ? 'is-cur' : ''}"><i></i>\${labelHtml}</div>\`; }).join('');
    const now = uiSlotItems().includes(id);
    const whenParts = String(it.when || '').split(/[｜|]/).map(s => s.trim()).filter(Boolean);
    const whenHtml = whenParts.length ? \`<div class="sq-when-row"><span class="sq-when-lbl">⏰ 登場時段</span>\${whenParts.map(p => \`<span class="sq-when-badge">\${uiEsc(p)}</span>\`).join('')}</div>\` : '';
    return \`<button class="ui-back" type="button" data-sel="island:\${d.id}">\${uiSvg('back').replace('<svg', '<svg width="14" height="14" style="stroke:currentColor;fill:none;stroke-width:2.4"')}\${d.num} \${uiEsc(L(d, 'name'))}</button>
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

/* ================= 頂部品牌卡：折疊收合系統 (方案一正式採用) ================= */
.sq-brand-header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.sq-fold-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
  border: 1.2px solid rgba(2, 132, 199, 0.3);
  background: rgba(240, 249, 255, 0.95);
  color: #0284c7;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sq-fold-btn:hover {
  background: #e0f2fe;
  color: #0369a1;
  transform: translateY(-1px);
}

/* 精巧膠囊（收合狀態顯示） */
.sq-capsule-pill {
  display: none;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(2, 132, 199, 0.35);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
  color: #0369a1;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.sq-capsule-pill:hover {
  background: #f0fdfa;
  border-color: #0284c7;
  transform: translateY(-1px);
}
.sq-pill-icon { font-size: 14px; }
.sq-pill-title { font-weight: 900; font-size: 12.5px; }
.sq-pill-dot { opacity: 0.5; font-size: 12px; }
.sq-pill-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 1px solid #f59e0b;
}
.sq-pill-arrow { font-size: 11px; font-weight: 900; color: #0284c7; }

/* 重設按鈕與浮動提示 Toast */
.sq-danger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 14px;
  border: 1.5px solid rgba(239, 68, 68, 0.4);
  background: rgba(254, 242, 242, 0.9);
  color: #b91c1c;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.sq-danger-btn:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #991b1b;
  transform: translateY(-1px);
}

.sq-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(15, 23, 42, 0.94);
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(56, 189, 248, 0.4);
  pointer-events: none;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 999;
  white-space: nowrap;
}
.sq-toast.is-show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* 收合狀態 (.is-collapsed) */
#ui-brand.is-collapsed {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  max-width: none !important;
  width: auto !important;
}
#ui-brand.is-collapsed #sq-brand-body {
  display: none !important;
}
#ui-brand.is-collapsed #sq-capsule-pill {
  display: inline-flex !important;
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

/* ====== 闖關背景音樂浮動播放盒與跳動音波 ====== */
.sq-brand-pill.is-audio {
  background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
  border-color: #a855f7;
  color: #7e22ce;
}
.sq-brand-pill.is-audio:hover {
  background: #e9d5ff;
  color: #6b21a8;
  transform: translateY(-1px);
}
.sq-brand-pill.is-audio.is-muted {
  background: rgba(241, 245, 249, 0.95);
  border-color: #cbd5e1;
  color: #64748b;
}

.sq-bq-audio-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f3e8ff;
  border: 1px solid #c084fc;
  color: #7e22ce;
  border-radius: 9999px;
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.4;
}
.sq-bq-audio-btn:hover {
  background: #e9d5ff;
  transform: scale(1.03);
}
.sq-bq-audio-btn.is-muted {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #64748b;
}

.sq-eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
  margin-left: 4px;
  vertical-align: middle;
}
.sq-eq i {
  width: 2.5px;
  height: 100%;
  background: currentColor;
  border-radius: 1px;
  animation: sqEq 0.75s ease-in-out infinite alternate;
}
.sq-eq i:nth-child(2) { animation-delay: 0.18s; height: 70%; }
.sq-eq i:nth-child(3) { animation-delay: 0.36s; height: 90%; }
.sq-eq i:nth-child(4) { animation-delay: 0.12s; height: 50%; }
@keyframes sqEq {
  0% { height: 25%; }
  100% { height: 100%; }
}
.is-muted .sq-eq i {
  animation: none !important;
  height: 25% !important;
  opacity: 0.35;
}

.sq-music-widget {
  position: fixed;
  right: 12px;
  bottom: calc(var(--tab-h, 58px) + 68px);
  z-index: 25;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  font-family: inherit;
  pointer-events: auto;
}
@media (max-height: 500px) and (orientation: landscape) {
  .sq-music-widget {
    bottom: 14px;
    right: 14px;
  }
}
@media (max-width: 900px) {
  .sq-music-toggle-btn,
  .sq-music-menu-btn {
    padding: 6px 11px;
    font-size: 11.5px;
  }
}
@media (min-width: 901px) {
  .sq-music-widget {
    right: 18px;
    bottom: 22px;
  }
}
.sq-music-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid #a855f7;
  box-shadow: 0 4px 18px rgba(168, 85, 247, 0.25);
  color: #7e22ce;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}
.sq-music-toggle-btn:hover {
  transform: translateY(-2px) scale(1.02);
  background: #faf5ff;
  border-color: #9333ea;
  box-shadow: 0 6px 22px rgba(168, 85, 247, 0.35);
}
.sq-music-toggle-btn.is-muted {
  background: rgba(248, 250, 252, 0.92);
  border-color: #cbd5e1;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.sq-music-btn-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sq-music-menu-btn {
  padding: 8px 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid #cbd5e1;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}
.sq-music-menu-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
}
.sq-mp-power-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1.5px solid #ef4444;
  background: #fef2f2;
  color: #dc2626;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sq-mp-power-btn:hover {
  background: #fee2e2;
  transform: translateY(-1px);
}
.sq-mp-power-btn.is-muted {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #15803d;
}
.sq-music-pop {
  width: 260px;
  background: rgba(255, 255, 255, 0.96);
  border: 1.5px solid rgba(168, 85, 247, 0.35);
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: sqPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.sq-music-pop[hidden] {
  display: none !important;
}
@keyframes sqPopIn {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.sq-mp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 900;
  font-size: 13px;
  color: #6b21a8;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f3e8ff;
}
.sq-mp-close {
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
}
.sq-mp-close:hover { background: #fee2e2; color: #ef4444; }
.sq-mp-tracks {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}
.sq-mp-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid #e9d5ff;
  background: #faf5ff;
  color: #581c87;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}
.sq-mp-track:hover {
  background: #f3e8ff;
  border-color: #c084fc;
  transform: translateX(2px);
}
.sq-mp-track.is-active {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  border-color: #6d28d9;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(124, 58, 237, 0.25);
}
.sq-mp-vol {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #475569;
  font-weight: 700;
}
.sq-mp-vol-btn {
  flex: 1;
  padding: 4px 6px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sq-mp-vol-btn.is-active {
  background: #e0e7ff;
  border-color: #6366f1;
  color: #3730a3;
  font-weight: 800;
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
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}
.sq-bq-head-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.sq-bq-head-left {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}
.sq-bq-head-sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
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
  white-space: nowrap;
}
.sq-bq-status {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #b45309;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(245, 158, 11, 0.35);
  white-space: nowrap;
  flex-shrink: 0;
}
.sq-bq-status.is-done {
  color: #065f46;
  background: #d1fae5;
  border-color: rgba(16, 185, 129, 0.4);
}
.sq-bq-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.4;
  text-wrap: balance;
}
.sq-bq-desc {
  margin: 0 0 10px;
  font-size: 12.5px;
  color: #334155;
  line-height: 1.5;
  text-wrap: balance;
}
.sq-bq-seq-prompt {
  font-size: 12px;
  color: #475569;
  margin-bottom: 8px;
  font-weight: 700;
  line-height: 1.45;
}
.sq-when-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 6px 0 8px;
}
.sq-when-lbl {
  font-size: 11.5px;
  font-weight: 800;
  color: #0369a1;
}
.ui-step {
  min-width: 0;
}
.sq-step-name {
  display: block;
  max-width: 100%;
  font-size: 12px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sq-step-time {
  display: inline-block;
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 700;
  color: #475569;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 1px 6px;
  border-radius: 999px;
  white-space: nowrap;
}
.ui-step.is-cur .sq-step-time {
  background: #fff7ed;
  color: #b45309;
  border-color: rgba(219, 106, 65, 0.35);
}
/* 賽場重點卡片 (.ui-tile) 置中排版 */
.ui-tile {
  justify-content: center !important;
  align-items: center !important;
  text-align: center;
  padding: 12px 8px !important;
  gap: 3px;
}
.ui-tile-pre, .ui-tile-suf {
  text-align: center;
  line-height: 1.35;
  overflow-wrap: anywhere;
  word-break: break-word;
  text-wrap: balance;
}
.ui-tile-num {
  text-align: center;
  line-height: 1.1;
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
  font-weight: 800;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}
.sq-bq-seq-btn.is-wrong {
  animation: sqShake 0.35s ease;
  border-color: #ef4444 !important;
  background: #fee2e2 !important;
  color: #b91c1c !important;
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
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 11px;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sq-opt-key {
  flex-shrink: 0;
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #0369a1;
  font-size: 11.5px;
  font-weight: 900;
}
.sq-bq-opt.is-correct .sq-opt-key {
  background: #10b981;
  color: #ffffff;
}
.sq-bq-opt.is-wrong .sq-opt-key {
  background: #ef4444;
  color: #ffffff;
}
.sq-opt-txt {
  flex: 1;
  min-width: 0;
}
.sq-opt-seg {
  display: inline-block;
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

/* 通用現代 Dialog 樣式（完美適配手機版 Safari / Chrome 網址列與動態島） */
.sq-dialog {
  border: none;
  border-radius: 24px;
  padding: 0;
  max-width: 620px;
  width: calc(100vw - 28px);
  box-sizing: border-box;
  /* 支援 svh (Small Viewport) / dvh (Dynamic Viewport)，扣除瀏覽器網址列與工具列 */
  max-height: calc(100svh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 52px);
  max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 52px);
  max-height: 82vh;
  background: linear-gradient(165deg, #ffffff 0%, #f0f9ff 55%, #ecfdf5 100%);
  color: #0f172a;
  box-shadow: 0 24px 60px rgba(2, 132, 199, 0.28), 0 0 0 2px rgba(16, 185, 129, 0.3);
  font-family: system-ui, -apple-system, "Segoe UI", "Microsoft JhengHei", sans-serif;
  /* 防止 margin: auto 將卡片頂端推入負座標/網址列下方 */
  margin: auto;
  margin-top: max(env(safe-area-inset-top, 0px) + 24px, 44px);
  margin-bottom: max(env(safe-area-inset-bottom, 0px) + 16px, 20px);
}
.sq-dialog.sq-dialog-wide {
  max-width: 820px;
}
.sq-dlg-inner {
  padding: 18px 24px 22px;
  overflow-y: auto;
  max-height: calc(100svh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 52px);
  max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 52px);
  max-height: 80vh;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}
.sq-dlg-head {
  position: sticky;
  top: -18px;
  background: rgba(255, 255, 255, 0.96);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  z-index: 25;
  padding: 12px 0 10px 0;
  margin: -18px 0 14px 0;
  border-bottom: 1.5px solid rgba(2, 132, 199, 0.15);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
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
  width: 38px;
  height: 38px;
  min-width: 38px;
  min-height: 38px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.sq-dlg-close:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
  transform: scale(1.05);
}
.sq-dlg-close:active {
  transform: scale(0.92);
}

/* 行動裝置專屬優化（針對 Safari / Chrome 手機動態網址列與動態島安全區） */
@media (max-width: 768px) {
  .sq-dialog {
    position: fixed !important;
    top: max(env(safe-area-inset-top, 0px) + 54px, 58px) !important;
    bottom: auto !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    margin: 0 !important;
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px) !important;
    border-radius: 20px !important;
    max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 72px) !important;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35) !important;
  }
  .sq-dialog.sq-dialog-wide {
    max-width: calc(100vw - 20px) !important;
  }
  .sq-dlg-inner {
    padding: 16px 16px 22px !important;
    max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 72px) !important;
  }
  .sq-dlg-head {
    position: sticky !important;
    top: 0 !important;
    margin: 0 0 12px 0 !important;
    padding: 4px 0 10px 0 !important;
    background: rgba(255, 255, 255, 0.98) !important;
  }
  .sq-dlg-title {
    font-size: 17.5px;
    line-height: 1.25;
  }
  .sq-dlg-kicker {
    font-size: 11px;
    padding: 2px 8px;
  }
  .sq-dlg-close {
    width: 38px;
    height: 38px;
    min-width: 38px;
    min-height: 38px;
    font-size: 17px;
  }
}

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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}
.sq-role-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}
.sq-role-card > span {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.45;
}
.sq-rc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.sq-rc-top strong {
  white-space: nowrap;
  font-size: 14px;
  color: #0f172a;
}
.sq-mob-sep {
  display: inline;
}
@media (max-width: 768px) {
  .sq-mob-sep {
    display: none;
  }
  .sq-label-note {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }
  .sq-role-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .sq-role-card {
    padding: 10px 12px;
  }
}
.sq-rc-diff {
  font-size: 10.5px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  white-space: nowrap;
}
.sq-rc-diff.diff-easy, .sq-bq-diff-badge.diff-easy { background: #ecfdf5; color: #065f46; border: 1px solid #10b981; }
.sq-rc-diff.diff-medium, .sq-bq-diff-badge.diff-medium { background: #e0f2fe; color: #0369a1; border: 1px solid #0284c7; }
.sq-rc-diff.diff-hard, .sq-bq-diff-badge.diff-hard { background: #fef2f2; color: #991b1b; border: 1px solid #ef4444; }
.sq-rc-diff.diff-parent, .sq-bq-diff-badge.diff-parent { background: #fff7ed; color: #9a3412; border: 1px solid #f97316; }
.sq-rc-diff.diff-alumni, .sq-bq-diff-badge.diff-alumni { background: #fdf4ff; color: #86198f; border: 1px solid #c026d3; }

.sq-bq-diff-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.sq-role-hint-box {
  margin: 8px 0;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  line-height: 1.55;
  display: block;
}
.sq-role-hint-box.diff-easy {
  background: #ecfdf5;
  border-left: 4px solid #10b981;
  color: #065f46;
}
.sq-role-hint-box.diff-hard {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
}
.sq-role-hint-box.diff-parent {
  background: #fff7ed;
  border-left: 4px solid #f97316;
  color: #9a3412;
}
.sq-role-hint-box.diff-alumni {
  background: #fdf4ff;
  border-left: 4px solid #c026d3;
  color: #86198f;
}
.sq-role-hint-box.diff-medium {
  background: #f0f9ff;
  border-left: 4px solid #0284c7;
  color: #0369a1;
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
  -webkit-overflow-scrolling: touch;
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
  white-space: nowrap;
}
.sq-p-美感力 { background: #cffafe; color: #0e7490; }
.sq-p-群體力 { background: #d1fae5; color: #047857; }
.sq-p-道德力 { background: #e0f2fe; color: #0369a1; }
.sq-p-知識力 { background: #ccfbf1; color: #0f766e; }
.sq-p-體能力 { background: #ede9fe; color: #6d28d9; }
.sq-p-五力大圓滿 { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; border: 1px solid #f59e0b; }

/* 六大賽區島嶼清單排版優化 */
.sq-isl-namewrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: normal;
}
.sq-isl-mainname {
  font-weight: 900;
  font-size: 14.5px;
  color: #0f172a;
  line-height: 1.3;
  white-space: nowrap;
}
.sq-isl-subname {
  font-weight: 700;
  font-size: 12.5px;
  color: #0369a1;
  line-height: 1.35;
}
.ui-isl .ui-row-sub.sq-isl-submeta {
  display: flex !important;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
  -webkit-line-clamp: unset !important;
  overflow: visible !important;
}
.sq-isl-meta-line {
  display: block;
  font-size: 11.5px;
  color: #475569;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sq-isl-sumbox {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin: 6px 0 8px;
}
.sq-isl-desc {
  font-size: 12.5px;
  color: #334155;
  line-height: 1.5;
}
.sq-gstory-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}
.sq-gstory-sub {
  display: inline !important;
  font-size: 13.5px !important;
  color: #0f172a;
}
.sq-gt-pbadge {
  display: none;
}
.sq-gt-time {
  display: block;
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
  white-space: nowrap;
}
/* 島嶼詳情卡 (#ui-card) 標題、五力藥丸與賽程時段排版優化 */
.sq-card-title {
  display: block;
  font-size: 19px;
  font-weight: 900;
  line-height: 1.25;
  color: #0f172a;
  white-space: nowrap;
}
.sq-card-sub {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: #0369a1;
  line-height: 1.4;
  margin-top: 3px;
  text-wrap: balance;
}
.sq-card-powerrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin: 8px 0 4px;
}
.sq-p-cross {
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
}
#ui-card .ui-lead {
  margin-top: 2px;
  font-size: 13.5px;
  line-height: 1.55;
  text-wrap: balance;
}
.sq-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 10px 0 12px;
}
.sq-card-metalbl {
  font-size: 11.5px;
  font-weight: 800;
  color: #0369a1;
  letter-spacing: 0.4px;
  margin-right: 2px;
}
.ui-meta-chip.sq-card-timechip {
  white-space: normal;
  line-height: 1.35;
  padding: 5px 10px;
  border-radius: 14px;
  border: 1px solid rgba(2, 132, 199, 0.16);
}
@media (max-width: 768px) {
  #ui-card .ui-head {
    align-items: flex-start;
  }
  #ui-card .ui-head h2 {
    margin: 0;
  }
  .sq-card-title {
    font-size: 18px;
  }
  .sq-card-sub {
    font-size: 13px;
  }
  .ui-isl-tags .ui-meta {
    gap: 6px;
  }
  .ui-vis, .ui-wintag {
    white-space: normal;
    line-height: 1.3;
    border-radius: 14px;
  }
  .ui-units li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px 8px;
    padding: 10px 12px;
  }
  .ui-unit-wk {
    order: 1;
    min-width: auto;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(219, 106, 65, 0.1);
    font-size: 11px;
    line-height: 1.2;
  }
  .ui-unit-p {
    order: 2;
    margin-left: auto;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.06);
    color: #334155;
    font-size: 11px;
    line-height: 1.2;
  }
  .ui-unit-name {
    order: 3;
    flex: 1 1 100%;
    font-size: 13.5px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.5;
    text-wrap: balance;
  }
  .sq-unit-seg {
    display: inline-block;
  }
  .ui-honor-item {
    padding: 10px 12px;
    gap: 5px;
  }
  .ui-honor-ttl {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .sq-honor-event {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    line-height: 1.4;
  }
  .sq-honor-winner {
    display: block;
    font-size: 14px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.45;
  }
  .sq-honor-sub {
    display: block;
    font-size: 12.5px;
    font-weight: 600;
    color: #475569;
    line-height: 1.45;
    text-wrap: balance;
  }
  .ui-hk-sprint { background: #ede9fe !important; color: #6d28d9 !important; }
  .ui-hk-relay { background: #d1fae5 !important; color: #047857 !important; }
  .ui-hk-moral { background: #e0f2fe !important; color: #0369a1 !important; }
  .sq-bq-q, .sq-bq-fb {
    line-height: 1.5;
    text-wrap: balance;
  }
  .sq-bq-foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .sq-bq-foot > div {
    flex-wrap: wrap;
    gap: 6px !important;
  }
  .sq-when-row {
    gap: 6px;
    margin: 6px 0 12px;
  }
  .sq-when-lbl {
    width: 100%;
  }
  .sq-when-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid rgba(2, 132, 199, 0.2);
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.35;
    white-space: normal;
  }
  .sq-step-name {
    font-size: 11.5px;
  }
  .sq-step-time {
    font-size: 10px;
    padding: 1px 5px;
  }
  .ui-tiles {
    gap: 6px;
  }
  .ui-tile {
    padding: 10px 6px !important;
  }
  .ui-tile-num {
    font-size: 24px;
  }
  .ui-tile-num.is-long {
    font-size: 17.5px;
  }
  .ui-tile-num.is-xlong {
    font-size: 13px;
    white-space: normal;
  }
  .ui-tile-pre, .ui-tile-suf {
    font-size: 11px;
  }
  .sq-isl-meta-line {
    white-space: normal;
  }
  body.ui-side-open #sq-music-widget,
  body.ui-card-open #sq-music-widget,
  body.ui-journey-open #sq-music-widget {
    display: none !important;
  }
  .ui-gtable thead {
    display: none;
  }
  .ui-gtable,
  .ui-gtable tbody,
  .ui-gtable tr,
  .ui-gtable th,
  .ui-gtable td {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }
  .ui-gtable tr {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px 12px;
    margin-bottom: 8px;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
  }
  .ui-gtable tbody th {
    width: 100%;
    padding: 0 0 6px 0;
    border-bottom: 1px dashed #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .ui-gtable tbody th .ui-gt-isl {
    white-space: nowrap;
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
    min-height: 24px;
    align-items: center;
  }
  .ui-gtable tbody th .ui-gt-isl .ui-dot {
    margin-top: 0;
  }
  .sq-gt-pbadge {
    display: inline-block;
  }
  .ui-gtable td:nth-child(2) {
    width: 100%;
    padding: 6px 0 4px 0;
    border-bottom: none;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .sq-gt-time {
    white-space: normal;
  }
  .ui-gtable td:nth-child(3) {
    width: 100%;
    padding: 4px 0 0 0;
    border-bottom: none;
    font-size: 12.5px;
    color: #334155;
    line-height: 1.5;
  }
  .ui-gt-ev {
    gap: 6px 8px;
    margin-top: 8px;
  }
  .ui-gt-ev > span:first-child {
    width: 100%;
    font-size: 12px;
    font-weight: 800;
    color: #0369a1;
  }
  .ui-gt-ev .ui-gt-isl {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 12.5px;
    font-weight: 700;
    color: #0f172a;
    align-items: center;
    min-height: 28px;
  }
  .ui-gt-ev .ui-gt-isl .ui-dot {
    margin-top: 0;
  }
}

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
  flex-shrink: 0;
}
.sq-qcta-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sq-qcta-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
}
.sq-qcta-titlewrap {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.sq-qcta-title {
  font-size: 13.5px;
  font-weight: 900;
  color: #0369a1;
  white-space: nowrap;
}
.sq-qcta-status {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.88);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.35);
  white-space: nowrap;
}
.sq-qcta-status.is-done {
  background: #d1fae5;
  color: #065f46;
  border-color: rgba(16, 185, 129, 0.4);
}
.sq-qcta-desc {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12.5px;
  color: #334155;
  line-height: 1.45;
}
.sq-qcta-line {
  display: block;
}
@media (max-width: 768px) {
  .sq-card-quest-cta {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px 14px;
  }
  .sq-card-quest-cta button {
    width: 100%;
    padding: 9px 14px;
    font-size: 13.5px;
  }
}


/* 16 項個人賽與決賽英雄榜樣式 */
.sq-race-stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.sq-stat-card {
  background: #ffffff;
  border: 1.5px solid #e0f2fe;
  border-radius: 12px;
  padding: 8px 10px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.05);
}
.sq-stat-val {
  display: block;
  font-size: 20px;
  font-weight: 900;
  color: #0284c7;
  line-height: 1.2;
}
.sq-stat-lbl {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-top: 2px;
}
.sq-race-toolbar {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 12px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sq-race-filters-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.sq-filter-label {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  min-width: 44px;
}
.sq-chip-group {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.sq-view-toggle {
  margin-left: auto;
  display: flex;
  gap: 5px;
}
.sq-race-search-box {
  position: relative;
  width: 100%;
}
.sq-search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 32px 8px 12px;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  background: #ffffff;
  transition: all 0.2s;
}
.sq-search-input:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}
.sq-search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
}
.sq-races-mount {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sq-race-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.sq-race-card-head {
  background: linear-gradient(90deg, #f0fdf4 0%, #f0f9ff 100%);
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.sq-race-title {
  font-weight: 900;
  font-size: 14px;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sq-grade-pill {
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}
.sq-nw {
  white-space: nowrap;
}
.sq-mob-br {
  display: inline;
}
.sq-race-meta {
  font-size: 11.5px;
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
}
.sq-toggle-table-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 700;
  color: #0284c7;
  cursor: pointer;
  white-space: nowrap;
}
.sq-toggle-table-btn:hover {
  background: #f0f9ff;
  border-color: #0284c7;
}
.sq-race-card-body {
  padding: 10px 14px 14px 14px;
}
.sq-finalists-subhead {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  margin-bottom: 8px;
  line-height: 1.45;
}
@media (max-width: 768px) {
  .sq-mob-br {
    display: block;
  }
  .sq-race-card-head {
    padding: 10px 12px;
    gap: 6px;
  }
  .sq-race-meta {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .sq-race-dates {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    line-height: 1.45;
  }
  .sq-sub-note {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    margin-top: 2px;
  }
  .sq-finalist-item {
    padding: 8px 10px;
    gap: 8px;
  }
}
.sq-finalists-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 8px;
}
.sq-finalist-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
}
.sq-finalist-item.is-gold {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1.5px solid #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}
.sq-finalist-item.is-silver {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1.5px solid #94a3b8;
  box-shadow: 0 2px 6px rgba(148, 163, 184, 0.15);
}
.sq-finalist-item.is-bronze {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 1.5px solid #f97316;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.15);
}
.sq-finalist-item.is-dns {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  opacity: 0.8;
}
.sq-finalist-item.is-matched {
  border-color: #f59e0b !important;
  background: #fffbeb !important;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3) !important;
}
.sq-rank-medal {
  font-size: 14px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.sq-score-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 900;
  font-size: 13px;
  color: #0284c7;
  background: #e0f2fe;
  padding: 2px 6px;
  border-radius: 6px;
}
.sq-award-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
.sq-award-badge.is-gold {
  background: #fef08a;
  color: #854d0e;
  border: 1px solid #facc15;
}
.sq-award-badge.is-silver {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}
.sq-award-badge.is-bronze {
  background: #fed7aa;
  color: #9a3412;
  border: 1px solid #fdba74;
}
.sq-award-badge.is-cert {
  background: #e2e8f0;
  color: #475569;
  border: 1px solid #cbd5e1;
}
.sq-award-badge.is-dns {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
.sq-q-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.sq-q-badge.is-Q {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}
.sq-q-badge.is-q {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}
.sq-table-compact th, .sq-table-compact td {
  padding: 5px 8px;
  font-size: 12px;
}
.sq-table tr.is-matched-row td {
  background: #fef3c7 !important;
  color: #92400e;
  font-weight: 800;
}
.sq-table tr.is-q-row td {
  background: #f0fdf4;
}
.sq-table tr.is-smallq-row td {
  background: #f0f9ff;
}
.sq-rules-details {
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 10px 14px;
  background: #f8fafc;
}
.sq-rules-summary {
  font-size: 12.5px;
  font-weight: 800;
  color: #0284c7;
  cursor: pointer;
  user-select: none;
  line-height: 1.4;
}
.sq-rule-head {
  margin-bottom: 6px;
  line-height: 1.45;
}
.sq-rule-period {
  font-weight: 700;
  color: #0369a1;
}
.sq-rule-item {
  margin-top: 6px;
  line-height: 1.6;
}
.sq-rule-tip {
  margin-top: 5px;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(254, 243, 199, 0.75);
  color: #92400e;
  font-weight: 800;
  font-size: 12px;
  line-height: 1.45;
}
#sq-pre-table th,
#sq-pre-table td {
  white-space: nowrap;
}
#sq-pre-table th:last-child,
#sq-pre-table td:last-child {
  white-space: normal;
  min-width: 220px;
  line-height: 1.5;
}
@media (max-width: 768px) {
  .sq-rules-details {
    padding: 9px 10px;
  }
  .sq-rules-summary {
    font-size: 12px;
  }
  .sq-rules-details .sq-clue-box {
    padding: 10px 11px;
    font-size: 12px;
  }
  .sq-rule-period {
    font-size: 11.5px;
  }
  #sq-pre-table {
    font-size: 12px;
  }
  #sq-pre-table th,
  #sq-pre-table td {
    padding: 7px 8px;
  }
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
        <h2 class="sq-dlg-title" id="sq-reg-title"><span class="sq-nw">🏃 運動員入場註冊</span><span class="sq-mob-sep">・</span><span class="sq-mob-br sq-nw">領取五力集章護照</span></h2>
      </div>
      <button type="button" class="sq-dlg-close" data-sq-close="sq-reg-dialog" aria-label="關閉">✕</button>
    </div>
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.5;">
      歡迎登上<strong>《奔馳榮耀島・五力飛揚》</strong>！請輸入你的姓名並選擇代表身分。點選地圖上 <strong>6 座島嶼中的 19 座建築地標</strong>，每座建築都有專屬的<strong>互動闖關任務</strong>，集滿 5 枚五力印章就能引燃中央聖火台<strong>全景 3D 勝利煙火</strong>並獲得專屬金牌證書！
    </p>
    <div class="sq-form-group">
      <label class="sq-form-label" for="sq-input-name"><span class="sq-nw">✍️ 運動員／挑戰者姓名</span><span class="sq-mob-br sq-label-note sq-nw">（將印製於五力金牌證書上）：</span></label>
      <input type="text" id="sq-input-name" class="sq-name-input" placeholder="例如：王小明、三年甲班陳同學、熱血林爸爸" maxlength="20" />
    </div>
    <div class="sq-form-group">
      <label class="sq-form-label">🎽 選擇你的參賽代表身分：</label>
      <div class="sq-role-grid" id="sq-role-grid">
        <button type="button" class="sq-role-card is-active" data-role="低年級小選手" data-icon="🐯">
          <div class="sq-rc-top"><strong>🐯 低年級小選手</strong> <span class="sq-rc-diff diff-easy">⭐ 入門友善</span></div>
          <span>難度入門：充能門檻減半、附專屬小選手答題錦囊，輕鬆集章！</span>
        </button>
        <button type="button" class="sq-role-card" data-role="中年級飛毛腿" data-icon="⚡">
          <div class="sq-rc-top"><strong>⚡ 中年級飛毛腿</strong> <span class="sq-rc-diff diff-medium">⭐⭐ 標準進階</span></div>
          <span>標準難度：標準賽程挑戰、紫色跑道起跑反應與運動常識考驗</span>
        </button>
        <button type="button" class="sq-role-card" data-role="高年級破風手" data-icon="🔥">
          <div class="sq-rc-top"><strong>🔥 高年級破風手</strong> <span class="sq-rc-diff diff-hard">⭐⭐⭐ 競速破風</span></div>
          <span>高難度挑戰：手速爆發連擊充能、嚴格起跑評等、專業賽事無提示！</span>
        </button>
        <button type="button" class="sq-role-card" data-role="熱血應援家長" data-icon="📸">
          <div class="sq-rc-top"><strong>📸 熱血應援家長</strong> <span class="sq-rc-diff diff-parent">⭐⭐ 親子應援</span></div>
          <span>親子難度：活力應援鼓掌連擊、親子觀賽亮點小貼士與攝影視角</span>
        </button>
        <button type="button" class="sq-role-card" data-role="親善校友貴賓" data-icon="🏅">
          <div class="sq-rc-top"><strong>🏅 親善校友貴賓</strong> <span class="sq-rc-diff diff-alumni">⭐⭐⭐ 校友薪傳</span></div>
          <span>傳承難度：薪傳蓄力連擊、校史榮耀考驗、重溫大庄 71 年風華！</span>
        </button>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;">
      <button type="button" class="sq-primary-btn" id="sq-reg-submit" style="flex:1;">🚀 儲存身分設定，出發闖關！</button>
      <button type="button" class="sq-danger-btn" id="sq-btn-reset-data" title="清除所有五力印章與建築過關紀錄，重新開始">🔄 重設闖關紀錄（重新開始）</button>
    </div>
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
        <h2 class="sq-dlg-title" id="sq-sched-title"><span class="sq-nw">📅「七一大庄、五力飛揚」</span><span class="sq-mob-br">校慶運動會程序表＆競賽規程</span></h2>
      </div>
      <button type="button" class="sq-dlg-close" data-sq-close="sq-schedule-dialog" aria-label="關閉">✕</button>
    </div>
    <div class="sq-tabs">
      <button type="button" class="sq-tab is-active" data-sq-tab="prog">📅 當日程序表（01–32 項）</button>
      <button type="button" class="sq-tab" data-sq-tab="pre">🏃 個人賽決賽成績＆戰報</button>
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
              <th>3D 定位</th>
            </tr>
          </thead>
          <tbody id="sq-prog-tbody"></tbody>
        </table>
      </div>
    </div>
    <div id="sq-pane-pre" hidden>
      <!-- 頂部四大數據統計卡 -->
      <div class="sq-race-stats-bar">
        <div class="sq-stat-card">
          <span class="sq-stat-val">16</span>
          <span class="sq-stat-lbl">個人賽單項</span>
        </div>
        <div class="sq-stat-card">
          <span class="sq-stat-val">240</span>
          <span class="sq-stat-lbl">參賽短跑健將</span>
        </div>
        <div class="sq-stat-card">
          <span class="sq-stat-val">96</span>
          <span class="sq-stat-lbl">決賽英雄榜</span>
        </div>
        <div class="sq-stat-card">
          <span class="sq-stat-val">48 面</span>
          <span class="sq-stat-lbl">大會獎牌(金銀銅)</span>
        </div>
      </div>

      <!-- 搜尋與篩選工具列 -->
      <div class="sq-race-toolbar">
        <div class="sq-race-filters-row">
          <span class="sq-filter-label">年級：</span>
          <div class="sq-chip-group" id="sq-race-grade-chips">
            <button type="button" class="sq-chip is-active" data-rgrade="ALL">全部 (16)</button>
            <button type="button" class="sq-chip" data-rgrade="3">三年級 (4)</button>
            <button type="button" class="sq-chip" data-rgrade="4">四年級 (4)</button>
            <button type="button" class="sq-chip" data-rgrade="5">五年級 (4)</button>
            <button type="button" class="sq-chip" data-rgrade="6">六年級 (4)</button>
          </div>
        </div>
        <div class="sq-race-filters-row">
          <span class="sq-filter-label">性別：</span>
          <div class="sq-chip-group" id="sq-race-gender-chips">
            <button type="button" class="sq-chip is-active" data-rgender="ALL">全部性別</button>
            <button type="button" class="sq-chip" data-rgender="男">👦 男生組 (8)</button>
            <button type="button" class="sq-chip" data-rgender="女">👧 女生組 (8)</button>
          </div>
          <div class="sq-view-toggle">
            <button type="button" class="sq-chip is-active" id="sq-btn-view-finalists">🏅 決賽 6 強榜</button>
            <button type="button" class="sq-chip" id="sq-btn-view-all">📋 完整 3 組道次</button>
          </div>
        </div>
        <div class="sq-race-search-box">
          <input type="search" id="sq-race-search-input" class="sq-search-input" placeholder="🔍 搜尋姓名、班級（如：四丙、林○僑）" autocomplete="off">
          <button type="button" class="sq-search-clear" id="sq-race-search-clear" hidden>✕</button>
        </div>
      </div>

      <!-- 16 項個人賽卡片與成績渲染容器 -->
      <div id="sq-races-mount" class="sq-races-mount"></div>

      <!-- 競賽規程重點與賽程日程總表（折疊） -->
      <details class="sq-rules-details" style="margin-top:16px;">
        <summary class="sq-rules-summary">
          <span>📌 運動會競賽規程重點與日程總表<span class="sq-nw">（展開／收合）</span></span>
        </summary>
        <div class="sq-clue-box" style="margin: 10px 0 12px 0;">
          <div class="sq-rule-head"><strong>📌 71 週年校慶運動會競賽規程重點</strong><span class="sq-mob-br sq-rule-period sq-nw">（比賽期間：115 年 10 月 21 日至 12 月 12 日）</span></div>
          <div class="sq-rule-item">• <strong>個人項目</strong>：三～六年級男、女生各取前三名頒發獎牌及獎狀，四～六名頒發獎狀。中年級跑 60m、100m；高年級跑 100m、200m（預賽每班男女各派 3 人分 3 組，每組取 1 名＋擇優 3 名晉級 6 人決賽）。</div>
          <div class="sq-rule-item">• <strong>團體大隊接力</strong>：三～六年級前三名班級頒發錦旗。每班女生 8 人（前 8 棒）、男生 8 人（後 8 棒）。中年級每人跑半圈（第 3 棒搶第 1 道）；高年級每人跑一圈（第 2 棒搶第 1 道）。<div class="sq-rule-tip">※ 超越前方選手時，應加速從前方選手的右側（外側跑道）超越！</div></div>
        </div>
        <div class="sq-table-wrap">
          <table class="sq-table" id="sq-pre-table">
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
      </details>
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
    <div style="margin-top:16px;text-align:right;"><button type="button" class="sq-primary-btn" data-sq-close="sq-schedule-dialog" style="padding:8px 18px;font-size:13px;">✕ 關閉此視窗</button></div>
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
      <button type="button" class="sq-danger-btn" id="sq-btn-reset-cert" style="justify-content:center;">🔄 重設闖關紀錄（重新開始）</button>
    </div>
  </div>
</dialog>

<!-- 浮動闖關音樂播放盒 -->
<div class="sq-music-widget" id="sq-music-widget">
  <div class="sq-music-pop" id="sq-music-pop" hidden>
    <div class="sq-mp-head">
      <span>🎼 闖關背景音樂設定</span>
      <button type="button" class="sq-mp-close" id="sq-mp-close" aria-label="關閉音樂選單">✕</button>
    </div>
    <div style="margin-bottom:10px;">
      <button type="button" class="sq-mp-power-btn" id="sq-mp-power-btn">⏹️ 關閉音樂 (靜音)</button>
    </div>
    <div class="sq-mp-tracks">
      <button type="button" class="sq-mp-track is-active" data-track="0">🏃 熱血運動會進行曲 <span>▶</span></button>
      <button type="button" class="sq-mp-track" data-track="1">🌊 香山海風舒緩律動 <span>▶</span></button>
      <button type="button" class="sq-mp-track" data-track="2">👾 8-Bit 像素闖關曲 <span>▶</span></button>
    </div>
    <div class="sq-mp-vol">
      <span>🔊 音量：</span>
      <button type="button" class="sq-mp-vol-btn" data-vol="0">🔇 關閉/靜音</button>
      <button type="button" class="sq-mp-vol-btn" data-vol="0.18">微風 20%</button>
      <button type="button" class="sq-mp-vol-btn is-active" data-vol="0.38">標準 50%</button>
      <button type="button" class="sq-mp-vol-btn" data-vol="0.75">熱血 100%</button>
    </div>
  </div>
  <div class="sq-music-btn-group">
    <button type="button" class="sq-music-toggle-btn" id="sq-music-main-btn" title="一鍵開關闖關背景音樂">
      <span class="sq-music-icon" id="sq-music-icon">🎵</span>
      <span class="sq-music-name" id="sq-music-name">熱血進行曲 (點擊關閉)</span>
      <span class="sq-eq" id="sq-music-eq"><i></i><i></i><i></i><i></i></span>
    </button>
    <button type="button" class="sq-music-menu-btn" id="sq-music-menu-btn" title="切換曲目與音量設定">
      🎼 選曲
    </button>
  </div>
</div>

`;

rep('<script type="importmap">', customHtml + '\n<script type="importmap">');

// ---- 7. 注入五力護照互動邏輯、3D 勝利煙火粒子系統與金牌證書繪製引擎 ----
const customLogic = `
// ================= 五力集章護照（Quest Passport）＆ 3D 勝利煙火系統 =================
function initSportsQuest(ctx) {
  window.__ctx = ctx;
  const STORAGE_KEY = 'sq-passport-v1';

  // ====== 闖關 Web Audio 引擎（多曲風背景音樂 BGM ＆ 闖關音效 SFX） ======
  const soundEngine = (() => {
    let audioCtx = null;
    let bgmSource = null;
    let bgmGain = null;
    let sfxGain = null;
    let isPlaying = false;
    let muted = false;
    let curVol = 0.38;
    let curTrack = 0;
    const bgmBuffers = [null, null, null];

    const TRACK_NAMES = ['🏃 熱血運動會進行曲', '🌊 香山海風舒緩律動', '👾 8-Bit 像素闖關曲'];

    try {
      muted = localStorage.getItem('sq-bgm-muted') === '1';
      const savedVol = parseFloat(localStorage.getItem('sq-bgm-vol') || '0.38');
      if (!isNaN(savedVol) && savedVol >= 0 && savedVol <= 1) curVol = savedVol;
      const savedTrack = parseInt(localStorage.getItem('sq-bgm-track') || '0', 10);
      if (!isNaN(savedTrack) && savedTrack >= 0 && savedTrack < 3) curTrack = savedTrack;
    } catch(e) {}

    const initContext = () => {
      if (audioCtx) return audioCtx;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      try {
        audioCtx = new AudioContextClass();
        bgmGain = audioCtx.createGain();
        bgmGain.gain.setValueAtTime(muted ? 0 : curVol, audioCtx.currentTime);
        bgmGain.connect(audioCtx.destination);

        sfxGain = audioCtx.createGain();
        sfxGain.gain.setValueAtTime(muted ? 0 : 0.45, audioCtx.currentTime);
        sfxGain.connect(audioCtx.destination);
      } catch(e) {
        audioCtx = null;
      }
      return audioCtx;
    };

    const noteFreq = {
      'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
      'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
      'C6': 1046.50, '-': 0
    };

    // 生成曲目 0: 熱血運動會進行曲
    const buildTrack0 = (ctx) => {
      const sampleRate = 22050;
      const bpm = 126;
      const sSec = (60 / bpm) / 4;
      const chords = [
        ['F3','A3','C4','F4'], ['C3','E3','G3','C4'], ['D3','F3','A3','D4'], ['Bb2','D3','F3','Bb3'],
        ['F3','A3','C4','F4'], ['G3','Bb3','D4','G4'], ['C3','E3','G3','C4'], ['F3','A3','C4','F4']
      ];
      const bassNotes = ['F2','C3','D2','Bb2','F2','G2','C3','F2'];
      const melNotes = [
        'F4','-','A4','-','C5','-','D5','-','C5','-','A4','-','F4','-','G4','-',
        'G4','-','A4','-','G4','-','E4','-','C4','-','D4','-','E4','-','G4','-',
        'A4','-','C5','-','D5','-','F5','-','E5','-','D5','-','C5','-','A4','-',
        'Bb4','-','C5','-','D5','-','F5','-','G5','-','F5','-','D5','-','C5','-',
        'A5','-','-','-','F5','-','-','-','C5','-','-','-','A4','-','C5','-',
        'Bb4','-','C5','-','D5','-','F5','-','G5','-','A5','-','G5','-','F5','-',
        'E5','-','F5','-','G5','-','Bb5','-','A5','-','G5','-','E5','-','G4','-',
        'F4','-','A4','-','C5','-','F5','-','F5','-','-','-','-','-','-','-'
      ];
      const totalSamples = Math.floor(128 * sSec * sampleRate);
      const audioBuf = ctx.createBuffer(1, totalSamples, sampleRate);
      const pcm = audioBuf.getChannelData(0);
      let melPhase = 0, arpPhase = 0, bassPhase = 0;
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const step = Math.floor(t / sSec);
        const bar = Math.floor(step / 16) % 8;
        const stepInBar = step % 16;
        const stepFrac = (t % sSec) / sSec;

        const mFreq = noteFreq[melNotes[step % melNotes.length]] || 0;
        let mSample = 0;
        if (mFreq > 0) {
          melPhase += mFreq / sampleRate;
          const pulse = (melPhase % 1) < 0.35 ? 1 : -1;
          mSample = pulse * Math.exp(-stepFrac * 2.8) * 0.32;
        }
        const chord = chords[bar];
        const arpIdx = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3][stepInBar];
        const aFreq = noteFreq[chord[arpIdx]] || 0;
        let aSample = 0;
        if (aFreq > 0) {
          arpPhase += aFreq / sampleRate;
          aSample = (2 * Math.abs(2 * (arpPhase % 1) - 1) - 1) * Math.exp(-stepFrac * 4.5) * 0.18;
        }
        const bFreq = (noteFreq[bassNotes[bar]] || 87.31) * (stepInBar % 8 < 4 ? 1 : 1.5);
        bassPhase += bFreq / sampleRate;
        const bSample = (2 * Math.abs(2 * (bassPhase % 1) - 1) - 1) * Math.exp(-((t % (sSec * 2)) / (sSec * 2)) * 3.2) * 0.24;

        let dSample = 0;
        const beatFrac = (t % (sSec * 4)) / (sSec * 4);
        const beatInBar = Math.floor(stepInBar / 4);
        if (beatInBar === 0 || beatInBar === 2) {
          const kFreq = Math.max(45, 140 * Math.exp(-beatFrac * 25));
          dSample += Math.sin(2 * Math.PI * kFreq * t) * Math.exp(-beatFrac * 18) * 0.38;
        }
        if (beatInBar === 1 || beatInBar === 3) {
          const noise = (Math.random() * 2 - 1) * Math.exp(-beatFrac * 14);
          dSample += (noise * 0.28 + Math.sin(2 * Math.PI * 180 * t) * 0.2) * 0.45;
        }
        if (stepInBar % 2 === 1) {
          dSample += (Math.random() * 2 - 1) * Math.exp(-stepFrac * 30) * 0.10;
        }
        pcm[i] = Math.tanh(mSample + aSample + bSample + dSample);
      }
      return audioBuf;
    };

    // 生成曲目 1: 香山海風舒緩律動
    const buildTrack1 = (ctx) => {
      const sampleRate = 22050;
      const bpm = 112;
      const sSec = (60 / bpm) / 4;
      const melNotes = [
        'C5','-','D5','-','E5','-','G5','-','A5','-','G5','-','E5','-','D5','-',
        'C5','-','E5','-','G5','-','A5','-','C6','-','A5','-','G5','-','E5','-',
        'D5','-','E5','-','G5','-','E5','-','D5','-','C5','-','A4','-','C5','-',
        'D5','-','-','-','E5','-','-','-','C5','-','-','-','-','-','-','-'
      ];
      const bassNotes = ['C3', 'A2', 'F2', 'G2'];
      const totalSamples = Math.floor(64 * sSec * sampleRate);
      const audioBuf = ctx.createBuffer(1, totalSamples, sampleRate);
      const pcm = audioBuf.getChannelData(0);
      let melPhase = 0, bassPhase = 0;
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const step = Math.floor(t / sSec);
        const bar = Math.floor(step / 16) % 4;
        const stepFrac = (t % sSec) / sSec;

        const mFreq = noteFreq[melNotes[step % melNotes.length]] || 0;
        let mSample = 0;
        if (mFreq > 0) {
          melPhase += mFreq / sampleRate;
          mSample = (Math.sin(2 * Math.PI * (melPhase % 1)) * 0.7 + Math.sin(4 * Math.PI * (melPhase % 1)) * 0.3) * Math.exp(-stepFrac * 5.0) * 0.34;
        }
        const bFreq = noteFreq[bassNotes[bar]] || 130.81;
        bassPhase += bFreq / sampleRate;
        const bSample = Math.sin(2 * Math.PI * (bassPhase % 1)) * Math.exp(-((t % (sSec * 4)) / (sSec * 4)) * 2.5) * 0.25;

        let dSample = 0;
        const beatFrac = (t % (sSec * 4)) / (sSec * 4);
        if (Math.floor((step % 16) / 4) === 0) {
          dSample += Math.sin(2 * Math.PI * 65 * t) * Math.exp(-beatFrac * 12) * 0.28;
        }
        if ((step % 4) === 2) {
          dSample += (Math.random() * 2 - 1) * Math.exp(-stepFrac * 25) * 0.08;
        }
        pcm[i] = Math.tanh(mSample + bSample + dSample);
      }
      return audioBuf;
    };

    // 生成曲目 2: 8-Bit 像素闖關曲
    const buildTrack2 = (ctx) => {
      const sampleRate = 22050;
      const bpm = 138;
      const sSec = (60 / bpm) / 4;
      const melNotes = [
        'E5','E5','-','E5','-','C5','E5','-','G5','-','-','-','G4','-','-','-',
        'C5','-','-','G4','-','-','E4','-','-','A4','-','B4','-','Bb4','A4','-',
        'G4','E5','G5','A5','-','F5','G5','-','E5','-','C5','D5','B4','-','-','-',
        'C5','-','-','G4','-','-','E4','-','-','A4','-','B4','-','Bb4','A4','-'
      ];
      const bassNotes = ['C3', 'G2', 'A2', 'F2'];
      const totalSamples = Math.floor(64 * sSec * sampleRate);
      const audioBuf = ctx.createBuffer(1, totalSamples, sampleRate);
      const pcm = audioBuf.getChannelData(0);
      let melPhase = 0, bassPhase = 0;
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const step = Math.floor(t / sSec);
        const bar = Math.floor(step / 16) % 4;
        const stepFrac = (t % sSec) / sSec;

        const mFreq = noteFreq[melNotes[step % melNotes.length]] || 0;
        let mSample = 0;
        if (mFreq > 0) {
          melPhase += mFreq / sampleRate;
          const pulse = (melPhase % 1) < 0.5 ? 1 : -1;
          mSample = pulse * Math.exp(-stepFrac * 3.5) * 0.30;
        }
        const bFreq = noteFreq[bassNotes[bar]] || 130.81;
        bassPhase += bFreq / sampleRate;
        const bSample = (2 * Math.abs(2 * (bassPhase % 1) - 1) - 1) * Math.exp(-((t % (sSec * 2)) / (sSec * 2)) * 3.0) * 0.25;

        let dSample = 0;
        const beatFrac = (t % (sSec * 4)) / (sSec * 4);
        if ((step % 4) === 0) {
          dSample += (Math.random() * 2 - 1) * Math.exp(-beatFrac * 20) * 0.35;
        }
        pcm[i] = Math.tanh(mSample + bSample + dSample);
      }
      return audioBuf;
    };

    const getTrackBuffer = (ctx, trackIdx) => {
      const idx = trackIdx % 3;
      if (!bgmBuffers[idx]) {
        if (idx === 0) bgmBuffers[0] = buildTrack0(ctx);
        else if (idx === 1) bgmBuffers[1] = buildTrack1(ctx);
        else bgmBuffers[2] = buildTrack2(ctx);
      }
      return bgmBuffers[idx];
    };

    const startBgm = async (targetTrack) => {
      const actx = initContext();
      if (!actx) return;
      if (actx.state === 'suspended') {
        try { await actx.resume(); } catch(e) {}
      }
      if (typeof targetTrack === 'number') {
        curTrack = targetTrack % 3;
        try { localStorage.setItem('sq-bgm-track', String(curTrack)); } catch(e) {}
      }
      if (isPlaying && bgmSource) {
        try { bgmSource.stop(); } catch(e) {}
        bgmSource.disconnect();
        bgmSource = null;
        isPlaying = false;
      }
      if (muted) {
        updateButtons();
        return;
      }
      try {
        const buf = getTrackBuffer(actx, curTrack);
        bgmSource = actx.createBufferSource();
        bgmSource.buffer = buf;
        bgmSource.loop = true;
        bgmSource.connect(bgmGain);
        bgmGain.gain.setValueAtTime(curVol, actx.currentTime);
        bgmSource.start();
        isPlaying = true;
      } catch(e) {
        isPlaying = false;
      }
      updateButtons();
    };

    const stopBgm = () => {
      if (!isPlaying || !bgmSource) {
        isPlaying = false;
        updateButtons();
        return;
      }
      try {
        if (bgmGain && audioCtx) {
          bgmGain.gain.setValueAtTime(0, audioCtx.currentTime);
        }
        bgmSource.stop();
        bgmSource.disconnect();
      } catch(e) {}
      bgmSource = null;
      isPlaying = false;
      updateButtons();
    };

    const toggleMute = () => {
      muted = !muted;
      try { localStorage.setItem('sq-bgm-muted', muted ? '1' : '0'); } catch(e) {}
      if (muted) {
        stopBgm();
        if (sfxGain && audioCtx) sfxGain.gain.setValueAtTime(0, audioCtx.currentTime);
      } else {
        if (sfxGain && audioCtx) sfxGain.gain.setValueAtTime(0.45, audioCtx.currentTime);
        startBgm(curTrack);
      }
      updateButtons();
    };

    const nextTrack = () => {
      curTrack = (curTrack + 1) % 3;
      try { localStorage.setItem('sq-bgm-track', String(curTrack)); } catch(e) {}
      if (!muted) {
        startBgm(curTrack);
      } else {
        updateButtons();
      }
    };

    const setVolume = (v) => {
      curVol = Math.max(0, Math.min(1, v));
      try { localStorage.setItem('sq-bgm-vol', String(curVol)); } catch(e) {}
      if (!muted && bgmGain && audioCtx) {
        bgmGain.gain.setValueAtTime(curVol, audioCtx.currentTime);
      }
      updateButtons();
    };

    const unlock = async () => {
      const actx = initContext();
      if (actx && actx.state === 'suspended') {
        try { await actx.resume(); } catch(e) {}
      }
      if (!isPlaying && !muted) {
        startBgm(curTrack);
      }
    };

    const playSfx = (type, param) => {
      if (muted) return;
      const actx = initContext();
      if (!actx) return;
      if (actx.state === 'suspended') {
        actx.resume().catch(() => {});
      }
      const now = actx.currentTime;
      try {
        if (type === 'tap') {
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'triangle';
          const p = Math.min(8, param || 0);
          osc.frequency.setValueAtTime(380 + p * 45, now);
          osc.frequency.exponentialRampToValueAtTime(760 + p * 60, now + 0.08);
          g.gain.setValueAtTime(0.35, now);
          g.gain.linearRampToValueAtTime(0.01, now + 0.08);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'step') {
          const scale = [349.23, 392.00, 440.00, 466.16, 523.25, 587.33, 659.25, 698.46];
          const freq = scale[Math.min(scale.length - 1, param || 0)];
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(0.4, now);
          g.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.17);
        } else if (type === 'wrong') {
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.22);
          g.gain.setValueAtTime(0.3, now);
          g.gain.linearRampToValueAtTime(0.01, now + 0.22);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.23);
        } else if (type === 'correct') {
          const freqs = [349.23, 440.00, 523.25, 698.46];
          freqs.forEach((f, idx) => {
            const osc = actx.createOscillator();
            const g = actx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + idx * 0.07);
            g.gain.setValueAtTime(0, now + idx * 0.07);
            g.gain.linearRampToValueAtTime(0.35, now + idx * 0.07 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.32);
            osc.connect(g);
            g.connect(sfxGain);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.34);
          });
        } else if (type === 'fanfare') {
          const fanNotes = [
            { f: 349.23, t: 0, d: 0.12 },
            { f: 440.00, t: 0.12, d: 0.12 },
            { f: 523.25, t: 0.24, d: 0.15 },
            { f: 698.46, t: 0.40, d: 0.55 }
          ];
          fanNotes.forEach(n => {
            const osc = actx.createOscillator();
            const g = actx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(n.f, now + n.t);
            g.gain.setValueAtTime(0.28, now + n.t);
            g.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);
            osc.connect(g);
            g.connect(sfxGain);
            osc.start(now + n.t);
            osc.stop(now + n.t + n.d + 0.02);
          });
        } else if (type === 'gun') {
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.exponentialRampToValueAtTime(2800, now + 0.2);
          g.gain.setValueAtTime(0.45, now);
          g.gain.linearRampToValueAtTime(0.01, now + 0.25);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.26);
        }
      } catch(e) {}
    };

    const updateButtons = () => {
      const eqHtml = '<span class="sq-eq"><i></i><i></i><i></i><i></i></span>';
      const topBtn = document.getElementById('sq-btn-audio');
      if (topBtn) {
        if (muted) {
          topBtn.className = 'sq-brand-pill is-audio is-muted';
          topBtn.innerHTML = '🔇 音樂：已關閉 (點擊開啟)';
          topBtn.title = '點擊開啟闖關背景音樂 (可切換 3 首熱血曲風)';
        } else if (isPlaying) {
          topBtn.className = 'sq-brand-pill is-audio is-playing';
          topBtn.innerHTML = '🎵 ' + TRACK_NAMES[curTrack] + ' ' + eqHtml;
          topBtn.title = '正在播放：' + TRACK_NAMES[curTrack] + ' (點擊關閉音樂)';
        } else {
          topBtn.className = 'sq-brand-pill is-audio';
          topBtn.innerHTML = '🎵 播放闖關音樂';
          topBtn.title = '點擊播放闖關背景音樂';
        }
      }
      const bqBtn = document.getElementById('sq-bq-audio-toggle');
      if (bqBtn) {
        if (muted) {
          bqBtn.className = 'sq-bq-audio-btn is-muted';
          bqBtn.innerHTML = '🔇 音樂已關閉 (點擊開啟)';
          bqBtn.title = '點擊開啟闖關背景音樂';
        } else if (isPlaying) {
          bqBtn.className = 'sq-bq-audio-btn is-playing';
          bqBtn.innerHTML = '🎵 ' + TRACK_NAMES[curTrack] + ' (點擊關閉)';
          bqBtn.title = '正在播放，點擊關閉音樂';
        } else {
          bqBtn.className = 'sq-bq-audio-btn';
          bqBtn.innerHTML = '🎵 播放闖關音樂';
          bqBtn.title = '點擊播放闖關音樂';
        }
      }
      const widgetBtn = document.getElementById('sq-music-main-btn');
      const widgetName = document.getElementById('sq-music-name');
      const widgetIcon = document.getElementById('sq-music-icon');
      const widgetEq = document.getElementById('sq-music-eq');
      const powerBtn = document.getElementById('sq-mp-power-btn');
      if (widgetBtn) {
        widgetBtn.classList.toggle('is-muted', muted);
        widgetBtn.classList.toggle('is-playing', isPlaying && !muted);
      }
      if (widgetName) {
        widgetName.textContent = muted ? '音樂已關閉 (點擊開啟)' : (isPlaying ? TRACK_NAMES[curTrack] + ' (點擊關閉)' : '點擊播放音樂');
      }
      if (widgetIcon) {
        widgetIcon.textContent = muted ? '🔇' : '🎵';
      }
      if (widgetEq) {
        widgetEq.style.display = (isPlaying && !muted) ? 'inline-flex' : 'none';
      }
      if (powerBtn) {
        if (muted) {
          powerBtn.className = 'sq-mp-power-btn is-muted';
          powerBtn.innerHTML = '▶️ 開啟闖關音樂播放';
        } else {
          powerBtn.className = 'sq-mp-power-btn';
          powerBtn.innerHTML = '⏹️ 關閉音樂 (靜音)';
        }
      }
      document.querySelectorAll('.sq-mp-track').forEach(btn => {
        const tIdx = parseInt(btn.dataset.track || '0', 10);
        btn.classList.toggle('is-active', tIdx === curTrack);
      });
      document.querySelectorAll('.sq-mp-vol-btn').forEach(btn => {
        const v = parseFloat(btn.dataset.vol || '0.38');
        if (v === 0) {
          btn.classList.toggle('is-active', muted || curVol === 0);
        } else {
          btn.classList.toggle('is-active', !muted && Math.abs(v - curVol) < 0.1);
        }
      });
    };

    return {
      initContext,
      startBgm,
      stopBgm,
      toggleMute,
      nextTrack,
      setVolume,
      unlock,
      playSfx,
      updateButtons,
      isMuted: () => muted,
      isPlaying: () => isPlaying,
      getTrackName: () => TRACK_NAMES[curTrack],
      getTrackIndex: () => curTrack
    };
  })();


  // 監聽頁面任何互動手勢，解鎖 Web Audio（若使用者已主動關閉/靜音音樂則不強制播放）
  const onUserGestureUnlock = () => {
    if (soundEngine.isMuted()) return;
    soundEngine.unlock();
  };
  ['pointerdown', 'click', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, onUserGestureUnlock, { passive: true });
  });
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
    const pillProgEl = document.getElementById('sq-pill-prog');
    if (icEl) icEl.textContent = state.icon || '🐯';
    if (lbEl) lbEl.textContent = state.name || state.role;
    if (prEl) prEl.textContent = stampedCount + '/5章 · ' + clearedCount + '/19關';
    if (pillProgEl) pillProgEl.textContent = '🏅 ' + stampedCount + '/5章 · ' + clearedCount + '/19關';
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

  // 浮動提示 Toast 系統
  let toastEl = document.getElementById('sq-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'sq-toast';
    toastEl.className = 'sq-toast';
    document.body.appendChild(toastEl);
  }
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-show');
    }, 3000);
  }

  // 打開選手設定對話框時，同步目前的身分與姓名
  // 綁定音訊系統所有控制按鈕事件（一鍵關閉/開啟、曲目切換、音量調整、選單開關）
  document.getElementById('sq-btn-audio')?.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEngine.toggleMute();
  });

  document.getElementById('sq-music-main-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEngine.toggleMute();
  });

  const musicPop = document.getElementById('sq-music-pop');
  document.getElementById('sq-music-menu-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (musicPop) musicPop.hidden = !musicPop.hidden;
  });

  document.getElementById('sq-mp-close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (musicPop) musicPop.hidden = true;
  });

  document.getElementById('sq-mp-power-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEngine.toggleMute();
  });

  document.querySelectorAll('.sq-mp-track').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tIdx = parseInt(btn.dataset.track || '0', 10);
      if (soundEngine.isMuted()) {
        soundEngine.toggleMute();
      }
      soundEngine.startBgm(tIdx);
    });
  });

  document.querySelectorAll('.sq-mp-vol-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const v = parseFloat(btn.dataset.vol || '0.38');
      if (v === 0) {
        if (!soundEngine.isMuted()) soundEngine.toggleMute();
      } else {
        if (soundEngine.isMuted()) soundEngine.toggleMute();
        soundEngine.setVolume(v);
      }
    });
  });

  window.addEventListener('click', (e) => {
    if (musicPop && !musicPop.hidden && !musicPop.contains(e.target) && !e.target.closest('#sq-music-menu-btn')) {
      musicPop.hidden = true;
    }
  });

  document.getElementById('sq-btn-athlete')?.addEventListener('click', () => {
    nameInput.value = state.name || '';
    roleCards.forEach(c => {
      c.classList.toggle('is-active', c.dataset.role === state.role);
    });
    if (!regDlg.open) regDlg.showModal();
  });

  // 重新設定／清除闖關資料（全部重新集章）
  function resetQuestData() {
    const ok = window.confirm('確定要重新開始闖關嗎？\\n\\n這將會清除您目前獲得的 5 枚五力印章與所有建築物的過關紀錄，讓您可以重新挑戰集章！\\n（運動員姓名與身分設定會保留）');
    if (!ok) return;

    state.stamps = {};
    state.clearedItems = {};
    state.celebrated = false;
    saveState();
    renderHud();

    // 重新渲染當前開啟中的建築闖關卡
    if (ctx.selection && ctx.selection.type === 'item') {
      mountBuildingChallenge(ctx.selection.id);
    } else {
      const curMount = document.getElementById('sq-item-quest-mount');
      if (curMount && curMount.dataset.itemId) {
        mountBuildingChallenge(curMount.dataset.itemId);
      }
    }

    if (regDlg && regDlg.open) regDlg.close();
    if (certDlg && certDlg.open) certDlg.close();

    showToast('🔄 闖關資料已重設！印章與關卡已歸零，可重新開始挑戰！');
  }

  document.getElementById('sq-btn-reset-data')?.addEventListener('click', resetQuestData);
  document.getElementById('sq-btn-reset-cert')?.addEventListener('click', resetQuestData);

  document.getElementById('sq-reg-submit')?.addEventListener('click', () => {
    state.name = (nameInput.value || '').trim() || '大庄小健將';
    state.registered = true;
    saveState();
    renderHud();
    if (regDlg.open) regDlg.close();
    // 依據新身分立即刷新當前建築關卡難度
    if (ctx.selection && ctx.selection.type === 'item') {
      mountBuildingChallenge(ctx.selection.id);
    } else {
      const curMount = document.getElementById('sq-item-quest-mount');
      if (curMount && curMount.dataset.itemId) {
        mountBuildingChallenge(curMount.dataset.itemId);
      }
    }
  });

  // ================= 關卡難度自適應系統 (依照選擇角色動態調控) =================
  function getRoleDifficulty(role) {
    if (role === '低年級小選手') {
      return {
        level: 1,
        star: '⭐',
        name: '入門友善',
        tagClass: 'diff-easy',
        tapFactor: 0.6,
        minTap: 2,
        actionLabel: '只要連點',
        reactEvaluator: (rt) => '🌟 超棒起跑！小選手反應：' + rt + ' 秒！姿勢 100 分，體能潛力無限！'
      };
    } else if (role === '高年級破風手') {
      return {
        level: 3,
        star: '⭐⭐⭐',
        name: '競速破風',
        tagClass: 'diff-hard',
        tapFactor: 1.5,
        minTap: 6,
        actionLabel: '🔥 爆發連擊',
        reactEvaluator: (rt) => {
          if (rt <= 0.28) return '🔥【神級破風反應】破大會紀錄！反應 ' + rt + ' 秒！頂級爆發力！';
          if (rt <= 0.38) return '⚡【甲組選手水準】起跑敏捷反應：' + rt + ' 秒！破風表現亮眼！';
          return '🏃【標準起跑】反應：' + rt + ' 秒！高年級破風手目標是突破 0.3 秒以內！';
        }
      };
    } else if (role === '熱血應援家長') {
      return {
        level: 2,
        star: '⭐⭐',
        name: '親子應援',
        tagClass: 'diff-parent',
        tapFactor: 1.0,
        minTap: 3,
        actionLabel: '👏 應援掌聲',
        reactEvaluator: (rt) => '📸 快門神捕捉！在第 ' + rt + ' 秒精準拍下孩子起跑的英姿！'
      };
    } else if (role === '親善校友貴賓') {
      return {
        level: 3,
        star: '⭐⭐⭐',
        name: '校友薪傳',
        tagClass: 'diff-alumni',
        tapFactor: 1.3,
        minTap: 5,
        actionLabel: '🏅 薪傳蓄力',
        reactEvaluator: (rt) => '🏅 薪傳領跑！在第 ' + rt + ' 秒接棒衝刺，傳承大庄七一風華！'
      };
    } else {
      // 預設 中年級飛毛腿
      return {
        level: 2,
        star: '⭐⭐',
        name: '標準進階',
        tagClass: 'diff-medium',
        tapFactor: 1.0,
        minTap: 3,
        actionLabel: '連擊充能',
        reactEvaluator: (rt) => '⚡ 敏捷起跑！反應時間：' + rt + ' 秒！保持領先速度！'
      };
    }
  }

  // 2. 19 座建築物卡片內嵌「專屬闖關挑戰」渲染器（依照身分難度動態調節）
  function mountBuildingChallenge(itemId) {
    const mount = document.getElementById('sq-item-quest-mount');
    if (!mount) return;
    soundEngine.startBgm();
    soundEngine.updateButtons();
    const ref = ctx.itemById.get(itemId);
    if (!ref || !ref.item || !ref.item.challenge) return;
    const it = ref.item;
    const isl = ref.island.data;
    const ch = it.challenge;
    const isCleared = !!state.clearedItems[it.id];
    const quests = DATA.quests || [];
    const stampedCount = quests.filter(q => state.stamps[q.id]).length;
    const clearedCount = Object.keys(state.clearedItems || {}).filter(k => state.clearedItems[k]).length;

    // 依據運動員身分獲取難易度設定
    const curRole = state.role || '低年級小選手';
    const diff = getRoleDifficulty(curRole);

    let stage1Done = isCleared;
    const baseTarget = ch.targetCount || 3;
    // 依角色難度係數縮放連擊目標次數
    const target = Math.max(diff.minTap, Math.round(baseTarget * diff.tapFactor));
    let tapCount = isCleared ? target : 0;
    let seqIdx = isCleared ? ((ch.sequenceItems || []).length) : 0;

    let stage1Html = '';
    if (ch.mode === 'tap_charge') {
      const pct = Math.min(100, Math.round((tapCount / target) * 100));
      stage1Html =
        '<div class="sq-bq-stage1">' +
          '<button type="button" class="sq-act-btn" id="sq-bq-act-btn" style="width:100%;justify-content:center;padding:8px 12px;font-size:13px;">' +
            ch.actionBtn + ' (' + diff.actionLabel + ' <span id="sq-bq-tap-num">' + tapCount + '/' + target + '</span>)' +
          '</button>' +
          '<div class="sq-bq-meter"><div class="sq-bq-meter-fill" id="sq-bq-meter-fill" style="width:' + pct + '%;"></div></div>' +
          '<div class="sq-bq-done-msg" id="sq-bq-stage1-msg" ' + (stage1Done ? '' : 'hidden') + '>' + ch.actionDone + '</div>' +
        '</div>';
    } else if (ch.mode === 'sequence') {
      const items = ch.sequenceItems || [];
      // 隨機打亂排序按鈕的顯示位置（強迫玩家必須思考順序，不再只是由左至右盲點）
      const seqList = items.map((label, origIdx) => ({ label, origIdx }));
      if (seqList.length > 1) {
        let attempts = 0;
        do {
          for (let i = seqList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [seqList[i], seqList[j]] = [seqList[j], seqList[i]];
          }
          attempts++;
        } while (attempts < 10 && seqList.every((it, i) => it.origIdx === i));
      }
      stage1Html =
        '<div class="sq-bq-stage1">' +
          '<div class="sq-bq-seq-prompt">🧩 順序考驗（按鈕已隨機打亂）<span class="sq-mob-br"></span>請依正確先後步驟點擊：</div>' +
          '<div class="sq-bq-seq-row" id="sq-bq-seq-row">' +
            seqList.map(item =>
              '<button type="button" class="sq-bq-seq-btn ' + (isCleared ? 'is-done' : '') + '" data-seq-idx="' + item.origIdx + '">' + item.label + '</button>'
            ).join('') +
          '</div>' +
          '<div class="sq-bq-done-msg" id="sq-bq-stage1-msg" ' + (stage1Done ? '' : 'hidden') + '>' + ch.actionDone + '</div>' +
        '</div>';
    } else if (ch.mode === 'reaction') {
      stage1Html =
        '<div class="sq-bq-stage1">' +
          '<button type="button" class="sq-act-btn" id="sq-bq-react-btn" style="width:100%;justify-content:center;padding:8px 12px;font-size:13px;">' +
            (isCleared ? (ch.reactReplayText || '⚡ 再次實測紫色跑道聽槍起跑反應') : ch.actionBtn) +
          '</button>' +
          '<div class="sq-bq-done-msg" id="sq-bq-stage1-msg" ' + (stage1Done ? '' : 'hidden') + '>' + ch.actionDone + '</div>' +
        '</div>';
    }

    // 依據角色難度生成問答錦囊提示
    const correctOpt = (ch.options && ch.options[ch.answer]) ? ch.options[ch.answer] : '';
    let quizHintHtml = '';
    if (curRole === '低年級小選手') {
      quizHintHtml = '<div class="sq-role-hint-box diff-easy">💡 <strong>低年級小選手錦囊：</strong>答案是「' + correctOpt + '」喔！找找看在哪個選項！</div>';
    } else if (curRole === '高年級破風手') {
      quizHintHtml = '<div class="sq-role-hint-box diff-hard">🔥 <strong>高年級破風手挑戰：</strong>無提示！請運用你對大庄校慶賽程與運動精神的專業理解作答！</div>';
    } else if (curRole === '熱血應援家長') {
      quizHintHtml = '<div class="sq-role-hint-box diff-parent">📸 <strong>家長觀賽小貼士：</strong>此項目是大會親師生同樂的重要亮點，記得在看台為孩子們熱情喝采拍照！</div>';
    } else if (curRole === '親善校友貴賓') {
      quizHintHtml = '<div class="sq-role-hint-box diff-alumni">🏅 <strong>校友薪傳記憶：</strong>71 年傳承風華，此項活動承載著大庄歷代師生的共同記憶與運動家精神！</div>';
    } else {
      quizHintHtml = '<div class="sq-role-hint-box diff-medium">⚡ <strong>中年級飛毛腿提示：</strong>仔細閱讀題目與三個選項，選出真正符合大庄運動家精神的答案！</div>';
    }

    // 每次開啟關卡動態隨機打亂問答題選項（保證正確答案隨機落在 A, B, C，不固定為第一項）
    const rawOpts = (ch.options || []).map((text, origIdx) => ({ text, origIdx }));
    const shuffledOpts = [...rawOpts];
    if (shuffledOpts.length > 1) {
      for (let i = shuffledOpts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOpts[i], shuffledOpts[j]] = [shuffledOpts[j], shuffledOpts[i]];
      }
    }

    mount.innerHTML =
      '<div class="sq-bldg-quest ' + (isCleared ? 'is-cleared' : '') + '" id="sq-bldg-quest-card">' +
        '<div class="sq-bq-head">' +
          '<div class="sq-bq-head-top">' +
            '<div class="sq-bq-head-left">' +
              '<span class="sq-bq-tag">🎯 建築關卡</span>' +
              '<span class="sq-power-badge sq-p-' + ch.power + '">' + ch.power + '</span>' +
            '</div>' +
            '<span class="sq-bq-status' + (isCleared ? ' is-done' : '') + '" id="sq-bq-status">' + (isCleared ? '✅ 本建築已過關' : '⏳ 待闖關挑戰') + '</span>' +
          '</div>' +
          '<div class="sq-bq-head-sub">' +
            '<span class="sq-bq-diff-badge ' + diff.tagClass + '">' + diff.star + ' ' + curRole + '（' + diff.name + '）</span>' +
            '<button type="button" class="sq-bq-audio-btn ' + (soundEngine.isMuted() ? 'is-muted' : '') + '" id="sq-bq-audio-toggle" title="切換闖關背景音樂">' +
              (soundEngine.isMuted() ? '🔇 音樂已靜音' : '🎵 闖關熱血音樂🔊') +
            '</button>' +
          '</div>' +
        '</div>' +
        '<h3 class="sq-bq-title">' + ch.title + '</h3>' +
        '<p class="sq-bq-desc">' + ch.taskDesc + '</p>' +
        stage1Html +
        '<div id="sq-bq-quiz-wrap">' +
          '<p class="sq-bq-q">❓ ' + ch.question + '</p>' +
          quizHintHtml +
          '<div class="sq-bq-opts" id="sq-bq-opts">' +
            shuffledOpts.map((optItem, displayIdx) => {
              const rawOpt = String(optItem.text || '');
              let optHtml = rawOpt;
              if (rawOpt.length > 16 && /[，；、]/.test(rawOpt)) {
                const segs = rawOpt.split(/(?<=[，；])/).filter(Boolean);
                if (segs.length > 1) {
                  optHtml = segs.map(s => '<span class="sq-opt-seg">' + s + '</span>').join('');
                }
              }
              return '<button type="button" class="sq-bq-opt ' + (isCleared && optItem.origIdx === ch.answer ? 'is-correct' : '') + '" data-opt-idx="' + optItem.origIdx + '">' +
                '<span class="sq-opt-key">' + ['A', 'B', 'C', 'D'][displayIdx] + '</span>' +
                '<span class="sq-opt-txt">' + optHtml + '</span>' +
              '</button>';
            }).join('') +
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
            (it.id === 's03i3' ? '<button type="button" class="sq-brand-pill" id="sq-bq-races-btn" style="background:#7c3aed;color:#fff;border-color:#6d28d9;">🏃 查看 16 項個人賽成績</button>' : '') +
          '</div>' +
        '</div>' +
      '</div>';

    // 綁定第一階段互動事件
    const msgEl = document.getElementById('sq-bq-stage1-msg');
    if (ch.mode === 'tap_charge') {
      const actBtn = document.getElementById('sq-bq-act-btn');
      const numEl = document.getElementById('sq-bq-tap-num');
      const fillEl = document.getElementById('sq-bq-meter-fill');
      actBtn?.addEventListener('click', () => {
        soundEngine.playSfx('tap');
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
          if (idx === seqIdx) {
            btn.classList.add('is-done');
            soundEngine.playSfx('step', seqIdx);
            seqIdx++;
            if (msgEl) {
              msgEl.hidden = false;
              if (seqIdx < seqBtns.length) {
                msgEl.innerHTML = '✨ 步驟 ' + seqIdx + ' 正確！請繼續找出下一步！';
              } else {
                msgEl.innerHTML = ch.actionDone;
              }
            }
            if (seqIdx >= seqBtns.length) {
              stage1Done = true;
            }
          } else if (idx < seqIdx) {
            btn.classList.add('is-done');
          } else {
            soundEngine.playSfx('wrong');
            btn.classList.add('is-wrong');
            setTimeout(() => btn.classList.remove('is-wrong'), 450);
            if (msgEl) {
              msgEl.hidden = false;
              if (curRole === '高年級破風手') {
                // 高年級嚴格重置
                seqIdx = 0;
                seqBtns.forEach(b => b.classList.remove('is-done'));
                msgEl.textContent = '⚠️ 順序錯誤！破風手難度：所有步驟重置，請重新由第一步開始點擊！';
              } else {
                msgEl.textContent = '💡 順序不對喔！目前請先找出「第 ' + (seqIdx + 1) + ' 步」點擊！';
              }
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
          reactBtn.textContent = ch.reactWaitText || '⏳ 各就各位…預備…（等鳴槍變綠色立即點！）';
          reactBtn.style.background = '#fef3c7';
          reactBtn.style.color = '#92400e';
          timerId = setTimeout(() => {
            waitingGun = false;
            gunTime = performance.now();
            reactBtn.textContent = ch.reactGoText || '🔫 砰！現在立刻點擊起跑！';
            reactBtn.style.background = '#d1fae5';
            reactBtn.style.color = '#065f46';
          }, 700 + Math.random() * 900);
        } else if (waitingGun) {
          clearTimeout(timerId);
          waitingGun = false;
          reactBtn.textContent = ch.reactEarlyText || '⚠️ 搶跑犯規！點此重新預備起跑';
          reactBtn.style.background = '#fee2e2';
          reactBtn.style.color = '#991b1b';
        } else if (gunTime) {
          const rt = ((performance.now() - gunTime) / 1000).toFixed(3);
          gunTime = 0;
          stage1Done = true;
          reactBtn.textContent = (ch.reactDonePrefix || '⚡ 起跑成功！反應時間：') + rt + ' 秒（點此可再測）';
          reactBtn.style.background = '#ffffff';
          reactBtn.style.color = '#0f172a';
          if (msgEl) {
            msgEl.hidden = false;
            msgEl.textContent = diff.reactEvaluator(rt) + ' 接著請回答下方問題：';
          }
        }
      });
    }

    // 綁定建築卡片內的音樂開關按鈕
    document.getElementById('sq-bq-audio-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEngine.toggleMute();
    });

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
          if (stEl) { stEl.textContent = '✅ 本建築已過關'; stEl.classList.add('is-done'); }
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
    document.getElementById('sq-bq-races-btn')?.addEventListener('click', () => {
      renderScheduleTables('ALL');
      switchSchedTab('pre');
      if (!schedDlg.open) schedDlg.showModal();
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
    const powerLabel = q ? q.power : '五力大圓滿';
    const titlePrefix = q ? (q.icon + ' 本島五力印章') : '🏆 五力榮耀星光總部';
    banner.innerHTML =
      '<div class="sq-qcta-body">' +
        '<div class="sq-qcta-head">' +
          '<div class="sq-qcta-titlewrap">' +
            '<strong class="sq-qcta-title">' + titlePrefix + '</strong>' +
            '<span class="sq-power-badge sq-p-' + powerLabel + '">' + powerLabel + '</span>' +
          '</div>' +
          '<span class="sq-qcta-status' + (stampDone ? ' is-done' : '') + '">' + (stampDone ? '✅ 已蓋章' : '⏳ 待蓋章') + '</span>' +
        '</div>' +
        '<div class="sq-qcta-desc">' +
          '<span class="sq-qcta-line">本島共有 <strong>' + totalBldgs + ' 座建築關卡</strong>（已完成 ' + doneBldgs + '/' + totalBldgs + '）</span>' +
          '<span class="sq-qcta-line">點選下方任一建築即可進入專屬闖關！</span>' +
        '</div>' +
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

    // 渲染大會賽程表規程總表
    const preTbody = document.getElementById('sq-pre-tbody');
    if (preTbody) {
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
    }

    // 渲染三至六年級 16 項個人賽完整大會名冊與決賽 6 強英雄榜
    renderIndividualRaces();

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

  // ================= 三至六年級 16 項個人賽與決賽英雄榜控制器 =================
  let raceFilterGrade = 'ALL';
  let raceFilterGender = 'ALL';
  let raceFilterKw = '';
  let raceViewMode = 'finalists'; // 'finalists' | 'all'
  const expandedRaceIds = new Set();

  function renderIndividualRaces() {
    const mount = document.getElementById('sq-races-mount');
    if (!mount) return;
    const allRaces = DATA.individualRaces || [];
    const kw = raceFilterKw.trim().toLowerCase();

    const filtered = allRaces.filter(r => {
      if (raceFilterGrade !== 'ALL' && String(r.grade) !== raceFilterGrade) return false;
      if (raceFilterGender !== 'ALL' && r.gender !== raceFilterGender) return false;
      if (kw) {
        const inTitle = r.name.toLowerCase().includes(kw);
        const inAthletes = (r.athletes || []).some(a =>
          (a.name && a.name.toLowerCase().includes(kw)) ||
          (a.className && a.className.toLowerCase().includes(kw)) ||
          String(a.studentNo || '').includes(kw)
        );
        if (!inTitle && !inAthletes) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      mount.innerHTML = '<div class="sq-clue-box" style="text-align:center;padding:24px;color:#64748b;">🔍 沒有符合「' + (kw || '篩選條件') + '」的比賽項目或選手，請嘗試其他關鍵字（如：四丙、林○僑、六乙）。</div>';
      return;
    }

    mount.innerHTML = filtered.map(r => {
      const isExpanded = raceViewMode === 'all' || expandedRaceIds.has(r.id);
      const gradeColor = r.grade === 3 ? '#9333ea' : r.grade === 4 ? '#0284c7' : r.grade === 5 ? '#0d9488' : '#d97706';

      // 6 位決賽英雄正式成績與得獎名冊
      const finHtml = (r.finalists || []).map(f => {
        const isMatch = kw && ((f.name && f.name.toLowerCase().includes(kw)) || (f.className && f.className.toLowerCase().includes(kw)));
        const rankNum = f.finalRank;
        const isGold = rankNum === 1;
        const isSilver = rankNum === 2;
        const isBronze = rankNum === 3;
        const isDns = f.finalScore === '未出賽' || f.finalRankLabel === '未出賽';

        let medalIcon = '🏅';
        let itemClass = 'sq-finalist-item';
        let awardBadge = '';

        if (isGold) {
          medalIcon = '🥇';
          itemClass += ' is-gold';
          awardBadge = '<span class="sq-award-badge is-gold">🥇 金牌</span>';
        } else if (isSilver) {
          medalIcon = '🥈';
          itemClass += ' is-silver';
          awardBadge = '<span class="sq-award-badge is-silver">🥈 銀牌</span>';
        } else if (isBronze) {
          medalIcon = '🥉';
          itemClass += ' is-bronze';
          awardBadge = '<span class="sq-award-badge is-bronze">🥉 銅牌</span>';
        } else if (isDns) {
          medalIcon = '⚪';
          itemClass += ' is-dns';
          awardBadge = '<span class="sq-award-badge is-dns">未出賽</span>';
        } else {
          medalIcon = '<span style="font-size:12px;font-weight:900;color:#64748b;">' + (f.finalRankLabel || ('第 ' + rankNum + ' 名')) + '</span>';
          awardBadge = '<span class="sq-award-badge is-cert">大會獎狀</span>';
        }

        if (isMatch) itemClass += ' is-matched';

        const finalScoreStr = isDns ? '未出賽' : (typeof f.finalScore === 'number' ? f.finalScore.toFixed(2) + 's' : (f.finalScore || '-'));
        const prelimScoreStr = typeof f.prelimScore === 'number' ? f.prelimScore.toFixed(2) + 's' : (f.prelimScore || '');
        const prelimNote = prelimScoreStr ? '預賽 ' + prelimScoreStr + (f.prelimStatus ? ' · ' + f.prelimStatus.replace(/\s+/g, '') : '') : '';

        return (
          '<div class="' + itemClass + '">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<span class="sq-rank-medal">' + medalIcon + '</span>' +
              '<div>' +
                '<div><strong>' + f.className + ' ' + f.name + '</strong> <span style="font-size:11px;color:#64748b;">(決賽 ' + f.finalLane + ')</span></div>' +
                (prelimNote ? '<div style="font-size:10.5px;color:#94a3b8;">' + prelimNote + '</div>' : '') +
              '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:flex-end;flex-direction:column;gap:4px;">' +
              '<span class="sq-score-badge" style="' + (isGold ? 'background:#fef08a;color:#854d0e;' : isSilver ? 'background:#f1f5f9;color:#334155;' : isBronze ? 'background:#fed7aa;color:#9a3412;' : '') + '">' + finalScoreStr + '</span>' +
              awardBadge +
            '</div>' +
          '</div>'
        );
      }).join('');

      // 15 位完整道次表格（展開狀態）
      let tableHtml = '';
      if (isExpanded) {
        tableHtml =
          '<div class="sq-table-wrap" style="margin-top:10px;">' +
            '<table class="sq-table sq-table-compact">' +
              '<thead>' +
                '<tr>' +
                  '<th>組別</th>' +
                  '<th>道次</th>' +
                  '<th>班級</th>' +
                  '<th>序號</th>' +
                  '<th>姓名</th>' +
                  '<th>預賽成績</th>' +
                  '<th>分組名次</th>' +
                  '<th>晉級狀態</th>' +
                  '<th>決賽成績與榮譽</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                (r.athletes || []).map(a => {
                  const isMatch = kw && ((a.name && a.name.toLowerCase().includes(kw)) || (a.className && a.className.toLowerCase().includes(kw)));
                  const isQ = a.qualified && a.qualified.includes('(Q)');
                  const isq = a.qualified && a.qualified.includes('(q)');
                  const rowClass = isMatch ? 'is-matched-row' : isQ ? 'is-q-row' : isq ? 'is-smallq-row' : '';
                  const scoreStr = typeof a.score === 'number' ? a.score.toFixed(2) + 's' : (a.score || '-');

                  let finalAwardHtml = '<span style="color:#94a3b8;">-</span>';
                  if (a.finalRank) {
                    const fScoreStr = typeof a.finalScore === 'number' ? a.finalScore.toFixed(2) + 's' : (a.finalScore || '');
                    if (a.finalRank === '第 1 名' || a.finalRank === 1) {
                      finalAwardHtml = '<span class="sq-award-badge is-gold">🥇 金牌 (' + fScoreStr + ')</span>';
                    } else if (a.finalRank === '第 2 名' || a.finalRank === 2) {
                      finalAwardHtml = '<span class="sq-award-badge is-silver">🥈 銀牌 (' + fScoreStr + ')</span>';
                    } else if (a.finalRank === '第 3 名' || a.finalRank === 3) {
                      finalAwardHtml = '<span class="sq-award-badge is-bronze">🥉 銅牌 (' + fScoreStr + ')</span>';
                    } else if (a.finalRank === '未出賽' || a.finalScore === '未出賽') {
                      finalAwardHtml = '<span class="sq-award-badge is-dns">決賽未出賽</span>';
                    } else {
                      finalAwardHtml = '<span class="sq-award-badge is-cert">' + a.finalRank + ' (' + fScoreStr + ')</span>';
                    }
                  }

                  return (
                    '<tr class="' + rowClass + '">' +
                      '<td>' + a.heat + '</td>' +
                      '<td>' + a.lane + '</td>' +
                      '<td><strong>' + a.className + '</strong></td>' +
                      '<td>' + a.studentNo + '</td>' +
                      '<td><strong>' + a.name + '</strong></td>' +
                      '<td><span class="sq-score-badge">' + scoreStr + '</span></td>' +
                      '<td>' + (a.heatRank || '-') + '</td>' +
                      '<td>' + (isQ ? '<span class="sq-q-badge is-Q">晉級 (Q)</span>' : isq ? '<span class="sq-q-badge is-q">擇優 (q)</span>' : '-') + '</td>' +
                      '<td>' + finalAwardHtml + '</td>' +
                    '</tr>'
                  );
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>';
      }

      const toggleBtnTxt = isExpanded ? '收合 3 組 15 道次 ▲' : '展開 3 組 15 道次完整名冊 ▼';

      return (
        '<div class="sq-race-card" data-race-id="' + r.id + '">' +
          '<div class="sq-race-card-head">' +
            '<div class="sq-race-title">' +
              '<span class="sq-grade-pill" style="background:' + gradeColor + ';">' + r.gradeLabel + '</span>' +
              '<span>' + r.name + '</span>' +
            '</div>' +
            '<div class="sq-race-meta">' +
              '<span class="sq-race-dates"><span class="sq-nw">🗓️ 預賽 ' + r.prelimDate + '</span><span> ｜ </span><span class="sq-nw">決賽 ' + r.finalDate + ' (全數完賽)</span></span>' +
              '<button type="button" class="sq-toggle-table-btn" data-toggle-race="' + r.id + '">' + toggleBtnTxt + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="sq-race-card-body">' +
            '<div class="sq-finalists-subhead"><span class="sq-nw">🏆 決賽正式成績英雄榜</span><span class="sq-sub-note">（前三名頒發獎牌及獎狀，四至六名頒發獎狀）</span></div>' +
            '<div class="sq-finalists-list">' + finHtml + '</div>' +
            tableHtml +
          '</div>' +
        '</div>'
      );
    }).join('');

    mount.querySelectorAll('[data-toggle-race]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rid = btn.dataset.toggleRace;
        if (expandedRaceIds.has(rid)) expandedRaceIds.delete(rid);
        else expandedRaceIds.add(rid);
        renderIndividualRaces();
      });
    });
  }

  // 篩選與搜尋事件綁定
  document.querySelectorAll('#sq-race-grade-chips .sq-chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#sq-race-grade-chips .sq-chip').forEach(x => x.classList.remove('is-active'));
      c.classList.add('is-active');
      raceFilterGrade = c.dataset.rgrade;
      renderIndividualRaces();
    });
  });

  document.querySelectorAll('#sq-race-gender-chips .sq-chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#sq-race-gender-chips .sq-chip').forEach(x => x.classList.remove('is-active'));
      c.classList.add('is-active');
      raceFilterGender = c.dataset.rgender;
      renderIndividualRaces();
    });
  });

  const btnViewFin = document.getElementById('sq-btn-view-finalists');
  const btnViewAll = document.getElementById('sq-btn-view-all');
  if (btnViewFin && btnViewAll) {
    btnViewFin.addEventListener('click', () => {
      btnViewFin.classList.add('is-active');
      btnViewAll.classList.remove('is-active');
      raceViewMode = 'finalists';
      renderIndividualRaces();
    });
    btnViewAll.addEventListener('click', () => {
      btnViewAll.classList.add('is-active');
      btnViewFin.classList.remove('is-active');
      raceViewMode = 'all';
      renderIndividualRaces();
    });
  }

  const raceSearchInput = document.getElementById('sq-race-search-input');
  const raceSearchClear = document.getElementById('sq-race-search-clear');
  if (raceSearchInput) {
    raceSearchInput.addEventListener('input', () => {
      raceFilterKw = raceSearchInput.value;
      if (raceSearchClear) raceSearchClear.hidden = !raceFilterKw;
      renderIndividualRaces();
    });
  }
  if (raceSearchClear) {
    raceSearchClear.addEventListener('click', () => {
      raceSearchInput.value = '';
      raceFilterKw = '';
      raceSearchClear.hidden = true;
      renderIndividualRaces();
      raceSearchInput.focus();
    });
  }

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
    const curDiff = getRoleDifficulty(state.role);
    c.fillText('茲證明　' + state.icon + ' 【' + state.role + '】（挑戰難度：' + curDiff.star + ' ' + curDiff.name + '）', W / 2, 295);

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
    const quests = DATA.quests || [];
    const stampedCount = quests.filter(q => state.stamps[q.id]).length;
    const isAllStamped = stampedCount >= 5;

    drawCertificate();

    const hintEl = document.getElementById('sq-cert-hint');
    const fwBtn = document.getElementById('sq-btn-fireworks');

    if (isAllStamped) {
      // 集滿 5 個章才引燃聖火台 3D 勝利煙火
      if (ctx.frameIsland) ctx.frameIsland('s01');
      spawn3DFireworks();
      if (hintEl) {
        hintEl.innerHTML = '🎉 <strong>太棒了！你已集滿全部 5 枚大庄五力印章！</strong>中央「七一耀動聖火台」已為你點燃全景 3D 勝利煙火，你可以直接截圖或點擊下方按鈕下載證書保存！';
      }
      if (fwBtn) {
        fwBtn.disabled = false;
        fwBtn.style.opacity = '1';
        fwBtn.style.cursor = 'pointer';
        fwBtn.innerHTML = '🎆 飛往聖火台・再次施放 3D 勝利煙火！';
      }
    } else {
      // 未集滿 5 個章不釋放煙火
      const remaining = 5 - stampedCount;
      if (hintEl) {
        hintEl.innerHTML = '💡 目前已收集 <strong>' + stampedCount + ' / 5</strong> 枚印章（還差 <strong>' + remaining + '</strong> 枚）。<strong>必須集滿全部 5 枚五力印章</strong>，才會在中央「七一聖火台」引燃全景 3D 勝利煙火！（目前可隨時預覽或下載進度證書）';
      }
      if (fwBtn) {
        fwBtn.disabled = true;
        fwBtn.style.opacity = '0.55';
        fwBtn.style.cursor = 'not-allowed';
        fwBtn.innerHTML = '🔒 集滿 5 枚印章解鎖 3D 勝利煙火（目前 ' + stampedCount + ' / 5）';
      }
    }
    if (!certDlg.open) certDlg.showModal();
  }

  document.getElementById('sq-btn-cert').addEventListener('click', () => {
    triggerGrandFinale();
  });

  document.getElementById('sq-btn-fireworks').addEventListener('click', () => {
    const quests = DATA.quests || [];
    const stampedCount = quests.filter(q => state.stamps[q.id]).length;
    if (stampedCount < 5) {
      alert('🔒 五力集章尚未完成！目前已收集 ' + stampedCount + ' / 5 枚印章。\\n必須集滿全部 5 枚五力印章，才能在聖火台引燃 3D 勝利煙火喔！加油！');
      return;
    }
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

  // ================= 頂部品牌卡：折疊收合管理 (方案一正式採用) =================
  const brandEl = document.getElementById('ui-brand');
  const capsulePill = document.getElementById('sq-capsule-pill');
  const foldBtn = document.getElementById('sq-fold-btn');

  function collapseBrand() {
    if (!brandEl) return;
    brandEl.classList.add('is-collapsed');
    if (typeof updateInsets === 'function') updateInsets();
  }

  function expandBrand() {
    if (!brandEl) return;
    brandEl.classList.remove('is-collapsed');
    if (typeof updateInsets === 'function') updateInsets();
  }

  foldBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    collapseBrand();
  });

  capsulePill?.addEventListener('click', (e) => {
    e.stopPropagation();
    expandBrand();
  });

  // 手機版智慧避讓：當在手機/平板上旋轉、縮放或拖曳 3D 畫布時，卡片自動平滑收合！
  const mainCanvas = document.querySelector('canvas') || document.getElementById('c');
  if (mainCanvas) {
    mainCanvas.addEventListener('pointerdown', () => {
      if (window.innerWidth <= 768 && brandEl && !brandEl.classList.contains('is-collapsed')) {
        collapseBrand();
      }
    }, { passive: true });
  }

  // 當使用者點擊地圖上的島嶼或建築開出底部卡片時，自動收合頂部，避免畫面擁擠
  const origCard = document.getElementById('ui-card');
  if (origCard && window.MutationObserver) {
    const obs = new MutationObserver(() => {
      if (window.innerWidth <= 768 && !origCard.hidden && origCard.style.display !== 'none') {
        collapseBrand();
      }
    });
    obs.observe(origCard, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
  }

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
