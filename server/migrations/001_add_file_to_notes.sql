-- Add file column to notes table
ALTER TABLE notes ADD COLUMN file TEXT DEFAULT '[]';

-- Update existing rows to have an empty array as the default value for file
UPDATE notes SET file = '[]' WHERE file IS NULL;
