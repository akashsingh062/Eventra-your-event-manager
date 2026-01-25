import { ClipLoader } from "react-spinners";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-br from-gray-100 via-white to-gray-200">
      {/* Spinner */}
      <ClipLoader size={55} speedMultiplier={1.2} />

      {/* Animated text */}
      <p className="mt-6 text-gray-700 text-sm font-medium animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default Loader;