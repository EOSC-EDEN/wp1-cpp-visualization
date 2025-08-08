// js/filter.js

/**
 * Applies visibility attributes based on the intersection of two filter sets.
 * @param {Array} allNodes - The complete list of node data objects.
 * @param {Array} allEdges - The complete list of edge data objects.
 * @param {Set<string>} activeCategoryIds - A set of the cluster IDs that are currently checked.
 * @param {Set<string>} activeRelationTypeIds - A set of the relation types that are currently checked.
 */
export function applyCombinedFilter(
  allNodes,
  allEdges,
  activeCategoryIds,
  activeRelationTypeIds,
) {
  // Step 1: Determine the base set of nodes visible according to the category filter.
  const categoryVisibleNodeIds = new Set();
  if (activeCategoryIds.size > 0) {
    const coreNodes = new Set();
    allNodes.forEach((node) => {
      if (activeCategoryIds.has(node.cluster)) {
        coreNodes.add(node.id);
      }
    });
    coreNodes.forEach((id) => categoryVisibleNodeIds.add(id));
    allEdges.forEach((edge) => {
      if (coreNodes.has(edge.source.id)) {
        categoryVisibleNodeIds.add(edge.target.id);
      }
      if (coreNodes.has(edge.target.id)) {
        categoryVisibleNodeIds.add(edge.source.id);
      }
    });
  }

  // Step 2: Determine which edges should be visible based on BOTH filters.
  const finalVisibleEdgeIds = new Set();
  if (activeRelationTypeIds.size > 0) {
    allEdges.forEach((edge) => {
      if (
        activeRelationTypeIds.has(edge.type) &&
        categoryVisibleNodeIds.has(edge.source.id) &&
        categoryVisibleNodeIds.has(edge.target.id)
      ) {
        finalVisibleEdgeIds.add(edge.id);
      }
    });
  }

  // Step 3: A node is visible only if it's part of at least one visible edge.
  const finalVisibleNodeIds = new Set();
  allEdges.forEach((edge) => {
    if (finalVisibleEdgeIds.has(edge.id)) {
      finalVisibleNodeIds.add(edge.source.id);
      finalVisibleNodeIds.add(edge.target.id);
    }
  });

  // Step 4: Apply the `data-filtered-out` attribute to all elements.
  allNodes.forEach((node) => {
    const isVisible = finalVisibleNodeIds.has(node.id);
    if (node.element) {
      if (isVisible) {
        node.element.removeAttribute("data-filtered-out");
      } else {
        node.element.setAttribute("data-filtered-out", "true");
      }
    }
  });

  allEdges.forEach((edge) => {
    const isVisible = finalVisibleEdgeIds.has(edge.id);
    const elementsToFilter = [edge.groupElement, edge.textElement];
    elementsToFilter.forEach((element) => {
      if (element) {
        if (isVisible) {
          element.removeAttribute("data-filtered-out");
        } else {
          element.setAttribute("data-filtered-out", "true");
        }
      }
    });
  });
}
