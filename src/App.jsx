import React, { useState } from 'react'
import "./App.css"
import Navbar from './components/Navbar'
import Editor from '@monaco-editor/react';
import Select from 'react-select';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown'
import { Wand2, ShieldCheck, Loader2, Code2, Sparkles, ClipboardCheck, ChevronRight, BarChart2 } from 'lucide-react';
import CodeQualityScore from './components/CodeQualityScore';

const App = () => {
  const options = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'rust', label: 'Rust' },
    { value: 'dart', label: 'Dart' },
    { value: 'scala', label: 'Scala' },
    { value: 'perl', label: 'Perl' },
    { value: 'haskell', label: 'Haskell' },
    { value: 'elixir', label: 'Elixir' },
    { value: 'r', label: 'R' },
    { value: 'matlab', label: 'MATLAB' },
    { value: 'bash', label: 'Bash' }
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#0e0e11',
      borderColor: state.isFocused ? '#7c3aed' : '#27272a',
      color: '#fff',
      boxShadow: state.isFocused ? '0 0 0 1px #7c3aed' : 'none',
      borderRadius: '10px',
      minHeight: '42px',
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: '#52525b' },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#111114',
      border: '1px solid #27272a',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
    }),
    singleValue: (provided) => ({ ...provided, color: '#e4e4e7', fontWeight: 500 }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#1c1c22' : 'transparent',
      color: state.isFocused ? '#a78bfa' : '#a1a1aa',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.15s ease',
    }),
    input: (provided) => ({ ...provided, color: '#fff' }),
    placeholder: (provided) => ({ ...provided, color: '#52525b' }),
    dropdownIndicator: (provided) => ({ ...provided, color: '#52525b' }),
    indicatorSeparator: () => ({ display: 'none' }),
  };

  function extractMetrics(text) {
    try {
      const match = text.match(/```json\s*([\s\S]*?)```/);
      if (match) return JSON.parse(match[1]);
      const plain = text.match(/\{[\s\S]*?"overall"[\s\S]*?\}/);
      if (plain) return JSON.parse(plain[0]);
    } catch { /* ignore */ }
    return null;
  }

  async function reviewCode() {
    if (!code) { alert("Please enter code first"); return; }
    setResponse("");
    setMetrics(null);
    setHasReviewed(false);
    setAnimateIn(false);
    setShowMetrics(false);
    setLoading(true);

    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert-level software developer.
I'm sharing code written in ${selectedOption.value}.

Do two things:

### PART 1 — Quality Metrics JSON
Output a JSON block (and nothing else before the block) like this:
\`\`\`json
{
  "overall": 72,
  "readability": 80,
  "performance": 65,
  "security": 70,
  "bestPractices": 75
}
\`\`\`
All values are integers 0–100. Be accurate and critical.

### PART 2 — Detailed Review
After the JSON block, write a full code review covering:
1. Quality rating: Better / Good / Normal / Bad
2. Detailed improvement suggestions & best practices
3. Step-by-step explanation of what the code does
4. Potential bugs or logical errors
5. Syntax or runtime errors
6. Fixes and recommendations

Code:
${code}
`,
    });

    const text = res.text;
    const parsed = extractMetrics(text);
    const cleanText = text.replace(/```json[\s\S]*?```/, "").trim();

    setMetrics(parsed);
    setResponse(cleanText);
    setLoading(false);
    setHasReviewed(true);
    setTimeout(() => setAnimateIn(true), 50);
  }

  async function fixCode() {
    if (!code) { alert("Please enter code first"); return; }
    setResponse("");
    setMetrics(null);
    setHasReviewed(false);
    setAnimateIn(false);
    setShowMetrics(false);
    setLoading(true);

    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert software developer. Fix all bugs, syntax errors, and logical issues in the following ${selectedOption.value} code. Return the corrected code with a brief explanation of what was fixed.\n\nCode: ${code}`,
    });

    setResponse(res.text);
    setLoading(false);
    setHasReviewed(true);
    setTimeout(() => setAnimateIn(true), 50);
  }

  function handleQualityScore() {
    if (!code) { alert("Please enter code first"); return; }
    if (!hasReviewed) { alert("Run a Review first to generate quality metrics"); return; }
    setShowMetrics(prev => !prev);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&display=swap');
        * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #7c3aed; }
        body { background: #0a0a0d; color: #e4e4e7; margin: 0; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0 16px; height: 42px; border-radius: 10px; border: none;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; box-shadow: 0 4px 15px rgba(124,58,237,0.35);
          transition: all 0.2s ease; white-space: nowrap;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.5); background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0 16px; height: 42px; border-radius: 10px;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          background: transparent; color: #a1a1aa;
          border: 1px solid #27272a;
          transition: all 0.2s ease; white-space: nowrap;
        }
        .btn-secondary:hover { border-color: #7c3aed; color: #a78bfa; background: rgba(124,58,237,0.08); transform: translateY(-1px); }
        .btn-secondary:active { transform: translateY(0); }

        /* Quality Score button — teal/emerald accent to stand out */
        .btn-score {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0 16px; height: 42px; border-radius: 10px;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          background: transparent; color: #a1a1aa;
          border: 1px solid #27272a;
          transition: all 0.2s ease; white-space: nowrap;
        }
        .btn-score:hover { border-color: #10b981; color: #34d399; background: rgba(16,185,129,0.08); transform: translateY(-1px); }
        .btn-score:active { transform: translateY(0); }
        .btn-score.active {
          border-color: #10b981; color: #34d399;
          background: rgba(16,185,129,0.10);
          box-shadow: 0 0 14px rgba(16,185,129,0.18);
        }

        .response-fade-in { animation: fadeSlideIn 0.5s ease forwards; }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .metrics-slide {
          animation: metricsIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes metricsIn {
          from { opacity: 0; transform: translateY(-10px) scaleY(0.96); }
          to   { opacity: 1; transform: translateY(0)   scaleY(1); }
        }

        .pulse-dot { animation: pulseDot 1.4s ease-in-out infinite; }
        @keyframes pulseDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }

        .md-body { color: #d4d4d8; line-height: 1.75; font-size: 14.5px; }
        .md-body h1, .md-body h2, .md-body h3 { color: #f4f4f5; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.6em; padding-bottom: 6px; border-bottom: 1px solid #27272a; }
        .md-body h1 { font-size: 20px; }
        .md-body h2 { font-size: 17px; color: #a78bfa; border-bottom-color: #7c3aed30; }
        .md-body h3 { font-size: 15px; border-bottom: none; color: #c4b5fd; }
        .md-body p { margin-bottom: 0.9em; }
        .md-body strong { color: #e4e4e7; font-weight: 600; }
        .md-body code { font-family: 'JetBrains Mono', monospace; background: #1a1a22; border: 1px solid #2d2d3a; border-radius: 5px; padding: 2px 7px; font-size: 12.5px; color: #c084fc; }
        .md-body pre { background: #111117; border: 1px solid #27272a; border-radius: 10px; padding: 16px; overflow-x: auto; margin: 14px 0; }
        .md-body pre code { background: transparent; border: none; color: #e2e8f0; padding: 0; font-size: 13px; }
        .md-body ul, .md-body ol { padding-left: 20px; margin-bottom: 0.9em; }
        .md-body li { margin-bottom: 6px; }
        .md-body li::marker { color: #7c3aed; }
        .md-body blockquote { border-left: 3px solid #7c3aed; margin: 14px 0; padding: 10px 16px; background: rgba(124,58,237,0.06); border-radius: 0 8px 8px 0; color: #a1a1aa; }
        .md-body a { color: #a78bfa; text-decoration: underline; }
      `}</style>

      <Navbar />

      <div className="flex" style={{ height: 'calc(100vh - 72px)', background: '#0a0a0d' }}>

        {/* ── LEFT: Editor Panel ── */}
        <div className="flex flex-col w-1/2 border-r border-white/5">

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5" style={{ background: '#0e0e11' }}>
            {/* Language selector */}
            <div style={{ flex: 1, maxWidth: 180 }}>
              <Select value={selectedOption} onChange={setSelectedOption} options={options} styles={customStyles} />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button className="btn-secondary" onClick={fixCode}>
                <Wand2 size={14} /> Fix Code
              </button>

              {/* ── Quality Score toggle button ── */}
              <button
                className={`btn-score ${showMetrics ? 'active' : ''}`}
                onClick={handleQualityScore}
                title={hasReviewed ? "Toggle quality metrics" : "Run a Review first"}
              >
                <BarChart2 size={14} />
                Quality Score
                {/* dot indicator when metrics are available */}
                {metrics && (
                  <span
                    className="w-1.5 h-1.5 rounded-full ml-1"
                    style={{ background: showMetrics ? '#10b981' : '#6b7280' }}
                  />
                )}
              </button>

              <button className="btn-primary" onClick={reviewCode}>
                <ShieldCheck size={14} /> Review
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1" style={{ background: '#0e0e11' }}>
            <Editor
              height="100%" theme="vs-dark"
              language={selectedOption.value}
              value={code} onChange={(v) => setCode(v)}
              options={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14, lineHeight: 22,
                padding: { top: 20, bottom: 20 },
                minimap: { enabled: false },
                scrollbar: { verticalScrollbarSize: 5 },
                renderLineHighlight: 'gutter',
              }}
            />
          </div>
        </div>

        {/* ── RIGHT: Response Panel ── */}
        <div className="flex flex-col w-1/2 overflow-hidden" style={{ background: '#0a0a0d' }}>

          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0" style={{ background: '#0e0e11' }}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-600/15 border border-violet-500/20">
                <Sparkles size={13} className="text-violet-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-300">AI Analysis</span>
            </div>
            {hasReviewed && (
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-0.5 flex items-center gap-1">
                <ClipboardCheck size={11} /> Review Complete
              </span>
            )}
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* IDLE */}
            {!loading && !hasReviewed && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-5 opacity-60">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-600/15 rounded-3xl blur-xl" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-violet-900/20 border border-violet-500/20 flex items-center justify-center">
                    <Code2 size={28} className="text-violet-400" />
                  </div>
                </div>
                <div>
                  <p className="text-zinc-400 font-semibold text-base mb-1">No analysis yet</p>
                  <p className="text-zinc-600 text-sm">Paste your code and hit <strong className="text-violet-400">Review</strong> to get started</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-600 bg-white/3 border border-white/5 rounded-full px-4 py-2">
                  <ChevronRight size={12} className="text-violet-500" />
                  Supports 20+ languages
                </div>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-600/20 rounded-full blur-2xl scale-150" />
                  <div className="relative w-16 h-16 rounded-full border-2 border-violet-500/30 flex items-center justify-center">
                    <Loader2 size={26} className="text-violet-400 animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-zinc-300 font-semibold mb-1">Analyzing your code…</p>
                  <p className="text-zinc-600 text-sm">Running deep inspection</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="pulse-dot w-2 h-2 rounded-full bg-violet-500"
                      style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <div className="w-full max-w-sm space-y-3 mt-4">
                  {[100, 80, 90, 60].map((w, i) => (
                    <div key={i} className="h-3 rounded-full bg-white/5 animate-pulse"
                      style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* RESPONSE */}
            {hasReviewed && !loading && (
              <div className={animateIn ? 'response-fade-in' : 'opacity-0'}>

                {/* ── Quality Score panel: only shown when toggled ── */}
                {showMetrics && metrics && (
                  <div className="metrics-slide">
                    <CodeQualityScore metrics={metrics} />
                  </div>
                )}

                {/* Hint when score button was clicked but no metrics parsed */}
                {showMetrics && !metrics && (
                  <div className="flex items-center gap-2 p-4 rounded-xl border border-amber-500/20 bg-amber-500/6 text-amber-400 text-sm mb-4 metrics-slide">
                    <BarChart2 size={15} />
                    Metrics unavailable — try running Review again.
                  </div>
                )}

                {/* Section divider */}
                <div className="flex items-center gap-3 mt-6 mb-5">
                  <div className="flex-1 h-px bg-gradient-to-r from-violet-500/30 to-transparent" />
                  <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest">Detailed Review</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-violet-500/30 to-transparent" />
                </div>

                {/* Markdown review */}
                <div className="md-body">
                  <Markdown>{response}</Markdown>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-zinc-600">Generated by Gemini · Codeify AI</span>
                  <div className="flex items-center gap-1 text-[11px] text-violet-400">
                    <Sparkles size={10} /><span>Senior Dev Review</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;