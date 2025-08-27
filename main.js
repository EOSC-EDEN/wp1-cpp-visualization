import {
  classifications,
  relationTypes,
  logicalClusterInfo,
  oaisClusterInfo,
} from "./js/config.js";
import {
  createMarkers,
  createClusters,
  createEdges,
  createNodes,
} from "./js/svg-creator.js";
import {
  generateAndGroupEdges,
  runClusterLayout,
  runNodeLayout,
} from "./js/graph-layout.js";
import { updateSVGPositions, centerAndZoom } from "./js/graph-renderer.js";
import { initializeInteractions } from "./js/interaction.js";
import {
  initializeClassificationSelector,
  initializeCategoryFilters,
  initializeRelationFilters,
  initializeGlobalFilters,
  initializeViewSelector,
} from "./js/ui-builder.js";
import { applyCombinedFilter } from "./js/filter.js";
import { initializeGridView, renderGridView } from "./js/grid-view.js";

// --- GLOBAL STATE ---
let allNodesData = [];
let allRelationsData = {};
let allCppLinks = {};
let currentView = "graph"; // 'graph' or 'grid'
let currentClassification = "logical";
let lastSelectedNodeId = null; // Store selection across re-renders

// --- DOM ELEMENTS ---
const topFilterBar = document.getElementById("top-filter-bar");
const sideFilterBar = document.getElementById("side-filter-bar");
const svgContainer = document.getElementById("svg-container");
const gridContainer = document.getElementById("grid-container");
const popupContainer = document.getElementById("grid-popup-container");
const popupList = document.getElementById("grid-popup-list");
const popupCloseButton = document.getElementById("grid-popup-close");
const popupTitle = document.getElementById("grid-popup-title");

function updateVisibleCounts(allEdges) {
  const counts = {};
  let totalVisible = 0;

  for (const type in relationTypes) {
    counts[type] = 0;
  }

  allEdges.forEach((edge) => {
    if (
      edge.groupElement &&
      !edge.groupElement.hasAttribute("data-filtered-out")
    ) {
      counts[edge.type]++;
      totalVisible++;
    }
  });

  for (const type in counts) {
    const countEl = document.querySelector(`[data-count-for="${type}"]`);
    if (countEl) {
      countEl.textContent = ` (${counts[type]})`;
    }
  }

  const totalEl = document.getElementById("total-relations-count");
  if (totalEl) {
    totalEl.textContent = totalVisible;
  }
}

function adjustLayout(topBar, sideBar) {
  const newHeight = topBar.offsetHeight;
  document.body.style.paddingTop = `${newHeight}px`;
  sideBar.style.top = `${newHeight}px`;
  sideBar.style.height = `calc(100% - ${newHeight}px)`;
}

// --- GRAPH VIEW FUNCTION ---
function renderGraphView(classificationKey) {
  const svg = document.getElementById("cpp-diagram");
  svg.classList.remove("graph--dimmed");

  document.getElementById("viewport").innerHTML = `
    <defs id="arrow-defs"></defs>
    <g id="clusters"></g>
    <g id="edges"></g>
    <g id="edge-labels"></g>
    <g id="nodes"></g>
    <g id="cluster-labels"></g>
    <g id="highlighted-edges"></g>
    <g id="highlighted-edge-labels"></g>
  `;
  topFilterBar
    .querySelectorAll(".filter-group, .global-filter-container")
    .forEach((el) => el.remove());
  sideFilterBar.innerHTML = "";

  const nodesGroup = document.getElementById("nodes");
  const edgesGroup = document.getElementById("edges");
  const edgeLabelsGroup = document.getElementById("edge-labels");
  const clustersGroup = document.getElementById("clusters");
  const clusterLabelsGroup = document.getElementById("cluster-labels");
  const defs = document.getElementById("arrow-defs");

  const classificationConfig = classifications[classificationKey];
  const clusterInfo = { ...classificationConfig.info };
  const clusterKey = classificationConfig.key;

  allNodesData.forEach((node) => {
    node.cluster = node[clusterKey];
  });

  Object.values(logicalClusterInfo).forEach((c) => {
    delete c.nodes;
    delete c.cx;
  });
  Object.values(oaisClusterInfo).forEach((c) => {
    delete c.nodes;
    delete c.cx;
  });

  const nodeMap = new Map(allNodesData.map((n) => [n.id, n]));
  const { allEdges: edgeMap, parallelEdgeGroups } = generateAndGroupEdges(
    allRelationsData,
    nodeMap,
  );

  createMarkers(defs);
  createClusters(clusterInfo, allNodesData, clustersGroup, clusterLabelsGroup);
  createNodes(allNodesData, nodesGroup, allCppLinks);
  createEdges(edgeMap, edgesGroup, edgeLabelsGroup);

  runClusterLayout(clusterInfo, edgeMap);
  runNodeLayout(clusterInfo);
  updateSVGPositions(allNodesData, parallelEdgeGroups, clusterInfo);
  const viewBox = centerAndZoom(svg, clusterInfo);

  let activeCategoryIds = new Set(Object.keys(clusterInfo));
  let activeRelationTypeIds = new Set(Object.keys(relationTypes));
  let globalOptions = { isStrictScope: false };

  const appState = { svg, svgContainer, nodeMap, edgeMap, viewBox };

  const onSelectionChange = (nodeId) => {
    lastSelectedNodeId = nodeId;
  };

  const interactions = initializeInteractions(appState, onSelectionChange);

  function updateGraphVisibility() {
    applyCombinedFilter(
      allNodesData,
      edgeMap,
      activeCategoryIds,
      activeRelationTypeIds,
      globalOptions.isStrictScope,
    );
    updateVisibleCounts(edgeMap);
    if (interactions && interactions.updatePopupsOnFilterChange) {
      interactions.updatePopupsOnFilterChange();
    }
  }

  initializeCategoryFilters(clusterInfo, (updatedIds) => {
    activeCategoryIds = updatedIds;
    updateGraphVisibility();
  });

  initializeRelationFilters(relationTypes, (updatedIds) => {
    activeRelationTypeIds = updatedIds;
    updateGraphVisibility();
  });

  initializeGlobalFilters((updatedOptions) => {
    globalOptions = updatedOptions;
    updateGraphVisibility();
  });

  adjustLayout(topFilterBar, sideFilterBar);
  updateGraphVisibility();

  if (lastSelectedNodeId) {
    const nodeToReselect = nodeMap.get(lastSelectedNodeId);
    if (nodeToReselect) {
      interactions.selectNode(nodeToReselect);
    }
  }
}

