import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatRequestDto, ChatResponseDto, MessageDto } from './dto/chat.dto';
import { TokenService } from '../token/token.service';

// Token optimization constants
const MAX_HISTORY_MESSAGES = 6; // Keep only last 6 messages (3 exchanges)
const MAX_MESSAGE_LENGTH = 500; // Truncate long messages
const MAX_OUTPUT_TOKENS = 300; // Limit AI response length
const SUMMARIZE_THRESHOLD = 10; // Summarize if history > 10 messages

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => TokenService)) private tokenService: TokenService,
  ) {
    this.apiUrl = this.configService.get<string>('PECUT_AI_URL') || 'https://llm.mfah.me/v1/chat/completions';
    this.apiKey = this.configService.get<string>('PECUT_AI_TOKEN') || '';
  }

  async chat(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const { message, context, conversationHistory = [] } = chatRequest;

    try {
      // Build system prompt with context (optimized)
      const systemPrompt = this.buildSystemPrompt(context);

      // Optimize conversation history to reduce tokens
      const optimizedHistory = this.optimizeHistory(conversationHistory);

      // Truncate user message if too long
      const truncatedMessage = this.truncateMessage(message);

      // Build messages array
      const messages = [
        { role: 'system', content: systemPrompt },
        ...optimizedHistory,
        { role: 'user', content: truncatedMessage }
      ];

      // Log token estimate for monitoring
      const estimatedTokens = this.estimateTokens(messages);
      this.logger.debug(`Estimated input tokens: ${estimatedTokens}`);

      // Call Pecut AI API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'pecut-ai',
          messages: messages.map((m, i) => i === 0 && m.role === 'system' ? { ...m, content: '/no_think\n' + m.content } : m),
          max_tokens: MAX_OUTPUT_TOKENS, // Reduced from 500 to 300
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Pecut AI API error: ${response.status} - ${errorText}`);
        throw new Error('AI service unavailable');
      }

      // Strip 'data: [DONE]' suffix from llm.mfah.me response
      let responseText = await response.text();
      responseText = responseText.replace(/data:\s*\[DONE\]\s*$/, '').trim();
      
      const data = JSON.parse(responseText);
      const aiResponse = data.choices?.[0]?.message?.content || 'Maaf, aku tidak bisa menjawab sekarang. Coba lagi ya!';

      // Extract token usage from API response or estimate
      let inputTokens: number;
      let outputTokens: number;

      if (data.usage) {
        // Use actual token counts from API
        inputTokens = data.usage.prompt_tokens || this.estimateTokens(messages);
        outputTokens = data.usage.completion_tokens || this.tokenService.estimateTokens(aiResponse);
      } else {
        // Estimate tokens if API doesn't return usage
        inputTokens = this.estimateTokens(messages);
        outputTokens = this.tokenService.estimateTokens(aiResponse);
      }

      // Record token usage
      try {
        await this.tokenService.recordUsage({
          userId: context.user?.id || 'anonymous',
          username: context.user?.username || 'Anonymous',
          inputTokens,
          outputTokens,
          model: 'pecut-ai',
        });
      } catch (recordError) {
        this.logger.warn('Failed to record token usage:', recordError);
      }

      // Generate suggested follow-ups
      const suggestedFollowUps = this.generateSuggestedFollowUps(context);

      return {
        success: true,
        response: aiResponse,
        suggestedFollowUps,
        tokenUsage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
      };
    } catch (error) {
      this.logger.error('Error in AI chat:', error);
      return {
        success: false,
        response: 'Ups, ada masalah dengan layanan AI. Coba lagi nanti ya! 😊'
      };
    }
  }

  /**
   * Optimize conversation history to reduce token usage
   * - Keep only last N messages
   * - Truncate long messages
   * - Optionally summarize old context
   */
  private optimizeHistory(history: MessageDto[]): { role: string; content: string }[] {
    if (!history || history.length === 0) return [];

    // If history is very long, create a summary of older messages
    if (history.length > SUMMARIZE_THRESHOLD) {
      const oldMessages = history.slice(0, -MAX_HISTORY_MESSAGES);
      const recentMessages = history.slice(-MAX_HISTORY_MESSAGES);

      // Create a brief summary of old conversation
      const summary = this.createHistorySummary(oldMessages);

      return [
        { role: 'system', content: `[Ringkasan percakapan sebelumnya: ${summary}]` },
        ...recentMessages.map(msg => ({
          role: msg.role,
          content: this.truncateMessage(msg.content)
        }))
      ];
    }

    // Keep only last N messages
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

    return recentHistory.map(msg => ({
      role: msg.role,
      content: this.truncateMessage(msg.content)
    }));
  }

  /**
   * Create a brief summary of old messages
   */
  private createHistorySummary(messages: MessageDto[]): string {
    // Extract key topics from old messages
    const userMessages = messages
      .filter(m => m.role === 'user')
      .map(m => m.content.slice(0, 50))
      .slice(-3);

    if (userMessages.length === 0) return 'Percakapan umum tentang belajar';

    return `Siswa bertanya tentang: ${userMessages.join(', ')}`;
  }

  /**
   * Truncate message if too long
   */
  private truncateMessage(message: string): string {
    if (message.length <= MAX_MESSAGE_LENGTH) return message;
    return message.slice(0, MAX_MESSAGE_LENGTH) + '...';
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 chars for Indonesian)
   */
  private estimateTokens(messages: { role: string; content: string }[]): number {
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4);
  }


  /**
   * Build optimized system prompt (reduced tokens)
   */
  private buildSystemPrompt(context: ChatRequestDto['context']): string {
    const { user, learning, companion } = context;

    // Use shorter base prompt
    let systemPrompt = companion?.systemPrompt
      ? this.shortenSystemPrompt(companion.systemPrompt)
      : 'Asisten belajar ramah untuk anak SD. Jawab singkat & pakai emoji.';

    // Add minimal user context
    const contextParts: string[] = [];

    if (user) {
      contextParts.push(`Siswa: ${user.username} (kelas ${user.kelas})`);
    }

    // Add only essential learning context
    if (learning) {
      if (learning.lowScoreSubjects?.length > 0) {
        const subjects = learning.lowScoreSubjects.slice(0, 2).map(s => s.nama).join(', ');
        contextParts.push(`Perlu bantuan: ${subjects}`);
      }

      if (learning.averageScore) {
        contextParts.push(`Rata-rata: ${learning.averageScore}`);
      }
    }

    if (contextParts.length > 0) {
      systemPrompt += `\n[${contextParts.join(' | ')}]`;
    }

    // Shorter format guide
    systemPrompt += '\nFormat: singkat, ramah, pakai emoji & **bold** untuk penting.';

    return systemPrompt;
  }

  /**
   * Shorten companion system prompt to reduce tokens
   */
  private shortenSystemPrompt(prompt: string): string {
    // Keep only first 300 chars of system prompt
    if (prompt.length <= 300) return prompt;

    // Try to cut at sentence boundary
    const shortened = prompt.slice(0, 300);
    const lastPeriod = shortened.lastIndexOf('.');

    if (lastPeriod > 200) {
      return shortened.slice(0, lastPeriod + 1);
    }

    return shortened + '...';
  }

  private generateSuggestedFollowUps(context: ChatRequestDto['context']): string[] {
    const suggestions: string[] = [];
    const { learning } = context;

    if (learning?.lowScoreSubjects?.length > 0) {
      const subject = learning.lowScoreSubjects[0];
      suggestions.push(`Tips belajar ${subject.nama}?`);
    }

    if (learning?.unattemptedSubjects?.length > 0) {
      const subject = learning.unattemptedSubjects[0];
      suggestions.push(`Ceritakan tentang ${subject.nama}!`);
    }

    suggestions.push('Berikan motivasi belajar!');
    suggestions.push('Apa yang harus kupelajari hari ini?');

    return suggestions.slice(0, 3);
  }
}
