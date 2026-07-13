export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full bg-white py-6 shadow-inner">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-gray-600 sm:flex-row">
        
        <p className="text-center sm:text-left">
          &copy; 2026 My Phonebook-App. All rights reserved.
        </p>
        
        <p className="flex items-center justify-center gap-1 font-medium">
          Designed and developed with ❤️ by {'Carlo022'}
          <span className="font-bold text-blue-600 hover:text-blue-700 transition">
            Your full-stack developer
          </span>
        </p>

      </div>
    </footer>
  );
}