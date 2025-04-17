import UserDashboardCard from "@/components/layout/UserDashboardCard";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

function UserDashboard() {
  return (
    <ProtectedRoute accessLevel="user">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Account</h1>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
            <UserDashboardCard
              title="Your Orders"
              description="Track, return, or buy again"
              to="/user/orders"
            />
            <UserDashboardCard
              title="Account"
              description="Update password, name, address, or delete account"
              to="/user/account"
            />
            <UserDashboardCard
              title="Your Payments"
              description="Manage your payment methods"
              to="/user/payments"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default UserDashboard;
