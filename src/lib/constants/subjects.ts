import { Beaker, Cpu, Wrench, Palette, Calculator } from 'lucide-react';
import type { SubjectProgressType } from '../types';

export const SUBJECTS: SubjectProgressType[] = [
  {
    subject: '理科',
    progress: 0,
    color: 'bg-blue-600',
    icon: <Beaker className="h-5 w-5 text-blue-600" />
  },
  {
    subject: '技術',
    progress: 0,
    color: 'bg-purple-600',
    icon: <Cpu className="h-5 w-5 text-purple-600" />
  },
  {
    subject: '工学',
    progress: 0,
    color: 'bg-orange-600',
    icon: <Wrench className="h-5 w-5 text-orange-600" />
  },
  {
    subject: '芸術',
    progress: 0,
    color: 'bg-pink-600',
    icon: <Palette className="h-5 w-5 text-pink-600" />
  },
  {
    subject: '数学',
    progress: 0,
    color: 'bg-green-600',
    icon: <Calculator className="h-5 w-5 text-green-600" />
  }
] as const; 