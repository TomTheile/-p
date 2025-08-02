import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";

interface User {
  id: number;
  username: string;
  robloxUsername?: string;
  isVerified: boolean;
  isPremium: boolean;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export function useAuth() {
  const { toast } = useToast();

  // Get current user if token exists
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!localStorage.getItem('auth_token'),
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(['/api/profile'], { user: data.user });
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { 
      username: string; 
      password: string; 
      robloxUserId?: string; 
      robloxUsername?: string; 
    }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(['/api/profile'], { user: data.user });
      toast({
        title: "Registration Successful",
        description: `Welcome, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    queryClient.clear();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  return {
    user: (user as any)?.user,
    isLoading,
    isAuthenticated: !!(user as any)?.user && !error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}