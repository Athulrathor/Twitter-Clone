import { CheckCircle2 } from "lucide-react";
import useAuthentication from "./useAuthenticationHook";

interface Props {
    flow: ReturnType<typeof useAuthentication>;
}

export default function AuthenticationSuccess({
    flow,
}: Props) {
    return (
        <div className="flex flex-col items-center py-8">

            <CheckCircle2
                size={70}
                className="text-green-500"
            />

            <h3 className="mt-5 text-lg font-semibold">
                {flow.request?.successTitle ??
                    "Verification Successful"}
            </h3>

            <p className="mt-2 text-center text-sm text-muted-foreground">
                {flow.request?.successDescription ??
                    "Your identity has been verified successfully."}
            </p>

        </div>
    );
}