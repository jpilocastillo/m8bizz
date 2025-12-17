/**
 * Integration tests for Row Level Security (RLS) and multi-user data isolation
 * 
 * These tests ensure that:
 * 1. Users can only access their own data
 * 2. Users cannot see or modify other users' data
 * 3. RLS policies are properly enforced
 */

/**
 * @jest-environment node
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import {
  createAdminClient,
  createUserClient,
  createTestUser,
  cleanupTestUser,
  cleanupAllTestUsers,
} from '../utils/test-helpers'
import { advisorBasecampService } from '@/lib/advisor-basecamp'

describe('Multi-User RLS and Data Isolation', () => {
  let user1Id: string
  let user2Id: string
  let user1Credentials: { email: string; password: string }
  let user2Credentials: { email: string; password: string }

  beforeAll(async () => {
    // Create test users
    const user1 = await createTestUser(
      'test.user1@example.com',
      'password123',
      'Test User 1',
      'Test Company 1'
    )
    user1Id = user1.id
    user1Credentials = { email: user1.email, password: user1.password }

    const user2 = await createTestUser(
      'test.user2@example.com',
      'password123',
      'Test User 2',
      'Test Company 2'
    )
    user2Id = user2.id
    user2Credentials = { email: user2.email, password: user2.password }
  })

  afterAll(async () => {
    // Cleanup test users
    await cleanupTestUser(user1Id)
    await cleanupTestUser(user2Id)
  })

  describe('Data Isolation - Business Goals', () => {
    it('should allow user1 to create and read their own business goals', async () => {
      const { client, user } = await createUserClient(
        user1Credentials.email,
        user1Credentials.password
      )

      const testData = {
        business_goal: 1000000,
        aum_goal: 5000000,
        aum_goal_percentage: 50,
        annuity_goal: 2000000,
        annuity_goal_percentage: 20,
        life_target_goal: 3000000,
        life_target_goal_percentage: 30,
      }

      // Save data
      const saved = await advisorBasecampService.upsertBusinessGoals(user, testData)
      expect(saved).toBeTruthy()

      // Read data back
      const retrieved = await advisorBasecampService.getBusinessGoals(user)
      expect(retrieved).toBeTruthy()
      expect(retrieved?.business_goal).toBe(testData.business_goal)
      expect(retrieved?.aum_goal).toBe(testData.aum_goal)
    })

    it('should prevent user2 from seeing user1 business goals', async () => {
      const { client: user1Client, user: user1 } = await createUserClient(
        user1Credentials.email,
        user1Credentials.password
      )

      const { client: user2Client, user: user2 } = await createUserClient(
        user2Credentials.email,
        user2Credentials.password
      )

      // User1 creates data
      const user1Data = {
        business_goal: 2000000,
        aum_goal: 10000000,
        aum_goal_percentage: 50,
        annuity_goal: 4000000,
        annuity_goal_percentage: 20,
        life_target_goal: 6000000,
        life_target_goal_percentage: 30,
      }
      await advisorBasecampService.upsertBusinessGoals(user1, user1Data)

      // User2 tries to read user1's data - should get null or empty
      const user2Data = await advisorBasecampService.getBusinessGoals(user2)
      
      // User2 should not see user1's data
      // Either null (no data) or their own data if they have some
      if (user2Data) {
        // If user2 has data, it should be different from user1's
        expect(user2Data.business_goal).not.toBe(user1Data.business_goal)
      }
    })

    it('should allow both users to have separate business goals', async () => {
      const { user: user1 } = await createUserClient(
        user1Credentials.email,
        user1Credentials.password
      )

      const { user: user2 } = await createUserClient(
        user2Credentials.email,
        user2Credentials.password
      )

      const user1Data = {
        business_goal: 3000000,
        aum_goal: 15000000,
        aum_goal_percentage: 50,
        annuity_goal: 6000000,
        annuity_goal_percentage: 20,
        life_target_goal: 9000000,
        life_target_goal_percentage: 30,
      }

      const user2Data = {
        business_goal: 5000000,
        aum_goal: 25000000,
        aum_goal_percentage: 50,
        annuity_goal: 10000000,
        annuity_goal_percentage: 20,
        life_target_goal: 15000000,
        life_target_goal_percentage: 30,
      }

      // Both users save their data
      const saved1 = await advisorBasecampService.upsertBusinessGoals(user1, user1Data)
      const saved2 = await advisorBasecampService.upsertBusinessGoals(user2, user2Data)

      expect(saved1).toBeTruthy()
      expect(saved2).toBeTruthy()

      // Both users read their own data
      const retrieved1 = await advisorBasecampService.getBusinessGoals(user1)
      const retrieved2 = await advisorBasecampService.getBusinessGoals(user2)

      expect(retrieved1?.business_goal).toBe(user1Data.business_goal)
      expect(retrieved2?.business_goal).toBe(user2Data.business_goal)
      expect(retrieved1?.business_goal).not.toBe(retrieved2?.business_goal)
    })
  })

  describe('Data Isolation - Marketing Campaigns', () => {
    it('should allow users to create separate campaigns', async () => {
      const { user: user1 } = await createUserClient(
        user1Credentials.email,
        user1Credentials.password
      )

      const { user: user2 } = await createUserClient(
        user2Credentials.email,
        user2Credentials.password
      )

      const user1Campaign = {
        name: 'User1 Campaign',
        budget: 10000,
        events: 5,
        leads: 100,
        status: 'Active' as const,
      }

      const user2Campaign = {
        name: 'User2 Campaign',
        budget: 20000,
        events: 10,
        leads: 200,
        status: 'Active' as const,
      }

      // Both users create campaigns
      const campaign1 = await advisorBasecampService.createMarketingCampaign(user1, user1Campaign)
      const campaign2 = await advisorBasecampService.createMarketingCampaign(user2, user2Campaign)

      expect(campaign1).toBeTruthy()
      expect(campaign2).toBeTruthy()

      // Both users read their own campaigns
      const user1Campaigns = await advisorBasecampService.getMarketingCampaigns(user1)
      const user2Campaigns = await advisorBasecampService.getMarketingCampaigns(user2)

      expect(user1Campaigns.length).toBeGreaterThan(0)
      expect(user2Campaigns.length).toBeGreaterThan(0)

      // Verify campaigns are isolated
      const user1CampaignNames = user1Campaigns.map((c) => c.name)
      const user2CampaignNames = user2Campaigns.map((c) => c.name)

      expect(user1CampaignNames).toContain('User1 Campaign')
      expect(user2CampaignNames).toContain('User2 Campaign')
      expect(user1CampaignNames).not.toContain('User2 Campaign')
      expect(user2CampaignNames).not.toContain('User1 Campaign')
    })
  })

  describe('Data Isolation - Complete Advisor Basecamp Data', () => {
    it('should allow users to save and retrieve complete isolated datasets', async () => {
      const { user: user1 } = await createUserClient(
        user1Credentials.email,
        user1Credentials.password
      )

      const { user: user2 } = await createUserClient(
        user2Credentials.email,
        user2Credentials.password
      )

      const user1CompleteData = {
        businessGoals: {
          business_goal: 1000000,
          aum_goal: 5000000,
          aum_goal_percentage: 50,
          annuity_goal: 2000000,
          annuity_goal_percentage: 20,
          life_target_goal: 3000000,
          life_target_goal_percentage: 30,
        },
        currentValues: {
          current_aum: 2500000,
          current_annuity: 1000000,
          current_life_production: 500000,
        },
        clientMetrics: {
          avg_annuity_size: 100000,
          avg_aum_size: 500000,
          avg_net_worth_needed: 1000000,
          appointment_attrition: 0.2,
          avg_close_ratio: 0.3,
          annuity_closed: 10,
          aum_accounts: 5,
          clients_needed: 20,
          monthly_ideal_prospects: 50,
          appointments_per_campaign: 25,
        },
        campaigns: [
          {
            name: 'User1 Complete Campaign',
            budget: 5000,
            events: 3,
            leads: 50,
            status: 'Active' as const,
          },
        ],
        commissionRates: {
          planning_fee_rate: 0.01,
          planning_fees_count: 10,
          annuity_commission: 0.05,
          aum_commission: 0.01,
          life_commission: 0.1,
          trail_income_percentage: 0.005,
        },
        financialBook: {
          annuity_book_value: 2000000,
          aum_book_value: 10000000,
          qualified_money_value: 5000000,
        },
      }

      const user2CompleteData = {
        ...user1CompleteData,
        businessGoals: {
          ...user1CompleteData.businessGoals,
          business_goal: 2000000, // Different value
        },
        campaigns: [
          {
            name: 'User2 Complete Campaign',
            budget: 10000,
            events: 5,
            leads: 100,
            status: 'Active' as const,
          },
        ],
      }

      // Both users save complete data
      const saved1 = await advisorBasecampService.saveAllAdvisorBasecampData(user1, user1CompleteData)
      const saved2 = await advisorBasecampService.saveAllAdvisorBasecampData(user2, user2CompleteData)

      expect(saved1).toBe(true)
      expect(saved2).toBe(true)

      // Both users retrieve their own data
      const retrieved1 = await advisorBasecampService.getAllAdvisorBasecampData(user1)
      const retrieved2 = await advisorBasecampService.getAllAdvisorBasecampData(user2)

      expect(retrieved1.businessGoals?.business_goal).toBe(user1CompleteData.businessGoals.business_goal)
      expect(retrieved2.businessGoals?.business_goal).toBe(user2CompleteData.businessGoals.business_goal)

      // Verify campaigns are isolated
      const user1Campaigns = retrieved1.campaigns || []
      const user2Campaigns = retrieved2.campaigns || []

      expect(user1Campaigns.some((c) => c.name === 'User1 Complete Campaign')).toBe(true)
      expect(user2Campaigns.some((c) => c.name === 'User2 Complete Campaign')).toBe(true)
      expect(user1Campaigns.some((c) => c.name === 'User2 Complete Campaign')).toBe(false)
      expect(user2Campaigns.some((c) => c.name === 'User1 Complete Campaign')).toBe(false)
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle concurrent data saves from different users', async () => {
      const { user: user1 } = await createUserClient(
        user1Credentials.email,
        user1Credentials.password
      )

      const { user: user2 } = await createUserClient(
        user2Credentials.email,
        user2Credentials.password
      )

      // Simulate concurrent saves
      const promises = [
        advisorBasecampService.upsertBusinessGoals(user1, {
          business_goal: 1000000,
          aum_goal: 5000000,
          aum_goal_percentage: 50,
          annuity_goal: 2000000,
          annuity_goal_percentage: 20,
          life_target_goal: 3000000,
          life_target_goal_percentage: 30,
        }),
        advisorBasecampService.upsertBusinessGoals(user2, {
          business_goal: 2000000,
          aum_goal: 10000000,
          aum_goal_percentage: 50,
          annuity_goal: 4000000,
          annuity_goal_percentage: 20,
          life_target_goal: 6000000,
          life_target_goal_percentage: 30,
        }),
        advisorBasecampService.upsertCurrentValues(user1, {
          current_aum: 2500000,
          current_annuity: 1000000,
          current_life_production: 500000,
        }),
        advisorBasecampService.upsertCurrentValues(user2, {
          current_aum: 5000000,
          current_annuity: 2000000,
          current_life_production: 1000000,
        }),
      ]

      const results = await Promise.all(promises)
      expect(results.every((r) => r === true)).toBe(true)

      // Verify data integrity
      const user1Goals = await advisorBasecampService.getBusinessGoals(user1)
      const user2Goals = await advisorBasecampService.getBusinessGoals(user2)

      expect(user1Goals?.business_goal).toBe(1000000)
      expect(user2Goals?.business_goal).toBe(2000000)
    })
  })
})

