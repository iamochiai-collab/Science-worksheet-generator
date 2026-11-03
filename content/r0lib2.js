// 理科プリントの共通の図(いくつもの学年で使うもの)。単位は mm
var r0lib2 = [];
var RD = (() => {
  const { T, fig, line, arrow, rect, circle, path, poly, C } = RK;
  const f2 = (v) => +(+v).toFixed(2);

  // ===== 電気 =====
  // かん電池(横向き)。x,y は左はし、+ が右。長さ L
  const cell = (x, y, L = 14, o = {}) => {
    const h = 6;
    return rect(x, y - h / 2, L, h, { f: o.f || "#fff", r: 1 }) + rect(x + L, y - 1.5, 1.6, 3, { f: "#000", w: 0.3 }) + (o.mark !== false ? `<text x="${x + L - 3}" y="${y + 1.3}" font-size="3.2" text-anchor="middle">+</text><text x="${x + 3}" y="${y + 1.3}" font-size="3.2" text-anchor="middle">−</text>` : "");
  };
  // 豆電球(ソケットつき)。中心 x、ガラス玉の中心 y
  const bulb = (x, y, o = {}) => circle(x, y, 4.2, { f: o.on ? C.yellow : "#fff" }) + path(`M${x - 1.6} ${y + 1.5} L${x - 1} ${y - 1.2} Q${x} ${y - 2.6} ${x + 1} ${y - 1.2} L${x + 1.6} ${y + 1.5}`, { w: 0.3 }) + rect(x - 3, y + 3.4, 6, 4, { f: C.gray, w: 0.4 }) + (o.on ? [0, 45, 90, 135, 180].map((a) => { const r = a * Math.PI / 180; return line(f2(x - 6 * Math.cos(r)), f2(y - 6 * Math.sin(r)), f2(x - 8 * Math.cos(r)), f2(y - 8 * Math.sin(r)), { w: 0.4 }); }).join("") : "");
  // 回路図の記号
  const sym = {
    cell: (x, y, vert = false) => vert ? line(x - 3.5, y - 1, x + 3.5, y - 1, { w: 0.6 }) + line(x - 1.8, y + 1, x + 1.8, y + 1, { w: 1.1 }) : line(x - 1, y - 3.5, x - 1, y + 3.5, { w: 0.6 }) + line(x + 1, y - 1.8, x + 1, y + 1.8, { w: 1.1 }),
    lamp: (x, y) => circle(x, y, 3, { f: "#fff" }) + line(x - 2.1, y - 2.1, x + 2.1, y + 2.1, { w: 0.4 }) + line(x - 2.1, y + 2.1, x + 2.1, y - 2.1, { w: 0.4 }),
    res: (x, y, vert = false) => vert ? rect(x - 1.6, y - 4, 3.2, 8, { f: "#fff" }) : rect(x - 4, y - 1.6, 8, 3.2, { f: "#fff" }),
    sw: (x, y, open = true) => `<circle cx="${x - 3}" cy="${y}" r="0.7" fill="#000"/><circle cx="${x + 3}" cy="${y}" r="0.7" fill="#000"/>` + (open ? line(x - 3, y, x + 2.6, y - 3) : line(x - 3, y, x + 3, y)),
    meter: (x, y, s) => circle(x, y, 3.4, { f: "#fff" }) + `<text x="${x}" y="${y + 1.3}" font-size="3.6" text-anchor="middle" font-weight="bold">${s}</text>`,
    motor: (x, y) => circle(x, y, 3.4, { f: "#fff" }) + `<text x="${x}" y="${y + 1.3}" font-size="3.6" text-anchor="middle" font-weight="bold">M</text>`
  };

  // ===== じしゃく =====
  // ぼうじしゃく(横)。左が leftPole
  const barMagnet = (x, y, L = 30, left = "N") => {
    const h = 7, right = left === "N" ? "S" : "N";
    return rect(x, y - h / 2, L / 2, h, { f: left === "N" ? C.red : C.sky }) + rect(x + L / 2, y - h / 2, L / 2, h, { f: right === "N" ? C.red : C.sky }) + `<text x="${x + 4}" y="${y + 1.4}" font-size="4" text-anchor="middle" font-weight="bold">${left}</text><text x="${x + L - 4}" y="${y + 1.4}" font-size="4" text-anchor="middle" font-weight="bold">${right}</text>`;
  };
  // 方位じしん(はりの N が north の向き。角度は度、0 が上)
  const compass = (x, y, r = 6, deg = 0, o = {}) => {
    const a = deg * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a), px = Math.cos(a), py = Math.sin(a), w = 1.4;
    const tip = [x + dx * (r - 1), y + dy * (r - 1)], tail = [x - dx * (r - 1), y - dy * (r - 1)];
    return circle(x, y, r, { f: "#fff" }) + `<polygon points="${f2(tip[0])},${f2(tip[1])} ${f2(x + px * w)},${f2(y + py * w)} ${f2(x - px * w)},${f2(y - py * w)}" fill="#333"/><polygon points="${f2(tail[0])},${f2(tail[1])} ${f2(x + px * w)},${f2(y + py * w)} ${f2(x - px * w)},${f2(y - py * w)}" fill="#fff" stroke="#333" stroke-width="0.3"/>`;
  };

  // ===== 器具 =====
  // ぼう温度計(たて)。温度 t を -10〜50(or lo〜hi)で表す。x は中心
  function thermometer(x, top, h, t, lo = -10, hi = 50, step = 10) {
    const y = (v) => top + h - (v - lo) / (hi - lo) * h;
    let s = rect(x - 2, top - 3, 4, h + 6, { f: "#fff", r: 2 }) + circle(x, top + h + 5, 2.4, { f: C.red }) + rect(x - 0.6, f2(y(t)), 1.2, f2(top + h + 3 - y(t)), { f: "#d33", w: 0 });
    for (let v = lo; v <= hi; v++) {
      const big = v % step === 0, mid = v % 5 === 0;
      s += line(x + 2, f2(y(v)), x + 2 + (big ? 3 : mid ? 2 : 1.2), f2(y(v)), { w: big ? 0.3 : 0.15 });
    }
    const lab = [];
    for (let v = lo; v <= hi; v += step) lab.push(T(x + 6, f2(y(v) + 1.1), String(v), 2.8, { anchor: "start" }));
    return { raw: s, lab };
  }
  // メスシリンダー(目もり 1mL)。水面 v(mL)、表示する範囲 lo〜hi
  function cylinder(x, top, h, v, lo, hi) {
    const y = (u) => top + h - (u - lo) / (hi - lo) * h, w = 12;
    let s = path(`M${x - w / 2} ${top - 4} L${x - w / 2} ${top + h + 4} L${x + w / 2} ${top + h + 4} L${x + w / 2} ${top - 4}`, { w: 0.5 });
    const wy = y(v);
    s += path(`M${x - w / 2 + 0.3} ${f2(wy - 1)} Q${x} ${f2(wy + 1)} ${x + w / 2 - 0.3} ${f2(wy - 1)} L${x + w / 2 - 0.3} ${top + h + 3.7} L${x - w / 2 + 0.3} ${top + h + 3.7} Z`, { f: C.water, w: 0 });
    s += path(`M${x - w / 2} ${f2(wy - 1)} Q${x} ${f2(wy + 1)} ${x + w / 2} ${f2(wy - 1)}`, { w: 0.4 });
    for (let u = lo; u <= hi; u++) {
      const big = u % 10 === 0, mid = u % 5 === 0;
      s += line(x - w / 2, f2(y(u)), x - w / 2 + (big ? 5 : mid ? 3.5 : 2), f2(y(u)), { w: big ? 0.3 : 0.15 });
    }
    const lab = [];
    for (let u = Math.ceil(lo / 10) * 10; u <= hi; u += 10) lab.push(T(x - w / 2 - 1, f2(y(u) + 1.1), String(u), 2.8, { anchor: "end" }));
    return { raw: s, lab };
  }
  // ビーカー(中心 x、底 y)
  const beaker = (x, y, w = 16, h = 18, lvl = 0.6, o = {}) => (lvl > 0 ? rect(x - w / 2 + 0.3, f2(y - h * lvl), w - 0.6, f2(h * lvl), { f: o.f || C.water, w: 0 }) : "") + path(`M${x - w / 2 - 1} ${y - h} L${x - w / 2} ${y - h + 1} L${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w / 2} ${y - h}`, { w: 0.5 });
  // 試験管(中心 x、口 y、長さ h)
  const tube = (x, y, h = 24, lvl = 0.3, o = {}) => (lvl > 0 ? path(`M${x - 2.6} ${f2(y + h - h * lvl)} L${x - 2.6} ${y + h - 2.8} A2.8 2.8 0 0 0 ${x + 2.6} ${y + h - 2.8} L${x + 2.6} ${f2(y + h - h * lvl)} Z`, { f: o.f || C.water, w: 0 }) : "") + path(`M${x - 3} ${y} L${x - 3} ${y + h - 3} A3 3 0 0 0 ${x + 3} ${y + h - 3} L${x + 3} ${y}`, { w: 0.5 });
  // アルコールランプ(中心 x、底 y)
  const lamp = (x, y, fire = true) => path(`M${x - 8} ${y} L${x - 8} ${y - 6} Q${x - 8} ${y - 11} ${x - 2} ${y - 12} L${x + 2} ${y - 12} Q${x + 8} ${y - 11} ${x + 8} ${y - 6} L${x + 8} ${y} Z`, { f: "#fff" }) + rect(x - 2.5, y - 15, 5, 3, { f: C.gray, w: 0.4 }) + line(x, y - 15, x, y - 17, { w: 0.6 }) + (fire ? path(`M${x} ${y - 25} Q${x + 3.5} ${y - 19} ${x} ${y - 16.5} Q${x - 3.5} ${y - 19} ${x} ${y - 25} Z`, { f: C.yellow, w: 0.4 }) : "");
  // スタンド(支柱 x、底 y、高さ h)と うで(高さ ay)
  const stand = (x, y, h, ays = []) => rect(x - 8, y - 2, 30, 2, { f: C.gray, w: 0.4 }) + line(x, y - 2, x, y - h, { w: 0.9 }) + ays.map(([ay, len]) => line(x, ay, x + len, ay, { w: 0.7 })).join("");
  // ガスバーナー(中心 x、底 y)
  const burner = (x, y, o = {}) => rect(x - 9, y - 3, 18, 3, { f: C.gray, w: 0.4 }) + rect(x - 2.5, y - 30, 5, 27, { f: "#fff", w: 0.5 }) + rect(x - 3.6, y - 19, 7.2, 3, { f: C.gray, w: 0.4 }) + rect(x - 3.6, y - 12, 7.2, 3, { f: C.gray, w: 0.4 }) + line(x - 9, y - 6, x - 3, y - 6, { w: 1.2 }) + (o.fire ? path(`M${x} ${y - 45} Q${x + 4} ${y - 36} ${x + 2.4} ${y - 30} L${x - 2.4} ${y - 30} Q${x - 4} ${y - 36} ${x} ${y - 45} Z`, { f: o.fire === "blue" ? C.sky : C.yellow, w: 0.4 }) : "");

  // ===== 生き物 =====
  // こん虫(上から見た図)。x,y は頭の中心。scale 1 でたて約 46mm
  function insect(x, y, k = 1, o = {}) {
    const P = (dx, dy) => [f2(x + dx * k), f2(y + dy * k)];
    const e = (cx, cy, rx, ry, f) => `<ellipse cx="${P(cx, 0)[0]}" cy="${P(0, cy)[1]}" rx="${f2(rx * k)}" ry="${f2(ry * k)}" fill="${f}" stroke="#000" stroke-width="0.5"/>`;
    let s = "";
    // あし(むねから 3対)
    for (const [dy, a, b] of [[9, [-14, 2], [-20, -6]], [12, [-15, 12], [-21, 16]], [15, [-13, 22], [-18, 32]]]) {
      for (const sg of [1, -1]) s += path(`M${P(0, dy).join(" ")} L${P(sg * -a[0] * -1, a[1]).join(" ")} L${P(sg * -b[0] * -1, b[1]).join(" ")}`, { w: 0.5 });
    }
    // しょっ角
    s += path(`M${P(-1.5, -3).join(" ")} Q${P(-6, -12).join(" ")} ${P(-9, -15).join(" ")}`, { w: 0.5 }) + path(`M${P(1.5, -3).join(" ")} Q${P(6, -12).join(" ")} ${P(9, -15).join(" ")}`, { w: 0.5 });
    s += e(0, 0, 4.2, 3.8, o.fill?.[0] || "#fff") + e(0, 12, 5.5, 7, o.fill?.[1] || "#fff") + e(0, 31, 6.5, 12, o.fill?.[2] || "#fff");
    for (let i = 1; i <= 4; i++) s += line(...P(-6 * Math.sqrt(1 - ((i * 4.5 - 12) / 12) ** 2) + 0.3, 19 + i * 4.5), ...P(6 * Math.sqrt(1 - ((i * 4.5 - 12) / 12) ** 2) - 0.3, 19 + i * 4.5), { w: 0.25 });
    s += `<circle cx="${P(-2.2, -1)[0]}" cy="${P(0, -1)[1]}" r="${f2(1 * k)}" fill="#000"/><circle cx="${P(2.2, -1)[0]}" cy="${P(0, -1)[1]}" r="${f2(1 * k)}" fill="#000"/>`;
    return s;
  }
  // 植物(根・くき・葉)。x は中心、y は地面
  function plant(x, y, k = 1, o = {}) {
    const P = (dx, dy) => `${f2(x + dx * k)} ${f2(y + dy * k)}`;
    let s = rect(f2(x - 22 * k), y, f2(44 * k), f2(16 * k), { f: C.sand, w: 0 }) + line(f2(x - 22 * k), y, f2(x + 22 * k), y, { w: 0.4 });
    s += path(`M${P(0, 0)} L${P(0, -34)}`, { w: 0.8 });
    const leaf = (dy, sg, len) => path(`M${P(0, dy)} Q${P(sg * len * 0.5, dy - 8)} ${P(sg * len, dy - 4)} Q${P(sg * len * 0.5, dy + 2)} ${P(0, dy)} Z`, { f: C.leaf, w: 0.5 });
    s += leaf(-10, -1, 14) + leaf(-17, 1, 15) + leaf(-25, -1, 12) + leaf(-30, 1, 10);
    if (o.flower) s += [0, 72, 144, 216, 288].map((a) => { const r = a * Math.PI / 180; return `<ellipse cx="${f2(x + Math.sin(r) * 3 * k)}" cy="${f2(y - 37 * k - Math.cos(r) * 3 * k)}" rx="${f2(2.2 * k)}" ry="${f2(2.2 * k)}" fill="${C.red}" stroke="#000" stroke-width="0.4"/>`; }).join("") + circle(x, f2(y - 37 * k), f2(1.4 * k), { f: C.yellow, w: 0.3 });
    // 根(主根と側根 / ひげ根)
    if (o.root === "hige") for (const dx of [-8, -5, -2, 1, 4, 7]) s += path(`M${P(0, 0)} Q${P(dx * 0.6, 6)} ${P(dx, 13)}`, { w: 0.4 });
    else {
      s += path(`M${P(0, 0)} L${P(0, 14)}`, { w: 0.6 });
      for (const [dy, dx] of [[3, 6], [5, -7], [8, 5], [10, -5], [12, 3]]) s += path(`M${P(0, dy)} Q${P(dx * 0.5, dy + 1)} ${P(dx, dy + 3)}`, { w: 0.35 });
    }
    return s;
  }

  // ===== 天体 =====
  // 月の形(明るい部分をぬる)。phase: 0 新月 … 0.5 満月 … 1。右が明るいのは 0〜0.5(北半球の夕方の形)
  function moon(cx, cy, r, phase) {
    const p = ((phase % 1) + 1) % 1;
    if (Math.abs(p) < 0.02 || Math.abs(p - 1) < 0.02) return circle(cx, cy, r, { f: "#555" });
    if (Math.abs(p - 0.5) < 0.02) return circle(cx, cy, r, { f: C.yellow });
    const waxing = p < 0.5, t = Math.cos(2 * Math.PI * p); // 1→-1
    const rx = f2(Math.abs(t) * r);
    const sweepOuter = waxing ? 1 : 0;
    // 明るい半円 + 楕円の部分
    const bright = waxing ? `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r}` : `M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r}`;
    const inner = `A${rx} ${r} 0 0 ${(t > 0) === waxing ? 0 : 1} ${cx} ${cy - r}`;
    return circle(cx, cy, r, { f: "#555" }) + `<path d="${bright} ${inner} Z" fill="${C.yellow}" stroke="none"/>` + circle(cx, cy, r, { w: 0.4 });
  }
  return { cell, bulb, sym, barMagnet, compass, thermometer, cylinder, beaker, tube, lamp, stand, burner, insect, plant, moon, f2 };
})();
