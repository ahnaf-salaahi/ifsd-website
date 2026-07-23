export type RegistrationFieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "dropdown"
  | "radio"
  | "checkboxes"
  | "file";

export type RegistrationFieldDefinition = {
  id: string;
  field_type: RegistrationFieldType;
  label: string;
  field_key: string;
  description: string | null;
  display_order: number;
  is_required: boolean;
  selection_options: string[] | null;
};

export type RegistrationFormDefinition = {
  id: string;
  name: string;
  description: string | null;
  fields: RegistrationFieldDefinition[];
};

export type RegistrationAnswerPayload = {
  field_id: string;
  value_text?: string;
  value_json?: string[];
  upload_token?: string;
};

