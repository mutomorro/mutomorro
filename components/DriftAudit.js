'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const DIMENSIONS = [
  { id: "culture", label: "Cultural Coherence", short: "Culture" },
  { id: "standards", label: "Standards & Practice", short: "Standards" },
  { id: "strategy", label: "Strategic Connection", short: "Strategy" },
  { id: "decisions", label: "Decision Architecture", short: "Decisions" },
  { id: "feedback", label: "Feedback & Visibility", short: "Feedback" },
  { id: "accountability", label: "Accountability & Ownership", short: "Ownership" },
];

const QUESTIONS = [
  {
    dim: "culture",
    text: "If you described your organisation's culture five years ago and described it today, how similar would those two descriptions be?",
    low: "Barely recognisable",
    high: "Essentially the same",
    insight: "Diane Vaughan found that cultural shifts happen through repetition, not decision. Each small accommodation redefines what's normal.",
  },
  {
    dim: "culture",
    text: "How often do you hear \"that's just how things work here\" used to explain behaviours that wouldn't have been acceptable when the organisation was at its best?",
    low: "It's a common refrain",
    high: "Rarely or never",
    insight: "Vaughan called this the normalisation of deviance - when repeated practice without consequence rewrites the standard.",
  },
  {
    dim: "standards",
    text: "When was the last time your organisation revisited and actively reaffirmed its original quality or service standards?",
    low: "Can't remember",
    high: "Within the last year",
    insight: "The eroding goals archetype shows that without anchoring to an external reference, standards drift to match current performance.",
  },
  {
    dim: "standards",
    text: "How often are exceptions to established processes justified with reasoning like \"it was fine last time\"?",
    low: "It's the default logic",
    high: "Exceptions are rare and deliberate",
    insight: "\"It was fine last time\" is the sentence that drives all drift. Each exception that produces no bad outcome makes the next one easier.",
  },
  {
    dim: "strategy",
    text: "How closely does the way people spend their time on a typical Tuesday match the organisation's stated strategic priorities?",
    low: "Very little connection",
    high: "Closely aligned",
    insight: "Gerry Johnson found that strategy develops incrementally based on cultural and historical influences, often failing to keep pace with intent.",
  },
  {
    dim: "strategy",
    text: "Could a new joiner, after their first month, accurately describe the organisation's strategy from what they've observed - rather than what they were told?",
    low: "Unlikely",
    high: "Yes, it's visible in the work",
    insight: "When strategy lives in documents rather than operations, the distance between the two widens imperceptibly over time.",
  },
  {
    dim: "decisions",
    text: "How many approval stages does a typical decision pass through compared to three years ago?",
    low: "Noticeably more",
    high: "About the same or fewer",
    insight: "Scott Snook showed how each team adapts locally in sensible ways - but those adaptations compound across the system invisibly.",
  },
  {
    dim: "decisions",
    text: "How often do people create workarounds to get things done, rather than following the official process?",
    low: "Workarounds are the norm",
    high: "Processes generally work as designed",
    insight: "Snook called this practical drift - the slow uncoupling of practice from written procedure. It's driven by local rationality, not rebellion.",
  },
  {
    dim: "feedback",
    text: "When was the last time someone in a leadership meeting shared genuinely uncomfortable news about how the organisation is performing?",
    low: "Can't recall",
    high: "It happens regularly",
    insight: "Rasmussen showed that safety - like culture - is invisible when it's working. You only notice it when it's gone.",
  },
  {
    dim: "feedback",
    text: "How confident are you that the metrics you currently track would detect a gradual decline in what matters most to your organisation?",
    low: "Not at all confident",
    high: "Very confident",
    insight: "Efficiency produces visible, immediate feedback. Culture and quality erode with feedback that is delayed, ambiguous, and easy to miss.",
  },
  {
    dim: "accountability",
    text: "For the standards that matter most - culture, quality, values, service - could you name the specific person accountable for each one?",
    low: "They're everyone's job in general",
    high: "Yes, there's clear ownership",
    insight: "Dan Davies describes accountability sinks - structures that absorb responsibility until nobody owns the things that matter most.",
  },
  {
    dim: "accountability",
    text: "When something important erodes gradually, how long does it typically take before it's discussed at a senior level?",
    low: "Months or longer",
    high: "It surfaces quickly",
    insight: "Dekker found that organisations drift into failure precisely because they're doing well. Success reduces the perceived need for vigilance.",
  },
];

