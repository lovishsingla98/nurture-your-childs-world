// Career options configuration - can be moved to backend API in the future
import { CareerPath } from './types';

export const popularCareers: CareerPath[] = [
  {
    id: 'engineer',
    name: 'Engineer',
    category: 'STEM & Technology',
    description: 'Design and build solutions to solve problems using science, technology, engineering, and math.',
    skills: ['Problem-solving', 'Logical thinking', 'Building & construction', 'Math skills'],
    activities: ['Building challenges', 'Coding basics', 'Science experiments', 'Math games']
  },
  {
    id: 'architect',
    name: 'Architect',
    category: 'Design & Construction',
    description: 'Create blueprints and designs for buildings, houses, and structures.',
    skills: ['Visual-spatial skills', 'Creative design', 'Mathematical thinking', 'Attention to detail'],
    activities: ['Drawing and sketching', 'Building with different materials', 'Study famous buildings', 'Design challenges']
  },
  {
    id: 'scientist',
    name: 'Scientist',
    category: 'Research & Discovery',
    description: 'Discover new knowledge about how the world works through experiments and research.',
    skills: ['Curiosity', 'Analytical thinking', 'Observation skills', 'Pattern recognition'],
    activities: ['Science experiments', 'Nature observation', 'Data collection', 'Hypothesis testing']
  },
  {
    id: 'doctor',
    name: 'Doctor',
    category: 'Healthcare & Medicine',
    description: 'Help people stay healthy and treat illnesses and injuries.',
    skills: ['Empathy', 'Problem-solving', 'Communication', 'Attention to detail'],
    activities: ['First aid basics', 'Health awareness', 'Anatomy learning', 'Medical role-play']
  },
  {
    id: 'teacher',
    name: 'Teacher',
    category: 'Education & Learning',
    description: 'Help others learn new things and share knowledge.',
    skills: ['Communication', 'Patience', 'Creativity', 'Leadership'],
    activities: ['Teaching others', 'Creating lessons', 'Storytelling', 'Group activities']
  },
  {
    id: 'artist',
    name: 'Artist',
    category: 'Creative Arts',
    description: 'Express ideas and emotions through visual art, music, or performance.',
    skills: ['Creativity', 'Visual expression', 'Imagination', 'Fine motor skills'],
    activities: ['Drawing and painting', 'Craft projects', 'Music exploration', 'Creative storytelling']
  },
  {
    id: 'chef',
    name: 'Chef',
    category: 'Culinary Arts',
    description: 'Create delicious meals and explore different flavors and cooking techniques.',
    skills: ['Creativity', 'Following instructions', 'Taste exploration', 'Kitchen safety'],
    activities: ['Simple cooking', 'Taste testing', 'Recipe following', 'Food exploration']
  },
  {
    id: 'athlete',
    name: 'Athlete',
    category: 'Sports & Fitness',
    description: 'Compete in sports and maintain physical fitness and health.',
    skills: ['Physical coordination', 'Teamwork', 'Determination', 'Fair play'],
    activities: ['Sports practice', 'Physical challenges', 'Team games', 'Fitness activities']
  },
  {
    id: 'pilot',
    name: 'Pilot',
    category: 'Transportation & Aviation',
    description: 'Fly airplanes and helicopters, helping people travel safely.',
    skills: ['Spatial awareness', 'Quick decision-making', 'Technical knowledge', 'Responsibility'],
    activities: ['Flight simulation', 'Aerodynamics learning', 'Navigation basics', 'Aviation exploration']
  },
  {
    id: 'veterinarian',
    name: 'Veterinarian',
    category: 'Animal Care',
    description: 'Take care of animals and help them stay healthy.',
    skills: ['Compassion', 'Observation', 'Gentleness', 'Problem-solving'],
    activities: ['Animal care', 'Pet observation', 'Nature study', 'Animal behavior learning']
  }
];

// Helper function to get career by ID
export const getCareerById = (id: string): CareerPath | undefined => {
  return popularCareers.find(career => career.id === id);
};

// Helper function to get careers by category
export const getCareersByCategory = (category: string): CareerPath[] => {
  return popularCareers.filter(career => career.category === category);
};

// Helper function to get all categories
export const getCareerCategories = (): string[] => {
  return [...new Set(popularCareers.map(career => career.category))];
};
