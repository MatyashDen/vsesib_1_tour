var scr;
var layers = [];

var STEP = 5000;

var LAYER_VIEW = 0;
var LAYER_NAV = 1;
var LAYER_HINT = 2;
var LAYERS_N = 3;

var states = [];
var states_length;
var totalBoxes;

var CELL_HAS_BOX = 0;
var CELL_BOT_IDX = 1;
var NO_BOT = -1;

var BOT_HAS_BOX = 0;
var BOT_X = 1;
var POS_Y = 2;
var XY_OUT = -1;

function boxesLeft(cells) {
	var res = 0;
	for (var y = 0; y < _.n; ++y) {
		for (var x = 0; x < _.m; ++x) {
			if (cells[y][x][CELL_HAS_BOX])
				++res;
		}
	}
	return res;
}

function initialState() {
	var cells = [];
	for (var y = 0; y < _.n; ++y) {
		cells.push([]);
		for (var x = 0; x < _.m; ++x) {
			cells[y].push([
				/* CELL_HAS_BOX: */ true,
				/* CELL_BOT_IDX: */ NO_BOT
			]);
		}
	}
	
	for (var g = 0; g < _.p.length; ++g) {
		var x = _.p[g][0];
		var y = _.p[g][1];
		if (cells[y])
			if (cells[y][x])
				cells[y][x][CELL_HAS_BOX] = false;
	}
	
	var bot = [];
	for (var l = 0; l < _.a.length; ++l) {
		bot.push([
			/* BOT_HAS_BOX: */ false,
			/* BOT_X: */       XY_OUT,
			/* POS_Y: */       XY_OUT
		]);
	}
	
	return {
		cells: cells,
		bot: bot,
		totalMoved: 0
	};
}

var tmpCells;

function initTmpCells() {
	tmpCells = [];
	for (var y = 0; y < _.n; ++y) {
		tmpCells.push([]);
		for (var x = 0; x < _.m; ++x) {
			tmpCells[y].push([]);
		}
	}
}

function copyCells(cells) {
	var res = [];	
	for (var y = 0; y < _.n; ++y) {
		res.push([]);
		for (var x = 0; x < _.m; ++x) {
			res[y].push([
				cells[y][x][CELL_HAS_BOX],
				cells[y][x][CELL_BOT_IDX]
			]);
		}
	}
	return res;
}

function nextState(state, k, steps) {
	if (steps === undefined)
		steps = 1;
	
	for (var st = 0; st < steps; ++st) {
		var prev_cells = state.cells;
		var prev_bot = state.bot;
		var prevTotalMoved = state.totalMoved;
		var curMoved = 0;
		
		var cells = tmpCells;
		
		if (st == 0) {
			for (var y = 0; y < _.n; ++y) {
				for (var x = 0; x < _.m; ++x) {
					cells[y][x] = [
						prev_cells[y][x][CELL_HAS_BOX],
						NO_BOT
					];
				}
			}
		}
		else {
			for (var l = 0; l < _.a.length; ++l) {
				var x = prev_bot[l][BOT_X];
				var y = prev_bot[l][POS_Y];
				if (x != XY_OUT)
					if (cells[y])
						if (cells[y][x])
							cells[y][x][CELL_BOT_IDX] = NO_BOT;
			}
		}
		
		var bot = [];
		for (var l = 0; l < _.a.length; ++l) {
			var prev_has_box = prev_bot[l][BOT_HAS_BOX];
			var prev_x = prev_bot[l][BOT_X];
			var prev_y = prev_bot[l][POS_Y];
			
			var x = prev_x;
			var y = prev_y;
			var has_box = prev_has_box;
			
			switch (_.a[l][k]) {
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					// ENTER
					var g = 1 * _.a[l][k];
					x = _.p[g][0];
					y = _.p[g][1];
					break;
					
				case 'L':
					++curMoved;
					x = prev_x - 1;
					break;
					
				case 'R':
					++curMoved;
					x = prev_x + 1;
					break;
					
				case 'U':
					++curMoved;
					y = prev_y - 1;
					break;
					
				case 'D':
					++curMoved;
					y = prev_y + 1;
					break;
					
				case 'E':
					// EXIT
					x = XY_OUT;
					y = XY_OUT;
					has_box = false;
					break;
			}
			
			if (x != XY_OUT) {
				if (cells[y])
					if (cells[y][x])
						if (prev_cells[y][x][CELL_HAS_BOX])
							has_box = true;
			}
			
			if (prev_x != XY_OUT && prev_has_box) {
				if (cells[prev_y])
					if (cells[prev_y][prev_x])
						cells[prev_y][prev_x][CELL_HAS_BOX] = false;
			}
			
			bot.push([
				/* BOT_HAS_BOX: */ has_box,
				/* BOT_X: */       x,
				/* POS_Y: */       y
			]);
		}	
		
		for (var l = 0; l < _.a.length; ++l) {
			var has_box = bot[l][BOT_HAS_BOX];
			var x = bot[l][BOT_X];
			var y = bot[l][POS_Y];
			
			if (x != XY_OUT) {
				if (cells[y]) {
					if (cells[y][x]) {			
						cells[y][x][CELL_HAS_BOX] = prev_cells[y][x][CELL_HAS_BOX] || has_box;
						cells[y][x][CELL_BOT_IDX] = l;
					}
				}
			}
		}
		
		++k;
		state = {
			cells: cells,
			bot: bot,
			totalMoved: prevTotalMoved + curMoved
		};
	}
	return {
		cells: copyCells(state.cells),
		bot: state.bot,
		totalMoved: state.totalMoved
	};
}