// --- MAIN RENDER CONTROLLER ---
function render() {
  const classificationSelector = document.getElementById(
    "classification-selector",
  )?.parentElement;
  const sideFilter = document.getElementById("side-filter-bar");
  const topFilters = topFilterBar.querySelectorAll(
    ".filter-group, .global-filter-container",
  );

  if (currentView === "graph") {
    svgContainer.style.display = "block";
    gridContainer.style.display = "none";
    if (sideFilter) sideFilter.style.display = "block";
    if (classificationSelector) classificationSelector.style.display = "flex";
    topFilters.forEach((el) => (el.style.display = "flex"));
    renderGraphView(currentClassification);
  } else if (currentView === "grid") {
    svgContainer.style.display = "none";
    gridContainer.style.display = "block";
    if (sideFilter) sideFilter.style.display = "none";
    if (classificationSelector) classificationSelector.style.display = "none";
    topFilters.forEach((el) => (el.style.display = "none"));
    topFilterBar
      .querySelectorAll(".filter-group, .global-filter-container")
      .forEach((el) => el.remove());
    renderGridView(gridContainer, allNodesData, allRelationsData);
  }
  adjustLayout(topFilterBar, sideFilterBar);
}

// --- INITIALIZATION ---
async function init() {
  const [nodesResponse, relationsResponse, linksResponse] = await Promise.all([
    fetch("nodes.json"),
    fetch("relations.json"),
    fetch("cpp-links.json"),
  ]);

  if (!nodesResponse.ok) console.error("Failed to load nodes.json");
  if (!relationsResponse.ok) console.error("Failed to load relations.json");
  if (!linksResponse.ok) console.error("Failed to load cpp-links.json");

  allNodesData = await nodesResponse.json();
  allRelationsData = await relationsResponse.json();
  allCppLinks = await linksResponse.json();

  // Setup UI selectors
  initializeViewSelector((newView) => {
    currentView = newView;
    render();
  });

  initializeClassificationSelector(classifications, (newClassification) => {
    currentClassification = newClassification;
    if (currentView === "graph") {
      render();
    }
  });

  // Initialize the grid view module with its dependencies
  initializeGridView({
    popupContainerEl: popupContainer,
    popupListEl: popupList,
    popupTitleEl: popupTitle,
    cppLinksData: allCppLinks,
  });

  // Setup popup listeners
  popupCloseButton.addEventListener("click", () => {
    popupContainer.classList.add("grid-popup-hidden");
  });
  popupContainer.addEventListener("click", (e) => {
    if (e.target === popupContainer) {
      popupContainer.classList.add("grid-popup-hidden");
    }
  });

  const observer = new ResizeObserver(() =>
    adjustLayout(topFilterBar, sideFilterBar),
  );
  observer.observe(topFilterBar);

  render(); // Initial render
}

init();