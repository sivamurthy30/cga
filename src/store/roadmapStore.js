import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRoadmapStore = create(
  persist(
    (set, get) => ({
      // Progress tracking
      completedNodes: {},
      
      // User stats
      totalXP: 0,
      badges: [],
      streak: 0,
      lastCompletedDate: null,
      
      // Current roadmap
      currentRoadmap: 'frontend-developer',
      
      // Mark node as complete
      completeNode: (roadmapId, nodeId) => {
        const { completedNodes, totalXP, lastCompletedDate, streak } = get();
        
        if (!completedNodes[roadmapId]) {
          completedNodes[roadmapId] = new Set();
        }
        
        // Add to completed
        const roadmapCompleted = new Set(completedNodes[roadmapId]);
        roadmapCompleted.add(nodeId);
        
        // Calculate XP (10 XP per node)
        const newXP = totalXP + 10;
        
        // Calculate streak
        const today = new Date().toDateString();
        const lastDate = lastCompletedDate ? new Date(lastCompletedDate).toDateString() : null;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        let newStreak = streak;
        if (lastDate === today) {
          // Same day, keep streak
          newStreak = streak;
        } else if (lastDate === yesterday) {
          // Consecutive day, increment
          newStreak = streak + 1;
        } else {
          // Streak broken, reset
          newStreak = 1;
        }
        
        set({
          completedNodes: {
            ...completedNodes,
            [roadmapId]: roadmapCompleted
          },
          totalXP: newXP,
          streak: newStreak,
          lastCompletedDate: new Date().toISOString()
        });
        
        // Check for badges
        get().checkBadges();
      },
      
      // Mark node as incomplete
      uncompleteNode: (roadmapId, nodeId) => {
        const { completedNodes } = get();
        
        if (completedNodes[roadmapId]) {
          const roadmapCompleted = new Set(completedNodes[roadmapId]);
          roadmapCompleted.delete(nodeId);
          
          set({
            completedNodes: {
              ...completedNodes,
              [roadmapId]: roadmapCompleted
            }
          });
        }
      },
      
      // Check if node is completed
      isNodeCompleted: (roadmapId, nodeId) => {
        const { completedNodes } = get();
        return completedNodes[roadmapId]?.has(nodeId) || false;
      },
      
      // Get completion percentage
      getCompletionPercentage: (roadmapId, totalNodes) => {
        const { completedNodes } = get();
        const completed = completedNodes[roadmapId]?.size || 0;
        return Math.round((completed / totalNodes) * 100);
      },
      
      // Get recommended next nodes
      getRecommendedNodes: (roadmapId, nodes, edges) => {
        const { completedNodes } = get();
        const completed = completedNodes[roadmapId] || new Set();
        
        // Find nodes where all dependencies are completed
        const recommended = nodes.filter(node => {
          // Skip if already completed
          if (completed.has(node.id)) return false;
          
          // Find all incoming edges (dependencies)
          const dependencies = edges.filter(edge => edge.target === node.id);
          
          // Check if all dependencies are completed
          const allDepsCompleted = dependencies.every(dep => 
            completed.has(dep.source)
          );
          
          // If no dependencies or all completed, recommend it
          return dependencies.length === 0 || allDepsCompleted;
        });
        
        return recommended.slice(0, 3); // Return top 3
      },
      
      // Badge system
      checkBadges: () => {
        const { totalXP, badges, completedNodes } = get();
        const newBadges = [...badges];
        
        // XP-based badges
        if (totalXP >= 100 && !badges.includes('first-100-xp')) {
          newBadges.push('first-100-xp');
        }
        if (totalXP >= 500 && !badges.includes('xp-master')) {
          newBadges.push('xp-master');
        }
        if (totalXP >= 1000 && !badges.includes('xp-legend')) {
          newBadges.push('xp-legend');
        }
        
        // Completion badges
        Object.keys(completedNodes).forEach(roadmapId => {
          const completed = completedNodes[roadmapId].size;
          if (completed >= 10 && !badges.includes(`${roadmapId}-starter`)) {
            newBadges.push(`${roadmapId}-starter`);
          }
          if (completed >= 50 && !badges.includes(`${roadmapId}-expert`)) {
            newBadges.push(`${roadmapId}-expert`);
          }
        });
        
        if (newBadges.length > badges.length) {
          set({ badges: newBadges });
        }
      },
      
      // Set current roadmap
      setCurrentRoadmap: (roadmapId) => {
        set({ currentRoadmap: roadmapId });
      },
      
      // Reset progress (for testing)
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
      // Convert Sets to Arrays for storage
      partialize: (state) => ({
        ...state,
        completedNodes: Object.fromEntries(
          Object.entries(state.completedNodes).map(([key, value]) => [
            key,
            Array.from(value)
          ])
        )
      }),
      // Convert Arrays back to Sets on load
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