var cs = [
	'#e6194b',
	'#f58231',
	'#ffe119',
	'#bfef45',
	'#3cb44b',
	'#42d4f4',
	'#4363d8',
	'#911eb4',
	'#f032e6',
	'#000075',
	'#46f0f0',
	'#808000',
	'#9a6324',
	'#800000',
	'#fabebe',
	'#ffd8b1',
	'#fffac8',
	'#aaffc3',
	'#dcbeff'
];

var csn = cs.length;
var csn2 = csn * (csn - 1);
var csn3 = csn2 * (csn - 2);

function getC2(i) {
	var i1 = i % csn;
	i = Math.floor(i / csn);
	var i2 = i;
	
	if (i2 >= i1)
		++i2;
	
	return [cs[i1], cs[i2]];
}

function getC3(i) {
	var ii = i;
	
	var i1 = i % csn;
	i = Math.floor(i / csn);
	var i2 = i % (csn - 1);
	i = Math.floor(i / (csn - 1));
	var i3 = i;
	
	if (i2 >= i1)
		++i2;
		
	if (i3 >= i1 && (i3 + 1) >= i2 || (i3 + 1) >= i1 && i3 >= i2)
		i3 += 2;
	else if (i3 >= i1 || i3 >= i2)
		++i3;
	
	return [cs[i1], cs[i2], cs[i3]];
}

function drawB1(i, j, c) {
	var s = scr.s;
	var s1 = scr.s1;
	var xx = scr.x0 + s1 + s * i;
	var yy = scr.y0 + s1 + s * j;
	var ss = s - s1 * 2;
	
	layers[LAYER_VIEW]
	.fillStyle(c)
	.beginPath()
	.fillRect(zoomX(xx), zoomY(yy), zoomS(ss), zoomS(ss));
}

function drawB2H(i, j, c) {
	var s = scr.s;
	var s1 = scr.s1;
	var xx = scr.x0 + s1 + s * i;
	var yy = scr.y0 + s1 + s * j;
	var ss = s - s1 * 2;
	
	layers[LAYER_VIEW]
	.fillStyle(c[0])
	.beginPath()
	.fillRect(zoomX(xx), zoomY(yy), zoomS(ss), zoomS(ss / 2))
	.fillStyle(c[1])
	.beginPath()
	.fillRect(zoomX(xx), zoomY(yy + ss / 2), zoomS(ss), zoomS(ss / 2));
}

function drawB2V(i, j, c) {
	var s = scr.s;
	var s1 = scr.s1;
	var xx = scr.x0 + s1 + s * i;
	var yy = scr.y0 + s1 + s * j;
	var ss = s - s1 * 2;
	
	layers[LAYER_VIEW]
	.fillStyle(c[0])
	.beginPath()
	.fillRect(zoomX(xx), zoomY(yy), zoomS(ss / 2), zoomS(ss))
	.fillStyle(c[1])
	.beginPath()
	.fillRect(zoomX(xx + ss / 2), zoomY(yy), zoomS(ss / 2), zoomS(ss));
}

function drawB2V2(i, j, c) {
	drawB3V(i, j, [c[0], c[1], c[0]]);
}

function drawB2H2(i, j, c) {
	drawB3H(i, j, [c[0], c[1], c[0]]);
}

