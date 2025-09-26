import { EyeOff, Eye, AlertCircle } from "lucide-react";

const InputField = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  error,
  name,
  showPasswordToggle = false,
  onTogglePassword,
  showPassword = false,
}) => {
  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showPasswordToggle && showPassword ? "text" : type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
              w-full pl-10 pr-${showPasswordToggle ? "10" : "4"} py-3 text-black
              border-2 rounded-lg transition-all duration-300 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-green-500/20
              ${
                error
                  ? "border-red-300 bg-red-50 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-green-500 hover:border-gray-300"
              }
            `}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onTogglePassword}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default InputField;
