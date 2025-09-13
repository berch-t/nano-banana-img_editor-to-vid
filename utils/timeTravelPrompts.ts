export interface TimeTravelPrompt {
  title: string;
  prompt: string;
  description: string;
}

export const TIMETRAVEL_PROMPTS: TimeTravelPrompt[] = [
  {
    title: "Historical Evolution",
    prompt: "evolve through different historical eras from ancient times to modern day",
    description: "Transform through major historical periods"
  },
  {
    title: "Aging Process", 
    prompt: "show natural aging progression from young to elderly",
    description: "See the natural aging process over time"
  },
  {
    title: "Technological Progress",
    prompt: "transform from primitive/ancient to futuristic/high-tech version", 
    description: "Evolution through technological advancement"
  },
  {
    title: "Fashion Through Decades",
    prompt: "change clothing and style from 1920s through each decade to present day",
    description: "Show fashion evolution through the decades"
  },
  {
    title: "Artistic Styles",
    prompt: "reimagine in different art movements from classical to modern abstract",
    description: "Transform through different artistic periods"
  },
  {
    title: "Career Progression",
    prompt: "show professional evolution from beginner/student to expert/master",
    description: "Display career development over time"
  },
  {
    title: "Seasonal Changes",
    prompt: "transform through the four seasons from spring to winter",
    description: "Show changes across different seasons"
  },
  {
    title: "Day to Night",
    prompt: "transition from bright daylight to nighttime with appropriate lighting changes",
    description: "Show the progression from day to night"
  },
  {
    title: "Growth Stages",
    prompt: "show growth from small/young to large/mature stages",
    description: "Display natural growth progression"
  },
  {
    title: "Decay to Renewal",
    prompt: "show transformation from old/worn to restored/renewed condition",
    description: "Journey from deterioration to restoration"
  }
];

export function formatTimeTravelPrompt(userPrompt: string, numImages: number): string {
  return `Create a time progression sequence with ${numImages} stages showing: ${userPrompt}. Each image should represent a distinct stage in the temporal evolution, maintaining the core subject while showing clear progression through time.`;
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