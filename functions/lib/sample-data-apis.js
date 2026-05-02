"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleDataRouter = void 0;
const express = __importStar(require("express"));
exports.sampleDataRouter = express.Router();
// In-memory data store for demonstration
let sampleDatabase = {
    1: { id: 1, name: 'First Item', tags: ['a', 'b'] },
    2: { id: 2, name: 'Second Item', tags: ['b', 'c'] },
};
let nextId = 3;
// 1. Simple Data Types (Structured)
exports.sampleDataRouter.get('/string', (req, res) => res.status(200).send('This is a test string.'));
exports.sampleDataRouter.get('/number', (req, res) => res.status(200).json(12345));
exports.sampleDataRouter.get('/boolean', (req, res) => res.status(200).json(true));
// 2. Simple Structures (Structured)
exports.sampleDataRouter.get('/array', (req, res) => res.status(200).json(['apple', 'banana', 'cherry']));
exports.sampleDataRouter.get('/object', (req, res) => res.status(200).json({ key: 'value', number: 42 }));
// 3. Nested/Complex Structures (Structured)
exports.sampleDataRouter.post('/nested', (req, res) => {
    const { user, data, timestamp } = req.body;
    if (!user || typeof user.id !== 'number' || !Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid data structure. Required: { user: { id: number }, data: array, timestamp: date }' });
    }
    res.status(201).json(req.body);
});
// 4. Path and Query Parameters
exports.sampleDataRouter.get('/item/:id', (req, res) => {
    const item = sampleDatabase[parseInt(req.params.id, 10)];
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json(item);
});
exports.sampleDataRouter.get('/search', (req, res) => {
    const tag = req.query.tag;
    if (!tag) {
        return res.status(400).json({ error: 'Query parameter "tag" is required.' });
    }
    const results = Object.values(sampleDatabase).filter(item => item.tags.includes(tag));
    res.status(200).json(results);
});
// 5. Data Modification
exports.sampleDataRouter.put('/item/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!sampleDatabase[id]) {
        return res.status(404).json({ error: 'Item not found' });
    }
    sampleDatabase[id] = { ...sampleDatabase[id], ...req.body };
    res.status(200).json(sampleDatabase[id]);
});
exports.sampleDataRouter.delete('/item/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!sampleDatabase[id]) {
        return res.status(404).json({ error: 'Item not found' });
    }
    delete sampleDatabase[id];
    res.status(204).send();
});
// 6. Structured, Semi-structured, and Unstructured Data
// Semi-structured: Flexible object with optional fields
exports.sampleDataRouter.post('/event', (req, res) => {
    const { eventName, details } = req.body;
    if (!eventName || typeof eventName !== 'string') {
        return res.status(400).json({ error: 'Invalid data structure. Required: { eventName: string, details?: object }' });
    }
    // Here you would process the event. We'll just echo it back.
    res.status(201).json({ status: 'received', data: req.body });
});
// Unstructured: Raw text log
exports.sampleDataRouter.post('/log', (req, res) => {
    if (typeof req.body !== 'string' || req.body.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty text string.' });
    }
    // Imagine writing this to a logging service or a text file in a storage bucket.
    res.status(201).json({ status: 'log received', length: req.body.length });
});
