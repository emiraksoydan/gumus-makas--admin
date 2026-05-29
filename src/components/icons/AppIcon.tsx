import { getAppIcon, type AppIconName } from "./app-icons";

export default function AppIcon({
  name,
  className = "size-5",
}: {
  name: AppIconName;
  className?: string;
}) {
  const Icon = getAppIcon(name);
  return <Icon className={className} aria-hidden />;
}
