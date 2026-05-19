import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const PAL = ["#a78bfa","#67e8f9","#f9a8d4","#6ee7b7","#fde047","#fb923c","#4ade80","#f472b6"];

/* ─────────────────────────────────────────────
   🫧 BUBBLE WRAP
───────────────────────────────────────────── */
const B_COLS = 11, B_ROWS = 10, B_TOTAL = B_COLS * B_ROWS;

function BubbleWrap() {
  const [popped,  setPopped]  = useState(() => new Set());
  const [popping, setPopping] = useState(() => new Set());

  const pop = useCallback((i) => {
    if (popped.has(i) || popping.has(i)) return;
    setPopping(s => { const n = new Set(s); n.add(i); return n; });
    setTimeout(() => {
      setPopped(s => { const n = new Set(s); n.add(i); return n; });
      setPopping(s => { const n = new Set(s); n.delete(i); return n; });
    }, 170);
  }, [popped, popping]);

  const reset = () => { setPopped(new Set()); setPopping(new Set()); };

  return (
    <section className="section">
      <div className="badge">🫧 бульбашкова плівка</div>
      <h2 className="section-title">Лопай всі!</h2>
      <p className="section-sub">
        {popped.size} / {B_TOTAL} {popped.size === B_TOTAL ? "🎉 ВСІ ЛОПНУТІ!" : "лопнуто — натискай!"}
      </p>
      <div className="bubble-grid">
        {Array.from({ length: B_TOTAL }, (_, i) => {
          const p = popped.has(i), ing = popping.has(i);
          return (
            <div
              key={i}
              onClick={() => pop(i)}
              className={`bub${p ? " popped" : ing ? " popping" : ""}`}
            />
          );
        })}
      </div>
      <button className="btn-ghost" onClick={reset} style={{ marginTop: "1.2rem" }}>
        🔄 Нові бульбашки
      </button>
    </section>
  );
}

/* ─────────────────────────────────────────────
   💥 RAGE BUTTON
───────────────────────────────────────────── */
const RAGE_MSGS = ["ДАВАЙ!","ЩЕ РАЗ!","БУМ!","АААА!","НЕ СТОП!","ОЙ-ОЙ!","СТРЕС — СТОП!","КАЙФ!","ТАК!","БАМ!"];

