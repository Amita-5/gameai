import { useState, useCallback } from 'react';
import { ClarifierAgent, PlannerAgent, BuilderAgent } from './Agents';
import { AgentLog, AgentStatus, GameFiles, GamePlan } from '../types/agent';

export function useOrchestrator() {
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [plan, setPlan] = useState<GamePlan | null>(null);
  const [files, setFiles] = useState<GameFiles | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [clarificationHistory, setClarificationHistory] = useState<string[]>([]);

  const addLog = useCallback((agent: string, message: string, type: AgentLog['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      agent,
      message,
      timestamp: Date.now(),
      type
    }]);
  }, []);

  const startGeneration = async (userInput: string, answers: string[] = []) => {
    try {
      const history = [...clarificationHistory, ...answers];
      setClarificationHistory(history);
      
      setStatus(AgentStatus.CLARIFYING);
      addLog('Orchestrator', 'Starting clarification phase...');
      
      const clarifier = new ClarifierAgent();
      const clarification = await clarifier.clarify(userInput, history);

      if (!clarification.isClear && clarification.questions.length > 0) {
        setQuestions(clarification.questions);
        addLog('Clarifier', `Need more info: ${clarification.questions.join(', ')}`, 'warning');
        setStatus(AgentStatus.IDLE);
        return;
      }

      setQuestions([]);
      addLog('Clarifier', 'Requirements clear. Proceeding to planning.', 'success');
      
      setStatus(AgentStatus.PLANNING);
      const planner = new PlannerAgent();
      const gamePlan = await planner.plan(userInput, history);
      setPlan(gamePlan);
      addLog('Planner', `Generated plan for "${gamePlan.title}"`, 'success');

      setStatus(AgentStatus.BUILDING);
      addLog('Builder', 'Generating game files...', 'info');
      const builder = new BuilderAgent();
      const gameFiles = await builder.build(gamePlan);
      
      // Basic Validation
      if (!gameFiles.html.includes('<script') || !gameFiles.js.includes('requestAnimationFrame') && !gameFiles.js.includes('Phaser')) {
        addLog('Validator', 'Game loop or script tags missing. Retrying...', 'warning');
        // Simple retry logic
        const retryFiles = await builder.build(gamePlan);
        setFiles(retryFiles);
      } else {
        setFiles(gameFiles);
      }

      setStatus(AgentStatus.COMPLETED);
      addLog('Orchestrator', 'Game generation complete!', 'success');

    } catch (error: any) {
      console.error(error);
      setStatus(AgentStatus.ERROR);
      addLog('Orchestrator', `Error: ${error.message}`, 'error');
    }
  };

  const reset = () => {
    setStatus(AgentStatus.IDLE);
    setLogs([]);
    setPlan(null);
    setFiles(null);
    setQuestions([]);
    setClarificationHistory([]);
  };

  return {
    status,
    logs,
    plan,
    files,
    questions,
    startGeneration,
    reset
  };
}
