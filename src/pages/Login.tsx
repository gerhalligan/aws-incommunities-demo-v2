// src/pages/Login.tsx
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">Welcome Back</h1>
        <Auth
          supabaseClient={supabase}
          magicLink={false}
          providers={[]}
          redirectTo={`${window.location.origin}/`}
          appearance={{ 
            theme: ThemeSupa,
            style: {
              button: { background: 'rgb(147 51 234)', color: 'white' },
              anchor: { color: 'rgb(147 51 234)' },
              message: {
                color: 'rgb(239 68 68)'
              }
            },
          }}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;
