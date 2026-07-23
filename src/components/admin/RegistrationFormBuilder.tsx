"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type RegistrationOwnerType = "event" | "scholarship";

export type RegistrationFormBuilderHandle = {
  getEnabled: () => boolean;
  save: (ownerId: string) => Promise<void>;
};

type FieldType =
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

type BuilderField = {
  id: string;
  persisted: boolean;
  field_type: FieldType;
  label: string;
  field_key: string;
  description: string;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  is_essential: boolean;
  selection_options: string[] | null;
};

type EssentialField = Omit<
  BuilderField,
  "id" | "persisted" | "display_order" | "is_required" | "is_active"
>;

const DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const ESSENTIAL_FIELDS: EssentialField[] = [
  {
    field_type: "short_text",
    label: "Full Name",
    field_key: "full_name",
    description: "",
    is_essential: true,
    selection_options: null,
  },
  {
    field_type: "email",
    label: "Email Address",
    field_key: "email",
    description: "",
    is_essential: true,
    selection_options: null,
  },
  {
    field_type: "phone",
    label: "Phone Number",
    field_key: "phone",
    description: "",
    is_essential: true,
    selection_options: null,
  },
  {
    field_type: "date",
    label: "Date of Birth",
    field_key: "date_of_birth",
    description: "",
    is_essential: true,
    selection_options: null,
  },
  {
    field_type: "radio",
    label: "Gender",
    field_key: "gender",
    description: "",
    is_essential: true,
    selection_options: ["Female", "Male", "Other", "Prefer not to say"],
  },
  {
    field_type: "long_text",
    label: "Address",
    field_key: "address",
    description: "",
    is_essential: true,
    selection_options: null,
  },
  {
    field_type: "dropdown",
    label: "District",
    field_key: "district",
    description: "",
    is_essential: true,
    selection_options: DISTRICTS,
  },
  {
    field_type: "short_text",
    label: "NIC / Passport Number",
    field_key: "nic_passport_number",
    description: "",
    is_essential: true,
    selection_options: null,
  },
  {
    field_type: "short_text",
    label: "Institution",
    field_key: "institution",
    description: "",
    is_essential: true,
    selection_options: null,
  },
  {
    field_type: "dropdown",
    label: "Education Level",
    field_key: "education_level",
    description: "",
    is_essential: true,
    selection_options: [
      "School",
      "Certificate",
      "Diploma",
      "Undergraduate",
      "Postgraduate",
      "Other",
    ],
  },
  {
    field_type: "dropdown",
    label: "Employment Status",
    field_key: "employment_status",
    description: "",
    is_essential: true,
    selection_options: [
      "Student",
      "Employed",
      "Self-employed",
      "Unemployed",
      "Other",
    ],
  },
  {
    field_type: "file",
    label: "Document Upload",
    field_key: "document_upload",
    description: "Upload a PDF, JPG, or PNG file.",
    is_essential: true,
    selection_options: null,
  },
  {
    field_type: "checkboxes",
    label: "Consent",
    field_key: "consent",
    description: "",
    is_essential: true,
    selection_options: [
      "I confirm that the information provided is accurate and consent to its use for this application.",
    ],
  },
];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "dropdown", label: "Dropdown" },
  { value: "radio", label: "Radio buttons" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "file", label: "File upload" },
];

const SELECTION_TYPES: FieldType[] = ["dropdown", "radio", "checkboxes"];

const RegistrationFormBuilder = forwardRef<
  RegistrationFormBuilderHandle,
  {
    ownerType: RegistrationOwnerType;
    ownerId?: string;
    initialEnabled?: boolean;
    onEnabledChange?: (enabled: boolean) => void;
  }
