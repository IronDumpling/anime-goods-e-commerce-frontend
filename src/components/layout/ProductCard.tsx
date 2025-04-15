import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function ProductCard({ product }: { product: any }) {
  return (
    <Card className="group hover:shadow-lg transition duration-300">
      <CardContent className="p-4">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-64 object-cover rounded-md"
        />
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
          <Badge className="mt-1">{product.category}</Badge>
          <p className="text-xl font-bold text-primary mt-2">${product.price}</p>
          <Button className="w-full mt-4">Add to Cart</Button>
        </div>
      </CardContent>
    </Card>
  );
}
