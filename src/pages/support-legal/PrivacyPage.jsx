import LegalDocumentView from "../../components/support-legal/LegalDocumentView";
import { privacyPolicy } from "../../content/legal/privacyPolicy";

export default function PrivacyPage() {
  return <LegalDocumentView document={privacyPolicy} />;
}
