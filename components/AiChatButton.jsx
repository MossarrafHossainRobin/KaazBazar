"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minimize2, Send, Move, Zap, Wrench, Sprout, Hammer, DollarSign, UserCheck, Receipt } from "lucide-react";

// --- SIMULATED AI LOGIC (Expanded Dataset) ---
const getAIResponse = (input) => {
  const problem = input.toLowerCase().trim();

  // --- Mock Data Set for Advanced Scenarios ---
  const scenarios = [
    {
      keywords: ["fan", "noise", "hum", "doesn't spin"],
      category: "Electrical & Ceiling Fan Repair",
      icon: <Zap className="w-5 h-5 text-red-500" />,
      possibleCauses: ["Failed Capacitor", "Stuck/Worn Motor Bearing", "Blade Imbalance"],
      actionPlan: "Turn off breaker! Check the fan's pull chain/remote. For hum: replace the capacitor (easy). For noise: lubricate bearings or replace the motor/fan assembly. Balance blades if wobbling.",
      components: [
        { name: "Fan Capacitor Kit", note: "Common fix for hum", minPrice: 350, description: "A starter capacitor rated for the fan's motor (check V/uF).", image: "" },
        { name: "Motor Lubricant", note: "For sticky bearings", minPrice: 150, description: "Small bottle of specialized motor oil." },
      ]
    },
    {
      keywords: ["switch", "spark", "hot", "smell burn"],
      category: "Electrical Hazard & Switch Replacement",
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      possibleCauses: ["Loose Wire Connection", "Overload on Circuit", "Worn/Defective Switch Mechanism"],
      actionPlan: "IMMEDIATELY turn off the circuit breaker! Do not use the switch. Inspect the junction box for loose or burnt wires. Replace the switch and ensure connections are secure.",
      components: [
        { name: "15A Single Pole Switch", note: "Standard wall switch", minPrice: 180, description: "A high-quality, 15-amp rated toggle or rocker switch." },
        { name: "Wire Connectors (Wago/Twist)", note: "Secure wire joints", minPrice: 20, description: "Standard connectors for pigtailing/joining wires." },
      ]
    },
    {
      keywords: ["leak", "drip", "wet", "trap", "pipe"],
      category: "Plumbing Leak Diagnostics",
      icon: <Wrench className="w-5 h-5 text-blue-500" />,
      possibleCauses: ["Loose P-Trap Nut/Seal", "Corroded/Pinhole Pipe", "Worn Faucet Washer/Cartridge"],
      actionPlan: "Locate the source. Tighten accessible connections (P-trap nuts). Use pipe sealant or replace seals/washers. If the pipe is cracked, you need a patch or replacement section.",
      components: [
        { name: "P-Trap Washer Set", note: "For under sink leaks", minPrice: 60, description: "Various sized rubber washers for drain traps." },
        { name: "PTFE Plumber's Tape", note: "For threaded joints", minPrice: 30, description: "Seals threads to prevent minor leakage." },
      ]
    },
    {
      keywords: ["clog", "block", "toilet", "slow drain", "overflow"],
      category: "Plumbing Blockage Removal",
      icon: <Wrench className="w-5 h-5 text-blue-700" />,
      possibleCauses: ["Foreign object (toilet)", "Hair/Grease buildup (sink)", "Root intrusion (main line)"],
      actionPlan: "Use a heavy-duty plunger first. For sinks, try baking soda/vinegar followed by hot water, or a chemical drain cleaner. If that fails, use a snake/auger. If multiple fixtures clog, call a professional for main line service.",
      components: [
        { name: "Flange Toilet Plunger", note: "For maximum sealing/pressure", minPrice: 350, description: "High-quality rubber plunger." },
        { name: "Drain Snake (Hand Auger)", note: "Reaches deeper clogs", minPrice: 480, description: "Flexible cable for manual clog removal." },
      ]
    },
    {
      keywords: ["hole", "crack", "dent", "wall", "drywall"],
      category: "Wall & Drywall Repair",
      icon: <Hammer className="w-5 h-5 text-gray-500" />,
      possibleCauses: ["Impact damage", "Settling cracks", "Moisture/water damage"],
      actionPlan: "For small holes: use joint compound (spackle) and sand. For large holes: cut a drywall patch, secure it, tape the seams, apply compound, sand, and paint.",
      components: [
        { name: "Spackle/Joint Compound", note: "For small dents/cracks", minPrice: 150, description: "Ready-mix wall repair compound." },
        { name: "Drywall Patch Kit", note: "For medium holes", minPrice: 280, description: "Self-adhesive mesh or metal patch." },
      ]
    },
    // --- NEW SCENARIO: Screen Repair ---
    {
      keywords: ["screen", "mesh", "torn", "hole in screen"],
      category: "Window & Door Screen Repair",
      icon: <Sprout className="w-5 h-5 text-green-700" />,
      possibleCauses: ["Pet damage", "Sun rot/brittleness", "Accidental tear"],
      actionPlan: "For small tears, use clear screen repair tape. For large or multiple tears, the mesh must be fully replaced. Remove the screen frame, pull out the old spline, roll new mesh into the frame using a new spline and a roller tool.",
      components: [
        { name: "Window Screen Repair Kit", note: "Mesh, spline, and roller tool", minPrice: 700, description: "Fiberglass mesh and vinyl spline for a 36-inch window." },
        { name: "Screen Repair Tape", note: "For quick, small fixes", minPrice: 120, description: "Adhesive patch tape for small holes." },
      ]
    }
  ];

  // Check for specialized scenarios
  const matchedScenario = scenarios.find(s => s.keywords.some(k => problem.includes(k)));

  if (matchedScenario) {
    const minTotal = matchedScenario.components.reduce((sum, c) => sum + (c.minPrice || 0), 0);
    return {
      category: matchedScenario.category,
      possibleCauses: matchedScenario.possibleCauses,
      actionPlan: matchedScenario.actionPlan,
      components: matchedScenario.components,
      icon: matchedScenario.icon,
      minTotal,
    };
  }

  // Casual greetings or non-repair text
  const greetings = ["hi", "hello", "hey", "how are you", "good morning", "good evening", "thank you", "bye"];
  if (greetings.some(g => problem.includes(g))) {
    return { plainText: "Hello! Describe your home repair issue clearly (e.g., 'faucet dripping fast', 'large hole in drywall'). I'll offer a solution and component list." };
  }

  // Default fallback
  return {
    category: "General Repair - Needs Clarification",
    icon: <Wrench className="w-5 h-5 text-gray-400" />,
    possibleCauses: ["Issue unclear / Not matched to common template"],
    actionPlan: "Ensure safety. Please provide more detail or rephrase your issue using specific keywords like 'leak', 'spark', 'clog', 'hole', or 'screen'.",
    components: [
      { name: "Basic Inspection Fee (Simulated)", note: "Professional on-site required", minPrice: 500, description: "Minimum cost for a technician to visit and diagnose the problem." }
    ]
  };
};
// --- End SIMULATED AI LOGIC ---


