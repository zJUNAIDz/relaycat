import { Compass } from "lucide-react";
import Link from "next/link";
export const DiscoverButton = () => {
  return (
    <Link className="px-2 py-2 bg-brand text-brand-foreground rounded hover:bg-brand/90" href="/discover">
      <Compass className="" />
      <span className="sr-only">Discover Servers</span>
    </Link>
  );
}