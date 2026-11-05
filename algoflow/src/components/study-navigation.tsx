"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./study-ui";

const topics = [
  { id: "heap", href: "/heap-sort", label: "Heap sort", icon: "grid" },
  { id: "knapsack", href: "/knapsack", label: "0/1 Knapsack", icon: "book" },
  { id: "bfs", href: "/bfs", label: "BFS", icon: "chart" },
  { id: "dfs", href: "/dfs", label: "DFS", icon: "chart" },
] as const;

const topicCopy = {
  heap: { category: "SORTING", title: "Heap sort", accent: "step by step", description: "Follow the values through the tree. Pick the node that should move next." },
  bfs: { category: "GRAPHS", title: "Breadth-first search", accent: "layer by layer", description: "Trace the queue and choose which neighboring node should be visited next." },
  dfs: { category: "GRAPHS", title: "Depth-first search", accent: "path by path", description: "Trace the stack and choose which neighboring node should be visited next." },
  knapsack: { category: "DYNAMIC PROGRAMMING", title: "0/1 Knapsack", accent: "cell by cell", description: "Build the answer from smaller decisions instead of trying every combination." },
};

export function StudyNavigation() {
  const pathname = usePathname();
  const topic = topics.find(item => item.href === pathname)?.id ?? "heap";
  return (
<nav className="nav-list" aria-label="Study topics">
          {topics.map(item => <Link key={item.id} href={item.href} className={`nav-item ${topic === item.id ? "active" : ""}`} aria-current={topic === item.id ? "page" : undefined}><Icon name={item.icon} />{item.label}</Link>)}
        </nav>
  );
}

export function StudyHeader() {
  const pathname = usePathname();
  const topic = topics.find(item => item.href === pathname)?.id ?? "heap";
  const copy = topicCopy[topic];
  return (
    <>
<header className="topbar">
          <div><div className="breadcrumb">{copy.category} <span>/</span> {copy.title.toUpperCase()}</div><h1>{copy.title}, <em>{copy.accent}</em></h1><p>{copy.description}</p></div>
          <div className="header-actions"><button className="paper-button"><Icon name="refresh" size={16} />Reset</button><button className="ink-button"><Icon name="shuffle" size={16} />Randomize</button></div>
        </header>

        <div className="topic-tabs">
          {topics.map((item, index) => <Link key={item.id} href={item.href} className={topic === item.id ? "selected" : ""} aria-current={topic === item.id ? "page" : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</Link>)}
        </div>
    </>
  );
}