function drawB3H(i, j, c) {
	var s = scr.s;
	var s1 = scr.s1;
	var xx = scr.x0 + s1 + s * i;
	var yy = scr.y0 + s1 + s * j;
	var ss = s - s1 * 2;
	
	layers[LAYER_VIEW]
	.fillStyle(c[0])
	.beginPath()
	.fillRect(zoomX(xx), zoomY(yy), zoomS(ss), zoomS(ss / 3))
	.fillStyle(c[1])
	.beginPath()
	.fillRect(zoomX(xx), zoomY(yy + ss / 3), zoomS(ss), zoomS(ss / 3))
	.fillStyle(c[2])
	.beginPath()
	.fillRect(zoomX(xx), zoomY(yy + ss * 2 / 3), zoomS(ss), zoomS(ss / 3));
}

function drawB3V(i, j, c) {
	var s = scr.s;
	var s1 = scr.s1;
	var xx = scr.x0 + s1 + s * i;
	var yy = scr.y0 + s1 + s * j;
	var ss = s - s1 * 2;
	
	layers[LAYER_VIEW]
	.fillStyle(c[0])
	.beginPath()
	.fillRect(zoomX(xx), zoomY(yy), zoomS(ss / 3), zoomS(ss))
	.fillStyle(c[1])
	.beginPath()
	.fillRect(zoomX(xx + ss / 3), zoomY(yy), zoomS(ss / 3), zoomS(ss))
	.fillStyle(c[2])
	.beginPath()
	.fillRect(zoomX(xx + ss * 2 / 3), zoomY(yy), zoomS(ss / 3), zoomS(ss));
}

function drawBot(i, j, idx) {
	if (idx < csn)
		return drawB1(i, j, cs[idx]);
	idx -= csn;
	
	if (idx < csn2)
		return drawB2H(i, j, getC2(idx));
	idx -= csn2;
	
	if (idx < csn2)
		return drawB2V(i, j, getC2(idx));
	idx -= csn2;
	
	if (idx < csn2)
		return drawB2H2(i, j, getC2(idx));
	idx -= csn2;
	
	if (idx < csn2)
		return drawB2V2(i, j, getC2(idx));
	idx -= csn2;
	
	if (idx < csn3)
		return drawB3H(i, j, getC3(idx));
	idx -= csn3;
	
	if (idx < csn3)
		return drawB3V(i, j, getC3(idx));
	idx -= csn3;
		
	drawBot(i, j, idx);
}

function drawCell(i, j, cell) {
	var s = scr.s;
	var s1 = scr.s1;
	var s2 = scr.s2;
	var xx = scr.x0 + s * i;
	var yy = scr.y0 + s * j;
	
	var x0 = zoomX(xx);
	var y0 = zoomY(yy);
	var s0 = zoomS(s);
	var x1 = x0 + s0;
	var y1 = y0 + s0;
	
	if (x0 > scr.w || x1 < 0 || y0 > scr.h || y1 < 0)
		return;
	
	var bot_id = cell[CELL_BOT_IDX];
	if (bot_id != NO_BOT) {
		drawBot(i, j, bot_id);
		var fs = s / 4;
		layers[LAYER_VIEW]
		.fillStyle("#000")
		.font(zoomS(fs) + "px Arial")
        .textAlign("center")
        .fillText(bot_id, zoomX(xx + s / 2), zoomY(yy + s / 2 + fs * 0.4));
	}
	
	if (cell[CELL_HAS_BOX]) {
		layers[LAYER_VIEW]
		.strokeStyle("#000")
		.lineWidth(zoomS(s / 20))
		.beginPath()
		.rect(zoomX(xx + s2), zoomY(yy + s2), zoomS(s - s2 * 2), zoomS(s - s2 * 2))
		.stroke();
	}
}

function drawBar(k, cur) {
	var x0 = scr.x0b;
	var y0 = scr.y0b;
	var w = scr.wb;
	var h = scr.hb;
	var px = scr.pxb;
	
	layers[LAYER_NAV]
	.fillStyle((k == cur) ? "#F00" : "#999")
	.fillRect(px + x0 + k * w + 0.5, y0, w - 1, h);
}

