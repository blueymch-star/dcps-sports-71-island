// ================= 奔馳榮耀島・校慶運動大冒險 客製 3D 地標模型庫 =================
// 單位空間：底面 ±0.5，高 0–1.2，面向 +z；使用 kitPen 實例化零件。
const sqC = {
  purple1: '#7b4bb7',
  purple2: '#8e5ec9',
  purpleD: '#5b3291',
  seaBlue: '#0284c7',
  skyBlue: '#38bdf8',
  mintGreen: '#10b981',
  meadow: '#34d399',
  pureWhite: '#ffffff',
  gold: '#f59e0b',
  goldL: '#fbbf24',
  silver: '#cbd5e1',
  bronze: '#d97706',
  flame1: '#f97316',
  flame2: '#fde047',
  tigerOrange: '#fb923c',
  tigerStripe: '#292524'
};

// 1. torch_altar：七一耀動聖火台（中央主島地標，通關時引燃全景煙火）
function kitMTorchAltar(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#e0f2fe');
  // 藍綠白同心圓廣場地磚
  p.cyl(0, G, 0, 0.44, 0.008, S.seaBlue);
  p.cyl(0, G + 0.008, 0, 0.36, 0.008, S.pureWhite);
  p.cyl(0, G + 0.016, 0, 0.28, 0.012, S.mintGreen);
  // 三層八角聖火階梯基座
  p.box(0, G + 0.028, 0, 0.38, 0.05, 0.38, S.pureWhite);
  p.box(0, G + 0.078, 0, 0.28, 0.05, 0.28, '#bae6fd');
  p.box(0, G + 0.128, 0, 0.2, 0.06, 0.2, S.pureWhite);
  // 聖火塔柱（螺旋金邊＋海藍柱身）
  p.cyl(0, G + 0.188, 0, 0.075, 0.28, S.seaBlue);
  for (let i = 0; i < 4; i++) {
    p.torus(0, G + 0.22 + i * 0.06, 0, 0.082, S.gold, Math.PI / 2, 0, 0, 0.12);
  }
  // 聖火金盆
  p.cone(0, G + 0.46, 0, 0.16, 0.1, S.gold, Math.PI, 0, 0);
  p.torus(0, G + 0.55, 0, 0.15, S.goldL, Math.PI / 2, 0, 0, 0.15);
  // 躍動立體聖火火焰
  p.cone(0, G + 0.56, 0, 0.11, 0.24, S.flame1);
  p.cone(0.03, G + 0.58, 0.02, 0.075, 0.22, S.flame2);
  p.cone(-0.03, G + 0.57, -0.02, 0.07, 0.2, '#ef4444');
  p.gsph(0, G + 0.64, 0, 0.07, S.flame2);
  p.gsph(0, G + 0.74, 0, 0.045, S.pureWhite);
  // 四角五力小聖火柱
  for (const [dx, dz, col] of [[-0.34, -0.34, S.seaBlue], [0.34, -0.34, S.mintGreen], [-0.34, 0.34, S.purple1], [0.34, 0.34, S.gold]]) {
    p.cyl(dx, G + 0.01, dz, 0.03, 0.18, S.pureWhite);
    p.cyl(dx, G + 0.19, dz, 0.04, 0.025, col);
    p.gsph(dx, G + 0.24, dz, 0.028, S.flame2);
  }
  // 聖火火炬手小人
  kitMini(p, 0, G + 0.028, 0.26, S.seaBlue, { hat: 'cap' });
  kitMini(p, -0.22, G + 0.01, 0.32, S.mintGreen);
  kitMini(p, 0.22, G + 0.01, 0.32, S.purple1);
  p.spill(0, 0, 0.7, 0.7, G + 0.02, 1.0);
}