// --- Chat Bubble (No Change) ---
function ChatBubble({ from, text, meta, icon }) {
  const isBot = from === "bot";
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`flex ${isBot ? "flex-row" : "flex-row-reverse"} items-start gap-2 max-w-[85%]`}>
        {isBot && (
          <div className="p-2 bg-indigo-100 rounded-full text-indigo-700 mt-1">
            {icon || <MessageCircle className="w-5 h-5" />}
          </div>
        )}
        <div className={`${isBot ? "bg-white text-gray-900 border border-gray-200" : "bg-indigo-600 text-white"} max-w-full p-4 rounded-2xl shadow`}>
          <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          {meta && (
            <div className={`mt-2 text-xs font-medium ${isBot ? 'text-gray-500' : 'text-indigo-200'}`}>{meta}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Component Modal (No functional change) ---
function ComponentModal({ selectedComponent, closeComponentModal }) {
    if (!selectedComponent) return null;
    
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border-t-4 border-indigo-600"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedComponent.name}</h3>
                        <p className="text-sm text-indigo-600 font-medium mt-1">{selectedComponent.note}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-extrabold text-3xl text-green-700">৳{selectedComponent.minPrice}</div>
                        <div className="text-xs text-gray-500 mt-1">min estimated price</div>
                    </div>
                </div>
                {selectedComponent.image && <div className="my-4 text-center">{selectedComponent.image}</div>}
                <p className="mt-4 text-gray-700 leading-relaxed border-t pt-4">{selectedComponent.description || "No extra description provided."}</p>
                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={closeComponentModal} className="px-6 py-3 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors">Close</button>
                    <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg">View on Marketplace</button>
                </div>
            </motion.div>
        </div>
    );
}

// --- NEW ACTION MODAL ---
function ActionModal({ actionType, closeActionModal, analysis }) {
    if (!actionType) return null;

    const isWorker = actionType === 'worker';
    const title = isWorker ? "✅ Request Professional Worker" : "🧾 Get Final Quote";
    const subtext = isWorker 
        ? `We've scheduled a local technician to contact you about your **${analysis?.category || 'General Repair'}** issue.` 
        : `Your quote request for the components and labor for **${analysis?.category || 'General Repair'}** has been sent.`;
    const icon = isWorker ? <UserCheck className="w-8 h-8 text-green-600" /> : <Receipt className="w-8 h-8 text-yellow-600" />;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl"
            >
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{subtext}</p>
                <p className="text-xs text-indigo-500 mt-2">A representative will follow up via email/SMS shortly.</p>
                <div className="mt-6">
                    <button onClick={closeActionModal} className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Done</button>
                </div>
            </motion.div>
        </div>
    );
}