function drawScroll() {
	var x0 = scr.x0b;
	var y0 = scr.y0b;
	var ww = scr.w;
	var h = scr.hb;
	var hb = scr.hbb;
	var margin = scr.margin;
	
	var px = scr.pxb;
	var px0 = scr.pxb0;
	var px1 = scr.pxb1;
	
	var w1 = ww - margin - 2 * margin;
	var wb = Math.round(margin + w1 * w1 / (w1 - px1));
	
	layers[LAYER_NAV]
	.fillStyle("#EEE")
	.strokeStyle("#CCC")
	.lineWidth(0.5)
	.rect(x0, y0 + h + margin, w1, hb)
	.fill()
	.stroke()
	.beginPath()
	.fillStyle("#CCC")
	.fillRect(Math.round(x0 + px / px1 * (w1 - wb)), y0 + h + margin, wb, hb)
	.beginPath()
	.fillStyle("#F00")
	.fillRect(Math.round(x0 + w1 * cur_k / states_length), y0 + h + margin + 1, 1, hb - 2);
}

function drawNav() {
	layers[LAYER_NAV].clear();
	
	var kk = Math.floor(scr.w / scr.wb);
	var k0 = Math.max(0, cur_k - kk);
	var k1 = Math.min(states_length, cur_k + kk);
	
	for (var k = k0; k < k1; ++k)
		drawBar(k, cur_k);
	
	if (scr.pxb1 != 0)
		drawScroll();
}

function zoomX1(x) {
	var zp = scr.zp;
	var zx = scr.zx;
	var x0 = scr.x0;
	var s = scr.s;
	return Math.floor((((x - zx) / zp) - x0) / s);
}

function zoomY1(y) {
	var zp = scr.zp;
	var zy = scr.zy;
	var y0 = scr.y0;
	var s = scr.s;
	return Math.floor(((y - zy) / zp - y0) / s);
}

function zoomX(x) {
	var zp = scr.zp;
	var zx = scr.zx;
	return x * zp + zx;
}

function zoomY(y) {
	var zp = scr.zp;
	var zy = scr.zy;
	return y * zp + zy;
}

function zoomS(s) {
	var zp = scr.zp;
	return s * zp;
}

function drawGrid() {
	var x0 = scr.x0;
	var y0 = scr.y0;
	var s = scr.s;
	
	var xx0 = zoomX(x0);
	var xx1 = zoomX(x0 + _.m * s);
	var yy0 = zoomY(y0);
	var yy1 = zoomY(y0 + _.n * s);
	
	for (var x = 0; x <= _.m; ++x) {
		var xx = zoomX(x0 + x * s);
		layers[LAYER_VIEW].strokeLine(xx, yy0, xx, yy1);
	}
	for (var y = 0; y <= _.n; ++y) {
		var yy = zoomY(y0 + y * s);
		layers[LAYER_VIEW].strokeLine(xx0, yy, xx1, yy);
	}	
}

function drawText() {
	var ht = scr.ht;
	var w = scr.w;
	var xt = scr.x0t;
	var yt = scr.y0t;
	
	var str = '';
	if (cur_k > 0) {
		str += " |";
		for (var l = 0; l < _.a.length; ++l)
			str += " " + _.a[l][cur_k - 1];
	}
	
	var yt0 = yt - 2 * scr.margin;
	
	var text = "";
	text += "Step: " + cur_k;
	text += " | Boxes left: " + boxesLeft(cur_state.cells);
	text += " of " + totalBoxes;
	text += " | Total moved: " + cur_state.totalMoved;
	text += str;
	
	layers[LAYER_VIEW]
	.font(ht + "px Arial")
	.globalAlpha(0.9)
	.fillStyle("#FFF")
	.fillRect(0, yt0, w, scr.h - yt0)
	.globalAlpha(1)
	.fillStyle("#333")
	.textAlign("left")
	.fillText(text, xt, yt + ht * 0.4);	
}

var cur_k;
var cur_state;

var STATE_CACHE_SIZE = STEP;
var stateCache;
var stateCachePos;

function cacheStateInit() {
	stateCache = [];
	for (var c = 0; c < STATE_CACHE_SIZE; ++c)
		stateCache.push([-1]);
}

function cacheStateGet() {
	for (var c = 0; c < STATE_CACHE_SIZE; ++c) {
		if (stateCache[c][0] == cur_k) {
			cur_State = stateCache[c][1];
			return true;
		}
	}
	return false;
}

function cacheState() {
	stateCache[stateCachePos] = [cur_k, cur_state];
	stateCachePos = (stateCachePos + 1) % STATE_CACHE_SIZE;
}

