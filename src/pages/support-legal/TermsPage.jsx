import LegalDocumentView from "../../components/support-legal/LegalDocumentView";
import { termsAndConditions } from "../../content/legal/termsAndConditions";

export default function TermsPage() {
  return <LegalDocumentView document={termsAndConditions} />;
}
