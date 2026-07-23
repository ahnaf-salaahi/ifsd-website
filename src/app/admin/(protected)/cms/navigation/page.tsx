import { requireAdmin } from "@/lib/cms/auth";
import { buildNavigationTree } from "@/lib/cms/navigation";
import PageHeader from "@/components/admin/cms/PageHeader";
import ActionForm from "@/components/admin/cms/ActionForm";
import ActionButton from "@/components/admin/cms/ActionButton";
import { Checkbox, Field, TextInput } from "@/components/admin/cms/FormFields";
import {
  deleteNavigationAction,
  saveNavigationAction,
} from "../actions/navigation";

export const dynamic = "force-dynamic";

export default async function CmsNavigationPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_navigation_items")
    .select("*")
    .order("display_order")
    .order("id");
  if (error) {
    return <div role="alert">Navigation could not be loaded.</div>;
  }
  const tree = buildNavigationTree(data);

  return (
    <div>
      <PageHeader
        title="Navigation"
        description="Manage header and footer links with a maximum three-level hierarchy."
      />
      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Hierarchy preview</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {(["header", "footer"] as const).map((location) => (
            <div key={location}>
              <h3 className="text-sm font-medium capitalize text-gray-700">
                {location}
              </h3>
              <NavigationTree
                nodes={tree.filter((item) => item.location === location)}
              />
            </div>
          ))}
        </div>
      </section>
      <div className="mt-6 space-y-5">
        {data.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <NavigationForm item={item} allItems={data} />
            <div className="mt-3">
              <ActionButton
                action={deleteNavigationAction}
                fields={{ id: item.id }}
                label="Delete item"
                destructive
                confirmMessage="Delete this navigation item? Items with children cannot be deleted."
              />
            </div>
          </article>
        ))}
        <article className="rounded-2xl border border-dashed border-gray-200 bg-white p-5">
          <h2 className="font-semibold">Add navigation item</h2>
          <div className="mt-4">
            <NavigationForm item={null} allItems={data} />
          </div>
        </article>
      </div>
    </div>
  );
}

function NavigationForm({
  item,
  allItems,
}: {
  item: {
    id: string;
    label: string;
    url: string;
    location: string;
    target: string;
    parent_id: string | null;
    display_order: number;
    is_visible: boolean;
  } | null;
  allItems: {
    id: string;
    label: string;
    location: string;
  }[];
}) {
  const key = item?.id ?? "new";
  return (
    <ActionForm
      action={saveNavigationAction}
      submitLabel={item ? "Save item" : "Add item"}
    >
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Label" name={`nav-label-${key}`}>
          <TextInput
            id={`nav-label-${key}`}
            name="label"
            defaultValue={item?.label ?? ""}
            required
          />
        </Field>
        <Field label="URL" name={`nav-url-${key}`} hint="Internal /path or HTTPS URL.">
          <TextInput
            id={`nav-url-${key}`}
            name="url"
            defaultValue={item?.url ?? ""}
            required
          />
        </Field>
        <Field label="Placement" name={`nav-location-${key}`}>
          <select
            id={`nav-location-${key}`}
            name="location"
            defaultValue={item?.location ?? "header"}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="header">Header</option>
            <option value="footer">Footer</option>
          </select>
        </Field>
        <Field label="Parent" name={`nav-parent-${key}`}>
          <select
            id={`nav-parent-${key}`}
            name="parent_id"
            defaultValue={item?.parent_id ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">No parent</option>
            {allItems
              .filter((candidate) => candidate.id !== item?.id)
              .map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label} ({candidate.location})
                </option>
              ))}
          </select>
        </Field>
        <Field label="Link target" name={`nav-target-${key}`}>
          <select
            id={`nav-target-${key}`}
            name="target"
            defaultValue={item?.target ?? "self"}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="self">Same tab</option>
            <option value="blank">New tab</option>
          </select>
        </Field>
        <Field label="Display order" name={`nav-order-${key}`}>
          <TextInput
            id={`nav-order-${key}`}
            type="number"
            min={0}
            name="display_order"
            defaultValue={item?.display_order ?? 0}
          />
        </Field>
      </div>
      <div className="mt-4">
        <Checkbox
          name="is_visible"
          label="Visible"
          defaultChecked={item?.is_visible ?? true}
        />
      </div>
    </ActionForm>
  );
}

function NavigationTree({
  nodes,
}: {
  nodes: ReturnType<typeof buildNavigationTree>;
}) {
  if (nodes.length === 0) {
    return <p className="mt-2 text-sm text-gray-400">No visible structure.</p>;
  }
  return (
    <ul className="mt-2 space-y-2 border-l border-gray-200 pl-4 text-sm">
      {nodes.map((node) => (
        <li key={node.id}>
          <span className={node.is_visible ? "text-gray-800" : "text-gray-400"}>
            {node.label}
          </span>
          {node.children.length > 0 && <NavigationTree nodes={node.children} />}
        </li>
      ))}
    </ul>
  );
}
