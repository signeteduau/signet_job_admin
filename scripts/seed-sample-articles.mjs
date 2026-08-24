import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvm70luWkiPWe46eErtkLZsQzf0sgQgpI",
  authDomain: "job-portal-app-72db3.firebaseapp.com",
  projectId: "job-portal-app-72db3",
  storageBucket: "job-portal-app-72db3.firebasestorage.app",
  messagingSenderId: "1028801677157",
  appId: "1:1028801677157:web:a9870032fc4791c3b0438c",
};

const AUTHOR = "Signet Editorial";

const ARTICLES = [
  {
    title: "How to Stand Out in a Competitive Job Market",
    slug: "how-to-stand-out-competitive-job-market",
    subtitle: "Practical moves that help you get noticed when hundreds apply for the same role.",
    categoryName: "Job Search",
    tags: ["job search", "career growth", "applications"],
    featured: true,
    image:
      "https://images.unsplash.com/photo-1521737711864-e3b97311f892?auto=format&fit=crop&w=1200&h=675&q=80",
    publishedDate: "2026-02-10",
    content: `
<p>The job market in 2026 rewards candidates who are clear, specific, and easy to hire. Recruiters are not looking for perfect people—they are looking for people who solve a problem quickly.</p>
<h2>Lead with outcomes, not duties</h2>
<p>Replace vague lines like “managed projects” with measurable results: “Delivered 12 client launches on time, improving retention by 18%.” Outcomes signal impact immediately.</p>
<h2>Tailor every application</h2>
<p>A generic CV rarely survives the first screen. Match your top three achievements to the job description keywords. On Signet, use your profile summary as a living pitch you refine per role.</p>
<ul>
<li>Mirror the language in the job post (without keyword stuffing).</li>
<li>Highlight tools and skills mentioned in the listing.</li>
<li>Keep your cover note to three short paragraphs.</li>
</ul>
<blockquote>Standing out is not about being louder—it is about being relevant.</blockquote>
<h2>Follow up with value</h2>
<p>After applying, send a concise follow-up within five business days. Share one insight about the company or role that shows you did real research—not just that you want a job.</p>
<p>Small, consistent improvements beat one perfect application. Build momentum, track responses, and refine weekly.</p>
    `.trim(),
  },
  {
    title: "Salary Negotiation: Get Paid What You Are Worth",
    slug: "salary-negotiation-get-paid-what-you-are-worth",
    subtitle: "A calm framework for discussing compensation without awkwardness or lost offers.",
    categoryName: "Career Tips",
    tags: ["salary", "negotiation", "compensation"],
    featured: true,
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&h=675&q=80",
    publishedDate: "2026-02-08",
    content: `
<p>Most candidates leave money on the table because they negotiate too late—or not at all. Salary conversations work best when you treat them as collaboration, not confrontation.</p>
<h2>Research before the interview</h2>
<p>Know the market range for your role, location, and experience level. Use public salary bands, industry reports, and peer conversations to set a realistic target and a walk-away number.</p>
<h2>Delay the number when you can</h2>
<p>If asked about expectations early, redirect: “I am flexible depending on the full package—could you share the range for this role?” This keeps leverage until you understand scope and level.</p>
<h2>Negotiate the full package</h2>
<ul>
<li>Base salary</li>
<li>Sign-on bonus or relocation support</li>
<li>Remote or flexible work arrangements</li>
<li>Learning budget and review timeline</li>
</ul>
<p>When you receive an offer, respond within 24–48 hours with gratitude and one or two specific asks backed by data. Avoid ultimatums unless you are prepared to walk away.</p>
<blockquote>The best negotiators are curious, prepared, and respectful.</blockquote>
<p>A professional counter-offer rarely costs you the job. It often earns you respect.</p>
    `.trim(),
  },
  {
    title: "Top Tech Skills Employers Want in 2026",
    slug: "top-tech-skills-employers-want-2026",
    subtitle: "Where demand is growing—and how to build credibility even if you are switching careers.",
    categoryName: "Industry Insights",
    tags: ["technology", "skills", "upskilling"],
    featured: true,
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&h=675&q=80",
    publishedDate: "2026-02-05",
    content: `
<p>Technology hiring is no longer about knowing one stack forever. Employers want adaptable builders who can learn fast, communicate clearly, and ship reliably.</p>
<h2>High-demand skill areas</h2>
<ul>
<li><strong>Cloud &amp; DevOps:</strong> AWS, Azure, or GCP basics plus CI/CD pipelines.</li>
<li><strong>Data literacy:</strong> SQL, dashboards, and the ability to turn data into decisions.</li>
<li><strong>AI fluency:</strong> Prompt engineering, workflow automation, and ethical use of AI tools.</li>
<li><strong>Security awareness:</strong> Even non-security roles benefit from understanding common risks.</li>
</ul>
<h2>Prove skills with evidence</h2>
<p>Certificates help, but projects win interviews. Publish a small portfolio: a GitHub repo, a case study, or a live demo that shows problem → approach → outcome.</p>
<h2>Learn in public, briefly</h2>
<p>Share one weekly learning note—what you built, what broke, what you fixed. Consistency signals growth better than a long list of unfinished courses.</p>
<blockquote>Employers hire for trajectory, not just today's tool list.</blockquote>
<p>Pick one skill lane, go deep for 90 days, and document results. Depth beats scattered beginner badges every time.</p>
    `.trim(),
  },
  {
    title: "Master Behavioral Interviews With the STAR Method",
    slug: "master-behavioral-interviews-star-method",
    subtitle: "Turn vague interview answers into stories recruiters remember.",
    categoryName: "Interview Advice",
    tags: ["interview", "STAR method", "behavioral"],
    featured: false,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&h=675&q=80",
    publishedDate: "2026-02-03",
    content: `
<p>Behavioral questions—"Tell me about a time when…"—are really tests of clarity under pressure. The STAR method gives you a simple structure that keeps answers focused.</p>
<h2>What STAR stands for</h2>
<ul>
<li><strong>Situation:</strong> Set the scene in one or two sentences.</li>
<li><strong>Task:</strong> Explain your responsibility.</li>
<li><strong>Action:</strong> Describe what <em>you</em> did (use "I", not "we").</li>
<li><strong>Result:</strong> Share a measurable or observable outcome.</li>
</ul>
<h2>Prepare six core stories</h2>
<p>You do not need fifty examples. Prepare stories for conflict, failure, leadership, tight deadlines, learning something new, and going above expectations. Map each to common question prompts.</p>
<h2>Keep answers under two minutes</h2>
<p>Interviewers lose focus on long monologues. Practice out loud with a timer. Trim setup; expand on actions and results.</p>
<blockquote>Great interview answers feel like mini case studies—not memoirs.</blockquote>
<p>End with a brief lesson: what you would do again, or what you changed after that experience. That shows maturity hiring managers trust.</p>
    `.trim(),
  },
  {
    title: "Write a Resume That Beats ATS Filters",
    slug: "write-resume-beats-ats-filters",
    subtitle: "Format and wording tips so your CV reaches a human recruiter.",
    categoryName: "Resume & CV",
    tags: ["resume", "ATS", "CV tips"],
    featured: false,
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&h=675&q=80",
    publishedDate: "2026-01-28",
    content: `
<p>Applicant Tracking Systems scan resumes before recruiters do. If your file is unreadable or missing keywords, your experience may never get seen—no matter how strong it is.</p>
<h2>Format for machines and humans</h2>
<ul>
<li>Use a clean, single-column layout.</li>
<li>Stick to standard headings: Experience, Education, Skills.</li>
<li>Save as PDF unless the employer requests Word.</li>
<li>Avoid text boxes, tables, and icons that parsers skip.</li>
</ul>
<h2>Write scannable bullets</h2>
<p>Start with strong verbs, include scope (team size, budget, users), and end with impact. One line per achievement is ideal.</p>
<p>Example: <em>Reduced support tickets by 34% by redesigning onboarding docs and adding in-app tooltips.</em></p>
<h2>Match keywords naturally</h2>
<p>Pull phrases from the job description into your skills and experience sections where they honestly apply. Do not hide white text or repeat keywords dozens of times—modern systems penalize that.</p>
<blockquote>Your resume's job is to earn the interview, not tell your whole life story.</blockquote>
<p>Update your Signet profile to mirror your best resume version so employers see a consistent story everywhere.</p>
    `.trim(),
  },
  {
    title: "Remote Work Habits That Lead to Promotion",
    slug: "remote-work-habits-lead-to-promotion",
    subtitle: "Visibility, communication, and delivery when your team is distributed.",
    categoryName: "Workplace Skills",
    tags: ["remote work", "productivity", "career growth"],
    featured: false,
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&h=675&q=80",
    publishedDate: "2026-01-22",
    content: `
<p>Remote work removes hallway visibility—but promotion still follows the same rule: people advance when they make their manager's life easier and their team's outcomes better.</p>
<h2>Be reliably responsive, not always online</h2>
<p>Set core hours when you are reachable. Respond to urgent messages quickly; batch deep work in focused blocks. Predictability builds trust more than constant presence.</p>
<h2>Document your wins</h2>
<p>Keep a weekly log: shipped work, problems solved, stakeholders helped. Use it in 1:1s and performance reviews. Remote employees who track impact get promoted more often than those who assume others notice.</p>
<h2>Communicate in writing</h2>
<ul>
<li>Share brief status updates before meetings.</li>
<li>Write clear decision summaries after calls.</li>
<li>Ask clarifying questions early—not the day before a deadline.</li>
</ul>
<h2>Invest in relationships intentionally</h2>
<p>Schedule short coffee chats with peers and cross-functional partners. Remote careers stall when your network is only your immediate team.</p>
<blockquote>Promotion is a trust transfer. Remote workers earn it through clarity and consistency.</blockquote>
<p>Build systems—calendar blocks, templates, checklists—that make excellent work repeatable. That is how remote contributors become obvious promotion candidates.</p>
    `.trim(),
  },
];

