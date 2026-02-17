const router = require('express').Router();
const auth = require('../middleware/auth');
const requireProfile = require('../middleware/requireProfile');
const { FIXED_THREADS, findThread } = require('../utils/fixedThreads');

// GET /forums/threads
router.get('/threads', (req, res) => {
  res.json(FIXED_THREADS);
});

// GET /forums/threads/:key
router.get('/threads/:key',   (req, res) => {
  const thread = findThread(req.params.key);
  if (!thread) {
    return res.status(404).json({ msg: 'Thread not found' });
  }
  res.json(thread);
});

module.exports = router;
