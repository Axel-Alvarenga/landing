-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "planActivatedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);
