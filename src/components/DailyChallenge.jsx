import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useRoadmapStore from '../store/roadmapStore';

const C = (id,title,diff,topic,xp,desc,ex,hint) => ({id,title,difficulty:diff,topic,xp,description:desc,examples:ex,hint});

const CHALLENGES = [
  C(1,'Two Sum','Easy','Arrays',50,'Given an integer array nums and a target, return indices of the two numbers that add up to target.',['[2,7,11,15] target=9 → [0,1]','[3,2,4] target=6 → [1,2]'],'Hash map: for each num check if target-num exists.'),
  C(2,'Valid Parentheses','Easy','Stack',50,'Given a string of brackets, determine if it is valid. Open brackets must be closed in correct order.',['() → true','()[]{} → true','([)] → false'],'Stack: push open, pop and match on close.'),
  C(3,'Reverse Linked List','Easy','Linked List',50,'Reverse a singly linked list in-place and return the new head.',['1→2→3→4→5 → 5→4→3→2→1'],'Three pointers: prev=null, curr=head, next. Iterate reversing links.'),
  C(4,'Maximum Subarray','Medium','DP',100,'Find the contiguous subarray with the largest sum (Kadane\'s Algorithm).',['[-2,1,-3,4,-1,2,1,-5,4] → 6 (subarray [4,-1,2,1])'],'curr_max = max(num, curr_max+num). global_max = max(global_max, curr_max).'),
  C(5,'LRU Cache','Hard','Design',200,'Design an LRU cache with O(1) get and put operations.',['LRUCache(2); put(1,1); put(2,2); get(1)→1; put(3,3); get(2)→-1'],'HashMap + doubly linked list. HashMap for O(1) lookup, DLL for O(1) eviction.'),
  C(6,'Binary Search','Easy','Binary Search',50,'Search a sorted array for target in O(log n). Return index or -1.',['[-1,0,3,5,9,12] target=9 → 4','[5] target=5 → 0'],'mid = left + (right-left)//2. Adjust bounds based on comparison.'),
  C(7,'Merge Intervals','Medium','Arrays',100,'Merge all overlapping intervals and return the result.',['[[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]'],'Sort by start. If curr.start ≤ prev.end, merge by taking max of ends.'),
  C(8,'Word Search','Medium','Backtracking',100,'Find if a word exists in a 2D character grid using adjacent cells.',['board with ABCCED → true'],'DFS + backtracking. Mark cell visited (replace with #), restore after.'),
  C(9,'Trapping Rain Water','Hard','Two Pointers',200,'Compute water trapped between elevation bars.',['[0,1,0,2,1,0,1,3,2,1,2,1] → 6'],'Two pointers: water[i] = min(left_max, right_max) - height[i].'),
  C(10,'Coin Change','Medium','DP',100,'Fewest coins to make amount, or -1 if impossible.',['coins=[1,5,11] amount=15 → 3','coins=[2] amount=3 → -1'],'dp[i] = min(dp[i-coin]+1) for each coin. dp[0]=0.'),
  C(11,'Number of Islands','Medium','Graph',100,'Count islands (connected 1s) in a 2D binary grid.',['3 separate land groups → 3'],'BFS/DFS from each unvisited 1. Mark all connected 1s visited.'),
  C(12,'Climbing Stairs','Easy','DP',50,'Count distinct ways to climb n stairs taking 1 or 2 steps.',['n=3 → 3 (1+1+1, 1+2, 2+1)'],'Fibonacci: dp[n] = dp[n-1] + dp[n-2].'),
  C(13,'Product of Array Except Self','Medium','Arrays',100,'Return array where each element is product of all others. No division, O(n).',['[1,2,3,4] → [24,12,8,6]'],'Prefix products left-to-right, suffix products right-to-left. Multiply.'),
  C(14,'Longest Palindromic Substring','Medium','DP',100,'Return the longest palindromic substring.',['"babad" → "bab"','"cbbd" → "bb"'],'Expand around center for each char and each pair. Track max.'),
  C(15,'Find Median from Data Stream','Hard','Heap',200,'Support addNum and findMedian in O(log n) and O(1).',['addNum(1); addNum(2); findMedian()→1.5; addNum(3); findMedian()→2.0'],'Max-heap for lower half, min-heap for upper half. Balance sizes.'),
  C(16,'3Sum','Medium','Two Pointers',100,'Find all unique triplets that sum to zero.',['[-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]'],'Sort. Fix one element, two pointers for rest. Skip duplicates.'),
  C(17,'Container With Most Water','Medium','Two Pointers',100,'Find two lines forming container with most water.',['[1,8,6,2,5,4,8,3,7] → 49'],'Two pointers from ends. Move pointer with smaller height inward.'),
  C(18,'Jump Game','Medium','Greedy',100,'Can you reach the last index given max jump lengths?',['[2,3,1,1,4] → true','[3,2,1,0,4] → false'],'Track max_reach. If i > max_reach return false. Update max_reach.'),
  C(19,'Rotate Image','Medium','Arrays',100,'Rotate an n×n matrix 90° clockwise in-place.',['[[1,2,3],[4,5,6],[7,8,9]] → [[7,4,1],[8,5,2],[9,6,3]]'],'Transpose (swap [i][j] with [j][i]), then reverse each row.'),
  C(20,'Group Anagrams','Medium','Hash Map',100,'Group strings that are anagrams of each other.',['["eat","tea","tan","ate","nat","bat"] → [["bat"],["nat","tan"],["ate","eat","tea"]]'],'Sort each string as hash map key. All anagrams share the same key.'),
  C(21,'Spiral Matrix','Medium','Arrays',100,'Return all elements of a matrix in spiral order.',['[[1,2,3],[4,5,6],[7,8,9]] → [1,2,3,6,9,8,7,4,5]'],'Four boundaries: top, bottom, left, right. Traverse and shrink.'),
  C(22,'Decode Ways','Medium','DP',100,'Count ways to decode a digit string (A=1...Z=26).',['"12" → 2 (AB or L)','"226" → 3'],'dp[i] = ways to decode s[:i]. Check single (1-9) and double (10-26) digits.'),
  C(23,'Unique Paths','Medium','DP',100,'Count unique paths in m×n grid moving only right or down.',['m=3, n=7 → 28'],'dp[i][j] = dp[i-1][j] + dp[i][j-1]. Or C(m+n-2, m-1).'),
  C(24,'Word Break','Medium','DP',100,'Can string s be segmented into dictionary words?',['s="leetcode", dict=["leet","code"] → true'],'dp[i] = true if s[:i] can be segmented. Check all j<i where dp[j] true and s[j:i] in dict.'),
  C(25,'Course Schedule','Medium','Graph',100,'Can you finish all courses given prerequisites? (Cycle detection)',['n=2, prereqs=[[1,0]] → true','n=2, prereqs=[[1,0],[0,1]] → false'],'Topological sort (Kahn\'s) or DFS cycle detection. Track 3 states.'),
  C(26,'Longest Increasing Subsequence','Medium','DP',100,'Return length of longest strictly increasing subsequence.',['[10,9,2,5,3,7,101,18] → 4 ([2,3,7,101])'],'O(n²) DP or O(n log n) patience sorting with binary search.'),
  C(27,'Serialize/Deserialize Binary Tree','Hard','Tree',200,'Design algorithm to serialize and deserialize a binary tree.',['[1,2,3,null,null,4,5] → "1,2,3,null,null,4,5"'],'BFS level-order for serialize. Queue-based for deserialize with null markers.'),
  C(28,'Sliding Window Maximum','Hard','Deque',200,'Return max value in each sliding window of size k.',['[1,3,-1,-3,5,3,6,7] k=3 → [3,3,5,5,6,7]'],'Monotonic deque storing indices in decreasing order of values.'),
  C(29,'Regular Expression Matching','Hard','DP',200,'Implement regex matching with "." (any char) and "*" (zero or more).',['s="aa" p="a*" → true','s="ab" p=".*" → true'],'2D DP. Handle "." and "*" cases. dp[i][j] = s[:i] matches p[:j].'),
  C(30,'Minimum Window Substring','Hard','Sliding Window',200,'Find minimum window in s containing all chars of t.',['s="ADOBECODEBANC" t="ABC" → "BANC"'],'Sliding window with frequency map. Expand right, shrink left when valid.'),
  C(31,'Palindrome Linked List','Easy','Linked List',50,'Check if linked list is palindrome in O(n) time O(1) space.',['1→2→2→1 → true','1→2 → false'],'Find middle (slow/fast), reverse second half, compare both halves.'),
  C(32,'Kth Largest Element','Medium','Heap',100,'Return kth largest element in array.',['[3,2,1,5,6,4] k=2 → 5'],'Min-heap of size k. Or QuickSelect O(n) average.'),
  C(33,'Top K Frequent Elements','Medium','Heap',100,'Return k most frequent elements.',['[1,1,1,2,2,3] k=2 → [1,2]'],'Count frequencies. Min-heap of size k or bucket sort by frequency.'),
  C(34,'Find All Anagrams in String','Medium','Sliding Window',100,'Return start indices of all anagrams of p in s.',['s="cbaebabacd" p="abc" → [0,6]'],'Sliding window of size len(p). Compare char frequency arrays.'),
  C(35,'Subarray Sum Equals K','Medium','Hash Map',100,'Count subarrays with sum equal to k.',['[1,1,1] k=2 → 2'],'Prefix sum + hash map. Check if (prefix_sum - k) exists in map.'),
  C(36,'Longest Consecutive Sequence','Medium','Hash Set',100,'Find length of longest consecutive sequence in O(n).',['[100,4,200,1,3,2] → 4 ([1,2,3,4])'],'Add all to set. For each sequence start (n-1 not in set), count consecutive.'),
  C(37,'Pacific Atlantic Water Flow','Medium','Graph',100,'Find cells that can flow to both Pacific and Atlantic oceans.',['5×5 height matrix → list of coordinates'],'BFS from ocean borders inward. Find intersection of reachable cells.'),
  C(38,'Implement Trie','Medium','Trie',100,'Implement Trie with insert, search, and startsWith.',['insert("apple"); search("apple")→true; startsWith("app")→true'],'Each node has children[26] and isEnd. Insert: create nodes along path.'),
  C(39,'Design Add and Search Words','Medium','Trie',100,'Trie supporting wildcard "." in search.',['addWord("bad"); search(".ad")→true'],'Trie + DFS for wildcard. Try all 26 children when "." encountered.'),
  C(40,'Longest Valid Parentheses','Hard','Stack',200,'Find length of longest valid parentheses substring.',['(()" → 2','")()()" → 4'],'Stack storing indices. Push "(". On ")", pop and calc length.'),
  C(41,'Edit Distance','Hard','DP',200,'Minimum operations (insert/delete/replace) to convert word1 to word2.',['horse → ros = 3'],'2D DP. If chars match: dp[i][j]=dp[i-1][j-1]. Else: 1+min(insert,delete,replace).'),
  C(42,'Burst Balloons','Hard','DP',200,'Maximize coins from bursting balloons. Bursting i gives nums[i-1]*nums[i]*nums[i+1].',['[3,1,5,8] → 167'],'Interval DP: think which balloon to burst LAST in range [l,r].'),
  C(43,'Largest Rectangle in Histogram','Hard','Stack',200,'Find largest rectangle area in histogram.',['[2,1,5,6,2,3] → 10'],'Monotonic stack of indices. On decrease, pop and calculate area.'),
  C(44,'Maximal Rectangle','Hard','Stack',200,'Find largest rectangle of 1s in binary matrix.',['5×5 binary matrix → 6'],'Build histogram row by row. Apply Largest Rectangle in Histogram each row.'),
  C(45,'Median of Two Sorted Arrays','Hard','Binary Search',200,'Find median of two sorted arrays in O(log(m+n)).',['[1,3] and [2] → 2.0','[1,2] and [3,4] → 2.5'],'Binary search on smaller array. Partition both so left halves ≤ right halves.'),
  C(46,'Word Search II','Hard','Trie',200,'Find all words from list that exist in character board.',['board + words=["oath","pea","eat","rain"] → ["eat","oath"]'],'Build Trie from words. DFS on board with Trie traversal. Prune dead branches.'),
  C(47,'Alien Dictionary','Hard','Topological Sort',200,'Derive character order from sorted alien language word list.',['["wrt","wrf","er","ett","rftt"] → "wertf"'],'Compare adjacent words to build directed graph. Topological sort. Detect cycles.'),
  C(48,'Reconstruct Itinerary','Hard','Graph',200,'Reconstruct flight itinerary using all tickets starting from JFK.',['[["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]] → ["JFK","MUC","LHR","SFO","SJC"]'],'Hierholzer\'s algorithm. DFS, add to result when no more neighbors.'),
  C(49,'Network Delay Time','Medium','Graph',100,'Time for signal to reach all nodes from source k.',['times=[[2,1,1],[2,3,1],[3,4,1]] n=4 k=2 → 2'],'Dijkstra from k. Return max distance. -1 if any unreachable.'),
  C(50,'Cheapest Flights Within K Stops','Medium','Graph',100,'Cheapest price from src to dst with at most k stops.',['n=3, flights=[[0,1,100],[1,2,100],[0,2,500]] src=0 dst=2 k=1 → 200'],'Bellman-Ford k+1 iterations. Or BFS/Dijkstra with (city, stops) state.'),
  C(51,'Accounts Merge','Medium','Union Find',100,'Merge accounts sharing common emails.',['[["John","j@j.com","j@j2.com"],["John","j@j3.com","j@j.com"]] → merged'],'Union-Find: union emails in same account. Group by root, sort, format.'),
  C(52,'Redundant Connection','Medium','Union Find',100,'Find the extra edge that creates a cycle in a tree.',['[[1,2],[1,3],[2,3]] → [2,3]'],'Union-Find: if both endpoints already connected, this edge is redundant.'),
  C(53,'Graph Valid Tree','Medium','Graph',100,'Determine if n nodes and edges form a valid tree.',['n=5, edges=[[0,1],[0,2],[0,3],[1,4]] → true'],'Valid tree: exactly n-1 edges AND no cycle. Check both conditions.'),
  C(54,'Minimum Cost to Connect All Points','Medium','Graph',100,'Minimum cost MST using Manhattan distance between points.',['[[0,0],[2,2],[3,10],[5,2],[7,0]] → 20'],'Prim\'s or Kruskal\'s MST. Min-heap with (cost, point) pairs.'),
  C(55,'Path With Minimum Effort','Medium','Graph',100,'Minimum effort (max abs diff) path from top-left to bottom-right.',['[[1,2,2],[3,8,2],[5,3,5]] → 2'],'Dijkstra with effort as priority. effort[i][j] = min max-diff to reach (i,j).'),
  C(56,'Swim in Rising Water','Hard','Binary Search',200,'Minimum time t for path from (0,0) to (n-1,n-1) where all cells ≤ t.',['[[0,2],[1,3]] → 3'],'Binary search on t. BFS/DFS to check path exists. Or Dijkstra/min-heap.'),
  C(57,'Shortest Path in Binary Matrix','Medium','BFS',100,'Shortest clear path (0s only) from top-left to bottom-right.',['[[0,1],[1,0]] → 2'],'BFS from (0,0). Explore all 8 directions. Track distance.'),
  C(58,'Bus Routes','Hard','BFS',200,'Minimum buses to travel from source to target stop.',['routes=[[1,2,7],[3,6,7]] source=1 target=6 → 2'],'BFS on routes not stops. Build stop→routes map. Visit routes.'),
  C(59,'Subsets','Medium','Backtracking',100,'Return all possible subsets of an integer array.',['[1,2,3] → [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]'],'Backtracking: at each step include or exclude current element.'),
  C(60,'Permutations','Medium','Backtracking',100,'Return all possible permutations of distinct integers.',['[1,2,3] → [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]'],'Backtracking: swap elements to generate all orderings.'),
];

