const Interview = require('../models/Interview');

const buildQuestions = (resumeText = '', difficulty = 'medium', domain = 'General') => {
  const baseByDifficulty = {
    easy: [
      `In simple words, what does a ${domain} professional do?`,
      'Give a simple overview of your background and why this role fits you.',
      'Share a straightforward example of teamwork and what you learned.',
      'What is one skill you are proud of and how did you build it?',
      `Explain a basic concept you often use in ${domain}.`,
    ],
    medium: [
      'Tell me about yourself and how your experience aligns with the role.',
      'Describe a time you solved a complex problem under pressure.',
      'How do you prioritize tasks when everything feels urgent?',
      `Walk me through a project where you delivered measurable impact in ${domain}.`,
      'Describe a time you had to convince a stakeholder using data.',
    ],
    hard: [
      'Walk me through a project where you made a high‑impact decision with limited data.',
      'Explain a technical or domain trade‑off you made and how you justified it.',
      'Describe a failure that affected results and how you corrected course.',
      `Design a solution for a challenging ${domain} problem and discuss trade‑offs.`,
      'How would you measure success for a complex initiative, and why those metrics?',
    ],
  };

  const base = baseByDifficulty[difficulty] || baseByDifficulty.medium;

  const keywords = resumeText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  const top = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([word]) => word);

  const difficultyPrompts = {
    easy: 'Explain in simple terms',
    medium: 'Walk me through',
    hard: 'Deep dive into',
  };

  const resumeQuestions = top.length
    ? top.map(
        (word) =>
          `${difficultyPrompts[difficulty] || difficultyPrompts.medium} your experience with ${word} and how it impacts ${domain} work.`
      )
    : [
        `${difficultyPrompts[difficulty] || difficultyPrompts.medium} a recent project that demonstrates your strengths.`,
        `${difficultyPrompts[difficulty] || difficultyPrompts.medium} a challenge you faced and how you overcame it.`,
      ];

  const combined = [...base, ...resumeQuestions];
  // Shuffle to avoid repeating the same ordering across levels
  for (let i = combined.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.slice(0, 6);
};

const parseQuestionList = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((q) => typeof q === 'string' && q.trim()).slice(0, 6);
    }
  } catch (err) {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          return parsed.filter((q) => typeof q === 'string' && q.trim()).slice(0, 6);
        }
      } catch (innerErr) {
        return null;
      }
    }
  }
  return null;
};

const generateWithOpenAI = async ({ resumeText, difficulty, domain }) => {
  if (!process.env.OPENAI_API_KEY) return null;

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt =
    'You are an expert interview coach. Generate concise, high-quality interview questions.' +
    ' Difficulty must strongly affect the depth and complexity. Return ONLY a JSON array of 6 strings. No extra text.';

  const userPrompt = `
Target domain: ${domain}
Difficulty: ${difficulty}
Resume highlights:
${resumeText || 'No resume text provided.'}

Create questions that are specific to the resume, mix behavioral and technical/domain topics, and avoid repeating the same theme.
Difficulty guidance:
- easy: simple, beginner‑friendly, minimal jargon.
- medium: moderate depth, realistic interview level.
- hard: deep reasoning, trade‑offs, metrics, leadership impact.
Ensure the six questions are clearly different between difficulties for the same resume.
Return JSON array only.
`.trim();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return parseQuestionList(content);
};

const generateQuestions = async (req, res, next) => {
  try {
    const { resumeText, difficulty, domain } = req.body;

    const payload = {
      resumeText: resumeText || '',
      difficulty: difficulty || 'medium',
      domain: domain || 'General',
    };

    const aiQuestions = await generateWithOpenAI(payload);
    const questions = aiQuestions?.length
      ? aiQuestions
      : buildQuestions(payload.resumeText, payload.difficulty, payload.domain);

    return res.json({
      questions,
    });
  } catch (err) {
    return next(err);
  }
};

const createInterview = async (req, res, next) => {
  try {
    const { score, feedback, domain, difficulty, questions, answers } = req.body;

    if (score === undefined || feedback === undefined || !domain || !difficulty) {
      return res
        .status(400)
        .json({ message: 'Score, feedback, domain, and difficulty are required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions are required' });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    const interview = await Interview.create({
      score,
      feedback,
      domain,
      difficulty,
      questions,
      answers,
      user: req.user._id,
    });

    return res.status(201).json({ interview });
  } catch (err) {
    return next(err);
  }
};

const listInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ interviews });
  } catch (err) {
    return next(err);
  }
};

const clearInterviews = async (req, res, next) => {
  try {
    await Interview.deleteMany({ user: req.user._id });
    return res.json({ message: 'Interview history cleared' });
  } catch (err) {
    return next(err);
  }
};

const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Interview.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    return res.json({ message: 'Interview removed' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createInterview, listInterviews, generateQuestions, clearInterviews, deleteInterview };
