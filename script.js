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

const home = document.getElementById('home-view');
const gameView = document.getElementById('game-view');
const area = document.getElementById('game-area');
const controls = document.getElementById('game-controls');
const statusEl = document.getElementById('game-status');
let currentGame = null;
let restartFn = () => { };

function setStatus(text) {
    statusEl.textContent = text;
}

function clearGlobalHandlers() {
    document.onkeydown = null;
}

function showHome() {
    clearGlobalHandlers();
    home.classList.add('active');
    gameView.classList.remove('active');
    currentGame = null;
    setStatus('準備開始吧！');
}

function openGame(id) {
    clearGlobalHandlers();
    currentGame = id;
    home.classList.remove('active');
    gameView.classList.add('active');
    area.innerHTML = '';
    controls.innerHTML = '';
    document.getElementById('game-title').textContent = games.find(g => g.id === id).name;
    init[id]();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('btn-home').onclick = showHome;
document.getElementById('btn-restart').onclick = () => restartFn();

games.forEach(game => {
    const card = document.createElement('button');
    card.className = 'card';
    card.innerHTML = `<h3>${game.name}</h3><p>${game.desc}</p><p>能力：${game.ability}</p>`;
    card.onclick = () => openGame(game.id);
    document.getElementById('game-grid').appendChild(card);
});

setInterval(() => document.getElementById('play-reminder').classList.remove('hidden'), 20 * 60 * 1000);

function makeBoard(size, className = 'board') {
    const board = document.createElement('div');
    board.className = className;
    board.style.setProperty('--size', size);
    return board;
}

const init = {
    'num-memory': () => {
        let level = 1;
        let answer = '';
        restartFn = run;
        run();

        function run() {
            const len = level + 2;
            answer = Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
            area.innerHTML = `<div class="simple-panel"><h2>小偵探，記住寶箱密碼</h2><div id="code" class="memory-code">${answer}</div></div>`;
            setStatus(`第 ${level} 關`);
            setTimeout(() => {
                const code = document.getElementById('code');
                if (!code || currentGame !== 'num-memory') return;
                code.textContent = '＊'.repeat(answer.length);
                area.querySelector('.simple-panel').insertAdjacentHTML('beforeend', `<div class="inline-form"><input id="numin" inputmode="numeric" autocomplete="off" aria-label="輸入密碼"><button id="ok">送出</button></div>`);
                document.getElementById('ok').onclick = () => {
                    const value = document.getElementById('numin').value.trim();
                    if (value === answer) {
                        level++;
                        setStatus('答對了，進入下一關');
                        run();
                    } else {
                        setStatus(`差一點點，正確是 ${answer}`);
                        level = 1;
                    }
                };
            }, 1800);
        }
    },

    'pair-memory': () => {
        restartFn = run;
        run();

        function run() {
            const icons = ['★', '●', '▲', '■', '◆', '♥'];
            const arr = [...icons, ...icons].sort(() => Math.random() - 0.5);
            let open = [];
            let done = 0;
            let steps = 0;
            area.innerHTML = '';
            const board = makeBoard(4, 'board memory-board');
            area.appendChild(board);
            arr.forEach(value => {
                const button = document.createElement('button');
                button.className = 'memory-card';
                button.textContent = value;
                button.onclick = () => {
                    if (button.classList.contains('open') || button.classList.contains('done') || open.length === 2) return;
                    button.classList.add('open');
                    steps++;
                    open.push({ button, value });
                    setStatus(`翻牌次數：${steps}`);
                    if (open.length === 2) {
                        if (open[0].value === open[1].value) {
                            open.forEach(item => item.button.classList.add('done'));
                            done += 2;
                            open = [];
                            if (done === arr.length) setStatus(`完成！總翻牌 ${steps}`);
                        } else {
                            setTimeout(() => {
                                open.forEach(item => item.button.classList.remove('open'));
                                open = [];
                            }, 550);
                        }
                    }
                };
                board.appendChild(button);
            });
        }
    },

    'g2048': () => {
        const n = 4;
        let board;
        let score;
        let touchStart = null;
        controls.innerHTML = '<div class="dpad"><button data-d="u">上</button><button data-d="l">左</button><button data-d="d">下</button><button data-d="r">右</button></div>';
        controls.querySelectorAll('button').forEach(button => button.onclick = () => move(button.dataset.d));
        document.onkeydown = event => {
            if (currentGame !== 'g2048') return;
            const direction = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[event.key];
            if (direction) {
                event.preventDefault();
                move(direction);
            }
        };
        restartFn = start;
        start();

        function start() {
            board = Array.from({ length: n }, () => Array(n).fill(0));
            score = 0;
            spawn();
            spawn();
            draw();
        }

        function spawn() {
            const empty = [];
            board.forEach((row, i) => row.forEach((value, j) => !value && empty.push([i, j])));
            if (!empty.length) return;
            const [i, j] = empty[Math.floor(Math.random() * empty.length)];
            board[i][j] = Math.random() < .9 ? 2 : 4;
        }

        function slide(row) {
            row = row.filter(Boolean);
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    score += row[i];
                    row[i + 1] = 0;
                }
            }
            row = row.filter(Boolean);
            while (row.length < n) row.push(0);
            return row;
        }

        function move(direction) {
            let moved = false;
            for (let i = 0; i < n; i++) {
                let row;
                if (direction === 'l' || direction === 'r') {
                    row = [...board[i]];
                    if (direction === 'r') row.reverse();
                    let next = slide(row);
                    if (direction === 'r') next.reverse();
                    if (next.join() !== board[i].join()) {
                        board[i] = next;
                        moved = true;
                    }
                } else {
                    row = board.map(r => r[i]);
                    if (direction === 'd') row.reverse();
                    let next = slide(row);
                    if (direction === 'd') next.reverse();
                    for (let r = 0; r < n; r++) {
                        if (board[r][i] !== next[r]) {
                            board[r][i] = next[r];
                            moved = true;
                        }
                    }
                }
            }
            if (moved) spawn();
            draw();
        }

        function draw() {
            area.innerHTML = '';
            const gameBoard = makeBoard(4, 'board game2048');
            gameBoard.addEventListener('touchstart', event => {
                const t = event.changedTouches[0];
                touchStart = { x: t.clientX, y: t.clientY };
            }, { passive: true });
            gameBoard.addEventListener('touchend', event => {
                if (!touchStart) return;
                const t = event.changedTouches[0];
                const dx = t.clientX - touchStart.x;
                const dy = t.clientY - touchStart.y;
                touchStart = null;
                if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
                event.preventDefault();
                move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'));
            }, { passive: false });
            board.flat().forEach(value => {
                const cell = document.createElement('div');
                cell.className = `cell tile-${value || 0}`;
                cell.textContent = value || '';
                gameBoard.appendChild(cell);
            });
            area.appendChild(gameBoard);
            setStatus(`分數：${score}`);
        }
    },

    'sudoku': () => {
        const puzzles = {
            easy: [[1, 0, 0, 4], [0, 4, 1, 0], [2, 0, 4, 3], [0, 3, 0, 1]],
            normal: [[0, 2, 0, 4], [4, 0, 1, 0], [0, 1, 0, 3], [2, 0, 4, 0]],
            hard: [[0, 0, 3, 0], [0, 4, 0, 2], [1, 0, 0, 0], [0, 3, 0, 0]]
        };
        const solution = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
        let selected = null;
        controls.innerHTML = '<select id="sdiff"><option value="easy">簡單</option><option value="normal">普通</option><option value="hard">挑戰</option></select><button id="check">檢查答案</button>';
        document.getElementById('sdiff').onchange = () => start(document.getElementById('sdiff').value);
        document.getElementById('check').onclick = check;
        restartFn = () => start(document.getElementById('sdiff').value);
        start('easy');

        function start(level) {
            selected = null;
            const puzzle = puzzles[level].map(row => [...row]);
            area.innerHTML = '<div class="sudoku-wrap"></div><div class="number-pad" aria-label="數獨數字鍵"></div>';
            const wrap = area.querySelector('.sudoku-wrap');
            const boardEl = makeBoard(4, 'board sudoku-board');
            wrap.appendChild(boardEl);
            puzzle.forEach((row, i) => row.forEach((value, j) => {
                const input = document.createElement('input');
                input.className = 'sudoku-cell';
                input.maxLength = 1;
                input.inputMode = 'numeric';
                input.pattern = '[1-4]';
                input.dataset.i = i;
                input.dataset.j = j;
                input.readOnly = true;
                if (value) {
                    input.value = value;
                    input.disabled = true;
                } else {
                    input.onclick = () => selectCell(input);
                }
                boardEl.appendChild(input);
            }));
            const pad = area.querySelector('.number-pad');
            [1, 2, 3, 4, '清除'].forEach(value => {
                const button = document.createElement('button');
                button.textContent = value;
                button.onclick = () => {
                    if (!selected) return;
                    selected.value = value === '清除' ? '' : value;
                    selected.classList.remove('wrong', 'right');
                };
                pad.appendChild(button);
            });
            setStatus(`數獨難度：${level}`);
        }

        function selectCell(input) {
            area.querySelectorAll('.sudoku-cell').forEach(cell => cell.classList.remove('selected'));
            selected = input;
            input.classList.add('selected');
        }

        function check() {
            let ok = true;
            area.querySelectorAll('.sudoku-cell').forEach(input => {
                const i = +input.dataset.i;
                const j = +input.dataset.j;
                const good = String(solution[i][j]);
                input.classList.toggle('wrong', input.value !== good);
                input.classList.toggle('right', input.value === good);
                if (input.value !== good) ok = false;
            });
            setStatus(ok ? '完成！你找到規律了' : '再仔細看看，紅色格子可以再想想');
        }
    },

    'slide': () => {
        controls.innerHTML = '<select id="ssize"><option>3</option><option>4</option></select>';
        document.getElementById('ssize').onchange = run;
        restartFn = run;
        run();

        function run() {
            const n = +document.getElementById('ssize').value;
            let arr = [...Array(n * n).keys()].slice(1).concat(0);
            for (let i = 0; i < 80; i++) {
                const z = arr.indexOf(0);
                const r = Math.floor(z / n);
                const c = z % n;
                const opts = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
                    .filter(([x, y]) => x >= 0 && y >= 0 && x < n && y < n)
                    .map(([x, y]) => x * n + y);
                const t = opts[Math.floor(Math.random() * opts.length)];
                [arr[z], arr[t]] = [arr[t], arr[z]];
            }
            let steps = 0;
            draw();

            function draw() {
                area.innerHTML = '';
                const board = makeBoard(n, 'board slide-board');
                arr.forEach((value, idx) => {
                    const tile = document.createElement('button');
                    tile.className = 'cell';
                    tile.textContent = value || '';
                    if (!value) tile.classList.add('empty');
                    tile.onclick = () => {
                        const z = arr.indexOf(0);
                        const ok = [idx - 1, idx + 1, idx - n, idx + n].includes(z) && !(idx % n === 0 && z === idx - 1) && !(idx % n === n - 1 && z === idx + 1);
                        if (ok) {
                            [arr[idx], arr[z]] = [arr[z], arr[idx]];
                            steps++;
                            draw();
                            if (arr.every((x, i) => x === ((i + 1) % (n * n)))) setStatus(`恭喜完成！步數 ${steps}`);
                        }
                    };
                    board.appendChild(tile);
                });
                area.appendChild(board);
                setStatus(`步數：${steps}`);
            }
        }
    },

    'hanoi': () => {
        controls.innerHTML = '<select id="hd"><option>3</option><option>4</option><option>5</option></select>';
        document.getElementById('hd').onchange = run;
        restartFn = run;
        run();

        function run() {
            const n = +document.getElementById('hd').value;
            let pegs = [Array.from({ length: n }, (_, i) => n - i), [], []];
            let selected = null;
            let steps = 0;
            draw();

            function draw() {
                area.innerHTML = '<div class="hanoi-wrap"></div>';
                const wrap = area.firstChild;
                pegs.forEach((pegDisks, i) => {
                    const peg = document.createElement('button');
                    peg.className = `peg ${selected === i ? 'selected' : ''}`;
                    peg.onclick = () => clickPeg(i);
                    pegDisks.forEach(disk => {
                        const div = document.createElement('div');
                        div.className = 'disk';
                        div.style.width = `${38 + disk * 13}%`;
                        div.style.background = `hsl(${disk * 48},70%,60%)`;
                        peg.appendChild(div);
                    });
                    wrap.appendChild(peg);
                });
                setStatus(`步數：${steps}，最少步數：${2 ** n - 1}`);
            }

            function clickPeg(i) {
                if (selected === null) {
                    if (pegs[i].length) selected = i;
                    draw();
                    return;
                }
                const a = pegs[selected][pegs[selected].length - 1];
                const b = pegs[i][pegs[i].length - 1];
                if (selected !== i && (!b || a < b)) {
                    pegs[i].push(pegs[selected].pop());
                    steps++;
                    if (pegs[2].length === n) setStatus(`完成！步數：${steps}`);
                }
                selected = null;
                draw();
            }
        }
    },

    'maze': () => {
        const maps = [
            [[0, 0, 0, 1, 0, 0, 0], [1, 1, 0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 0], [0, 1, 0, 0, 0, 0, 0], [0, 1, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0]],
            [[0, 0, 1, 0, 0, 0, 0, 1, 0], [1, 0, 1, 0, 1, 1, 0, 1, 0], [0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 1, 1, 0], [0, 0, 0, 1, 1, 0, 0, 0, 0], [1, 1, 0, 0, 0, 0, 1, 1, 0], [0, 0, 0, 1, 1, 0, 0, 0, 0], [0, 1, 0, 0, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 0, 0]],
            [[0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]]
        ];
        let idx = 0;
        let player = [0, 0];
        let goal = [0, 0];
        let steps = 0;
        controls.innerHTML = '<button id="mp">上一張</button><button id="mn">下一張</button><div class="dpad"><button data-d="u">上</button><button data-d="l">左</button><button data-d="d">下</button><button data-d="r">右</button></div>';
        controls.onclick = e => {
            if (e.target.id === 'mp') load((idx + maps.length - 1) % maps.length);
            if (e.target.id === 'mn') load((idx + 1) % maps.length);
            if (e.target.dataset.d) move(e.target.dataset.d);
        };
        document.onkeydown = event => {
            if (currentGame !== 'maze') return;
            const direction = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[event.key];
            if (direction) {
                event.preventDefault();
                move(direction);
            }
        };
        restartFn = () => load(idx);
        load(0);

        function load(i) {
            idx = i;
            player = [0, 0];
            steps = 0;
            const last = maps[idx].length - 1;
            goal = [last, last];
            draw();
            setStatus(`迷宮 ${idx + 1}/${maps.length}，尺寸 ${maps[idx].length}x${maps[idx].length}`);
        }

        function move(direction) {
            const delta = { u: [-1, 0], d: [1, 0], l: [0, -1], r: [0, 1] }[direction];
            const nx = player[0] + delta[0];
            const ny = player[1] + delta[1];
            const map = maps[idx];
            if (nx < 0 || ny < 0 || nx >= map.length || ny >= map.length || map[nx][ny] === 1) return;
            player = [nx, ny];
            steps++;
            draw();
            if (nx === goal[0] && ny === goal[1]) setStatus(`你找到出口了！步數 ${steps}`);
            else setStatus(`迷宮 ${idx + 1}/${maps.length}，步數 ${steps}`);
        }

        function draw() {
            const map = maps[idx];
            area.innerHTML = '';
            const board = makeBoard(map.length, 'board maze');
            map.forEach((row, i) => row.forEach((value, j) => {
                const cell = document.createElement('div');
                cell.className = value ? 'wall' : 'road';
                if (i === goal[0] && j === goal[1]) cell.className = 'goal';
                if (i === player[0] && j === player[1]) cell.className = 'player';
                board.appendChild(cell);
            }));
            area.appendChild(board);
        }
    },

    'spot': () => {
        const palette = ['#ffd166', '#7bdff2', '#f2b5d4', '#b2f7ef', '#cdb4db', '#bde0fe', '#ffafcc', '#caffbf'];
        const levels = [
            { cols: 4, total: 16, changes: { 3: 'shape', 6: 'color', 11: 'dot', 14: 'size' } },
            { cols: 5, total: 20, changes: { 2: 'color', 5: 'dot', 9: 'shape', 12: 'size', 18: 'stripe' } },
            { cols: 5, total: 25, changes: { 1: 'stripe', 4: 'shape', 7: 'dot', 10: 'color', 13: 'size', 17: 'shape', 22: 'color' } }
        ];
        let level = 0;
        let found = [];
        restartFn = () => start(level);
        start(0);

        function start(i) {
            level = i;
            found = [];
            area.innerHTML = '<div class="spots"><div class="spot-board" id="a"></div><div class="spot-board" id="b"></div></div>';
            const A = document.getElementById('a');
            const B = document.getElementById('b');
            const data = levels[level];
            A.style.setProperty('--spot-cols', data.cols);
            B.style.setProperty('--spot-cols', data.cols);
            for (let k = 0; k < data.total; k++) {
                makeSpot(A, k, null);
                makeSpot(B, k, data.changes[k]);
            }
            setStatus(`第 ${level + 1} 關，找出 ${Object.keys(data.changes).length} 個不同處`);
        }

        function makeSpot(parent, k, change) {
            const spot = document.createElement('button');
            spot.className = 'spot';
            spot.style.background = palette[k % palette.length];
            spot.style.borderRadius = `${(k % 4) * 8 + 4}px`;
            if (k % 3 === 0) spot.classList.add('spot-dot');
            if (k % 5 === 0) spot.classList.add('spot-stripe');
            if (change === 'shape') spot.style.borderRadius = '50%';
            if (change === 'color') spot.style.background = palette[(k + 3) % palette.length];
            if (change === 'size') spot.style.transform = 'scale(.72)';
            if (change === 'dot') spot.classList.toggle('spot-dot');
            if (change === 'stripe') spot.classList.toggle('spot-stripe');
            spot.onclick = () => {
                if (change && !found.includes(k)) {
                    found.push(k);
                    spot.classList.add('found');
                    if (found.length === Object.keys(levels[level].changes).length) {
                        if (level < levels.length - 1) start(level + 1);
                        else setStatus('全部找到了！觀察力很厲害');
                    }
                } else if (!change) {
                    setStatus('再仔細看看');
                }
            };
            parent.appendChild(spot);
        }
    },

    'klotski': () => {
        const levels = [
            { w: 4, h: 5, blocks: [['A', 1, 0, 2, 2], ['B', 0, 0, 1, 2], ['C', 3, 0, 1, 2], ['D', 0, 2, 1, 2], ['E', 3, 2, 1, 2], ['F', 1, 2, 1, 1], ['G', 2, 2, 1, 1], ['H', 1, 3, 1, 1], ['I', 2, 3, 1, 1]] },
            { w: 4, h: 5, blocks: [['A', 1, 1, 2, 2], ['B', 0, 0, 1, 2], ['C', 3, 0, 1, 2], ['D', 0, 2, 1, 2], ['E', 3, 2, 1, 2], ['F', 1, 0, 1, 1], ['G', 2, 0, 1, 1], ['H', 1, 3, 1, 1], ['I', 2, 3, 1, 1]] }
        ];
        let level = 0;
        let steps = 0;
        let selected = null;
        let blocks = [];
        controls.innerHTML = '<button id="kprev">關卡1</button><button id="knext">關卡2</button><div class="dpad"><button data-d="u">上</button><button data-d="l">左</button><button data-d="d">下</button><button data-d="r">右</button></div>';
        controls.onclick = event => {
            if (event.target.id === 'kprev') load(0);
            if (event.target.id === 'knext') load(1);
            if (event.target.dataset.d) move(event.target.dataset.d);
        };
        restartFn = () => load(level);
        load(0);

        function load(i) {
            level = i;
            steps = 0;
            selected = null;
            blocks = levels[i].blocks.map(block => ({ id: block[0], x: block[1], y: block[2], w: block[3], h: block[4] }));
            draw();
        }

        function draw() {
            const data = levels[level];
            area.innerHTML = '';
            const board = document.createElement('div');
            board.className = 'klotski-board';
            board.style.setProperty('--kw', data.w);
            board.style.setProperty('--kh', data.h);
            blocks.forEach(block => {
                const tile = document.createElement('button');
                tile.className = `klotski-block ${block.id === selected ? 'selected' : ''} ${block.id === 'A' ? 'main' : ''}`;
                tile.textContent = block.id;
                tile.style.left = `${block.x / data.w * 100}%`;
                tile.style.top = `${block.y / data.h * 100}%`;
                tile.style.width = `${block.w / data.w * 100}%`;
                tile.style.height = `${block.h / data.h * 100}%`;
                tile.onclick = () => {
                    selected = block.id;
                    draw();
                };
                board.appendChild(tile);
            });
            area.appendChild(board);
            setStatus(`步數：${steps}（先點方塊再移動）`);
        }

        function occupied(skip) {
            const cells = {};
            blocks.forEach(block => {
                if (block.id === skip) return;
                for (let i = 0; i < block.h; i++) for (let j = 0; j < block.w; j++) cells[`${block.x + j},${block.y + i}`] = 1;
            });
            return cells;
        }

        function move(direction) {
            if (!selected) return;
            const block = blocks.find(item => item.id === selected);
            const delta = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[direction];
            const nx = block.x + delta[0];
            const ny = block.y + delta[1];
            const data = levels[level];
            const cells = occupied(selected);
            if (nx < 0 || ny < 0 || nx + block.w > data.w || ny + block.h > data.h) return;
            for (let i = 0; i < block.h; i++) for (let j = 0; j < block.w; j++) if (cells[`${nx + j},${ny + i}`]) return;
            block.x = nx;
            block.y = ny;
            steps++;
            if (block.id === 'A' && block.x === 1 && block.y === 3) setStatus(`過關！步數 ${steps}`);
            draw();
        }
    },

    'pattern': () => {
        const questions = [
            { hint: '同時觀察顏色和形狀', s: ['紅圓', '藍方', '黃圓', '綠方'], a: '紫圓', opts: ['紫圓', '紅方', '藍圓', '黃方'] },
            { hint: '同時觀察方向和數量', s: ['↑', '→→', '↓↓↓', '←←←←'], a: '↑↑↑↑↑', opts: ['↑↑↑↑↑', '→→→→→', '←←←←←', '↓↓↓↓'] },
            { hint: '找出兩條交錯的循環', s: ['紅▲', '藍■', '綠◆', '紅▲', '藍■'], a: '綠◆', opts: ['紅◆', '綠◆', '藍▲', '綠■'] },
            { hint: '注意鏡像方向與重複數量', s: ['◁', '▷▷', '◁◁◁', '▷', '◁◁'], a: '▷▷▷', opts: ['▷▷▷', '◁◁◁', '▷▷', '◁'] },
            { hint: '同時追蹤大小、顏色和圖案', s: ['小紅星', '大藍月', '小黃星', '大綠月', '小紫星'], a: '大紅月', opts: ['小紅月', '大紅月', '大紫星', '小藍星'] }
        ];
        let level = 0;
        restartFn = () => run(level);
        run(0);

        function run(i) {
            level = i;
            const question = questions[i];
            area.innerHTML = `<div class="simple-panel"><h2>完成圖形規律</h2><div class="pattern-seq">${question.s.join(' → ')} → ?</div><p class="pattern-hint">${question.hint}</p><div class="pattern-opts"></div></div>`;
            const options = area.querySelector('.pattern-opts');
            question.opts.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.onclick = () => {
                    if (option === question.a) {
                        if (level < questions.length - 1) run(level + 1);
                        else setStatus('全部規律完成！');
                    } else {
                        setStatus('差一點點，再試一次');
                    }
                };
                options.appendChild(button);
            });
            setStatus(`規律關卡 ${level + 1}/${questions.length}`);
        }
    }
};

showHome();
