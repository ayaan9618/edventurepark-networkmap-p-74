-- Insert all relationships from the spreadsheet
INSERT INTO relationships (person_id, startup_id, role) VALUES
-- P1 relationships
('P1', 'S1', 'Founder'),
('P1', 'S6', 'Founder'),
('P1', 'S1', 'CEO'),
('P1', 'S6', 'CEO'),
('P1', 'S7', 'Founder'),

-- P5 relationships
('P5', 'S2', 'Founder'),
('P5', 'S2', 'CEO'),
('P5', 'S6', 'Member'),
('P5', 'S7', 'Member'),
('P5', 'S1', 'HeadCampusLead'),

-- P14 relationships
('P14', 'S3', 'Founder'),
('P14', 'S3', 'CEO'),
('P14', 'S1', 'CampusLead'),

-- P27 relationships
('P27', 'S4', 'Founder'),
('P27', 'S4', 'CEO'),
('P27', 'S1', 'CampusLead'),

-- P28 relationships
('P28', 'S5', 'Founder'),
('P28', 'S5', 'CEO'),

-- P23 relationships
('P23', 'S1', 'XTeam'),
('P23', 'S1', 'CampusLead'),

-- P6 relationships
('P6', 'S6', 'Member'),
('P6', 'S1', 'CampusLead'),

-- P7 relationships
('P7', 'S1', 'FoundersFridayLead'),
('P7', 'S1', 'DocumentaryTeam'),
('P7', 'S1', 'CampusLead'),

-- P8-P12 relationships (all CampusLead for S1)
('P8', 'S1', 'CampusLead'),
('P9', 'S1', 'CampusLead'),
('P10', 'S1', 'CampusLead'),
('P11', 'S1', 'CampusLead'),
('P12', 'S1', 'CampusLead'),

-- P13 relationships
('P13', 'S1', 'CampusLead'),
('P13', 'S6', 'Member'),

-- P15-P24 relationships (all CampusLead for S1)
('P15', 'S1', 'CampusLead'),
('P16', 'S1', 'CampusLead'),
('P16', 'S6', 'Member'),
('P17', 'S1', 'CampusLead'),
('P18', 'S1', 'CampusLead'),
('P19', 'S1', 'CampusLead'),
('P20', 'S1', 'CampusLead'),
('P21', 'S1', 'CampusLead'),
('P21', 'S6', 'CoreTeam'),
('P22', 'S1', 'CampusLead'),
('P22', 'S7', 'CoreTeam'),
('P24', 'S1', 'CampusLead'),

-- P23 additional relationships
('P23', 'S6', 'CoreTeam'),

-- P25 relationships
('P25', 'S7', 'CEO')

ON CONFLICT (person_id, startup_id, role) DO NOTHING;