function drawState(k) {
	var prev_k = cur_k;
	
	cur_k = k;
	document.location.hash = k;
	
	if (!cacheStateGet()) {
		if (prev_k < cur_k && cur_k - prev_k < STEP) {
			cur_state = nextState(cur_state, prev_k, cur_k - prev_k);
		}
		else {
			var kd = Math.floor(k / STEP);
			var kdm = kd * STEP;
			var km = k % STEP;
			cur_state = nextState(states[kd], kdm, km);
		}
		cacheState();
	}
	
	var cells = cur_state.cells;
	
	var x0 = scr.x0;
	var y0 = scr.y0;
	var s = scr.s;
	
	layers[LAYER_VIEW]
	.clear("#FFF")
	.strokeStyle("#DDD")
	.lineWidth(2)
	.fillStyle("#CCC");
	
	for (var g = 0; g < _.p.length; ++g) {
		var x = _.p[g][0];
		var y = _.p[g][1];
		layers[LAYER_VIEW].fillRect(zoomX(x0 + x * s), zoomY(y0 + y * s), zoomS(s), zoomS(s));
	}
	
	drawGrid();
	
	for (var x = 0; x < _.m; ++x) {
		for (var y = 0; y < _.n; ++y) {
			drawCell(x, y, cells[y][x]);
		}
	}
	
	drawText();
}

function drawHint() {
	layers[LAYER_HINT]
	.clear()
	.globalAlpha("0.75");
	
	var x = cur_x;
	var y = cur_y;
	
	if (y >= scr.y0b)
		return;
	
	var xx = zoomX1(x);
	var yy = zoomY1(y);
	
	if (xx < 0 || xx >= _.m || yy < 0 || yy >= _.n)
		return;
	
	//console.log(yy, xx);	
	
	var cell = cur_state.cells[yy][xx];
	
	var hint = "(" + yy + ", " + xx + ")";
	hint += (cell[CELL_HAS_BOX]) ? " has box" : " empty";
	if (cell[CELL_BOT_IDX] != NO_BOT)
		hint += ", bot #" + cell[CELL_BOT_IDX];
	
	var fs = Math.max(scr.s / 3, scr.h / 50);
	
	var w = layers[LAYER_HINT].font(fs + "px Arial").textBoundaries(hint).width;
	var h = fs;
	
	layers[LAYER_HINT]
	.fillStyle("#FFC")
	.strokeStyle("#333")
	.lineWidth(0.5)
	.roundRect(x, y - h + fs / 10 - 4, w + 4, h + 4, 4)
	.fill()
	.stroke()
	.fillStyle("#333")
	.textAlign("left")
	.fillText(hint, x + 2, y - 2);
}

var _;

function expl(s) {
	var res = s.split(/\s+/g);
	if (res[0] == '')
		res.shift();
	return res;
}

function prepare() {
	var _in = expl(input);
	var _out = expl(output);
	var a = [];
	for (var l = 0; l < _in[2]; ++l)
		a[l] = _out[l + 1];
	var p = [];
	
	var sw = true;
	
	for (var g = 0; g < _in[3]; ++g)
		p[g] = [
			_in[g * 2 + 4 + (sw ? 1 : 0)] - 0,
			_in[g * 2 + 4 + (sw ? 0 : 1)] - 0
		];
	
	_ = {
		m: _in[sw ? 1 : 0],
		n: _in[sw ? 0 : 1],
		p: p,
		a: a
	};
	
    var w = $(window).width();
    var h = $(window).height();
    layers.push(cq(w, h).appendTo($("body")[0]));
	
	initTmpCells();
	
	states_length = _.a[0].length + 1;
	states.push(initialState());
	cacheStateInit();
	
	totalBoxes = boxesLeft(states[0].cells);
	
	cur_k = 0;
	if (document.location.hash[0] == '#') {
		var kk = document.location.hash.substring(1) * 1;
		if (kk >= 0 && kk < states_length)
			cur_k = kk;
	}
	
	var tips = [
		"you can use ←/→ keys to navigate between states",
		"press [space] to play/pause",
		"[home] and [end] keys are to bring you to the first and the last state"
	];
	var tip = "Tip: " + tips[Math.floor(Math.random() * tips.length)];
	
	var k = 0;
	var doCalc = function() {
		if (k >= _.a[0].length)
			return doStart();
		
		layers[LAYER_VIEW]
		.clear("#FFF")
		.fillStyle("#CCC")
		.strokeStyle("#CCC")
		.font("36px Arial")
        .textAlign("left")
		.fillText("Calculating state " + k + "...", w / 4, h / 2 - 20)
        .textAlign("right")
		.fillText("" + Math.round(10000 * k / states_length) / 100 + "%", w * 3 / 4, h / 2 - 20)
		.strokeRect(w / 4, h / 2 - 5, w / 2, h / 40)
		.fillRect(w / 4, h / 2 - 5, w / 2 * k / states_length, h / 40)
		.font("16px Arial")
		.textAlign("center")
		.fillText(tip, w / 2, h / 2 + h / 40 + 30);
		
		states.push(nextState(states[Math.floor(k / STEP)], k, STEP));
		
		k += STEP;
		setTimeout(doCalc, 0);
	};
	
	doCalc();
}

