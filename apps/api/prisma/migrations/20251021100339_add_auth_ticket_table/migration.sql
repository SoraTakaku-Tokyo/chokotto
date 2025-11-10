-- CreateTable
CREATE TABLE "auth_tickets" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_tickets_token_key" ON "auth_tickets"("token");

-- CreateIndex
CREATE INDEX "auth_tickets_token_expires_at_isUsed_idx" ON "auth_tickets"("token", "expires_at", "isUsed");

-- AddForeignKey
ALTER TABLE "auth_tickets" ADD CONSTRAINT "auth_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
