import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    // Check if user has already responded
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Show after a short delay to not interrupt user experience
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setHasResponded(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setHasResponded(true);
    setIsVisible(false);
  };

  if (!isVisible || hasResponded) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-primary/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">We use cookies</h3>
              <p className="text-sm text-muted-foreground mb-3">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or decline non-essential cookies.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAccept} size="sm">
                  Accept All
                </Button>
                <Button onClick={handleDecline} variant="outline" size="sm">
                  Decline Non-Essential
                </Button>
                <Button variant="link" size="sm" asChild>
                  <a href="/privacy">Privacy Policy</a>
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 -mt-2 -mr-2"
              onClick={handleDecline}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;
