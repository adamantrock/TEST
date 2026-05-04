const games = [
    { id: 'num-memory', name: '數字記憶', ability: '記憶力、專注力', desc: '記住寶箱密碼' },
    { id: 'pair-memory', name: '圖形配對記憶', ability: '記憶力、觀察力', desc: '翻開相同圖案配對' },
    { id: 'g2048', name: '2048', ability: '策略、空間規劃', desc: '合成更大數字' },
    { id: 'sudoku', name: '數獨', ability: '邏輯推理、專注', desc: '4x4 兒童版數獨' },
    { id: 'slide', name: '滑塊拼圖', ability: '空間感、耐心', desc: '排回正確順序' },
    { id: 'hanoi', name: '河內塔', ability: '邏輯規劃', desc: '把圓盤移到終點柱' },
    { id: 'maze', name: '迷宮', ability: '方向感、路徑規劃', desc: '走到終點旗子' },
    { id: 'spot', name: '找不同', ability: '觀察力、細節辨識', desc: '找出左右差異' },
    { id: 'klotski', name: '滑動解謎', ability: '逆向思考', desc: '把主方塊移到出口' },
    { id: 'pattern', name: '圖形規律', ability: '抽象思考', desc: '找出下一個圖形' }
];
const home = document.getElementById('home-view'), gameView = document.getElementById('game-view'), area = document.getElementById('game-area'), controls = document.getElementById('game-controls'), statusEl = document.getElementById('game-status');
let currentGame = null, restartFn = () => { };
const state = {};
function setStatus(t) { statusEl.textContent = t }
function showHome() { home.classList.add('active'); gameView.classList.remove('active'); currentGame = null; setStatus('準備開始吧！') }
function openGame(id) { currentGame = id; home.classList.remove('active'); gameView.classList.add('active'); area.innerHTML = ''; controls.innerHTML = ''; document.getElementById('game-title').textContent = games.find(g => g.id === id).name; init[id](); }

document.getElementById('btn-home').onclick = showHome; document.getElementById('btn-restart').onclick = () => restartFn();

games.forEach(g => { const c = document.createElement('button'); c.className = 'card'; c.innerHTML = `<h3>${g.name}</h3><p>${g.desc}</p><p>能力：${g.ability}</p>`; c.onclick = () => openGame(g.id); document.getElementById('game-grid').appendChild(c); });
setInterval(() => document.getElementById('play-reminder').classList.remove('hidden'), 20 * 60 * 1000);

