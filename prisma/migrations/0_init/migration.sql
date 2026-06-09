-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "destinyModule" BOOLEAN NOT NULL DEFAULT true,
    "aiPersona" BOOLEAN NOT NULL DEFAULT true,
    "lfgEnabled" BOOLEAN NOT NULL DEFAULT true,
    "welcomeRoles" BOOLEAN NOT NULL DEFAULT true,
    "welcomeChannelId" TEXT,
    "familyRoleId" TEXT,
    "lfgChannelId" TEXT,
    "aiChannelId" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumSince" TIMESTAMP(3),
    "customPersona" TEXT,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LfgPost" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT,
    "maxPlayers" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "messageId" TEXT,
    "channelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LfgPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LfgSignup" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LfgSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bungieId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GamerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Server_guildId_key" ON "Server"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "LfgSignup_postId_userId_key" ON "LfgSignup"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DestinyProfile_userId_key" ON "DestinyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GamerProfile_userId_platform_key" ON "GamerProfile"("userId", "platform");

-- AddForeignKey
ALTER TABLE "LfgPost" ADD CONSTRAINT "LfgPost_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Server"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LfgPost" ADD CONSTRAINT "LfgPost_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LfgSignup" ADD CONSTRAINT "LfgSignup_postId_fkey" FOREIGN KEY ("postId") REFERENCES "LfgPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LfgSignup" ADD CONSTRAINT "LfgSignup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinyProfile" ADD CONSTRAINT "DestinyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamerProfile" ADD CONSTRAINT "GamerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

