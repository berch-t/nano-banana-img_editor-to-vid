export interface StagePrompt {
  stage: string;
  prompt: string;
  stageNumber: number;
}

interface ProgressionPattern {
  pattern: RegExp;
  type: string;
  generator: (userPrompt: string, numStages: number) => StagePrompt[];
}

// Age-related terms and their numerical equivalents
const AGE_TERMS: Record<string, number> = {
  'baby': 0,
  'infant': 1,
  'toddler': 3,
  'child': 8,
  'kid': 10,
  'teen': 15,
  'teenager': 16,
  'young': 20,
  'adult': 30,
  'middle-aged': 45,
  'mature': 50,
  'senior': 65,
  'elderly': 70,
  'old': 75,
  'ancient': 90
};

// Time period mappings
const TIME_PERIODS: Record<string, string> = {
  'ancient': 'ancient times (3000 BC - 500 AD)',
  'classical': 'classical antiquity (800 BC - 600 AD)',
  'medieval': 'medieval period (500 - 1500 AD)',
  'renaissance': 'Renaissance era (1400 - 1600 AD)',
  'industrial': 'industrial revolution era (1760 - 1840 AD)',
  'victorian': 'Victorian era (1837 - 1901 AD)',
  'modern': 'modern era (1900 - 1950 AD)',
  'contemporary': 'contemporary times (1950 - present)',
  'futuristic': 'futuristic/sci-fi setting',
  'future': 'far future (2100+ AD)'
};

// Season progression
const SEASONS = ['winter', 'spring', 'summer', 'autumn/fall'];

// Time of day progression
const TIME_OF_DAY = [
  { time: 'dawn', description: 'early dawn with soft morning light' },
  { time: 'morning', description: 'bright morning with clear sunlight' },
  { time: 'noon', description: 'midday with strong overhead sun' },
  { time: 'afternoon', description: 'late afternoon with warm golden light' },
  { time: 'dusk', description: 'evening dusk with soft twilight' },
  { time: 'night', description: 'deep night with moonlight and stars' }
];

function interpolateAges(startAge: number, endAge: number, numStages: number): number[] {
  const ages: number[] = [];
  for (let i = 0; i < numStages; i++) {
    const progress = i / (numStages - 1);
    const age = Math.round(startAge + (endAge - startAge) * progress);
    ages.push(age);
  }
  return ages;
}

function generateAgingPrompts(userPrompt: string, numStages: number): StagePrompt[] {
  // For aging, create very specific age-based prompts
  const ages = interpolateAges(18, 75, numStages); // Young adult to elderly
  
  return ages.map((age, index) => {
    let ageDescription = '';
    let stageLabel = '';
    let detailedPrompt = '';
    
    if (age <= 25) {
      ageDescription = `young adult around ${age} years old`;
      stageLabel = 'Young';
      detailedPrompt = `Make the person appear as a young adult (${age} years old) with youthful skin, bright eyes, no wrinkles, and vibrant appearance`;
    } else if (age <= 35) {
      ageDescription = `adult around ${age} years old`;
      stageLabel = 'Adult';
      detailedPrompt = `Make the person appear as a ${age}-year-old adult with mature features but still youthful skin and minimal signs of aging`;
    } else if (age <= 50) {
      ageDescription = `middle-aged person around ${age} years old`;
      stageLabel = 'Middle-aged';
      detailedPrompt = `Make the person appear as a ${age}-year-old with some wrinkles around eyes, slightly graying hair, and mature adult features`;
    } else if (age <= 65) {
      ageDescription = `mature person around ${age} years old`;
      stageLabel = 'Mature';
      detailedPrompt = `Make the person appear as a ${age}-year-old with noticeable wrinkles, graying hair, age spots, and mature facial features`;
    } else {
      ageDescription = `elderly person around ${age} years old`;
      stageLabel = 'Elderly';
      detailedPrompt = `Make the person appear as an elderly ${age}-year-old with deep wrinkles, white/gray hair, age spots, and weathered features showing wisdom and age`;
    }

    return {
      stage: stageLabel,
      prompt: detailedPrompt,
      stageNumber: index + 1
    };
  });
}

function generateHistoricalPrompts(userPrompt: string, numStages: number): StagePrompt[] {
  // Extract time periods mentioned
  const periods = Object.keys(TIME_PERIODS);
  const foundPeriods = periods.filter(period => 
    userPrompt.toLowerCase().includes(period)
  );

  let selectedPeriods: string[] = [];
  
  if (foundPeriods.length >= 2) {
    selectedPeriods = foundPeriods.slice(0, numStages);
  } else {
    // Default progression from ancient to future
    const defaultProgression = ['ancient', 'medieval', 'modern', 'contemporary', 'futuristic'];
    selectedPeriods = defaultProgression.slice(0, numStages);
  }

  // Fill remaining stages if needed
  while (selectedPeriods.length < numStages) {
    selectedPeriods.push('futuristic');
  }

  return selectedPeriods.map((period, index) => ({
    stage: period.charAt(0).toUpperCase() + period.slice(1),
    prompt: `transform the scene/subject to ${TIME_PERIODS[period]} style and setting`,
    stageNumber: index + 1
  }));
}

function generateSeasonalPrompts(userPrompt: string, numStages: number): StagePrompt[] {
  let seasons = SEASONS.slice(0, numStages);
  if (seasons.length < numStages) {
    // Repeat the cycle if needed
    while (seasons.length < numStages) {
      seasons = seasons.concat(SEASONS);
    }
    seasons = seasons.slice(0, numStages);
  }

  return seasons.map((season, index) => ({
    stage: season.charAt(0).toUpperCase() + season.slice(1),
    prompt: `transform the scene to ${season} setting with appropriate weather, lighting, and seasonal elements`,
    stageNumber: index + 1
  }));
}

