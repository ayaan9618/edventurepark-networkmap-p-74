import { useState } from 'react';
import { NetworkData, Person, Startup, Relationship } from '@/types/network';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Building2, GitBranch, Search } from 'lucide-react';

interface NetworkDataTableProps {
  data: NetworkData;
  onDataChange: (data: NetworkData) => void;
}

export const NetworkDataTable = ({ data, onDataChange }: NetworkDataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPeople = data.people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStartups = data.startups.filter(startup =>
    startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    startup.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRelationships = data.relationships.filter(rel => {
    const person = data.people.find(p => p.id === rel.personId);
    const startup = data.startups.find(s => s.id === rel.startupId);
    return person?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           startup?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           rel.role.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const PersonTable = ({ people }: { people: Person[] }) => (
    <div className="space-y-3">
      {people.map((person) => (
        <Card key={person.id} className="p-4 bg-card/30 border-border/50">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{person.name}</h3>
                {person.isFounder && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Founder
                  </Badge>
                )}
              </div>
              {person.role && (
                <p className="text-sm text-muted-foreground">{person.role}</p>
              )}
              {person.interests && (
                <p className="text-sm text-muted-foreground">
                  <strong>Interests:</strong> {person.interests}
                </p>
              )}
              {person.linkedinWebsite && (
                <a 
                  href={person.linkedinWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View Profile
                </a>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              ID: {person.id}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );

  const StartupTable = ({ startups }: { startups: Startup[] }) => (
    <div className="space-y-3">
      {startups.map((startup) => (
        <Card key={startup.id} className="p-4 bg-card/30 border-border/50">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold">{startup.name}</h3>
              {startup.domain && (
                <p className="text-sm text-muted-foreground">
                  <strong>Domain:</strong> {startup.domain}
                </p>
              )}
              {startup.status && (
                <Badge 
                  variant={startup.status.toLowerCase() === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {startup.status}
                </Badge>
              )}
              {startup.url && (
                <a 
                  href={startup.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Visit Website
                </a>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              ID: {startup.id}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );

  const RelationshipTable = ({ relationships }: { relationships: Relationship[] }) => (
    <div className="space-y-3">
      {relationships.map((rel, index) => {
        const person = data.people.find(p => p.id === rel.personId);
        const startup = data.startups.find(s => s.id === rel.startupId);
        
        return (
          <Card key={index} className="p-4 bg-card/30 border-border/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{person?.name || rel.personId}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{startup?.name || rel.startupId}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Role:</strong> {rel.role}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {rel.personId} → {rel.startupId}
              </Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <Card className="p-6 bg-card/50 border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Network Data Management</h2>
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="people" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>People ({filteredPeople.length})</span>
          </TabsTrigger>
          <TabsTrigger value="startups" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Startups ({filteredStartups.length})</span>
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4" />
            <span>Connections ({filteredRelationships.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="mt-4">
          <PersonTable people={filteredPeople} />
        </TabsContent>

        <TabsContent value="startups" className="mt-4">
          <StartupTable startups={filteredStartups} />
        </TabsContent>

        <TabsContent value="relationships" className="mt-4">
          <RelationshipTable relationships={filteredRelationships} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};