const DIFF_COLOR = { Easy:'var(--accent-success)', Medium:'var(--accent-amber)', Hard:'var(--accent-error)' };

export default function DailyChallenge() {
  const [solved, setSolved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('deva_daily_solved') || '{}'); } catch { return {}; }
  });
  const [showHint, setShowHint] = useState(false);
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState('today'); // 'today' | 'archive'
  const { totalXP } = useRoadmapStore();

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  const challenge = CHALLENGES[dayOfYear % CHALLENGES.length];
  const todayKey = new Date().toISOString().slice(0,10);
  const isSolvedToday = solved[todayKey] === challenge.id;

  const totalSolved = Object.keys(solved).length;
  const streak = (() => {
    let s = 0;
    const today = new Date(todayKey);
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0,10);
      if (solved[k]) s++; else if (i > 0) break;
    }
    return s;
  })();

  const handleSubmit = () => {
    if (!code.trim()) return;
    setSubmitted(true);
    if (!isSolvedToday) {
      const next = { ...solved, [todayKey]: challenge.id };
      setSolved(next);
      localStorage.setItem('deva_daily_solved', JSON.stringify(next));
    }
  };

  return (
    <div style={s.page} className="deva-ui">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>⚡ Daily Coding Challenge</h2>
          <p style={s.sub}>A new problem every day. Solve it to earn XP and keep your streak alive.</p>
        </div>
        <div style={s.statsRow}>
          <div style={s.statBox}>
            <span style={s.statNum}>{streak}</span>
            <span style={s.statLbl}>🔥 Streak</span>
          </div>
          <div style={s.statBox}>
            <span style={s.statNum}>{totalSolved}</span>
            <span style={s.statLbl}>✅ Solved</span>
          </div>
          <div style={s.statBox}>
            <span style={s.statNum}>{totalXP || 0}</span>
            <span style={s.statLbl}>⭐ XP</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {[['today','Today\'s Challenge'],['archive','Problem Archive']].map(([id,lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ ...s.tab, ...(tab===id ? s.tabActive : {}) }}>{lbl}</button>
        ))}
      </div>

      {tab === 'today' && (
        <div style={s.card}>
          <div style={s.problemTop}>
            <div style={s.badges}>
              <span style={{ ...s.diffBadge, color:DIFF_COLOR[challenge.difficulty], borderColor:DIFF_COLOR[challenge.difficulty] }}>
                {challenge.difficulty}
              </span>
              <span style={s.topicBadge}>{challenge.topic}</span>
            </div>
            <span style={s.xpBadge}>+{challenge.xp} XP</span>
          </div>

          <h3 style={s.problemTitle}>{challenge.title}</h3>
          <p style={s.problemDesc}>{challenge.description}</p>

          <div style={s.exSection}>
            <div style={s.sectionLbl}>Examples</div>
            {challenge.examples.map((ex,i) => (
              <pre key={i} style={s.example}>{ex}</pre>
            ))}
          </div>

          <button onClick={() => setShowHint(h => !h)} style={s.hintBtn}>
            {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
          </button>
          <AnimatePresence>
            {showHint && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}
                exit={{opacity:0,height:0}} style={s.hint}>
                💡 {challenge.hint}
              </motion.div>
            )}
          </AnimatePresence>

          {!isSolvedToday && !submitted && (
            <div style={s.editorWrap}>
              <div style={s.sectionLbl}>Your Solution</div>
              <textarea value={code} onChange={e => setCode(e.target.value)}
                placeholder="# Write your solution here..." style={s.editor} spellCheck={false} />
              <button onClick={handleSubmit} disabled={!code.trim()} style={s.submitBtn}>
                🚀 Submit Solution
              </button>
            </div>
          )}

          {(isSolvedToday || submitted) && (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} style={s.solvedBanner}>
              <span style={{fontSize:32}}>🎉</span>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>Challenge Solved!</div>
                <div style={{fontSize:13,color:'var(--text-secondary)',marginTop:2}}>
                  +{challenge.xp} XP earned • Come back tomorrow for a new challenge
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {tab === 'archive' && (
        <div style={s.archiveGrid}>
          {CHALLENGES.map(c => (
            <motion.div key={c.id} whileHover={{y:-2}} style={s.archiveCard}
              onClick={() => { setTab('today'); }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{...s.diffBadge,fontSize:10,color:DIFF_COLOR[c.difficulty],borderColor:DIFF_COLOR[c.difficulty]}}>
                  {c.difficulty}
                </span>
                <span style={{fontSize:10,color:'var(--text-muted)'}}>{c.topic}</span>
              </div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{c.title}</div>
              <div style={{fontSize:11,color:'var(--accent-amber)'}}>+{c.xp} XP</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding:'0 24px 40px', color:'var(--text-primary)', background:'var(--bg-primary)', minHeight:'100vh' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingTop:24, marginBottom:20, flexWrap:'wrap', gap:16 },
  title: { margin:0, fontSize:24, fontWeight:800 },
  sub: { margin:'4px 0 0', fontSize:13, color:'var(--text-secondary)' },
  statsRow: { display:'flex', gap:12 },
  statBox: { display:'flex', flexDirection:'column', alignItems:'center', background:'var(--bg-card)', border:'1px solid var(--border-primary)', borderRadius:12, padding:'10px 16px', minWidth:70 },
  statNum: { fontSize:22, fontWeight:800, color:'var(--accent-amber)', lineHeight:1 },
  statLbl: { fontSize:10, color:'var(--text-muted)', marginTop:3 },
  tabs: { display:'flex', gap:8, marginBottom:20 },
  tab: { padding:'8px 18px', borderRadius:8, border:'1px solid var(--border-primary)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:13, fontWeight:500 },
  tabActive: { background:'rgba(245,158,11,0.12)', color:'var(--accent-amber)', borderColor:'var(--accent-amber)', fontWeight:700 },
  card: { background:'var(--bg-card)', border:'1px solid var(--border-primary)', borderRadius:16, padding:28 },
  problemTop: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
  badges: { display:'flex', gap:8 },
  diffBadge: { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, border:'1px solid' },
  topicBadge: { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:'var(--bg-hover)', color:'var(--text-secondary)', border:'1px solid var(--border-primary)' },
  xpBadge: { padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, background:'rgba(245,158,11,0.12)', color:'var(--accent-amber)', border:'1px solid rgba(245,158,11,0.25)' },
  problemTitle: { fontSize:22, fontWeight:800, marginBottom:12 },
  problemDesc: { fontSize:14, lineHeight:1.75, color:'var(--text-secondary)', marginBottom:20 },
  exSection: { marginBottom:16 },
  sectionLbl: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:8 },
  example: { background:'var(--bg-secondary)', border:'1px solid var(--border-primary)', borderRadius:8, padding:'10px 14px', fontSize:12, fontFamily:'var(--font-mono)', lineHeight:1.6, marginBottom:8, whiteSpace:'pre-wrap' },
  hintBtn: { padding:'7px 16px', borderRadius:8, background:'transparent', border:'1px solid var(--border-primary)', color:'var(--text-secondary)', fontSize:12, cursor:'pointer', marginBottom:12 },
  hint: { background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:8, padding:'12px 16px', fontSize:13, color:'var(--accent-amber)', marginBottom:16, overflow:'hidden' },
  editorWrap: { marginTop:20 },
  editor: { width:'100%', height:200, background:'var(--bg-secondary)', color:'var(--text-primary)', border:'1px solid var(--border-primary)', borderRadius:10, padding:14, fontSize:13, fontFamily:'var(--font-mono)', resize:'vertical', boxSizing:'border-box', marginBottom:12 },
  submitBtn: { padding:'11px 28px', borderRadius:10, background:'var(--accent-amber)', border:'none', color:'#000', fontWeight:700, fontSize:14, cursor:'pointer' },
  solvedBanner: { display:'flex', alignItems:'center', gap:16, padding:'18px 22px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:12, marginTop:20 },
  archiveGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:12 },
  archiveCard: { background:'var(--bg-card)', border:'1px solid var(--border-primary)', borderRadius:12, padding:'14px 16px', cursor:'pointer' },
};
