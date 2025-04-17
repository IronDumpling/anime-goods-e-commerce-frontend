import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type Address = {
  id?: number;
  name: string;
  phone: string;
  address: string;
  unit?: string;
  city: string;
  province: string;
  postal: string;
};

const dummyAddresses: Address[] = [
  {
    id: 1,
    name: "Chuyue Zhang",
    phone: "4373438066",
    address: "180 Enterprise Blvd",
    unit: "Unit 302",
    city: "Markham",
    province: "Ontario",
    postal: "L6G 0G4",
  },
  {
    id: 2,
    name: "Chuyue Zhang",
    phone: "4373438066",
    address: "763 Bay St Unit 4808",
    city: "Toronto",
    province: "Ontario",
    postal: "M5G 2R3",
  },
];

function UserAddresses() {
  const navigate = useNavigate();
  const [editAddressId, setEditAddressId] = useState<number | "new" | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editData, setEditData] = useState<Address | null>(null);

  // Fetch from backend (currently mocked)
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/user/addresses");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAddresses(data);
      } catch {
        setAddresses(dummyAddresses); // fallback
      }
    };

    fetchAddresses();
  }, []);

  // Update form data when editAddressId changes
  useEffect(() => {
    if (editAddressId === "new") {
      setEditData({
        name: "",
        phone: "",
        address: "",
        unit: "",
        city: "",
        province: "",
        postal: "",
      });
    } else if (typeof editAddressId === "number") {
      const addr = addresses.find((a) => a.id === editAddressId);
      if (addr) setEditData(addr);
    } else {
      setEditData(null);
    }
  }, [editAddressId, addresses]);

  const closeEdit = () => setEditAddressId(null);

  const renderForm = () => {
    if (!editData) return null;
    const isNew = editAddressId === "new";

    return (
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-medium mb-4">
          {isNew ? "Add New Address" : "Edit Address"}
        </h3>
        <div className="grid gap-3">
          <Input placeholder="Full name" defaultValue={editData.name} />
          <Input placeholder="Phone number" defaultValue={editData.phone} />
          <Input placeholder="Address" defaultValue={editData.address} />
          <Input placeholder="Unit (optional)" defaultValue={editData.unit} />
          <Input placeholder="City" defaultValue={editData.city} />
          <Input placeholder="Province" defaultValue={editData.province} />
          <Input placeholder="Postal code" defaultValue={editData.postal} />
        </div>
        <div className="flex justify-between gap-2 mt-4">
          {!isNew && <Button variant="destructive">Remove</Button>}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button>{isNew ? "Add Address" : "Update Address"}</Button>
          </div>
        </div>
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

        <h2 className="text-2xl font-bold mb-6">Your Addresses</h2>

        <div
          className={cn(
            "flex flex-col md:flex-row gap-6 transition-all duration-300",
            editAddressId ? "justify-start items-start" : "justify-center"
          )}
        >
          <div
            className={cn(
              "grid gap-4 w-full md:w-[500px]",
              editAddressId ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            <Card
              onClick={() => setEditAddressId("new")}
              className="h-64 p-4 flex items-center justify-center cursor-pointer hover:bg-muted border-dashed border-2"
            >
              <div className="text-center text-muted-foreground">
                <Plus className="mx-auto mb-1" />
                Add Address
              </div>
            </Card>

            {addresses.map((addr) => (
              <Card
                key={addr.id}
                onClick={() => setEditAddressId(addr.id)}
                className="h-64 p-4 flex flex-col justify-between cursor-pointer hover:bg-muted"
              >
                <div className="font-semibold text-sm">{addr.name}</div>
                <div className="text-sm">{addr.address}</div>
                {addr.unit && <div className="text-sm">{addr.unit}</div>}
                <div className="text-sm">
                  {addr.city}, {addr.province} {addr.postal}
                </div>
                <div className="text-sm mt-1">Phone number: {addr.phone}</div>
              </Card>
            ))}
          </div>

          {editAddressId && renderForm()}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default UserAddresses;
