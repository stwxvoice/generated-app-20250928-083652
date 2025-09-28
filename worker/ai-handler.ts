import OpenAI from 'openai';
import { AgentConfig, AIGenerationRequest } from './types';
import type { Env } from './core-utils';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
async function callAI(client: OpenAI, model: string, prompt: string, stream: boolean) {
    return client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream
    });
}
export async function handleAIGeneration(request: AIGenerationRequest, env: Env): Promise<ReadableStream> {
  const { configs } = request;
  const enabledAgents = configs.filter((c: AgentConfig) => c.enabled);
  if (enabledAgents.length === 0) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Error: No AI agents enabled.'));
        controller.close();
      }
    });
    return stream;
  }
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  (async () => {
    try {
      let currentInput = enabledAgents[0].prompt;
      for (let i = 0; i < enabledAgents.length; i++) {
        const agent = enabledAgents[i];
        const isLastAgent = i === enabledAgents.length - 1;
        const client = new OpenAI({
          baseURL: agent.model.startsWith('gemini') ? env.CF_AI_BASE_URL : OPENROUTER_BASE_URL,
          apiKey: agent.model.startsWith('gemini') ? env.CF_AI_API_KEY : env.OPENROUTER_API_KEY
        });
        if (isLastAgent) {
          const stream = await callAI(client, agent.model, currentInput, true) as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              await writer.write(encoder.encode(content));
            }
          }
        } else {
          const response = (await callAI(client, agent.model, currentInput, false)) as OpenAI.Chat.Completions.ChatCompletion;
          currentInput = response.choices[0].message.content || '';
        }
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      const errorMessage = `An error occurred during AI generation: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await writer.write(encoder.encode(errorMessage));
    } finally {
      await writer.close();
    }
  })();
  return readable;
}