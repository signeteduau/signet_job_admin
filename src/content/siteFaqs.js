export const SITE_FAQ_URL = "https://signetemploymenthub.com/faq";
export const SITE_PRIVACY_URL = "https://signetemploymenthub.com/privacy";
export const SITE_TERMS_URL = "https://signetemploymenthub.com/terms";

export const SITE_FAQ_GROUPS = [
  {
    id: "candidates",
    title: "For candidates",
    type: "candidate",
    items: [
      {
        q: "How do I create a candidate account?",
        a: "Register as a candidate, verify your email, then complete your profile. You can start browsing jobs right away.",
      },
      {
        q: "How do I find jobs in my trade?",
        a: "Search from the home page or open Jobs. You can also choose a field such as Automotive, Business, Building & Construction, Community Service, Fabrication and Manufacturing, GE, or Health.",
      },
      {
        q: "What do I need before I can apply?",
        a: "Add a phone number, address, and resume to your profile. Signet will show anything still missing before you send an application.",
      },
      {
        q: "How do I apply for a job?",
        a: "Open a listing and tap Apply. Your profile and resume go to the employer so they can review your experience in one place.",
      },
      {
        q: "Can I save jobs and message employers?",
        a: "Yes. Sign in to save roles from the job list. After you apply, you can keep the conversation going in Messages if the employer writes back.",
      },
    ],
  },
  {
    id: "employers",
    title: "For employers",
    type: "company",
    items: [
      {
        q: "How do I post a job?",
        a: "Register as a company, then open Post a job. Add the role, location, and what success looks like so candidates know if they are a fit.",
      },
      {
        q: "How do I review applications?",
        a: "Open Applications from your company dashboard to browse candidate profiles, resumes, and experience for each listing.",
      },
      {
        q: "How do messaging and interviews work?",
        a: "From an application you can start a chat, ask follow-up questions, and arrange an interview inside Signet.",
      },
      {
        q: "Can I hire more than one person from Signet?",
        a: "Yes. Keep your listings active, review new applications as they come in, and hire when you find the right person.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & support",
    type: "general",
    items: [
      {
        q: "How do I update my profile or social links?",
        a: "Open Settings from your dashboard. You can edit account details, add LinkedIn or other social links, and manage deletion from there.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Delete, or use the Delete account page. Account information under our control is removed when you confirm.",
      },
      {
        q: "How do I get help or report an issue?",
        a: "Open Support for general help, or Report an issue to send details by email. Include your account email and a short description of what went wrong.",
      },
    ],
  },
];

export const SITE_FAQ_QUESTIONS = new Set(
  SITE_FAQ_GROUPS.flatMap((group) => group.items.map((item) => item.q.trim().toLowerCase()))
);
