import { Compass } from "lucide-react";
import Link from "next/link";
export const DiscoverButton = () => {
  return (
    <Link className="px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" href="/discover">
      <Compass className="" />
      <span className="sr-only">Discover Servers</span>
    </Link>
  );
}