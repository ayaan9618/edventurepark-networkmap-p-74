-- Change ID columns from UUID to TEXT to support simple IDs like P1, S1, etc.

-- First drop foreign key constraints if they exist
ALTER TABLE relationships DROP CONSTRAINT IF EXISTS relationships_person_id_fkey;
ALTER TABLE relationships DROP CONSTRAINT IF EXISTS relationships_startup_id_fkey;

-- Change people table ID to text
ALTER TABLE people ALTER COLUMN id SET DATA TYPE text;

-- Change startups table ID to text  
ALTER TABLE startups ALTER COLUMN id SET DATA TYPE text;

-- Change relationships foreign key columns to text
ALTER TABLE relationships ALTER COLUMN person_id SET DATA TYPE text;
ALTER TABLE relationships ALTER COLUMN startup_id SET DATA TYPE text;

-- Re-add foreign key constraints (optional, but good for data integrity)
ALTER TABLE relationships 
ADD CONSTRAINT relationships_person_id_fkey 
FOREIGN KEY (person_id) REFERENCES people(id);

ALTER TABLE relationships 
ADD CONSTRAINT relationships_startup_id_fkey 
FOREIGN KEY (startup_id) REFERENCES startups(id);