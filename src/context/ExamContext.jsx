// src/context/ExamContext.jsx
// Manages the active exam event and its state machine transitions
import { createContext, useContext, useState, useCallback } from 'react';

const ExamContext = createContext(null);
export const useExam = () => useContext(ExamContext);

// Valid state transitions
const TRANSITIONS = {
  draft: ['configured'],
  configured: ['allocated'],
  allocated: ['configured', 'published'],
  published: ['allocated', 'completed'],
  completed: ['archived'],
  archived: [],
};

export const EXAM_STATES = ['draft', 'configured', 'allocated', 'published', 'completed', 'archived'];

export const STATE_COLORS = {
  draft: { bg: 'bg-[#7d8590]/10', border: 'border-[#7d8590]/40', text: 'text-[#7d8590]', dot: '#7d8590' },
  configured: { bg: 'bg-[#1f6feb]/10', border: 'border-[#1f6feb]/40', text: 'text-[#58a6ff]', dot: '#58a6ff' },
  allocated: { bg: 'bg-[#f0a500]/10', border: 'border-[#f0a500]/40', text: 'text-[#f0a500]', dot: '#f0a500' },
  published: { bg: 'bg-[#3fb950]/10', border: 'border-[#3fb950]/40', text: 'text-[#3fb950]', dot: '#3fb950' },
  completed: { bg: 'bg-[#a371f7]/10', border: 'border-[#a371f7]/40', text: 'text-[#a371f7]', dot: '#a371f7' },
  archived: { bg: 'bg-[#484f58]/10', border: 'border-[#484f58]/40', text: 'text-[#484f58]', dot: '#484f58' },
};

export function canTransition(from, to) {
  return TRANSITIONS[from]?.includes(to) || false;
}

export function getNextStates(currentState) {
  return TRANSITIONS[currentState] || [];
}

export function ExamProvider({ children }) {
  const [currentEvent, setCurrentEvent] = useState(null);

  const transitionState = useCallback((newState, dispatch) => {
    if (!currentEvent) return false;
    if (!canTransition(currentEvent.status, newState)) return false;
    const updated = { ...currentEvent, status: newState, [`${newState}At`]: new Date().toISOString() };
    setCurrentEvent(updated);
    if (dispatch) {
      dispatch({ type: 'UPDATE_EXAM_EVENT', payload: updated });
    }
    return true;
  }, [currentEvent]);

  return (
    <ExamContext.Provider value={{ currentEvent, setCurrentEvent, transitionState, canTransition, getNextStates }}>
      {children}
    </ExamContext.Provider>
  );
}
