import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/AdvancedConceptsPage.css';

const ALL_CONCEPTS = [
  // ── JavaScript ──────────────────────────────────────────────────────────────
  { id:'js-closures', category:'javascript', title:'Closures & Scope Chain', difficulty:'Advanced', pro:false, icon:'⚡',
    description:'Understand lexical scope, closures, and how JavaScript manages execution contexts.',
    topics:['lexical scope','closure patterns','IIFE','module pattern','memory leaks'],
    codeExample:`// Closure: inner function remembers outer scope
function makeCounter(start = 0) {
  let count = start; // captured in closure

  return {
    increment: () => ++count,
    decrement: () => --count,
    value:     () => count,
  };
}

const counter = makeCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.value());     // 12

// IIFE — immediately invoked, private scope
const result = (() => {
  const secret = 42;
  return secret * 2;
})();
console.log(result); // 84`,
    resources:[{type:'article',title:'MDN: Closures',url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'}] },

  { id:'js-event-loop', category:'javascript', title:'Event Loop & Microtasks', difficulty:'Advanced', pro:false, icon:'⚡',
    description:'Master the JavaScript runtime: call stack, event loop, microtasks, and macrotasks.',
    topics:['call stack','event loop','microtasks','macrotasks','promise queue'],
    codeExample:`// Execution order: sync → microtasks → macrotasks
console.log('1 - sync');

setTimeout(() => console.log('4 - macrotask'), 0);

Promise.resolve()
  .then(() => console.log('2 - microtask'))
  .then(() => console.log('3 - microtask 2'));

console.log('1b - sync');
// Output: 1 → 1b → 2 → 3 → 4

// queueMicrotask — lower-level microtask scheduling
queueMicrotask(() => console.log('also microtask'));`,
    resources:[{type:'video',title:'What the heck is the event loop?',url:'https://www.youtube.com/watch?v=8aGhZQkoFbQ'}] },

  { id:'js-prototypes', category:'javascript', title:'Prototypal Inheritance', difficulty:'Advanced', pro:false, icon:'⚡',
    description:"Deep dive into JavaScript's prototype chain, Object.create, and class syntax under the hood.",
    topics:['prototype chain','Object.create','__proto__','class vs prototype','mixins'],
    codeExample:`// Prototype chain — how JS looks up properties
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() {
  return \`\${this.name} makes a sound.\`;
};

function Dog(name) { Animal.call(this, name); }
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() { return 'Woof!'; };

const d = new Dog('Rex');
console.log(d.speak()); // Rex makes a sound.
console.log(d.bark());  // Woof!
console.log(d instanceof Animal); // true

// Mixin pattern
const Serializable = {
  serialize() { return JSON.stringify(this); }
};
Object.assign(Dog.prototype, Serializable);`,
    resources:[{type:'article',title:'MDN: Prototype chain',url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain'}] },

  { id:'js-generators', category:'javascript', title:'Generators & Iterators', difficulty:'Expert', pro:true, icon:'⚡',
    description:'Lazy evaluation, infinite sequences, and async generators for streaming data.',
    topics:['function*','yield','Symbol.iterator','async generators','lazy evaluation'],
    codeExample:`// Infinite sequence — lazy, memory-efficient
function* naturals(start = 1) {
  while (true) yield start++;
}

const gen = naturals();
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2

// Take first N values
function take(n, iter) {
  const result = [];
  for (const val of iter) {
    result.push(val);
    if (result.length === n) break;
  }
  return result;
}
console.log(take(5, naturals())); // [1,2,3,4,5]

// Async generator — stream API responses
async function* streamPages(url) {
  let page = 1;
  while (true) {
    const res = await fetch(\`\${url}?page=\${page++}\`);
    const data = await res.json();
    if (!data.length) return;
    yield data;
  }
}`,
    resources:[{type:'article',title:'Exploring JS: Generators',url:'https://exploringjs.com/es6/ch_generators.html'}] },

  { id:'js-proxy', category:'javascript', title:'Proxy & Reflect API', difficulty:'Expert', pro:true, icon:'⚡',
    description:'Intercept and customize fundamental operations on objects using Proxy and Reflect.',
    topics:['Proxy traps','Reflect','meta-programming','observable objects','validation'],
    codeExample:`// Validation proxy — enforce types at runtime
function createTypedObject(schema) {
  return new Proxy({}, {
    set(target, key, value) {
      if (schema[key] && typeof value !== schema[key]) {
        throw new TypeError(
          \`\${key} must be \${schema[key]}, got \${typeof value}\`
        );
      }
      return Reflect.set(target, key, value);
    }
  });
}

const user = createTypedObject({ name: 'string', age: 'number' });
user.name = 'Alice';  // OK
user.age  = 30;       // OK
// user.age = '30';   // TypeError: age must be number

// Observable — track property access
const observed = new Proxy({ x: 1 }, {
  get(t, k) { console.log(\`Reading \${k}\`); return Reflect.get(t, k); }
});
observed.x; // logs "Reading x"`,
    resources:[{type:'article',title:'MDN: Proxy',url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy'}] },

  // ── React ────────────────────────────────────────────────────────────────────
  { id:'react-fiber', category:'react', title:'React Fiber Architecture', difficulty:'Expert', pro:true, icon:'⚛️',
    description:"Understand React's reconciliation algorithm and how Fiber enables concurrent rendering.",
    topics:['fiber reconciliation','work units','priority scheduling','time slicing','concurrent mode'],
    codeExample:`// Concurrent features enabled by Fiber
import { useTransition, useDeferredValue, Suspense } from 'react';

function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  const handleSearch = (q) => {
    // Mark as non-urgent — Fiber can interrupt this
    startTransition(() => {
      setResults(expensiveSearch(q));
    });
  };

  return (
    <div>
      {isPending && <Spinner />}
      <ResultList items={results} />
    </div>
  );
}

// useDeferredValue — defer expensive re-renders
function App({ data }) {
  const deferred = useDeferredValue(data);
  // deferred lags behind data — UI stays responsive
  return <HeavyChart data={deferred} />;
}`,
    resources:[{type:'article',title:'React Fiber Architecture',url:'https://github.com/acdlite/react-fiber-architecture'}] },

  { id:'react-patterns', category:'react', title:'Advanced React Patterns', difficulty:'Advanced', pro:false, icon:'⚛️',
    description:'Compound components, render props, HOCs, and custom hooks patterns.',
    topics:['compound components','render props','HOCs','custom hooks','context patterns'],
    codeExample:`// Compound component pattern
const Tabs = ({ children, defaultTab }) => {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
};
Tabs.Tab    = ({ id, children }) => { /* ... */ };
Tabs.Panel  = ({ id, children }) => { /* ... */ };

// Usage — clean, declarative API
<Tabs defaultTab="overview">
  <Tabs.Tab id="overview">Overview</Tabs.Tab>
  <Tabs.Tab id="details">Details</Tabs.Tab>
  <Tabs.Panel id="overview"><Overview /></Tabs.Panel>
  <Tabs.Panel id="details"><Details /></Tabs.Panel>
</Tabs>

// Custom hook — encapsulate logic
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}`,
    resources:[{type:'article',title:'React Patterns',url:'https://reactpatterns.com/'}] },

  { id:'react-perf', category:'react', title:'React Performance Optimization', difficulty:'Advanced', pro:false, icon:'⚛️',
    description:'Memoization, code splitting, virtualization, and profiling React apps.',
    topics:['React.memo','useMemo','useCallback','code splitting','React.lazy','virtualization'],
    codeExample:`// React.memo — skip re-render if props unchanged
const ExpensiveRow = React.memo(({ item, onSelect }) => {
  console.log('render', item.id);
  return <div onClick={() => onSelect(item.id)}>{item.name}</div>;
});

// useCallback — stable reference for callbacks
function List({ items }) {
  const [selected, setSelected] = useState(null);

  // Without useCallback, new fn ref on every render
  const handleSelect = useCallback((id) => {
    setSelected(id);
  }, []); // stable reference

  return items.map(item =>
    <ExpensiveRow key={item.id} item={item} onSelect={handleSelect} />
  );
}

// useMemo — cache expensive computation
function Dashboard({ data }) {
  const stats = useMemo(() => ({
    total:   data.reduce((s, d) => s + d.value, 0),
    average: data.reduce((s, d) => s + d.value, 0) / data.length,
  }), [data]); // only recomputes when data changes

  return <StatsPanel stats={stats} />;
}`,
    resources:[{type:'article',title:'React Performance',url:'https://react.dev/learn/render-and-commit'}] },

  { id:'react-state', category:'react', title:'State Management Deep Dive', difficulty:'Expert', pro:true, icon:'⚛️',
    description:'Zustand, Jotai, Redux Toolkit internals and when to use each.',
    topics:['Zustand','Jotai','Redux Toolkit','atom model','selector patterns','derived state'],
    codeExample:`// Zustand — minimal, no boilerplate
import { create } from 'zustand';

const useStore = create((set, get) => ({
  user:    null,
  cart:    [],
  total:   0,

  setUser: (user) => set({ user }),

  addToCart: (item) => set(state => {
    const cart  = [...state.cart, item];
    const total = cart.reduce((s, i) => s + i.price, 0);
    return { cart, total };
  }),

  // Derived — computed from state
  itemCount: () => get().cart.length,
}));

// Component — subscribe to slice only
function CartBadge() {
  const count = useStore(s => s.cart.length); // only re-renders on cart change
  return <span>{count}</span>;
}

// Jotai — atomic state
import { atom, useAtom } from 'jotai';
const countAtom  = atom(0);
const doubleAtom = atom(get => get(countAtom) * 2); // derived`,
    resources:[{type:'article',title:'State Management in 2024',url:'https://tkdodo.eu/blog/zustand-and-react-context'}] },
  // ── Python ───────────────────────────────────────────────────────────────────
  { id:'py-async', category:'python', title:'Async/Await & Concurrency', difficulty:'Advanced', pro:false, icon:'🐍',
    description:'Master asynchronous programming with asyncio, coroutines, and concurrent execution patterns.',
    topics:['asyncio','coroutines','event loops','concurrent.futures','threading vs async'],
    codeExample:`import asyncio
import aiohttp

# Fetch multiple URLs concurrently
async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.json()

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        # Run all concurrently, gather results
        return await asyncio.gather(*tasks)

# asyncio.gather vs asyncio.wait
async def main():
    urls = ['https://api.example.com/1', 'https://api.example.com/2']
    results = await fetch_all(urls)
    print(results)

asyncio.run(main())

# Semaphore — limit concurrency
async def limited_fetch(urls, max_concurrent=10):
    sem = asyncio.Semaphore(max_concurrent)
    async def bounded(url):
        async with sem:
            return await fetch_one(url)
    return await asyncio.gather(*[bounded(u) for u in urls])`,
    resources:[{type:'article',title:'Real Python: Async IO',url:'https://realpython.com/async-io-python/'}] },

  { id:'py-meta', category:'python', title:'Metaclasses & Descriptors', difficulty:'Expert', pro:true, icon:'🐍',
    description:"Deep dive into Python's object model with metaclasses, descriptors, and class creation.",
    topics:['metaclasses','descriptors','__new__ vs __init__','class decorators','ABCs'],
    codeExample:`# Metaclass — control class creation
class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=Singleton):
    def __init__(self):
        self.connection = "connected"

db1 = Database()
db2 = Database()
assert db1 is db2  # True — same instance

# Descriptor — reusable attribute logic
class Validated:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not isinstance(value, (int, float)) or value < 0:
            raise ValueError(f"{self.name} must be non-negative number")
        obj.__dict__[self.name] = value

class Product:
    price = Validated()
    stock = Validated()`,
    resources:[{type:'article',title:'Python Metaclasses',url:'https://realpython.com/python-metaclasses/'}] },

  { id:'py-gc', category:'python', title:'Memory Management & GC', difficulty:'Expert', pro:true, icon:'🐍',
    description:'CPython memory model, reference counting, generational GC, and memory profiling.',
    topics:['reference counting','generational GC','memory profiling','__slots__','weak references'],
    codeExample:`import sys
import gc
import weakref

# Reference counting
a = [1, 2, 3]
b = a          # refcount = 2
print(sys.getrefcount(a))  # 3 (getrefcount itself adds 1)

del b          # refcount drops to 2
# When refcount hits 0, memory freed immediately

# __slots__ — reduce memory per instance
class Point:
    __slots__ = ('x', 'y')  # no __dict__, saves ~200 bytes/instance
    def __init__(self, x, y):
        self.x, self.y = x, y

# Weak reference — doesn't prevent GC
class Cache:
    def __init__(self):
        self._data = weakref.WeakValueDictionary()
    def set(self, key, value):
        self._data[key] = value
    def get(self, key):
        return self._data.get(key)  # returns None if GC'd

# Force GC and check for cycles
gc.collect()
print(gc.garbage)  # objects with __del__ in cycles`,
    resources:[{type:'article',title:'Python Memory Management',url:'https://realpython.com/python-memory-management/'}] },

  { id:'py-decorators', category:'python', title:'Decorators & Context Managers', difficulty:'Advanced', pro:false, icon:'🐍',
    description:'Functional decorators, class decorators, and the context manager protocol.',
    topics:['functools.wraps','stacked decorators','__enter__/__exit__','contextlib','parametrized decorators'],
    codeExample:`import functools, time
from contextlib import contextmanager

# Parametrized decorator
def retry(times=3, delay=1.0):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == times - 1:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(times=3, delay=0.5)
def fetch_data(url):
    # Will retry up to 3 times on failure
    return requests.get(url).json()

# Context manager with contextlib
@contextmanager
def timer(label=""):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.3f}s")

with timer("database query"):
    results = db.execute("SELECT * FROM users")`,
    resources:[{type:'article',title:'Real Python: Decorators',url:'https://realpython.com/primer-on-python-decorators/'}] },

  // ── Backend ──────────────────────────────────────────────────────────────────
  { id:'be-caching', category:'backend', title:'Caching Strategies', difficulty:'Advanced', pro:false, icon:'⚙️',
    description:'Cache-aside, write-through, write-behind, and CDN caching patterns.',
    topics:['cache-aside','write-through','write-behind','TTL','cache invalidation','Redis patterns'],
    codeExample:`import redis
import json

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Cache-aside (lazy loading) — most common pattern
def get_user(user_id: str):
    cache_key = f"user:{user_id}"

    # 1. Check cache first
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    # 2. Cache miss — fetch from DB
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)

    # 3. Populate cache with TTL
    r.setex(cache_key, 3600, json.dumps(user))  # 1 hour TTL
    return user

# Write-through — update cache on every write
def update_user(user_id: str, data: dict):
    db.execute("UPDATE users SET ... WHERE id = %s", user_id)
    r.setex(f"user:{user_id}", 3600, json.dumps(data))

# Cache invalidation — delete on update
def invalidate_user(user_id: str):
    r.delete(f"user:{user_id}")
    r.delete(f"user:list:*")  # pattern delete`,
    resources:[{type:'article',title:'Caching Strategies',url:'https://codeahoy.com/2017/08/11/caching-strategies-and-how-to-choose-the-right-one/'}] },

  { id:'be-db-index', category:'backend', title:'Database Indexing Deep Dive', difficulty:'Advanced', pro:false, icon:'⚙️',
    description:'B-tree, hash, composite indexes, query planning, and index optimization.',
    topics:['B-tree index','hash index','composite index','covering index','EXPLAIN','query planner'],
    codeExample:`-- Composite index — column order matters
-- Query: WHERE status = 'active' AND created_at > '2024-01-01'
CREATE INDEX idx_users_status_created
  ON users (status, created_at);  -- status first (equality), then range

-- Covering index — all needed columns in index (no table lookup)
CREATE INDEX idx_orders_covering
  ON orders (user_id, status)
  INCLUDE (total, created_at);  -- PostgreSQL syntax

-- EXPLAIN ANALYZE — see query plan
EXPLAIN ANALYZE
  SELECT id, total FROM orders
  WHERE user_id = 123 AND status = 'paid';
-- Look for: Index Scan vs Seq Scan, actual rows, cost

-- Partial index — index only relevant rows
CREATE INDEX idx_active_users
  ON users (email)
  WHERE status = 'active';  -- much smaller, faster

-- Avoid index on low-cardinality columns
-- BAD: CREATE INDEX ON users (gender);  -- only 2-3 values
-- GOOD: CREATE INDEX ON users (email);  -- high cardinality`,
    resources:[{type:'article',title:'Use The Index, Luke',url:'https://use-the-index-luke.com/'}] },

  { id:'be-transactions', category:'backend', title:'Transactions & ACID', difficulty:'Advanced', pro:false, icon:'⚙️',
    description:'Isolation levels, deadlocks, MVCC, and distributed transactions.',
    topics:['ACID','isolation levels','MVCC','deadlocks','2PC','saga pattern'],
    codeExample:`-- ACID transaction example
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
  -- If either fails, ROLLBACK automatically
COMMIT;

-- Isolation levels
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- READ UNCOMMITTED: dirty reads possible
-- READ COMMITTED:   no dirty reads (PostgreSQL default)
-- REPEATABLE READ:  no non-repeatable reads
-- SERIALIZABLE:     no phantom reads (strictest)

-- Deadlock prevention — always lock in same order
-- Thread 1: lock A then B
-- Thread 2: lock A then B  (NOT B then A)

-- Saga pattern for distributed transactions
-- Instead of 2PC, use compensating transactions:
-- 1. Create order     → on fail: cancel order
-- 2. Reserve stock    → on fail: release stock
-- 3. Charge payment   → on fail: refund
-- Each step publishes an event; failures trigger compensations`,
    resources:[{type:'article',title:'Designing Data-Intensive Applications',url:'https://dataintensive.net/'}] },

  { id:'be-api-design', category:'backend', title:'API Design Best Practices', difficulty:'Advanced', pro:false, icon:'⚙️',
    description:'REST maturity model, versioning, pagination, rate limiting, and idempotency.',
    topics:['REST maturity','versioning','pagination','rate limiting','idempotency','OpenAPI'],
    codeExample:`# FastAPI — production-grade API design
from fastapi import FastAPI, Query, Header, HTTPException
from typing import Optional

app = FastAPI()

# Cursor-based pagination (better than offset for large datasets)
@app.get("/api/v1/users")
async def list_users(
    cursor: Optional[str] = Query(None, description="Pagination cursor"),
    limit:  int           = Query(20, ge=1, le=100),
):
    users = db.query(
        "SELECT * FROM users WHERE id > %s ORDER BY id LIMIT %s",
        decode_cursor(cursor), limit + 1
    )
    has_more = len(users) > limit
    return {
        "data":        users[:limit],
        "next_cursor": encode_cursor(users[limit-1].id) if has_more else None,
        "has_more":    has_more,
    }

# Idempotency key — safe to retry
@app.post("/api/v1/payments")
async def create_payment(
    body: PaymentRequest,
    idempotency_key: str = Header(...),
):
    # Check if already processed
    if existing := cache.get(f"idem:{idempotency_key}"):
        return existing  # return same response
    result = process_payment(body)
    cache.setex(f"idem:{idempotency_key}", 86400, result)
    return result`,
    resources:[{type:'article',title:'API Design Guide',url:'https://cloud.google.com/apis/design'}] },

  { id:'be-microservices', category:'backend', title:'Microservices Patterns', difficulty:'Expert', pro:true, icon:'⚙️',
    description:'Service mesh, circuit breaker, saga, outbox pattern, and distributed tracing.',
    topics:['service mesh','circuit breaker','saga','outbox pattern','distributed tracing','Istio'],
    codeExample:`# Circuit Breaker pattern — prevent cascade failures
import time
from enum import Enum

class State(Enum):
    CLOSED = "closed"      # normal operation
    OPEN   = "open"        # failing, reject requests
    HALF   = "half_open"   # testing recovery

class CircuitBreaker:
    def __init__(self, threshold=5, timeout=60):
        self.state     = State.CLOSED
        self.failures  = 0
        self.threshold = threshold
        self.timeout   = timeout
        self.opened_at = None

    def call(self, func, *args):
        if self.state == State.OPEN:
            if time.time() - self.opened_at > self.timeout:
                self.state = State.HALF
            else:
                raise Exception("Circuit OPEN — service unavailable")
        try:
            result = func(*args)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failures = 0
        self.state    = State.CLOSED

    def _on_failure(self):
        self.failures += 1
        if self.failures >= self.threshold:
            self.state     = State.OPEN
            self.opened_at = time.time()`,
    resources:[{type:'article',title:'Microservices Patterns',url:'https://microservices.io/patterns/index.html'}] },
  // ── System Design ────────────────────────────────────────────────────────────
  { id:'sd-scalability', category:'architecture', title:'Scalability Fundamentals', difficulty:'Advanced', pro:false, icon:'🏗️',
    description:'Horizontal vs vertical scaling, load balancing, sharding, and replication.',
    topics:['horizontal scaling','vertical scaling','load balancing','sharding','replication','CAP theorem'],
    codeExample:`# Consistent hashing — distribute load evenly
import hashlib
from bisect import bisect, insort

class ConsistentHashRing:
    def __init__(self, nodes=None, replicas=150):
        self.replicas = replicas
        self.ring     = {}
        self.sorted   = []
        for node in (nodes or []):
            self.add_node(node)

    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add_node(self, node):
        for i in range(self.replicas):
            h = self._hash(f"{node}:{i}")
            self.ring[h] = node
            insort(self.sorted, h)

    def remove_node(self, node):
        for i in range(self.replicas):
            h = self._hash(f"{node}:{i}")
            del self.ring[h]
            self.sorted.remove(h)

    def get_node(self, key):
        h   = self._hash(key)
        idx = bisect(self.sorted, h) % len(self.sorted)
        return self.ring[self.sorted[idx]]

ring = ConsistentHashRing(['server1', 'server2', 'server3'])
print(ring.get_node('user:123'))  # consistent assignment`,
    resources:[{type:'article',title:'System Design Primer',url:'https://github.com/donnemartin/system-design-primer'}] },

  { id:'sd-url-shortener', category:'architecture', title:'Design a URL Shortener', difficulty:'Advanced', pro:false, icon:'🏗️',
    description:'End-to-end system design: hashing, storage, caching, and analytics.',
    topics:['base62 encoding','consistent hashing','Redis caching','analytics pipeline','rate limiting'],
    codeExample:`import string, random, redis

CHARS = string.ascii_letters + string.digits  # 62 chars
r     = redis.Redis(decode_responses=True)

def encode(n: int, base=62) -> str:
    """Convert integer ID to base62 short code."""
    result = []
    while n:
        result.append(CHARS[n % base])
        n //= base
    return ''.join(reversed(result)) or CHARS[0]

def shorten(long_url: str) -> str:
    # 1. Check if already shortened
    existing = r.get(f"url:long:{long_url}")
    if existing:
        return existing

    # 2. Generate unique ID (use DB auto-increment in production)
    uid   = r.incr("url:counter")
    code  = encode(uid)

    # 3. Store both directions
    r.set(f"url:short:{code}",     long_url, ex=86400*365)
    r.set(f"url:long:{long_url}",  code,     ex=86400*365)

    return f"https://deva.sh/{code}"

def resolve(code: str) -> str:
    url = r.get(f"url:short:{code}")
    if not url:
        raise KeyError("Short URL not found")
    r.incr(f"url:clicks:{code}")  # analytics
    return url`,
    resources:[{type:'article',title:'System Design: URL Shortener',url:'https://systemdesign.one/url-shortening-system-design/'}] },

  { id:'sd-chat', category:'architecture', title:'Design a Chat System', difficulty:'Expert', pro:true, icon:'🏗️',
    description:'WebSockets, message queues, presence detection, and message storage at scale.',
    topics:['WebSockets','long polling','message queue','presence detection','fan-out','message storage'],
    codeExample:`# FastAPI WebSocket chat with Redis pub/sub
from fastapi import FastAPI, WebSocket
import redis.asyncio as aioredis
import asyncio, json

app = FastAPI()
redis = aioredis.from_url("redis://localhost")

class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, room: str):
        await ws.accept()
        self.active.setdefault(room, []).append(ws)

    async def broadcast(self, room: str, message: dict):
        for ws in self.active.get(room, []):
            await ws.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{room}/{user_id}")
async def chat(ws: WebSocket, room: str, user_id: str):
    await manager.connect(ws, room)
    pubsub = redis.pubsub()
    await pubsub.subscribe(f"room:{room}")

    async def listen():
        async for msg in pubsub.listen():
            if msg["type"] == "message":
                await ws.send_text(msg["data"])

    asyncio.create_task(listen())

    try:
        while True:
            data = await ws.receive_json()
            payload = json.dumps({"user": user_id, **data})
            await redis.publish(f"room:{room}", payload)
    except Exception:
        manager.active[room].remove(ws)`,
    resources:[{type:'article',title:'System Design: Chat App',url:'https://systemdesign.one/whatsapp-system-design/'}] },

  { id:'sd-ddd', category:'architecture', title:'Domain-Driven Design', difficulty:'Advanced', pro:false, icon:'🏗️',
    description:'Bounded contexts, aggregates, entities, and strategic design patterns.',
    topics:['bounded contexts','aggregates','entities','value objects','domain events'],
    codeExample:`# DDD — Order aggregate with domain events
from dataclasses import dataclass, field
from datetime import datetime
from typing import List
from uuid import uuid4

@dataclass(frozen=True)
class Money:  # Value Object — immutable, equality by value
    amount: float
    currency: str = "INR"
    def __add__(self, other): return Money(self.amount + other.amount, self.currency)

@dataclass
class OrderItem:  # Entity within aggregate
    product_id: str
    quantity:   int
    price:      Money

class Order:  # Aggregate Root
    def __init__(self, customer_id: str):
        self.id          = str(uuid4())
        self.customer_id = customer_id
        self.items:  List[OrderItem] = []
        self.status  = "draft"
        self._events = []  # domain events

    def add_item(self, product_id: str, qty: int, price: Money):
        if self.status != "draft":
            raise ValueError("Cannot modify confirmed order")
        self.items.append(OrderItem(product_id, qty, price))

    def confirm(self):
        if not self.items:
            raise ValueError("Cannot confirm empty order")
        self.status = "confirmed"
        self._events.append({"type": "OrderConfirmed", "order_id": self.id})

    @property
    def total(self) -> Money:
        return sum((i.price for i in self.items), Money(0))`,
    resources:[{type:'article',title:'DDD Reference',url:'https://www.domainlanguage.com/ddd/reference/'}] },

  { id:'sd-cqrs', category:'architecture', title:'CQRS & Event Sourcing', difficulty:'Expert', pro:true, icon:'🏗️',
    description:'Command Query Responsibility Segregation and event-driven architectures.',
    topics:['CQRS','event sourcing','event store','projections','sagas'],
    codeExample:`# CQRS — separate read and write models
from dataclasses import dataclass
from typing import List

# ── Write side (Commands) ──────────────────────────────────────
@dataclass
class CreateAccountCommand:
    user_id: str
    email:   str

class AccountCommandHandler:
    def handle(self, cmd: CreateAccountCommand):
        event = AccountCreated(cmd.user_id, cmd.email)
        event_store.append(event)  # append-only log
        event_bus.publish(event)

# ── Event Store ────────────────────────────────────────────────
class AccountCreated:
    def __init__(self, user_id, email):
        self.user_id   = user_id
        self.email     = email
        self.timestamp = datetime.utcnow()

# ── Read side (Queries) — optimized read model ─────────────────
class AccountProjection:
    """Listens to events, builds denormalized read model."""
    def on_account_created(self, event: AccountCreated):
        read_db.upsert("accounts", {
            "id":    event.user_id,
            "email": event.email,
        })

class AccountQueryHandler:
    def get_account(self, user_id: str) -> dict:
        return read_db.find("accounts", user_id)  # fast read

# ── Replay events to rebuild state ────────────────────────────
def rebuild_projection():
    for event in event_store.get_all():
        projection.apply(event)`,
    resources:[{type:'article',title:'CQRS Pattern',url:'https://martinfowler.com/bliki/CQRS.html'}] },

  // ── DevOps ───────────────────────────────────────────────────────────────────
  { id:'devops-k8s', category:'devops', title:'Kubernetes Internals', difficulty:'Expert', pro:true, icon:'🔧',
    description:'Control plane, scheduler, etcd, kubelet, and how pods are scheduled.',
    topics:['control plane','scheduler','etcd','kubelet','kube-proxy','CNI plugins'],
    codeExample:`# Kubernetes deployment with resource limits and health checks
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deva-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: deva-backend
  template:
    metadata:
      labels:
        app: deva-backend
    spec:
      containers:
      - name: api
        image: deva/backend:v2.0.0
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "128Mi"
            cpu:    "100m"
          limits:
            memory: "512Mi"
            cpu:    "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        env:
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: deva-secrets
              key: mongodb-url`,
    resources:[{type:'article',title:'Kubernetes Architecture',url:'https://kubernetes.io/docs/concepts/architecture/'}] },

  { id:'devops-cicd', category:'devops', title:'CI/CD Pipeline Design', difficulty:'Advanced', pro:false, icon:'🔧',
    description:'GitHub Actions, blue-green deployments, canary releases, and rollback strategies.',
    topics:['GitHub Actions','blue-green','canary','feature flags','rollback','GitOps'],
    codeExample:`# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r requirements.txt
      - run: pytest --cov=app tests/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t deva-backend:$\${{ github.sha }} .

      - name: Push to registry
        run: docker push deva-backend:$\${{ github.sha }}

      - name: Blue-green deploy
        run: |
          # Deploy to green environment
          kubectl set image deployment/deva-backend-green \
            api=deva-backend:$\${{ github.sha }}
          kubectl rollout status deployment/deva-backend-green

          # Switch traffic
          kubectl patch service deva-backend \
            -p '{"spec":{"selector":{"slot":"green"}}}'

      - name: Rollback on failure
        if: failure()
        run: kubectl rollout undo deployment/deva-backend-green`,
    resources:[{type:'article',title:'CI/CD Best Practices',url:'https://docs.github.com/en/actions/guides'}] },

  { id:'devops-observability', category:'devops', title:'Observability & Monitoring', difficulty:'Advanced', pro:false, icon:'🔧',
    description:'Metrics, logs, traces — the three pillars of observability with Prometheus and Grafana.',
    topics:['metrics','logs','traces','Prometheus','Grafana','OpenTelemetry','alerting'],
    codeExample:`# FastAPI with OpenTelemetry tracing + Prometheus metrics
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from prometheus_client import Counter, Histogram, generate_latest
import time

tracer   = trace.get_tracer(__name__)
REQUESTS = Counter('http_requests_total', 'Total requests', ['method','path','status'])
LATENCY  = Histogram('http_request_duration_seconds', 'Request latency', ['path'])

@app.middleware("http")
async def observability_middleware(request, call_next):
    path  = request.url.path
    start = time.time()

    with tracer.start_as_current_span(f"HTTP {request.method} {path}") as span:
        span.set_attribute("http.method", request.method)
        span.set_attribute("http.url",    str(request.url))

        response = await call_next(request)

        duration = time.time() - start
        REQUESTS.labels(request.method, path, response.status_code).inc()
        LATENCY.labels(path).observe(duration)

        span.set_attribute("http.status_code", response.status_code)
        return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")`,
    resources:[{type:'article',title:'Observability Engineering',url:'https://www.oreilly.com/library/view/observability-engineering/9781492076438/'}] },

  // ── Machine Learning ─────────────────────────────────────────────────────────
  { id:'ml-transformers', category:'ml', title:'Transformers & Attention', difficulty:'Expert', pro:true, icon:'🤖',
    description:'Self-attention, multi-head attention, positional encoding, and BERT/GPT architecture.',
    topics:['self-attention','multi-head attention','positional encoding','BERT','GPT','fine-tuning'],
    codeExample:`import torch
import torch.nn as nn
import math

class SelfAttention(nn.Module):
    def __init__(self, d_model=512, n_heads=8):
        super().__init__()
        self.d_k    = d_model // n_heads
        self.n_heads = n_heads
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, x, mask=None):
        B, T, C = x.shape
        Q = self.W_q(x).view(B, T, self.n_heads, self.d_k).transpose(1,2)
        K = self.W_k(x).view(B, T, self.n_heads, self.d_k).transpose(1,2)
        V = self.W_v(x).view(B, T, self.n_heads, self.d_k).transpose(1,2)

        # Scaled dot-product attention
        scores = (Q @ K.transpose(-2,-1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attn = torch.softmax(scores, dim=-1)

        out = (attn @ V).transpose(1,2).contiguous().view(B, T, C)
        return self.W_o(out)`,
    resources:[{type:'article',title:'Attention Is All You Need',url:'https://arxiv.org/abs/1706.03762'}] },

  { id:'ml-backprop', category:'ml', title:'Backpropagation & Optimization', difficulty:'Advanced', pro:false, icon:'🤖',
    description:'Chain rule, gradient descent variants, Adam optimizer, and learning rate schedules.',
    topics:['chain rule','SGD','Adam','RMSprop','learning rate schedules','gradient clipping'],
    codeExample:`import torch
import torch.nn as nn

# Simple neural network with manual training loop
model = nn.Sequential(
    nn.Linear(784, 256), nn.ReLU(),
    nn.Linear(256, 128), nn.ReLU(),
    nn.Linear(128, 10)
)

# Adam optimizer — adaptive learning rates per parameter
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)

# Cosine annealing schedule — reduce LR over time
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)

criterion = nn.CrossEntropyLoss()

for epoch in range(100):
    for X, y in dataloader:
        optimizer.zero_grad()          # clear gradients

        logits = model(X)              # forward pass
        loss   = criterion(logits, y)  # compute loss

        loss.backward()                # backprop — compute gradients

        # Gradient clipping — prevent exploding gradients
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        optimizer.step()               # update weights
    scheduler.step()                   # decay learning rate`,
    resources:[{type:'article',title:'CS231n: Backpropagation',url:'https://cs231n.github.io/optimization-2/'}] },

  { id:'ml-rag', category:'ml', title:'RAG & LLM Applications', difficulty:'Expert', pro:true, icon:'🤖',
    description:'Retrieval-Augmented Generation, vector databases, embeddings, and prompt engineering.',
    topics:['RAG','vector databases','embeddings','prompt engineering','LangChain','chunking strategies'],
    codeExample:`# RAG pipeline — retrieve relevant context, then generate
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss

# 1. Embed documents
model = SentenceTransformer('all-MiniLM-L6-v2')

documents = [
    "Python is a high-level programming language.",
    "FastAPI is a modern web framework for Python.",
    "React is a JavaScript library for building UIs.",
]

embeddings = model.encode(documents)  # shape: (3, 384)

# 2. Build FAISS index for fast similarity search
index = faiss.IndexFlatIP(384)  # inner product = cosine similarity
faiss.normalize_L2(embeddings)
index.add(embeddings)

# 3. Retrieve relevant docs for a query
def retrieve(query: str, k: int = 2):
    q_emb = model.encode([query])
    faiss.normalize_L2(q_emb)
    scores, indices = index.search(q_emb, k)
    return [documents[i] for i in indices[0]]

# 4. Augment prompt with retrieved context
def rag_answer(question: str) -> str:
    context = "\n".join(retrieve(question))
    prompt  = f"Context:\n{context}\n\nQuestion: {question}\nAnswer:"
    return llm.generate(prompt)  # call your LLM`,
    resources:[{type:'article',title:'RAG Survey',url:'https://arxiv.org/abs/2312.10997'}] },

  // ── Security ─────────────────────────────────────────────────────────────────
  { id:'sec-owasp', category:'security', title:'OWASP Top 10 Deep Dive', difficulty:'Advanced', pro:false, icon:'🔒',
    description:'SQL injection, XSS, CSRF, SSRF, and how to prevent each vulnerability.',
    topics:['SQL injection','XSS','CSRF','SSRF','broken auth','security misconfiguration'],
    codeExample:`# SQL Injection — NEVER do this
# BAD:
query = f"SELECT * FROM users WHERE email = '{user_input}'"
# Attacker input: ' OR '1'='1 — returns ALL users!

# GOOD: parameterized queries
cursor.execute("SELECT * FROM users WHERE email = %s", (user_input,))

# XSS Prevention — sanitize output
from markupsafe import escape
safe_html = escape(user_input)  # converts < > & to HTML entities

# CSRF Protection — FastAPI
from fastapi import Request
import secrets

@app.get("/csrf-token")
async def get_csrf_token(request: Request):
    token = secrets.token_hex(32)
    request.session["csrf_token"] = token
    return {"token": token}

@app.post("/transfer")
async def transfer(request: Request, body: TransferRequest):
    if body.csrf_token != request.session.get("csrf_token"):
        raise HTTPException(403, "CSRF token mismatch")
    # proceed...

# SSRF Prevention — whitelist allowed hosts
import ipaddress
ALLOWED_HOSTS = {"api.example.com", "cdn.example.com"}

def safe_fetch(url: str):
    host = urlparse(url).hostname
    if host not in ALLOWED_HOSTS:
        raise ValueError(f"Host {host} not allowed")
    return requests.get(url, timeout=5)`,
    resources:[{type:'article',title:'OWASP Top 10',url:'https://owasp.org/www-project-top-ten/'}] },

  { id:'sec-jwt', category:'security', title:'JWT & OAuth 2.0 Internals', difficulty:'Advanced', pro:false, icon:'��',
    description:'JWT structure, signing algorithms, OAuth flows, and common vulnerabilities.',
    topics:['JWT structure','RS256 vs HS256','OAuth 2.0 flows','PKCE','token rotation','refresh tokens'],
    codeExample:`import jwt, secrets, hashlib, base64
from datetime import datetime, timedelta

SECRET = "your-256-bit-secret"

# Create JWT
def create_token(user_id: str, expires_in: int = 3600) -> str:
    payload = {
        "sub":  user_id,
        "iat":  datetime.utcnow(),
        "exp":  datetime.utcnow() + timedelta(seconds=expires_in),
        "jti":  secrets.token_hex(16),  # unique token ID
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

# Verify JWT
def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# PKCE — Proof Key for Code Exchange (OAuth 2.0)
def generate_pkce():
    verifier  = secrets.token_urlsafe(32)
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()
    ).rstrip(b'=').decode()
    return verifier, challenge

# Token rotation — refresh tokens
def refresh_access_token(refresh_token: str) -> dict:
    payload = verify_token(refresh_token)
    # Invalidate old refresh token (store in blocklist)
    blocklist.add(payload["jti"])
    return {
        "access_token":  create_token(payload["sub"], 900),
        "refresh_token": create_token(payload["sub"], 604800),
    }`,
    resources:[{type:'article',title:'JWT Security Best Practices',url:'https://curity.io/resources/learn/jwt-best-practices/'}] },

  { id:'sec-crypto', category:'security', title:'Applied Cryptography', difficulty:'Expert', pro:true, icon:'🔒',
    description:'Encryption algorithms, hashing, digital signatures, and PKI.',
    topics:['AES','RSA','SHA-256','digital signatures','TLS/SSL','PKI','zero-knowledge proofs'],
    codeExample:`from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
import hashlib, hmac, os

# AES symmetric encryption (via Fernet = AES-128-CBC + HMAC)
key     = Fernet.generate_key()
cipher  = Fernet(key)
token   = cipher.encrypt(b"sensitive data")
plain   = cipher.decrypt(token)

# RSA asymmetric — encrypt with public, decrypt with private
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key  = private_key.public_key()

ciphertext = public_key.encrypt(
    b"secret message",
    padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
)
plaintext = private_key.decrypt(ciphertext, padding.OAEP(...))

# Digital signature — sign with private, verify with public
signature = private_key.sign(b"document", padding.PSS(...), hashes.SHA256())
public_key.verify(signature, b"document", padding.PSS(...), hashes.SHA256())

# HMAC — message authentication
def sign_payload(payload: bytes, secret: bytes) -> str:
    return hmac.new(secret, payload, hashlib.sha256).hexdigest()

def verify_payload(payload: bytes, secret: bytes, sig: str) -> bool:
    expected = sign_payload(payload, secret)
    return hmac.compare_digest(expected, sig)  # constant-time comparison`,
    resources:[{type:'article',title:'Practical Cryptography',url:'https://cryptography.io/en/latest/'}] },
];

const CATEGORIES = [
  { id:'all',          name:'All Topics',       icon:'🌐' },
  { id:'javascript',   name:'JavaScript',       icon:'⚡' },
  { id:'react',        name:'React',            icon:'⚛️' },
  { id:'python',       name:'Python',           icon:'🐍' },
  { id:'backend',      name:'Backend',          icon:'⚙️' },
  { id:'architecture', name:'System Design',    icon:'🏗️' },
  { id:'devops',       name:'DevOps',           icon:'🔧' },
  { id:'ml',           name:'Machine Learning', icon:'🤖' },
  { id:'security',     name:'Security',         icon:'🔒' },
];

const AdvancedConceptsPage = ({ learnerProfile, currentUser, onBack, onLogout, theme, toggleTheme, isPro = false, onUpgradeClick }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ALL_CONCEPTS.filter(c => {
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.topics.some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleCardClick = (concept) => {
    if (concept.pro && !isPro) { onUpgradeClick?.(); return; }
    setSelectedConcept(concept);
  };

  return (
    <div className="advanced-concepts-page fade-in">
      {/* Search */}
      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search concepts, topics, or keywords..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="search-input" />
        </div>
        {!isPro && (
          <div style={{ textAlign:'center', marginTop:'0.75rem', fontSize:'0.8125rem', color:'var(--text-muted)' }}>
            🔒 <strong style={{ color:'var(--accent-primary)' }}>Pro</strong> unlocks Expert-level concepts
            {' · '}
            <button onClick={onUpgradeClick} style={{ background:'none', border:'none', color:'var(--accent-primary)', cursor:'pointer', fontWeight:600, fontSize:'inherit' }}>
              Upgrade →
            </button>
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="category-filter">
        {CATEGORIES.map(cat => (
          <button key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}>
            <span className="category-icon">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:'1.5rem', padding:'0 1.5rem', marginBottom:'1rem', fontSize:'0.8125rem', color:'var(--text-muted)' }}>
        <span>{filtered.length} concepts</span>
        {!isPro && <span style={{ color:'var(--accent-primary)' }}>{filtered.filter(c => c.pro).length} locked (Pro)</span>}
      </div>

      {/* Concepts grid */}
      <div className="concepts-grid">
        <AnimatePresence mode="wait">
          {filtered.map(concept => (
            <motion.div key={concept.id}
              className={`concept-card ${concept.pro && !isPro ? 'concept-locked' : ''}`}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-20 }} whileHover={{ scale: concept.pro && !isPro ? 1.01 : 1.02 }}
              onClick={() => handleCardClick(concept)} style={{ cursor:'pointer', position:'relative' }}>
              {concept.pro && !isPro && (
                <div style={{ position:'absolute', inset:0, borderRadius:'inherit',
                  background:'rgba(255,255,255,0.7)', backdropFilter:'blur(2px)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  zIndex:2, gap:'0.5rem' }}>
                  <span style={{ fontSize:'1.5rem' }}>🔒</span>
                  <span style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--accent-primary)' }}>Pro Only</span>
                </div>
              )}
              <div className="concept-header">
                <span className="concept-icon">{concept.icon}</span>
                <span className={`difficulty-badge ${concept.difficulty.toLowerCase()}`}>{concept.difficulty}</span>
              </div>
              <h3 className="concept-title">{concept.title}</h3>
              <p className="concept-description">{concept.description}</p>
              <div className="concept-topics">
                {concept.topics.slice(0, 3).map((topic, idx) => (
                  <span key={idx} className="topic-tag">{topic}</span>
                ))}
                {concept.topics.length > 3 && (
                  <span className="topic-tag more">+{concept.topics.length - 3}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No concepts found</h3>
          <p>Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Concept detail modal */}
      <AnimatePresence>
        {selectedConcept && (
          <motion.div className="modal-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setSelectedConcept(null)}>
            <motion.div className="concept-modal"
              initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.9, opacity:0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <span className="modal-icon">{selectedConcept.icon}</span>
                  <h2>{selectedConcept.title}</h2>
                </div>
                <button className="modal-close" onClick={() => setSelectedConcept(null)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="modal-meta">
                  <span className={`difficulty-badge ${selectedConcept.difficulty.toLowerCase()}`}>
                    {selectedConcept.difficulty}
                  </span>
                  <span className="category-badge">
                    {CATEGORIES.find(c => c.id === selectedConcept.category)?.name}
                  </span>
                </div>

                <p className="modal-description">{selectedConcept.description}</p>

                <div className="modal-section">
                  <h3>📚 Key Topics</h3>
                  <div className="topics-list">
                    {selectedConcept.topics.map((topic, idx) => (
                      <span key={idx} className="topic-tag-large">{topic}</span>
                    ))}
                  </div>
                </div>

                {/* Unique code example per concept */}
                {selectedConcept.codeExample && (
                  <div className="modal-section">
                    <h3>💻 Practical Example</h3>
                    <pre className="code-block"><code>{selectedConcept.codeExample}</code></pre>
                  </div>
                )}

                <div className="modal-section">
                  <h3>🔗 Learning Resources</h3>
                  <div className="resources-list">
                    {selectedConcept.resources.map((resource, idx) => (
                      <div key={idx} className="resource-item">
                        <span className="resource-type">{resource.type === 'article' ? '📄' : '🎥'}</span>
                        <div className="resource-info">
                          <h4>{resource.title}</h4>
                          <button className="resource-link"
                            onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}>
                            Open Resource →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedConceptsPage;
