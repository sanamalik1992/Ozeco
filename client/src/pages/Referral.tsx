import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, Copy, Share2, Users, Coins, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ReferralCode } from "@shared/schema";
import { SiFacebook, SiX, SiWhatsapp } from "react-icons/si";

export default function Referral() {
  const [email, setEmail] = useState("");
  const [referralData, setReferralData] = useState<ReferralCode | null>(null);
  const { toast } = useToast();

  const createReferralMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("/api/referral/create", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return response as ReferralCode;
    },
    onSuccess: (data: ReferralCode) => {
      setReferralData(data);
      toast({
        title: "Referral code generated!",
        description: "Share your code and earn rewards.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate referral code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      createReferralMutation.mutate(email);
    } else {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    if (referralData) {
      await navigator.clipboard.writeText(referralData.code);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard.",
      });
    }
  };

  const shareOnFacebook = () => {
    if (referralData) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        `https://ozeco.co.uk?ref=${referralData.code}`
      )}`;
      window.open(url, "_blank");
    }
  };

  const shareOnTwitter = () => {
    if (referralData) {
      const text = `Get £${referralData.discountAmount} off your first Electric bike at Ozeco! Use my referral code: ${referralData.code}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
        "https://ozeco.co.uk"
      )}`;
      window.open(url, "_blank");
    }
  };

  const shareOnWhatsApp = () => {
    if (referralData) {
      const text = `Hey! Get £${referralData.discountAmount} off your first Electric bike at Ozeco using my referral code: ${referralData.code}. Check out their amazing selection: https://ozeco.co.uk`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary text-primary-foreground">
              <Gift className="h-3 w-3 mr-1" />
              Referral Program
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-referral-title">
              Refer Friends, Earn Rewards
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share the joy of electric biking! Give your friends £20 off their first purchase, and earn rewards for every successful referral.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Share Your Code</h3>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral code with friends and family
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">They Save £20</h3>
                <p className="text-sm text-muted-foreground">
                  Your friends get £20 off their first Electric bike purchase
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Everyone Wins</h3>
                <p className="text-sm text-muted-foreground">
                  Help friends discover sustainable transportation
                </p>
              </CardContent>
            </Card>
          </div>

          {!referralData ? (
            <Card>
              <CardHeader>
                <CardTitle>Generate Your Referral Code</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateCode} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      We'll use this email to track your referrals
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createReferralMutation.isPending}
                    data-testid="button-generate-code"
                  >
                    {createReferralMutation.isPending ? "Generating..." : "Generate Referral Code"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Referral Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 bg-muted p-4 rounded-lg">
                        <code className="text-2xl font-bold text-primary" data-testid="text-referral-code">
                          {referralData.code}
                        </code>
                      </div>
                      <Button onClick={copyToClipboard} data-testid="button-copy-code">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Discount Value</p>
                        <p className="text-2xl font-bold text-primary">£{referralData.discountAmount}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Times Used</p>
                        <p className="text-2xl font-bold text-primary" data-testid="text-uses-count">
                          {referralData.uses}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      Share Your Code
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={shareOnFacebook}
                        variant="outline"
                        className="flex-col h-auto py-4"
                        data-testid="button-share-facebook"
                      >
                        <SiFacebook className="h-6 w-6 mb-2" />
                        <span className="text-xs">Facebook</span>
                      </Button>
                      <Button
                        onClick={shareOnTwitter}
                        variant="outline"
                        className="flex-col h-auto py-4"
                        data-testid="button-share-twitter"
                      >
                        <SiX className="h-6 w-6 mb-2" />
                        <span className="text-xs">Twitter</span>
                      </Button>
                      <Button
                        onClick={shareOnWhatsApp}
                        variant="outline"
                        className="flex-col h-auto py-4"
                        data-testid="button-share-whatsapp"
                      >
                        <SiWhatsapp className="h-6 w-6 mb-2" />
                        <span className="text-xs">WhatsApp</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How to Use Your Referral Code</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary">1.</span>
                      Share your code with friends interested in Electric bikes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary">2.</span>
                      They enter your code at checkout to get £{referralData.discountAmount} off
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary">3.</span>
                      Track your successful referrals on this page
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