// 2. track：六道立體紫色橡膠跑道（標記 50m、60m、100m、200m 起跑標線）
function kitMPurpleTrack(p, o) {
  const G = kitG, C = kitC, S = sqC;
  const cz = 0.02, hl = 0.21, R = 0.36, ri = 0.15, ty = G + 0.012;
  // 清爽青草地基底
  p.rbox(0, 0, 0, 1, G, 1, '#86efac');
  // 立體紫色橡膠跑道底層（加厚立體感 0.012）
  p.box(0, G, cz, hl * 2, 0.012, R * 2, S.purpleD);
  for (const s of [-1, 1]) p.cyl(s * hl, G, cz, R, 0.012, S.purpleD);
  // 六道紫色跑道面與交替色階
  const laneW = (R - ri) / 6; // 6 個跑道
  for (let lane = 5; lane >= 0; lane--) {
    const rOuter = ri + (lane + 1) * laneW;
    const col = lane % 2 === 0 ? S.purple1 : S.purple2;
    const h = 0.013 + (5 - lane) * 0.0003;
    p.box(0, G, cz, hl * 2, h, rOuter * 2, col);
    for (const s of [-1, 1]) p.cyl(s * hl, G, cz, rOuter, h, col);
  }
  // 中央翠綠草皮內場
  p.box(0, G, cz, hl * 2, 0.016, ri * 2, '#22c55e');
  for (const s of [-1, 1]) p.cyl(s * hl, G, cz, ri, 0.016, '#22c55e');
  // 六道白色分道線（共 7 條邊界線構成 6 條立體賽道）
  for (let i = 0; i <= 6; i++) {
    const rLine = ri + i * laneW;
    kitStadiumLine(p, 0, cz, hl, rLine, ty + 0.003, 0.0045, S.pureWhite);
  }
  // 標記 50m、60m、100m、200m 起跑標線與立體距離指示牌！
  // (1) 50m 起跑標線（前直道左側，低年級跑走起點 - 亮黃色標線＋立牌）
  const x50 = -0.11;
  p.box(x50, ty + 0.004, cz + (ri + R) / 2, 0.012, 0.003, R - ri, S.goldL);
  p.box(x50, G + 0.01, cz + R + 0.035, 0.01, 0.09, 0.01, S.pureWhite);
  p.box(x50, G + 0.09, cz + R + 0.035, 0.09, 0.045, 0.014, S.gold);
  // (2) 60m 起跑標線（前直道偏左，中年級 60m 起點 - 海青色標線＋立牌）
  const x60 = -0.18;
  p.box(x60, ty + 0.004, cz + (ri + R) / 2, 0.012, 0.003, R - ri, S.skyBlue);
  p.box(x60, G + 0.01, cz + R + 0.035, 0.01, 0.11, 0.01, S.pureWhite);
  p.box(x60, G + 0.11, cz + R + 0.035, 0.09, 0.045, 0.014, S.seaBlue);
  // (3) 100m 起跑標線（左彎道延伸段，中高年級 100m 起點 - 亮白色雙標線＋立牌）
  const x100 = -0.26;
  p.box(x100, ty + 0.004, cz + (ri + R) / 2, 0.014, 0.003, R - ri, S.pureWhite);
  p.box(x100, G + 0.01, cz + R + 0.035, 0.01, 0.13, 0.01, S.pureWhite);
  p.box(x100, G + 0.13, cz + R + 0.035, 0.1, 0.048, 0.014, '#ef4444');
  // (4) 200m 階梯式彎道起跑標線（背直道與彎道交界，高年級 200m 分道差起點 - 翠綠標線＋立牌）
  for (let lane = 0; lane < 6; lane++) {
    const rMid = ri + (lane + 0.5) * laneW;
    const staggerX = -0.08 + lane * 0.032;
    p.box(staggerX, ty + 0.004, cz - rMid, 0.012, 0.003, laneW * 0.9, S.meadow);
  }
  p.box(0.05, G + 0.01, cz - R - 0.035, 0.01, 0.12, 0.01, S.pureWhite);
  p.box(0.05, G + 0.12, cz - R - 0.035, 0.1, 0.048, 0.014, S.mintGreen);

  // 終點線（前直道右側棋盤格）＋藍綠白終點計時拱門
  const fx = 0.16;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      p.box(fx + (j - 0.5) * 0.014, ty + 0.004, cz + ri + (i + 0.5) * laneW, 0.014, 0.003, laneW, (i + j) % 2 ? C.ink : S.pureWhite);
    }
  }
  for (const zz of [cz + ri - 0.015, cz + R + 0.015]) p.cyl(fx, G, zz, 0.01, 0.22, S.seaBlue);
  p.box(fx, G + 0.22, cz + (ri + R) / 2, 0.025, 0.05, R - ri + 0.04, S.pureWhite);
  p.gbox(fx + 0.014, G + 0.225, cz + (ri + R) / 2, 0.005, 0.03, R - ri, S.goldL);

  // 六道衝刺選手小人
  const runnerCols = [S.seaBlue, S.mintGreen, S.gold, '#ef4444', S.skyBlue, '#f472b6'];
  for (let lane = 0; lane < 6; lane++) {
    const rz = cz + ri + (lane + 0.5) * laneW;
    const rx = -0.14 + (lane % 3) * 0.07;
    kitMini(p, rx, ty + 0.003, rz, runnerCols[lane], { hat: lane % 2 === 0 ? 'cap' : '' });
  }
  p.spill(0, cz, 0.85, 0.75, G + 0.015, 0.85);
}

