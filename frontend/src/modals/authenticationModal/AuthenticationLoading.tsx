import LoadingSpinner from "@/components/loading-spinner";

export default function AuthenticationLoading() {
  return (
    <div className="py-10 flex flex-col items-center">
      <LoadingSpinner />
    </div>
  );
}
