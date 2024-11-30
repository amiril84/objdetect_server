import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { OpenAI } from 'openai';
import sharp from 'sharp';

dotenv.config();

interface Analysis {
  objectName: string;
  defect: 'Yes' | 'No';
  explanation: string;
}

interface AnalysisResult {
  thumbnail: string;
  objectName: string;
  defect: 'Yes' | 'No';
  explanation: string;
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint to handle image uploads and analysis
app.post('/api/analyze', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const results = await Promise.all(
      (req.files as Express.Multer.File[]).map(async (file) => {
        // Generate thumbnail
        const thumbnail = await sharp(file.buffer)
          .resize(200, 200, { fit: 'contain' })
          .toBuffer();

        // Convert image to base64 for OpenAI API
        const base64Image = file.buffer.toString('base64');

        // Analyze image with OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: `You are an expert image analyst assisting with defect detection and object condition analysis. Analyze the following image and provide a detailed response in JSON format.

Tasks:
1. Identify the object: Name the primary object in the image
2. Defect Analysis: First describe what you see, then decide if it's a defect
3. Condition Description: Provide specific details about any imperfections

Return ONLY a JSON object in this format:
{
  "objectName": "[Object name]",
  "initialObservation": "[Describe exactly what you see without judgment]",
  "defectAnalysis": "[Explain why this is or isn't a defect]",
  "defect": "[Yes/No]",
  "explanation": "[Final detailed description]"
}

Before returning, verify:
- If your explanation mentions ANY defect/damage/imperfection, "defect" MUST be "Yes"
- "defect" can ONLY be "Yes" or "No"`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${file.mimetype};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        });

        let analysis;
        try {
          const content = response.choices[0].message.content || '{}';
          const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
          const fullAnalysis = JSON.parse(jsonStr);
          
          // Extract the final result
          analysis = {
            objectName: fullAnalysis.objectName,
            defect: fullAnalysis.defect,
            explanation: fullAnalysis.explanation
          };
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          analysis = {
            objectName: 'Unknown',
            defect: 'No',
            explanation: 'Error analyzing image'
          };
        }

        return {
          thumbnail: `data:image/jpeg;base64,${thumbnail.toString('base64')}`,
          objectName: analysis.objectName,
          defect: analysis.defect as 'Yes' | 'No',
          explanation: analysis.explanation
        } as AnalysisResult;
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).json({ error: 'Error processing images' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
