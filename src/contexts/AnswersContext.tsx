import { createContext, useContext, useState, ReactNode } from 'react';
import { Option } from '@/types/quiz';

interface AnswersContextType {
  answers: Map<number, string | Option>;
  setAnswers: (answers: Map<number, string | Option>) => void;
  clearAnswers: () => void;
}

const AnswersContext = createContext<AnswersContextType | undefined>(undefined);

export function AnswersProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Map<number, string | Option>>(new Map());

  const clearAnswers = () => {
    setAnswers(new Map());
  };

  return (
    <AnswersContext.Provider value={{ answers, setAnswers, clearAnswers }}>
      {children}
    </AnswersContext.Provider>
  );
}

export function useAnswers() {
  const context = useContext(AnswersContext);
  if (context === undefined) {
    throw new Error('useAnswers must be used within an AnswersProvider');
  }
  return context;
}