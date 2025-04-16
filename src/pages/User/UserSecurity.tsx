import ProtectedRoute from "@/components/layout/ProtectedRoute";

function UserSecurity() {
  return (
    <ProtectedRoute accessLevel="user">
      <div className="container mx-auto px-4 py-10">User Security & Login Page</div>
    </ProtectedRoute>
  );
}

export default UserSecurity;
