import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function UserForm({ onSubmit, type }: { onSubmit: Function; type: "Login" | "Register" }) {
  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">{type}</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {type === "Register" && (
          <Input placeholder="Username" required className="mb-3" />
        )}
        <Input type="email" placeholder="Email" required className="mb-3" />
        <Input type="password" placeholder="Password" required className="mb-4" />
        <Button className="w-full">{type}</Button>
      </form>
    </Card>
  );
}
