export type EmphasisRole =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'collapsible'
  | 'information'
  | 'observe'
  | 'frame';

export type ListMark = 'bullet' | 'hyphen';

export interface InlineText {
  type: 'text';
  content: string;
}

export interface InlineEmphasis {
  type: 'emphasis';
  role: EmphasisRole;
  children: InlineNode[];
}

export interface InlineLink {
  type: 'link';
  url: string;
  target: string;
  children: InlineNode[];
}

export type InlineNode = InlineText | InlineEmphasis | InlineLink;

export interface ParaBlock {
  id: string;
  type: 'para';
  children: InlineNode[];
}

export interface VarEntry {
  id: string;
  term: string;
  value: string;
}

export interface VarListBlock {
  id: string;
  type: 'variablelist';
  title?: string;
  entries: VarEntry[];
}

export interface ItemizedListBlock {
  id: string;
  type: 'itemizedlist';
  mark: ListMark;
  items: ListItem[];
}

export interface ListItem {
  id: string;
  children: InlineNode[];
}

export type SectionBlock = ParaBlock | VarListBlock | ItemizedListBlock;

export interface Section {
  id: string;
  title?: SectionTitle;
  blocks: SectionBlock[];
}

export interface SectionTitle {
  children: InlineNode[];
}

export interface MockButton {
  id: string;
  label: string;
}

export interface DocBookDocument {
  id: string;
  name: string;
  sections: Section[];
  rootParas?: ParaBlock[];
  buttons?: MockButton[];
}
