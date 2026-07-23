import ProgrammeForm from "@/components/admin/ProgrammeForm";

export default function NewProgrammePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Programme</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create the Programme as a draft or publish it when it is ready.
        </p>
      </div>
      <ProgrammeForm />
    </div>
  );
}
