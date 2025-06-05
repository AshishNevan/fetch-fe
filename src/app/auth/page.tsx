"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Star, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

interface FormData {
  name: string;
  email: string;
}

interface ApiError {
  message: string;
  status?: number;
}

// API service for authentication
const authService = {
  async login(data: FormData): Promise<{ success: boolean; error?: ApiError }> {
    try {
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies in request
          body: JSON.stringify({
            name: data.name,
            email: data.email,
          }),
        }
      );

      if (response.ok) {
        // Successful authentication - cookie should be set automatically
        const authEvent = new CustomEvent("authStateChanged");
        window.dispatchEvent(authEvent);

        return { success: true };
      } else {
        // Handle different error status codes
        let errorMessage =
          "Authentication failed. Please check your credentials.";

        if (response.status === 400) {
          errorMessage =
            "Invalid name or email format. Please check your input.";
        } else if (response.status === 401) {
          errorMessage =
            "Invalid credentials. Please check your name and email.";
        } else if (response.status === 429) {
          errorMessage = "Too many attempts. Please try again later.";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }

        // Try to parse error response
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Use default error message if JSON parsing fails
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            status: response.status,
          },
        };
      }
    } catch {
      // Network or other errors
      return {
        success: false,
        error: {
          message: "Network error. Please check your connection and try again.",
        },
      };
    }
  },
};

export default function AuthPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Basic client-side validation
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.login(formData);

      if (result.success) {
        setSuccess(true);

        // Show success message briefly before redirect
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(
          result.error?.message || "Authentication failed. Please try again."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl text-center">
            <CardContent className="p-12">
              <div className="flex justify-center mb-8">
                <div className="bg-green-500 p-6 rounded-full shadow-lg animate-pulse">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                Welcome to Fetch Rewards!
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                You&apos;ve successfully joined our community and earned 100
                welcome points! 🎉
              </p>
              <div className="inline-flex items-center bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-3 rounded-full text-lg font-semibold mb-6">
                <Star className="mr-3 h-5 w-5" />
                +100 Points Earned!
              </div>
              <p className="text-sm text-gray-500">
                Redirecting you to the home page...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 p-6">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-bounce">
          🐾
        </div>
        <div className="absolute top-40 right-20 text-4xl opacity-10 animate-pulse">
          ❤️
        </div>
        <div className="absolute bottom-32 left-20 text-5xl opacity-10 animate-bounce delay-1000">
          🐕
        </div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-pulse delay-500">
          ⭐
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-md z-10">
          {/* Back Button */}
          <div className="mb-2">
            <Link
              href="/"
              className="inline-flex items-center text-white hover:text-yellow-300 transition-colors group"
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-lg">Back to Home</span>
            </Link>
          </div>

          {/* Logo and Branding */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-400 p-4 rounded-2xl shadow-xl">
                <span className="text-4xl">🐕</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Join Fetch Rewards
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Start your journey to adopt a furry friend and earn amazing
              rewards!
            </p>

            {/* Welcome Points Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg">
              <Star className="mr-2 h-5 w-5" />
              +100 Welcome Points
            </div>
          </div>

          {/* Auth Form Card */}
          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl mb-8">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-center text-purple-900">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-center text-purple-700 text-base">
                Enter your details to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              {/* Error Alert */}
              {error && (
                <div className="mb-6">
                  <Alert
                    variant="destructive"
                    className="animate-in slide-in-from-top duration-300"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-purple-900 font-semibold text-base"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className={`h-12 text-base border-purple-200 focus:border-purple-500 focus:ring-purple-500 transition-colors ${
                      error && !formData.name.trim()
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-purple-900 font-semibold text-base"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className={`h-12 text-base border-purple-200 focus:border-purple-500 focus:ring-purple-500 transition-colors ${
                      error &&
                      (!formData.email.trim() ||
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Authenticating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Heart className="mr-3 h-5 w-5" />
                        Start My Journey
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              {/* Terms */}
              <p className="text-xs text-center text-purple-600 mt-6">
                By signing up, you agree to help make shelter dogs happy and
                earn rewards doing good deeds! 🐾
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
            <CardContent className="p-6">
              <h4 className="font-bold text-purple-900 mb-4 text-center text-lg">
                What you&apos;ll get:
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-purple-700">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  500 points for every adoption
                </div>
                <div className="flex items-center text-sm text-purple-700">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  50 points just for visiting
                </div>
                <div className="flex items-center text-sm text-purple-700">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  Exclusive rewards & discounts
                </div>
                <div className="flex items-center text-sm text-purple-700">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  Help save more shelter dogs
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
