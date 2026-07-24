self.onmessage = (e: MessageEvent<{ text: string; delimiter: string; hasHeaders: boolean }>) => {
  const { text, delimiter, hasHeaders } = e.data;

  try {
    // Normalize line endings
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const lines: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const ch of normalized) {
      if (ch === '"') {
        inQuotes = !inQuotes;
        current += ch;
      } else if (ch === '\n' && !inQuotes) {
        lines.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) lines.push(current);

    // Remove empty trailing lines
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }

    if (lines.length === 0) {
      self.postMessage({ success: false, error: 'No data rows found' });
      return;
    }

    const parseLine = (line: string): string[] => {
      const fields: string[] = [];
      let currentField = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            currentField += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          fields.push(currentField.replace(/^"|"$/g, '').trim());
          currentField = '';
        } else {
          currentField += ch;
        }
      }
      fields.push(currentField.replace(/^"|"$/g, '').trim());
      return fields;
    };

    const headerLine = lines[0];
    const columns = parseLine(headerLine);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const fields = parseLine(lines[i]);
      if (fields.length === 0 || (fields.length === 1 && fields[0] === '')) continue;
      const row: Record<string, string> = {};
      columns.forEach((col, idx) => {
        row[col] = fields[idx] || '';
      });
      rows.push(row);
    }

    self.postMessage({ success: true, columns, rows });
  } catch (err) {
    self.postMessage({ success: false, error: String(err) });
  }
};
