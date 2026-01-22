-- AlterTable: Add CASCADE on delete to products.storeId foreign key
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_storeId_fkey";
ALTER TABLE "products" ADD CONSTRAINT "products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