>(function RegistrationFormBuilder(
  {
    ownerType,
    ownerId,
    initialEnabled = false,
    onEnabledChange,
  },
  ref
) {
  const [formId, setFormId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(Boolean(ownerId));
  const [loadError, setLoadError] = useState("");
  const nextCustomId = useRef(0);

  useEffect(() => {
    if (!ownerId) return;
    const loadedOwnerId = ownerId;

    let cancelled = false;

    async function loadForm() {
      setLoading(true);
      setLoadError("");
      const supabase = createClient();
      const ownerColumn =
        ownerType === "event" ? "event_id" : "scholarship_id";

      const { data: form, error: formError } = await supabase
        .from("forms")
        .select("id, is_active")
        .eq(ownerColumn, loadedOwnerId)
        .maybeSingle();

      if (cancelled) return;
      if (formError) {
        setLoadError(`Could not load registration settings: ${formError.message}`);
        setLoading(false);
        return;
      }

      if (!form) {
        setLoading(false);
        return;
      }

      const { data: savedFields, error: fieldsError } = await supabase
        .from("form_fields")
        .select(
          "id, field_type, label, field_key, description, display_order, is_required, is_active, is_essential, selection_options"
        )
        .eq("form_id", form.id)
        .order("display_order", { ascending: true });

      if (cancelled) return;
      if (fieldsError) {
        setLoadError(`Could not load registration fields: ${fieldsError.message}`);
        setLoading(false);
        return;
      }

      setFormId(form.id);
      setEnabled(form.is_active);
      onEnabledChange?.(form.is_active);
      setFields(
        (savedFields ?? []).map((field) => ({
          id: field.id,
          persisted: true,
          field_type: field.field_type as FieldType,
          label: field.label,
          field_key: field.field_key,
          description: field.description ?? "",
          display_order: field.display_order,
          is_required: field.is_required,
          is_active: field.is_active,
          is_essential: field.is_essential,
          selection_options: Array.isArray(field.selection_options)
            ? (field.selection_options as string[])
            : null,
        }))
      );
      setDirty(false);
      setLoading(false);
    }

    void loadForm();
    return () => {
      cancelled = true;
    };
  }, [onEnabledChange, ownerId, ownerType]);

  function setRegistrationEnabled(value: boolean) {
    setEnabled(value);
    setDirty(true);
    onEnabledChange?.(value);
  }

  function updateField(id: string, updates: Partial<BuilderField>) {
    setDirty(true);
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  }

  function removeField(id: string) {
    setDirty(true);
    const field = fields.find((item) => item.id === id);
    if (field?.persisted) {
      setRemovedIds((current) =>
        current.includes(id) ? current : [...current, id]
      );
    }
    setFields((current) => current.filter((item) => item.id !== id));
  }

  function toggleEssential(template: EssentialField, selected: boolean) {
    const existing = fields.find(
      (field) => field.field_key === template.field_key
    );

    if (!selected) {
      if (existing) removeField(existing.id);
      return;
    }

    if (existing) return;
    setDirty(true);
    setFields((current) => [
      ...current,
      {
        ...template,
        id: `essential-${template.field_key}`,
        persisted: false,
        display_order: current.length,
        is_required: false,
        is_active: true,
        selection_options: template.selection_options
          ? [...template.selection_options]
          : null,
      },
    ]);
  }

  function addCustomField() {
    setDirty(true);
    nextCustomId.current += 1;
    const suffix = `${Date.now()}_${nextCustomId.current}`;
    setFields((current) => [
      ...current,
      {
        id: `custom-${suffix}`,
        persisted: false,
        field_type: "short_text",
        label: "New question",
        field_key: `custom_${suffix}`,
        description: "",
        display_order: current.length,
        is_required: false,
        is_active: true,
        is_essential: false,
        selection_options: null,
      },
    ]);
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    setDirty(true);
    setFields((current) => {
      const reordered = [...current];
      [reordered[index], reordered[target]] = [
        reordered[target],
        reordered[index],
      ];
      return reordered;
    });
  }

  function validate() {
    if (enabled && !fields.some((field) => field.is_active)) {
      throw new Error(
        "Select or add at least one enabled field before opening registration."
      );
    }

    for (const field of fields) {
      if (!field.label.trim()) {
        throw new Error("Every registration field needs a label.");
      }
      if (
        SELECTION_TYPES.includes(field.field_type) &&
        (!field.selection_options ||
          field.selection_options.length === 0 ||
          field.selection_options.some((option) => !option.trim()) ||
          new Set(field.selection_options.map((option) => option.trim())).size !==
            field.selection_options.length)
      ) {
        throw new Error(
          `Add non-empty, unique choices for “${field.label}”.`
        );
      }
    }
  }

  async function save(ownerIdToSave: string) {
    if (loading) {
      throw new Error("Registration settings are still loading.");
    }
    if (loadError) {
      throw new Error(loadError);
    }
    if (!formId && fields.length === 0 && (!dirty || !enabled)) {
      return;
    }

    validate();
    const supabase = createClient();
    let savedFormId = formId;

    if (savedFormId) {
      const { error } = await supabase
        .from("forms")
        .update({ is_active: enabled, is_public: true })
        .eq("id", savedFormId);
      if (error) throw new Error(`Registration settings: ${error.message}`);
    } else {
      const { data, error } = await supabase
        .from("forms")
        .insert(
          ownerType === "event"
            ? {
                event_id: ownerIdToSave,
                name: "Registration Form",
                is_active: enabled,
                is_public: true,
              }
            : {
                scholarship_id: ownerIdToSave,
                name: "Registration Form",
                is_active: enabled,
                is_public: true,
              },
        )
        .select("id")
        .single();
      if (error) throw new Error(`Registration settings: ${error.message}`);
      savedFormId = data.id;
      setFormId(data.id);
    }

    for (const removedId of removedIds) {
      const { error } = await supabase
        .from("form_fields")
        .delete()
        .eq("id", removedId);
      if (error) {
        throw new Error(
          `Could not remove a field. Disable it instead if it already has responses. ${error.message}`
        );
      }
    }

    for (const [index, field] of fields.entries()) {
      const payload = {
        field_type: field.field_type,
        label: field.label.trim(),
        field_key: field.field_key,
        description: field.description.trim() || null,
        display_order: index,
        is_required: field.is_required,
        is_active: field.is_active,
        is_essential: field.is_essential,
        selection_options: SELECTION_TYPES.includes(field.field_type)
          ? field.selection_options?.map((option) => option.trim())
          : null,
      };

      if (field.persisted) {
        const { error } = await supabase
          .from("form_fields")
          .update(payload)
          .eq("id", field.id);
        if (error) {
          throw new Error(`Could not update “${field.label}”: ${error.message}`);
        }
      } else {
        const { data, error } = await supabase
          .from("form_fields")
          .insert({ ...payload, form_id: savedFormId })
          .select("id")
          .single();
        if (error) {
          throw new Error(`Could not add “${field.label}”: ${error.message}`);
        }
        updateField(field.id, { id: data.id, persisted: true });
      }
    }

    setRemovedIds([]);
    setDirty(false);
  }

  useImperativeHandle(
    ref,
    () => ({
      getEnabled: () => enabled,
      save,
    })
  );

  return (
    <div className="border-t border-gray-100 pt-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Registration Form
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the information applicants should provide.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Loading registration settings…</p>
      )}
      {loadError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      {!loading && !loadError && (
        <>
          <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) =>
                setRegistrationEnabled(event.target.checked)
              }
              className="mt-0.5 rounded border-gray-300"
            />
            <span>
              <span className="block text-sm font-medium text-gray-800">
                Registration enabled
              </span>
              <span className="mt-0.5 block text-xs text-gray-500">
                Applicants can submit this form only while registration is enabled.
              </span>
            </span>
          </label>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Essential fields
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {ESSENTIAL_FIELDS.map((template) => {
                const selected = fields.find(
                  (field) => field.field_key === template.field_key
                );
                return (
                  <div
                    key={template.field_key}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5"
                  >
                    <label className="flex min-w-0 items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={Boolean(selected)}
                        onChange={(event) =>
                          toggleEssential(template, event.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="truncate">{template.label}</span>
                    </label>
                    {selected && (
                      <label className="flex items-center gap-1.5 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={selected.is_required}
                          onChange={(event) =>
                            updateField(selected.id, {
                              is_required: event.target.checked,
                            })
                          }
                          className="rounded border-gray-300"
                        />
                        Required
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Form fields
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Edit, reorder, disable, or remove selected fields and custom questions.
                </p>
              </div>
              <button
                type="button"
                onClick={addCustomField}
                className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus size={14} /> Add question
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {fields.length === 0 && (
                <p className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                  No fields selected yet.
                </p>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-gray-200 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {field.is_essential ? "Essential" : "Custom"}
                      </span>
                      {!field.is_active && (
                        <span className="text-xs font-medium text-amber-700">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveField(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${field.label} up`}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(index, 1)}
                        disabled={index === fields.length - 1}
                        aria-label={`Move ${field.label} down`}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        aria-label={`Remove ${field.label}`}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Label
                      </label>
                      <input
                        value={field.label}
                        onChange={(event) =>
                          updateField(field.id, { label: event.target.value })
                        }
                        maxLength={300}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Field type
                      </label>
                      <select
                        value={field.field_type}
                        disabled={field.is_essential}
                        onChange={(event) => {
                          const fieldType = event.target.value as FieldType;
                          updateField(field.id, {
                            field_type: fieldType,
                            selection_options: SELECTION_TYPES.includes(fieldType)
                              ? field.selection_options ?? ["Option 1"]
                              : null,
                          });
                        }}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        {FIELD_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Description or help text
                    </label>
                    <input
                      value={field.description}
                      onChange={(event) =>
                        updateField(field.id, {
                          description: event.target.value,
                        })
                      }
                      maxLength={2000}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {SELECTION_TYPES.includes(field.field_type) && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Choices
                      </label>
                      <div className="mt-2 space-y-2">
                        {(field.selection_options ?? []).map(
                          (option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center gap-2"
                            >
                              <input
                                value={option}
                                onChange={(event) => {
                                  const options = [
                                    ...(field.selection_options ?? []),
                                  ];
                                  options[optionIndex] = event.target.value;
                                  updateField(field.id, {
                                    selection_options: options,
                                  });
                                }}
                                maxLength={300}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateField(field.id, {
                                    selection_options: (
                                      field.selection_options ?? []
                                    ).filter(
                                      (_, indexToKeep) =>
                                        indexToKeep !== optionIndex
                                    ),
                                  })
                                }
                                aria-label={`Remove choice ${optionIndex + 1}`}
                                className="rounded p-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              selection_options: [
                                ...(field.selection_options ?? []),
                                "",
                              ],
                            })
                          }
                          className="flex items-center gap-1.5 text-xs font-medium text-rose-700 hover:underline"
                        >
                          <Plus size={13} /> Add choice
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-5">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={field.is_required}
                        onChange={(event) =>
                          updateField(field.id, {
                            is_required: event.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={field.is_active}
                        onChange={(event) =>
                          updateField(field.id, {
                            is_active: event.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      Enabled
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

RegistrationFormBuilder.displayName = "RegistrationFormBuilder";

export default RegistrationFormBuilder;
