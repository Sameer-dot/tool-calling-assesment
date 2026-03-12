import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}
      data-role={role}
    >
      <span className={styles.role} aria-hidden>
        {isUser ? 'You' : 'Assistant'}
      </span>
      <div className={styles.content}>{content}</div>
    </div>
  );
}
