const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => res.json({ api: 'v1', status: 'ok' }));

module.exports = router;