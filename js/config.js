// config.js

export const logicalClusterInfo = {
  planning: { label: "Preservation Planning" },
  dissemination: { label: "Dissemination" },
  "bit-level": { label: "Bit-level Preservation" },
  generation: { label: "Generation of New Files" },
  other: { label: "Other Activities" },
  lifecycle: { label: "Lifecycle Management" },
  characterisation: { label: "Characterisation" },
};

export const oaisClusterInfo = {
  oais_cat1: { label: "Ingest" },
  oais_cat2: { label: "Administration" },
  oais_cat3: { label: "Data Management" },
  oais_cat4: { label: "Storage" },
  oais_cat5: { label: "Preservation Planning" },
  oais_cat6: { label: "Access" },
};

export const classifications = {
  logical: {
    info: logicalClusterInfo,
    key: "logical_cluster",
    label: "Logical/Strategic",
  },
  oais: {
    info: oaisClusterInfo,
    key: "oais_cluster",
    label: "OAIS",
  },
};

export const nodeRadius = 100;

// # ⚡ triggered_by
// # 💥 triggers
// # 📦 supplier
// # 📞 customer
// # 🔗 dependency
// # 📋 required_by
// # 📑 may_be_required_by
// # 🤔 may_require
// # 💨 affected_by
// # 🌬️ affects
// # 🤝 affinity_with
// # 😵 not_to_be_confused_with
// # 🏣 facilitated_by
// # ✨ facilitates
// # 🎭 alternative_to

export const relationTypes = {
  // Procedural
  triggered_by: {
    color: "#999900",
    description: "Triggered By",
    arrow: "incoming",
  },
  triggers: {
    color: "#999900",
    description: "Triggers",
    arrow: "outgoing",
  },
  supplier: {
    color: "#994400",
    description: "Supplier",
    arrow: "incoming",
  },
  customer: {
    color: "#bb6600",
    description: "Customer",
    arrow: "outgoing",
  },
  alternative_to: {
    color: "#aaaaaa",
    description: "Alternative To",
    arrow: "outgoing", // Symmetrical
  },

  // Dependencies
  dependency: {
    color: "#444444",
    description: "Dependency",
    arrow: "incoming",
  },
  required_by: {
    color: "#444444",
    description: "Required By",
    arrow: "outgoing",
  },
  may_require: {
    color: "#888888",
    description: "May Require",
    arrow: "incoming",
  },
  may_be_required_by: {
    color: "#888888",
    description: "May Be Required By",
    arrow: "outgoing",
  },

  // Logical
  affects: {
    color: "#007799",
    description: "Affects",
    arrow: "outgoing",
  },
  affected_by: {
    color: "#007799",
    description: "Affected By",
    arrow: "incoming",
  },
  facilitates: {
    color: "#009944",
    description: "Facilitates",
    arrow: "outgoing",
  },
  facilitated_by: {
    color: "#009944",
    description: "Facilitated By",
    arrow: "incoming",
  },
  affinity_with: {
    color: "#aa88bb",
    description: "Affinity",
    arrow: "outgoing", // Symmetrical
  },
  not_to_be_confused_with: {
    color: "#cc6666",
    description: "Not to be confused with",
    arrow: "outgoing", // Symmetrical
  },
};
