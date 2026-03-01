import { GoogleGenAI } from "@google/genai";
import { AgentLog, AgentStatus, GameFiles, GamePlan, GamePlanSchema, ClarificationSchema } from "../types/agent";

export class AgentBase {
  protected ai: GoogleGenAI;
  protected model = "gemini-3.1-pro-preview";

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  protected async generateJson<T>(prompt: string, schema: any, systemInstruction?: string): Promise<T> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return JSON.parse(response.text || "{}") as T;
  }
}

export class ClarifierAgent extends AgentBase {
  async clarify(userInput: string, history: string[]): Promise<{ isClear: boolean; questions: string[] }> {
    const prompt = `User Input: "${userInput}"\nPrevious Questions/Answers: ${history.join("\n")}\n\nAnalyze if this game idea is specific enough to build. If not, ask 1-3 critical questions.`;
    const systemInstruction = "You are a Game Design Consultant. Your goal is to ensure a game concept has clear mechanics, win/loss conditions, and controls before building.";
    
    const result = await this.generateJson<any>(prompt, ClarificationSchema, systemInstruction);
    return result;
  }
}

export class PlannerAgent extends AgentBase {
  async plan(userInput: string, clarifications: string[]): Promise<GamePlan> {
    const prompt = `Game Idea: ${userInput}\nClarifications: ${clarifications.join("\n")}\n\nCreate a detailed technical plan for this browser game.`;
    const systemInstruction = "You are a Lead Game Architect. You produce structured technical specifications for web-based games.";
    
    return await this.generateJson<GamePlan>(prompt, GamePlanSchema, systemInstruction);
  }
}

export class BuilderAgent extends AgentBase {
  async build(plan: GamePlan): Promise<GameFiles> {
    const prompt = `Plan: ${JSON.stringify(plan)}\n\nGenerate the complete source code for index.html, style.css, and game.js. Ensure the game is fully functional and uses the specified framework.`;
    const systemInstruction = "You are a Senior Game Developer. You write clean, modular, and bug-free code for browser games. You must output a JSON object with 'html', 'css', and 'js' keys containing the full file contents.";
    
    const schema = {
      type: "OBJECT",
      properties: {
        html: { type: "STRING" },
        css: { type: "STRING" },
        js: { type: "STRING" },
      },
      required: ["html", "css", "js"],
    };

    return await this.generateJson<GameFiles>(prompt, schema as any, systemInstruction);
  }
}