function generateTimeOfDayPrompts(userPrompt: string, numStages: number): StagePrompt[] {
  let timeSlots = TIME_OF_DAY.slice(0, numStages);
  if (timeSlots.length < numStages) {
    timeSlots = TIME_OF_DAY.slice(0, numStages);
  }

  return timeSlots.map((timeSlot, index) => ({
    stage: timeSlot.time.charAt(0).toUpperCase() + timeSlot.time.slice(1),
    prompt: `transform the lighting and atmosphere to ${timeSlot.description}`,
    stageNumber: index + 1
  }));
}

function parseFromToPrompt(userPrompt: string, numStages: number): StagePrompt[] | null {
  // Match patterns like "from X to Y" or "X to Y"
  const fromToPattern = /(?:from\s+)?(.+?)\s+to\s+(.+?)(?:\s|$)/i;
  const match = userPrompt.match(fromToPattern);
  
  if (!match) return null;
  
  const [, startState, endState] = match;
  
  return Array.from({ length: numStages }, (_, index) => {
    const progress = index / (numStages - 1);
    const stageLabel = index === 0 ? 'Start' : 
                     index === numStages - 1 ? 'End' : 
                     `Stage ${index + 1}`;
    
    let prompt = '';
    if (index === 0) {
      prompt = `transform to emphasize ${startState.trim()} characteristics`;
    } else if (index === numStages - 1) {
      prompt = `transform to emphasize ${endState.trim()} characteristics`;
    } else {
      const progressPercent = Math.round(progress * 100);
      prompt = `transform to be ${progressPercent}% towards ${endState.trim()} from ${startState.trim()}`;
    }
    
    return {
      stage: stageLabel,
      prompt,
      stageNumber: index + 1
    };
  });
}

function generateGenericProgression(userPrompt: string, numStages: number): StagePrompt[] {
  // Generic progression based on intensity or development
  const intensityWords = ['subtle', 'moderate', 'strong', 'intense', 'extreme'];
  const developmentWords = ['beginning', 'developing', 'advanced', 'mature', 'complete'];
  
  return Array.from({ length: numStages }, (_, index) => {
    const progress = index / (numStages - 1);
    const intensityLevel = Math.floor(progress * (intensityWords.length - 1));
    const developmentLevel = Math.floor(progress * (developmentWords.length - 1));
    
    const stageLabel = developmentWords[developmentLevel] || `Stage ${index + 1}`;
    const intensityModifier = intensityWords[intensityLevel] || 'moderate';
    
    return {
      stage: stageLabel.charAt(0).toUpperCase() + stageLabel.slice(1),
      prompt: `apply a ${intensityModifier} level of transformation: ${userPrompt}`,
      stageNumber: index + 1
    };
  });
}

// Main progression patterns
const PROGRESSION_PATTERNS: ProgressionPattern[] = [
  {
    pattern: /\b(ag(e|ing)|young.*old|old.*young|child.*elder|baby.*adult)\b/i,
    type: 'aging',
    generator: generateAgingPrompts
  },
  {
    pattern: /\b(historical|ancient.*modern|past.*future|medieval|renaissance|victorian)\b/i,
    type: 'historical',
    generator: generateHistoricalPrompts
  },
  {
    pattern: /\b(season|spring|summer|autumn|fall|winter)\b/i,
    type: 'seasonal',
    generator: generateSeasonalPrompts
  },
  {
    pattern: /\b(day.*night|dawn.*dusk|morning.*evening|sunrise.*sunset)\b/i,
    type: 'timeOfDay',
    generator: generateTimeOfDayPrompts
  }
];

export async function generateTimeTravelStagesWithLLM(userPrompt: string, numStages: number): Promise<StagePrompt[]> {
  try {
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

    const response = await fetch('/api/generate-prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userPrompt,
        numStages
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompts with LLM');
    }

    const data = await response.json();
    return data.stages;
  } catch (error) {
    console.error('Error generating prompts with LLM, falling back to hardcoded logic:', error);
    // Fallback to the original logic
    return generateTimeTravelStagesFallback(userPrompt, numStages);
  }
}

// Fallback function with original logic
function generateTimeTravelStagesFallback(userPrompt: string, numStages: number): StagePrompt[] {
  // First try to parse "from X to Y" patterns
  const fromToResult = parseFromToPrompt(userPrompt, numStages);
  if (fromToResult) {
    return fromToResult;
  }

  // Then try specific progression patterns
  for (const pattern of PROGRESSION_PATTERNS) {
    if (pattern.pattern.test(userPrompt)) {
      return pattern.generator(userPrompt, numStages);
    }
  }

  // Fallback to generic progression
  return generateGenericProgression(userPrompt, numStages);
}

// Keep the original function for backwards compatibility
export function generateTimeTravelStages(userPrompt: string, numStages: number): StagePrompt[] {
  return generateTimeTravelStagesFallback(userPrompt, numStages);
}

export function getTimeTravelStageLabel(index: number, total: number): string {
  if (total <= 3) {
    const labels = ['Beginning', 'Middle', 'End'];
    return labels[index] || `Stage ${index + 1}`;
  } else if (total === 4) {
    const labels = ['Early', 'Developing', 'Advanced', 'Final'];
    return labels[index] || `Stage ${index + 1}`;
  } else {
    const labels = ['Origin', 'Early', 'Middle', 'Late', 'Present'];
    return labels[index] || `Stage ${index + 1}`;
  }
}