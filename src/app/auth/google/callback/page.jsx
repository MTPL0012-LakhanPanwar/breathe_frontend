"use client";
import { useEffect } from "react";

export default function GoogleCallback() {
  useEffect(() => {
    // Parse the hash fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const idToken = params.get("id_token");
    const accessToken = params.get("access_token");
    
    if (idToken) {
      // Send token back to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GOOGLE_AUTH_SUCCESS",
            id_token: idToken,
            access_token: accessToken,
          },
          window.location.origin
        );
        window.close();
      }
    } else {
      // Handle error
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GOOGLE_AUTH_ERROR",
            error: "No token received",
          },
          window.location.origin
        );
        window.close();
      } 
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}