$(document).ready(prepare);

var started = false;

function doStart() {	
	var w = $(window).width();
	var h = $(window).height();
	
	$("body").html("");
	layers = [];
	for (var i = 0; i < LAYERS_N; ++i)
		layers.push(cq(w, h).appendTo($("body")[0]));
	
	var margin = Math.min(w, h) / 100;
	var ht = margin * 3;
	var hb = margin * 4;
	var hbb = margin * 2;
	var w1 = w - 2 * margin;
	
	var wb = Math.max((w - 2 * margin) / states_length, hb / 2);
	var pxb1 = w1 - wb * states_length;
	if (Math.abs(pxb1) < 1)
		pxb1 = 0;
	wb = Math.min(hb * 2, wb);
	
	var h1 = h - 3 * margin - hb - ht;
	if (pxb1 != 0)
		h1 -= 2 * margin + hbb;
	
	var s = Math.min(w1 / _.m, h1 / _.n);
	
	var cx = w1 / 2 + margin;
	var cy = h1 / 2 + margin;

	var y0b = h1 + 4 * margin + ht - hbb;
	
	scr = {
		margin:	margin,
		w: w,
		h: h,
		s: s,
		s1: s / 10,
		s2: s / 5,
		x0: cx - s * _.m / 2,
		y0: cy - s * _.n / 2,
		x0t: margin,
		y0t: h1 + 3 * margin,
		x0b: margin,
		ht: ht,
		wt: w1,
		y0b: y0b,
		wb: wb,
		hb: hb,
		pxb: pxb1 * cur_k / states_length,
		pxb0: 0,
		pxb1: pxb1,
		y0bb: y0b + margin + hb,
		hbb: hbb,
		zoom: 0,
		zp: 1,
		zx: 0,
		zy: 0
	};
	
	drawState(cur_k);
	drawNav();
	
	if (!started) {
		started = true;
		
		$(document)
		.keydown(keyHandle)
		.mousemove(moveHandle)
		.mousedown(downHandle)
		.mouseup(upHandle)
		.on('touchmove', moveHandle)
		.on('touchstart', downHandle)
		.on('touchend', upHandle)
		.on('wheel', scrollHandle);
		
		$(window).resize(doStart);
		$(window).on('hashchange',
			function() {			
				if (document.location.hash[0] == '#') {
					var kk = document.location.hash.substring(1) * 1;
					if (kk >= 0 && kk < states_length)
						shiftState(-cur_k + kk);
				}
			}
		);
	}
};

function zoom(dzoom) {	
	scr.zoom += dzoom;
	var zp0 = scr.zp;
	scr.zp = Math.pow(2, scr.zoom / 20);
	scr.zx -= (scr.zp - zp0) * cur_x;
	scr.zy -= (scr.zp - zp0) * cur_y;
	drawState(cur_k);
}

function scrollHandle(e) {
	cur_x = e.originalEvent.pageX;
	cur_y = e.originalEvent.pageY;
	var dy = event.deltaY;
	if (dy < 0) {
		zoom(1);
	}
	else if (dy > 0) {
		zoom(-1);
	}
}

function getXY(e) {
    if (e) {
        e = e.originalEvent;
        if (e.touches)
            e = e.touches[0];
        else if (e.changedTouches)
            e = e.changedTouches[0];
        if (e)
            lastXY = [e.pageX, e.pageY];
    }
    return lastXY;
}

var cur_x = 0;
var cur_y = 0;
var dragging = false;
var draggingSteps = false;
var draggingSteps2 = false;

