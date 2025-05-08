export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          event_id: string
          first_appointment_attended: number | null
          first_appointment_no_shows: number | null
          id: string
          second_appointment_attended: number | null
          set_after_event: number | null
          set_at_event: number | null
        }
        Insert: {
          event_id: string
          first_appointment_attended?: number | null
          first_appointment_no_shows?: number | null
          id?: string
          second_appointment_attended?: number | null
          set_after_event?: number | null
          set_at_event?: number | null
        }
        Update: {
          event_id?: string
          first_appointment_attended?: number | null
          first_appointment_no_shows?: number | null
          id?: string
          second_appointment_attended?: number | null
          set_after_event?: number | null
          set_at_event?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "marketing_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          attendees: number | null
          clients_from_event: number | null
          confirmations: number | null
          event_id: string
          id: string
          registrant_responses: number | null
        }
        Insert: {
          attendees?: number | null
          clients_from_event?: number | null
          confirmations?: number | null
          event_id: string
          id?: string
          registrant_responses?: number | null
        }
        Update: {
          attendees?: number | null
          clients_from_event?: number | null
          confirmations?: number | null
          event_id?: string
          id?: string
          registrant_responses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "marketing_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_details: {
        Row: {
          age_range: string | null
          event_id: string | null
          id: string
          income_assets: string | null
          location: string | null
          mile_radius: string | null
          time: string | null
          topic: string | null
          type: string | null
        }
        Insert: {
          age_range?: string | null
          event_id?: string | null
          id?: string
          income_assets?: string | null
          location?: string | null
          mile_radius?: string | null
          time?: string | null
          topic?: string | null
          type?: string | null
        }
        Update: {
          age_range?: string | null
          event_id?: string | null
          id?: string
          income_assets?: string | null
          location?: string | null
          mile_radius?: string | null
          time?: string | null
          topic?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_details_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "marketing_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_appointments: {
        Row: {
          event_id: string
          first_appointment_attended: number | null
          first_appointment_no_shows: number | null
          id: string
          second_appointment_attended: number | null
          set_after_event: number | null
          set_at_event: number | null
        }
        Insert: {
          event_id: string
          first_appointment_attended?: number | null
          first_appointment_no_shows?: number | null
          id?: string
          second_appointment_attended?: number | null
          set_after_event?: number | null
          set_at_event?: number | null
        }
        Update: {
          event_id?: string
          first_appointment_attended?: number | null
          first_appointment_no_shows?: number | null
          id?: string
          second_appointment_attended?: number | null
          set_after_event?: number | null
          set_at_event?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_appointments_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "marketing_events"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_production: {
        Row: {
          aum: number | null
          event_id: string
          financial_planning: number | null
          fixed_annuity: number | null
          id: string
          life_insurance: number | null
          total: number | null
          annuities_sold: number | null
          life_policies_sold: number | null
          annuity_premium: number | null
          life_insurance_premium: number | null
          aum_fees: number | null
        }
        Insert: {
          aum?: number | null
          event_id: string
          financial_planning?: number | null
          fixed_annuity?: number | null
          id?: string
          life_insurance?: number | null
          total?: number | null
          annuities_sold?: number | null
          life_policies_sold?: number | null
          annuity_premium?: number | null
          life_insurance_premium?: number | null
          aum_fees?: number | null
        }
        Update: {
          aum?: number | null
          event_id?: string
          financial_planning?: number | null
          fixed_annuity?: number | null
          id?: string
          life_insurance?: number | null
          total?: number | null
          annuities_sold?: number | null
          life_policies_sold?: number | null
          annuity_premium?: number | null
          life_insurance_premium?: number | null
          aum_fees?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_production_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "marketing_events"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_expenses: {
        Row: {
          advertising_cost: number | null
          event_id: string
          food_venue_cost: number | null
          id: string
          other_costs: number | null
          total_cost: number | null
        }
        Insert: {
          advertising_cost?: number | null
          event_id: string
          food_venue_cost?: number | null
          id?: string
          other_costs?: number | null
          total_cost?: number | null
        }
        Update: {
          advertising_cost?: number | null
          event_id?: string
          food_venue_cost?: number | null
          id?: string
          other_costs?: number | null
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_expenses_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "marketing_events"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_events: {
        Row: {
          age_range: string | null
          date: string | null
          id: string
          income_assets: string | null
          location: string | null
          marketing_type: string | null
          mile_radius: string | null
          name: string | null
          status: string | null
          time: string | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          age_range?: string | null
          date?: string | null
          id?: string
          income_assets?: string | null
          location?: string | null
          marketing_type?: string | null
          mile_radius?: string | null
          name?: string | null
          status?: string | null
          time?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          age_range?: string | null
          date?: string | null
          id?: string
          income_assets?: string | null
          location?: string | null
          marketing_type?: string | null
          mile_radius?: string | null
          name?: string | null
          status?: string | null
          time?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approval_date: string | null
          approval_status: string | null
          auth_id: string | null
          company: string | null
          email: string | null
          full_name: string | null
          id: string
          marketing_goal: string | null
          role: string | null
        }
        Insert: {
          approval_date?: string | null
          approval_status?: string | null
          auth_id?: string | null
          company?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          marketing_goal?: string | null
          role?: string | null
        }
        Update: {
          approval_date?: string | null
          approval_status?: string | null
          auth_id?: string | null
          company?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          marketing_goal?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
