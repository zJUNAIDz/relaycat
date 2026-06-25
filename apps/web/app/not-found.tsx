import { ErrorState } from "@/shared/components/error-state";

/**
 * Real 404 page — rendered for unmatched routes and any `notFound()` call.
 * Runtime crashes are handled separately by `error.tsx`.
 */
const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorState
        eyebrow="404"
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
      />
    </div>
  );
};

export default NotFoundPage;
