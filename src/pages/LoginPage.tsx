import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
type AuthMode = 'signin' | 'signup';
export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, register } = useAuth();
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (mode === 'signin') {
      login({ username, password });
    } else {
      register({ username, password });
    }
  };
  const toggleMode = () => {
    setMode(prev => (prev === 'signin' ? 'signup' : 'signin'));
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <ThemeToggle className="absolute top-6 right-6" />
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-sm shadow-2xl backdrop-blur-sm bg-card/80">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Feather className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-display">Synapse Scribe</CardTitle>
            <CardDescription>
              {mode === 'signin' ? 'Welcome back. Please sign in.' : 'Create an account to get started.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 text-base"
                />
              </div>
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 text-base"
                  />
                </div>
              )}
              <Button type="submit" className="w-full h-11 text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white">
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button onClick={toggleMode} className="underline text-blue-500 hover:text-blue-600">
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground justify-center">
            <p>Built with ❤️ at Cloudflare</p>
          </CardFooter>
        </Card>
      </motion.div>
      <Toaster />
    </main>
  );
}