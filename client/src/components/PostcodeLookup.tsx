import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Check } from "lucide-react";

interface PostcodeData {
  postcode: string;
  city: string;
  region: string;
  country: string;
}

interface PostcodeLookupProps {
  onPostcodeFound: (data: PostcodeData) => void;
  initialValue?: string;
}

export default function PostcodeLookup({ onPostcodeFound, initialValue = "" }: PostcodeLookupProps) {
  const [postcode, setPostcode] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState(false);

  const formatPostcode = (input: string): string => {
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length > 4) {
      const outward = cleaned.slice(0, -3);
      const inward = cleaned.slice(-3);
      return `${outward} ${inward}`;
    }
    return cleaned;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostcode(e.target.value);
    setPostcode(formatted);
    setError(null);
    setFound(false);
  };

  const lookupPostcode = async () => {
    const cleanPostcode = postcode.replace(/\s/g, '');
    if (cleanPostcode.length < 5) {
      setError("Please enter a valid UK postcode");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Postcode not found. Please check and try again.");
        } else {
          setError("Unable to look up postcode. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.status === 200 && data.result) {
        const result = data.result;
        const postcodeData: PostcodeData = {
          postcode: result.postcode,
          city: result.admin_district || result.parliamentary_constituency || result.region || "",
          region: result.region || result.country || "",
          country: result.country === "England" || result.country === "Scotland" || 
                   result.country === "Wales" || result.country === "Northern Ireland" 
                   ? "GB" : "IE",
        };
        
        setPostcode(result.postcode);
        setFound(true);
        onPostcodeFound(postcodeData);
      } else {
        setError("Postcode not found. Please check and try again.");
      }
    } catch (err) {
      console.error("Postcode lookup error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      lookupPostcode();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={postcode}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g. SW1A 1AA"
            className={found ? "border-green-500 pr-8" : ""}
            maxLength={8}
            data-testid="input-postcode-lookup"
          />
          {found && (
            <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={lookupPostcode}
          disabled={isLoading || postcode.length < 5}
          data-testid="button-find-address"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4 mr-1" />
              Find
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {found && (
        <p className="text-sm text-green-600">Postcode found - city filled in automatically</p>
      )}
    </div>
  );
}
