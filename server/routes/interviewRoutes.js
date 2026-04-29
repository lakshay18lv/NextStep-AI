const express = require('express');
const { createInterview, listInterviews, generateQuestions, clearInterviews, deleteInterview } = require('../controllers/interviewController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/generate', authMiddleware, generateQuestions);
router.get('/', authMiddleware, listInterviews);
router.delete('/', authMiddleware, clearInterviews);
router.delete('/:id', authMiddleware, deleteInterview);
router.post('/', authMiddleware, createInterview);

module.exports = router;
