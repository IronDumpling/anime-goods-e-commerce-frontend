import UserDashboardCard from "@/components/layout/UserDashboardCard";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

function UserDashboard() {
  return (
    <ProtectedRoute accessLevel="user">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Your Account</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UserDashboardCard
            title="Your Orders"
            description="Track, return, or buy again"
            to="/user/orders"
          />
          <UserDashboardCard
            title="Login & Security"
            description="Update password, name, or delete account"
            to="/user/account"
          />
          <UserDashboardCard
            title="Your Addresses"
            description="Manage your addresses and contact information"
            to="/user/addresses"
          />
          <UserDashboardCard
            title="Your Payments"
            description="Manage your payment methods"
            to="/user/payments"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default UserDashboard;