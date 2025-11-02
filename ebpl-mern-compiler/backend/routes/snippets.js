const express = require('express');
const Snippet = require('../models/Snippet');
const router = express.Router();

// Get all public snippets
router.get('/', async (req, res) => {
  try {
    const snippets = await Snippet.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// Create new snippet
router.post('/', async (req, res) => {
  try {
    const { title, description, sourceCode, tags, isPublic } = req.body;
    
    const snippet = new Snippet({
      title,
      description,
      sourceCode,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true
    });

    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create snippet' });
  }
});

// Get snippet by ID
router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
});

module.exports = router;