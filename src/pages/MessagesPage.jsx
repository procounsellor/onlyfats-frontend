import { MessageCircle } from "lucide-react";
import PlaceholderPage from "../components/common/PlaceholderPage";

export default function MessagesPage() {
  return (
    <PlaceholderPage
      title="Direct messages"
      description="Connect this page to your chat threads, inbox list and paid message unlock flow."
      icon={MessageCircle}
    />
  );
}