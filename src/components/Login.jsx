// src/components/Login.jsx
import React, { useState } from "react";
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
} from "../firebase/auth";
import { db } from "../firebase/config";
import { ref, set } from "firebase/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
} from "./ui";

const Login = ({ onSkip }) => {
  // Add onSkip prop
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const saveUserProfile = async (userId, userData) => {
    try {
      await set(ref(db, `users/${userId}`), userData);
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        if (!firstName || !lastName) {
          setError("First and last name are required");
          return;
        }
        const userCredential = await registerWithEmail(email, password);
        await saveUserProfile(userCredential.user.uid, {
          firstName,
          lastName,
          email,
          createdAt: new Date().toISOString(),
        });
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      const nameParts = userCredential.user.displayName?.split(" ") || ["", ""];
      await saveUserProfile(userCredential.user.uid, {
        firstName: nameParts[0],
        lastName: nameParts[nameParts.length - 1],
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            {isRegistering ? "Create Account" : "Sign In"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {isRegistering && (
              <>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={isRegistering}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={isRegistering}
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isRegistering ? "Register" : "Sign In"}
              </Button>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-2"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-6 h-6"
                />
                Sign in with Google
              </Button>

              <Button
                type="button"
                onClick={onSkip}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Continue as Guest
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-600 hover:underline"
            >
              {isRegistering
                ? "Already have an account? Sign in"
                : "Don't have an account? Register"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