// --- Main Component ---
export default function KaazBazarAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { id: "sys1", from: "bot", text: "Hi — I'm the KaazBazar AI. Describe your repair issue clearly (e.g. 'faucet dripping fast', 'large hole in drywall'). I'll provide an action plan and component list.", icon: <Sprout className="w-5 h-5 text-green-600"/> }
  ]);
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'worker' or 'quote'
  const listRef = useRef(null);

  const lastBotAnalysis = useMemo(() => {
    // Finds the last bot message that contains a full analysis (has 'category')
    const last = [...messages].reverse().find(m => m.from === 'bot' && m.meta && m.meta.category);
    return last;
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  // --- NEW Action Handlers ---
  const handleRequestWorker = () => {
    if (lastBotAnalysis) {
        setActionModal('worker');
    } else {
        alert("Please analyze a problem first.");
    }
  };

  const handleGetQuote = () => {
    if (lastBotAnalysis) {
        setActionModal('quote');
    } else {
        alert("Please analyze a problem first.");
    }
  };

  const closeActionModal = () => setActionModal(null);
  // --- End NEW Action Handlers ---

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { id: `u${Date.now()}`, from: "user", text: trimmed };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setAnalyzing(true);

    // Simulated API call delay
    setTimeout(() => {
      const analysis = getAIResponse(trimmed);
      const now = Date.now();

      // Handle simple text responses (greetings, thanks)
      if (analysis.plainText) {
        setMessages(m => [...m, { id: `b${now}`, from: "bot", text: analysis.plainText }]);
      } else {
        // Handle full analysis response
        const botText = [
          `**${analysis.category}** Analysis:`,
          `Possible Causes: ${analysis.possibleCauses.join(", ")}`,
          `Action Plan, Components, and Cost Estimate are detailed below.`
        ].join("\n");

        const botMsg = {
          id: `b${now}`,
          from: "bot",
          text: botText,
          meta: analysis, // Store the full analysis object in meta
          icon: analysis.icon,
        };
        setMessages(m => [...m, botMsg]);
      }

      setAnalyzing(false);
    }, 800);
  };

  const viewComponent = (comp) => setSelectedComponent(comp);
  const closeComponentModal = () => setSelectedComponent(null);

  // --- Render Functions for Clean UI ---

  const renderAnalysisDetails = (analysis) => {
    if (!analysis) return null;

    return (
        <div className="mt-4 mb-8 grid grid-cols-1 gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-inner">
            <div className="bg-white rounded-lg p-3 shadow-sm">
                <h3 className="text-md font-bold text-gray-900 mb-3 border-b pb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /> Recommended Components</h3>
                {analysis.components.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div className="flex-1">
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.note}</div>
                        </div>
                        <div className="text-right ml-4 flex items-center gap-2">
                            <div className="font-bold text-lg text-indigo-600">৳{c.minPrice}</div>
                            <button onClick={() => viewComponent(c)} className="text-xs px-2 py-1 bg-gray-100 text-indigo-600 rounded hover:bg-gray-200">Details</button>
                        </div>
                    </div>
                ))}
                <div className="mt-4 pt-3 border-t text-sm">
                    <div className="flex justify-between font-bold text-lg text-indigo-800">
                        <span>MINIMUM SUBTOTAL</span>
                        <span>৳{analysis.minTotal}</span>
                    </div>
                    <div className="text-xs text-red-500 mt-1">Estimated components cost only. Does not include labor or tools.</div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                <h3 className="text-md font-bold text-gray-900 mb-3 border-b pb-2 flex items-center gap-2"><Wrench className="w-4 h-4 text-green-600" /> Action Plan</h3>
                <div className="text-sm text-gray-700 mb-4 font-medium leading-relaxed">{analysis.plan}</div>
                <div className="mt-4 space-y-2">
                    <button 
                        onClick={handleRequestWorker}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md"
                    >
                        Request Professional Worker
                    </button>
                    <button 
                        onClick={handleGetQuote}
                        className="w-full bg-yellow-500 text-gray-900 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors shadow-md"
                    >
                        Get Final Quote
                    </button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-6 py-4 rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-bold text-lg animate-pulse"
        >
          <MessageCircle className="w-6 h-6" />
          Ask KaazBazar AI
        </motion.button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            drag dragMomentum={false} dragElastic={0.05}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className="fixed bottom-6 right-6 z-50 w-[95%] sm:w-[400px] md:w-[450px] h-[550px] flex flex-col rounded-3xl shadow-2xl overflow-hidden bg-white cursor-grab"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg cursor-move">
              <h2 className="font-extrabold text-xl flex items-center gap-2"><Move className="w-5 h-5" /> KaazBazar AI</h2>
              <div className="flex gap-2">
                <button onClick={() => setMinimized(!minimized)} className="p-2 rounded-full hover:bg-white/20">
                  {minimized ? <MessageCircle className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                </button>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
            </div>

            {!minimized && (
              <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                {/* Chat Area */}
                <div ref={listRef} className="flex-1 overflow-y-auto p-4">
                  {messages.map(m => {
                    const metaText = m.meta ? `Category: ${m.meta.category} • Min cost: ৳${m.meta.minTotal}` : undefined;
                    return (
                      <div key={m.id}>
                        <ChatBubble from={m.from} text={m.text} meta={metaText} icon={m.icon} />

                        {/* Detailed analysis - only show for the most recent analysis message */}
                        {m.from === "bot" && m.meta && m.id === lastBotAnalysis?.id && (
                          renderAnalysisDetails(m.meta)
                        )}
                      </div>
                    );
                  })}
                  {analyzing && <div className="text-center py-4 text-gray-500 text-sm animate-pulse">KaazBazar AI is thinking...</div>}
                </div>

                {/* Input Area */}
                <div className="bg-white p-4 border-t border-gray-200 z-10 sticky bottom-0">
                  <div className="flex gap-3">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                      placeholder="e.g. 'fan hums', 'hole in screen', or 'faucet dripping'"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    />
                    <button 
                      onClick={handleSend} 
                      disabled={analyzing || input.trim() === ""} 
                      className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/50 flex items-center gap-1"
                    >
                      {analyzing ? "Thinking…" : "Ask"}
                      <Send className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component Detail Modal */}
      <AnimatePresence>
        {selectedComponent && <ComponentModal selectedComponent={selectedComponent} closeComponentModal={closeComponentModal} />}
      </AnimatePresence>
      
      {/* Action Modal (New) */}
      <AnimatePresence>
        {actionModal && <ActionModal actionType={actionModal} closeActionModal={closeActionModal} analysis={lastBotAnalysis?.meta} />}
      </AnimatePresence>
    </>
  );
}