-- Remove the unique constraint that prevents multiple roles per person-startup combination
ALTER TABLE relationships DROP CONSTRAINT IF EXISTS relationships_person_id_startup_id_key;

-- Add a new unique constraint that includes the role, allowing same person-startup with different roles
ALTER TABLE relationships ADD CONSTRAINT relationships_person_startup_role_unique 
UNIQUE (person_id, startup_id, role);