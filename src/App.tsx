import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Terminal, 
  Play, 
  RefreshCw, 
  Code, 
  CheckCircle2, 
  AlertCircle, 
  Cpu,
  Gamepad2,
  ChevronRight,
  Download
} from 'lucide-react';
import { useOrchestrator } from './agents/Orchestrator';
import { AgentStatus } from './types/agent';

export default function App() {
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const { status, logs, plan, files, questions, startGeneration, reset } = useOrchestrator();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (questions.length > 0) {
      startGeneration(input, [input]);
    } else {
      startGeneration(input);
    }
    setInput('');
  };

  const downloadProject = () => {
    if (!files) return;
    const blob = new Blob([JSON.stringify({ ...files, plan }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan?.title || 'game'}-project.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">GameCraft <span className="text-emerald-500">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {status !== AgentStatus.IDLE && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{status}</span>
              </div>
            )}
            <button 
              onClick={reset}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Chat/Input Area */}
          <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Orchestrator Interface</span>
              <Terminal className="w-4 h-4 text-zinc-500" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {status === AgentStatus.IDLE && !plan && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <Gamepad2 className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-sm text-zinc-400">Describe the game you want to build. Be as vague or specific as you like.</p>
                </div>
              )}

              {questions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-3"
                >
                  <p className="text-sm font-medium text-emerald-400">Clarification Needed:</p>
                  <ul className="space-y-2">
                    {questions.map((q, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex gap-2">
                        <ChevronRight className="w-3 h-3 mt-0.5 text-emerald-500" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-black/40 border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={questions.length > 0 ? "Answer the questions..." : "A space shooter with upgrades..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                  disabled={status !== AgentStatus.IDLE && status !== AgentStatus.ERROR}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || (status !== AgentStatus.IDLE && status !== AgentStatus.ERROR)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Agent Logs */}
          <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden h-[400px] flex flex-col">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">System Logs</span>
              <Code className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px]">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className={`shrink-0 font-bold ${
                    log.type === 'success' ? 'text-emerald-500' : 
                    log.type === 'warning' ? 'text-amber-500' : 
                    log.type === 'error' ? 'text-red-500' : 'text-blue-400'
                  }`}>
                    [{log.agent}]
                  </span>
                  <span className="text-zinc-400">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Plan */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {files ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[824px]"
              >
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-sm font-medium">{plan?.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={downloadProject}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors border border-white/10"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-black relative group">
                  <iframe
                    title="Game Preview"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <style>${files.css}</style>
                          ${plan?.framework === 'phaser' ? '<script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>' : ''}
                        </head>
                        <body>
                          ${files.html}
                          <script>${files.js}</script>
                        </body>
                      </html>
                    `}
                    className="w-full h-full border-none"
                  />
                </div>
              </motion.div>
            ) : plan ? (
              <motion.div 
                key="plan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 rounded-3xl border border-white/5 p-8 space-y-8 h-[824px] overflow-y-auto"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-white">{plan.title}</h2>
                  <p className="text-zinc-400 leading-relaxed">{plan.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500">Mechanics</h3>
                    <ul className="space-y-2">
                      {plan.mechanics.map((m, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500">Controls</h3>
                    <div className="grid gap-2">
                      {Object.entries(plan.controls).map(([key, action]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                          <span className="text-[10px] font-bold uppercase text-zinc-500">{key}</span>
                          <span className="text-xs text-zinc-300">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500">Technical Strategy</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1">Framework</span>
                      <span className="text-sm font-medium text-zinc-200">{plan.framework}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1">Rendering</span>
                      <span className="text-sm font-medium text-zinc-200">{plan.renderingStrategy}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[824px] flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 relative">
                  <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full animate-pulse" />
                  <Play className="w-8 h-8 text-zinc-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-zinc-300">Ready for Deployment</h3>
                  <p className="text-sm text-zinc-500 max-w-xs mx-auto">Enter a game idea in the orchestrator to begin the multi-agent generation process.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
