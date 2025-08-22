import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function ProfilePage() {
    const [isEditable, setIsEditable] = useState(false);

    return (
        <div className="p-6 bg-blue-50 min-h-screen min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="mx-auto">
                {/* Grid Layout for Responsive Design */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* Left Column */}

                    <div className="md:col-span-1">
                        <motion.div

                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="h-full"
                        >
                            <Card className="shadow-lg rounded-2xl overflow-hidden h-full ">
                                <CardHeader className="text-center">
                                    <CardTitle className="text-xl font-bold">My Profile</CardTitle>
                                </CardHeader>
                                <hr />
                                <CardContent className="flex flex-col items-center p-6">
                                    {/* Profile Image */}
                                    <div className="relative w-32 h-32 mb-4">
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-blue-200 shadow-md border-4 border-white">
                                            <User className="w-16 h-16 text-blue-600" />
                                        </div>
                                    </div>
                                    <h2 className="text-lg font-semibold">John Doe</h2>
                                    <p className="text-gray-500 text-sm">Frontend Developer</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                    </div>

                    {/* Right Column - Profile Form */}
                    <div className="md:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="shadow-lg rounded-2xl overflow-hidden h-full">
                                <CardHeader className="flex-row justify-between items-center">
                                    <CardTitle className="text-lg font-bold">Edit Details</CardTitle>
                                    <Edit
                                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                                        onClick={() => setIsEditable(!isEditable)}
                                    />
                                </CardHeader>
                                <hr />
                                <CardContent className="p-6 space-y-4">
                                    <form className="space-y-4">
                                        {/* Name */}
                                        <div className="flex items-center gap-4">
                                            <Label htmlFor="name" className="w-32">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                className="flex-1"
                                                defaultValue="John Doe"
                                                disabled={!isEditable}
                                            />
                                        </div>
                                        {/* Email */}
                                        <div className="flex items-center gap-4">
                                            <Label htmlFor="email" className="w-32">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className="flex-1"
                                                defaultValue="john@example.com"
                                                disabled={!isEditable}
                                            />
                                        </div>
                                        {/* Role */}
                                        <div className="flex items-center gap-4">
                                            <Label htmlFor="role" className="w-32">Role</Label>
                                            <Input
                                                id="role"
                                                type="text"
                                                className="flex-1"
                                                defaultValue="Frontend Developer"
                                                disabled={!isEditable}
                                            />
                                        </div>
                                        {/* Phone */}
                                        <div className="flex items-center gap-4">
                                            <Label htmlFor="phone" className="w-32">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                className="flex-1"
                                                defaultValue="+1 234 567 890"
                                                disabled={!isEditable}
                                            />
                                        </div>
                                        {/* Address */}
                                        <div className="flex items-center gap-4">
                                            <Label htmlFor="address" className="w-32">Address</Label>
                                            <Input
                                                id="address"
                                                type="text"
                                                className="flex-1"
                                                defaultValue="123 Street, City, Country"
                                                disabled={!isEditable}
                                            />
                                        </div>
                                        <div className="py-3 w-full">
                                            <Button asChild size="lg" className="gap-2 w-full">
                                                <Link to="#">
                                                    Save
                                                </Link>
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
