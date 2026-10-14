CREATE TABLE IF NOT EXISTS "UserIssueReport" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "projectId" INTEGER,
  "projectUrl" TEXT,
  "reporterEmail" TEXT,
  "status" TEXT NOT NULL DEFAULT 'received',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserIssueReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UserIssueReport_createdAt_idx" ON "UserIssueReport"("createdAt");
CREATE INDEX IF NOT EXISTS "UserIssueReport_status_idx" ON "UserIssueReport"("status");

CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id" SERIAL NOT NULL,
  "endpoint" TEXT NOT NULL,
  "ownerHash" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "expirationTime" TIMESTAMP(3),
  "userAgent" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX IF NOT EXISTS "PushSubscription_ownerHash_idx" ON "PushSubscription"("ownerHash");
CREATE INDEX IF NOT EXISTS "PushSubscription_active_idx" ON "PushSubscription"("active");