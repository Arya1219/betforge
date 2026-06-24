import { useState, useEffect, useRef, useCallback } from 'react'
import { TEAMS, TICK_SPEED, INITIAL_BALANCE, MIN_BET, MAX_BET, MAX_ACTIVE_BETS } from './constants'
import { calcAllOdds, fmt } from './math'
import { simulateMinute, resolveFreekick, resolveCorner, resolvePenalty, calcSetPieceOdds } from './engine'

let _notifId = 0
function mkNotif(msg, type = 'tick') {
  return { id: _notifId++, msg, type, ts: Date.now() }
}

function makeInitialMatchState() {
  const lambdaP = (TEAMS.portugal.strength * TEAMS.portugal.homeAdv) / 90
  const lambdaA = (TEAMS.argentina.strength * TEAMS.argentina.homeAdv) / 90
  return {
    minute:       0,
    score:        { P: 0, A: 0 },
    lambdaP,
    lambdaA,
    status:       'prematch',
    paused:       false,
    events:       [],
    redCards:     { portugal: 0, argentina: 0 },
    yellowCards:  { portugal: 0, argentina: 0 },
    halfStoppage: { first: 0, second: 0 },
    phase:        'first',
    setpiece:     null,
  }
}

export function useMatch() {
  const [gs, setGs]                         = useState(makeInitialMatchState)
  const [bets, setBets]                     = useState([])
  const [balance, setBalance]               = useState(INITIAL_BALANCE)
  const [notifications, setNotifications]   = useState([
    mkNotif('🏟️ Welcome to BetForge! Portugal vs Argentina. Admin presses KICK OFF to begin.', 'system'),
  ])
  const [odds, setOdds]   = useState(null)
  const [betSlip, setBetSlip]     = useState(null)
  const [stakeInput, setStakeInput] = useState('100')
  const [spTimer, setSpTimer]     = useState(0)

  const timerRef = useRef(null)
  const gsRef    = useRef(gs);      gsRef.current   = gs
  const betsRef  = useRef(bets);    betsRef.current = bets
  const balRef   = useRef(balance); balRef.current  = balance

  const pushNotif = useCallback((msg, type = 'tick') => {
    setNotifications(prev => [mkNotif(msg, type), ...prev].slice(0, 80))
  }, [])

  const recalcOdds = useCallback((state) => {
    const o = calcAllOdds(state.score, state.minute, state.lambdaP, state.lambdaA)
    setOdds(o)
  }, [])

  // ── Settle bets at FT ──
  const settleBets = useCallback((finalScore, events) => {
    setBets(prev => prev.map(b => {
      if (b.status !== 'active') return b
      const { market, selection } = b
      let won = false
      if (market === 'match') {
        const res = finalScore.P > finalScore.A ? 'por' : finalScore.P < finalScore.A ? 'arg' : 'draw'
        won = selection === res
      } else if (market === 'ou') {
        won = selection === 'over' ? (finalScore.P + finalScore.A) > 2.5 : (finalScore.P + finalScore.A) <= 2.5
      } else if (market === 'btts') {
        const both = finalScore.P > 0 && finalScore.A > 0
        won = selection === 'yes' ? both : !both
      } else if (market === 'ah') {
        const res = finalScore.P > finalScore.A ? 'por' : 'arg'
        won = selection === res
      } else if (market === 'scorer') {
        const [team, name] = selection.split('_')
        won = events.some(e => e.type === 'goal' && e.team === team && e.scorer === name)
      }
      if (won) setBalance(bal => bal + b.stake * b.odds)
      return { ...b, status: won ? 'won' : 'lost' }
    }))
  }, [])

  // ── Resolve set piece ──
  const processSetpiece = useCallback((sp, state) => {
    const { team } = sp
    const opp   = team === 'portugal' ? 'argentina' : 'portugal'
    const oppGK = TEAMS[opp].players.gk
    let newScore  = { ...state.score }
    let goalEvent = null

    // allow forcedTaker override from admin
    const penTakers  = sp.forcedTaker ? [{ ...sp.forcedTaker, weight: 1 }] : TEAMS[team].players.penalty
    const fkTakers   = sp.forcedTaker ? [{ ...sp.forcedTaker, weight: 1 }] : TEAMS[team].players.freekick
    const corTakers  = sp.forcedTaker ? [{ ...sp.forcedTaker, weight: 1 }] : TEAMS[team].players.corner

    if (sp.type === 'penalty') {
      const result = resolvePenalty(team, penTakers, oppGK, state.minute)
      if (result.outcome === 'goal') {
        newScore[team === 'portugal' ? 'P' : 'A']++
        goalEvent = { type: 'goal', team, scorer: result.taker, penalty: true }
        pushNotif(`⚽ PENALTY GOAL! ${result.taker} converts! ${newScore.P}–${newScore.A}`, 'goal')
      } else if (result.outcome === 'saved') {
        pushNotif(`🧤 SAVED! ${oppGK} stops ${result.taker}! Guessed ${result.keeperDir}.`, 'save')
      } else if (result.outcome === 'post') {
        pushNotif(`🔔 POST! ${result.taker}'s penalty rattles the woodwork!`, 'post')
      } else {
        pushNotif(`❌ MISS! ${result.taker} blazes it over the bar!`, 'miss')
      }
      setBets(prev => prev.map(b => {
        if (b.market !== 'sp_penalty' || b.status !== 'active') return b
        const won = b.selection === result.outcome ||
                    (b.selection === 'miss' && (result.outcome === 'miss' || result.outcome === 'post'))
        if (won) setBalance(bal => bal + b.stake * b.odds)
        return { ...b, status: won ? 'won' : 'lost' }
      }))
    }

    else if (sp.type === 'freekick') {
      const result = resolveFreekick(team, sp.distType, sp.position, fkTakers)
      const scored = result.outcome === 'goal' || result.outcome === 'goal_header'
      if (scored) {
        newScore[team === 'portugal' ? 'P' : 'A']++
        goalEvent = { type: 'goal', team, scorer: result.goalScorer || result.taker, freekick: true }
        pushNotif(`⚽ FREE KICK GOAL! ${result.taker} curls it in! ${newScore.P}–${newScore.A}`, 'goal')
      } else if (result.outcome === 'saved')    pushNotif(`🧤 ${oppGK} tips ${result.taker}'s free kick over!`, 'save')
      else if (result.outcome === 'post')       pushNotif(`🔔 THE POST! ${result.taker}'s free kick rattles the bar!`, 'post')
      else if (result.outcome === 'offtarget')  pushNotif(`❌ ${result.taker}'s free kick flies over.`, 'miss')
      else                                      pushNotif(`🛡️ Blocked and cleared! ${result.taker}'s free kick comes to nothing.`, 'tick')
      setBets(prev => prev.map(b => {
        if (b.market !== 'sp_freekick' || b.status !== 'active') return b
        const won = (b.selection === 'goal' && scored) ||
                    (b.selection === 'saved'     && result.outcome === 'saved') ||
                    (b.selection === 'offtarget' && result.outcome === 'offtarget') ||
                    (b.selection === 'blocked'   && result.outcome === 'blocked')
        if (won) setBalance(bal => bal + b.stake * b.odds)
        return { ...b, status: won ? 'won' : 'lost' }
      }))
    }

    else if (sp.type === 'corner') {
      const result = resolveCorner(team, corTakers)
      const scored = result.outcome === 'goal' || result.outcome === 'goal_header' || result.outcome === 'goal_direct'
      if (scored) {
        newScore[team === 'portugal' ? 'P' : 'A']++
        goalEvent = { type: 'goal', team, scorer: result.goalScorer || result.taker, corner: true }
        pushNotif(`⚽ CORNER GOAL! ${result.taker} delivers — ${result.goalScorer}! ${newScore.P}–${newScore.A}`, 'goal')
      } else if (result.outcome === 'saved')   pushNotif(`🧤 ${oppGK} saves the corner!`, 'save')
      else if (result.outcome === 'offtarget') pushNotif(`❌ Off target from the corner.`, 'miss')
      else                                     pushNotif(`🛡️ Cleared! ${TEAMS[opp].name} defend the corner.`, 'tick')
      setBets(prev => prev.map(b => {
        if (b.market !== 'sp_corner' || b.status !== 'active') return b
        const won = (b.selection === 'goal'      && scored) ||
                    (b.selection === 'saved'     && result.outcome === 'saved') ||
                    (b.selection === 'offtarget' && result.outcome === 'offtarget') ||
                    (b.selection === 'cleared'   && result.outcome === 'cleared')
        if (won) setBalance(bal => bal + b.stake * b.odds)
        return { ...b, status: won ? 'won' : 'lost' }
      }))
    }

    const newEvents = [...state.events, ...(goalEvent ? [goalEvent] : [])]
    return { newScore, newEvents }
  }, [pushNotif])

  // ── Advance one match minute ──
  const advanceMinute = useCallback(() => {
    setGs(prev => {
      if (prev.status === 'finished' || prev.status === 'halftime' || prev.setpiece || prev.paused) return prev

      const minute    = prev.minute + 1
      const endFirst  = 45 + prev.halfStoppage.first
      const endSecond = 90 + prev.halfStoppage.second

      if (prev.phase === 'first' && minute > endFirst) {
        const stoppage = Math.min(5, Math.max(0, Math.round(3 + 0.5 * (prev.redCards.portugal + prev.redCards.argentina))))
        pushNotif(`🔔 HALF TIME — Portugal ${prev.score.P}–${prev.score.A} Argentina. Second half coming!`, 'system')
        return { ...prev, minute, status: 'halftime', phase: 'second',
                 halfStoppage: { ...prev.halfStoppage, second: stoppage } }
      }

      if (prev.phase === 'second' && minute > endSecond) {
        const winner = prev.score.P > prev.score.A ? 'Portugal' :
                       prev.score.P < prev.score.A ? 'Argentina' : 'Draw'
        pushNotif(`⏱️ FULL TIME — Portugal ${prev.score.P}–${prev.score.A} Argentina! Result: ${winner}`, 'system')
        settleBets(prev.score, prev.events)
        return { ...prev, minute, status: 'finished' }
      }

      const sim = simulateMinute(prev)
      let newScore    = { ...prev.score }
      let newEvents   = [...prev.events]
      let newLambdaP  = prev.lambdaP
      let newLambdaA  = prev.lambdaA
      let newRedCards = { ...prev.redCards }
      let newYellows  = { ...prev.yellowCards }

      if (sim.type === 'penalty' || sim.type === 'freekick' || sim.type === 'corner') {
        const team   = sim.team
        const spOpts = calcSetPieceOdds(sim)
        const timers = { penalty: 20, freekick: 30, corner: 25 }
        const titles = {
          penalty:  `🚨 PENALTY — ${TEAMS[team].name.toUpperCase()}! 🚨`,
          freekick: `🎯 FREE KICK — ${TEAMS[team].name.toUpperCase()}`,
          corner:   `🚩 CORNER — ${TEAMS[team].name.toUpperCase()}`,
        }
        const markets = { penalty: 'sp_penalty', freekick: 'sp_freekick', corner: 'sp_corner' }
        const msgs = {
          penalty:  `🚨 PENALTY! ${TEAMS[team].name} awarded a penalty! Bet now — 20s!`,
          freekick: `🎯 FREE KICK! ${TEAMS[team].name} — ${sim.distNum || ''}yds, ${sim.position || ''}! Bet now — 30s!`,
          corner:   `🚩 CORNER! ${TEAMS[team].name} win a corner! Bet now — 25s!`,
        }
        pushNotif(msgs[sim.type], sim.type)
        return {
          ...prev, minute,
          setpiece: { ...sim, spOptions: spOpts, spTitle: titles[sim.type], timerSec: timers[sim.type], market: markets[sim.type] },
        }
      }

      for (const ev of sim.events) {
        if (ev.type === 'goal') {
          const key = ev.team === 'portugal' ? 'P' : 'A'
          newScore[key]++
          newEvents.push(ev)
          if (newScore.P === newScore.A && newScore.P + newScore.A > 0) {
            pushNotif(`🔥 EQUALIZER! ${ev.scorer} levels it — ${newScore.P}–${newScore.A}!`, 'goal')
          } else if (minute > 90) {
            pushNotif(`🚨 STOPPAGE TIME GOAL! ${ev.scorer} for ${TEAMS[ev.team].name}! ${newScore.P}–${newScore.A}`, 'goal')
          } else {
            pushNotif(`⚽ GOAL! ${ev.scorer} scores for ${TEAMS[ev.team].name}! ${newScore.P}–${newScore.A} ${minute}'`, 'goal')
          }
        } else if (ev.type === 'redcard') {
          newRedCards[ev.team]++
          if (ev.team === 'portugal') newLambdaP *= 0.65
          else                        newLambdaA *= 0.65
          pushNotif(`🔴 ${ev.secondYellow ? 'SECOND YELLOW' : 'RED CARD'}! ${TEAMS[ev.team].name} down to 10 men!`, 'card')
        } else if (ev.type === 'yellow') {
          newYellows[ev.team] = (newYellows[ev.team] || 0) + 1
          pushNotif(`🟨 Yellow card — ${TEAMS[ev.team].name}`, 'card')
        }
      }

      if (minute % 5 === 0 && sim.events.length === 0) pushNotif(`${minute}' — Match continues.`, 'tick')

      const newState = {
        ...prev, minute,
        score: newScore, events: newEvents,
        lambdaP: newLambdaP, lambdaA: newLambdaA,
        redCards: newRedCards, yellowCards: newYellows,
      }
      recalcOdds(newState)
      return newState
    })
  }, [pushNotif, settleBets, recalcOdds])

  // ── Main tick — respects pause ──
  useEffect(() => {
    if (gs.status !== 'live' || gs.setpiece || gs.paused) return
    timerRef.current = setTimeout(advanceMinute, TICK_SPEED)
    return () => clearTimeout(timerRef.current)
  }, [gs.status, gs.minute, gs.setpiece, gs.paused, advanceMinute])

  // ── Half-time auto-resume ──
  useEffect(() => {
    if (gs.status !== 'halftime') return
    const t = setTimeout(() => {
      setGs(prev => ({ ...prev, status: 'live', phase: 'second', minute: 45 }))
      pushNotif('▶️ Second half underway!', 'system')
    }, 8000)
    return () => clearTimeout(t)
  }, [gs.status, pushNotif])

  // ── Set piece countdown ──
  useEffect(() => {
    if (!gs.setpiece) return
    setSpTimer(gs.setpiece.timerSec)
    const interval = setInterval(() => {
      setSpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setGs(prevGs => {
            if (!prevGs.setpiece) return prevGs
            const { newScore, newEvents } = processSetpiece(prevGs.setpiece, prevGs)
            const next = { ...prevGs, score: newScore, events: newEvents, setpiece: null }
            recalcOdds(next)
            return next
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [gs.setpiece, processSetpiece, recalcOdds])

  // ── Place bet ──
  const placeBet = useCallback((market, selection, oddsVal, maxStakeOverride) => {
    const stake = parseInt(stakeInput) || 0
    const max   = maxStakeOverride || MAX_BET
    if (stake < MIN_BET)           { pushNotif(`⚠️ Minimum bet is ${MIN_BET} coins.`, 'warn'); return false }
    if (stake > max)               { pushNotif(`⚠️ Maximum bet is ${max} coins.`, 'warn'); return false }
    if (betsRef.current.filter(b => b.status === 'active').length >= MAX_ACTIVE_BETS) {
      pushNotif('⚠️ Maximum 4 active bets at once.', 'warn'); return false
    }
    if (balRef.current < stake) { pushNotif('⚠️ Insufficient balance.', 'warn'); return false }
    setBalance(prev => prev - stake)
    setBets(prev => [...prev, {
      id: _notifId++, market, selection, stake, odds: oddsVal,
      status: 'active', ts: Date.now(),
      label: `${market.toUpperCase()} — ${selection}`,
    }])
    setBetSlip(null)
    pushNotif(`✅ Bet placed: ${stake} coins @ ${fmt(oddsVal)} on ${selection}`, 'system')
    return true
  }, [stakeInput, pushNotif])

  // ── ADMIN ACTIONS ──────────────────────────────────────────────────────────

  const adminKickOff = useCallback(() => {
    const initial = makeInitialMatchState()
    const s = { ...initial, status: 'live', minute: 0 }
    setGs(s)
    recalcOdds(s)
    pushNotif('⚽ KICK OFF! Portugal vs Argentina is underway!', 'system')
  }, [recalcOdds, pushNotif])

  const adminPause = useCallback(() => {
    setGs(prev => ({ ...prev, paused: true }))
    pushNotif('⏸️ Match PAUSED by admin.', 'system')
  }, [pushNotif])

  const adminResume = useCallback(() => {
    setGs(prev => ({ ...prev, paused: false }))
    pushNotif('▶️ Match RESUMED by admin.', 'system')
  }, [pushNotif])

  const adminEndMatch = useCallback(() => {
    setGs(prev => {
      pushNotif(`🛑 Match ended by admin. Final: Portugal ${prev.score.P}–${prev.score.A} Argentina`, 'system')
      settleBets(prev.score, prev.events)
      return { ...prev, status: 'finished' }
    })
  }, [pushNotif, settleBets])

  const adminReset = useCallback(() => {
    const initial = makeInitialMatchState()
    setGs(initial)
    setBets([])
    setBalance(INITIAL_BALANCE)
    setOdds(null)
    setBetSlip(null)
    setStakeInput('100')
    setNotifications([mkNotif('🏟️ New match! Portugal vs Argentina. Admin to press KICK OFF.', 'system')])
  }, [])

  const adminAddStoppage = useCallback((mins) => {
    setGs(prev => {
      const phase = prev.phase
      const newStoppage = {
        ...prev.halfStoppage,
        [phase]: (prev.halfStoppage[phase] || 0) + mins,
      }
      pushNotif(`⏱️ +${mins} min stoppage time added (${phase} half)`, 'system')
      return { ...prev, halfStoppage: newStoppage }
    })
  }, [pushNotif])

  const adminVoidMarket = useCallback((market) => {
    setBets(prev => prev.map(b => {
      if (b.market !== market || b.status !== 'active') return b
      setBalance(bal => bal + b.stake) // refund
      return { ...b, status: 'void' }
    }))
    pushNotif(`🚫 Market "${market}" voided — all stakes refunded.`, 'warn')
  }, [pushNotif])

  // Admin inject: penalty, freekick, corner, goal, yellow, redcard
  const adminInjectEvent = useCallback((ev) => {
    const team  = ev.team
    const opp   = team === 'portugal' ? 'argentina' : 'portugal'
    const spOpts = calcSetPieceOdds({ type: ev.type, team, distType: ev.distType, position: ev.position })

    if (ev.type === 'penalty' || ev.type === 'freekick' || ev.type === 'corner') {
      const timers  = { penalty: 20, freekick: 30, corner: 25 }
      const markets = { penalty: 'sp_penalty', freekick: 'sp_freekick', corner: 'sp_corner' }
      const titles  = {
        penalty:  `🚨 PENALTY — ${TEAMS[team].name.toUpperCase()}! 🚨`,
        freekick: `🎯 FREE KICK — ${TEAMS[team].name.toUpperCase()}`,
        corner:   `🚩 CORNER — ${TEAMS[team].name.toUpperCase()}`,
      }
      const msgs = {
        penalty:  `🚨 [ADMIN] PENALTY! ${TEAMS[team].name} — ${ev.forcedTaker?.name || 'auto taker'}. Bet now — 20s!`,
        freekick: `🎯 [ADMIN] FREE KICK! ${TEAMS[team].name} — ${ev.forcedTaker?.name || 'auto'}, ${ev.distNum || '?'}yds ${ev.position || ''}. Bet now — 30s!`,
        corner:   `🚩 [ADMIN] CORNER! ${TEAMS[team].name} — ${ev.forcedTaker?.name || 'auto taker'}. Bet now — 25s!`,
      }
      pushNotif(msgs[ev.type], ev.type === 'penalty' ? 'penalty' : ev.type === 'freekick' ? 'freekick' : 'corner')
      setGs(prev => ({
        ...prev,
        setpiece: {
          type: ev.type, team,
          distType:   ev.distType  || 'med',
          distNum:    ev.distNum   || 25,
          position:   ev.position  || 'central',
          forcedTaker: ev.forcedTaker || null,
          spOptions:  spOpts,
          spTitle:    titles[ev.type],
          timerSec:   timers[ev.type],
          market:     markets[ev.type],
        },
      }))
      return
    }

    // Direct goal
    if (ev.type === 'goal') {
      setGs(prev => {
        const key = team === 'portugal' ? 'P' : 'A'
        const newScore  = { ...prev.score, [key]: prev.score[key] + 1 }
        const newEvents = [...prev.events, { type: 'goal', team, scorer: ev.scorer || 'Open Play' }]
        if (newScore.P === newScore.A && newScore.P + newScore.A > 0) {
          pushNotif(`🔥 EQUALIZER! ${ev.scorer || 'Open Play'} levels it — ${newScore.P}–${newScore.A}!`, 'goal')
        } else {
          pushNotif(`⚽ GOAL! ${ev.scorer || 'Open Play'} scores for ${TEAMS[team].name}! ${newScore.P}–${newScore.A} ${prev.minute}'`, 'goal')
        }
        const next = { ...prev, score: newScore, events: newEvents }
        recalcOdds(next)
        return next
      })
      return
    }

    if (ev.type === 'yellow') {
      setGs(prev => {
        const ny = { ...prev.yellowCards, [team]: (prev.yellowCards[team] || 0) + 1 }
        pushNotif(`🟨 Yellow card — ${TEAMS[team].name}${ev.player ? ` (${ev.player})` : ''}`, 'card')
        return { ...prev, yellowCards: ny }
      })
      return
    }

    if (ev.type === 'redcard') {
      setGs(prev => {
        const nr = { ...prev.redCards, [team]: prev.redCards[team] + 1 }
        const lambdaKey = team === 'portugal' ? 'lambdaP' : 'lambdaA'
        const next = { ...prev, redCards: nr, [lambdaKey]: prev[lambdaKey] * 0.65 }
        pushNotif(`🔴 RED CARD! ${TEAMS[team].name} down to 10 men! λ reduced 35%.`, 'card')
        recalcOdds(next)
        return next
      })
    }
  }, [pushNotif, recalcOdds])

  const startMatch = adminKickOff  // alias for participant view button

  const resetMatch = adminReset

  return {
    gs, bets, balance, notifications, odds,
    betSlip, setBetSlip,
    stakeInput, setStakeInput,
    spTimer,
    placeBet, startMatch, resetMatch,
    // admin
    adminKickOff, adminPause, adminResume, adminEndMatch,
    adminReset, adminAddStoppage, adminVoidMarket, adminInjectEvent,
  }
}
