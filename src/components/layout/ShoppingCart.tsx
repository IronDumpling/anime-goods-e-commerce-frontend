import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trash } from "lucide-react";

export function ShoppingCart({ items, onRemove }: { items: any[], onRemove: Function }) {
  return (
    <Card className="p-6 w-full">
      <h2 className="text-2xl font-semibold">Shopping Cart</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-center py-4 border-b last:border-none">
            <img src={item.image} className="w-20 h-20 object-cover" />
            <div className="ml-4 flex-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-primary font-semibold">${item.price}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => onRemove(item.id)}>
              <Trash className="text-destructive"/>
            </Button>
          </div>
        ))
      )}
      <Button className="mt-4 w-full">Proceed to Checkout</Button>
    </Card>
  );
}
