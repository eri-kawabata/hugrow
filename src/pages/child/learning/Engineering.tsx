import React from 'react';
import { SubjectLearning } from '@/components/Learning/SubjectLearning';
import { subjectConfigs } from '@/components/Learning/configs';

export function Engineering() {
  return <SubjectLearning config={subjectConfigs} />;
} 