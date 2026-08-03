import {
  calculateMarketingROI,
  estimateCampaignAppointments,
  estimateClientsFromAppointments,
  getAvgCommissionIncomePerClient,
} from "@/lib/marketing-roi"

describe("marketing-roi", () => {
  describe("getAvgCommissionIncomePerClient", () => {
    it("returns 0 when metrics or rates are missing", () => {
      expect(getAvgCommissionIncomePerClient(null, null)).toBe(0)
      expect(
        getAvgCommissionIncomePerClient(
          { avg_annuity_size: 100000, avg_aum_size: 200000 },
          null,
        ),
      ).toBe(0)
    })

    it("uses commission rates on production sizes, not raw production", () => {
      const income = getAvgCommissionIncomePerClient(
        { avg_annuity_size: 100000, avg_aum_size: 200000 },
        {
          annuity_commission: 5,
          aum_commission: 1,
          planning_fee_rate: 500,
        },
      )
      // 100000*5% + 200000*1% + 500 = 5000 + 2000 + 500
      expect(income).toBe(7500)
    })
  })

  describe("estimateCampaignAppointments", () => {
    it("uses events directly and does not multiply by appointments_per_campaign", () => {
      expect(
        estimateCampaignAppointments({
          totalEvents: 3,
          totalLeads: 25,
          campaignCount: 2,
          appointmentsPerCampaign: 10,
        }),
      ).toBe(3)
    })

    it("falls back to campaign count × appointments_per_campaign when no events", () => {
      expect(
        estimateCampaignAppointments({
          totalEvents: 0,
          totalLeads: 25,
          campaignCount: 2,
          appointmentsPerCampaign: 10,
        }),
      ).toBe(20)
    })
  })

  describe("calculateMarketingROI with realistic advisor inputs", () => {
    it("avoids 10x inflation from events × appointments_per_campaign", () => {
      const incomePerClient = getAvgCommissionIncomePerClient(
        { avg_annuity_size: 200000, avg_aum_size: 350000 },
        { annuity_commission: 7, aum_commission: 1, planning_fee_rate: 2500 },
      )
      const appointments = estimateCampaignAppointments({
        totalEvents: 3,
        totalLeads: 25,
        campaignCount: 2,
        appointmentsPerCampaign: 10,
      })
      const clients = estimateClientsFromAppointments(appointments, 20, 80)
      const roi = calculateMarketingROI(clients * incomePerClient, 3500)

      expect(incomePerClient).toBe(20000)
      expect(appointments).toBe(3)
      expect(clients).toBe(2)
      expect(roi).toBeCloseTo(1042.857, 2)
    })
  })

  describe("calculateMarketingROI", () => {
    it("computes ((income - cost) / cost) * 100", () => {
      expect(calculateMarketingROI(7500, 3500)).toBeCloseTo(114.2857, 3)
    })

    it("returns 0 when both are 0", () => {
      expect(calculateMarketingROI(0, 0)).toBe(0)
    })

    it("returns sentinel when income exists but cost is 0", () => {
      expect(calculateMarketingROI(1000, 0)).toBe(9999)
    })
  })
})
