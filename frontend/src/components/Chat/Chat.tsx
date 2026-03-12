import { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { SUGGESTED_PROMPTS } from '../../constants/suggestions';
import { MessageBubble } from './MessageBubble';
import styles from './Chat.module.css';

interface ChatProps {
  onResponse?: (traces: import('../../types').ToolTrace[], domain: string, finalResponse?: string) => void;
  onClear?: () => void;
}

export function Chat({ onResponse, onClear }: ChatProps) {
  const { messages, isLoading, sendMessage, clearChat } = useChat(onResponse, onClear);
  const [input, setInput] = useState('');
  const scrollRef = useAutoScroll<HTMLDivElement>([messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed && !isLoading) {
      sendMessage(trimmed);
      setInput('');
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className={styles.chat}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>AI Assistant</h1>
            <p className={styles.subtitle}>
              Book appointments, search products, or learn about our services
            </p>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearChat}
              disabled={isLoading}
              aria-label="Clear chat"
            >
              Clear chat
            </button>
          )}
        </div>
      </header>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateTitle}>Start a conversation</p>
            <ul className={styles.suggestions}>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={styles.suggestion}
                    onClick={() => handleSuggestionClick(prompt)}
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {isLoading && (
          <div className={styles.loading}>
            <span className={styles.loadingDots}>
              <span className={styles.loadingDot} aria-hidden />
              <span className={styles.loadingDot} aria-hidden />
              <span className={styles.loadingDot} aria-hidden />
            </span>
            <span>Thinking...</span>
          </div>
        )}

        <div ref={scrollRef} aria-hidden />
      </div>

      <div className={styles.inputArea}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            name="message"
            type="text"
            className={styles.input}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            aria-label="Chat message"
          />
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
