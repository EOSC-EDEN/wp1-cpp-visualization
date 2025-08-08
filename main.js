import { clusterInfo, relationTypes } from "./js/config.js";
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
  initializeCategoryFilters,
  initializeRelationFilters,
} from "./js/ui-builder.js";
import { applyCombinedFilter } from "./js/filter.js";

/**
 * Counts currently visible edges and updates the UI.
 * @param {Array} allEdges - The complete list of edge data objects.
 */
function updateVisibleCounts(allEdges) {
    const counts = {};
    let totalVisible = 0;

    // Initialize counts for all relation types
    for(const type in relationTypes) {
        counts[type] = 0;
    }

    // Count only the edges that are not filtered out
    allEdges.forEach(edge => {
        if (edge.groupElement && !edge.groupElement.hasAttribute('data-filtered-out')) {
            counts[edge.type]++;
            totalVisible++;
        }
    });

    // Update the UI with the new counts
    for(const type in counts) {
        const countEl = document.querySelector(`[data-count-for="${type}"]`);
        if(countEl) {
            countEl.textContent = ` (${counts[type]})`;
        }
    }

    const totalEl = document.getElementById('total-relations-count');
    if(totalEl) {
        totalEl.textContent = totalVisible;
    }
}


async function main() {
  const svg = document.getElementById("cpp-diagram");
  const svgContainer = document.getElementById("svg-container");
  const nodesGroup = document.getElementById("nodes");
  const edgesGroup = document.getElementById("edges");
  const edgeLabelsGroup = document.getElementById("edge-labels");
  const clustersGroup = document.getElementById("clusters");
  const clusterLabelsGroup = document.getElementById("cluster-labels");
  const defs = document.getElementById("arrow-defs");

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

  const appState = {
    svg,
    svgContainer,
    nodeMap,
    edgeMap,
    viewBox,
  };
  const interactions = initializeInteractions(appState);

  function updateGraphVisibility() {
    applyCombinedFilter(
      nodesData,
      edgeMap,
      activeCategoryIds,
      activeRelationTypeIds,
    );
    // After filtering, update the counts and popup state
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

  updateGraphVisibility();
}

main();