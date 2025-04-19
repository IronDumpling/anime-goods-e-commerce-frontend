import { useEffect, useState, useRef } from "react";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useAuth, User } from "@/context/AuthContext";

import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

type EditType = "firstName" | "lastName" | "email" | "password" | "address" | null;

function UserAccount() {
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editField, setEditField] = useState<EditType>(null);
  const [visibleField, setVisibleField] = useState<EditType>(null);

  const inputRef = useRef<HTMLInputElement>(null);

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
    const newUser = {...user, [visibleField]: newValue} as User
    updateUser(newUser);
    closeEdit();
  };

  const EditPanel = () => {
    if (!visibleField) return null;

    if (visibleField === "address") {
      return (
        <Card className="w-full max-w-md p-6">
          <h3 className="text-lg font-medium mb-4">Edit Address</h3>
          <div className="grid gap-3">
            <Input placeholder="Address" defaultValue={user?.address} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeEdit}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </Card>
      );
    }

    const fieldLabel =
      visibleField === "firstName"
      ? "Edit First Name"
      : visibleField === "lastName"
      ? "Edit Last Name"
      : visibleField === "email"
      ? "Edit Email"
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
              <Button onClick={handleSave}>Save</Button>
            </div>
          </>
        ) : (
          <>
            <Input
              defaultValue={user ? user[visibleField] : ""}
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
    <ProtectedRoute accessLevel="self">
      <div className="container mx-auto px-4 py-10">
        <button
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          onClick={() => navigate(`/user/${userId}`)}
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
              <h2 className="text-2xl font-bold mb-6">Account</h2>

              <div className="mb-6 border-b pb-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-left">First Name</h4>
                  <p className="text-muted-foreground text-sm text-left">{user?.firstName}</p>
                </div>
                <Button variant="outline" onClick={() => setEditField("firstName")}>Edit</Button> 
              </div>

              <div className="mb-6 border-b pb-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-left">Last Name</h4>
                  <p className="text-muted-foreground text-sm text-left">{user?.lastName}</p>
                </div>
                <Button variant="outline" onClick={() => setEditField("lastName")}>Edit</Button> 
              </div>

              <div className="mb-6 border-b pb-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-left">Email</h4>
                  <p className="text-muted-foreground text-sm text-left">{user?.email}</p>
                </div>
                <Button variant="outline" onClick={() => setEditField("email")}>Edit</Button>
              </div>

              <div className="mb-6 border-b pb-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-left">Password</h4>
                  <p className="text-muted-foreground text-sm text-left">********</p>
                </div>
                <Button variant="outline" onClick={() => setEditField("password")}>Edit</Button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-left">Address</h4>
                  <p className="text-muted-foreground text-sm text-left">
                    {user?.address}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setEditField("address")}>Edit</Button>
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
