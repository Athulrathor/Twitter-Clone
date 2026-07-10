import { CheckCircle, MessageSquare } from "lucide-react";

type PlanCardProps = {
  createOrder: (planName: string) => void;
  paymentAvailable: boolean;
  currentPlan?: string;
  allPlan: any;
};

const PlanCard = ({
  createOrder,
  paymentAvailable,
  currentPlan,
  allPlan
}: PlanCardProps) => {
  const plans = [
  {
    name: "FREE",
    price: 0,
    limit: "1 Tweet",
    color: "text-gray-400",
    border: "border-gray-800",
    _id: allPlan?.find((plan: any) => plan.name === "Free")?._id,
  },
  {
    name: "BRONZE",
    price: 100,
    limit: "3 Tweets",
    color: "text-amber-400",
    border: "border-gray-800",
    _id: allPlan?.find((plan: any) => plan.name === "Bronze")?._id,
  },
  {
    name: "SILVER",
    price: 300,
    limit: "5 Tweets",
    color: "text-slate-300",
    border: "border-gray-800",
    _id: allPlan?.find((plan: any) => plan.name === "Silver")?._id,
  },
  {
    name: "GOLD",
    price: 1000,
    limit: "Unlimited",
    color: "text-yellow-400",
    border: "border-gray-800",
    _id: allPlan?.find((plan: any) => plan.name === "Gold")?._id,
  },
];

  return (
    <div className="min-h-screen w-full bg-black px-4 pb-20 md:pb-0">
      {/* Header (like Feed) */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Plans</h1>
          <p className="text-sm text-gray-500">
            Choose your subscription
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        {plans.map((plan) => {
          const isActive =
            currentPlan?.toUpperCase() === plan.name;

          return (
            <div
              key={plan._id}
              className={`rounded-xl border bg-black p-5 transition-all duration-300 hover:bg-gray-950 ${
                isActive
                  ? "border-blue-500"
                  : "border-gray-800"
              }`}
            >
              {/* Active badge */}
              {isActive && (
                <div className="flex justify-end">
                  <span className="flex items-center gap-1 text-xs text-blue-400">
                    <CheckCircle size={14} />
                    Active
                  </span>
                </div>
              )}

              {/* Plan name */}
              <h2
                className={`text-lg font-bold mt-2 ${plan.color}`}
              >
                {plan.name}
              </h2>

              {/* Price */}
              <div className="mt-3">
                <span className="text-3xl font-bold text-white">
                  ₹{plan.price}
                </span>
                <span className="text-gray-500 text-sm">
                  /month
                </span>
              </div>

              {/* Limit */}
              <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                <MessageSquare size={16} />
                <span>{plan.limit}</span>
              </div>

              {/* Button */}
              <button
               disabled={
                  !paymentAvailable ||
                  isActive ||
                  plan.name === "FREE"
                }
                onClick={() => createOrder(plan._id)}
                className={`w-full mt-6 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white cursor-default"
                    : plan.name === "FREE"
                      ? "bg-gray-900 text-gray-500 cursor-not-allowed"
                      : paymentAvailable
                        ? "bg-white text-black hover:opacity-90"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isActive
                  ? "Current Plan"
                  : plan.name === "FREE"
                    ? "Default Plan"
                    : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanCard;