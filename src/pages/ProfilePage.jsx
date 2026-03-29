import { User } from "lucide-react";
import PlaceholderPage from "../components/common/PlaceholderPage";

export default function ProfilePage() {
  return (
    <PlaceholderPage
      title="Profile"
      description="Render creator or fan profile info, subscription history and account metadata here."
      icon={User}
    />
  );
}