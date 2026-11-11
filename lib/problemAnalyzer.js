// lib/problemAnalyzer.js
// Lightweight rule-based analyzer. Replace or extend with AI call (OpenAI) for better results.

export default function analyzeProblem(text) {
  const t = text.toLowerCase();

  // Basic category detection
  const electricityKeywords = ["light", "switch", "wire", "electric", "spark", "fan", "socket", "bulb", "short", "circuit"];
  const plumbingKeywords = ["leak", "water", "pipe", "drain", "sink", "tap", "toilet", "flush", "seep", "faucet"];
  const carpentryKeywords = ["door", "hinge", "wood", "table", "cabinet", "carpenter", "shelf"];
  const hvacKeywords = ["ac", "a/c", "air conditioner", "cooling", "fan", "compressor"];
  const cleaningKeywords = ["clean", "sweep", "mop", "stain", "cleaner"];

  // helpers
  const containsAny = (arr) => arr.some(k => t.includes(k));

  let category = "General";
  if (containsAny(electricityKeywords)) category = "Electrician";
  else if (containsAny(plumbingKeywords)) category = "Plumber";
  else if (containsAny(carpentryKeywords)) category = "Carpenter";
  else if (containsAny(hvacKeywords)) category = "HVAC";
  else if (containsAny(cleaningKeywords)) category = "Cleaner";

  // Simple diagnosis rules and components
  const components = [];
  const possibleCauses = [];
  let actionPlan = "";

  if (category === "Electrician") {
    if (t.includes("fan")) {
      possibleCauses.push("Capacitor failure", "Worn bearings", "Start winding fault");
      components.push(
        { name: "Fan Capacitor", note: "Start/run capacitor for ceiling fan", minPrice: 250, description: "Commonly required when fan hums but doesn't spin." },
        { name: "Fan Bearing / Motor Repair", note: "Labor/repair or bearing set", minPrice: 400, description: "If fan is noisy or has stuck rotor; may be repair only." }
      );
      actionPlan = "Inspect capacitor and motor. Replace capacitor if faulty. If motor bearings are worn, repair or replace motor.";
    } else if (t.includes("switch") || t.includes("spar")) {
      possibleCauses.push("Loose wiring", "Worn switch", "Short circuit");
      components.push(
        { name: "Single-pole Switch", note: "Standard wall switch", minPrice: 80, description: "Replace worn/broken switch." },
        { name: "Insulated Wiring (per meter)", note: "2-core / 3-core wiring", minPrice: 60, description: "Used if wires are damaged; price per meter." }
      );
      actionPlan = "Turn off power, inspect switch and wiring. Replace switch and repair wiring. Test circuits with multimeter.";
    } else {
      possibleCauses.push("Loose connection", "Blown fuse", "Device fault");
      components.push(
        { name: "Fuse / MCB", note: "Circuit protection", minPrice: 150, description: "Replace blown fuse or damaged MCB if needed." },
        { name: "Multimeter Check", note: "Diagnostic tool (labor)", minPrice: 200, description: "Used by electrician to test voltage and continuity." }
      );
      actionPlan = "Perform voltage & continuity checks, tighten connections, replace protective fuse/MCB if required.";
    }
  } else if (category === "Plumber") {
    if (t.includes("leak") || t.includes("sink") || t.includes("trap")) {
      possibleCauses.push("Worn washer", "Loose joint", "Cracked pipe");
      components.push(
        { name: "Rubber Washer / Gasket", note: "For tap/trap leaks", minPrice: 40, description: "Cheap and often fixes minor leaks." },
        { name: "PVC Pipe / Connector", note: "Replacement pipe or elbow", minPrice: 150, description: "Used when pipe section is damaged." },
        { name: "Plumber's Putty / Sealant", note: "Sealing joints", minPrice: 80, description: "Used to seal threaded joints and fixtures." }
      );
      actionPlan = "Locate leak source. Tighten or replace washers/gaskets. Cut and replace damaged pipe sections and reseal joints.";
    } else {
      possibleCauses.push("Clog", "Blocked drain");
      components.push(
        { name: "Drain Snake / Auger (service)", note: "Clearing block", minPrice: 250, description: "Used for clogs deep in drainage lines." },
        { name: "Drain Cleaner (chemical)", note: "As last resort", minPrice: 120, description: "Use cautiously; may damage old pipes." }
      );
      actionPlan = "Inspect drain flow, try mechanical clearing first, then chemical if safe. Replace worn trap parts if needed.";
    }
  } else if (category === "Carpenter") {
    possibleCauses.push("Loose hinge", "Warped wood", "Wear and tear");
    components.push(
      { name: "Hinge Set", note: "Door hinge / screws", minPrice: 60, description: "Replace rusted or stripped hinges." },
      { name: "Wood Screws / Dowels", note: "Fasteners", minPrice: 30, description: "Used to secure furniture or doors." },
      { name: "Wood Glue", note: "For joints", minPrice: 120, description: "Used to fix small cracks or join pieces." }
    );
    actionPlan = "Inspect joinery and hinges. Tighten or replace hardware. Repair or reinforce weakened wood joints.";
  } else if (category === "HVAC") {
    possibleCauses.push("Dirty filter", "Compressor issue", "Low refrigerant");
    components.push(
      { name: "AC Filter (standard)", note: "Replaceable filter", minPrice: 400, description: "Cleaning or replacement of clogged filters." },
      { name: "Refrigerant top-up (service)", note: "R134a / R32 etc.", minPrice: 1200, description: "Only by certified technician." }
    );
    actionPlan = "Check filters and drains, test compressor operation, and measure refrigerant pressure. Clean or replace filters and call for refrigerant service if needed.";
  } else if (category === "Cleaner") {
    possibleCauses.push("Stain", "General dirt");
    components.push(
      { name: "All-purpose Cleaner", note: "Cleaning liquid", minPrice: 120, description: "Suitable for many surfaces." },
      { name: "Microfiber Cloth Set", note: "For polishing", minPrice: 150, description: "Reusable cloths for cleaning." }
    );
    actionPlan = "Assess surface/ stain. Apply suitable cleaning agent and mechanical action. Seal if required.";
  } else {
    possibleCauses.push("Unknown issue; needs inspection");
    components.push(
      { name: "Diagnostic Visit (labor)", note: "Initial inspection", minPrice: 200, description: "Technician visit to inspect and give exact quote." }
    );
    actionPlan = "Schedule an inspection so the worker can identify the exact cause and provide a final estimate.";
  }

  // Small heuristic: if user mentions brand/model numbers, add note to inspect manual
  if (/model|brand|series|make/i.test(text)) {
    actionPlan += " Also check device brand/model for specific parts compatibility.";
  }

  return {
    category,
    possibleCauses,
    components,
    actionPlan
  };
}
