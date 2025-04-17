import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);

      // Get the previous page from location state, or default to home page
      const from = location.state?.from?.pathname || "/";
      console.log("Location:", location);
      console.log("From:", from);
      navigate(from, { replace: true });
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="mb-2">Login</CardTitle>
          <CardDescription className="text-center">
            Unlock exclusive experiences with AnimeGoods!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-sm font-medium text-right">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="password" className="text-sm font-medium text-right">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="col-span-3"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <div className="text-sm text-center space-y-2">
              <div>
                <Link to="/forgot-password" className="text-blue-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div>
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-500 hover:underline">
                  Register now
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default Login;