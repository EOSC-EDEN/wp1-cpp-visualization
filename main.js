// main.js

import { classifications, relationTypes, logicalClusterInfo, oaisClusterInfo } from "./js/config.js";
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
} from "./js/ui-builder.js";
import { applyCombinedFilter } from "./js/filter.js";

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

async function init() {
  const [nodesResponse, relationsResponse, linksResponse] = await Promise.all([
    fetch("nodes.json"),
    fetch("relations.json"),
    fetch("cpp-links.json"),
  ]);

  if (!nodesResponse.ok) console.error("Failed to load nodes.json");
  if (!relationsResponse.ok) console.error("Failed to load relations.json");
  if (!linksResponse.ok) console.error("Failed to load cpp-links.json");

  const nodesData = await nodesResponse.json();
  const relationsData = await relationsResponse.json();
  const cppLinks = await linksResponse.json();

  const nodeMap = new Map(nodesData.map((n) => [n.id, n]));
  const { allEdges: edgeMap, parallelEdgeGroups } = generateAndGroupEdges(
    relationsData,
    nodeMap,
  );

  const topFilterBar = document.getElementById("top-filter-bar");
  const sideFilterBar = document.getElementById("side-filter-bar");

  initializeClassificationSelector(classifications, renderGraph);

  const observer = new ResizeObserver(() =>
    adjustLayout(topFilterBar, sideFilterBar),
  );
  observer.observe(topFilterBar);

  function renderGraph(classificationKey) {
    const svg = document.getElementById("cpp-diagram");
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

    const svgContainer = document.getElementById("svg-container");
    const nodesGroup = document.getElementById("nodes");
    const edgesGroup = document.getElementById("edges");
    const edgeLabelsGroup = document.getElementById("edge-labels");
    const clustersGroup = document.getElementById("clusters");
    const clusterLabelsGroup = document.getElementById("cluster-labels");
    const defs = document.getElementById("arrow-defs");

    const classificationConfig = classifications[classificationKey];
    const clusterInfo = classificationConfig.info;
    const clusterKey = classificationConfig.key;

    nodesData.forEach((node) => {
      node.cluster = node[clusterKey];
    });

    Object.values(logicalClusterInfo).forEach(c => { delete c.nodes; delete c.cx; });
    Object.values(oaisClusterInfo).forEach(c => { delete c.nodes; delete c.cx; });

    createMarkers(defs);
    createClusters(clusterInfo, nodesData, clustersGroup, clusterLabelsGroup);
    createNodes(nodesData, nodesGroup, cppLinks);
    createEdges(edgeMap, edgesGroup, edgeLabelsGroup);

    runClusterLayout(clusterInfo, edgeMap);
    runNodeLayout(clusterInfo);
    updateSVGPositions(nodesData, parallelEdgeGroups, clusterInfo);
    const viewBox = centerAndZoom(svg, clusterInfo);

    let activeCategoryIds = new Set(Object.keys(clusterInfo));
    let activeRelationTypeIds = new Set(Object.keys(relationTypes));
    let globalOptions = { isStrictScope: false };

    const appState = { svg, svgContainer, nodeMap, edgeMap, viewBox };
    const interactions = initializeInteractions(appState);

    function updateGraphVisibility() {
      applyCombinedFilter(
        nodesData,
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
  }

  renderGraph("logical");
}

init();