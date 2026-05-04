import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Debounced batch sync — collects updates for 500ms then sends one request ──
const _pendingUpdates = [];
let _debounceTimer = null;

const flushToBackend = async () => {
  if (_pendingUpdates.length === 0) return;
  const token = localStorage.getItem('authToken');
  if (!token) { _pendingUpdates.length = 0; return; }
  const batch = [..._pendingUpdates];
  _pendingUpdates.length = 0;
  try {
    // Send all updates in one request
    await Promise.all(batch.map(({ roadmapId, nodeId, completed }) =>
      fetch('/api/user/roadmap/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ roadmap_id: roadmapId, node_id: nodeId, completed }),
      }).catch(() => {})
    ));
  } catch { /* silent offline */ }
};

const syncNodeToBackend = (roadmapId, nodeId, completed) => {
  _pendingUpdates.push({ roadmapId, nodeId, completed });
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(flushToBackend, 500); // debounce 500ms
};

const syncStatsToBackend = async (totalXP, badges, streak, lastCompletedDate) => {
  const token = localStorage.getItem('authToken');
  if (!token) return;
  try {
    await fetch('/api/user/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        total_xp: totalXP,
        badges,
        streak,
        last_completed_date: lastCompletedDate
      })
    });
  } catch (err) {
    console.warn('Could not sync user stats to backend:', err);
  }
};

const useRoadmapStore = create(
  persist(
    (set, get) => ({
      completedNodes: {},
      totalXP: 0,
      badges: [],
      streak: 0,
      lastCompletedDate: null,
      currentRoadmap: 'frontend-developer',

      loadFromDB: (roadmapId, completedNodeIds, stats) => {
        const completedNodes = {};
        if (completedNodeIds && completedNodeIds.length > 0) {
          completedNodes[roadmapId] = new Set(completedNodeIds);
        }
        set({
          currentRoadmap: roadmapId,
          completedNodes,
          totalXP: stats.total_xp || 0,
          badges: stats.badges || [],
          streak: stats.streak || 0,
          lastCompletedDate: stats.last_completed_date || null
        });
      },

      completeNode: (roadmapId, nodeId) => {
        const { completedNodes, totalXP, lastCompletedDate, streak } = get();

        const roadmapCompleted = new Set(completedNodes[roadmapId] || []);
        if (roadmapCompleted.has(nodeId)) return;
        roadmapCompleted.add(nodeId);

        const newXP = totalXP + 10;

        const today = new Date().toDateString();
        const lastDate = lastCompletedDate ? new Date(lastCompletedDate).toDateString() : null;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let newStreak = streak;
        if (lastDate === today) {
          newStreak = streak;
        } else if (lastDate === yesterday) {
          newStreak = streak + 1;
        } else {
          newStreak = 1;
        }

        const newLastDate = new Date().toISOString();

        set({
          completedNodes: { ...completedNodes, [roadmapId]: roadmapCompleted },
          totalXP: newXP,
          streak: newStreak,
          lastCompletedDate: newLastDate
        });

        get().checkBadges();

        const { badges } = get();
        syncNodeToBackend(roadmapId, nodeId, true);
        syncStatsToBackend(newXP, badges, newStreak, newLastDate);
      },

      uncompleteNode: (roadmapId, nodeId) => {
        const { completedNodes, totalXP, badges, streak, lastCompletedDate } = get();
        if (!completedNodes[roadmapId]) return;

        const roadmapCompleted = new Set(completedNodes[roadmapId]);
        roadmapCompleted.delete(nodeId);

        const newXP = Math.max(0, totalXP - 10);

        set({
          completedNodes: { ...completedNodes, [roadmapId]: roadmapCompleted },
          totalXP: newXP
        });

        syncNodeToBackend(roadmapId, nodeId, false);
        syncStatsToBackend(newXP, badges, streak, lastCompletedDate);
      },

      isNodeCompleted: (roadmapId, nodeId) => {
        const { completedNodes } = get();
        return completedNodes[roadmapId]?.has(nodeId) || false;
      },

      getCompletionPercentage: (roadmapId, totalNodes) => {
        const { completedNodes } = get();
        const completed = completedNodes[roadmapId]?.size || 0;
        return Math.round((completed / totalNodes) * 100);
      },

      getRecommendedNodes: (roadmapId, nodes, edges) => {
        const { completedNodes } = get();
        const completed = completedNodes[roadmapId] || new Set();

        const recommended = nodes.filter(node => {
          if (completed.has(node.id)) return false;
          const dependencies = edges.filter(edge => edge.target === node.id);
          const allDepsCompleted = dependencies.every(dep => completed.has(dep.source));
          return dependencies.length === 0 || allDepsCompleted;
        });

        return recommended.slice(0, 3);
      },

      checkBadges: () => {
        const { totalXP, badges, completedNodes } = get();
        const newBadges = [...badges];

        if (totalXP >= 100 && !badges.includes('first-100-xp')) newBadges.push('first-100-xp');
        if (totalXP >= 500 && !badges.includes('xp-master')) newBadges.push('xp-master');
        if (totalXP >= 1000 && !badges.includes('xp-legend')) newBadges.push('xp-legend');

        Object.keys(completedNodes).forEach(roadmapId => {
          const completed = completedNodes[roadmapId].size;
          if (completed >= 10 && !badges.includes(`${roadmapId}-starter`)) newBadges.push(`${roadmapId}-starter`);
          if (completed >= 50 && !badges.includes(`${roadmapId}-expert`)) newBadges.push(`${roadmapId}-expert`);
        });

        if (newBadges.length > badges.length) {
          set({ badges: newBadges });
        }
      },

      setCurrentRoadmap: (roadmapId) => set({ currentRoadmap: roadmapId }),

      resetProgress: () => {
        set({
          completedNodes: {},
          totalXP: 0,
          badges: [],
          streak: 0,
          lastCompletedDate: null
        });
      }
    }),
    {
      name: 'roadmap-storage',
      partialize: (state) => ({
        ...state,
        completedNodes: Object.fromEntries(
          Object.entries(state.completedNodes).map(([key, value]) => [
            key,
            Array.from(value)
          ])
        )
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.completedNodes = Object.fromEntries(
            Object.entries(state.completedNodes).map(([key, value]) => [
              key,
              new Set(value)
            ])
          );
        }
      }
    }
  )
);

export default useRoadmapStore;
