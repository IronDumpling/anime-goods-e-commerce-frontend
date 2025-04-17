import { useEffect, useState, useRef } from "react";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
// import NotificationPopover from "@/components/layout/NotificationPopover";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type EditType = "name" | "email" | "phone" | "password" | null;

function UserAccount() {
  const navigate = useNavigate();
  const [editField, setEditField] = useState<EditType>(null);
  const [visibleField, setVisibleField] = useState<EditType>(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchUserData() {
      setUserData({
        name: "Charlie Zhang",
        email: "irondumpling010@gmail.com",
        phone: "+14373438066"
      });
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    if (editField) {
      setVisibleField(editField);
    }
  }, [editField]);

  const closeEdit = () => {
    setVisibleField(null);
    setEditField(null);
  };

  const handleSave = () => {
    if (!inputRef.current || !visibleField) return;
    const newValue = inputRef.current.value.trim();
    // if (newValue === userData[visibleField]) {
    //   setShowNotification(true);
    //   setTimeout(() => setShowNotification(false), 3000);
    //   return;
    // }
    setUserData((prev) => ({ ...prev, [visibleField]: newValue }));
    closeEdit();
  };

  const EditPanel = () => {
    if (!visibleField) return null;

    const fieldLabel =
      visibleField === "name"
        ? "Name"
        : visibleField === "email"
        ? "Email"
        : visibleField === "phone"
        ? "Mobile Number"
        : "Change Password";

    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-medium mb-2">{fieldLabel}</h3>

        {visibleField === "password" ? (
          <>
            <Input type="password" placeholder="Current password" className="mb-2 text-left" />
            <Input type="password" placeholder="New password" className="mb-2 text-left" />
            <Input type="password" placeholder="Reenter new password" className="mb-4 text-left" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeEdit}>Cancel</Button>
              <Button>Save</Button>
            </div>
          </>
        ) : (
          <>
            <Input
              defaultValue={userData[visibleField]}
              placeholder={`Enter new ${visibleField}`}
              className="mb-3 text-left"
              ref={inputRef}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeEdit}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </>
        )}
      </Card>
    );
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
            visibleField ? "justify-start" : "justify-center"
          )}
        >
          <Card className={cn(
            "w-full md:w-[480px] transition-all duration-300",
            visibleField ? "md:ml-0" : "md:mx-auto"
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

          {visibleField && <EditPanel />}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default UserAccount;
