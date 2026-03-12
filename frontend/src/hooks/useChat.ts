import { useState, useCallback } from 'react';
import { sendChatMessage } from '../api/chatApi';
import type { ChatMessage, ToolTrace } from '../types';

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  conversationId: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  lastTraces: ToolTrace[];
  lastDomain: string;
}

export function useChat(
  onResponse?: (traces: ToolTrace[], domain: string, finalResponse?: string) => void,
  onClear?: () => void
): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastTraces, setLastTraces] = useState<ToolTrace[]>([]);
  const [lastDomain, setLastDomain] = useState('');

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = { role: 'user', content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const result = await sendChatMessage({
          message: trimmed,
          conversationId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: result.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(result.conversationId);
        setLastTraces(result.traces ?? []);
        setLastDomain(result.domain ?? '');
        onResponse?.(result.traces ?? [], result.domain ?? '', result.response);
      } catch (error) {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `Sorry, something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
        setLastTraces([]);
        setLastDomain('');
        onResponse?.([], '');
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, messages, isLoading, onResponse]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setConversationId(null);
    setLastTraces([]);
    setLastDomain('');
    onClear?.();
  }, [onClear]);

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    clearChat,
    lastTraces,
    lastDomain,
  };
}
