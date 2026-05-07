import { createClient, type User } from '@supabase/supabase-js';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const envFilePath = resolve(process.cwd(), '.env.local');
if (existsSync(envFilePath)) {
    // Node 22 provides process.loadEnvFile, but TypeScript lib types may lag.
    (process as typeof process & { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(envFilePath);
}

// ----------------------------------------------------------------
// CONFIG — use service role key, never expose this client-side
// ----------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
        'Missing required env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set (for scripts, .env.local is supported).'
    );
}

const supabase = createClient(
    supabaseUrl,
    serviceRoleKey
);

const DEFAULT_PASSWORD = 'campfire';

// ----------------------------------------------------------------
// Users to reset — add/remove as needed
// ----------------------------------------------------------------
const MANUAL_USERS: { email: string; username: string }[] = [
    { email: 'abnoc@campfire.com', username: 'abnoc79' },
    { email: 'ddahsan@campfire.com', username: 'daredevil6' },
    { email: 'wali@campfire.com', username: 'penciluser3' },
    { email: 'nanfa@campfire.com', username: 'notnanfa' },
    { email: 'saad@campfire.com', username: 'saaddriazz' },
];

async function getAllAuthUsers() {
    const perPage = 1000;
    let page = 1;
    const allUsers: User[] = [];

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page,
            perPage,
        });

        if (error) {
            throw new Error(`Failed to list users on page ${page}: ${error.message}`);
        }

        allUsers.push(...data.users);

        if (data.users.length < perPage) {
            break;
        }

        page += 1;
    }

    return allUsers;
}

function isGoogleOAuthUser(user: User) {
    const providers = new Set<string>();

    const appMetadataProviders = user.app_metadata?.providers;
    if (Array.isArray(appMetadataProviders)) {
        for (const provider of appMetadataProviders) {
            if (typeof provider === 'string') {
                providers.add(provider.toLowerCase());
            }
        }
    }

    const appMetadataProvider = user.app_metadata?.provider;
    if (typeof appMetadataProvider === 'string') {
        providers.add(appMetadataProvider.toLowerCase());
    }

    for (const identity of user.identities ?? []) {
        if (identity.provider) {
            providers.add(identity.provider.toLowerCase());
        }
    }

    return providers.has('google');
}

function isManualEmailUser(user: User) {
    const providers = new Set<string>();

    const appMetadataProviders = user.app_metadata?.providers;
    if (Array.isArray(appMetadataProviders)) {
        for (const provider of appMetadataProviders) {
            if (typeof provider === 'string') {
                providers.add(provider.toLowerCase());
            }
        }
    }

    const appMetadataProvider = user.app_metadata?.provider;
    if (typeof appMetadataProvider === 'string') {
        providers.add(appMetadataProvider.toLowerCase());
    }

    for (const identity of user.identities ?? []) {
        if (identity.provider) {
            providers.add(identity.provider.toLowerCase());
        }
    }

    return providers.has('email') && !providers.has('google');
}

// ----------------------------------------------------------------
// Reset passwords
// ----------------------------------------------------------------
async function resetPasswords() {
    console.log('Starting password reset for manually registered users...\n');

    const users = await getAllAuthUsers();

    for (const user of MANUAL_USERS) {
        // 1. Find the auth user by email
        const authUser = users.find(
            u => (u.email ?? '').toLowerCase() === user.email.toLowerCase()
        );

        if (!authUser) {
            console.warn(`⚠ No auth user found for ${user.email} (${user.username}) — skipping`);
            continue;
        }

        if (isGoogleOAuthUser(authUser)) {
            console.warn(`⚠ Skipping Google OAuth user ${user.username} (${user.email})`);
            continue;
        }

        if (!isManualEmailUser(authUser)) {
            console.warn(`⚠ Skipping non-manual auth user ${user.username} (${user.email})`);
            continue;
        }

        // 2. Update password via admin API
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            authUser.id,
            { password: DEFAULT_PASSWORD }
        );

        if (updateError) {
            console.error(`✗ Failed to reset ${user.username} (${user.email}): ${updateError.message}`);
        } else {
            console.log(`✓ Reset password for ${user.username} (${user.email})`);
        }
    }

    console.log('\nDone. All users can now log in with password: "campfire"');
    console.log('Remind users to change their password after first login.');
}

resetPasswords().catch((error) => {
    console.error('Password reset script failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
});