self.onmessage = (e: MessageEvent<{ content: string; options?: Record<string, unknown> }>) => {
  const { content } = e.data;
  try {
    const parsed = JSON.parse(content);
    const result = JSON.stringify(parsed, null, 2);
    self.postMessage({ success: true, result });
  } catch {
    self.postMessage({ success: true, result: content.trim() });
  }
};
