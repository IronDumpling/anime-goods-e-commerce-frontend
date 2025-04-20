import { useEffect, useState, useRef } from "react";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import BackButton from '@/components/layout/BackButton';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { User } from "@/lib/types";
import { put } from "@/lib/api";

import { toast } from "sonner";
import { useParams } from "react-router-dom";

type EditType = "firstName" | "lastName" | "email" | "password" | "address" | null;

function UserAccount() {
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const [editField, setEditField] = useState<EditType>(null);
  const [visibleField, setVisibleField] = useState<EditType>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const rePasswordRef = useRef<HTMLInputElement>(null);
  
  const backPath = user?.isAdmin ? "/admin" : `/user/${userId}`;
  const backText = user?.isAdmin ? "Back to Admin Page" : "Back to User Page";

  useEffect(() => {
    if (editField) {
      setVisibleField(editField);
    }
  }, [editField]);

  const closeEdit = () => {
    setVisibleField(null);
    setEditField(null);
  };

  const handleSave = async () => {
    if (!visibleField || !user) return;

    const updatedUser: Partial<User> = { ...user };
    let updatedPayload: any = { ...user };
  
    if (visibleField === "password") {
      const newPassword = newPasswordRef.current?.value.trim();
      const rePassword = rePasswordRef.current?.value.trim();
      if (!newPassword || newPassword !== rePassword) {
        toast.error("Passwords must match and not be empty.");
        return;
      }
      updatedPayload.password = newPassword;
    } else {
      if (!inputRef.current) return;
      const fieldValue = inputRef.current.value.trim();
      updatedUser[visibleField] = fieldValue;
      updatedPayload[visibleField] = fieldValue;
    }
  
    try {
      const response = await put<User>(`/api/user/${user.id}`, updatedPayload);
      if (response && response.data) {
        updateUser(response.data);
      } else {
        toast.error("Failed to update user");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Update error:" + err)
    }
    closeEdit();
  };

  const EditPanel = () => {
    if (!visibleField) return null;

    if (visibleField === "address") {
      return (
        <Card className="w-full max-w-md p-6">
          <h3 className="text-lg font-medium mb-4">Edit Address</h3>
          <div className="grid gap-3">
            <Input placeholder="Address" defaultValue={user?.address} ref={inputRef} />
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
            <Input type="password" placeholder="New password" className="mb-2 text-left" ref={newPasswordRef} />
            <Input type="password" placeholder="Confirm new password" className="mb-4 text-left" ref={rePasswordRef} />
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
        <BackButton to={backPath} label={backText} />
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