// 3. fan_ribbon：六學年舞蹈彩帶雕塑（美感藝能島）
function kitMFanRibbon(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#ecfeff');
  p.cyl(0, G, 0, 0.38, 0.015, S.skyBlue);
  p.cyl(0, G + 0.015, 0, 0.3, 0.015, S.pureWhite);
  // 六年級「風起・扇耀舞台」巨型展開紅金摺扇
  for (let i = -4; i <= 4; i++) {
    const ang = i * 0.22;
    p.box(Math.sin(ang) * 0.14, G + 0.18 + Math.cos(ang) * 0.12, -0.08, 0.032, 0.26, 0.012, i % 2 === 0 ? '#ef4444' : S.goldL, 0, 0, -ang);
  }
  // 新住民團隊「日本傘舞」和風紙傘造型
  p.cyl(-0.26, G + 0.02, 0.16, 0.008, 0.22, C.woodD);
  p.cone(-0.26, G + 0.24, 0.16, 0.13, 0.06, '#f43f5e');
  p.torus(-0.26, G + 0.22, 0.16, 0.1, S.pureWhite, Math.PI / 2, 0, 0, 0.08);
  // 五年級「棍舞歡騰盛典」金色長棍交叉與幼兒「蕉你動一動」亮黃造型
  p.cyl(0.26, G + 0.15, 0.14, 0.012, 0.28, S.gold, 0, 0, 0.45);
  p.cyl(0.26, G + 0.15, 0.14, 0.012, 0.28, S.seaBlue, 0, 0, -0.45);
  // 律動舞者小人
  [-0.2, 0, 0.2].forEach((x, idx) => {
    kitMini(p, x, G + 0.03, 0.24, [S.seaBlue, '#f43f5e', S.mintGreen][idx]);
  });
  p.spill(0, 0, 0.65, 0.65, G + 0.02, 0.8);
}

// 4. bulletin：賽前完賽英雄公告欄（10/21~11/13 三至六年級個人賽戰報）
function kitMBulletin(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#f0fdf4');
  // 雙柱木造藍綠頂公告牌樓
  for (const s of [-1, 1]) {
    p.box(s * 0.34, G, 0, 0.04, 0.42, 0.04, S.seaBlue);
    p.box(s * 0.34, G, 0, 0.08, 0.03, 0.12, S.pureWhite);
  }
  p.box(0, G + 0.1, 0, 0.66, 0.28, 0.03, S.pureWhite);
  p.box(0, G + 0.39, 0, 0.78, 0.05, 0.14, S.mintGreen);
  p.prism(0, G + 0.44, 0, 0.82, 0.08, 0.18, S.seaBlue);
  // 戰報金銀銅榜單卡片（60m / 100m / 200m）
  const cols = [S.gold, S.silver, S.bronze, S.skyBlue];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      p.gbox(-0.22 + c * 0.15, G + 0.16 + r * 0.11, 0.018, 0.11, 0.08, 0.006, cols[c]);
    }
  }
  // 觀看戰報的學生
  kitMini(p, -0.15, G, 0.22, S.purple1, { hat: 'cap' });
  kitMini(p, 0.12, G, 0.25, S.seaBlue);
  p.spill(0, 0.1, 0.6, 0.4, G + 0.015, 0.75);
}

