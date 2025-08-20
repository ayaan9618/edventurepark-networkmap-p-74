export interface Person {
  id: string;
  name: string;
  role?: string;
  sisterOrgs?: string;
  interests?: string;
  linkedinWebsite?: string;
  notes?: string;
  isFounder?: boolean;
  [key: string]: unknown;
}

export interface Startup {
  id: string;
  name: string;
  url?: string;
  domain?: string;
  status?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface Relationship {
  personId: string;
  startupId: string;
  role: string;
}

export interface NetworkData {
  people: Person[];
  startups: Startup[];
  relationships: Relationship[];
}

export interface ExcelData {
  people: any[];
  startups: any[];
  relationships: any[];
}