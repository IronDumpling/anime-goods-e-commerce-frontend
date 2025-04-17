import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UserAccount() {
  const navigate = useNavigate();
  const [editField, setEditField] = useState<"name" | "email" | "phone" | "password" | null>(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Placeholder for backend call to fetch user data
  useEffect(() => {
    async function fetchUserData() {
      // TODO: Replace with actual backend call
      setUserData({
        name: "Charlie Zhang",
        email: "irondumpling010@gmail.com",
        phone: "+14373438066"
      });
    }
    fetchUserData();
  }, []);

  const EditPanel = () => {
    switch (editField) {
      case "name":
        return (
          <Card className="w-full max-w-md p-6 animate-fade-in-right transition-all duration-500">
            <h3 className="text-lg font-medium mb-2">Name</h3>
            <Input defaultValue={userData.name} placeholder="Enter new name" className="mb-3" />
            <Button className="w-full">Save Changes</Button>
          </Card>
        );
      case "email":
        return (
          <Card className="w-full max-w-md p-6 animate-fade-in-right transition-all duration-500">
            <h3 className="text-lg font-medium mb-2">Email</h3>
            <Input defaultValue={userData.email} placeholder="Enter new email" className="mb-3" />
            <Button className="w-full">Save Changes</Button>
          </Card>
        );
      case "phone":
        return (
          <Card className="w-full max-w-md p-6 animate-fade-in-right transition-all duration-500">
            <h3 className="text-lg font-medium mb-2">Mobile Number</h3>
            <Input defaultValue={userData.phone} placeholder="Enter new number" className="mb-3" />
            <Button className="w-full">Continue</Button>
          </Card>
        );
      case "password":
        return (
          <Card className="w-full max-w-md p-6 animate-fade-in-right transition-all duration-500">
            <h3 className="text-lg font-medium mb-2">Change Password</h3>
            <Input type="password" placeholder="Current password" className="mb-2" />
            <Input type="password" placeholder="New password" className="mb-2" />
            <Input type="password" placeholder="Reenter new password" className="mb-4" />
            <Button className="w-full">Save Changes</Button>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute accessLevel="user">
      <div className="container mx-auto px-4 py-10">
        <button
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          onClick={() => navigate("/user")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to User Page
        </button>

        <div
          className={cn(
            "flex flex-col md:flex-row gap-6 transition-all duration-300",
            editField ? "justify-start" : "justify-center"
          )}
        >
          <Card className={cn(
            "w-full md:w-[480px] transition-all duration-300",
            editField ? "md:ml-0" : "md:mx-auto"
          )}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Login & Security</h2>

              <div className="mb-6 border-b pb-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-left">Name</h4>
                  <p className="text-muted-foreground text-sm text-left">{userData.name}</p>
                </div>
                <Button variant="outline" onClick={() => setEditField("name")}>Edit</Button>
              </div>

              <div className="mb-6 border-b pb-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-left">Email</h4>
                  <p className="text-muted-foreground text-sm text-left">{userData.email}</p>
                </div>
                <Button variant="outline" onClick={() => setEditField("email")}>Edit</Button>
              </div>

              <div className="mb-6 border-b pb-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-left">Phone Number</h4>
                  <p className="text-muted-foreground text-sm text-left">{userData.phone}</p>
                </div>
                <Button variant="outline" onClick={() => setEditField("phone")}>Edit</Button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-left">Password</h4>
                  <p className="text-muted-foreground text-sm text-left">********</p>
                </div>
                <Button variant="outline" onClick={() => setEditField("password")}>Edit</Button>
              </div>
            </div>
          </Card>
          {editField && <EditPanel />}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default UserAccount;
