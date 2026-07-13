import { Loader2 } from 'lucide-react';

export default function Loader({ message = "Please Wait While Loading Data..." }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="mt-4 text-lg font-medium text-gray-500 animate-pulse">{message}</p>
    </div>
  );
}