
import * as express from 'express';

export const sampleDataRouter = express.Router();

// In-memory data store for demonstration
let sampleDatabase: { [id: number]: any } = {
  1: { id: 1, name: 'First Item', tags: ['a', 'b'] },
  2: { id: 2, name: 'Second Item', tags: ['b', 'c'] },
};
let nextId = 3;

// 1. Simple Data Types (Structured)
sampleDataRouter.get('/string', (req, res) => res.status(200).send('This is a test string.'));
sampleDataRouter.get('/number', (req, res) => res.status(200).json(12345));
sampleDataRouter.get('/boolean', (req, res) => res.status(200).json(true));

// 2. Simple Structures (Structured)
sampleDataRouter.get('/array', (req, res) => res.status(200).json(['apple', 'banana', 'cherry']));
sampleDataRouter.get('/object', (req, res) => res.status(200).json({ key: 'value', number: 42 }));

// 3. Nested/Complex Structures (Structured)
sampleDataRouter.post('/nested', (req, res) => {
  const { user, data, timestamp } = req.body;
  if (!user || typeof user.id !== 'number' || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid data structure. Required: { user: { id: number }, data: array, timestamp: date }' });
  }
  res.status(201).json(req.body);
});

// 4. Path and Query Parameters
sampleDataRouter.get('/item/:id', (req, res) => {
  const item = sampleDatabase[parseInt(req.params.id, 10)];
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.status(200).json(item);
});

sampleDataRouter.get('/search', (req, res) => {
  const tag = req.query.tag as string;
  if (!tag) {
    return res.status(400).json({ error: 'Query parameter "tag" is required.' });
  }
  const results = Object.values(sampleDatabase).filter(item => item.tags.includes(tag));
  res.status(200).json(results);
});

// 5. Data Modification
sampleDataRouter.put('/item/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!sampleDatabase[id]) {
        return res.status(404).json({ error: 'Item not found' });
    }
    sampleDatabase[id] = { ...sampleDatabase[id], ...req.body };
    res.status(200).json(sampleDatabase[id]);
});

sampleDataRouter.delete('/item/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!sampleDatabase[id]) {
        return res.status(404).json({ error: 'Item not found' });
    }
    delete sampleDatabase[id];
    res.status(204).send();
});

// 6. Structured, Semi-structured, and Unstructured Data

// Semi-structured: Flexible object with optional fields
sampleDataRouter.post('/event', (req, res) => {
    const { eventName, details } = req.body;
    if (!eventName || typeof eventName !== 'string') {
        return res.status(400).json({ error: 'Invalid data structure. Required: { eventName: string, details?: object }' });
    }
    // Here you would process the event. We'll just echo it back.
    res.status(201).json({ status: 'received', data: req.body });
});

// Unstructured: Raw text log
sampleDataRouter.post('/log', (req, res) => {
    if (typeof req.body !== 'string' || req.body.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty text string.' });
    }
    // Imagine writing this to a logging service or a text file in a storage bucket.
    res.status(201).json({ status: 'log received', length: req.body.length });
});
