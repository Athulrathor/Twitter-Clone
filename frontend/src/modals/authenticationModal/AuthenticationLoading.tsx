import LoadingSpinner from "@/components/loading-spinner";

export default function AuthenticationLoading() {
  return (
    <div className="py-10 flex flex-col items-center">
      <LoadingSpinner />

      <p className="mt-4 ml-2 text-sm text-muted-foreground">{"Sending..."}</p>
    </div>
  );
}
