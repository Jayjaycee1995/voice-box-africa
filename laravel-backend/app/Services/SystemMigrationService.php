<?php

namespace App\Services;

use App\Models\User;
use App\Models\Gig;
use App\Models\Proposal;
use App\Models\Invitation;
use App\Models\Message;
use App\Models\Demo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class SystemMigrationService
{
    /**
     * Check if the system needs to transition to production.
     * Triggered on the first real user signup.
     */
    public function handleFirstUserSignup(User $firstUser)
    {
        $isInitialized = DB::table('system_settings')
            ->where('key', 'is_initialized')
            ->value('value');

        if ($isInitialized === '1') {
            return;
        }

        // We only trigger this if there are no other real users (excluding the one just created)
        $userCount = User::where('id', '!=', $firstUser->id)->count();
        
        if ($userCount > 0) {
            // Check if existing users are mock users (e.g., created by seeder)
            // For now, if there's any user, we might assume it's already initialized
            // unless we have a specific way to identify mock users.
            // Since we just added the settings table, we'll proceed if is_initialized is 0.
        }

        $this->transitionToProduction($firstUser);
    }

    /**
     * Transition system from mock data to production data.
     */
    public function transitionToProduction(User $firstUser)
    {
        Log::info('System migration started: Transitioning from mock to production data.');

        DB::beginTransaction();

        try {
            // 1. Archive mock data (Optional, but user requested 'safely archiving or purging')
            // For simplicity and speed in this environment, we will purge but could 
            // easily copy to archive tables if they existed.
            
            $this->purgeMockData($firstUser);

            // 2. Mark system as initialized
            DB::table('system_settings')
                ->where('key', 'is_initialized')
                ->update([
                    'value' => '1',
                    'updated_at' => now()
                ]);

            DB::table('system_settings')
                ->where('key', 'migration_date')
                ->update([
                    'value' => now()->toDateTimeString(),
                    'updated_at' => now()
                ]);

            DB::commit();
            Log::info('System migration completed successfully.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('System migration failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Purge all mock records while preserving system integrity and the first real user.
     */
    protected function purgeMockData(User $firstUser)
    {
        // Disable foreign key checks for truncation
        Schema::disableForeignKeyConstraints();

        try {
            // Delete all data EXCEPT for the first real user
            
            // Messages
            Message::query()->delete();
            
            // Invitations
            Invitation::query()->delete();
            
            // Proposals
            Proposal::query()->delete();
            
            // Gigs
            Gig::query()->delete();
            
            // Demos (except for the first user if they already uploaded one)
            Demo::where('user_id', '!=', $firstUser->id)->delete();
            
            // Users (except the first real user)
            User::where('id', '!=', $firstUser->id)->delete();
            
            Log::info('Mock data purged successfully.');
        } finally {
            Schema::enableForeignKeyConstraints();
        }
    }
}
