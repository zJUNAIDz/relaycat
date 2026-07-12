import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";

const ChannelNotFound = () => {
	return (
		<div className="relative isolate min-h-screen overflow-hidden bg-muted dark:bg-card">
			<div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.22)_1px,transparent_1px)] bg-size-[48px_48px] opacity-60(rgba(71,85,105,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(71,85,105,0.22)_1px,transparent_1px)]" />

			<div className="flex min-h-screen items-center justify-center px-6 py-16">
				<Card className="w-full max-w-xl border-border/70 bg-background/95 shadow-sm backdrop-blur">
					<CardHeader className="space-y-4 pb-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
							<svg
								className="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.75"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
								<path d="M12 7v5" />
								<path d="M12 16h.01" />
							</svg>
						</div>
						<div className="space-y-2">
							<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
								404
							</p>
							<CardTitle className="text-2xl font-semibold tracking-tight">
								Channel not found
							</CardTitle>
							<CardDescription className="text-sm leading-6 sm:text-base">
								This channel may have been deleted, renamed, or you may not have access to it anymore.
							</CardDescription>
						</div>
					</CardHeader>

					<CardContent className="space-y-6 pt-4">
						<p className="text-sm leading-6 text-muted-foreground sm:text-[15px]">
							Go back to a valid place in the app and continue from there.
						</p>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button asChild>
								<Link href="/channels/me">Go to Direct Messages</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/">Go to Home</Link>
							</Button>
						</div>

						<p className="text-xs leading-5 text-muted-foreground">
							If you expected a server channel, check the server sidebar or ask a moderator for an updated link.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ChannelNotFound;