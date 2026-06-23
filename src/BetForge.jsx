import { useState, useEffect, useRef, useCallback } from "react"

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TICK_SPEED     = 4000
const INITIAL_BAL    = 1000
const MAX_BET        = 500
const MIN_BET        = 10
const MAX_ACTIVE     = 4
const VIG            = 0.05
const ADMIN_PASSWORD = "admin"

const TEAMS = {
  P: {
    name: "Portugal", short: "POR", strength: 1.4, homeAdv: 1.2,
    color: "#1a7a1a", flag: "🟢",
    goalScorers: [
      { name: "Ronaldo", w: 0.40 }, { name: "B.Fernandes", w: 0.22 },
      { name: "B.Silva",  w: 0.15 }, { name: "Conceiçao",  w: 0.10 }, { name: "Other", w: 0.13 },
    ],
    freekick: [
      { name: "Ronaldo",    w: 0.60, ba: 0.80, conv: { short: 0.38, med: 0.32, long: 0.12 } },
      { name: "B.Fernandes",w: 0.30, ba: 0.45, conv: { short: 0.18, med: 0.14, long: 0.04 } },
      { name: "R.Neves",    w: 0.10, ba: 0.35, conv: { short: 0.12, med: 0.09, long: 0.03 } },
    ],
    corner: [
      { name: "B.Fernandes", w: 0.55, bonus: 1.20 },
      { name: "B.Silva",     w: 0.35, bonus: 1.10 },
      { name: "R.Neves",     w: 0.10, bonus: 1.00 },
    ],
    penalty: [
      { name: "Ronaldo",    w: 0.80, dir: { L: 0.35, C: 0.20, R: 0.45 }, sameP: 0.62, diffP: 0.92 },
      { name: "B.Fernandes",w: 0.15, dir: { L: 0.30, C: 0.25, R: 0.45 }, sameP: 0.48, diffP: 0.80 },
    ],
    gk: "D.Costa",
    gkDive: { L: 0.40, C: 0.10, R: 0.50 },
  },
  A: {
    name: "Argentina", short: "ARG", strength: 1.6, homeAdv: 1.0,
    color: "#1a3a7a", flag: "🔵",
    goalScorers: [
      { name: "Messi",      w: 0.42 }, { name: "Álvarez",     w: 0.25 },
      { name: "Di María",   w: 0.18 }, { name: "MacAllister", w: 0.08 }, { name: "Other", w: 0.07 },
    ],
    freekick: [
      { name: "Messi",   w: 0.65, ba: 0.75, conv: { short: 0.35, med: 0.28, long: 0.10 } },
      { name: "Di María",w: 0.25, ba: 0.50, conv: { short: 0.20, med: 0.16, long: 0.05 } },
      { name: "M.Allister",w: 0.10, ba: 0.30, conv: { short: 0.10, med: 0.08, long: 0.03 } },
    ],
    corner: [
      { name: "De Paul",  w: 0.60, bonus: 1.15 },
      { name: "Messi",    w: 0.25, bonus: 1.00 },
      { name: "Di María", w: 0.15, bonus: 1.00 },
    ],
    penalty: [
      { name: "Messi",   w: 0.75, dir: { L: 0.40, C: 0.15, R: 0.45 }, sameP: 0.60, diffP: 0.90 },
      { name: "Álvarez", w: 0.15, dir: { L: 0.45, C: 0.20, R: 0.35 }, sameP: 0.50, diffP: 0.82 },
      { name: "Di María",w: 0.10, dir: { L: 0.50, C: 0.10, R: 0.40 }, sameP: 0.52, diffP: 0.85 },
    ],
    gk: "E.Martínez",
    gkDive: { L: 0.35, C: 0.15, R: 0.50 },
  },
}

const USERS = [
  { id: 1, name: "Sakthi P", username: "sakt", password: "sakt3220" },
  { id: 2, name: "Aghil Krishna KP", username: "aghi", password: "aghi6351" },
  { id: 3, name: "Suraj Yadav", username: "sura", password: "sura0849" },
  { id: 4, name: "Ritesh S", username: "rite", password: "rite7645" },
  { id: 5, name: "Dhruv Kumar Jha", username: "dhru", password: "dhru6814" },
  { id: 6, name: "Dhanaraj K S", username: "dhan", password: "dhan7453" },
  { id: 7, name: "Vaibhav Mittal", username: "vaib", password: "vaib2303" },
  { id: 8, name: "Vineet Singla", username: "vine", password: "vine9584" },
  { id: 9, name: "Nilay Khisty", username: "nila", password: "nila4519" },
  { id: 10, name: "Abhijeet Singh", username: "abhi", password: "abhi7265" },
  { id: 11, name: "Darsh Viradiya", username: "dars", password: "dars0712" },
  { id: 12, name: "Gauransh Gupta", username: "gaur", password: "gaur1187" },
  { id: 13, name: "Dev Shah", username: "devs", password: "devs6287" },
  { id: 14, name: "Sunny Panchal", username: "sunn", password: "sunn5064" },
  { id: 15, name: "SIDDHANT VERMA", username: "sidd", password: "sidd2939" },
  { id: 172, name: "Prince Gupta", username: "prin", password: "prin4068" },
  { id: 173, name: "TAMMA SIVA SAI", username: "tamm", password: "tamm6770" },
  { id: 174, name: "Aryan kadam", username: "arya", password: "arya4656" },
  { id: 175, name: "Soumay Agarwal", username: "soum", password: "soum3311" },
  { id: 176, name: "Hrushikesh Tayade", username: "hrus", password: "hrus2179" },
  { id: 177, name: "Yash Gupta", username: "yash", password: "yash1384" },
  { id: 178, name: "Vineet Anand", username: "vine", password: "vine0934" },
  { id: 179, name: "Shreya Salhotra", username: "shre", password: "shre7334" },
  { id: 180, name: "Bikram Barman", username: "bikr", password: "bikr3493" },
  { id: 200, name: "Tanmay Agrawal", username: "tanm", password: "tanm8099" },
  { id: 201, name: "yuvraj pancholi", username: "yuvr", password: "yuvr5508" },
  { id: 210, name: "Abhinav Anand", username: "abhi", password: "abhi1715" },
  { id: 242, name: "Udhitha Boddepalli", username: "udhi", password: "udhi5217" },
  { id: 300, name: "Sahil Ratna", username: "sahi", password: "sahi8166" },
]

// ─── MATH ─────────────────────────────────────────────────────────────────────
const r = Math.random
function poisson(k, mu) {
  if (mu <= 0) return k === 0 ? 1 : 0
  let lp = -mu + k * Math.log(mu)
  for (let i = 1; i <= k; i++) lp -= Math.log(i)
  return Math.exp(lp)
}
function wPick(items) {
  const total = items.reduce((s, x) => s + (x.w || x.weight || 0), 0)
  let rv = r() * total
  for (const item of items) { rv -= (item.w || item.weight || 0); if (rv <= 0) return item }
  return items[items.length - 1]
}
function vigOdds(p) { return p <= 0 ? 50 : Math.min(50, Math.max(1.01, (1 / p) * (1 - VIG))) }
function fmt(n) { return Number(n).toFixed(2) }

function calcWinProbs(sP, sA, lP, lA, rem) {
  let pW = 0, pD = 0, pL = 0
  const mP = lP * rem, mA = lA * rem
  for (let i = 0; i <= 10; i++) {
    const pi = poisson(i, mP)
    for (let j = 0; j <= 10; j++) {
      const prob = pi * poisson(j, mA)
      const fp = sP + i, fa = sA + j
      if (fp > fa) pW += prob
      else if (fp === fa) pD += prob
      else pL += prob
    }
  }
  return { pW, pD, pL }
}

