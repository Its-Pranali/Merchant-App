import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // assuming you have shadcn/ui input
import { Label } from "@/components/ui/label";
import { UserRole } from "@/lib/types";

function LoginPage() {
    const [selectedRole] = useState<UserRole>("AGENT");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // you can pass email, password along with role to your login method if needed
        login(selectedRole);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2 pb-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                className="form-control"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button onClick={handleLogin} className="w-full rounded-full" size="lg">
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginPage;
