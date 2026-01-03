-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "InstanceStatus" AS ENUM ('CLOSE', 'OPEN', 'CONNECTING', 'CONNECTED', 'DISCONNECTED', 'DELETED');

-- Rename Columns in customers
ALTER TABLE "customers" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "customers" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "customers" ADD COLUMN "phone" TEXT;
ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL;

-- Handle Plan Enum migration
ALTER TABLE "customers" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "customers" ALTER COLUMN "plan" TYPE "Plan" USING "plan"::"Plan";
ALTER TABLE "customers" ALTER COLUMN "plan" SET DEFAULT 'FREE';


-- Rename Columns in document_embeddings
ALTER TABLE "document_embeddings" DROP CONSTRAINT "document_embeddings_instanceId_fkey";
ALTER TABLE "document_embeddings" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "document_embeddings" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "document_embeddings" RENAME COLUMN "instanceId" TO "instance_id";


-- Rename Columns in instances
ALTER TABLE "instances" DROP CONSTRAINT "instances_customerId_fkey";
ALTER TABLE "instances" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "instances" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "instances" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "instances" RENAME COLUMN "customerId" TO "customer_id";
ALTER TABLE "instances" RENAME COLUMN "evolutionKey" TO "evolution_key";

-- Handle InstanceStatus Enum migration
ALTER TABLE "instances" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "instances" ALTER COLUMN "status" TYPE "InstanceStatus" USING (
  CASE
    WHEN UPPER("status") = 'OPEN' THEN 'OPEN'::"InstanceStatus"
    WHEN UPPER("status") = 'CLOSE' THEN 'CLOSE'::"InstanceStatus"
    WHEN UPPER("status") = 'CONNECTING' THEN 'CONNECTING'::"InstanceStatus"
    WHEN UPPER("status") = 'CONNECTED' THEN 'CONNECTED'::"InstanceStatus"
    WHEN UPPER("status") = 'DELETED' THEN 'DELETED'::"InstanceStatus"
    ELSE 'DISCONNECTED'::"InstanceStatus"
  END
);
ALTER TABLE "instances" ALTER COLUMN "status" SET DEFAULT 'DISCONNECTED';


-- Re-Add FKs
ALTER TABLE "instances" ADD CONSTRAINT "instances_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_embeddings" ADD CONSTRAINT "document_embeddings_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
