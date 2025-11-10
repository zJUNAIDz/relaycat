-- CreateEnum
CREATE TYPE "public"."MemberRole" AS ENUM ('ADMIN', 'MODERATOR', 'GUEST');

-- CreateEnum
CREATE TYPE "public"."ChannelType" AS ENUM ('TEXT', 'AUDIO', 'VIDEO');

-- CreateTable
CREATE TABLE "public"."Account" (
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Server" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Member" (
    "id" TEXT NOT NULL,
    "role" "public"."MemberRole" NOT NULL DEFAULT 'GUEST',
    "userId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ChannelType" NOT NULL DEFAULT 'TEXT',
    "userId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "memberId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" TEXT NOT NULL,
    "memberOneId" TEXT NOT NULL,
    "memberTwoId" TEXT NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DirectMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "public"."User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Server_inviteCode_key" ON "public"."Server"("inviteCode");

-- CreateIndex
CREATE INDEX "Server_userId_idx" ON "public"."Server"("userId");

-- CreateIndex
CREATE INDEX "Member_userId_idx" ON "public"."Member"("userId");

-- CreateIndex
CREATE INDEX "Member_serverId_idx" ON "public"."Member"("serverId");

-- CreateIndex
CREATE INDEX "Channel_userId_idx" ON "public"."Channel"("userId");

-- CreateIndex
CREATE INDEX "Channel_serverId_idx" ON "public"."Channel"("serverId");

-- CreateIndex
CREATE INDEX "Message_channelId_idx" ON "public"."Message"("channelId");

-- CreateIndex
CREATE INDEX "Message_memberId_idx" ON "public"."Message"("memberId");

-- CreateIndex
CREATE INDEX "Conversation_memberTwoId_idx" ON "public"."Conversation"("memberTwoId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_memberOneId_memberTwoId_key" ON "public"."Conversation"("memberOneId", "memberTwoId");

-- CreateIndex
CREATE INDEX "DirectMessage_memberId_idx" ON "public"."DirectMessage"("memberId");

-- CreateIndex
CREATE INDEX "DirectMessage_conversationId_idx" ON "public"."DirectMessage"("conversationId");
