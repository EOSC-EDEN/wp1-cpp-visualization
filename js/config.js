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
  ingest: { label: "Ingest" },
  administration: { label: "Administration" },
  dataManagement: { label: "Data Management" },
  storage: { label: "Storage" },
  preservationPlanning: { label: "Preservation Planning" },
  access: { label: "Access" },
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
  // Procedural
  triggered_by: {
    color: "#33aa33",
    description: "Triggered By",
    arrow: "incoming",
  },
  triggers: {
    color: "#55cc55",
    description: "Triggers",
    arrow: "outgoing",
  },
  supplier: {
    color: "#3333aa",
    description: "Supplier",
    arrow: "incoming",
  },
  customer: {
    color: "#5555cc",
    description: "Customer",
    arrow: "outgoing",
  },
  alternative_to: {
    color: "#aaaaaa",
    description: "Alternative To",
    arrow: "outgoing", // Symmetrical
  },

  // Dependencies
  requires: {
    color: "#444444",
    description: "Requires",
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
    description: "May Be Req. By",
    arrow: "outgoing",
  },

  // Logical
  affects: {
    color: "#999999",
    description: "Affects",
    arrow: "outgoing",
  },
  affected_by: {
    color: "#999999",
    description: "Affected By",
    arrow: "incoming",
  },
  facilitates: {
    color: "#999999",
    description: "Facilitates",
    arrow: "outgoing",
  },
  facilitated_by: {
    color: "#999999",
    description: "Facilitated By",
    arrow: "incoming",
  },
  affinity_with: {
    color: "#9999ff",
    description: "Affinity",
    arrow: "outgoing", // Symmetrical
  },
  not_to_be_confused_with: {
    color: "#bb7777",
    description: "Not to be confused with",
    arrowLabel: "NTBCW", // Use this for the arrow's text
    arrow: "outgoing", // Symmetrical
  },
};