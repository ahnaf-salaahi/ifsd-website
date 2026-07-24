import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";
import { databaseError } from "./errors";
import type { NavigationItem, NavigationNode } from "./types";

const NAVIGATION_COLUMNS =
  "id,parent_id,label,url,target,location,display_order,is_visible,created_at,updated_at,created_by,updated_by";
const PUBLIC_NAVIGATION_COLUMNS =
  "id,parent_id,label,url,target,location,display_order,is_visible";

export function buildNavigationTree(rows: NavigationItem[]): NavigationNode[] {
  const nodes = new Map<string, NavigationNode>(
    rows.map((row) => [row.id, { ...row, children: [] }]),
  );
  const roots: NavigationNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : undefined;
    if (!parent || parent.id === node.id || createsCycle(node, parent, nodes)) {
      roots.push(node);
    } else {
      parent.children.push(node);
    }
  }

  const sortNodes = (items: NavigationNode[]) => {
    items.sort(
      (a, b) =>
        a.display_order - b.display_order ||
        a.label.localeCompare(b.label) ||
        a.id.localeCompare(b.id),
    );
    items.forEach((item) => sortNodes(item.children));
  };
  sortNodes(roots);
  return roots;
}

function createsCycle(
  node: NavigationNode,
  parent: NavigationNode,
  nodes: Map<string, NavigationNode>,
) {
  const seen = new Set([node.id]);
  let current: NavigationNode | undefined = parent;
  while (current) {
    if (seen.has(current.id)) return true;
    seen.add(current.id);
    current = current.parent_id ? nodes.get(current.parent_id) : undefined;
  }
  return false;
}

export async function getAdminNavigation() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_navigation_items")
    .select(NAVIGATION_COLUMNS)
    .order("display_order")
    .order("id");
  if (error) throw databaseError("navigation.admin.list", error);
  return buildNavigationTree(data);
}

async function getPublicNavigation(location: "header" | "footer") {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_navigation_items")
    .select(PUBLIC_NAVIGATION_COLUMNS)
    .eq("location", location)
    .eq("is_visible", true)
    .order("display_order")
    .order("id")
    .limit(200);
  if (error) throw databaseError(`navigation.public.${location}`, error);
  return buildNavigationTree(data);
}

export function getPublicHeaderNavigation() {
  return getPublicNavigation("header");
}

export function getPublicFooterNavigation() {
  return getPublicNavigation("footer");
}