const email = process.env.ADMIN_EMAIL || "admin@signet.com";
const password = process.env.ADMIN_PASSWORD || "Admin@Signet";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function loadCategories() {
  const snap = await getDocs(collection(db, "blogCategories"));
  const map = new Map();
  snap.docs.forEach((d) => {
    const name = (d.data().name || "").trim();
    if (name) map.set(name.toLowerCase(), { id: d.id, name });
  });
  return map;
}

async function articleExists(slug) {
  const q = query(collection(db, "articles"), where("slug", "==", slug));
  const snap = await getDocs(q);
  return !snap.empty;
}

async function main() {
  console.log("Signing in as admin…");
  await signInWithEmailAndPassword(auth, email, password);

  const categories = await loadCategories();
  let added = 0;

  for (const article of ARTICLES) {
    if (await articleExists(article.slug)) {
      console.log(`Skip (exists): ${article.title}`);
      continue;
    }

    const cat = categories.get(article.categoryName.toLowerCase());
    if (!cat) {
      console.warn(`Category missing for "${article.title}": ${article.categoryName}`);
    }

    await addDoc(collection(db, "articles"), {
      title: article.title,
      slug: article.slug,
      subtitle: article.subtitle,
      image: article.image,
      author: AUTHOR,
      tags: article.tags,
      featured: article.featured,
      content: article.content,
      categoryId: cat?.id || "",
      categoryName: cat?.name || article.categoryName,
      publishedDate: article.publishedDate,
      createdAt: serverTimestamp(),
    });

    console.log(`Added: ${article.title}`);
    added += 1;
  }

  console.log(`\nDone. ${added} new article${added === 1 ? "" : "s"} added.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err.message || err);
  process.exit(1);
});
