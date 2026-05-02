
import express from 'express';

const router = express.Router();

// Clinical Health Check - Respecting "Sovereign Ledger" precision
router.get('/health', (req, res) => {
  res.status(200).send({
    status: 'operational',
    timestamp: new Date().toISOString(),
    system: 'Sovereign Ledger API'
  });
});

export { router as healthRouter };
