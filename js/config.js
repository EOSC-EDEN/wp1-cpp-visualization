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

export const relationTypes = {
  // CATEGORY 1: Dependencies
  requires: {
    color: "#444444",
    description: "Requires",
    arrow: "outgoing",
  },
  required_by: {
    color: "#444444",
    description: "Required by",
    arrow: "incoming",
  },
  may_require: {
    color: "#9a9a9a",
    description: "May require",
    arrow: "outgoing",
  },
  may_be_required_by: {
    color: "#9a9a9a",
    description: "May be required by",
    arrow: "incoming",
  },

  // CATEGORY 2: Procedural relationships
  triggers: {
    color: "#bb6600",
    description: "Triggers",
    arrow: "outgoing",
  },
  triggered_by: {
    color: "#999900",
    description: "Triggered by",
    arrow: "incoming",
  },
  may_trigger: {
    color: "#dDAA33",
    description: "May trigger",
    arrow: "outgoing",
  },
  may_be_triggered_by: {
    color: "#dDAA33",
    description: "May be triggered by",
    arrow: "incoming",
  },

  // CATEGORY 3: Logical relationships (pairs)
  affects: {
    color: "#3498db",
    description: "Affects",
    arrow: "outgoing",
  },
  affected_by: {
    color: "#3498db",
    description: "Affected by",
    arrow: "incoming",
  },
  facilitates: {
    color: "#2ecc71",
    description: "Facilitates",
    arrow: "outgoing",
  },
  facilitated_by: {
    color: "#2ecc71",
    description: "Facilitated by",
    arrow: "incoming",
  },

  // CATEGORY 4: Logical relationships (symmetrical)
  affinity_with: {
    color: "#e67e22",
    description: "Affinity with",
    arrow: "outgoing",
  },
  not_to_be_confused_with: {
    color: "#e74c3c",
    description: "Not to be confused with",
    arrow: "outgoing",
  },
  alternative_to: {
    color: "#9b59b6",
    description: "Alternative to",
    arrow: "outgoing",
  },

  // --- Legacy types from original data, kept for compatibility ---
  supplier: {
    color: "#994400",
    description: "Supplier (Legacy)",
    arrow: "incoming",
  },
  dependency: {
    color: "#444",
    description: "Dependency (Legacy)",
    arrow: "incoming",
  },
  is_fallback_for: {
    color: "#999",
    description: "Fallback For (Legacy)",
    arrow: "incoming",
  },
  customer: {
    color: "#bb6600",
    description: "Customer (Legacy)",
    arrow: "outgoing",
  },
  enables: {
    color: "#999",
    description: "Enables (Legacy)",
    arrow: "outgoing",
  },
  is_required_by: {
    color: "#999",
    description: "Required By (Legacy)",
    arrow: "outgoing",
  },
};