import { Card } from "@/components/ui/Card";
import { Link } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  description: string;
  to: string;
}

export default function UserDashboardCard({ title, description, to }: DashboardCardProps) {
  return (
    <Link to={to} className="h-full">
      <Card className="h-40 w-full flex flex-col items-center justify-center text-center p-6 shadow-md hover:shadow-lg transition-all">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        <p className="text-muted-foreground mt-2">{description}</p>
      </Card>
    </Link>
  );
}
