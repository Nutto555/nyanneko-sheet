export interface GuildInfo {
  id: string;
  name: string;
  server: string;
  memberCount: number;
  logoUrl?: string;
}

export interface GvGGuide {
  id: string;
  title: string;
  description: string;
  category: GvGCategory;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type GvGCategory =
  | 'strategy'
  | 'composition'
  | 'positioning'
  | 'callouts'
  | 'gear'
  | 'tips';

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}
