-- Simplify ContentType enum: merge MOVIE->VIDEO, ZIP->SOFTWARE, WORD/EXCEL/POWERPOINT/TEXT_ARTICLE/EXTERNAL_LINK/MIXED_FILES->DOCUMENT

-- Create new enum type with the 9 simplified values
CREATE TYPE "ContentType_new" AS ENUM (
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'PDF',
  'EBOOK',
  'SOFTWARE',
  'TEMPLATE',
  'DOCUMENT',
  'COURSE'
);

-- Alter the column to use new type with data migration
ALTER TABLE "contents" 
  ALTER COLUMN "contentType" TYPE "ContentType_new" 
  USING (
    CASE "contentType"::text
      WHEN 'MOVIE' THEN 'VIDEO'::text
      WHEN 'ZIP' THEN 'SOFTWARE'::text
      WHEN 'WORD' THEN 'DOCUMENT'::text
      WHEN 'EXCEL' THEN 'DOCUMENT'::text
      WHEN 'POWERPOINT' THEN 'DOCUMENT'::text
      WHEN 'TEXT_ARTICLE' THEN 'DOCUMENT'::text
      WHEN 'EXTERNAL_LINK' THEN 'DOCUMENT'::text
      WHEN 'MIXED_FILES' THEN 'DOCUMENT'::text
      ELSE "contentType"::text
    END
  )::"ContentType_new";

-- Drop old type
DROP TYPE "ContentType";

-- Rename new type to original name
ALTER TYPE "ContentType_new" RENAME TO "ContentType";
