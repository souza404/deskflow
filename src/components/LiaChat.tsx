import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MessageSquare, Send, X, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function LiaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "lia"; text: string }[]>([
    { 
      role: "lia", 
      text: "Olá! Sou a Lia, sua assistente virtual de TI. ✨\n\nNão sabe como classificar seu chamado? Me conte o que está acontecendo e eu te ajudo a abrir o ticket correto!" 
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      let response = "Acho que isso soa como uma REQUISIÇÃO. Você deve selecionar essa opção no formulário.";
      if (userMsg.toLowerCase().includes("erro") || userMsg.toLowerCase().includes("quebrado") || userMsg.toLowerCase().includes("fora do ar")) {
        response = "Isso parece crítico! 🚨 Por favor, selecione INCIDENTE e defina a prioridade como Alta.";
      } else if (userMsg.toLowerCase().includes("lento") || userMsg.toLowerCase().includes("bug")) {
        response = "Isso pode ser um PROBLEMA que precisa de investigação mais profunda da equipe.";
      }
      setMessages((prev) => [...prev, { role: "lia", text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px]"
          >
            <GlassCard className="flex flex-col h-[500px] border-emerald-500/30 shadow-[0_10px_40px_rgba(16,185,129,0.15)] bg-zinc-950/90">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-emerald-900/20 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-zinc-950 rounded-full animate-pulse"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-md text-white tracking-wide flex items-center gap-1">
                      Lia IA <Sparkles className="w-3 h-3 text-emerald-400" />
                    </h3>
                    <p className="text-xs text-emerald-400/80 font-medium">Online e pronta para ajudar</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-zinc-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth" ref={scrollRef}>
                {messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 text-sm shadow-md whitespace-pre-wrap leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-br-sm"
                          : "bg-zinc-800/80 backdrop-blur-md text-zinc-100 border border-white/10 rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-zinc-800/80 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md flex gap-1.5 items-center h-10">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 bg-zinc-900/50 backdrop-blur-md">
                <div className="relative flex items-center">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Descreva seu problema..."
                    className="w-full h-12 pl-4 pr-12 rounded-full border border-white/10 bg-black/50 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:bg-black/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-black shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-100 border-2 border-zinc-900"></span>
          </span>
        )}
      </motion.button>
    </>
  );
}