function calcAllOdds(score, minute, lP, lA) {
  const rem = Math.max(0, 90 - minute)
  const { pW, pD, pL } = calcWinProbs(score.P, score.A, lP, lA, rem)
  const muR = (lP + lA) * rem
  const g = score.P + score.A

  let pOver
  if (g >= 3) pOver = 1
  else { const need = Math.floor(2.5 - g + 1); let pU = 0; for (let k = 0; k < need; k++) pU += poisson(k, muR); pOver = 1 - pU }

  const sp = score.P > 0, sa = score.A > 0
  let pBTTS
  if (sp && sa) pBTTS = 1
  else if (sp) pBTTS = 1 - Math.exp(-lA * rem)
  else if (sa) pBTTS = 1 - Math.exp(-lP * rem)
  else pBTTS = (1 - Math.exp(-lP * rem)) * (1 - Math.exp(-lA * rem))

  const tL = lP + lA
  const pAny = rem > 0 ? 1 - Math.exp(-tL * rem) : 0
  const pPN = rem > 0 && tL > 0 ? (lP / tL) * pAny : 0
  const pAN = rem > 0 && tL > 0 ? (lA / tL) * pAny : 0
  const pNone = rem > 0 ? Math.exp(-tL * rem) : 1
  const ahT = pW + pL
  const pPAH = ahT > 0 ? pW / ahT : 0.5
  const pAAH = ahT > 0 ? pL / ahT : 0.5

  return {
    match: { pW, pD, pL },
    ou: { pOver, pUnder: 1 - pOver },
    btts: { pY: pBTTS, pN: 1 - pBTTS },
    next: { pP: pPN, pA: pAN, pNone },
    ah: { pP: pPAH, pA: pAAH },
  }
}

// ─── ENGINE ───────────────────────────────────────────────────────────────────
function simulateMinute(lP, lA) {
  for (const side of ["P", "A"]) {
    if (r() < 0.008) return { type: "penalty", side }
    if (r() < 0.06) {
      const dr = r(), dt = dr < 0.35 ? "long" : dr < 0.75 ? "med" : "short"
      const dn = dt === "long" ? 30 + r() * 10 : dt === "med" ? 20 + r() * 10 : 10 + r() * 10
      const pr = r(), pos = pr < 0.33 ? "left" : pr < 0.66 ? "central" : "right"
      return { type: "freekick", side, dt, dn: Math.round(dn), pos }
    }
    if (r() < 0.05) return { type: "corner", side }
  }
  const evs = []
  for (const side of ["P", "A"]) {
    const lam = side === "P" ? lP : lA
    if (r() < 1 - Math.exp(-lam)) {
      const sc = wPick(TEAMS[side].goalScorers)
      evs.push({ type: "goal", side, scorer: sc.name })
    }
  }
  for (const side of ["P", "A"]) {
    if (r() < 0.001) evs.push({ type: "red", side, sy: false })
    if (r() < 0.008) { evs.push({ type: "yellow", side }); if (r() < 0.003) evs.push({ type: "red", side, sy: true }) }
  }
  return { type: "normal", evs }
}

function resolvePenalty(side) {
  const taker = wPick(TEAMS[side].penalty)
  const dirs = Object.keys(taker.dir)
  let dr = r(), dir = dirs[2]
  let cum = 0; for (const d of dirs) { cum += taker.dir[d]; if (r() < cum) { dir = d; break } }
  const gk = TEAMS[side === "P" ? "A" : "P"]
  const gkDive = gk.gkDive
  const gkDir = r() < gkDive.L ? "L" : r() < gkDive.L + gkDive.C ? "C" : "R"
  const pSave = gkDir === dir ? taker.sameP : taker.diffP
  if (r() < 0.04) return { outcome: "post", taker: taker.name }
  if (r() < pSave) return { outcome: "saved", taker: taker.name, keeperDir: gkDir }
  if (r() < 0.03) return { outcome: "miss", taker: taker.name }
  return { outcome: "goal", taker: taker.name }
}

function resolveFreekick(side, dt, pos) {
  const taker = wPick(TEAMS[side].freekick)
  const posMod = pos === "central" ? 1.0 : 0.6
  const distMod = dt === "short" ? 0.5 : dt === "med" ? 1.0 : 0.7
  const pDirect = taker.ba * posMod * distMod
  if (r() < 0.08) return { outcome: "post", taker: taker.name }
  if (r() < pDirect) {
    const conv = taker.conv[dt]
    if (r() < conv) return { outcome: "goal", taker: taker.name, scorer: taker.name }
    if (r() < 0.52) return { outcome: "saved", taker: taker.name }
    return { outcome: "offtarget", taker: taker.name }
  }
  const rv = r()
  if (rv < 0.12) return { outcome: "goal", taker: taker.name, scorer: "Header" }
  if (rv < 0.32) return { outcome: "saved", taker: taker.name }
  if (rv < 0.67) return { outcome: "offtarget", taker: taker.name }
  return { outcome: "blocked", taker: taker.name }
}

