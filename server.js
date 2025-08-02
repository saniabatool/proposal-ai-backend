require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

// Use environment variable for API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.use(cors({
  origin: "https://ai-proposal-writer-bysania.netlify.app/",
  credentials:true
})); // Allows your React app to connect to this server
app.use(express.json());

app.post('/api/generate-proposal', async (req, res) => {
  const { jobTitle, jobDescription } = req.body;

  if (!jobTitle || !jobDescription) {
    return res.status(400).json({ error: 'Job title and description are required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `You are a professional Upwork proposal writer. Your task is to write a compelling, professional, and client-winning proposal based on the provided job details. The proposal should be concise, highlight relevant skills, and show a clear understanding of the project. Do not include a final signature like 'Sincerely' or 'Best regards'.

    Job Title: ${jobTitle}
    Job Description: ${jobDescription}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const proposalText = response.text();

    res.json({ proposal: proposalText });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate proposal from AI.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});