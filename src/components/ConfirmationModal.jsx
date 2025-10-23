"use client";

import React from "react";
import { X, AlertTriangle, Trash2, CheckCircle } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
  variant = "danger", // 'danger', 'warning', 'success'
  isLoading = false,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700",
      buttonText: "text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700",
      buttonText: "text-white",
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      buttonBg: "bg-green-600 hover:bg-green-700",
      buttonText: "text-white",
    },
  };

  const currentVariant = variantStyles[variant];
  const Icon = currentVariant.icon;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Icon */}
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${currentVariant.iconBg}`}
            >
              <Icon className={`h-6 w-6 ${currentVariant.iconColor}`} />
            </div>

            {/* Title */}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {title}
              </h3>
            </div>

            {/* Message */}
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600 sm:text-base">{message}</p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-4 md:gap-8 sm:flex-row sm:justify-center">
              {/* Confirm Button */}
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`w-full cursor-pointer sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${currentVariant.buttonBg} ${currentVariant.buttonText}`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
              {/* Cancel Button */}
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-full cursor-pointer sm:w-auto px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
