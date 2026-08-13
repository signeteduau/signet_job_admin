import { Building2, Users, Briefcase, ClipboardList } from "lucide-react";
import StatCard from "../components/StatCard";
import ActivityChart from "../components/ActivityChart";
import RecentApplications from "../components/RecentApplications";
import TopCompanies from "../components/dashboard/TopCompanies";
import MostAppliedJobs from "../components/dashboard/MostAppliedJobs";
import RecentUsers from "../components/dashboard/RecentUsers";
import JobTypeChart from "../components/dashboard/JobTypeChart";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import PageHeader from "../components/ui/PageHeader";
import { fetchAllJobs, fetchUniqueApplications, fetchUsersByType, toDate } from "../lib/firestore";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    companiesPrev: 0,
    candidates: 0,
    candidatesPrev: 0,
    jobs: 0,
    jobsPrev: 0,
    applications: 0,
    applicationsPrev: 0,
    trends: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      function withinLastWeek(v) {
        const d = toDate(v);
        return d && d >= weekAgo && d <= today;
      }

      const companies = await fetchUsersByType("company");
      const candidates = await fetchUsersByType("candidate");
      const jobs = await fetchAllJobs();
      const applications = await fetchUniqueApplications();

      const companiesThisWeek = companies.filter((u) => withinLastWeek(u.createdAt)).length;
      const candidatesThisWeek = candidates.filter((u) => withinLastWeek(u.createdAt)).length;
      const jobsThisWeek = jobs.filter((j) => withinLastWeek(j.createdAt)).length;
      const applicationsLastWeek = applications.filter((a) => withinLastWeek(a.appliedAt)).length;

      const makeTrend = (count, prev) => {
        const diff = count - prev;
        return Array.from({ length: 7 }, (_, i) => ({
          value: Math.max(0, prev + Math.floor((diff * (i + 1)) / 7)),
        }));
      };

      setStats({
        companies: companies.length,
        companiesPrev: companiesThisWeek,
        candidates: candidates.length,
        candidatesPrev: candidatesThisWeek,
        jobs: jobs.length,
        jobsPrev: jobsThisWeek,
        applications: applications.length,
        applicationsPrev: applicationsLastWeek,
        trends: {
          companies: makeTrend(companies.length, companiesThisWeek),
          candidates: makeTrend(candidates.length, candidatesThisWeek),
          jobs: makeTrend(jobs.length, jobsThisWeek),
          applications: makeTrend(applications.length, applicationsLastWeek),
        },
      });
      setLoading(false);
    }

    loadData();
  }, []);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="signet-dashboard max-w-[1400px]">
      <section className="signet-dashboard-section">
        <PageHeader
          eyebrow="Overview"
          title="Welcome back"
          description={`Signet Employment Hub analytics · ${todayLabel}`}
        />
      </section>

      <section className="signet-dashboard-section">
        <div className="signet-dashboard-grid signet-dashboard-grid--stats">
          {loading ? (
            [1, 2, 3, 4].map((i) => <div key={i} className="signet-chart-skeleton h-[168px]" />)
          ) : (
            <>
              <StatCard label="Companies" value={stats.companies} previous={stats.companiesPrev} trend={stats.trends.companies} color="#004CF0" icon={Building2} />
              <StatCard label="Candidates" value={stats.candidates} previous={stats.candidatesPrev} trend={stats.trends.candidates} color="#00B4D8" icon={Users} />
              <StatCard label="Jobs" value={stats.jobs} previous={stats.jobsPrev} trend={stats.trends.jobs} color="#2F6BFF" icon={Briefcase} />
              <StatCard label="Applications" value={stats.applications} previous={stats.applicationsPrev} trend={stats.trends.applications} color="#10B981" icon={ClipboardList} />
            </>
          )}
        </div>
      </section>

      <section className="signet-dashboard-section">
        <div className="signet-dashboard-grid signet-dashboard-grid--charts">
          <div className="signet-dashboard-panel min-w-0">
            <ActivityChart />
          </div>
          <div className="signet-dashboard-panel min-w-0">
            <JobTypeChart />
          </div>
        </div>
      </section>

      <section className="signet-dashboard-section">
        <RecentApplications />
      </section>

      <section className="signet-dashboard-section">
        <div className="signet-dashboard-grid signet-dashboard-grid--widgets">
          <div className="signet-dashboard-panel min-w-0">
            <TopCompanies />
          </div>
          <div className="signet-dashboard-panel min-w-0">
            <MostAppliedJobs />
          </div>
          <div className="signet-dashboard-panel min-w-0">
            <RecentUsers />
          </div>
        </div>
      </section>

      <section className="signet-dashboard-section">
        <ActivityFeed />
      </section>
    </div>
  );
}