const init = {
    'num-memory': () => { let lv = 1, ans = ''; restartFn = run; run(); function run() { const len = lv + 2; ans = Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join(''); area.innerHTML = `<h2>小偵探，記住寶箱密碼：<span id='code'>${ans}</span></h2>`; setStatus(`第 ${lv} 關`); setTimeout(() => { document.getElementById('code').textContent = '***'; area.innerHTML += `<p><input id='numin'><button id='ok'>送出</button></p>`; document.getElementById('ok').onclick = () => { const v = document.getElementById('numin').value.trim(); if (v === ans) { lv++; setStatus('這一步很聰明！進入下一關'); run(); } else { setStatus(`差一點點，正確是 ${ans}`); lv = 1; } } }, 1800) } },
    'pair-memory': () => { restartFn = run; run(); function run() { const icons = ['★', '●', '▲', '■', '◆', '♥']; const arr = [...icons, ...icons].sort(() => Math.random() - 0.5); let open = [], done = 0, step = 0; area.innerHTML = '<div class="grid" style="grid-template-columns:repeat(4,1fr)"></div>'; const g = area.firstChild; arr.forEach((v, i) => { const b = document.createElement('button'); b.className = 'memory-card'; b.textContent = v; b.onclick = () => { if (b.classList.contains('open') || b.classList.contains('done') || open.length === 2) return; b.classList.add('open'); step++; open.push({ b, v }); setStatus(`翻牌次數：${step}`); if (open.length === 2) { if (open[0].v === open[1].v) { open.forEach(x => x.b.classList.add('done')); done += 2; open = []; if (done === arr.length) setStatus(`完成！總翻牌 ${step}`) } else setTimeout(() => { open.forEach(x => x.b.classList.remove('open')); open = []; }, 500) } }; g.appendChild(b); }); } },
    'g2048': () => {
        let n = 4, bd, score; const btns = ['上', '左', '下', '右']; controls.innerHTML = btns.map((t, i) => `<button data-d='${['u', 'l', 'd', 'r'][i]}'>${t}</button>`).join(''); restartFn = start; start(); controls.querySelectorAll('button').forEach(b => b.onclick = () => move(b.dataset.d)); document.onkeydown = e => { if (currentGame !== 'g2048') return; const m = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[e.key]; if (m) move(m) };
        function start() { bd = Array.from({ length: n }, () => Array(n).fill(0)); score = 0; spawn(); spawn(); draw(); }
        function spawn() { const e = []; bd.forEach((r, i) => r.forEach((v, j) => !v && e.push([i, j]))); if (!e.length) return; const [i, j] = e[Math.floor(Math.random() * e.length)]; bd[i][j] = Math.random() < .9 ? 2 : 4 }
        function slide(row) { row = row.filter(x => x); for (let i = 0; i < row.length - 1; i++)if (row[i] === row[i + 1]) { row[i] *= 2; score += row[i]; row[i + 1] = 0; } row = row.filter(x => x); while (row.length < n) row.push(0); return row }
        function move(d) { let moved = false; for (let i = 0; i < n; i++) { let row; if (d === 'l' || d === 'r') { row = [...bd[i]]; if (d === 'r') row.reverse(); let s = slide(row); if (d === 'r') s.reverse(); if (s.join() != bd[i].join()) { bd[i] = s; moved = true } } else { row = bd.map(r => r[i]); if (d === 'd') row.reverse(); let s = slide(row); if (d === 'd') s.reverse(); for (let r = 0; r < n; r++)if (bd[r][i] !== s[r]) { bd[r][i] = s[r]; moved = true } } } if (moved) spawn(); draw(); }
        function draw() { area.innerHTML = '<div class="grid" style="grid-template-columns:repeat(4,70px)"></div>'; const g = area.firstChild; bd.flat().forEach(v => { const d = document.createElement('div'); d.className = 'cell'; d.textContent = v || ''; g.appendChild(d) }); setStatus(`分數：${score}`) }
    },
    'sudoku': () => { const puzzles = { easy: [[1, 0, 0, 4], [0, 4, 1, 0], [2, 0, 4, 3], [0, 3, 0, 1]], normal: [[0, 2, 0, 4], [4, 0, 1, 0], [0, 1, 0, 3], [2, 0, 4, 0]], hard: [[0, 0, 3, 0], [0, 4, 0, 2], [1, 0, 0, 0], [0, 3, 0, 0]] }; const sol = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]]; controls.innerHTML = '<select id="sdiff"><option value="easy">簡單</option><option value="normal">普通</option><option value="hard">挑戰</option></select><button id="check">檢查答案</button>'; restartFn = () => start(document.getElementById('sdiff').value); document.getElementById('sdiff').onchange = () => restartFn(); document.getElementById('check').onclick = check; start('easy'); function start(d) { const p = puzzles[d].map(r => [...r]); area.innerHTML = '<div class="grid" style="grid-template-columns:repeat(4,56px)"></div>'; const g = area.firstChild; p.forEach((r, i) => r.forEach((v, j) => { const input = document.createElement('input'); input.maxLength = 1; input.dataset.i = i; input.dataset.j = j; input.style.width = '56px'; input.style.height = '56px'; input.style.textAlign = 'center'; if (v) { input.value = v; input.disabled = true } g.appendChild(input) })); setStatus(`數獨難度：${d}`) } function check() { let ok = true; area.querySelectorAll('input').forEach(inp => { const i = +inp.dataset.i, j = +inp.dataset.j; const good = String(sol[i][j]); if (inp.value !== good) { inp.style.background = '#ffd4d4'; ok = false } else inp.style.background = '#dff8df'; }); setStatus(ok ? '你找到規律了嗎？太棒了，完成！' : '再仔細看看，紅色格子可以再想想') } },
    'slide': () => { controls.innerHTML = '<select id="ssize"><option>3</option><option>4</option></select>'; document.getElementById('ssize').onchange = run; restartFn = run; run(); function run() { const n = +document.getElementById('ssize').value; let arr = [...Array(n * n).keys()].slice(1).concat(0); for (let i = 0; i < 80; i++) { const z = arr.indexOf(0), r = Math.floor(z / n), c = z % n, opts = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([x, y]) => x >= 0 && y >= 0 && x < n && y < n).map(([x, y]) => x * n + y); const t = opts[Math.floor(Math.random() * opts.length)];[arr[z], arr[t]] = [arr[t], arr[z]] } let step = 0; draw(); function draw() { area.innerHTML = `<div class='grid' style='grid-template-columns:repeat(${n},70px)'></div>`; const g = area.firstChild; arr.forEach((v, idx) => { const d = document.createElement('button'); d.className = 'cell'; d.textContent = v || ''; if (!v) d.style.visibility = 'hidden'; d.onclick = () => { const z = arr.indexOf(0); const ok = [idx - 1, idx + 1, idx - n, idx + n].includes(z) && !(idx % n === 0 && z === idx - 1) && !(idx % n === n - 1 && z === idx + 1); if (ok) { [arr[idx], arr[z]] = [arr[z], arr[idx]]; step++; draw(); if (arr.every((x, i) => x === ((i + 1) % (n * n)))) setStatus(`恭喜完成！步數 ${step}`) } }; g.appendChild(d) }); setStatus(`步數：${step}`) } } },
    'hanoi': () => { controls.innerHTML = '<select id="hd"><option>3</option><option>4</option><option>5</option></select>'; document.getElementById('hd').onchange = run; restartFn = run; run(); function run() { const n = +document.getElementById('hd').value; let pegs = [Array.from({ length: n }, (_, i) => n - i), [], []], sel = null, step = 0; draw(); function draw() { area.innerHTML = '<div class="hanoi-wrap"></div>'; const wrap = area.firstChild; pegs.forEach((p, i) => { const peg = document.createElement('div'); peg.className = 'peg'; peg.onclick = () => clickPeg(i); p.forEach(d => { const div = document.createElement('div'); div.className = 'disk'; div.style.width = (40 + d * 20) + 'px'; div.style.background = `hsl(${d * 40},70%,60%)`; peg.appendChild(div) }); wrap.appendChild(peg) }); setStatus(`步數：${step}，最少步數：${2 ** n - 1}`) } function clickPeg(i) { if (sel === null) { if (pegs[i].length) sel = i; return; } const a = pegs[sel][pegs[sel].length - 1], b = pegs[i][pegs[i].length - 1]; if (sel !== i && (!b || a < b)) { pegs[i].push(pegs[sel].pop()); step++; if (pegs[2].length === n) setStatus(`完成！步數：${step}`); } sel = null; draw() } } },
    'maze': () => {
        const maps = [
            [[0, 0, 0, 1, 0, 0, 0], [1, 1, 0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 0], [0, 1, 0, 0, 0, 0, 0], [0, 1, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0]],
            [[0, 0, 1, 0, 0, 0, 0, 1, 0], [1, 0, 1, 0, 1, 1, 0, 1, 0], [0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 1, 1, 0], [0, 0, 0, 1, 1, 0, 0, 0, 0], [1, 1, 0, 0, 0, 0, 1, 1, 0], [0, 0, 0, 1, 1, 0, 0, 0, 0], [0, 1, 0, 0, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 0, 0]],
            [[0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]]
        ];
        let idx = 0, p = [0, 0], goal = [0, 0], steps = 0;
        controls.innerHTML = '<button id="mp">上一張</button><button id="mn">下一張</button><button data-d="u">上</button><button data-d="l">左</button><button data-d="d">下</button><button data-d="r">右</button>';
        restartFn = () => load(idx);
        controls.onclick = e => { if (e.target.id === 'mp') load((idx + maps.length - 1) % maps.length); if (e.target.id === 'mn') load((idx + 1) % maps.length); if (e.target.dataset.d) mv(e.target.dataset.d) };
        document.onkeydown = e => { if (currentGame !== 'maze') return; const d = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[e.key]; if (d) mv(d) };
        load(0);
        function load(i) { idx = i; p = [0, 0]; steps = 0; const last = maps[idx].length - 1; goal = [last, last]; draw(); setStatus(`迷宮 ${idx + 1}/${maps.length}，尺寸 ${maps[idx].length}x${maps[idx].length}`) }
        function mv(d) { const m = { u: [-1, 0], d: [1, 0], l: [0, -1], r: [0, 1] }[d], nx = p[0] + m[0], ny = p[1] + m[1], map = maps[idx]; if (nx < 0 || ny < 0 || nx >= map.length || ny >= map.length || map[nx][ny] === 1) return; p = [nx, ny]; steps++; draw(); if (nx === goal[0] && ny === goal[1]) setStatus(`你找到出口了！步數 ${steps}`); else setStatus(`迷宮 ${idx + 1}/${maps.length}，步數 ${steps}`) }
        function draw() { const map = maps[idx], cell = Math.max(20, 34 - map.length); area.innerHTML = '<div class="maze"></div>'; const mz = area.firstChild; mz.style.gridTemplateColumns = `repeat(${map.length},${cell}px)`; for (let i = 0; i < map.length; i++)for (let j = 0; j < map.length; j++) { const d = document.createElement('div'); d.style.width = `${cell}px`; d.style.height = `${cell}px`; d.className = map[i][j] ? 'wall' : 'road'; if (i === goal[0] && j === goal[1]) d.className = 'goal'; if (i === p[0] && j === p[1]) d.className = 'player'; mz.appendChild(d) } }
    },
    'spot': () => {
        const palette = ['#ffd166', '#7bdff2', '#f2b5d4', '#b2f7ef', '#cdb4db', '#bde0fe', '#ffafcc', '#caffbf'];
        const levels = [
            { cols: 4, total: 16, changes: { 3: 'shape', 6: 'color', 11: 'dot', 14: 'size' } },
            { cols: 5, total: 20, changes: { 2: 'color', 5: 'dot', 9: 'shape', 12: 'size', 18: 'stripe' } },
            { cols: 5, total: 25, changes: { 1: 'stripe', 4: 'shape', 7: 'dot', 10: 'color', 13: 'size', 17: 'shape', 22: 'color' } }
        ];
        let lv = 0, found = [];
        restartFn = () => start(lv);
        start(0);
        function start(i) {
            lv = i; found = [];
            area.innerHTML = '<div class="spots"><div class="spot-board" id="a"></div><div class="spot-board" id="b"></div></div>';
            const A = document.getElementById('a'), B = document.getElementById('b'), level = levels[lv];
            A.style.gridTemplateColumns = B.style.gridTemplateColumns = `repeat(${level.cols}, 46px)`;
            for (let k = 0; k < level.total; k++) { mk(A, k, null); mk(B, k, level.changes[k]); }
            setStatus(`第 ${lv + 1} 關，找出 ${Object.keys(level.changes).length} 個不同處`)
        }
        function mk(el, k, chg) {
            const d = document.createElement('div');
            d.className = 'spot';
            d.style.background = palette[k % palette.length];
            d.style.borderRadius = `${(k % 4) * 8 + 4}px`;
            if (k % 3 === 0) d.classList.add('spot-dot');
            if (k % 5 === 0) d.classList.add('spot-stripe');
            if (chg === 'shape') d.style.borderRadius = '50%';
            if (chg === 'color') d.style.background = palette[(k + 3) % palette.length];
            if (chg === 'size') d.style.transform = 'scale(.72)';
            if (chg === 'dot') d.classList.toggle('spot-dot');
            if (chg === 'stripe') d.classList.toggle('spot-stripe');
            d.onclick = () => {
                if (chg && !found.includes(k)) {
                    found.push(k);
                    d.classList.add('found');
                    if (found.length === Object.keys(levels[lv].changes).length) {
                        if (lv < levels.length - 1) start(lv + 1);
                        else setStatus('全部找到了！觀察力很厲害')
                    }
                } else if (!chg) setStatus('再仔細看看');
            };
            el.appendChild(d)
        }
    },
    'klotski': () => { const levels = [{ w: 4, h: 5, target: 'A', blocks: [['A', 1, 0, 2, 2], ['B', 0, 0, 1, 2], ['C', 3, 0, 1, 2], ['D', 0, 2, 1, 2], ['E', 3, 2, 1, 2], ['F', 1, 2, 1, 1], ['G', 2, 2, 1, 1], ['H', 1, 3, 1, 1], ['I', 2, 3, 1, 1]] }, { w: 4, h: 5, target: 'A', blocks: [['A', 1, 1, 2, 2], ['B', 0, 0, 1, 2], ['C', 3, 0, 1, 2], ['D', 0, 2, 1, 2], ['E', 3, 2, 1, 2], ['F', 1, 0, 1, 1], ['G', 2, 0, 1, 1], ['H', 1, 3, 1, 1], ['I', 2, 3, 1, 1]] }]; let li = 0, step = 0, sel = null, b = []; controls.innerHTML = '<button id="kprev">關卡1</button><button id="knext">關卡2</button>'; controls.onclick = e => { if (e.target.id === 'kprev') load(0); if (e.target.id === 'knext') load(1) }; restartFn = () => load(li); load(0); function load(i) { li = i; step = 0; b = levels[i].blocks.map(x => ({ id: x[0], x: x[1], y: x[2], w: x[3], h: x[4] })); draw() } function draw() { const L = levels[li]; area.innerHTML = ''; const board = document.createElement('div'); board.style.cssText = `position:relative;width:${L.w * 70}px;height:${L.h * 70}px;background:#eef6ff;border:2px solid #aac`; b.forEach(bl => { const d = document.createElement('div'); d.textContent = bl.id; d.style.cssText = `position:absolute;left:${bl.x * 70}px;top:${bl.y * 70}px;width:${bl.w * 70 - 4}px;height:${bl.h * 70 - 4}px;background:${bl.id === 'A' ? '#f7a' : '#9cf'};border:2px solid #456;display:flex;align-items:center;justify-content:center;cursor:pointer`; d.onclick = () => sel = bl.id; board.appendChild(d) }); area.appendChild(board);['上:u', '下:d', '左:l', '右:r'].forEach(v => { const [t, d] = v.split(':'); const bt = document.createElement('button'); bt.textContent = t; bt.onclick = () => mv(d); area.appendChild(bt) }); setStatus(`步數：${step}（先點方塊再移動）`) } function occ(skip) { const o = {}; b.forEach(bl => { if (bl.id === skip) return; for (let i = 0; i < bl.h; i++)for (let j = 0; j < bl.w; j++)o[`${bl.x + j},${bl.y + i}`] = 1 }); return o } function mv(d) { if (!sel) return; const bl = b.find(x => x.id === sel), m = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[d], nx = bl.x + m[0], ny = bl.y + m[1], o = occ(sel), L = levels[li]; if (nx < 0 || ny < 0 || nx + bl.w > L.w || ny + bl.h > L.h) return; for (let i = 0; i < bl.h; i++)for (let j = 0; j < bl.w; j++)if (o[`${nx + j},${ny + i}`]) return; bl.x = nx; bl.y = ny; step++; if (bl.id === 'A' && bl.x === 1 && bl.y === 3) setStatus(`過關！步數 ${step}`); draw() } },
    'pattern': () => {
        const qs = [
            { hint: '同時觀察顏色和形狀', s: ['紅圓', '藍方', '黃圓', '綠方'], a: '紫圓', opts: ['紫圓', '紅方', '藍圓', '黃方'] },
            { hint: '同時觀察方向和數量', s: ['↑', '→→', '↓↓↓', '←←←←'], a: '↑↑↑↑↑', opts: ['↑↑↑↑↑', '→→→→→', '←←←←←', '↓↓↓↓'] },
            { hint: '找出兩條交錯的循環', s: ['紅▲', '藍■', '綠◆', '紅▲', '藍■'], a: '綠◆', opts: ['紅◆', '綠◆', '藍▲', '綠■'] },
            { hint: '注意鏡像方向與重複數量', s: ['◁', '▷▷', '◁◁◁', '▷', '◁◁'], a: '▷▷▷', opts: ['▷▷▷', '◁◁◁', '▷▷', '◁'] },
            { hint: '同時追蹤大小、顏色和圖案', s: ['小紅星', '大藍月', '小黃星', '大綠月', '小紫星'], a: '大紅月', opts: ['小紅月', '大紅月', '大紫星', '小藍星'] }
        ];
        let lv = 0;
        restartFn = () => run(lv);
        run(0);
        function run(i) {
            lv = i;
            const q = qs[i];
            area.innerHTML = `<h3>完成圖形規律：${q.s.join(' → ')} → ?</h3><p class="pattern-hint">${q.hint}</p><div class='pattern-opts'></div>`;
            const box = area.querySelector('.pattern-opts');
            q.opts.forEach(o => {
                const b = document.createElement('button');
                b.textContent = o;
                b.onclick = () => {
                    if (o === q.a) {
                        if (lv < qs.length - 1) run(lv + 1);
                        else setStatus('全部規律完成！')
                    } else setStatus('差一點點，再試一次')
                };
                box.appendChild(b)
            });
            setStatus(`規律關卡 ${lv + 1}/${qs.length}`)
        }
    }
};
showHome();