function resolveCorner(side) {
  const taker = wPick(TEAMS[side].corner)
  const bonus = taker.bonus || 1.0
  const rv = r()
  const pG = 0.11 * bonus
  if (rv < 0.03) return { outcome: "goal", scorer: "Direct!", taker: taker.name }
  if (rv < 0.03 + pG) return { outcome: "goal", scorer: "Header", taker: taker.name }
  if (rv < 0.03 + pG + 0.22) return { outcome: "saved", taker: taker.name }
  if (rv < 0.03 + pG + 0.52) return { outcome: "offtarget", taker: taker.name }
  return { outcome: "cleared", taker: taker.name }
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
let _nid = 0
function mkN(msg, type = "tick") { return { id: _nid++, msg, type } }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%}
body{background:#080d0a;color:#e8ffe8;font-family:'JetBrains Mono','Courier New',monospace}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:#0a0f0a}
::-webkit-scrollbar-thumb{background:#1e3a1e;border-radius:2px}
button{cursor:pointer;border:none;outline:none;font-family:inherit}
button:hover{filter:brightness(1.1)}
button:active{filter:brightness(0.9)}
@keyframes slideIn{from{transform:translateX(10px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes goalFlash{0%,100%{background:#0d2a0d}50%{background:#0d400d}}
@keyframes spIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
`

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState("login") // login | game | admin

  if (view === "admin") return <AdminView onBack={() => setView("login")} />
  if (!user) return <LoginView onLogin={(u) => { setUser(u); setView("game") }} onAdmin={() => setView("admin")} />
  return <GameView user={user} onLogout={() => { setUser(null); setView("login") }} />
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginView({ onLogin, onAdmin }) {
  const [uname, setUname] = useState("")
  const [pass, setPass]   = useState("")
  const [err, setErr]     = useState("")
  const [loading, setLoading] = useState(false)

  const submit = () => {
    setErr("")
    if (!uname.trim() || !pass.trim()) { setErr("Enter username and password."); return }
    if (uname.trim().toLowerCase() === "admin" && pass.trim() === ADMIN_PASSWORD) { onAdmin(); return }
    setLoading(true)
    setTimeout(() => {
      const u = USERS.find(x => x.username === uname.trim().toLowerCase() && x.password === pass.trim())
      setLoading(false)
      if (u) onLogin(u)
      else setErr("Invalid credentials.")
    }, 400)
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#080d0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 380, padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚽</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#c8ff00" }}>
              BET<span style={{ color: "#fff" }}>FORGE</span>
            </div>
            <div style={{ fontSize: 11, color: "#2a4a2a", marginTop: 6, letterSpacing: 1 }}>QUANTX · FOOTBALL SIMULATION</div>
          </div>
          <div style={{ background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 6, padding: "32px 28px" }}>
            <div style={{ fontSize: 11, color: "#558855", fontWeight: 700, letterSpacing: 1.5, marginBottom: 24 }}>SIGN IN</div>
            {["USERNAME", "PASSWORD"].map((label, i) => (
              <div key={label} style={{ marginBottom: i === 0 ? 16 : 24 }}>
                <label style={{ fontSize: 10, color: "#3a5a3a", letterSpacing: 1, display: "block", marginBottom: 6 }}>{label}</label>
                <input
                  type={i === 1 ? "password" : "text"}
                  value={i === 0 ? uname : pass}
                  onChange={e => i === 0 ? setUname(e.target.value) : setPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  placeholder={i === 0 ? "e.g. sakt" : "e.g. sakt3220"}
                  style={{ width: "100%", background: "#0d200d", border: "1px solid #1a3a1a", borderRadius: 3, color: "#e8ffe8", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "#c8ff00"}
                  onBlur={e => e.target.style.borderColor = "#1a3a1a"}
                />
              </div>
            ))}
            {err && <div style={{ background: "#1a0808", border: "1px solid #ff444422", borderRadius: 3, padding: "8px 12px", fontSize: 11, color: "#ff8888", marginBottom: 16 }}>⚠️ {err}</div>}
            <button onClick={submit} disabled={loading} style={{ width: "100%", background: loading ? "#8aaa00" : "#c8ff00", color: "#080d0a", fontWeight: 700, fontSize: 13, padding: "11px 0", borderRadius: 3, letterSpacing: 1.5 }}>
              {loading ? "CHECKING..." : "▶ ENTER"}
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "#2a4a2a", lineHeight: 1.8 }}>
            Username: first 4 letters of name &nbsp;|&nbsp; Password: username + last 4 digits of phone
          </div>
        </div>
      </div>
    </>
  )
}

// ─── GAME VIEW ────────────────────────────────────────────────────────────────
function GameView({ user, onLogout }) {
  const match = useMatch(user)
  const pnl = match.balance - INITIAL_BAL

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#080d0a" }}>
        {/* HEADER */}
        <header style={{ background: "linear-gradient(90deg,#0d1f0d,#0a150a,#0d1f0d)", borderBottom: "1px solid #1a3a1a", padding: "0 16px", flexShrink: 0 }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", height: 46, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, color: "#c8ff00" }}>BET<span style={{ color: "#fff" }}>FORGE</span></span>
              <StatusBadge status={match.gs.status} minute={match.gs.minute} />
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <Stat label="PLAYER" value={user.name.split(" ")[0]} color="#fff" />
              <Stat label="BALANCE" value={`💰 ${match.balance.toLocaleString()}`} color="#c8ff00" />
              <Stat label="P&L" value={`${pnl >= 0 ? "+" : ""}${pnl}`} color={pnl > 0 ? "#4eff91" : pnl < 0 ? "#ff4e4e" : "#888"} />
              <button onClick={onLogout} style={{ background: "none", color: "#2a4a2a", fontSize: 10, border: "1px solid #1a3a1a", padding: "4px 8px", borderRadius: 2, letterSpacing: 1 }}>EXIT</button>
            </div>
          </div>
        </header>

        {/* SCOREBOARD */}
        <Scoreboard gs={match.gs} odds={match.odds} onStart={match.startMatch} />

        {/* THREE-COL BODY */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "240px 1fr 240px", minHeight: 0 }}>
          {/* LEFT */}
          <aside style={{ borderRight: "1px solid #1a3a1a", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <PH>LIVE FEED</PH>
            <NotifFeed notifs={match.notifs} />
          </aside>

          {/* CENTER */}
          <main style={{ overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 0 }}>
            {match.gs.status === "prematch" ? (
              <PreMatchBanner />
            ) : (
              <Markets gs={match.gs} odds={match.odds} onSelect={(m, sel, od) => match.setBetSlip({ m, sel, od })} />
            )}
            {match.betSlip && (
              <BetSlip
                slip={match.betSlip}
                stake={match.stake} setStake={match.setStake}
                onPlace={match.placeBet}
                onClose={() => match.setBetSlip(null)}
              />
            )}
          </main>

          {/* RIGHT */}
          <aside style={{ borderLeft: "1px solid #1a3a1a", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <PH>MY BETS</PH>
            <BetList bets={match.bets} />
            {match.gs.status === "finished" && <FinalResult gs={match.gs} balance={match.balance} bets={match.bets} onReset={match.resetMatch} user={user} />}
          </aside>
        </div>
      </div>

      {/* SET PIECE OVERLAY */}
      {match.gs.setpiece && (
        <SetPieceOverlay
          sp={match.gs.setpiece}
          spTimer={match.spTimer}
          stake={match.stake} setStake={match.setStake}
          onBet={match.placeBet}
        />
      )}
    </>
  )
}

// ─── MATCH HOOK ───────────────────────────────────────────────────────────────
function useMatch(user) {
  const lP0 = (TEAMS.P.strength * TEAMS.P.homeAdv) / 90
  const lA0 = (TEAMS.A.strength * TEAMS.A.homeAdv) / 90

  const makeGS = () => ({
    minute: 0, score: { P: 0, A: 0 }, lP: lP0, lA: lA0,
    status: "prematch", events: [], redCards: { P: 0, A: 0 },
    phase: "first", stoppage: { first: 0, second: 0 }, setpiece: null,
  })

  const [gs, setGs]       = useState(makeGS)
  const [bets, setBets]   = useState([])
  const [balance, setBal] = useState(INITIAL_BAL)
  const [notifs, setNotifs] = useState([mkN("🏟️ Welcome! Portugal vs Argentina. Press KICK OFF to begin.", "system")])
  const [odds, setOdds]   = useState(null)
  const [betSlip, setBetSlip] = useState(null)
  const [stake, setStake] = useState("100")
  const [spTimer, setSpTimer] = useState(0)

  const gsRef   = useRef(gs);   gsRef.current   = gs
  const betsRef = useRef(bets); betsRef.current = bets
  const balRef  = useRef(balance); balRef.current = balance
  const timerRef = useRef(null)

  const push = useCallback((msg, type = "tick") => {
    setNotifs(prev => [mkN(msg, type), ...prev].slice(0, 80))
  }, [])

  const recalc = useCallback((state) => {
    setOdds(calcAllOdds(state.score, state.minute, state.lP, state.lA))
  }, [])

  const settleBets = useCallback((finalScore, events) => {
    let totalWin = 0
    setBets(prev => prev.map(b => {
      if (b.status !== "active") return b
      let won = false
      if (b.market === "match") {
        const res = finalScore.P > finalScore.A ? "por" : finalScore.P < finalScore.A ? "arg" : "draw"
        won = b.sel === res
      } else if (b.market === "ou") {
        won = b.sel === "over" ? (finalScore.P + finalScore.A) > 2.5 : (finalScore.P + finalScore.A) <= 2.5
      } else if (b.market === "btts") {
        const both = finalScore.P > 0 && finalScore.A > 0
        won = b.sel === "yes" ? both : !both
      } else if (b.market === "ah") {
        const res = finalScore.P > finalScore.A ? "por" : "arg"
        won = b.sel === res
      }
      if (won) { totalWin += b.stake * b.odds; setBal(prev => prev + b.stake * b.odds) }
      return { ...b, status: won ? "won" : "lost" }
    }))
    // save score to shared leaderboard storage
    setTimeout(() => {
      try {
        window.storage?.set(`lb_${user.id}`, JSON.stringify({
          name: user.name, id: user.id,
          balance: balRef.current,
          bets: betsRef.current.length,
          ts: Date.now(),
        }), true)
      } catch (_) {}
    }, 1000)
  }, [user])

  const processSetpiece = useCallback((sp) => {
    const { side } = sp
    let newScore = { ...gsRef.current.score }
    let goalEvent = null

    if (sp.type === "penalty") {
      const res = resolvePenalty(side)
      const oppGK = TEAMS[side === "P" ? "A" : "P"].gk
      if (res.outcome === "goal") {
        newScore[side]++
        goalEvent = { type: "goal", side, scorer: res.taker, penalty: true }
        push(`⚽ PENALTY GOAL! ${res.taker} converts! ${TEAMS.P.name} ${newScore.P}–${newScore.A}`, "goal")
      } else if (res.outcome === "saved") push(`🧤 SAVED! ${oppGK} stops the penalty!`, "save")
      else if (res.outcome === "post") push(`🔔 POST! Penalty rattles the woodwork!`, "post")
      else push(`❌ MISS! Penalty blazed over the bar!`, "miss")
      setBets(prev => prev.map(b => {
        if (b.market !== "sp_pen" || b.status !== "active") return b
        const won = b.sel === res.outcome || (b.sel === "miss" && (res.outcome === "miss" || res.outcome === "post"))
        if (won) setBal(prev => prev + b.stake * b.odds)
        return { ...b, status: won ? "won" : "lost" }
      }))
    } else if (sp.type === "freekick") {
      const res = resolveFreekick(side, sp.dt, sp.pos)
      const scored = res.outcome === "goal"
      if (scored) {
        newScore[side]++
        goalEvent = { type: "goal", side, scorer: res.scorer || res.taker }
        push(`⚽ FREE KICK GOAL! ${res.taker} curls it in! ${newScore.P}–${newScore.A}`, "goal")
      } else if (res.outcome === "saved") push(`🧤 Free kick saved!`, "save")
      else if (res.outcome === "post") push(`🔔 Free kick hits the post!`, "post")
      else push(`❌ Free kick ${res.outcome}.`, "miss")
      setBets(prev => prev.map(b => {
        if (b.market !== "sp_fk" || b.status !== "active") return b
        const won = (b.sel === "goal" && scored) || (b.sel === res.outcome && !scored)
        if (won) setBal(prev => prev + b.stake * b.odds)
        return { ...b, status: won ? "won" : "lost" }
      }))
    } else if (sp.type === "corner") {
      const res = resolveCorner(side)
      const scored = res.outcome === "goal"
      if (scored) {
        newScore[side]++
        goalEvent = { type: "goal", side, scorer: res.scorer, corner: true }
        push(`⚽ CORNER GOAL! ${res.taker} delivers — ${res.scorer}! ${newScore.P}–${newScore.A}`, "goal")
      } else push(`🛡️ Corner ${res.outcome} — no goal.`, "tick")
      setBets(prev => prev.map(b => {
        if (b.market !== "sp_cor" || b.status !== "active") return b
        const won = (b.sel === "goal" && scored) || (b.sel === res.outcome && !scored)
        if (won) setBal(prev => prev + b.stake * b.odds)
        return { ...b, status: won ? "won" : "lost" }
      }))
    }
    return { newScore, newEvent: goalEvent }
  }, [push])

  const advanceMinute = useCallback(() => {
    setGs(prev => {
      if (prev.status === "finished" || prev.status === "halftime" || prev.setpiece) return prev
      const min = prev.minute + 1
      const endFirst  = 45 + (prev.stoppage?.first  || 0)
      const endSecond = 90 + (prev.stoppage?.second || 0)

      if (prev.phase === "first" && min > endFirst) {
        const s2 = Math.min(5, Math.max(1, Math.round(3 + 0.5 * (prev.redCards.P + prev.redCards.A))))
        push(`🔔 HALF TIME — ${TEAMS.P.name} ${prev.score.P}–${prev.score.A} ${TEAMS.A.name}`, "system")
        return { ...prev, minute: min, status: "halftime", phase: "second", stoppage: { ...prev.stoppage, second: s2 } }
      }
      if (prev.phase === "second" && min > endSecond) {
        const w = prev.score.P > prev.score.A ? TEAMS.P.name : prev.score.P < prev.score.A ? TEAMS.A.name : "Draw"
        push(`⏱️ FULL TIME — ${TEAMS.P.name} ${prev.score.P}–${prev.score.A} ${TEAMS.A.name}! Result: ${w}`, "system")
        settleBets(prev.score, prev.events)
        return { ...prev, minute: min, status: "finished" }
      }

      const sim = simulateMinute(prev.lP, prev.lA)
      let { score: ns, lP: nlP, lA: nlA, events: ne, redCards: nRC } = { ...prev, score: { ...prev.score }, events: [...prev.events], redCards: { ...prev.redCards } }

      if (sim.type === "penalty" || sim.type === "freekick" || sim.type === "corner") {
        const { side } = sim
        const titles = { penalty: `🚨 PENALTY — ${TEAMS[side].name.toUpperCase()}!`, freekick: `🎯 FREE KICK — ${TEAMS[side].name.toUpperCase()}`, corner: `🚩 CORNER — ${TEAMS[side].name.toUpperCase()}` }
        const markets = { penalty: "sp_pen", freekick: "sp_fk", corner: "sp_cor" }
        const timers = { penalty: 20, freekick: 30, corner: 25 }
        const msgs = {
          penalty: `🚨 PENALTY! ${TEAMS[side].name} — 20s to bet!`,
          freekick: `🎯 FREE KICK! ${TEAMS[side].name} — ${sim.dn || ""}yds ${sim.pos || ""} — 30s!`,
          corner: `🚩 CORNER! ${TEAMS[side].name} — 25s to bet!`,
        }
        push(msgs[sim.type], sim.type === "penalty" ? "penalty" : sim.type === "freekick" ? "freekick" : "corner")
        const spOdds = sim.type === "penalty"
          ? [{ sel: "goal", label: "Goal scored", p: 0.76 }, { sel: "saved", label: "Saved", p: 0.18 }, { sel: "miss", label: "Miss/Post", p: 0.06 }]
          : sim.type === "freekick"
          ? [{ sel: "goal", label: "Goal", p: 0.12 }, { sel: "saved", label: "Saved", p: 0.35 }, { sel: "offtarget", label: "Off target", p: 0.35 }, { sel: "blocked", label: "Blocked", p: 0.18 }]
          : [{ sel: "goal", label: "Goal", p: 0.14 }, { sel: "saved", label: "Saved", p: 0.22 }, { sel: "offtarget", label: "Off target", p: 0.30 }, { sel: "cleared", label: "Cleared", p: 0.34 }]
        return { ...prev, minute: min, setpiece: { ...sim, spTitle: titles[sim.type], market: markets[sim.type], timerSec: timers[sim.type], spOdds } }
      }

      for (const ev of (sim.evs || [])) {
        if (ev.type === "goal") {
          ns[ev.side]++
          ne.push(ev)
          if (ns.P === ns.A && ns.P + ns.A > 0) push(`🔥 EQUALIZER! ${ev.scorer} levels it — ${ns.P}–${ns.A}!`, "goal")
          else if (min > 90) push(`🚨 STOPPAGE GOAL! ${ev.scorer} for ${TEAMS[ev.side].name}! ${ns.P}–${ns.A}`, "goal")
          else push(`⚽ GOAL! ${ev.scorer} (${TEAMS[ev.side].short}) ${ns.P}–${ns.A} ${min}'`, "goal")
        } else if (ev.type === "red") {
          nRC[ev.side]++
          if (ev.side === "P") nlP *= 0.65; else nlA *= 0.65
          push(`🔴 ${ev.sy ? "SECOND YELLOW" : "RED CARD"}! ${TEAMS[ev.side].name} down to 10 men!`, "card")
        } else if (ev.type === "yellow") {
          push(`🟨 Yellow card — ${TEAMS[ev.side].name}`, "card")
        }
      }

      if (min === 45 + (prev.stoppage?.first || 0)) push(`⏱️ ${prev.stoppage?.first || 0} min stoppage time in first half`, "system")
      if (min === 90) push(`⏱️ ${prev.stoppage?.second || 0} min stoppage time in second half`, "system")
      if (min % 5 === 0 && !(sim.evs || []).length) push(`${min}' — Match continues.`, "tick")

      const newState = { ...prev, minute: min, score: ns, lP: nlP, lA: nlA, events: ne, redCards: nRC }
      recalc(newState)
      return newState
    })
  }, [push, settleBets, recalc])

  useEffect(() => {
    if (gs.status !== "live" || gs.setpiece) return
    timerRef.current = setTimeout(advanceMinute, TICK_SPEED)
    return () => clearTimeout(timerRef.current)
  }, [gs.status, gs.minute, gs.setpiece, advanceMinute])

  useEffect(() => {
    if (gs.status !== "halftime") return
    const t = setTimeout(() => {
      setGs(prev => ({ ...prev, status: "live", phase: "second", minute: 46 }))
      push("▶️ Second half underway!", "system")
    }, 5000)
    return () => clearTimeout(t)
  }, [gs.status, push])

  useEffect(() => {
    if (!gs.setpiece) return
    setSpTimer(gs.setpiece.timerSec)
    const iv = setInterval(() => {
      setSpTimer(prev => {
        if (prev <= 1) {
          clearInterval(iv)
          setGs(prevGs => {
            if (!prevGs.setpiece) return prevGs
            const { newScore, newEvent } = processSetpiece(prevGs.setpiece)
            const next = { ...prevGs, score: newScore, events: [...prevGs.events, ...(newEvent ? [newEvent] : [])], setpiece: null }
            recalc(next)
            return next
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [gs.setpiece, processSetpiece, recalc])

  const placeBet = useCallback((market, sel, od, maxOverride) => {
    const s = parseInt(stake) || 0
    const mx = maxOverride || MAX_BET
    if (s < MIN_BET) { push(`⚠️ Min bet is ${MIN_BET} coins.`, "warn"); return false }
    if (s > mx) { push(`⚠️ Max bet is ${mx} coins.`, "warn"); return false }
    const active = betsRef.current.filter(b => b.status === "active").length
    if (active >= MAX_ACTIVE) { push("⚠️ Max 4 active bets.", "warn"); return false }
    if (balRef.current < s) { push("⚠️ Insufficient balance.", "warn"); return false }
    setBal(prev => prev - s)
    const label = `${market.toUpperCase()} — ${sel}`
    setBets(prev => [...prev, { id: _nid++, market, sel, stake: s, odds: od, status: "active", label }])
    setBetSlip(null)
    push(`✅ Bet: ${s} coins @ ${fmt(od)} on ${sel}`, "system")
    return true
  }, [stake, push])

  const startMatch = useCallback(() => {
    const s1 = Math.min(5, Math.max(1, Math.round(2 + r() * 2)))
    const initial = { ...makeGS(), status: "live", minute: 0, stoppage: { first: s1, second: 0 } }
    setGs(initial); recalc(initial)
    push("⚽ KICK OFF! Portugal vs Argentina is underway!", "system")
    push(`⏱️ ${s1} min stoppage time planned for first half`, "system")
  }, [recalc, push])

  const resetMatch = useCallback(() => {
    setGs(makeGS()); setBets([]); setBal(INITIAL_BAL); setOdds(null); setBetSlip(null); setStake("100")
    setNotifs([mkN("🏟️ New match! Portugal vs Argentina. Press KICK OFF to begin.", "system")])
  }, [])

  return { gs, bets, balance, notifs, odds, betSlip, setBetSlip, stake, setStake, spTimer, placeBet, startMatch, resetMatch }
}

// ─── SCOREBOARD ───────────────────────────────────────────────────────────────
function Scoreboard({ gs, odds, onStart }) {
  const pW = odds?.match?.pW || 0
  const pD = odds?.match?.pD || 0
  const statusLabel = { prematch: "PRE-MATCH", live: `${gs.minute}'`, halftime: "HALF TIME", finished: "FULL TIME" }[gs.status]

  return (
    <div style={{ background: "linear-gradient(180deg,#0d200d,#081408)", borderBottom: "1px solid #1a3a1a", padding: "14px 20px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center" }}>
        <TeamInfo side="P" align="left" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <ScoreNum n={gs.score.P} />
            <span style={{ fontSize: 22, color: "#2a4a2a" }}>–</span>
            <ScoreNum n={gs.score.A} />
          </div>
          <div style={{ fontSize: gs.status === "live" ? 13 : 10, color: gs.status === "live" ? "#4eff91" : "#558855", letterSpacing: 1, fontWeight: gs.status === "live" ? 700 : 400 }}>
            {statusLabel}
          </div>
          {gs.status === "prematch" && (
            <button onClick={onStart} style={{ marginTop: 4, background: "#c8ff00", color: "#080d0a", fontWeight: 700, fontSize: 12, padding: "7px 24px", borderRadius: 2, letterSpacing: 1 }}>▶ KICK OFF</button>
          )}
          {gs.status === "live" && odds && (
            <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
              {[["POR", pW], ["DRAW", pD], ["ARG", 1 - pW - pD]].map(([label, p]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 1 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#c8ff00", fontWeight: 700 }}>{fmt(vigOdds(p))}</div>
                </div>
              ))}
            </div>
          )}
          {gs.redCards && (gs.redCards.P > 0 || gs.redCards.A > 0) && (
            <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#ff6666" }}>
              {gs.redCards.P > 0 && <span>🔴×{gs.redCards.P} POR</span>}
              {gs.redCards.A > 0 && <span>ARG 🔴×{gs.redCards.A}</span>}
            </div>
          )}
        </div>
        <TeamInfo side="A" align="right" />
      </div>
    </div>
  )
}

function TeamInfo({ side, align }) {
  const t = TEAMS[side]
  return (
    <div style={{ width: 140, textAlign: align }}>
      <div style={{ fontSize: 20 }}>{t.flag}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e8ffe8", letterSpacing: 1 }}>{t.name}</div>
      <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 1 }}>{t.short}</div>
    </div>
  )
}

function ScoreNum({ n }) {
  return <div style={{ fontSize: 42, fontWeight: 700, color: "#fff", minWidth: 52, textAlign: "center", lineHeight: 1 }}>{n}</div>
}

// ─── MARKETS ──────────────────────────────────────────────────────────────────
function Markets({ gs, odds, onSelect }) {
  if (!odds) return null
  const min = gs.minute
  const { match, ou, btts, next, ah } = odds

  const closed = (m) => {
    if (gs.status === "finished") return true
    const c = { match: 85, ou: 70, btts: 75, ah: 80, next: 88 }
    return min >= (c[m] || 90)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* M1: Match Result */}
      <MCard title="MATCH RESULT (1X2)" sub={`Closes min 85`} closed={closed("match")}>
        <BO label={`🟢 ${TEAMS.P.name} Win`} odds={vigOdds(match.pW)} onSel={() => onSelect("match", "por", vigOdds(match.pW))} />
        <BO label="Draw" odds={vigOdds(match.pD)} onSel={() => onSelect("match", "draw", vigOdds(match.pD))} />
        <BO label={`🔵 ${TEAMS.A.name} Win`} odds={vigOdds(match.pL)} onSel={() => onSelect("match", "arg", vigOdds(match.pL))} />
        <ProbBar vals={[match.pW, match.pD, match.pL]} colors={["#4eff91", "#888", "#4499ff"]} />
      </MCard>

      {/* M2: O/U 2.5 */}
      <MCard title="OVER / UNDER 2.5 GOALS" sub={`Closes min 70`} closed={closed("ou")}>
        <BO label={`Over 2.5  (${gs.score.P + gs.score.A} scored)`} odds={vigOdds(ou.pOver)} onSel={() => onSelect("ou", "over", vigOdds(ou.pOver))} />
        <BO label="Under 2.5" odds={vigOdds(ou.pUnder)} onSel={() => onSelect("ou", "under", vigOdds(ou.pUnder))} />
        <ProbBar vals={[ou.pOver, ou.pUnder]} colors={["#c8ff00", "#2a4a2a"]} />
      </MCard>

      {/* M3: BTTS */}
      <MCard title="BOTH TEAMS TO SCORE" sub={`Closes min 75`} closed={closed("btts")}>
        <BO label={`Yes — POR ${gs.score.P > 0 ? "✓" : "○"} ARG ${gs.score.A > 0 ? "✓" : "○"}`} odds={vigOdds(btts.pY)} onSel={() => onSelect("btts", "yes", vigOdds(btts.pY))} />
        <BO label="No" odds={vigOdds(btts.pN)} onSel={() => onSelect("btts", "no", vigOdds(btts.pN))} />
        <ProbBar vals={[btts.pY, btts.pN]} colors={["#4eff91", "#ff4e4e"]} />
      </MCard>

      {/* M4: Asian Handicap */}
      <MCard title="ASIAN HANDICAP (-0.5)" sub={`Closes min 80 · Must win outright`} closed={closed("ah")}>
        <BO label={`🟢 ${TEAMS.P.name} -0.5`} odds={vigOdds(ah.pP)} onSel={() => onSelect("ah", "por", vigOdds(ah.pP))} />
        <BO label={`🔵 ${TEAMS.A.name} -0.5`} odds={vigOdds(ah.pA)} onSel={() => onSelect("ah", "arg", vigOdds(ah.pA))} />
        <ProbBar vals={[ah.pP, ah.pA]} colors={["#1a7a1a", "#1a3a7a"]} />
      </MCard>

      {/* M5: Next Goal */}
      <MCard title="NEXT GOAL SCORER (TEAM)" sub={`Closes min 88 · Resets after each goal`} closed={closed("next")}>
        <BO label={`🟢 ${TEAMS.P.name} scores next`} odds={vigOdds(next.pP)} onSel={() => onSelect("next", "por", vigOdds(next.pP))} />
        <BO label={`🔵 ${TEAMS.A.name} scores next`} odds={vigOdds(next.pA)} onSel={() => onSelect("next", "arg", vigOdds(next.pA))} />
        <BO label="No more goals" odds={vigOdds(next.pNone)} onSel={() => onSelect("next", "none", vigOdds(next.pNone))} />
        <ProbBar vals={[next.pP, next.pA, next.pNone]} colors={["#1a7a1a", "#1a3a7a", "#333"]} />
      </MCard>
    </div>
  )
}

function MCard({ title, sub, closed, children }) {
  return (
    <div style={{ background: "#0a150a", border: `1px solid ${closed ? "#1a2a1a" : "#1e3e1e"}`, borderRadius: 4, overflow: "hidden", opacity: closed ? 0.5 : 1, marginBottom: 6 }}>
      <div style={{ padding: "7px 12px", borderBottom: "1px solid #1a3a1a", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1f0d" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#c8ff00", letterSpacing: 1.5 }}>{title}</span>
        <span style={{ fontSize: 9, color: closed ? "#ff5555" : "#558855" }}>{closed ? "🔒 CLOSED" : sub}</span>
      </div>
      <div style={{ padding: "7px 10px", display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>
    </div>
  )
}

function BO({ label, odds, onSel }) {
  return (
    <button onClick={onSel} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: 2, padding: "6px 10px", fontFamily: "inherit" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8ff00"; e.currentTarget.style.background = "#112211" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a3a1a"; e.currentTarget.style.background = "#0d1f0d" }}>
      <span style={{ fontSize: 10, color: "#8aaa8a" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#c8ff00" }}>{fmt(odds)}</span>
    </button>
  )
}

function ProbBar({ vals, colors }) {
  const total = vals.reduce((s, v) => s + v, 0)
  return (
    <div style={{ display: "flex", height: 3, borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
      {vals.map((v, i) => <div key={i} style={{ flex: total > 0 ? v / total : 1 / vals.length, background: colors[i] }} />)}
    </div>
  )
}

// ─── BET SLIP ─────────────────────────────────────────────────────────────────
function BetSlip({ slip, stake, setStake, onPlace, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: 320, background: "#0d200d", border: "1px solid #c8ff00", borderRadius: 6, padding: 16, zIndex: 100, boxShadow: "0 4px 20px #000a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1 }}>BET SLIP</div>
        <button onClick={onClose} style={{ background: "none", color: "#558855", fontSize: 16 }}>✕</button>
      </div>
      <div style={{ fontSize: 11, color: "#8aaa8a", marginBottom: 4 }}>{slip.m.toUpperCase()} — {slip.sel}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#c8ff00", marginBottom: 12 }}>@ {fmt(slip.od)}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="number" value={stake} onChange={e => setStake(e.target.value)}
          placeholder="Stake" min={MIN_BET} max={MAX_BET}
          style={{ flex: 1, background: "#0a150a", border: "1px solid #1a3a1a", borderRadius: 2, color: "#e8ffe8", fontFamily: "inherit", fontSize: 14, padding: "8px 10px", outline: "none" }}
          onFocus={e => e.target.style.borderColor = "#c8ff00"} onBlur={e => e.target.style.borderColor = "#1a3a1a"}
        />
        <button onClick={() => setStake(String(MAX_BET))} style={{ background: "#1a3a1a", color: "#558855", fontSize: 10, padding: "0 10px", borderRadius: 2 }}>MAX</button>
      </div>
      <div style={{ fontSize: 10, color: "#558855", marginBottom: 12 }}>Potential return: <span style={{ color: "#c8ff00", fontWeight: 700 }}>{fmt((parseInt(stake) || 0) * slip.od)}</span> coins</div>
      <button onClick={() => onPlace(slip.m, slip.sel, slip.od)} style={{ width: "100%", background: "#c8ff00", color: "#080d0a", fontWeight: 700, fontSize: 13, padding: "10px 0", borderRadius: 3, letterSpacing: 1 }}>PLACE BET</button>
    </div>
  )
}

// ─── NOTIFICATION FEED ────────────────────────────────────────────────────────
const NC = {
  goal: { bg: "#0d2a0d", border: "#4eff91", text: "#a0ffb0" },
  save: { bg: "#0a1a2a", border: "#44aaff", text: "#88bbff" },
  post: { bg: "#1a1a0a", border: "#ffdd44", text: "#ffee88" },
  miss: { bg: "#1a0a0a", border: "#ff5555", text: "#ff9999" },
  penalty: { bg: "#2a0d0d", border: "#ff4444", text: "#ffaaaa" },
  freekick: { bg: "#0d1a2a", border: "#4499ff", text: "#88bbff" },
  corner: { bg: "#1a0d2a", border: "#aa44ff", text: "#cc88ff" },
  card: { bg: "#1a1a0a", border: "#ffdd00", text: "#ffee66" },
  system: { bg: "#0d1a0d", border: "#448844", text: "#88bb88" },
  warn: { bg: "#2a1a0a", border: "#ff8800", text: "#ffbb44" },
  tick: { bg: "#0d150d", border: "#1a3a1a", text: "#5a7a5a" },
}

function NotifFeed({ notifs }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
      {notifs.map(n => {
        const c = NC[n.type] || NC.tick
        return (
          <div key={n.id} style={{ padding: "6px 10px", marginBottom: 4, borderRadius: 2, fontSize: 10, lineHeight: 1.5, background: c.bg, borderLeft: `2px solid ${c.border}`, color: c.text, animation: "slideIn 0.25s ease" }}>
            {n.msg}
          </div>
        )
      })}
    </div>
  )
}

// ─── BET LIST ────────────────────────────────────────────────────────────────
function BetList({ bets }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
      {bets.length === 0 && <div style={{ padding: 16, color: "#2a4a2a", fontSize: 10, textAlign: "center" }}>No bets yet.<br /><span style={{ color: "#1a3a1a" }}>Click any odds to bet.</span></div>}
      {[...bets].reverse().map(b => (
        <div key={b.id} style={{ padding: "7px 10px", marginBottom: 4, borderRadius: 2, fontSize: 10, background: b.status === "won" ? "#0d2a0d" : b.status === "lost" ? "#1a0a0a" : "#0d150d", borderLeft: `2px solid ${b.status === "won" ? "#4eff91" : b.status === "lost" ? "#ff4444" : "#c8ff00"}` }}>
          <div style={{ color: "#8aaa8a", marginBottom: 3 }}>{b.label}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#558855" }}>{b.stake} @ <span style={{ color: "#c8ff00" }}>{fmt(b.odds)}</span></span>
            <span style={{ color: b.status === "won" ? "#4eff91" : b.status === "lost" ? "#ff4444" : "#888", fontWeight: 700 }}>
              {b.status === "won" ? `+${fmt(b.stake * b.odds)}` : b.status === "lost" ? `-${b.stake}` : "● LIVE"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── FINAL RESULT ─────────────────────────────────────────────────────────────
function FinalResult({ gs, balance, bets, onReset, user }) {
  const pnl = balance - INITIAL_BAL
  const won = bets.filter(b => b.status === "won").length
  const lost = bets.filter(b => b.status === "lost").length

  return (
    <div style={{ padding: 12, borderTop: "1px solid #1a3a1a", background: "#0d200d" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1, marginBottom: 8 }}>⏱️ FULL TIME</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{gs.score.P} – {gs.score.A}</div>
      <div style={{ fontSize: 10, color: pnl >= 0 ? "#4eff91" : "#ff4e4e", marginBottom: 8 }}>{pnl >= 0 ? "+" : ""}{pnl} coins ({won}W / {lost}L)</div>
      <button onClick={onReset} style={{ width: "100%", background: "#1a3a1a", color: "#c8ff00", fontWeight: 700, fontSize: 11, padding: "8px 0", borderRadius: 2, letterSpacing: 1 }}>↺ NEW MATCH</button>
    </div>
  )
}

// ─── SET PIECE OVERLAY ────────────────────────────────────────────────────────
function SetPieceOverlay({ sp, spTimer, stake, setStake, onBet }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "#0a1f0a", border: "2px solid #c8ff00", borderRadius: 8, padding: "24px 28px", maxWidth: 360, width: "90%", animation: "spIn 0.3s ease" }}>
        <div style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "#c8ff00", letterSpacing: 1, marginBottom: 6 }}>{sp.spTitle}</div>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: spTimer <= 5 ? "#ff4444" : "#fff", animation: spTimer <= 5 ? "pulse 0.5s infinite" : "none" }}>{spTimer}s</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <input
            type="number" value={stake} onChange={e => setStake(e.target.value)}
            placeholder="Stake" min={MIN_BET} max={MAX_BET}
            style={{ flex: 1, background: "#0d200d", border: "1px solid #1a3a1a", borderRadius: 2, color: "#e8ffe8", fontFamily: "inherit", fontSize: 13, padding: "8px 10px", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sp.spOdds.map(opt => (
            <button key={opt.sel} onClick={() => onBet(sp.market, opt.sel, vigOdds(opt.p))}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: 2, padding: "8px 12px", fontFamily: "inherit", color: "#e8ffe8" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8ff00"; e.currentTarget.style.background = "#112211" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a3a1a"; e.currentTarget.style.background = "#0d1f0d" }}>
              <span style={{ fontSize: 11, color: "#8aaa8a" }}>{opt.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#c8ff00" }}>{fmt(vigOdds(opt.p))}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 9, color: "#3a5a3a", textAlign: "center" }}>Bet auto-resolves when timer hits 0</div>
      </div>
    </div>
  )
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView({ onBack }) {
  const [pw, setPw]     = useState("")
  const [auth, setAuth] = useState(false)
  const [err, setErr]   = useState("")
  const [lb, setLb]     = useState([])
  const [loading, setLoading] = useState(false)
  const [matchConfig, setMatchConfig] = useState({ teamAStr: 1.4, teamBStr: 1.6, homeAdv: 1.2, tickSpeed: 4000 })

  const login = () => {
    if (pw === ADMIN_PASSWORD) setAuth(true)
    else setErr("Wrong password.")
  }

  const loadLB = async () => {
    setLoading(true)
    try {
      const keys = await window.storage?.list("lb_", true)
      const entries = []
      for (const key of (keys?.keys || [])) {
        try {
          const res = await window.storage.get(key, true)
          if (res?.value) entries.push(JSON.parse(res.value))
        } catch (_) {}
      }
      entries.sort((a, b) => b.balance - a.balance)
      setLb(entries)
    } catch (_) {}
    setLoading(false)
  }

  const clearLB = async () => {
    if (!confirm("Clear all leaderboard data?")) return
    try {
      const keys = await window.storage?.list("lb_", true)
      for (const key of (keys?.keys || [])) await window.storage.delete(key, true)
      setLb([])
    } catch (_) {}
  }

  const exportCSV = () => {
    const rows = [["Rank", "Name", "Balance", "P&L", "Bets"]]
    lb.forEach((e, i) => rows.push([i + 1, e.name, e.balance.toFixed(0), (e.balance - INITIAL_BAL).toFixed(0), e.bets || 0]))
    const csv = rows.map(r => r.join(",")).join("\n")
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = "betforge_leaderboard.csv"; a.click()
  }

  if (!auth) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#080d0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 320, padding: 24, background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 6 }}>
          <div style={{ marginBottom: 16, color: "#c8ff00", fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>🔐 ADMIN LOGIN</div>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()}
            placeholder="Admin password" style={{ width: "100%", background: "#0d200d", border: "1px solid #1a3a1a", borderRadius: 2, color: "#e8ffe8", fontFamily: "inherit", fontSize: 13, padding: "9px 10px", outline: "none", marginBottom: 12 }} />
          {err && <div style={{ color: "#ff8888", fontSize: 11, marginBottom: 10 }}>⚠️ {err}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={login} style={{ flex: 1, background: "#c8ff00", color: "#080d0a", fontWeight: 700, fontSize: 12, padding: "9px 0", borderRadius: 2 }}>ENTER</button>
            <button onClick={onBack} style={{ background: "#1a3a1a", color: "#558855", fontSize: 12, padding: "9px 14px", borderRadius: 2 }}>BACK</button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#080d0a", padding: 24 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #1a3a1a" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#c8ff00", letterSpacing: 2 }}>BETFORGE ADMIN</div>
              <div style={{ fontSize: 10, color: "#3a5a3a", marginTop: 2 }}>Competition Control Panel</div>
            </div>
            <button onClick={onBack} style={{ background: "#1a3a1a", color: "#558855", fontSize: 11, padding: "8px 16px", borderRadius: 2, letterSpacing: 1 }}>← BACK</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Match Config */}
            <div style={{ background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1.5, marginBottom: 14 }}>MATCH CONFIGURATION</div>
              {[
                { label: "Portugal Strength (0.5–2.0)", key: "teamAStr", step: 0.1 },
                { label: "Argentina Strength (0.5–2.0)", key: "teamBStr", step: 0.1 },
                { label: "Home Advantage (1.0–1.3)", key: "homeAdv", step: 0.05 },
                { label: "Tick Speed ms (2000–10000)", key: "tickSpeed", step: 500 },
              ].map(({ label, key, step }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 1, display: "block", marginBottom: 4 }}>{label}</label>
                  <input type="number" step={step} value={matchConfig[key]}
                    onChange={e => setMatchConfig(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                    style={{ width: "100%", background: "#0d200d", border: "1px solid #1a3a1a", borderRadius: 2, color: "#e8ffe8", fontFamily: "inherit", fontSize: 13, padding: "7px 10px", outline: "none" }} />
                </div>
              ))}
              <div style={{ marginTop: 8, padding: "10px 12px", background: "#0d2a0d", borderRadius: 2, fontSize: 9, color: "#4eff91", lineHeight: 1.8 }}>
                λ_POR = {((matchConfig.teamAStr * matchConfig.homeAdv) / 90).toFixed(4)} goals/min<br />
                λ_ARG = {(matchConfig.teamBStr / 90).toFixed(4)} goals/min<br />
                Expected: POR {(matchConfig.teamAStr * matchConfig.homeAdv).toFixed(2)} — ARG {matchConfig.teamBStr.toFixed(2)} goals
              </div>
            </div>

            {/* Leaderboard Controls */}
            <div style={{ background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1.5, marginBottom: 14 }}>LEADERBOARD CONTROLS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <button onClick={loadLB} style={{ background: "#1a3a1a", color: "#4eff91", fontFamily: "inherit", fontWeight: 700, fontSize: 11, padding: "10px 0", borderRadius: 2, letterSpacing: 1 }}>
                  {loading ? "LOADING..." : "↻ REFRESH LEADERBOARD"}
                </button>
                <button onClick={exportCSV} disabled={lb.length === 0} style={{ background: "#1a2a1a", color: "#c8ff00", fontFamily: "inherit", fontWeight: 700, fontSize: 11, padding: "10px 0", borderRadius: 2, letterSpacing: 1, opacity: lb.length === 0 ? 0.5 : 1 }}>
                  ↓ EXPORT CSV
                </button>
                <button onClick={clearLB} style={{ background: "#2a0d0d", color: "#ff8888", fontFamily: "inherit", fontWeight: 700, fontSize: 11, padding: "10px 0", borderRadius: 2, letterSpacing: 1 }}>
                  🗑️ CLEAR ALL DATA
                </button>
              </div>
              <div style={{ fontSize: 9, color: "#3a5a3a", lineHeight: 1.8 }}>
                Leaderboard updates when players complete a match.<br />
                Data persists across sessions via shared storage.
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          {lb.length > 0 && (
            <div style={{ marginTop: 16, background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a3a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1.5 }}>LIVE LEADERBOARD — {lb.length} PLAYERS</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: "#0d200d" }}>
                      {["RANK", "NAME", "BALANCE", "P&L", "BETS"].map(h => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "#3a5a3a", fontWeight: 700, fontSize: 9, letterSpacing: 1, borderBottom: "1px solid #1a3a1a" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lb.map((e, i) => {
                      const pnl = e.balance - INITIAL_BAL
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`
                      return (
                        <tr key={e.id} style={{ background: i % 2 === 0 ? "#0a150a" : "#0d1a0d", borderBottom: "1px solid #1a2a1a" }}>
                          <td style={{ padding: "8px 14px", color: i < 3 ? "#c8ff00" : "#558855", fontWeight: 700 }}>{medal}</td>
                          <td style={{ padding: "8px 14px", color: "#e8ffe8" }}>{e.name}</td>
                          <td style={{ padding: "8px 14px", color: "#c8ff00", fontWeight: 700 }}>{Math.round(e.balance).toLocaleString()}</td>
                          <td style={{ padding: "8px 14px", color: pnl >= 0 ? "#4eff91" : "#ff4e4e", fontWeight: 700 }}>{pnl >= 0 ? "+" : ""}{Math.round(pnl)}</td>
                          <td style={{ padding: "8px 14px", color: "#558855" }}>{e.bets || 0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info */}
          <div style={{ marginTop: 16, padding: 14, background: "#0a150a", border: "1px solid #1a2a1a", borderRadius: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#558855", letterSpacing: 1, marginBottom: 8 }}>GAME RULES QUICK REFERENCE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 9, color: "#3a5a3a", lineHeight: 1.8 }}>
              <div>Starting balance: {INITIAL_BAL} coins<br />Min bet: {MIN_BET} | Max: {MAX_BET}<br />Max active bets: {MAX_ACTIVE}<br />Vig (house edge): {VIG * 100}%</div>
              <div>Match: 90 + stoppage time<br />Set pieces: penalties, freekicks, corners<br />Red card: λ reduced 35%<br />Odds locked at placement</div>
              <div>M1 closes: 85' | M2: 70'<br />M3 closes: 75' | M4: 80'<br />M5 closes: 88' (resets on goal)<br />Tiebreak: fewer bets wins</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function StatusBadge({ status, minute }) {
  const map = { prematch: { label: "PRE", bg: "#222", color: "#558855" }, live: { label: `● ${minute}'`, bg: "#c8ff00", color: "#080d0a" }, halftime: { label: "HT", bg: "#555", color: "#fff" }, finished: { label: "FT", bg: "#333", color: "#888" } }
  const s = map[status] || map.prematch
  return <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 2, letterSpacing: 1 }}>{s.label}</span>
}

function Stat({ label, value, color }) {
  return <div style={{ textAlign: "right" }}><div style={{ fontSize: 8, color: "#3a5a3a", letterSpacing: 1 }}>{label}</div><div style={{ fontSize: 12, fontWeight: 700, color }}>{value}</div></div>
}

function PH({ children }) {
  return <div style={{ padding: "8px 14px", borderBottom: "1px solid #1a3a1a", fontSize: 9, color: "#3a5a3a", fontWeight: 700, letterSpacing: 1.5, flexShrink: 0 }}>{children}</div>
}

function PreMatchBanner() {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px", color: "#558855" }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>⚽</div>
      <div style={{ fontSize: 16, color: "#c8ff00", marginBottom: 8, fontWeight: 700, letterSpacing: 2 }}>PORTUGAL vs ARGENTINA</div>
      <div style={{ fontSize: 10, color: "#3a5a3a", lineHeight: 2 }}>
        5 live markets · Poisson engine · Set piece overlays<br />
        Proper 90 min + stoppage · Real-time odds
      </div>
    </div>
  )
}
