import { ClipLoader } from "react-spinners";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Spinner */}
      <ClipLoader size={55} speedMultiplier={1.2} className="dark:text-white text-gray-900" />

      {/* Animated text */}
      <p className="mt-6 text-gray-700 dark:text-gray-300 text-sm font-medium animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default Loader;