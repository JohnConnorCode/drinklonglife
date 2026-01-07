import { Section } from '@/components/Section';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | Long Life',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return (
    <Section className="py-20">
      <div className="max-w-md mx-auto">
        <h1 className="font-heading text-4xl font-bold mb-4 text-center">
          Reset Password
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <ForgotPasswordForm />
      </div>
    </Section>
  );
}
