import { useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

function UserAccount() {
  const [activeEdit, setActiveEdit] = useState<string | null>(null);

  const handleSave = () => {
    setActiveEdit(null);
    // TODO: add backend integration
  };

  const renderEditForm = () => {
    switch (activeEdit) {
      case 'name':
      case 'email':
        return (
          <Card className="p-6 max-w-md">
            <Label>{activeEdit === 'name' ? 'Name' : 'Email'}</Label>
            <Input placeholder={`Enter new ${activeEdit}`} required className="my-4" />
            <Button onClick={handleSave}>Save Changes</Button>
          </Card>
        );

      case 'phone':
        return (
          <Card className="p-6 max-w-md">
            <Label>Mobile Number</Label>
            <Input placeholder="Enter phone number" required className="my-4" />
            <Button onClick={handleSave}>Continue</Button>
          </Card>
        );

      case 'password':
        return (
          <Card className="p-6 max-w-md">
            <Label>Current Password</Label>
            <Input type="password" placeholder="Current password" required className="my-4" />

            <Label>New Password</Label>
            <Input type="password" placeholder="New password" required className="my-4" />

            <Label>Confirm New Password</Label>
            <Input type="password" placeholder="Confirm new password" required className="my-4" />

            <Button onClick={handleSave}>Save Changes</Button>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute accessLevel="user">
      <div className="container mx-auto px-4 py-10 flex space-x-8">
        <div className="w-full max-w-xl">
          <Card className="p-6 space-y-6">
            <h2 className="text-2xl font-semibold">Login & Security</h2>
            {[
              { label: 'Name', value: 'Charlie Zhang', field: 'name' },
              { label: 'Email', value: 'irondumpling010@gmail.com', field: 'email' },
              { label: 'Phone Number', value: '+14373438066', field: 'phone' },
              { label: 'Password', value: '********', field: 'password' },
            ].map(({ label, value, field }) => (
              <div key={field} className="flex justify-between items-center py-4 border-b">
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-600">{value}</div>
                </div>
                <Button variant="outline" onClick={() => setActiveEdit(field)}>
                  Edit
                </Button>
              </div>
            ))}
          </Card>
        </div>

        <div className="w-full max-w-md">
          {activeEdit && renderEditForm()}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default UserAccount;
