import { BrainCircuit, Sun, Moon, Sparkles } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [dark, setDark] = useState(true);

  return (
    <nav className="relative flex items-center justify-between px-10 h-[72px] bg-[#0e0e11] border-b border-white/5 overflow-hidden">
      {/* Ambient glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      {/* Left: Logo */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-violet-600/30 blur-md group-hover:blur-lg transition-all duration-300" />
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-900 shadow-lg shadow-violet-900/40">
            <BrainCircuit size={18} className="text-white" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
           <span className="text-xl font-bold tracking-tight text-white">Codelyzer</span>
          <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5 ml-1">AI</span>
        </div>
      </div>

      {/* Center: subtle tagline */}
      <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 font-medium tracking-wider uppercase">
        <Sparkles size={12} className="text-violet-500" />
        <span>Smart Code Review</span>
        <Sparkles size={12} className="text-violet-500" />
      </div>

      {/* Right: theme toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="relative group flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/8 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-200"
      >
        <div className="absolute inset-0 rounded-xl bg-violet-500/0 group-hover:bg-violet-500/5 blur-sm transition-all duration-300" />
        {dark
          ? <Sun size={16} className="text-zinc-400 group-hover:text-violet-400 transition-colors duration-200" />
          : <Moon size={16} className="text-zinc-400 group-hover:text-violet-400 transition-colors duration-200" />
        }
      </button>
    </nav>
  );
};

export default Navbar;