import { Section } from '@/components/Section';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password | Long Life',
  description: 'Set your new password',
};

export default function ResetPasswordPage() {
  return (
    <Section className="py-20">
      <div className="max-w-md mx-auto">
        <h1 className="font-heading text-4xl font-bold mb-4 text-center">
          Set New Password
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Choose a strong password for your account.
        </p>
        <ResetPasswordForm />
      </div>
    </Section>
  );
}
