import React, { useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  lastFour: string;
  isDefault: boolean;
}

const UserPayments: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'credit_card', label: 'Visa', lastFour: '4242', isDefault: true },
    { id: '2', type: 'paypal', label: 'PayPal', lastFour: 'N/A', isDefault: false },
  ]);
  const [selectedId, setSelectedId] = useState<string>('1');

  const handleSetDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const handleRemove = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id && methods.length > 1) setSelectedId(methods[0].id);
  };

  return (
    <ProtectedRoute accessLevel="self">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Manage Payment Methods</h1>

        <RadioGroup value={selectedId} onValueChange={setSelectedId} className="space-y-4">
          {methods.map((method) => (
            <Card key={method.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <RadioGroupItem value={method.id} id={method.id} />
                <div>
                  <div className="font-medium">{method.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {method.type === 'credit_card' ? `Ending in ${method.lastFour}` : 'Online Account'}
                  </div>
                </div>
              </div>
              <div className="space-x-2">
                {!method.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                    Set Default
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleRemove(method.id)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </RadioGroup>

        <Card className="p-4 mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Add New Payment Method</h2>
          <Input placeholder="Card Number / PayPal Email" />
          <Button>Add</Button>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default UserPayments;