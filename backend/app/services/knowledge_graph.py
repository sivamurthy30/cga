"""
System 2: Semantic Knowledge Graph
- Skills as Nodes, relationships as weighted Edges
- Backtrace: given a failed assessment, walk the graph backwards to find root gaps
"""

from __future__ import annotations
from typing import Dict, List, Optional, Tuple
import json
import os


# ---------------------------------------------------------------------------
# Graph definition
# ---------------------------------------------------------------------------

# Edge format: { "from": skill, "to": skill, "weight": 0-1, "type": str }
# weight = prerequisite strength (1.0 = hard prerequisite, 0.3 = helpful)
# type   = "prerequisite" | "related" | "extends"

SKILL_GRAPH: Dict[str, List[Dict]] = {
    # JavaScript ecosystem
    "JavaScript": [
        {"to": "HTML", "weight": 0.9, "type": "prerequisite"},
        {"to": "CSS",  "weight": 0.7, "type": "prerequisite"},
    ],
    "JavaScript Closures": [
        {"to": "JavaScript", "weight": 1.0, "type": "prerequisite"},
    ],
    "JavaScript Promises": [
        {"to": "JavaScript", "weight": 1.0, "type": "prerequisite"},
        {"to": "JavaScript Closures", "weight": 0.6, "type": "prerequisite"},
    ],
    "TypeScript": [
        {"to": "JavaScript", "weight": 0.95, "type": "prerequisite"},
    ],
    "React": [
        {"to": "JavaScript", "weight": 0.9, "type": "prerequisite"},
        {"to": "JavaScript Closures", "weight": 0.8, "type": "prerequisite"},
        {"to": "HTML", "weight": 0.7, "type": "prerequisite"},
        {"to": "CSS",  "weight": 0.6, "type": "prerequisite"},
    ],
    "Next.js": [
        {"to": "React", "weight": 1.0, "type": "prerequisite"},
        {"to": "TypeScript", "weight": 0.5, "type": "related"},
    ],
    "Redux": [
        {"to": "React", "weight": 0.9, "type": "prerequisite"},
        {"to": "JavaScript Closures", "weight": 0.7, "type": "prerequisite"},
    ],
    # Python ecosystem
    "Python": [],
    "Python OOP": [
        {"to": "Python", "weight": 1.0, "type": "prerequisite"},
    ],
    "Python Decorators": [
        {"to": "Python OOP", "weight": 0.8, "type": "prerequisite"},
        {"to": "JavaScript Closures", "weight": 0.3, "type": "related"},
    ],
    "FastAPI": [
        {"to": "Python", "weight": 1.0, "type": "prerequisite"},
        {"to": "REST APIs", "weight": 0.8, "type": "prerequisite"},
        {"to": "Python OOP", "weight": 0.6, "type": "prerequisite"},
    ],
    "Django": [
        {"to": "Python OOP", "weight": 0.9, "type": "prerequisite"},
        {"to": "SQL", "weight": 0.7, "type": "prerequisite"},
    ],
    # Data / ML
    "Pandas": [
        {"to": "Python", "weight": 1.0, "type": "prerequisite"},
    ],
    "NumPy": [
        {"to": "Python", "weight": 1.0, "type": "prerequisite"},
    ],
    "Machine Learning": [
        {"to": "Python", "weight": 0.9, "type": "prerequisite"},
        {"to": "NumPy", "weight": 0.8, "type": "prerequisite"},
        {"to": "Pandas", "weight": 0.8, "type": "prerequisite"},
        {"to": "Statistics", "weight": 0.7, "type": "prerequisite"},
    ],
    "Deep Learning": [
        {"to": "Machine Learning", "weight": 1.0, "type": "prerequisite"},
        {"to": "Linear Algebra", "weight": 0.8, "type": "prerequisite"},
    ],
    "TensorFlow": [
        {"to": "Deep Learning", "weight": 0.9, "type": "prerequisite"},
        {"to": "Python", "weight": 1.0, "type": "prerequisite"},
    ],
    "PyTorch": [
        {"to": "Deep Learning", "weight": 0.9, "type": "prerequisite"},
        {"to": "Python", "weight": 1.0, "type": "prerequisite"},
    ],
    # Infrastructure
    "Docker": [
        {"to": "Linux", "weight": 0.7, "type": "prerequisite"},
    ],
    "Kubernetes": [
        {"to": "Docker", "weight": 1.0, "type": "prerequisite"},
        {"to": "Linux", "weight": 0.8, "type": "prerequisite"},
        {"to": "Networking", "weight": 0.6, "type": "prerequisite"},
    ],
    "CI/CD": [
        {"to": "Git", "weight": 0.9, "type": "prerequisite"},
        {"to": "Docker", "weight": 0.7, "type": "related"},
    ],
    "AWS": [
        {"to": "Linux", "weight": 0.7, "type": "prerequisite"},
        {"to": "Networking", "weight": 0.6, "type": "prerequisite"},
    ],
    # Databases
    "SQL": [],
    "PostgreSQL": [
        {"to": "SQL", "weight": 1.0, "type": "prerequisite"},
    ],
    "MongoDB": [
        {"to": "JSON", "weight": 0.7, "type": "prerequisite"},
    ],
    "Redis": [
        {"to": "Data Structures", "weight": 0.6, "type": "prerequisite"},
    ],
    # Fundamentals
    "Data Structures": [],
    "Algorithms": [
        {"to": "Data Structures", "weight": 0.9, "type": "prerequisite"},
    ],
    "System Design": [
        {"to": "Algorithms", "weight": 0.7, "type": "prerequisite"},
        {"to": "Networking", "weight": 0.7, "type": "prerequisite"},
        {"to": "SQL", "weight": 0.6, "type": "prerequisite"},
    ],
    "REST APIs": [
        {"to": "HTTP", "weight": 0.9, "type": "prerequisite"},
        {"to": "JSON", "weight": 0.8, "type": "prerequisite"},
    ],
    "GraphQL": [
        {"to": "REST APIs", "weight": 0.7, "type": "prerequisite"},
        {"to": "JavaScript", "weight": 0.6, "type": "related"},
    ],
    # Misc
    "Git": [],
    "Linux": [],
    "Networking": [],
    "HTTP": [],
    "JSON": [],
    "HTML": [],
    "CSS": [],
    "Statistics": [],
    "Linear Algebra": [],
    "Node.js": [
        {"to": "JavaScript", "weight": 1.0, "type": "prerequisite"},
    ],
}


