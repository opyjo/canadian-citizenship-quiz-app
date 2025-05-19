import SignUpForm from "@/components/signup-form";

export default function SignUpPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground mt-2">
            Join thousands of Canadians preparing for their citizenship test
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
