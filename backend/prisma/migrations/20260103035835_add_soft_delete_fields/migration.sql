-- AlterTable
ALTER TABLE "document_embeddings" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "instances" ADD COLUMN     "deletedAt" TIMESTAMP(3);