function moveHandle(e) {
    var xy = getXY(e);
    cur_x = xy[0];
    cur_y = xy[1];
	posHandle();
}

function downHandle(e) {
	upHandle();
	
    var xy = getXY(e);
    drag_x = xy[0];
    drag_y = xy[1];
    
	layers[LAYER_HINT].clear();
	
	if (drag_y >= scr.y0b && drag_y < scr.y0b + scr.hb)
		draggingSteps = true;
	else if (scr.pxb1 != 0 && drag_y >= scr.y0bb && drag_y < scr.y0bb + scr.hbb)
		draggingSteps2 = true;
	else
		dragging = true;
}

function upHandle() {
	dragging = false;
	draggingSteps = false;
	draggingSteps2 = false;
}

var drag_x;
var drag_y;
function dragHandle() {
	scr.zx += cur_x - drag_x;
	scr.zy += cur_y - drag_y;
	
	drawState(cur_k);
	
	drag_x = cur_x;
	drag_y = cur_y;
}

function posHandle() {
	var x = cur_x;
	var y = cur_y;
	
	if (dragging) {
		dragHandle();
		return;
	}
	
	drawHint();
	
	if (playing)
		return;
	
	if ((y >= scr.y0b && y < scr.y0b + scr.hb && !draggingSteps2) || draggingSteps) {
		var k = Math.floor((x - scr.x0b - scr.pxb) / scr.wb);
		setState(k);
		
		var nn = 1;
		var dd = 5;
		
		var dxb = 0;
		if (x < scr.w * nn / dd)
			dxb = 10 * ((scr.w * nn / dd) - x) / (scr.w * 2 * nn / dd);
		else if (x > scr.w * (dd - nn) / dd)
			dxb = 10 * ((scr.w * (dd - nn) / dd) - x) / (scr.w * 2 * nn / dd);
		
		var pxb = Math.round(Math.min(scr.pxb0, Math.max(scr.pxb + dxb, scr.pxb1)));
		if (pxb != scr.pxb) {
			scr.pxb = pxb;
			setTimeout(posHandle, 100);
		}
	}
	else if ((scr.pxb1 != 0 && y >= scr.y0bb && y < scr.y0bb + scr.hbb) || draggingSteps2) {
		var ww = scr.w;
		var margin = scr.margin;
		var px1 = scr.pxb1;
		var w1 = ww - margin - 2 * margin;
		
		var wb = Math.round(margin + w1 * w1 / (w1 - px1));
		var s = (x - scr.x0b - wb / 2) / (w1 - wb);
		
		s = Math.max(0, Math.min(s, 1));
		var ds = 0;
		if (s == 0) {
			ds = (x - scr.x0b) / wb - 0.5;
		}
		else if (s == 1) {
			ds = 0.5 - (scr.w - x - 2 * scr.x0b) / wb;
		}
		
		var pxb = Math.round(scr.pxb1 * s);
		
		scr.pxb = pxb;
		cx = ww / 2 + (ww - scr.margin * 2) * ds;
		var k = Math.floor((cx - scr.x0b - scr.pxb) / scr.wb);
		
		setState(k);
	}
}

var playing = false;

function play() {
	if (cur_k == states_length - 1)
		playing = false;
	
	if (!playing)
		return;
	
	shiftState(1);
	setTimeout(play, 100);
}

function keyHandle(e) {
	switch(e.which) {
		case 37:
			shiftState(-1);
			e.preventDefault();
			break;
		case 39:
			shiftState(1);
			e.preventDefault();
			break;
		case 32:
			upHandle();
			if (cur_k == states_length - 1) {
				shiftState(-cur_k);
				playing = true;
			}
			else {
				playing = !playing;
			}
			play();
			break;
		case 36:
			playing = false;
			shiftState(-cur_k);
			break;
		case 35:
			playing = false;
			shiftState(-cur_k + states_length - 1);
			break;
	}
}

function shiftState(d) {
	if (draggingSteps || draggingSteps2)
		return;
	
	k = cur_k + d;
	if (k < 0 || k >= states_length)
		return;
	
	var dd = k / states_length;
	if (d == 1 || d == -1)
		scr.pxb = (scr.pxb * 1 + (scr.pxb1 * dd)) / 2;
	else
		scr.pxb = scr.pxb1 * dd;
	
	setState(k);
}

function setState(k) {
	if (k >= 0 && k < states_length && k != cur_k) {
		drawState(k);
		drawNav();
		drawHint();
	}
}
