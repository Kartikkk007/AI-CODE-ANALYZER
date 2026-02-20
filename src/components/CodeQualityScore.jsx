import React, { useEffect, useState } from "react";
import { ShieldCheck, Zap, Eye, BookOpen, TrendingUp } from "lucide-react";

// Animated circular ring for the overall score
const CircularGauge = ({ score, size = 110 }) => {
  const [animated, setAnimated] = useState(0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (animated / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const getColor = (s) => {
    if (s >= 80) return "#4ade80";
    if (s >= 60) return "#facc15";
    if (s >= 40) return "#fb923c";
    return "#f87171";
  };

  const getLabel = (s) => {
    if (s >= 80) return { text: "Excellent", color: "#4ade80" };
    if (s >= 60) return { text: "Good", color: "#facc15" };
    if (s >= 40) return { text: "Fair", color: "#fb923c" };
    return { text: "Poor", color: "#f87171" };
  };

  const color = getColor(score);
  const label = getLabel(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-25"
          style={{ background: color }}
        />
        <svg width={size} height={size} viewBox="0 0 100 100" className="relative z-10 -rotate-90">
          {/* Track */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#27272a" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-2xl font-bold text-white leading-none">{score}</span>
          <span className="text-[10px] text-zinc-500 font-medium">/100</span>
        </div>
      </div>
      <span
        className="text-xs font-semibold px-3 py-0.5 rounded-full border"
        style={{ color: label.color, borderColor: label.color + "40", background: label.color + "12" }}
      >
        {label.text}
      </span>
    </div>
  );
};

// Animated horizontal bar for each metric
const MetricBar = ({ label, value, icon: Icon, delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 150 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const getColor = (v) => {
    if (v >= 80) return { bar: "from-emerald-500 to-green-400", text: "text-emerald-400", glow: "#4ade80" };
    if (v >= 60) return { bar: "from-yellow-500 to-amber-400", text: "text-yellow-400", glow: "#facc15" };
    if (v >= 40) return { bar: "from-orange-500 to-amber-500", text: "text-orange-400", glow: "#fb923c" };
    return { bar: "from-red-500 to-rose-400", text: "text-red-400", glow: "#f87171" };
  };

  const colors = getColor(value);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-md"
            style={{ background: colors.glow + "18", border: `1px solid ${colors.glow}30` }}
          >
            <Icon size={12} style={{ color: colors.glow }} />
          </div>
          <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors duration-200">
            {label}
          </span>
        </div>
        <span className={`text-xs font-bold ${colors.text}`}>{value}/100</span>
      </div>
      {/* Track */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        {/* Fill */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${colors.bar}`}
          style={{
            width: `${width}%`,
            transition: `width 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
            boxShadow: `0 0 8px ${colors.glow}60`,
          }}
        />
      </div>
    </div>
  );
};

const CodeQualityScore = ({ metrics }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (metrics) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    }
  }, [metrics]);

  if (!metrics) return null;

  const { overall, readability, performance, security, bestPractices } = metrics;

  const metricList = [
    { label: "Readability",     value: readability,    icon: Eye,       delay: 0   },
    { label: "Performance",     value: performance,    icon: Zap,       delay: 80  },
    { label: "Security",        value: security,       icon: ShieldCheck, delay: 160 },
    { label: "Best Practices",  value: bestPractices,  icon: BookOpen,  delay: 240 },
  ];

  return (
    <div
      className="mt-6 rounded-2xl border border-white/8 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #111117 0%, #0e0e13 100%)",
        boxShadow: "0 0 0 1px rgba(124,58,237,0.08), 0 20px 40px rgba(0,0,0,0.4)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b border-white/5"
        style={{ background: "rgba(124,58,237,0.06)" }}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-violet-500/15 border border-violet-500/20">
          <TrendingUp size={12} className="text-violet-400" />
        </div>
        <span className="text-sm font-semibold text-zinc-200">Code Quality Score</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-zinc-500 font-medium">Live analysis</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Left: Circular gauge */}
        <div className="shrink-0">
          <CircularGauge score={overall} />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px self-stretch bg-white/5" />

        {/* Right: metric bars */}
        <div className="flex-1 space-y-4 w-full">
          {metricList.map((m) => (
            <MetricBar key={m.label} {...m} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodeQualityScore;