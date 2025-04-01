import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const { toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-surface shadow-md px-4 py-3 flex justify-between items-center">
      <div className="text-2xl font-semibold text-primary">
        <Link to="/">AnimeGoods</Link>
      </div>
      <div className="space-x-4">
        <Link to="/products" className="text-foreground hover:text-primary">
          Products
        </Link>
        <Link to="/cart" className="text-foreground hover:text-primary">
          Cart
        </Link>
        <Button variant="secondary" onClick={toggleTheme}>
          Toggle Theme
        </Button>
      </div>
    </nav>
  );
}
