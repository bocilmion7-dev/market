import { useState } from 'react';
import { useLogin } from '@/features/auth/hooks';
import { Button, Input } from '@/components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[rgb(var(--bg-primary))] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgb(var(--bg-primary))] rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Marketplace Login</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate({ email, password });
            }}
            className="space-y-4"
          >
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {login.isError && (
              <p className="text-semantic-error text-sm">{(login.error as Error)?.message}</p>
            )}
            <Button
              type="submit"
              loading={login.isPending}
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