function RageButton() {
  const [count,    setCount]    = useState(0);
  const [shaking,  setShaking]  = useState(false);
  const [particles,setParticles] = useState([]);
  const shakeTimer = useRef(null);

  const smash = useCallback(() => {
    setCount(c => c + 1);
    clearTimeout(shakeTimer.current);
    setShaking(false);
    requestAnimationFrame(() => setShaking(true));
    shakeTimer.current = setTimeout(() => setShaking(false), 560);

    const bId = Date.now();
    const batch = Array.from({ length: 22 }, (_, i) => {
      const angle = (i / 22) * Math.PI * 2 + Math.random() * 0.4;
      const dist  = 85 + Math.random() * 100;
      return {
        id: bId + i,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        color: PAL[Math.floor(Math.random() * PAL.length)],
        size: 6 + Math.random() * 8,
        moved: false,
      };
    });

    setParticles(p => [...p, ...batch]);
    requestAnimationFrame(() => requestAnimationFrame(() =>
      setParticles(p => p.map(pt => batch.some(b => b.id === pt.id) ? { ...pt, moved: true } : pt))
    ));
    setTimeout(() => setParticles(p => p.filter(pt => !batch.some(b => b.id === pt.id))), 900);
  }, []);

  return (
    <section className="section">
      <div className="badge">💥 антистрес кнопка</div>
      <h2 className="section-title">Вдарити!</h2>
      <p className="section-sub">Натисни що є сили. Відчуй як стрес вилітає.</p>

      <div className="rage-arena">
        {particles.map(p => (
          <div key={p.id} className="rage-particle" style={{
            width: p.size, height: p.size,
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            marginTop: -p.size / 2, marginLeft: -p.size / 2,
            transform: p.moved ? `translate(${p.tx}px,${p.ty}px) scale(0)` : "translate(0,0) scale(1)",
            opacity: p.moved ? 0 : 1,
          }} />
        ))}
        <div style={{ animation: shaking ? "shake .52s ease" : "none" }}>
          <button
            className="rage-btn"
            onClick={smash}
            onPointerDown={e => { e.currentTarget.style.transform = "scale(.9)"; }}
            onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {count === 0 ? "ВДАРИТИ!" : "ЩЕ!"}
          </button>
        </div>
      </div>

      {count > 0 && (
        <div className="rage-msg">{RAGE_MSGS[(count - 1) % RAGE_MSGS.length]}</div>
      )}
      <div className="stat-row">
        <div className="stat-card rage">
          <span className="stat-val">{count}</span>
          <span className="stat-lbl">ударів</span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   🌊 RIPPLE
───────────────────────────────────────────── */
let rId = 0;

function RippleSection() {
  const [ripples, setRipples] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [hint,    setHint]    = useState(true);

  const click = useCallback((e) => {
    const rect  = e.currentTarget.getBoundingClientRect();
    const id    = ++rId;
    const color = PAL[Math.floor(Math.random() * PAL.length)];
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, color }]);
    setTotal(t => t + 1);
    setHint(false);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 2000);
  }, []);

  return (
    <section className="section">
      <div className="badge">🌊 хвильовий басейн</div>
      <h2 className="section-title">Клікай — і дивись</h2>
      <p className="section-sub">Натискай будь-де. Хвилі розходяться — як стрес.</p>

      <div className="ripple-pool" onClick={click}>
        {hint && <span className="pool-hint">↓ НАТИСНИ БУДЬ-ДЕ ↓</span>}
        {ripples.map(rp => (
          <div key={rp.id} className="ripple-ring r1" style={{ left: rp.x - 30, top: rp.y - 30, borderColor: rp.color, boxShadow: `0 0 12px ${rp.color}55` }} />
        ))}
        {ripples.map(rp => (
          <div key={rp.id + "b"} className="ripple-ring r2" style={{ left: rp.x - 30, top: rp.y - 30, borderColor: rp.color + "88" }} />
        ))}
        {ripples.map(rp => (
          <div key={rp.id + "c"} className="ripple-ring r3" style={{ left: rp.x - 30, top: rp.y - 30, borderColor: rp.color + "44" }} />
        ))}
      </div>

      <div className="stat-row" style={{ marginTop: "1.2rem" }}>
        <div className="stat-card"><span className="stat-val">{total}</span><span className="stat-lbl">хвиль</span></div>
        <div className="stat-card"><span className="stat-val">{ripples.length}</span><span className="stat-lbl">активних</span></div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   🫁 BREATHING
───────────────────────────────────────────── */
const PHASES = [
  { key: "inhale", label: "Вдих",      dur: 4, color: "#a78bfa" },
  { key: "hold1",  label: "Затримка",  dur: 4, color: "#f9a8d4" },
  { key: "exhale", label: "Видих",     dur: 6, color: "#67e8f9" },
  { key: "hold2",  label: "Пауза",     dur: 2, color: "#6ee7b7" },
];

function BreathingSection() {
  const [on,     setOn]     = useState(false);
  const [pi,     setPi]     = useState(0);
  const [cnt,    setCnt]    = useState(PHASES[0].dur);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);

  const stop = () => {
    setOn(false);
    clearInterval(timerRef.current);
    setPi(0); setCnt(PHASES[0].dur);
  };

  const start = () => {
    setOn(true);
    let cp = 0, cc = PHASES[0].dur;
    timerRef.current = setInterval(() => {
      cc--;
      if (cc <= 0) {
        cp = (cp + 1) % PHASES.length;
        if (cp === 0) setCycles(c => c + 1);
        cc = PHASES[cp].dur;
        setPi(cp);
      }
      setCnt(cc);
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const ph       = PHASES[pi];
  const expanded = on && (pi === 0 || pi === 1);

  return (
    <section className="section">
      <div className="badge">🫁 дихальна практика</div>
      <h2 className="section-title">Зупинись і подихай</h2>
      <p className="section-sub">Техніка 4-4-6-2: вдих — затримка — видих — пауза.</p>

      <div className="breath-arena">
        <div className="breath-outer" style={{
          width:  expanded ? 300 : on ? 200 : 240,
          height: expanded ? 300 : on ? 200 : 240,
          borderColor: on ? ph.color + "22" : "rgba(167,139,250,.12)",
          boxShadow: on ? `0 0 80px ${ph.color}22` : "none",
        }} />
        <div className="breath-orb" style={{
          width:  expanded ? 240 : on ? 160 : 190,
          height: expanded ? 240 : on ? 160 : 190,
          background: `radial-gradient(circle at 35% 30%,${on ? ph.color : "#c4b5fd"}99,${on ? ph.color : "#7c3aed"}55 60%,${on ? ph.color : "#4c1d95"}44)`,
          borderColor: on ? ph.color + "55" : "rgba(167,139,250,.4)",
          boxShadow: on ? `0 0 60px ${ph.color}55,inset 0 0 30px ${ph.color}22` : "0 0 30px rgba(167,139,250,.2)",
        }}>
          <span className="breath-phase">{on ? ph.label : "Готово?"}</span>
          <span className="breath-count">{on ? cnt : "∞"}</span>
        </div>
      </div>

      <button className={`btn-breath${on ? " stop" : ""}`} onClick={on ? stop : start}>
        {on ? "⏹ Зупинити" : "▶ Почати"}
      </button>

      <div className="stat-row" style={{ marginTop: "1.5rem" }}>
        <div className="stat-card"><span className="stat-val" style={{ color: "#a78bfa" }}>{cycles}</span><span className="stat-lbl">цикли</span></div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   🥁 DRUM PADS
───────────────────────────────────────────── */
const PADS = [
  { label: "POW",  color: "#a78bfa", emoji: "💜" },
  { label: "BAM",  color: "#67e8f9", emoji: "💙" },
  { label: "BOOM", color: "#f9a8d4", emoji: "🩷" },
  { label: "ZAP",  color: "#6ee7b7", emoji: "💚" },
  { label: "POP",  color: "#fde047", emoji: "💛" },
  { label: "WHAM", color: "#fb923c", emoji: "🧡" },
];

function DrumPads() {
  const [active, setActive] = useState(null);
  const [hits,   setHits]   = useState({});
  const [total,  setTotal]  = useState(0);

  const hit = (i) => {
    setActive(i);
    setHits(h => ({ ...h, [i]: (h[i] || 0) + 1 }));
    setTotal(t => t + 1);
    setTimeout(() => setActive(null), 150);
  };

  return (
    <section className="section">
      <div className="badge">🥁 барабанні паді</div>
      <h2 className="section-title">Стукай — отримуй кайф</h2>
      <p className="section-sub">{total} ударів. Паді чекають.</p>

      <div className="pad-grid">
        {PADS.map((pad, i) => (
          <button
            key={i}
            className="pad"
            onPointerDown={() => hit(i)}
            style={{
              background:   active === i ? pad.color : `${pad.color}18`,
              borderColor:  active === i ? pad.color  : `${pad.color}44`,
              color:        active === i ? "#0a0a14"  : pad.color,
              transform:    active === i ? "scale(.92)" : "scale(1)",
              boxShadow:    active === i ? `0 0 45px ${pad.color}99, 0 0 90px ${pad.color}44` : `0 0 8px ${pad.color}22`,
            }}
          >
            <span className="pad-emoji">{pad.emoji}</span>
            <span className="pad-label">{pad.label}</span>
            {(hits[i] || 0) > 0 && <span className="pad-hits">{hits[i]}×</span>}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   🎊 FIREWORKS
───────────────────────────────────────────── */
const CW = 560, CH = 300;

function Fireworks() {
  const canvasRef = useRef(null);
  const psRef     = useRef([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let raf;
    const loop = () => {
      ctx.fillStyle = "rgba(8,8,16,.2)";
      ctx.fillRect(0, 0, CW, CH);
      psRef.current = psRef.current.filter(p => p.life > 0);
      psRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += .13; p.vx *= .99; p.life -= 1.5;
        ctx.globalAlpha = Math.max(0, p.life / 100);
        ctx.fillStyle   = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const launch = () => {
    setCount(c => c + 1);
    const burst = (x, y, n) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 5.5;
        psRef.current.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s - Math.random()*2.5, color: PAL[Math.floor(Math.random()*PAL.length)], size: 2 + Math.random()*3.5, life: 65 + Math.random()*65 });
      }
    };
    const cx = CW/2, cy = CH*.38;
    burst(cx, cy, 65);
    setTimeout(() => burst(cx-115, cy+45, 45), 120);
    setTimeout(() => burst(cx+115, cy+25, 45), 210);
    setTimeout(() => burst(cx, cy-75, 38), 330);
    setTimeout(() => burst(cx-60, cy+90, 30), 450);
    setTimeout(() => burst(cx+60, cy+70, 30), 500);
  };

  return (
    <section className="section">
      <div className="badge">🎊 феєрверк</div>
      <h2 className="section-title">Вибухай від стресу</h2>
      <p className="section-sub">{count > 0 ? `${count} вибухів запущено` : "Один клік — і все злітає."}</p>
      <canvas ref={canvasRef} width={CW} height={CH} className="firework-canvas" />
      <button
        className="btn-firework"
        onClick={launch}
        onPointerDown={e => { e.currentTarget.style.transform = "scale(.94)"; }}
        onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
        onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        🎊 ФЕЄРВЕРК!
      </button>
    </section>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────── */
const TABS = [
  { id: "wrap",      label: "🫧 Бульбашки" },
  { id: "rage",      label: "💥 Вдарити!" },
  { id: "ripple",    label: "🌊 Хвилі" },
  { id: "breath",    label: "🫁 Дихання" },
  { id: "drums",     label: "🥁 Барабани" },
  { id: "firework",  label: "🎊 Феєрверк" },
];

export default function App() {
  const [tab, setTab] = useState("wrap");

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-logo">
          <div className="logo-orb" />
          <span>ZenFlow</span>
          <span className="nav-sub">антистрес</span>
        </div>
        <div className="nav-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`nav-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {tab === "wrap"     && <BubbleWrap />}
      {tab === "rage"     && <RageButton />}
      {tab === "ripple"   && <RippleSection />}
      {tab === "breath"   && <BreathingSection />}
      {tab === "drums"    && <DrumPads />}
      {tab === "firework" && <Fireworks />}

      <footer className="footer">
        <span>ZenFlow</span> — твій антистрес простір ✦ {tab === "wrap" ? "лопай" : tab === "rage" ? "вдаряй" : tab === "ripple" ? "хвилюй" : tab === "breath" ? "дихай" : tab === "drums" ? "барабань" : "вибухай"}
      </footer>
    </div>
  );
}