// 5. baton_relay：巨型黃金接力棒地標（薪傳接力競技場）
function kitMBatonRelay(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#ecfdf5');
  p.cyl(0, G, 0, 0.36, 0.02, S.purple1);
  p.cyl(0, G + 0.02, 0, 0.26, 0.03, S.pureWhite);
  // 雙重交錯斜立巨型接力棒（黃金棒＋海風藍棒，象徵庄情薪傳）
  p.cyl(-0.04, G + 0.28, 0, 0.045, 0.48, S.goldL, 0.35, 0, -0.45);
  p.cyl(0.06, G + 0.26, 0.04, 0.042, 0.44, S.seaBlue, -0.25, 0, 0.4);
  p.torus(0, G + 0.26, 0, 0.18, S.mintGreen, Math.PI / 2, 0.2, 0, 0.12);
  // 傳接棒衝刺的校友、家長、師生代表
  kitMini(p, -0.22, G + 0.02, 0.2, S.seaBlue, { hat: 'cap' });
  kitMini(p, 0.02, G + 0.02, 0.22, S.gold);
  kitMini(p, 0.24, G + 0.02, 0.18, S.mintGreen, { hat: 'cap' });
  p.spill(0, 0, 0.65, 0.65, G + 0.02, 0.9);
}

// 6. stand：校友親師加油觀賽看台
function kitMStand(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#e0f2fe');
  // 三層階梯看台（藍白綠配色）
  for (let i = 0; i < 3; i++) {
    p.box(0, G + i * 0.055, -0.05 - i * 0.1, 0.82, 0.055, 0.12, i % 2 === 0 ? S.pureWhite : '#bae6fd');
  }
  // 遮陽海風弧形頂棚
  for (const s of [-1, 1]) p.cyl(s * 0.38, G, -0.22, 0.015, 0.38, S.seaBlue);
  p.box(0, G + 0.38, -0.12, 0.88, 0.025, 0.36, S.mintGreen, 0, 0.18);
  // 助威加油觀眾與精神錦旗
  const fanCols = [S.seaBlue, S.gold, '#ef4444', S.mintGreen, S.purple1, S.skyBlue];
  for (let i = 0; i < 6; i++) {
    const row = i % 3;
    kitMini(p, -0.3 + i * 0.12, G + (row + 1) * 0.055, -0.05 - row * 0.1, fanCols[i], { hat: i % 2 ? 'cap' : '' });
  }
  p.spill(0, 0, 0.75, 0.5, G + 0.015, 0.75);
}

// 7. hula_barrel：呼啦圈與連環罐障礙道具區（趣味智慧島）
function kitMHulaBarrel(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#d1fae5');
  // 彩色呼啦圈隧道（六年級：呼啦圈小鐵人 / 親子：圈力衝刺）
  const hulaCols = ['#ef4444', S.goldL, S.seaBlue, S.mintGreen, S.purple1];
  for (let i = 0; i < 5; i++) {
    p.torus(-0.28 + i * 0.14, G + 0.14, -0.12, 0.11, hulaCols[i], 0, 0.25, 0, 0.12);
  }
  // 四年級「罐罐相連」彩色堆疊罐與三年級「巾球運送」大彩球
  for (let i = 0; i < 3; i++) {
    p.cyl(-0.24 + i * 0.12, G, 0.22, 0.04, 0.11, i % 2 ? S.seaBlue : S.gold);
  }
  p.sph(0.24, G + 0.09, 0.2, 0.08, '#f43f5e');
  p.box(0.24, G + 0.01, 0.2, 0.22, 0.01, 0.14, S.skyBlue);
  kitMini(p, 0.12, G, 0.22, S.seaBlue, { hat: 'cap' });
  kitMini(p, 0.36, G, 0.22, S.mintGreen, { hat: 'cap' });
  p.spill(0, 0, 0.7, 0.6, G + 0.015, 0.8);
}

// 8. mascot_corner：跳跳虎與親子打卡角（一二年級＆幼兒趣味競賽）
function kitMMascotCorner(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#fef9c3');
  p.cyl(0, G, 0, 0.36, 0.02, S.mintGreen);
  // 可愛立體跳跳虎公仔地標（一年級：跳跳虎）
  p.rbox(0, G + 0.02, -0.04, 0.18, 0.2, 0.14, S.tigerOrange);
  // 虎紋
  for (let i = 0; i < 3; i++) p.box(0, G + 0.06 + i * 0.05, 0.032, 0.14, 0.015, 0.01, S.tigerStripe);
  p.sph(0, G + 0.28, -0.04, 0.11, S.tigerOrange);
  // 老虎耳朵
  for (const s of [-1, 1]) p.sph(s * 0.08, G + 0.37, -0.04, 0.035, S.tigerOrange);
  p.sph(0, G + 0.27, 0.06, 0.035, S.pureWhite);
  // 幼兒「蕉你一起動一動」彎彎香蕉裝飾與串串接接彩環
  p.torus(-0.26, G + 0.1, 0.15, 0.07, S.goldL, 0, 0, 0.6, 0.25);
  kitMini(p, 0.22, G + 0.02, 0.18, S.seaBlue);
  kitMini(p, -0.18, G + 0.02, 0.24, '#f43f5e', { hat: 'cap' });
  p.spill(0, 0, 0.65, 0.65, G + 0.02, 0.8);
}

