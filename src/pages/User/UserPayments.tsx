import ProtectedRoute from "@/components/layout/ProtectedRoute";

function UserPayments() {
  return (
    <ProtectedRoute accessLevel="user">
      <div className="container mx-auto px-4 py-10">Payments Management (Simulated)</div>
    </ProtectedRoute>
  );
}

export default UserPayments;
