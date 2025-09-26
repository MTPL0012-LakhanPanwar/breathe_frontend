import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg
        ${
          type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }
        transform transition-all duration-300 ease-in-out
      `}
    >
      {type === "success" ? (
        <CheckCircle className="h-5 w-5 text-green-600" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-600" />
      )}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
