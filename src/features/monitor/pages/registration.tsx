import { useState } from "react";
import axios from "axios";
import { RoleGuard } from "@/components/role-guard";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

function Registration() {
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        agentName: "",
        mobileNumber: "",
        email: "",
        branch: "",
        division: "",
        subDivision: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };




    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const response = await axios.post(
                "http://192.168.0.144:8086/api/register-agent",
                formData
            );

            alert("Agent registered successfully!");
            console.log(response.data);

            // reset after success
            setFormData({
                agentName: "",
                mobileNumber: "",
                email: "",
                branch: "",
                division: "",
                subDivision: "",
            });
            setErrors({});
        } catch (error) {
            console.error(error);

            if (error.response && error.response.data?.message === "Email already exists") {
                setErrors((prev) => ({ ...prev, email: "Email already exists" }));
            } else {
                alert("Failed to register agent");
            }
        }
    };



    const validateForm = () => {
        let newErrors = {};

        // Agent name required
        if (!formData.agentName.trim()) {
            newErrors.agentName = "Agent Name is required";
        }

        // Mobile number validation
        if (!formData.mobileNumber) {
            newErrors.mobileNumber = "Mobile Number is required";
        } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = "Enter a valid 10-digit Mobile Number";
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Enter a valid Email address";
        }

        // Branch
        if (!formData.branch.trim()) {
            newErrors.branch = "Branch is required";
        }

        // Division
        if (!formData.division.trim()) {
            newErrors.division = "Division is required";
        }

        // Sub Division
        if (!formData.subDivision.trim()) {
            newErrors.subDivision = "Sub Division is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // ✅ return true if no errors
    };


    return (
        <RoleGuard allowedRoles={['MONITOR']}>
            <div className="p-3 sm:p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Registration Form</h1>
                        <p className="text-muted-foreground mt-1">
                            Only monitor can access the registration form
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                            <Eye size={15} />
                        </Badge>
                    </div>
                </div>
                <hr />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full mx-auto space-y-6"
                >
                    <div className="w-full space-y-6">
                        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm backdrop-blur-sm h-full hover:shadow-lg transition-all duration-200">
                            <form className="p-5" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="agentName">Agent Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="text"
                                            id="agentName"
                                            name="agentName"
                                            value={formData.agentName}
                                            onChange={handleChange}
                                            placeholder="Enter Agent name"
                                            className={`mt-2 h-12 ${errors.agentName ? "border-red-500 focus:ring-red-500" : ""}`}
                                        />
                                        {errors.agentName && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.agentName}
                                            </p>
                                        )}

                                    </div>

                                    <div>
                                        <Label htmlFor="mobileNumber">Mobile Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="tel"
                                            id="mobileNumber"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                // allow only digits AND max 10 chars
                                                if (/^\d*$/.test(value) && value.length <= 10) {
                                                    setFormData({ ...formData, mobileNumber: value });

                                                    // clear error if valid
                                                    setErrors((prev) => {
                                                        const { mobileNumber, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }

                                                // show error if user tries more than 10
                                                if (value.length > 10) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        mobileNumber: "Mobile number cannot exceed 10 digits",
                                                    }));
                                                }
                                            }}
                                            placeholder="Enter Mobile Number"
                                            className={`h-12 mt-2 ${errors.mobileNumber ? "border-red-500 focus:ring-red-500" : ""
                                                }`}
                                        />
                                       {errors.mobileNumber && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.mobileNumber}
                                            </p>
                                        )}

                                    </div>


                                    <div>
                                        <Label htmlFor="email">Email Id <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter Email Id"
                                            className={`mt-2 h-12 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.email}
                                            </p>
                                        )}

                                    </div>

                                    <div>
                                        <Label htmlFor="branch">Branch <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="text"
                                            id="branch"
                                            name="branch"
                                            value={formData.branch}
                                            onChange={handleChange}
                                            placeholder="Enter Branch"
                                            className={`mt-2 h-12 ${errors.branch ? "border-red-500 focus:ring-red-500" : ""}`}
                                        />
                                       {errors.branch && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.branch}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="division">Division <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="text"
                                            id="division"
                                            name="division"
                                            value={formData.division}
                                            onChange={handleChange}
                                            placeholder="Enter Division"
                                            className={`mt-2 h-12 ${errors.division ? "border-red-500 focus:ring-red-500" : ""}`}
                                        />
                                        {errors.division && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.division}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="subDivision">Sub Division <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="text"
                                            id="subDivision"
                                            name="subDivision"
                                            value={formData.subDivision}
                                            onChange={handleChange}
                                            placeholder="Enter Sub Division"
                                            className={`mt-2 h-12 ${errors.subDivision ? "border-red-500 focus:ring-red-500" : ""}`}
                                        />
                                       {errors.subDivision && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.subDivision}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="py-4">
                                    <Button
                                        type="button"
                                        onClick={handleSubmit} // call API
                                        className="w-full"
                                    >
                                        Register
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </RoleGuard>
    );
}


export default Registration;
