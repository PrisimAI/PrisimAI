import * as webllm from "@mlc-ai/web-llm";
import type { Message, MessageContent, TextContent } from './pollinations-api';

// Helper function to extract text content from MessageContent
function extractTextContent(content: MessageContent): string {
  if (typeof content === 'string') {
    return content;
  }
  // For array content, extract only text parts (WebLLM doesn't support images)
  return content
    .filter((part): part is TextContent => part.type === 'text')
    .map(part => part.text)
    .join('\n');
}

// Available models for offline use
export const OFFLINE_MODELS = [
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    badge: 'Recommended',
    description: 'Lightweight, fast model suitable for most tasks',
    size: '1.8 GB',
    downloadSize: '1.8 GB',
    parameters: '3 billion',
    speed: 'Fast',
    quality: 'Good',
    capabilities: [
      'General conversation',
      'Creative writing',
      'Question answering',
      'Basic coding help',
    ],
    bestFor: 'Everyday chat, quick responses, and general tasks',
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.1 8B',
    badge: 'Most Capable',
    description: 'More powerful model for complex reasoning and detailed responses',
    size: '4.5 GB',
    downloadSize: '4.5 GB',
    parameters: '8 billion',
    speed: 'Moderate',
    quality: 'Excellent',
    capabilities: [
      'Complex reasoning',
      'Advanced coding',
      'Detailed analysis',
      'Technical writing',
    ],
    bestFor: 'Professional work, coding, and complex problem-solving',
  },
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi 3.5 Mini',
    badge: 'Fastest',
    description: 'Ultra-compact model optimized for speed and efficiency',
    size: '2.2 GB',
    downloadSize: '2.2 GB',
    parameters: '3.8 billion',
    speed: 'Very Fast',
    quality: 'Good',
    capabilities: [
      'Quick responses',
      'Simple tasks',
      'Basic Q&A',
      'Light coding',
    ],
    bestFor: 'Speed-critical tasks and devices with limited resources',
  },
] as const;

export type OfflineModelId = typeof OFFLINE_MODELS[number]['id'];

export interface WebGPUCapability {
  supported: boolean;
  error?: string;
}

export interface ModelLoadProgress {
  progress: number;
  text: string;
  timeElapsed: number;
}

/**
 * Check if WebGPU is supported in the current browser
 */
export async function checkWebGPUSupport(): Promise<WebGPUCapability> {
  if (!navigator.gpu) {
    return {
      supported: false,
      error: 'WebGPU is not supported in this browser. Please use a Chromium-based browser (Chrome, Edge) with WebGPU enabled.',
    };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        error: 'WebGPU adapter not available. Your GPU may not be supported.',
      };
    }
    return { supported: true };
  } catch (error) {
    return {
      supported: false,
      error: `WebGPU error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Singleton class to manage WebLLM engine
 */
class WebLLMService {
  private engine: webllm.MLCEngine | null = null;
  private currentModel: string | null = null;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize the WebLLM engine with a specific model
   */
  async initModel(
    modelId: string,
    onProgress?: (progress: ModelLoadProgress) => void
  ): Promise<void> {
    // If already initializing the same model, wait for it
    if (this.initializationPromise) {
      // If it's the same model being initialized, wait
      if (this.currentModel === modelId || !this.currentModel) {
        return this.initializationPromise;
      }
      // If different model, wait for current init to finish first
      await this.initializationPromise;
    }

    // If a different model is loaded, unload it first
    if (this.currentModel && this.currentModel !== modelId) {
      await this.unload();
    }

    // Create initialization promise
    this.initializationPromise = this._initEngine(modelId, onProgress);
    
    try {
      await this.initializationPromise;
      this.currentModel = modelId;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async _initEngine(
    modelId: string,
    onProgress?: (progress: ModelLoadProgress) => void
  ): Promise<void> {
    const startTime = Date.now();

    // Create engine with progress callback
    this.engine = await webllm.CreateMLCEngine(modelId, {
      initProgressCallback: (report) => {
        if (onProgress) {
          onProgress({
            progress: report.progress,
            text: report.text,
            timeElapsed: Date.now() - startTime,
          });
        }
      },
    });
  }

  /**
   * Generate text completion using the loaded model
   */
  async generateText(
    messages: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!this.engine) {
      throw new Error('WebLLM engine not initialized. Call initModel first.');
    }

    // Convert messages to WebLLM format with proper typing
    interface WebLLMMessage {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }

    const webllmMessages: WebLLMMessage[] = messages.map(msg => ({
      role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
      content: extractTextContent(msg.content),
    }));

    if (onChunk) {
      // Streaming mode
      let fullResponse = '';
      const chunks = await this.engine.chat.completions.create({
        messages: webllmMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      });

      for await (const chunk of chunks) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      return fullResponse;
    } else {
      // Non-streaming mode
      const response = await this.engine.chat.completions.create({
        messages: webllmMessages,
        temperature: 0.7,
        max_tokens: 2048,
      });

      return response.choices[0]?.message?.content || '';
    }
  }

  /**
   * Unload the current model and free resources
   */
  async unload(): Promise<void> {
    if (this.engine) {
      // WebLLM engine cleanup
      try {
        // Engine will be garbage collected
        this.engine = null;
        this.currentModel = null;
      } catch (error) {
        console.error('Error during WebLLM cleanup:', error);
      }
    }
  }

  /**
   * Check if a model is currently loaded
   */
  isModelLoaded(): boolean {
    return this.engine !== null;
  }

  /**
   * Get the currently loaded model ID
   */
  getCurrentModel(): string | null {
    return this.currentModel;
  }
}

// Export singleton instance
export const webLLMService = new WebLLMService();