# ---------------------------------------------------------------------------
# Graph service
# ---------------------------------------------------------------------------

class KnowledgeGraph:
    """
    Directed prerequisite graph.
    Nodes = skills.  Edges = prerequisite relationships with weights.
    """

    def __init__(self):
        self.graph = SKILL_GRAPH
        # Build reverse index: skill -> list of skills that require it
        self._reverse: Dict[str, List[str]] = {}
        for skill, edges in self.graph.items():
            for edge in edges:
                dep = edge["to"]
                self._reverse.setdefault(dep, [])
                if skill not in self._reverse[dep]:
                    self._reverse[dep].append(skill)

    # ------------------------------------------------------------------
    # Core queries
    # ------------------------------------------------------------------

    def get_prerequisites(self, skill: str, min_weight: float = 0.5) -> List[Dict]:
        """Return direct prerequisites above min_weight."""
        return [
            e for e in self.graph.get(skill, [])
            if e["weight"] >= min_weight
        ]

    def get_dependents(self, skill: str) -> List[str]:
        """Return skills that directly depend on this skill."""
        return self._reverse.get(skill, [])

    # ------------------------------------------------------------------
    # Backtrace: find root gaps after a failed assessment
    # ------------------------------------------------------------------

    def backtrace(
        self,
        failed_skill: str,
        known_skills: List[str],
        depth: int = 4,
    ) -> Dict:
        """
        Walk the prerequisite graph backwards from `failed_skill`.
        Returns the ordered list of foundational gaps the user is missing.

        Algorithm:
          BFS from failed_skill following prerequisite edges.
          A node is a "gap" if it is NOT in known_skills.
          Stop at `depth` hops or when all prerequisites are known.
        """
        known_lower = {s.lower() for s in known_skills}
        visited: set = set()
        gaps: List[Dict] = []
        queue: List[Tuple[str, int, float]] = [(failed_skill, 0, 1.0)]

        while queue:
            current, level, cumulative_weight = queue.pop(0)
            if current in visited or level > depth:
                continue
            visited.add(current)

            prereqs = self.get_prerequisites(current, min_weight=0.4)
            for edge in prereqs:
                dep = edge["to"]
                if dep in visited:
                    continue
                combined_weight = cumulative_weight * edge["weight"]
                is_gap = dep.lower() not in known_lower
                if is_gap:
                    gaps.append({
                        "skill": dep,
                        "missing_from": current,
                        "edge_weight": edge["weight"],
                        "cumulative_weight": round(combined_weight, 3),
                        "depth": level + 1,
                        "type": edge["type"],
                    })
                queue.append((dep, level + 1, combined_weight))

        # Sort by cumulative weight descending (most critical first)
        gaps.sort(key=lambda x: x["cumulative_weight"], reverse=True)

        return {
            "failed_skill": failed_skill,
            "root_gaps": gaps,
            "total_gaps": len(gaps),
            "learning_order": self._topological_order(
                [g["skill"] for g in gaps] + [failed_skill]
            ),
            "message": (
                f"To master '{failed_skill}', focus on these {len(gaps)} foundational gaps first."
                if gaps else
                f"No prerequisite gaps found for '{failed_skill}'. Review the skill content directly."
            ),
        }

    def _topological_order(self, skills: List[str]) -> List[str]:
        """Return skills in suggested learning order (prerequisites first)."""
        skill_set = set(skills)
        in_degree: Dict[str, int] = {s: 0 for s in skill_set}

        for skill in skill_set:
            for edge in self.graph.get(skill, []):
                if edge["to"] in skill_set:
                    in_degree[skill] += 1

        queue = [s for s, d in in_degree.items() if d == 0]
        order: List[str] = []
        while queue:
            node = queue.pop(0)
            order.append(node)
            for dependent in self.get_dependents(node):
                if dependent in skill_set:
                    in_degree[dependent] -= 1
                    if in_degree[dependent] == 0:
                        queue.append(dependent)

        # Append any remaining (cycles)
        for s in skill_set:
            if s not in order:
                order.append(s)
        return order

    # ------------------------------------------------------------------
    # Skill info
    # ------------------------------------------------------------------

    def get_skill_info(self, skill: str) -> Dict:
        prereqs = self.get_prerequisites(skill)
        dependents = self.get_dependents(skill)
        return {
            "skill": skill,
            "prerequisites": prereqs,
            "dependents": dependents,
            "in_graph": skill in self.graph,
        }

    def all_skills(self) -> List[str]:
        return list(self.graph.keys())


# Singleton
_kg_instance: Optional[KnowledgeGraph] = None

def get_knowledge_graph() -> KnowledgeGraph:
    global _kg_instance
    if _kg_instance is None:
        _kg_instance = KnowledgeGraph()
    return _kg_instance
