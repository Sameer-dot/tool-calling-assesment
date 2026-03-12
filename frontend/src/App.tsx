import { useState, useCallback } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { Chat } from './components/Chat';
import { ToolTracePanel } from './components/ToolTracePanel';
import type { ToolTrace } from './types';

export default function App() {
  const [traces, setTraces] = useState<ToolTrace[]>([]);
  const [domain, setDomain] = useState('');
  const [finalResponse, setFinalResponse] = useState('');

  const handleResponse = useCallback((newTraces: ToolTrace[], newDomain: string, response?: string) => {
    setTraces(newTraces);
    setDomain(newDomain);
    setFinalResponse(response ?? '');
  }, []);

  const handleClear = useCallback(() => {
    setTraces([]);
    setDomain('');
    setFinalResponse('');
  }, []);

  return (
    <AppLayout
      sidebar={
        <ToolTracePanel traces={traces} domain={domain} finalResponse={finalResponse} />
      }
    >
      <Chat onResponse={handleResponse} onClear={handleClear} />
    </AppLayout>
  );
}
