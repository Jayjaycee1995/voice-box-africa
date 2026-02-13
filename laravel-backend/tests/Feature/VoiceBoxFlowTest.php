<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Gig;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class VoiceBoxFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_application_flow()
    {
        // 1. Register Client
        $clientResponse = $this->postJson('/api/register', [
            'name' => 'Client User',
            'email' => 'client@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'client',
        ]);
        $clientResponse->assertStatus(201);
        $clientId = $clientResponse->json('user.id');
        $clientUser = User::find($clientId);

        // 2. Register Talent
        $talentResponse = $this->postJson('/api/register', [
            'name' => 'Talent User',
            'email' => 'talent@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'talent',
            'bio' => 'I am a voice talent',
            'skills' => json_encode(['English', 'Voice Over']),
        ]);
        $talentResponse->assertStatus(201);
        $talentId = $talentResponse->json('user.id');
        $talentUser = User::find($talentId);

        // 3. Client Posts a Gig
        $gigResponse = $this->actingAs($clientUser)->postJson('/api/gigs', [
            'title' => 'Test Gig',
            'description' => 'This is a test gig',
            'budget' => 100,
            'deadline' => '2024-12-31',
            'language' => 'English',
            'accent' => 'British',
            'tone' => 'Professional',
            'visibility' => 'public',
        ]);
        $gigResponse->assertStatus(201);
        $gigId = $gigResponse->json('gig.id');

        // 4. Talent Lists Gigs
        $gigsListResponse = $this->actingAs($talentUser)->getJson('/api/gigs');
        $gigsListResponse->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($gigsListResponse->json()));
        $this->assertEquals($gigId, $gigsListResponse->json('0.id'));

        // 5. Talent Submits Proposal
        $proposalResponse = $this->actingAs($talentUser)->postJson("/api/gigs/{$gigId}/proposals", [
            'cover_letter' => 'I can do this job.',
            'bid_amount' => 90,
        ]);
        $proposalResponse->assertStatus(201);
        $proposalId = $proposalResponse->json('proposal.id');

        // 6. Client Accepts Proposal
        $acceptResponse = $this->actingAs($clientUser)->putJson("/api/proposals/{$proposalId}", [
            'status' => 'accepted',
        ]);
        $acceptResponse->assertStatus(200);
        
        // Verify Gig status updated to 'assigned'
        $updatedGig = Gig::find($gigId);
        $this->assertEquals('assigned', $updatedGig->status);

        // 7. Client Sends Invitation
        // Create another gig for invitation
        $gig2Response = $this->actingAs($clientUser)->postJson('/api/gigs', [
            'title' => 'Invite Only Gig',
            'description' => 'Invite only',
            'budget' => 200,
            'deadline' => '2024-12-31',
            'visibility' => 'invite-only',
        ]);
        $gig2Id = $gig2Response->json('gig.id');

        $inviteResponse = $this->actingAs($clientUser)->postJson('/api/invitations', [
            'talent_id' => $talentId,
            'gig_id' => $gig2Id,
            'message' => 'Please join this project',
        ]);
        $inviteResponse->assertStatus(201);
        $invitationId = $inviteResponse->json('invitation.id');

        // 8. Talent Lists Invitations
        $invitationsResponse = $this->actingAs($talentUser)->getJson('/api/invitations');
        $invitationsResponse->assertStatus(200);
        $this->assertCount(1, $invitationsResponse->json());

        // 9. Talent Accepts Invitation
        $acceptInviteResponse = $this->actingAs($talentUser)->putJson("/api/invitations/{$invitationId}", [
            'status' => 'accepted',
        ]);
        $acceptInviteResponse->assertStatus(200);

        // 10. Client Sends Message
        $msgResponse = $this->actingAs($clientUser)->postJson('/api/messages', [
            'receiver_id' => $talentId,
            'content' => 'Hello Talent!',
        ]);
        $msgResponse->assertStatus(201);

        // 11. Talent Fetches Conversations
        $convResponse = $this->actingAs($talentUser)->getJson('/api/conversations');
        $convResponse->assertStatus(200);
        $this->assertCount(1, $convResponse->json());
        $this->assertEquals($clientId, $convResponse->json('0.id'));

        // 12. Talent Fetches Messages
        $msgsResponse = $this->actingAs($talentUser)->getJson("/api/messages/{$clientId}");
        $msgsResponse->assertStatus(200);
        $this->assertCount(1, $msgsResponse->json());
        $this->assertEquals('Hello Talent!', $msgsResponse->json('0.content'));
    }
}