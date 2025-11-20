'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'yellow' },
  { value: 'contacted', label: 'Contacted', color: 'purple' },
  { value: 'qualified', label: 'Qualified', color: 'green' },
  { value: 'closed', label: 'Closed', color: 'gray' },
] as const;

type Status = typeof STATUS_OPTIONS[number]['value'];

interface WholesaleStatusButtonProps {
  inquiryId: string;
  currentStatus: string;
}

export function WholesaleStatusButton({ inquiryId, currentStatus }: WholesaleStatusButtonProps) {
  const [status, setStatus] = useState<Status>(currentStatus as Status);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: Status) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/wholesale/${inquiryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === status);
  const colorClass = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  }[currentOption?.color || 'gray'];

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as Status)}
        disabled={isUpdating}
        className={`
          px-3 py-1 text-xs font-semibold rounded-full border
          ${colorClass}
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
          transition-opacity appearance-none pr-8
        `}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
