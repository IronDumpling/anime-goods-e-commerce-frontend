import ProtectedRoute from "@/components/layout/ProtectedRoute";

function UserAddresses() {
  return (
    <ProtectedRoute accessLevel="user">
      <div className="container mx-auto px-4 py-10">User Addresses Management Page</div>
    </ProtectedRoute>
  );
}

export default UserAddresses;
