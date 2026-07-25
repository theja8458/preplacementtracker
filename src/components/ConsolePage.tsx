"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Code2, Zap, Play, CheckCircle2, ChevronRight, TerminalSquare, ShieldAlert } from "lucide-react";

const LANGUAGES = [
  {
    id: "python",
    name: "Python",
    color: "bg-blue-500",
    snippet: `def greet(name):
    print(f"Hello, {name}! Welcome to Code Console.")

if __name__ == "__main__":
    greet("World")`,
  },
  {
    id: "java",
    name: "Java",
    color: "bg-red-500",
    snippet: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World! Welcome to Code Console.");
    }
}`,
  },
  {
    id: "cpp",
    name: "C++",
    color: "bg-blue-600",
    snippet: `#include <iostream>

int main() {
    std::cout << "Hello, World! Welcome to Code Console." << std::endl;
    return 0;
}`,
  },
  {
    id: "c",
    name: "C",
    color: "bg-gray-500",
    snippet: `#include <stdio.h>

int main() {
    printf("Hello, World! Welcome to Code Console.\\n");
    return 0;
}`,
  }
];

const FEATURES = [
  {
    title: "4 Languages",
    desc: "C, C++, Java, and Python support, switch anytime.",
    icon: Code2,
    color: "text-blue-400"
  },
  {
    title: "Instant Output",
    desc: "Run your code and see results immediately, no setup required.",
    icon: Zap,
    color: "text-amber-400"
  },
  {
    title: "Practice Mode",
    desc: "Test your DSA logic before submitting on LeetCode or GFG.",
    icon: TerminalSquare,
    color: "text-teal-400"
  },
  {
    title: "Fast Execution",
    desc: "Reliable, sandboxed execution powered by Judge0.",
    icon: ShieldAlert,
    color: "text-violet-400"
  }
];

export default function ConsolePage() {
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);
  const [interested, setInterested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    async function checkInterest() {
      try {
        const res = await fetch("/api/features/interest?feature=code_console");
        if (res.ok) {
          const data = await res.json();
          setInterested(data.interested);
        }
      } catch (error) {
        console.error("Failed to check interest", error);
      } finally {
        setLoading(false);
      }
    }
    checkInterest();
  }, []);

  const handleNotifyMe = async () => {
    if (interested) return;
    setNotifying(true);
    try {
      const res = await fetch("/api/features/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature: "code_console" })
      });
      if (res.ok) {
        setInterested(true);
        toast.success("You're on the list!");
      } else {
        toast.error("Failed to register interest. Try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Try again.");
    } finally {
      setNotifying(false);
    }
  };

  const handleRunClick = () => {
    toast("Code Console launches soon — this button doesn't run code yet 👀", {
      icon: "🚧"
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 mb-20">
      <div className="flex flex-col items-center text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Code Console
          </h1>
          <span className="bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            Coming Soon 🚧
          </span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#94A3B8] text-lg max-w-2xl"
        >
          Write code, run it, see the output — right in your browser. No setup, no IDE installs.
        </motion.p>
      </div>

      {/* Mock Editor Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mb-16"
      >
        <div className="absolute -top-3 -right-3 z-10 rotate-12 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-xl uppercase tracking-wider backdrop-blur-md">
          Preview
        </div>
        
        <div className="glass-card overflow-hidden border-white/10 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 pointer-events-none" />
          
          {/* Tabs */}
          <div className="flex items-center overflow-x-auto no-scrollbar border-b border-white/10 bg-black/20">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveLang(lang)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeLang.id === lang.id
                    ? "border-violet-500 text-white bg-white/5"
                    : "border-transparent text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${lang.color}`} />
                {lang.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Editor Area */}
            <div className="flex-1 bg-[#1E1E1E] p-4 min-h-[250px] relative">
              <SyntaxHighlighter
                language={activeLang.id === "cpp" || activeLang.id === "c" ? "cpp" : activeLang.id}
                style={vscDarkPlus}
                customStyle={{
                  background: "transparent",
                  margin: 0,
                  padding: 0,
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
                showLineNumbers
              >
                {activeLang.snippet}
              </SyntaxHighlighter>
              
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={handleRunClick}
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Run
                </button>
              </div>
            </div>

            {/* Output Area */}
            <div className="w-full md:w-[35%] bg-black/40 border-t md:border-t-0 md:border-l border-white/10 p-4">
              <div className="text-xs font-semibold text-[#64748B] mb-2 uppercase tracking-wider">Output</div>
              <div className="font-mono text-sm text-[#475569] italic mt-4">
                Output will appear here
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {FEATURES.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="glass-card p-6 border-white/5 hover:border-white/10 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${feat.color}`}>
              <feat.icon className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Notify Me */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col items-center justify-center text-center"
      >
        <button
          onClick={handleNotifyMe}
          disabled={interested || loading || notifying}
          className={`flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold transition-all ${
            interested
              ? "bg-teal-500/20 text-teal-400 border border-teal-500/30 cursor-default"
              : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 shadow-lg hover:shadow-cyan-500/25"
          }`}
        >
          {loading ? (
            <span className="opacity-70">Checking...</span>
          ) : interested ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              You're on the list ✓
            </>
          ) : (
            <>
              Notify me when it's live
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
