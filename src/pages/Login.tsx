import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
          variant: "default",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-primary/10" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')] bg-cover bg-center opacity-5" />
      
      {/* Content */}
      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-primary/5 mb-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" x2="4" y1="22" y2="15" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AWS InCommunities Portal</h1>
          <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
        </div>

        {/* Auth Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary/10 p-8">
          <Auth
            supabaseClient={supabase}
            magicLink={false}
            providers={[]}
            redirectTo={`${window.location.origin}/`}
            appearance={{ 
              theme: ThemeSupa,
              style: {
                button: { 
                  background: 'hsl(var(--primary))',
                  color: 'white',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  width: '100%'
                },
                anchor: { 
                  color: 'hsl(var(--primary))',
                  textDecoration: 'none',
                  fontWeight: '500'
                },
                message: {
                  color: 'hsl(var(--destructive))',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'hsl(var(--destructive) / 0.1)',
                  border: '1px solid hsl(var(--destructive) / 0.2)'
                },
                input: {
                  borderRadius: '0.75rem',
                  backgroundColor: 'white',
                  borderColor: 'hsl(var(--border))',
                  fontSize: '0.875rem',
                  padding: '0.75rem 1rem'
                },
                label: {
                  color: 'hsl(var(--foreground))',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem'
                }
              },
              className: {
                container: 'space-y-4',
                button: 'hover:opacity-90 transition-opacity',
                input: 'focus:ring-2 focus:ring-primary focus:border-primary transition-shadow',
                label: 'block',
                message: 'animate-in fade-in-50',
              }
            }}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign in to your account',
                  loading_button_label: 'Signing in...',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Create a Password',
                  button_label: 'Create account',
                  loading_button_label: 'Creating account...',
                },
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>By signing in, you agree to our</p>
          <div className="space-x-2">
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            <span>&middot;</span>
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
