-- CreateTable
CREATE TABLE "Story" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "startingScene" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protagonist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "health" INTEGER NOT NULL,
    "inventory" TEXT[],
    "location" TEXT NOT NULL,
    "baseTraits" TEXT[],
    "currentTraits" TEXT[],
    "storyId" INTEGER NOT NULL,

    CONSTRAINT "Protagonist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" SERIAL NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "narrationText" TEXT NOT NULL,
    "userAction" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "protagonistSnapshot" JSONB NOT NULL,
    "storyId" INTEGER NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Protagonist_storyId_key" ON "Protagonist"("storyId");

-- AddForeignKey
ALTER TABLE "Protagonist" ADD CONSTRAINT "Protagonist_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
