import { Type } from "@google/genai";

export enum AgentStatus {
  IDLE = "IDLE",
  CLARIFYING = "CLARIFYING",
  PLANNING = "PLANNING",
  BUILDING = "BUILDING",
  VALIDATING = "VALIDATING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

export interface AgentLog {
  id: string;
  agent: string;
  message: string;
  timestamp: number;
  type: "info" | "success" | "warning" | "error";
}

export interface GamePlan {
  title: string;
  description: string;
  mechanics: string[];
  controls: Record<string, string>;
  framework: "vanilla" | "phaser";
  assets: string[];
  stateStructure: string;
  renderingStrategy: string;
}

export interface GameFiles {
  html: string;
  css: string;
  js: string;
}

export const GamePlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    mechanics: { type: Type.ARRAY, items: { type: Type.STRING } },
    controls: { type: Type.OBJECT, additionalProperties: { type: Type.STRING } },
    framework: { type: Type.STRING, enum: ["vanilla", "phaser"] },
    assets: { type: Type.ARRAY, items: { type: Type.STRING } },
    stateStructure: { type: Type.STRING },
    renderingStrategy: { type: Type.STRING },
  },
  required: ["title", "description", "mechanics", "controls", "framework", "stateStructure", "renderingStrategy"],
};

export const ClarificationSchema = {
  type: Type.OBJECT,
  properties: {
    isClear: { type: Type.BOOLEAN },
    questions: { type: Type.ARRAY, items: { type: Type.STRING } },
    reasoning: { type: Type.STRING },
  },
  required: ["isClear", "questions", "reasoning"],
};
