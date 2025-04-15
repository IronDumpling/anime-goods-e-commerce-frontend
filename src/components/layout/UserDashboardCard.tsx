import { Card } from "@/components/ui/Card";
import { Link } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  description: string;
  to: string;
}

export default function UserDashboardCard({ title, description, to }: DashboardCardProps) {
  return (
    <Link to={to}>
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        <p className="text-muted-foreground mt-2">{description}</p>
      </Card>
    </Link>
  );
}