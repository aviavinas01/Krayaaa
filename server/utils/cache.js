 const cache = new Map();

export function withCache(key, ttl, fetchFn) {
  const now = Date.now();

  if (cache.has(key)) {
    const { data, expires } = cache.get(key);
    if (now < expires) return Promise.resolve(data);
  }

  return fetchFn().then(data => {
    cache.set(key, { data, expires: now + ttl });
    return data;
  });
}
