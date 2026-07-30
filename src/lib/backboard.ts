type MarginAgentInput = {
  currentMargin: number;
  targetMargin: number;
  expensiveModel: string;
  candidateModel: string;
  expectedSavings: number;
};

type BackboardResponse = {
  content?: string;
  thread_id?: string;
  input_tokens?: number;
  output_tokens?: number;
};

export async function runMarginAgent(input: MarginAgentInput) {
  const apiKey = process.env.BACKBOARD_API_KEY;

  if (!apiKey) {
    return {
      mode: "demo" as const,
      threadId: "demo_margin_memory_7b3f",
      recommendation: `Route 72% of low-complexity support traffic from ${input.expensiveModel} to ${input.candidateModel}. Preserve premium routing for escalations and enforce a 94% quality floor. Expected savings: $${input.expectedSavings.toLocaleString()}/month, lifting gross margin from ${input.currentMargin.toFixed(1)}% toward ${input.targetMargin.toFixed(1)}%.`,
      memoryEnabled: true,
    };
  }

  const response = await fetch(
    "https://app.backboard.io/api/threads/messages",
    {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant_id: process.env.BACKBOARD_ASSISTANT_ID,
        content: `Act as an AI FinOps analyst. Return a concise, auditable routing recommendation as JSON. Metrics: ${JSON.stringify(input)}`,
        llm_provider: process.env.BACKBOARD_LLM_PROVIDER ?? "openrouter",
        model_name:
          process.env.BACKBOARD_MODEL_NAME ?? "moonshotai/kimi-k2.6",
        memory: "Auto",
        memory_response_citation: true,
        json_output: true,
        stream: false,
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Backboard request failed with ${response.status}`);
  }

  const result = (await response.json()) as BackboardResponse;
  return {
    mode: "live" as const,
    threadId: result.thread_id ?? "unknown",
    recommendation: result.content ?? "No recommendation returned.",
    memoryEnabled: true,
    usage: {
      inputTokens: result.input_tokens ?? 0,
      outputTokens: result.output_tokens ?? 0,
    },
  };
}
