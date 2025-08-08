// js/config.js

export const clusterInfo = {
  planning: { label: "Preservation Planning" },
  dissemination: { label: "Dissemination" },
  "bit-level": { label: "Bit-level Preservation" },
  generation: { label: "Generation of New Files" },
  other: { label: "Other Activities" },
  lifecycle: { label: "Lifecycle Management" },
  characterisation: { label: "Characterisation" },
};

export const nodeRadius = 100;

// # ⚡ triggered_by
// 📦 supplier
// 📞 customer
// 🔗 dependency
// 🤝 affinity_with
// 📋 is_required_by
// 📑 may_be_required_by
// 💭 not_to_be_confused_with
// 🏣 facilitated_by
// ➡️ enables
// 🍂 is_fallback_for
// 💨 affected_by

export const relationTypes = {
  triggered_by: {
    color: "#999900",
    description: "Triggered By",
    arrow: "incoming",
  },
  supplier: {
    color: "#994400",
    description: "Supplier",
    arrow: "incoming",
  },
  dependency: {
    color: "#444",
    description: "Dependency",
    arrow: "incoming",
  },
  is_fallback_for: {
    color: "#999",
    description: "Fallback For",
    arrow: "incoming",
  },
  facilitated_by: {
    color: "#999",
    description: "Facilitated By",
    arrow: "incoming",
  },
  affected_by: {
    color: "#999",
    description: "Affected By",
    arrow: "incoming",
  },
  customer: {
    color: "#bb6600",
    description: "Customer",
    arrow: "outgoing",
  },
  enables: {
    color: "#999",
    description: "Enables",
    arrow: "outgoing",
  },
  is_required_by: {
    color: "#999",
    description: "Required By",
    arrow: "outgoing",
  },
  may_be_required_by: {
    color: "#999",
    description: "May Be Required By",
    arrow: "outgoing",
  },
  affinity_with: {
    color: "#999",
    description: "Affinity",
    arrow: "outgoing",
  },
  not_to_be_confused_with: {
    color: "#999",
    description: "Confuse not",
    arrow: "outgoing",
  },
};
