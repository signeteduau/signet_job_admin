import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import PageHeader from "../components/ui/PageHeader";
import JobForm from "../components/jobs/JobForm";
import {
  JOB_TYPES,
  EMPTY_JOB_FORM,
  buildJobPayload,
} from "../components/jobs/job-ui";
import { jobLocationFromRecord } from "../components/jobs/location-data";
import { fetchAdminJob, updateAdminJob, isAdminJob } from "../lib/jobs";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_JOB_FORM });

  useEffect(() => {
    async function load() {
      try {
        const job = await fetchAdminJob(id);
        if (!job) {
          toast.error("Job not found");
          navigate("/admin/jobs");
          return;
        }
        if (!isAdminJob(job)) {
          toast.error("Only Signet training roles can be edited here");
          navigate(`/admin/jobs/${id}`);
          return;
        }

        setForm({
          title: job.title || "",
          occupation: job.occupation || "",
          anzsco: job.anzsco || "",
          industry: job.industry || "",
          trainingArea: job.trainingArea || "",
          jobLocations: [jobLocationFromRecord(job)],
          type: job.type || "Traineeship",
          salary: job.salary || "Training placement",
          experience: job.experience || "Entry level",
          skillsText: (job.skills || []).join(", "),
          description: job.description || "",
          roles: job.rolesAndResponsibilities || "",
          status: job.status || "Active",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load job");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Job title is required");
    if (!form.description.trim()) return toast.error("Job description is required");

    try {
      setSaving(true);
      await updateAdminJob(id, buildJobPayload(form));
      toast.success("Job updated");
      navigate(`/admin/jobs/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not update job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="signet-job-flow max-w-4xl space-y-6">
        <div className="signet-chart-skeleton h-12 w-64" />
        <div className="signet-chart-skeleton h-[520px]" />
      </div>
    );
  }

  return (
    <div className="signet-job-flow max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Jobs"
        title="Edit training role"
        description={form.title || "Update listing details and content"}
        action={
          <button
            type="button"
            className="signet-btn-secondary"
            onClick={() => navigate(`/admin/jobs/${id}`)}
          >
            View job
          </button>
        }
      />

      <JobForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        saving={saving}
        onCancel={() => navigate("/admin/jobs")}
        submitLabel="Save changes"
        savingLabel="Saving…"
        isEdit
        jobTypes={JOB_TYPES}
      />
    </div>
  );
}