const BANDS = [
  { max: 2, label: "Significant drift likely", color: "#FF4279" },
  { max: 3, label: "Drift present", color: "#FFA200" },
  { max: 4, label: "Relatively anchored", color: "#9B51E0" },
  { max: 5, label: "Actively tended", color: "#4A9B6E" },
];

function getBand(score) {
  return BANDS.find((b) => score <= b.max) || BANDS[BANDS.length - 1];
}

function RadarChart({ scores, size = 320 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const n = DIMENSIONS.length;

  function polarToCart(angle, radius) {
    const a = (angle - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  }

  const angleStep = 360 / n;
  const rings = [1, 2, 3, 4, 5];

  const gridLines = rings.map((ring) => {
    const pts = DIMENSIONS.map((_, i) => {
      const p = polarToCart(i * angleStep, (ring / 5) * r);
      return `${p.x},${p.y}`;
    }).join(" ");
    return pts;
  });

  const axisLines = DIMENSIONS.map((_, i) => {
    const p = polarToCart(i * angleStep, r);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  const dataPoints = DIMENSIONS.map((dim, i) => {
    const val = scores[dim.id] || 0;
    const p = polarToCart(i * angleStep, (val / 5) * r);
    return `${p.x},${p.y}`;
  }).join(" ");

  const labels = DIMENSIONS.map((dim, i) => {
    const p = polarToCart(i * angleStep, r + 28);
    return { ...p, label: dim.short, score: scores[dim.id] || 0 };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }}>
      {gridLines.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#221C2B"
          strokeWidth={i === 4 ? 1.5 : 0.5}
          opacity={i === 4 ? 0.3 : 0.15}
        />
      ))}
      {axisLines.map((l, i) => (
        <line key={i} {...l} stroke="#221C2B" strokeWidth={0.5} opacity={0.15} />
      ))}
      <polygon
        points={dataPoints}
        fill="#9B51E0"
        fillOpacity={0.24}
        stroke="#9B51E0"
        strokeWidth={2.5}
      />
      {DIMENSIONS.map((dim, i) => {
        const val = scores[dim.id] || 0;
        const p = polarToCart(i * angleStep, (val / 5) * r);
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill={getBand(val).color} />;
      })}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fontFamily="'Source Sans 3', sans-serif"
          fontWeight={600}
          fill="#221C2B"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}

function ScoreSelector({ value, onChange, low, high }) {
  return (
    <div style={{ margin: "20px 0 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#3d3646", fontFamily: "'Source Sans 3', sans-serif" }}>
        <span>{low}</span>
        <span>{high}</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1,
              height: 48,
              border: value === n ? "2px solid #9B51E0" : "1px solid #cabfd6",
              background: value === n ? "#9B51E0" : "#fff",
              color: value === n ? "#fff" : "#221C2B",
              fontSize: 20,
              fontFamily: "'Source Sans 3', sans-serif",
              fontWeight: value === n ? 600 : 400,
              cursor: "pointer",
              borderRadius: 0,
              transition: "all 0.15s ease",
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DriftAudit() {
  const [phase, setPhase] = useState("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animateIn, setAnimateIn] = useState(true);
  const topRef = useRef(null);

  useEffect(() => {
    setAnimateIn(false);
    const t = setTimeout(() => setAnimateIn(true), 30);
    return () => clearTimeout(t);
  }, [current, phase]);

  function handleAnswer(val) {
    setAnswers({ ...answers, [current]: val });
  }

  function next() {
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setPhase("results");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function prev() {
    if (current > 0) setCurrent(current - 1);
  }

  function getScores() {
    const scores = {};
    DIMENSIONS.forEach((dim) => {
      const qs = QUESTIONS.map((q, i) => (q.dim === dim.id ? i : -1)).filter((i) => i >= 0);
      const vals = qs.map((i) => answers[i]).filter((v) => v != null);
      scores[dim.id] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    });
    return scores;
  }

  function getOverall() {
    const scores = getScores();
    const vals = Object.values(scores).filter((v) => v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }

  const base = {
    fontFamily: "'Source Sans 3', sans-serif",
    color: "#221C2B",
    background: "#FAF6F1",
    minHeight: "100vh",
    padding: 0,
    margin: 0,
  };

  const container = {
    maxWidth: 640,
    margin: "0 auto",
    padding: "40px 24px 60px",
  };

  if (phase === "intro") {
    return (
      <div style={base}>
        <div style={container} ref={topRef}>
          <div style={{ borderLeft: "3px solid #9B51E0", paddingLeft: 20, marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B51E0", margin: "0 0 8px" }}>
              Mutomorro
            </p>
            <h1 style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.2, margin: "0 0 12px" }}>
              Organisational Drift Audit
            </h1>
            <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.6, margin: 0, color: "#3d3646" }}>
              A conversation starter for leadership teams
            </p>
          </div>

          <div style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.8, marginBottom: 32 }}>
            <p>
              Drift is the slow, imperceptible movement of an organisation away from what it set out to be - not through failure, but through a thousand small, reasonable accommodations to pressure.
            </p>
            <p>
              This short assessment explores six dimensions where drift commonly shows up. It takes about five minutes and produces a picture of where your organisation might have quietly shifted - and where the most useful conversations might begin.
            </p>
            <p style={{ fontSize: 15, color: "#645b70", marginTop: 24 }}>
              This isn't a diagnosis. It's a prompt for honest reflection. The value is in the thinking it provokes, not the score it produces.
            </p>
          </div>

          <button
            onClick={() => setPhase("questions")}
            style={{
              background: "#221C2B",
              color: "#FAF6F1",
              border: "none",
              padding: "16px 40px",
              fontSize: 16,
              fontWeight: 400,
              fontFamily: "'Source Sans 3', sans-serif",
              cursor: "pointer",
              borderRadius: 0,
              letterSpacing: "0.02em",
            }}
          >
            Begin the audit
          </button>
        </div>
      </div>
    );
  }

  if (phase === "questions") {
    const q = QUESTIONS[current];
    const dim = DIMENSIONS.find((d) => d.id === q.dim);
    const progress = ((current + 1) / QUESTIONS.length) * 100;

    return (
      <div style={base}>
        <div style={container} ref={topRef}>
          {/* Progress bar */}
          <div style={{ height: 3, background: "#e0dbd5", marginBottom: 32 }}>
            <div
              style={{
                height: 3,
                background: "#9B51E0",
                width: `${progress}%`,
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {/* Dimension label */}
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B51E0", margin: "0 0 8px" }}>
            {dim.label}
          </p>

          {/* Question counter */}
          <p style={{ fontSize: 14, color: "#645b70", margin: "0 0 24px", fontWeight: 400 }}>
            Question {current + 1} of {QUESTIONS.length}
          </p>

          {/* Question */}
          <div
            style={{
              opacity: animateIn ? 1 : 0,
              transform: animateIn ? "translateY(0)" : "translateY(8px)",
              transition: "all 0.3s ease",
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.5, margin: "0 0 4px" }}>
              {q.text}
            </h2>

            <ScoreSelector
              value={answers[current]}
              onChange={handleAnswer}
              low={q.low}
              high={q.high}
            />

            {/* Research insight */}
            {answers[current] != null && (
              <div
                style={{
                  marginTop: 24,
                  padding: "16px 20px",
                  background: "#ebe3d8",
                  borderLeft: "3px solid #9B51E0",
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.7,
                  color: "#3d3646",
                }}
              >
                {q.insight}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
            <button
              onClick={prev}
              disabled={current === 0}
              style={{
                background: "none",
                border: "1px solid #cabfd6",
                padding: "12px 24px",
                fontSize: 14,
                fontFamily: "'Source Sans 3', sans-serif",
                cursor: current === 0 ? "default" : "pointer",
                opacity: current === 0 ? 0.3 : 1,
                borderRadius: 0,
                color: "#221C2B",
              }}
            >
              Back
            </button>
            <button
              onClick={next}
              disabled={answers[current] == null}
              style={{
                background: answers[current] != null ? "#221C2B" : "#ccc",
                color: "#FAF6F1",
                border: "none",
                padding: "12px 32px",
                fontSize: 14,
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 400,
                cursor: answers[current] != null ? "pointer" : "default",
                borderRadius: 0,
              }}
            >
              {current === QUESTIONS.length - 1 ? "See results" : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results phase
  const scores = getScores();
  const overall = getOverall();
  const overallBand = getBand(overall);

  const sorted = [...DIMENSIONS].sort((a, b) => (scores[a.id] || 0) - (scores[b.id] || 0));

  return (
    <div style={base}>
      <div style={container} ref={topRef}>
        <div style={{ borderLeft: "3px solid #9B51E0", paddingLeft: 20, marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B51E0", margin: "0 0 8px" }}>
            Your results
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.2, margin: "0 0 12px" }}>
            Organisational Drift Audit
          </h1>
        </div>

        {/* Radar chart */}
        <div style={{ display: "flex", justifyContent: "center", margin: "0 0 40px" }}>
          <RadarChart scores={scores} size={320} />
        </div>

        {/* Overall score */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 56, fontWeight: 400, margin: "0 0 4px", color: overallBand.color }}>
            {overall.toFixed(1)}
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: overallBand.color, margin: 0 }}>
            {overallBand.label}
          </p>
          <p style={{ fontSize: 14, color: "#645b70", fontWeight: 400, marginTop: 4 }}>
            Overall score out of 5.0
          </p>
        </div>

        {/* Dimension breakdown */}
        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 20, paddingBottom: 8, borderBottom: "1px solid #e0dbd5" }}>
          Dimension by dimension
        </h2>

        {sorted.map((dim) => {
          const score = scores[dim.id] || 0;
          const band = getBand(score);
          const dimQs = QUESTIONS.map((q, i) => (q.dim === dim.id ? i : -1)).filter((i) => i >= 0);

          return (
            <div key={dim.id} style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #f0ede8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>
                  {dim.label}
                </h3>
                <span style={{ fontSize: 22, fontWeight: 600, color: band.color }}>
                  {score.toFixed(1)}
                </span>
              </div>

              {/* Score bar */}
              <div style={{ height: 4, background: "#e0dbd5", marginBottom: 8 }}>
                <div
                  style={{
                    height: 4,
                    background: band.color,
                    width: `${(score / 5) * 100}%`,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              <p style={{ fontSize: 14, fontWeight: 400, color: "#645b70", margin: 0 }}>
                {band.label}
              </p>

              {/* Show the research insights for this dimension */}
              <div style={{ marginTop: 10 }}>
                {dimQs.map((qi) => (
                  <p
                    key={qi}
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: "#3d3646",
                      margin: "6px 0",
                      paddingLeft: 12,
                      borderLeft: "2px solid #d4c6e6",
                    }}
                  >
                    {QUESTIONS[qi].insight}
                  </p>
                ))}
              </div>
            </div>
          );
        })}

        {/* Closing */}
        <div style={{ marginTop: 40, padding: "24px", background: "#ebe3d8", fontSize: 16, fontWeight: 400, lineHeight: 1.8 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 400 }}>
            What to do with this
          </p>
          <p style={{ margin: "0 0 12px" }}>
            This audit works best as a conversation starter. Share it with your leadership team and compare how differently people score the same dimensions - the gaps between perceptions are often as revealing as the scores themselves.
          </p>
          <p style={{ margin: "0 0 12px" }}>
            The dimensions where you scored lowest aren't necessarily the places to start. They're the places to look - with curiosity rather than alarm. Drift contains no villains. It's structural, not personal.
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#645b70" }}>
            Based on research by Diane Vaughan, Jens Rasmussen, Scott Snook, Peter Senge, Sidney Dekker, and Dan Davies. Read more in our article:{" "}
            <Link href="/articles/organisational-drift" style={{ color: "#9B51E0" }}>
              <em>The Organisation That Changed Without Anyone Deciding to Change It.</em>
            </Link>
          </p>
        </div>

        {/* Restart */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button
            onClick={() => { setPhase("intro"); setCurrent(0); setAnswers({}); }}
            style={{
              background: "none",
              border: "1px solid #cabfd6",
              padding: "12px 32px",
              fontSize: 14,
              fontFamily: "'Source Sans 3', sans-serif",
              cursor: "pointer",
              borderRadius: 0,
              color: "#221C2B",
            }}
          >
            Start again
          </button>
        </div>
      </div>
    </div>
  );
}
