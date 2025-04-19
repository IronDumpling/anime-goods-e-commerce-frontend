import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

interface BackButtonProps {
  to: string;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, label = "Back" }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      onClick={() => navigate(to)}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};

export default BackButton;
