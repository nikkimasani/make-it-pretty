import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { VirtualList } from './VirtualList';

interface TreeNode {
  key: string;
  value: unknown;
  path: string;
  depth: number;
}

interface JsonTreeViewProps {
  data: unknown;
  className?: string;
}

interface CollapsibleNodeProps {
  node: TreeNode;
  depth: number;
  open: boolean;
  onToggle: (path: string) => void;
}

function SyntaxValue({ value }: { value: unknown }) {
  if (value === null) return <span className="text-surface-400 dark:text-surface-500 italic">null</span>;
  if (typeof value === 'boolean')
    return <span className="text-violet-600 dark:text-violet-400 font-medium">{String(value)}</span>;
  if (typeof value === 'number')
    return <span className="text-amber-600 dark:text-amber-400">{String(value)}</span>;
  if (typeof value === 'string')
    return (
      <span className="text-emerald-700 dark:text-emerald-400">
        &quot;{value}&quot;
      </span>
    );
  return <span>{String(value)}</span>;
}

function CollapsibleNode({ node, depth, open, onToggle }: CollapsibleNodeProps) {
  const isObject = node.value !== null && typeof node.value === 'object' && !Array.isArray(node.value);
  const isArray = Array.isArray(node.value);
  const isCollapsible = isObject || isArray;
  const entries = isCollapsible ? Object.entries(node.value as Record<string, unknown>) : [];
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';
  const count = entries.length;

  const toggle = useCallback(() => onToggle(node.path), [node.path, onToggle]);

  return (
    <div>
      <div
        className="flex items-start gap-1 hover:bg-surface-50 dark:hover:bg-surface-800/50 rounded px-1 -mx-1 cursor-pointer py-0.5 transition-colors"
        onClick={isCollapsible ? toggle : undefined}
        title={node.path}
      >
        {isCollapsible && (
          <span className="text-[10px] text-surface-400 dark:text-surface-600 w-4 flex-shrink-0 mt-0.5 select-none">
            {open ? '▼' : '▶'}
          </span>
        )}
        {!isCollapsible && <span className="w-4 flex-shrink-0" />}
        {node.key && (
          <>
            <span className="text-primary-600 dark:text-primary-400 font-medium">{node.key}</span>
            <span className="text-surface-500">{': '}</span>
          </>
        )}
        {isCollapsible ? (
          <span className="text-surface-500">
            {open ? (
              <span>{bracketOpen}</span>
            ) : (
              <span>
                {bracketOpen}
                {count > 0 && (
                  <span className="text-surface-400 text-xs">
                    {' '}{count} {isArray ? 'items' : 'keys'}{' '}
                  </span>
                )}
                {bracketClose}
              </span>
            )}
          </span>
        ) : (
          <SyntaxValue value={node.value} />
        )}
      </div>
      {open && isCollapsible && (
        <div className="ml-4 border-l border-surface-200 dark:border-surface-700 pl-2">
          {entries.map(([key, val]) => (
            <CollapsibleNode
              key={key}
              node={{ key, value: val, path: `${node.path}.${key}`, depth: depth + 1 }}
              depth={depth + 1}
              open={open}
              onToggle={onToggle}
            />
          ))}
          <div className="text-surface-500 px-1 py-0.5 text-sm">{bracketClose}</div>
        </div>
      )}
    </div>
  );
}

function flattenTree(data: unknown, path: string, depth: number, maxDepth: number): TreeNode[] {
  if (depth >= maxDepth || data === null || typeof data !== 'object') return [];
  const entries = Object.entries(data as Record<string, unknown>);
  const nodes: TreeNode[] = [];
  for (const [key, val] of entries) {
    const childPath = Array.isArray(data) ? `${path}[${key}]` : path ? `${path}.${key}` : key;
    if (val !== null && typeof val === 'object' && depth < maxDepth - 1) {
      nodes.push({ key, value: val, path: childPath, depth });
      nodes.push(...flattenTree(val, childPath, depth + 1, maxDepth));
    }
  }
  return nodes;
}

export function JsonTreeView({ data, className = '' }: JsonTreeViewProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);

  const entries = (data !== null && typeof data === 'object')
    ? Object.entries(data as Record<string, unknown>)
    : [];
  const isArray = Array.isArray(data);
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';
  const isLarge = entries.length > 500;

  const flatNodes = useMemo(() => (isLarge ? flattenTree(data, '', 0, 3) : []), [data, isLarge]);

  const expandAll = useCallback(() => {
    const all = new Set<string>();
    const collect = (obj: unknown, path: string) => {
      if (obj === null || typeof obj !== 'object') return;
      if (path) all.add(path);
      for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
        const childPath = path ? `${path}.${key}` : key;
        collect(val, childPath);
      }
    };
    collect(data, '');
    setExpandedPaths(all);
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  useEffect(() => {
    expandAll();
  }, [expandAll]);

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  if (data === null || typeof data !== 'object') {
    return (
      <div className={`font-mono text-sm ${className}`}>
        <SyntaxValue value={data} />
      </div>
    );
  }

  const renderFlatNode = useCallback(
    (node: TreeNode, _index: number) => (
      <div className="flex items-start gap-1 px-1 py-0.5 text-sm" title={node.path}>
        <span className="text-primary-600 dark:text-primary-400 font-medium">{node.key}</span>
        <span className="text-surface-500">{': '}</span>
        <span className="text-surface-400 text-xs">({node.path})</span>
      </div>
    ),
    [],
  );

  return (
    <div ref={rootRef} className={`font-mono text-sm ${className}`}>
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-surface-100 dark:border-surface-800">
        <button
          onClick={expandAll}
          className="text-xs text-surface-500 hover:text-surface-700 px-2 py-0.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          className="text-xs text-surface-500 hover:text-surface-700 px-2 py-0.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          Collapse all
        </button>
        <span className="text-xs text-surface-400 ml-auto">
          {entries.length} {isArray ? 'items' : 'keys'}
          {isLarge && ' (flattened view)'}
        </span>
      </div>
      {isLarge ? (
        <div className="border border-surface-200 dark:border-surface-800 rounded-lg overflow-hidden">
          <VirtualList
            items={flatNodes}
            itemHeight={28}
            renderItem={renderFlatNode}
            maxHeight="400px"
            overscan={10}
          />
        </div>
      ) : (
        <>
          <span className="text-surface-500">{bracketOpen}</span>
          <div className="ml-2">
            {entries.map(([key, val]) => (
              <CollapsibleNode
                key={key}
                node={{ key: isArray ? String(Number(key)) : key, value: val, path: isArray ? `[${key}]` : key, depth: 0 }}
                depth={0}
                open={expandedPaths.has(isArray ? `[${key}]` : key)}
                onToggle={handleToggle}
              />
            ))}
          </div>
          <span className="text-surface-500">{bracketClose}</span>
        </>
      )}
    </div>
  );
}