// 9. podium_award：立體階梯金銀銅頒獎台（五力榮耀星光島）
function kitMPodiumAward(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#e0f2fe');
  p.box(0, G, 0, 0.82, 0.02, 0.56, S.pureWhite);
  // 第 1 名（中央高台 - 冠軍金）
  p.box(0, G + 0.02, -0.02, 0.24, 0.22, 0.24, S.gold);
  p.box(0, G + 0.24, -0.02, 0.26, 0.02, 0.26, S.pureWhite);
  // 第 2 名（左側台 - 亞軍銀藍）
  p.box(-0.25, G + 0.02, -0.02, 0.22, 0.15, 0.22, S.skyBlue);
  p.box(-0.25, G + 0.17, -0.02, 0.24, 0.02, 0.24, S.pureWhite);
  // 第 3 名（右側台 - 季軍翠綠）
  p.box(0.25, G + 0.02, -0.02, 0.22, 0.11, 0.22, S.mintGreen);
  p.box(0.25, G + 0.13, -0.02, 0.24, 0.02, 0.24, S.pureWhite);
  // 站上頒獎台領獎的小選手
  kitMini(p, 0, G + 0.26, -0.02, '#ef4444', { hat: 'cap' });
  kitMini(p, -0.25, G + 0.19, -0.02, S.seaBlue);
  kitMini(p, 0.25, G + 0.15, -0.02, S.purple1, { hat: 'cap' });
  p.spill(0, 0, 0.75, 0.6, G + 0.02, 0.9);
}

// 10. trophy_cup：大會總錦標巨型金盃
function kitMTrophyCup(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#f0fdf4');
  p.cyl(0, G, 0, 0.34, 0.025, S.seaBlue);
  p.box(0, G + 0.025, 0, 0.26, 0.1, 0.26, S.pureWhite);
  p.cyl(0, G + 0.125, 0, 0.05, 0.14, S.gold);
  p.dome(0, G + 0.26, 0, 0.16, S.goldL, 1.1);
  p.torus(0, G + 0.34, 0, 0.18, S.gold, 0, 0, 0, 0.12);
  p.gsph(0, G + 0.46, 0, 0.055, S.pureWhite);
  // 榮譽錦旗柱
  for (const s of [-1, 1]) {
    p.cyl(s * 0.32, G + 0.02, -0.15, 0.01, 0.36, S.gold);
    p.box(s * 0.24, G + 0.28, -0.15, 0.14, 0.09, 0.01, s < 0 ? S.purple1 : S.mintGreen);
  }
  p.spill(0, 0, 0.7, 0.7, G + 0.02, 0.95);
}

// 11. calendar_kiosk：全天賽程時刻觸控亭
function kitMCalendarKiosk(p, o) {
  const G = kitG, C = kitC, S = sqC;
  p.rbox(0, 0, 0, 1, G, 1, '#ecfeff');
  p.cyl(0, G, 0, 0.32, 0.02, S.mintGreen);
  // 現代藍白智慧資訊亭
  p.box(0, G + 0.02, -0.04, 0.28, 0.36, 0.08, S.seaBlue);
  p.gbox(0, G + 0.2, 0.008, 0.22, 0.24, 0.01, S.pureWhite);
  for (let i = 0; i < 4; i++) {
    p.gbox(0, G + 0.12 + i * 0.05, 0.016, 0.18, 0.028, 0.006, i % 2 ? S.skyBlue : S.mintGreen);
  }
  p.box(0, G + 0.38, -0.02, 0.34, 0.04, 0.16, S.gold);
  kitMini(p, 0, G + 0.02, 0.18, S.seaBlue, { hat: 'cap' });
  p.spill(0, 0, 0.6, 0.6, G + 0.02, 0.8);
}
