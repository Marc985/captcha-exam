import React, { useEffect } from "react";

// Déclarer les types pour les scripts AWS
declare global {
  interface Window {
    AwsWafCaptcha?: {
      renderCaptcha: (
        container: HTMLElement,
        options: {
          apiKey: string;
          onSuccess: (wafToken: string) => void;
          onError: (error: unknown) => void;
        }
      ) => void;
    };
  }
}

interface CaptchaComponentProps {
  onCaptchaSuccess: (wafToken: string) => void;
}

const CaptchaComponent: React.FC<CaptchaComponentProps> = ({ onCaptchaSuccess }) => {

  useEffect(() => {
  const captchaScript = document.createElement("script");

  captchaScript.src = "https://09bd26e5e726.eu-west-3.captcha-sdk.awswaf.com/09bd26e5e726/jsapi.js";
  captchaScript.type = "text/javascript";
  captchaScript.defer = true;

  captchaScript.onload = () => {
    const interval = setInterval(() => {
      const container = document.getElementById("my-captcha-container");

      if (container && window.AwsWafCaptcha) {
        clearInterval(interval); // Arrêter la vérification répétée
        const apiKey = import.meta.env.VITE_WAF_API;

        window.AwsWafCaptcha.renderCaptcha(container, {
          apiKey: apiKey,
          onSuccess: onCaptchaSuccess,
          onError: (error: unknown) => {
            console.error("Captcha Error:", error);
          },
        });
      }
    }, 100); // Vérifiez toutes les 100ms jusqu'à ce que le conteneur soit disponible
  };

  document.head.appendChild(captchaScript);

  return () => {
    document.head.removeChild(captchaScript);
  };
}, [onCaptchaSuccess]);


  useEffect(() => {
    const apiKey = import.meta.env.VITE_WAF_API_KEY;

    const container = document.getElementById("my-captcha-container");
    console.log("ito le api key:",apiKey);
    

    if (window.AwsWafCaptcha && container) {
      window.AwsWafCaptcha.renderCaptcha(container, {
        apiKey: apiKey,
        onSuccess: onCaptchaSuccess, // Passer la fonction de rappel ici
        onError: (error: unknown) => {
          console.error("Captcha Error:", error);
        },
      });
    } else {
      console.error("Captcha SDK ou conteneur non trouvé");
    }
  }, [onCaptchaSuccess]); // S'assurer que la fonction est mise à jour

  return (
    <div>
      <div id="my-captcha-container" style={{ marginBottom: "20px" }}></div>
    </div>
  );
};

export default CaptchaComponent;
