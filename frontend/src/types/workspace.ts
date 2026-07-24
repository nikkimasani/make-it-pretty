export type WorkspaceId =
  | 'beautify'
  | 'format'
  | 'tabulate'
  | 'reader'
  | 'code-beautifier';

export interface WorkspaceConfig {
  id: WorkspaceId;
  title: string;
  description: string;
  icon: string;
  path: string;
  supportedFormats: string[];
}

export const WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'beautify',
    title: 'Beautify',
    description: 'Improve human readability of natural text',
    icon: '✨',
    path: '/beautify',
    supportedFormats: ['txt', 'md', 'html', 'docx', 'pdf'],
  },
  {
    id: 'format',
    title: 'Format',
    description: 'Beautify structured data',
    icon: '🔧',
    path: '/format',
    supportedFormats: ['json', 'yaml', 'xml', 'toml', 'env'],
  },
  {
    id: 'tabulate',
    title: 'Tabulate',
    description: 'Transform boring tables into interactive experiences',
    icon: '📊',
    path: '/tabulate',
    supportedFormats: ['csv', 'tsv', 'xlsx'],
  },
  {
    id: 'reader',
    title: 'Reader',
    description: 'Convert noisy documents into elegant reading experiences',
    icon: '📖',
    path: '/reader',
    supportedFormats: ['url', 'html', 'pdf', 'docx', 'md'],
  },
  {
    id: 'code-beautifier',
    title: 'Code Beautifier',
    description: 'Beautify source code without changing logic',
    icon: '💻',
    path: '/code-beautifier',
    supportedFormats: [
      'py', 'js', 'ts', 'java', 'go', 'rs', 'cpp', 'swift', 'rb', 'php', 'sh',
    ],
  },
];
