export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author: string | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
        }
        Insert: {
          author?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
        }
        Update: {
          author?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      cms_media: {
        Row: {
          alt_text: string | null
          bucket_id: string
          caption: string | null
          copyright_notice: string | null
          created_at: string
          created_by: string | null
          credit: string | null
          file_size_bytes: number
          height: number | null
          id: string
          is_active: boolean
          media_kind: string
          metadata: Json
          mime_type: string
          object_path: string
          original_filename: string
          updated_at: string
          updated_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bucket_id?: string
          caption?: string | null
          copyright_notice?: string | null
          created_at?: string
          created_by?: string | null
          credit?: string | null
          file_size_bytes: number
          height?: number | null
          id?: string
          is_active?: boolean
          media_kind: string
          metadata?: Json
          mime_type: string
          object_path: string
          original_filename: string
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bucket_id?: string
          caption?: string | null
          copyright_notice?: string | null
          created_at?: string
          created_by?: string | null
          credit?: string | null
          file_size_bytes?: number
          height?: number | null
          id?: string
          is_active?: boolean
          media_kind?: string
          metadata?: Json
          mime_type?: string
          object_path?: string
          original_filename?: string
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_media_media_kind_fkey"
            columns: ["media_kind"]
            isOneToOne: false
            referencedRelation: "cms_media_kinds"
            referencedColumns: ["kind_key"]
          },
        ]
      }
      cms_media_kinds: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          is_active: boolean
          kind_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          is_active?: boolean
          kind_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          is_active?: boolean
          kind_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_form_delivery_settings: {
        Row: {
          created_at: string
          created_by: string | null
          destination_key: string | null
          singleton: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination_key?: string | null
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination_key?: string | null
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_form_delivery_settings_singleton_fkey"
            columns: ["singleton"]
            isOneToOne: true
            referencedRelation: "contact_form_settings"
            referencedColumns: ["singleton"]
          },
        ]
      }
      contact_form_settings: {
        Row: {
          allowed_attachment_types: string[]
          attachment_enabled: boolean
          consent_text: string | null
          created_at: string
          created_by: string | null
          enabled: boolean
          max_attachment_size_bytes: number
          recipient_label: string | null
          singleton: boolean
          spam_protection_mode: string
          success_message: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allowed_attachment_types?: string[]
          attachment_enabled?: boolean
          consent_text?: string | null
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          max_attachment_size_bytes?: number
          recipient_label?: string | null
          singleton?: boolean
          spam_protection_mode?: string
          success_message?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allowed_attachment_types?: string[]
          attachment_enabled?: boolean
          consent_text?: string | null
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          max_attachment_size_bytes?: number
          recipient_label?: string | null
          singleton?: boolean
          spam_protection_mode?: string
          success_message?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      content_chunks: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          source_id: string
          source_type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          source_id: string
          source_type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          source_id?: string
          source_type?: string
        }
        Relationships: []
      }
      event_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          event_id: string | null
          id: string
          photo_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          photo_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string | null
          email: string
          event_id: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          event_id?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          event_id?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string
          event_date: string | null
          id: string
          location: string | null
          registration_open: boolean | null
          slug: string
          title: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description: string
          event_date?: string | null
          id?: string
          location?: string | null
          registration_open?: boolean | null
          slug: string
          title: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string
          event_date?: string | null
          id?: string
          location?: string | null
          registration_open?: boolean | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      form_answers: {
        Row: {
          created_at: string
          display_order_snapshot: number
          field_id: string
          field_key_snapshot: string
          field_label_snapshot: string
          field_type_snapshot: string
          file_mime_type: string | null
          file_name: string | null
          file_path: string | null
          file_size_bytes: number | null
          form_id: string
          id: string
          selection_options_snapshot: Json | null
          submission_id: string
          updated_at: string
          value_json: Json | null
          value_text: string | null
        }
        Insert: {
          created_at?: string
          display_order_snapshot: number
          field_id: string
          field_key_snapshot: string
          field_label_snapshot: string
          field_type_snapshot: string
          file_mime_type?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          form_id: string
          id?: string
          selection_options_snapshot?: Json | null
          submission_id: string
          updated_at?: string
          value_json?: Json | null
          value_text?: string | null
        }
        Update: {
          created_at?: string
          display_order_snapshot?: number
          field_id?: string
          field_key_snapshot?: string
          field_label_snapshot?: string
          field_type_snapshot?: string
          file_mime_type?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          form_id?: string
          id?: string
          selection_options_snapshot?: Json | null
          submission_id?: string
          updated_at?: string
          value_json?: Json | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_answers_field_form_fk"
            columns: ["field_id", "form_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id", "form_id"]
          },
          {
            foreignKeyName: "form_answers_submission_form_fk"
            columns: ["submission_id", "form_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id", "form_id"]
          },
        ]
      }
      form_fields: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          field_key: string
          field_type: string
          form_id: string
          id: string
          is_active: boolean
          is_essential: boolean
          is_required: boolean
          label: string
          selection_options: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          field_key: string
          field_type: string
          form_id: string
          id?: string
          is_active?: boolean
          is_essential?: boolean
          is_required?: boolean
          label: string
          selection_options?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          field_key?: string
          field_type?: string
          form_id?: string
          id?: string
          is_active?: boolean
          is_essential?: boolean
          is_required?: boolean
          label?: string
          selection_options?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          form_id: string
          id: string
          idempotency_key: string
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          form_id: string
          id?: string
          idempotency_key: string
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          form_id?: string
          id?: string
          idempotency_key?: string
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_upload_intents: {
        Row: {
          consumed_at: string | null
          created_at: string
          expires_at: string
          field_id: string
          form_id: string
          id: string
          mime_type: string
          object_path: string
          original_name: string
          size_bytes: number
          submission_id: string | null
          updated_at: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          field_id: string
          form_id: string
          id?: string
          mime_type: string
          object_path: string
          original_name: string
          size_bytes: number
          submission_id?: string | null
          updated_at?: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          field_id?: string
          form_id?: string
          id?: string
          mime_type?: string
          object_path?: string
          original_name?: string
          size_bytes?: number
          submission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_upload_intents_field_form_fk"
            columns: ["field_id", "form_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id", "form_id"]
          },
          {
            foreignKeyName: "form_upload_intents_submission_form_fk"
            columns: ["submission_id", "form_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id", "form_id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_id: string | null
          id: string
          is_active: boolean
          is_public: boolean
          name: string
          programme_id: string | null
          programme_module_id: string | null
          purpose: string
          scholarship_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          name?: string
          programme_id?: string | null
          programme_module_id?: string | null
          purpose?: string
          scholarship_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          name?: string
          programme_id?: string | null
          programme_module_id?: string | null
          purpose?: string
          scholarship_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_programme_module_id_fkey"
            columns: ["programme_module_id"]
            isOneToOne: false
            referencedRelation: "programme_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_featured_programmes: {
        Row: {
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          custom_heading: string | null
          custom_summary: string | null
          display_order: number
          id: string
          image_override_path: string | null
          is_active: boolean
          programme_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          custom_heading?: string | null
          custom_summary?: string | null
          display_order?: number
          id?: string
          image_override_path?: string | null
          is_active?: boolean
          programme_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          custom_heading?: string | null
          custom_summary?: string | null
          display_order?: number
          id?: string
          image_override_path?: string | null
          is_active?: boolean
          programme_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homepage_featured_programmes_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: true
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_featured_scholarships: {
        Row: {
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          custom_heading: string | null
          custom_summary: string | null
          display_order: number
          id: string
          image_override_path: string | null
          is_active: boolean
          scholarship_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          custom_heading?: string | null
          custom_summary?: string | null
          display_order?: number
          id?: string
          image_override_path?: string | null
          is_active?: boolean
          scholarship_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          custom_heading?: string | null
          custom_summary?: string | null
          display_order?: number
          id?: string
          image_override_path?: string | null
          is_active?: boolean
          scholarship_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homepage_featured_scholarships_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: true
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_featured_stories: {
        Row: {
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          custom_heading: string | null
          custom_summary: string | null
          display_order: number
          id: string
          image_override_path: string | null
          is_active: boolean
          story_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          custom_heading?: string | null
          custom_summary?: string | null
          display_order?: number
          id?: string
          image_override_path?: string | null
          is_active?: boolean
          story_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          custom_heading?: string | null
          custom_summary?: string | null
          display_order?: number
          id?: string
          image_override_path?: string | null
          is_active?: boolean
          story_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homepage_featured_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: true
            referencedRelation: "success_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_statistics: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          display_value: string
          icon_key: string | null
          id: string
          is_active: boolean
          label: string
          prefix: string | null
          suffix: string | null
          supporting_text: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          display_value: string
          icon_key?: string | null
          id?: string
          is_active?: boolean
          label: string
          prefix?: string | null
          suffix?: string | null
          supporting_text?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          display_value?: string
          icon_key?: string | null
          id?: string
          is_active?: boolean
          label?: string
          prefix?: string | null
          suffix?: string | null
          supporting_text?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      office_locations: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          created_by: string | null
          display_order: number
          district: string | null
          email: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          latitude: number | null
          longitude: number | null
          map_url: string | null
          name: string
          office_hours: string | null
          office_hours_format: string
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name: string
          office_hours?: string | null
          office_hours_format?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name?: string
          office_hours?: string | null
          office_hours_format?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      partner_types: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          is_active: boolean
          type_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          is_active?: boolean
          type_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          is_active?: boolean
          type_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          is_featured: boolean
          logo_path: string | null
          name: string
          partner_type: string
          updated_at: string
          updated_by: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_path?: string | null
          name: string
          partner_type: string
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_path?: string | null
          name?: string
          partner_type?: string
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_partner_type_fkey"
            columns: ["partner_type"]
            isOneToOne: false
            referencedRelation: "partner_types"
            referencedColumns: ["type_key"]
          },
        ]
      }
      programme_categories: {
        Row: {
          colour: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          colour?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          colour?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      programme_learning_outcomes: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          outcome: string
          programme_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          outcome: string
          programme_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          outcome?: string
          programme_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programme_learning_outcomes_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_modules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          programme_id: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          programme_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          programme_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programme_modules_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_participants: {
        Row: {
          attendance_eligible: boolean
          certificate_eligible: boolean
          completed_at: string | null
          created_at: string
          created_by: string | null
          email: string | null
          enrolment_status: string
          full_name: string
          id: string
          joined_at: string
          metadata: Json
          notes: string | null
          participant_reference: string
          phone: string | null
          programme_id: string
          registration_submission_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attendance_eligible?: boolean
          certificate_eligible?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          enrolment_status?: string
          full_name: string
          id?: string
          joined_at?: string
          metadata?: Json
          notes?: string | null
          participant_reference?: string
          phone?: string | null
          programme_id: string
          registration_submission_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attendance_eligible?: boolean
          certificate_eligible?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          enrolment_status?: string
          full_name?: string
          id?: string
          joined_at?: string
          metadata?: Json
          notes?: string | null
          participant_reference?: string
          phone?: string | null
          programme_id?: string
          registration_submission_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programme_participants_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_participants_registration_submission_id_fkey"
            columns: ["registration_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      programmes: {
        Row: {
          application_deadline: string | null
          application_link: string | null
          cancellation_reason: string | null
          capacity: number | null
          category: string
          category_id: string | null
          certification: string | null
          contact_details: string | null
          created_at: string | null
          created_by: string | null
          delivery_mode: string | null
          description: string
          display_order: number
          duration: string | null
          eligibility: string | null
          ends_at: string | null
          entry_requirements: string | null
          featured: boolean
          featured_image_path: string | null
          fees: string | null
          full_description: string
          id: string
          image_url: string | null
          location: string | null
          programme_state: string
          published: boolean | null
          registration_closes_at: string | null
          registration_enabled: boolean
          registration_opens_at: string | null
          seo_description: string | null
          seo_title: string | null
          short_summary: string | null
          slug: string
          start_date: string | null
          starts_at: string | null
          timezone: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_link?: string | null
          cancellation_reason?: string | null
          capacity?: number | null
          category: string
          category_id?: string | null
          certification?: string | null
          contact_details?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_mode?: string | null
          description: string
          display_order?: number
          duration?: string | null
          eligibility?: string | null
          ends_at?: string | null
          entry_requirements?: string | null
          featured?: boolean
          featured_image_path?: string | null
          fees?: string | null
          full_description?: string
          id?: string
          image_url?: string | null
          location?: string | null
          programme_state?: string
          published?: boolean | null
          registration_closes_at?: string | null
          registration_enabled?: boolean
          registration_opens_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_summary?: string | null
          slug: string
          start_date?: string | null
          starts_at?: string | null
          timezone?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_link?: string | null
          cancellation_reason?: string | null
          capacity?: number | null
          category?: string
          category_id?: string | null
          certification?: string | null
          contact_details?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_mode?: string | null
          description?: string
          display_order?: number
          duration?: string | null
          eligibility?: string | null
          ends_at?: string | null
          entry_requirements?: string | null
          featured?: boolean
          featured_image_path?: string | null
          fees?: string | null
          full_description?: string
          id?: string
          image_url?: string | null
          location?: string | null
          programme_state?: string
          published?: boolean | null
          registration_closes_at?: string | null
          registration_enabled?: boolean
          registration_opens_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_summary?: string | null
          slug?: string
          start_date?: string | null
          starts_at?: string | null
          timezone?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programmes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "programme_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          apply_link: string | null
          country: string
          cover_image_url: string | null
          created_at: string | null
          deadline: string | null
          description: string
          eligibility: string | null
          funding_type: string
          id: string
          published: boolean | null
          required_documents: string | null
          slug: string
          study_level: string
          title: string
        }
        Insert: {
          apply_link?: string | null
          country: string
          cover_image_url?: string | null
          created_at?: string | null
          deadline?: string | null
          description: string
          eligibility?: string | null
          funding_type: string
          id?: string
          published?: boolean | null
          required_documents?: string | null
          slug: string
          study_level: string
          title: string
        }
        Update: {
          apply_link?: string | null
          country?: string
          cover_image_url?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string
          eligibility?: string | null
          funding_type?: string
          id?: string
          published?: boolean | null
          required_documents?: string | null
          slug?: string
          study_level?: string
          title?: string
        }
        Relationships: []
      }
      site_faqs: {
        Row: {
          answer: string
          answer_format: string
          category: string | null
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_active: boolean
          page_id: string | null
          question: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          answer: string
          answer_format?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          page_id?: string | null
          question: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          answer?: string
          answer_format?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          page_id?: string | null
          question?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_faqs_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      site_navigation_items: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_visible: boolean
          label: string
          location: string
          parent_id: string | null
          target: string
          updated_at: string
          updated_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          label: string
          location: string
          parent_id?: string | null
          target?: string
          updated_at?: string
          updated_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          label?: string
          location?: string
          parent_id?: string | null
          target?: string
          updated_at?: string
          updated_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pages: {
        Row: {
          canonical_url: string | null
          created_at: string
          created_by: string | null
          id: string
          og_description: string | null
          og_image_path: string | null
          og_title: string | null
          page_key: string
          published_at: string | null
          robots_follow: boolean
          robots_index: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          og_description?: string | null
          og_image_path?: string | null
          og_title?: string | null
          page_key: string
          published_at?: string | null
          robots_follow?: boolean
          robots_index?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          og_description?: string | null
          og_image_path?: string | null
          og_title?: string | null
          page_key?: string
          published_at?: string | null
          robots_follow?: boolean
          robots_index?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_section_types: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          is_active: boolean
          type_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          is_active?: boolean
          type_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          is_active?: boolean
          type_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          body: string | null
          body_format: string
          button_label: string | null
          button_url: string | null
          content_config: Json
          created_at: string
          created_by: string | null
          display_order: number
          heading: string | null
          id: string
          is_active: boolean
          media_path: string | null
          page_id: string
          published_at: string | null
          section_key: string
          section_type: string
          status: string
          subheading: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: string | null
          body_format?: string
          button_label?: string | null
          button_url?: string | null
          content_config?: Json
          created_at?: string
          created_by?: string | null
          display_order?: number
          heading?: string | null
          id?: string
          is_active?: boolean
          media_path?: string | null
          page_id: string
          published_at?: string | null
          section_key: string
          section_type: string
          status?: string
          subheading?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string | null
          body_format?: string
          button_label?: string | null
          button_url?: string | null
          content_config?: Json
          created_at?: string
          created_by?: string | null
          display_order?: number
          heading?: string | null
          id?: string
          is_active?: boolean
          media_path?: string | null
          page_id?: string
          published_at?: string | null
          section_key?: string
          section_type?: string
          status?: string
          subheading?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_sections_section_type_fkey"
            columns: ["section_type"]
            isOneToOne: false
            referencedRelation: "site_section_types"
            referencedColumns: ["type_key"]
          },
        ]
      }
      site_settings: {
        Row: {
          copyright_text: string | null
          created_at: string
          created_by: string | null
          default_locale: string
          default_office_address: string | null
          default_og_image_path: string | null
          default_robots_follow: boolean
          default_robots_index: boolean
          default_seo_description: string | null
          default_seo_title: string | null
          default_timezone: string
          favicon_path: string | null
          footer_description: string | null
          institute_name: string | null
          maintenance_mode: boolean
          newsletter_enabled: boolean
          primary_email: string | null
          primary_logo_path: string | null
          primary_phone: string | null
          seal_path: string | null
          secondary_logo_path: string | null
          secondary_phone: string | null
          short_name: string | null
          singleton: boolean
          tagline: string | null
          updated_at: string
          updated_by: string | null
          whatsapp_number: string | null
        }
        Insert: {
          copyright_text?: string | null
          created_at?: string
          created_by?: string | null
          default_locale?: string
          default_office_address?: string | null
          default_og_image_path?: string | null
          default_robots_follow?: boolean
          default_robots_index?: boolean
          default_seo_description?: string | null
          default_seo_title?: string | null
          default_timezone?: string
          favicon_path?: string | null
          footer_description?: string | null
          institute_name?: string | null
          maintenance_mode?: boolean
          newsletter_enabled?: boolean
          primary_email?: string | null
          primary_logo_path?: string | null
          primary_phone?: string | null
          seal_path?: string | null
          secondary_logo_path?: string | null
          secondary_phone?: string | null
          short_name?: string | null
          singleton?: boolean
          tagline?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          copyright_text?: string | null
          created_at?: string
          created_by?: string | null
          default_locale?: string
          default_office_address?: string | null
          default_og_image_path?: string | null
          default_robots_follow?: boolean
          default_robots_index?: boolean
          default_seo_description?: string | null
          default_seo_title?: string | null
          default_timezone?: string
          favicon_path?: string | null
          footer_description?: string | null
          institute_name?: string | null
          maintenance_mode?: boolean
          newsletter_enabled?: boolean
          primary_email?: string | null
          primary_logo_path?: string | null
          primary_phone?: string | null
          seal_path?: string | null
          secondary_logo_path?: string | null
          secondary_phone?: string | null
          short_name?: string | null
          singleton?: boolean
          tagline?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          before_after_description: string | null
          completion_year: number | null
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          display_order: number
          featured: boolean
          full_story: string
          id: string
          institution_or_employer: string | null
          location: string | null
          person_name: string
          profile_image_path: string | null
          programme_id: string | null
          published: boolean
          role_or_achievement: string | null
          scholarship_id: string | null
          seo_description: string | null
          seo_title: string | null
          short_summary: string | null
          slug: string
          story_title: string
          testimonial_quote: string | null
          updated_at: string
          updated_by: string | null
          video_url: string | null
        }
        Insert: {
          before_after_description?: string | null
          completion_year?: number | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          featured?: boolean
          full_story: string
          id?: string
          institution_or_employer?: string | null
          location?: string | null
          person_name: string
          profile_image_path?: string | null
          programme_id?: string | null
          published?: boolean
          role_or_achievement?: string | null
          scholarship_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_summary?: string | null
          slug: string
          story_title: string
          testimonial_quote?: string | null
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
        }
        Update: {
          before_after_description?: string | null
          completion_year?: number | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          featured?: boolean
          full_story?: string
          id?: string
          institution_or_employer?: string | null
          location?: string | null
          person_name?: string
          profile_image_path?: string | null
          programme_id?: string | null
          published?: boolean
          role_or_achievement?: string | null
          scholarship_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_summary?: string | null
          slug?: string
          story_title?: string
          testimonial_quote?: string | null
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "success_stories_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_contacts: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          phone: string | null
          team_member_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          phone?: string | null
          team_member_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          phone?: string | null
          team_member_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_member_contacts_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: true
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          biography: string | null
          biography_format: string
          created_at: string
          created_by: string | null
          designation: string
          display_order: number
          full_name: string
          id: string
          is_active: boolean
          is_featured: boolean
          linkedin_url: string | null
          photo_path: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          biography?: string | null
          biography_format?: string
          created_at?: string
          created_by?: string | null
          designation: string
          display_order?: number
          full_name: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          linkedin_url?: string | null
          photo_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          biography?: string | null
          biography_format?: string
          created_at?: string
          created_by?: string | null
          designation?: string
          display_order?: number
          full_name?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          linkedin_url?: string | null
          photo_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      testimonial_source_types: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          is_active: boolean
          type_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          is_active?: boolean
          type_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          is_active?: boolean
          type_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      testimonial_sources: {
        Row: {
          created_at: string
          created_by: string | null
          internal_notes: string | null
          source_reference: string | null
          testimonial_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          internal_notes?: string | null
          source_reference?: string | null
          testimonial_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          internal_notes?: string | null
          source_reference?: string | null
          testimonial_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_sources_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: true
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          approved_for_publication: boolean
          author_name: string
          author_role: string | null
          consent_confirmed: boolean
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_active: boolean
          is_featured: boolean
          organisation: string | null
          photo_path: string | null
          programme_id: string | null
          published_at: string | null
          quote: string
          source_type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approved_for_publication?: boolean
          author_name: string
          author_role?: string | null
          consent_confirmed?: boolean
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          organisation?: string | null
          photo_path?: string | null
          programme_id?: string | null
          published_at?: string | null
          quote: string
          source_type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approved_for_publication?: boolean
          author_name?: string
          author_role?: string | null
          consent_confirmed?: boolean
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          organisation?: string | null
          photo_path?: string | null
          programme_id?: string | null
          published_at?: string | null
          quote?: string
          source_type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_source_type_fkey"
            columns: ["source_type"]
            isOneToOne: false
            referencedRelation: "testimonial_source_types"
            referencedColumns: ["type_key"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cms_has_no_executable_markup: {
        Args: { value: string }
        Returns: boolean
      }
      cms_is_safe_link: {
        Args: { allow_contact_schemes?: boolean; value: string }
        Returns: boolean
      }
      cms_media_path_is_valid: {
        Args: { requested_media_kind?: string; value: string }
        Returns: boolean
      }
      content_image_is_published: {
        Args: { requested_path: string }
        Returns: boolean
      }
      content_is_admin: { Args: never; Returns: boolean }
      content_slugify: { Args: { value: string }; Returns: string }
      create_form_upload_intent: {
        Args: {
          p_field_id: string
          p_file_name: string
          p_form_id: string
          p_mime_type: string
          p_size_bytes: number
        }
        Returns: {
          object_path: string
          upload_token: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      match_content: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          similarity: number
          source_id: string
          source_type: string
        }[]
      }
      programme_lifecycle_status: {
        Args: {
          evaluated_at?: string
          is_published: boolean
          manual_state: string
          programme_ends_at: string
          programme_starts_at: string
        }
        Returns: string
      }
      programme_registration_status: {
        Args: {
          evaluated_at?: string
          is_published: boolean
          is_registration_enabled: boolean
          manual_state: string
          programme_ends_at: string
          programme_starts_at: string
          registration_ends_at: string
          registration_starts_at: string
        }
        Returns: string
      }
      registration_can_upload_object: {
        Args: { requested_path: string }
        Returns: boolean
      }
      registration_form_is_available: {
        Args: { requested_form_id: string }
        Returns: boolean
      }
      registration_is_admin: { Args: never; Returns: boolean }
      registration_valid_options: { Args: { options: Json }; Returns: boolean }
      submit_form: {
        Args: { p_answers: Json; p_form_id: string; p_idempotency_key: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
