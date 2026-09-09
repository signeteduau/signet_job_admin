import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import PageHeader from "../components/ui/PageHeader";
import JobForm from "../components/jobs/JobForm";
import {
  JOB_LOCATIONS,
  JOB_TYPES,
  EMPTY_JOB_FORM,
  buildJobPayload,
} from "../components/jobs/job-ui";
import { createAdminJob } from "../lib/jobs";

export default function AddJob() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_JOB_FORM });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Job title is required");
    if (!form.description.trim()) return toast.error("Job description is required");

    try {
      setSaving(true);
      await createAdminJob(buildJobPayload(form));
      toast.success("Training role published");
      navigate("/admin/jobs");
    } catch (err) {
      console.error(err);
      toast.error("Could not publish job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="signet-job-flow max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Jobs"
        title="Post training role"
        description="Publish a Signet-hosted workplace training opportunity — visible to all candidates without a company name."
        action={
          <button type="button" className="signet-btn-secondary" onClick={() => navigate("/admin/jobs")}>
            Back to jobs
          </button>
        }
      />

      <JobForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        saving={saving}
        onCancel={() => navigate("/admin/jobs")}
        submitLabel="Publish role"
        savingLabel="Publishing…"
        locations={JOB_LOCATIONS}
        jobTypes={JOB_TYPES}
      />
    </div>
  );
}
