import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// ---- Legacy table shapes ----

interface LegacyUserRole {
  user_id: string | null;
  username: string | null;
  nickname: string | null;
  bungie_id: string | null;
  bungie_member_id: string | null;
  roles: string | null;
  joined_at: Date | null;
  profile_url: string | null;
}

interface LegacyUsageRow {
  command_count: number;
  command_type: string | null;
  command_timestamp: Date | null;
  command_by: bigint | string | null;
}

// ---- Migration steps ----

async function migrateUserRoles() {
  console.log('\n[1/2] user_roles → User + DestinyProfile');

  const rows = await prisma.$queryRaw<LegacyUserRole[]>`
    SELECT user_id, username, nickname, bungie_id, bungie_member_id, roles, joined_at, profile_url
    FROM user_roles
  `;
  console.log(`  ${rows.length} rows found`);

  let usersUpserted = 0;
  let destinyUpserted = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.user_id) {
      console.log(`  [SKIP] Missing user_id (username="${row.username}")`);
      skipped++;
      continue;
    }

    await prisma.user.upsert({
      where: { discordId: row.user_id },
      create: {
        discordId: row.user_id,
        ...(row.joined_at ? { createdAt: row.joined_at } : {}),
      },
      update: {},
    });
    usersUpserted++;

    if (row.bungie_id) {
      await prisma.destinyProfile.upsert({
        where: { userId: row.user_id },
        create: {
          userId: row.user_id,
          bungieId: row.bungie_id,
        },
        update: {
          bungieId: row.bungie_id,
        },
      });
      destinyUpserted++;
      console.log(`  [OK] ${row.username ?? row.user_id} → User + DestinyProfile (${row.bungie_id})`);
    } else {
      console.log(`  [OK] ${row.username ?? row.user_id} → User (no Bungie ID)`);
    }
  }

  console.log('');
  console.log(`  Users upserted:           ${usersUpserted}`);
  console.log(`  DestinyProfiles upserted: ${destinyUpserted}`);
  console.log(`  Skipped:                  ${skipped}`);
}

async function migrateSpicyUsage() {
  console.log('\n[2/2] spicy_usage → UsageEvent');

  const guildId = process.env.GUILD_ID;
  if (!guildId) {
    console.error('  [ERROR] GUILD_ID is not set in .env');
    console.error('          Add GUILD_ID and re-run to migrate usage data');
    return;
  }

  // Guard: UsageEvent has no unique constraint, so a second run would duplicate everything.
  // Require a manual truncate before re-running.
  const existingCount = await prisma.usageEvent.count();
  if (existingCount > 0) {
    console.log(`  [SKIP] UsageEvent already has ${existingCount} records`);
    console.log('         Truncate the table first if you need to re-migrate:');
    console.log('         DELETE FROM "UsageEvent";');
    return;
  }

  const rows = await prisma.$queryRaw<LegacyUsageRow[]>`
    SELECT command_count, command_type, command_timestamp, command_by
    FROM spicy_usage
  `;
  console.log(`  ${rows.length} rows found`);

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.command_by == null || !row.command_type) {
      console.log(`  [SKIP] Missing command_by or command_type`);
      skipped++;
      continue;
    }

    if (row.command_count > 1) {
      // The legacy table aggregated counts — we record a single event and note the discrepancy.
      console.log(`  [NOTE] command_count=${row.command_count} for "${row.command_type}" by ${row.command_by} — recorded as one event`);
    }

    await prisma.usageEvent.create({
      data: {
        guildId,
        userId: String(row.command_by),
        command: row.command_type,
        createdAt: row.command_timestamp ?? new Date(),
      },
    });
    created++;

    if (created % 100 === 0) {
      console.log(`  ... ${created} / ${rows.length}`);
    }
  }

  console.log('');
  console.log(`  UsageEvents created: ${created}`);
  console.log(`  Skipped:             ${skipped}`);
}

// ---- Entry point ----

async function main() {
  const redactedUrl = process.env.DATABASE_URL?.replace(/:\/\/[^@]+@/, '://<redacted>@') ?? 'not set';
  console.log('Legacy data migration');
  console.log(`Database: ${redactedUrl}`);

  try {
    await migrateUserRoles();
    await migrateSpicyUsage();
    console.log('\n✓ Migration complete');
  } catch (err) {
    console.error('\n✗ Migration failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
