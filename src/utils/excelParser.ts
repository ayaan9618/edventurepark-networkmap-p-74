import * as XLSX from 'xlsx';
import { ExcelData, NetworkData, Person, Startup, Relationship } from '../types/network';

export const parseExcelFile = async (file: File): Promise<NetworkData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get sheet names
        const sheetNames = workbook.SheetNames;
        
        // Find sheets by name (case insensitive)
        const peopleSheetName = sheetNames.find(name => 
          name.toLowerCase().includes('people') || name.toLowerCase().includes('person')
        ) || sheetNames[0];
        
        const startupsSheetName = sheetNames.find(name => 
          name.toLowerCase().includes('startup') || name.toLowerCase().includes('company')
        ) || sheetNames[1];
        
        const relationshipsSheetName = sheetNames.find(name => 
          name.toLowerCase().includes('relationship') || name.toLowerCase().includes('connection')
        ) || sheetNames[2];

        // Parse sheets
        const rawData: ExcelData = {
          people: peopleSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[peopleSheetName]) : [],
          startups: startupsSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[startupsSheetName]) : [],
          relationships: relationshipsSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[relationshipsSheetName]) : []
        };

        // Transform data to our format
        const networkData = transformData(rawData);
        resolve(networkData);
        
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

const transformData = (rawData: ExcelData): NetworkData => {
  // Transform people data
  const people: Person[] = rawData.people.map((row: any, index: number) => ({
    id: row['Person ID'] || row['PersonID'] || row['ID'] || `person-${index}`,
    name: row['Name'] || row['Person Name'] || 'Unknown',
    role: row['Role'] || row['Position'] || '',
    sisterOrgs: row['Sister Orgs'] || row['Sister Organizations'] || row['Organizations'] || '',
    interests: row['Interests'] || row['Interest Areas'] || '',
    linkedinWebsite: row['LinkedIn/Website'] || row['LinkedIn'] || row['Website'] || '',
    notes: row['Notes'] || row['Comments'] || ''
  }));

  // Transform startups data
  const startups: Startup[] = rawData.startups.map((row: any, index: number) => ({
    id: row['Startup ID'] || row['StartupID'] || row['ID'] || `startup-${index}`,
    name: row['Name'] || row['Startup Name'] || row['Company Name'] || 'Unknown Startup',
    url: row['URL'] || row['Website'] || '',
    domain: row['Domain'] || row['Industry'] || row['Sector'] || '',
    status: row['Status'] || row['Stage'] || 'Active',
    notes: row['Notes'] || row['Description'] || ''
  }));

  // Transform relationships data
  const relationships: Relationship[] = rawData.relationships.map((row: any) => ({
    personId: row['Person ID'] || row['PersonID'] || '',
    startupId: row['Startup ID'] || row['StartupID'] || '',
    role: row['Role in Startup'] || row['Role'] || row['Position'] || 'Contributor'
  })).filter(rel => rel.personId && rel.startupId); // Filter out invalid relationships

  return {
    people,
    startups,
    relationships
  };
};

// Generate sample data for demo purposes
export const generateSampleData = (): NetworkData => {
  const people: Person[] = [
    {
      id: 'ayaan-1',
      name: 'Ayaan',
      role: 'Founder & CEO',
      sisterOrgs: 'Edventure Park, TechHub Singapore',
      interests: 'EdTech, AI, Entrepreneurship',
      linkedinWebsite: 'https://linkedin.com/in/ayaan',
      notes: 'Visionary leader driving innovation in education technology'
    },
    {
      id: 'sarah-2',
      name: 'Sarah Chen',
      role: 'CTO',
      sisterOrgs: 'TechWomen Singapore',
      interests: 'AI/ML, DevOps, Blockchain',
      linkedinWebsite: 'https://linkedin.com/in/sarah-chen',
      notes: 'Expert in scalable tech infrastructure'
    },
    {
      id: 'marcus-3',
      name: 'Marcus Rodriguez',
      role: 'Product Manager',
      sisterOrgs: 'Product Management Guild',
      interests: 'UX Design, Growth Hacking, Analytics',
      linkedinWebsite: 'https://linkedin.com/in/marcus-rodriguez',
      notes: 'Passionate about user-centered design'
    },
    {
      id: 'priya-4',
      name: 'Priya Sharma',
      role: 'Head of Marketing',
      sisterOrgs: 'Marketing Professionals Network',
      interests: 'Digital Marketing, Content Strategy, Branding',
      linkedinWebsite: 'https://linkedin.com/in/priya-sharma',
      notes: 'Creative marketing strategist with startup experience'
    }
  ];

  const startups: Startup[] = [
    {
      id: 'edutech-labs',
      name: 'EduTech Labs',
      url: 'https://edutechlabs.io',
      domain: 'Educational Technology',
      status: 'Active',
      notes: 'AI-powered learning platform for personalized education'
    },
    {
      id: 'green-energy-solutions',
      name: 'Green Energy Solutions',
      url: 'https://greenenergy.sg',
      domain: 'Clean Technology',
      status: 'Active',
      notes: 'Sustainable energy solutions for urban environments'
    },
    {
      id: 'fintech-bridge',
      name: 'FinTech Bridge',
      url: 'https://fintechbridge.com',
      domain: 'Financial Technology',
      status: 'Stealth',
      notes: 'Cross-border payment solutions for SMEs'
    },
    {
      id: 'health-connect',
      name: 'Health Connect',
      url: 'https://healthconnect.app',
      domain: 'HealthTech',
      status: 'Active',
      notes: 'Telemedicine platform connecting patients and doctors'
    }
  ];

  const relationships: Relationship[] = [
    { personId: 'ayaan-1', startupId: 'edutech-labs', role: 'Founder' },
    { personId: 'ayaan-1', startupId: 'green-energy-solutions', role: 'Advisor' },
    { personId: 'sarah-2', startupId: 'edutech-labs', role: 'CTO' },
    { personId: 'sarah-2', startupId: 'fintech-bridge', role: 'Technical Advisor' },
    { personId: 'marcus-3', startupId: 'edutech-labs', role: 'Product Manager' },
    { personId: 'marcus-3', startupId: 'health-connect', role: 'Product Consultant' },
    { personId: 'priya-4', startupId: 'edutech-labs', role: 'Head of Marketing' },
    { personId: 'priya-4', startupId: 'green-energy-solutions', role: 'Marketing Advisor' }
  ];

  return { people, startups, relationships };
};