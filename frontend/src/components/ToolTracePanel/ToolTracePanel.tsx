import type { ToolTrace } from '../../types';
import styles from './ToolTracePanel.module.css';

interface ToolTracePanelProps {
  traces: ToolTrace[];
  domain: string;
  finalResponse?: string;
}

function formatDomain(domain: string): string {
  return domain.replace(/\+/g, ' + ');
}

export function ToolTracePanel({ traces, domain, finalResponse }: ToolTracePanelProps) {
  return (
    <aside className={styles.panel} aria-label="Tool execution trace">
      <header className={styles.header}>
        <h2 className={styles.title}>Tool Trace</h2>
      </header>

      <div className={styles.content}>
        {domain && (
          <div className={styles.domainBadge}>
            <span className={styles.domainLabel}>Selected domain</span>
            <span className={styles.domainValue}>{formatDomain(domain)}</span>
          </div>
        )}

        {finalResponse && traces.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Final assistant response</span>
            <p className={styles.finalResponse}>{finalResponse}</p>
          </div>
        )}

        {traces.length === 0 ? (
          <p className={styles.emptyState}>
            Tool calls will appear here after you send a message.
          </p>
        ) : (
          <div className={styles.traceList}>
            {traces.map((trace, i) => (
              <TraceCard key={i} trace={trace} index={i} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

interface TraceCardProps {
  trace: ToolTrace;
  index: number;
}

function TraceCard({ trace, index }: TraceCardProps) {
  return (
    <article className={styles.traceCard} aria-labelledby={`trace-${index}-name`}>
      <div className={styles.traceMeta}>
        <span className={styles.traceDomain}>{trace.domain}</span>
        <span id={`trace-${index}-name`} className={styles.traceName}>
          {trace.toolName}
        </span>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Arguments</span>
        <pre className={styles.codeBlock}>
          {JSON.stringify(trace.args, null, 2)}
        </pre>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Response</span>
        <pre className={styles.codeBlock}>
          {JSON.stringify(trace.response, null, 2)}
        </pre>
      </div>

      {trace.ragDetails && (
        <div className={`${styles.section} ${styles.ragSection}`}>
          <span className={styles.sectionLabel}>RAG details</span>
          <p className={styles.ragQuery}>
            <strong>Query:</strong> {trace.ragDetails.query}
          </p>
          <p className={styles.ragChunks}>
            <strong>Chunk IDs:</strong> {trace.ragDetails.chunkIds.join(', ')}
          </p>
          <div>
            <strong>Snippets:</strong>
            {trace.ragDetails.snippets.map((snippet, j) => (
              <div key={j} className={styles.snippet}>
                {snippet}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
