import { Metadata } from 'next';
import Link from 'next/link';
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Update Password',
  description: 'Set a new password for your Long Life account',
};

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-cream via-white to-accent-yellow/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below. Make sure it's at least 8 characters long.
          </p>
        </div>

        <UpdatePasswordForm />

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-accent-primary hover:text-accent-primary/80"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
