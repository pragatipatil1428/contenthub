-- DropForeignKey
ALTER TABLE "_ContentTags" DROP CONSTRAINT "_ContentTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContentTags" DROP CONSTRAINT "_ContentTags_B_fkey";

-- DropTable
DROP TABLE "_ContentTags";

-- DropTable
DROP TABLE "tags";
