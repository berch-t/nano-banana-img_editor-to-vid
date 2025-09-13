import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userPrompt, numStages } = await request.json();

    if (!userPrompt || !numStages) {
      return NextResponse.json(
        { error: 'Missing required parameters: userPrompt, numStages' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    console.log(`🤖 Generating ${numStages} prompts for: "${userPrompt}"`);

    const systemPrompt = `You are an expert at creating detailed image editing prompts for AI image generation. 

Given a user's time progression request and number of stages, create ${numStages} specific, detailed prompts that will generate a clear progression through time.

User request: "${userPrompt}"
Number of stages: ${numStages}

For each stage, provide:
1. A short descriptive stage name (2-3 words)
2. A detailed, specific prompt for image editing that will create that stage

Requirements:
- Each prompt should be very specific and detailed
- Prompts should create a clear progression from one stage to the next
- Focus on visual changes that an AI image model can execute
- Use descriptive language about appearance, style, setting, lighting, etc.
- Each stage should be distinctly different from the others

Response format (JSON):
{
  "stages": [
    {
      "stage": "Stage Name",
      "prompt": "Detailed prompt for this stage of the progression",
      "stageNumber": 1
    }
  ]
}

Example for "show aging from young to old" with 3 stages:
{
  "stages": [
    {
      "stage": "Young Adult",
      "prompt": "Transform the person to appear as a young adult (22 years old) with smooth youthful skin, bright clear eyes, no wrinkles, vibrant hair color, and energetic appearance",
      "stageNumber": 1
    },
    {
      "stage": "Middle-aged",
      "prompt": "Transform the person to appear middle-aged (45 years old) with some wrinkles around the eyes, slightly graying hair at temples, mature facial features, and signs of life experience",
      "stageNumber": 2
    },
    {
      "stage": "Elderly",
      "prompt": "Transform the person to appear elderly (75 years old) with deep wrinkles, completely gray or white hair, age spots, weathered skin, and wise, experienced features",
      "stageNumber": 3
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Create ${numStages} stages for: "${userPrompt}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = response.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsedResult = JSON.parse(responseText);
      
      if (!parsedResult.stages || !Array.isArray(parsedResult.stages)) {
        throw new Error('Invalid response format from OpenAI');
      }

      console.log(`✅ Generated ${parsedResult.stages.length} prompts successfully`);
      
      return NextResponse.json(parsedResult);
    } catch {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid JSON response from OpenAI');
    }

  } catch (error) {
    console.error('🚨 Error generating prompts:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate prompts. Please try again.' },
      { status: 500 }
    );
  }
}