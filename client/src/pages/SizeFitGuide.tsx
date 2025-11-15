import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ruler, Check, AlertCircle } from "lucide-react";

export default function SizeFitGuide() {
  const [selectedHeight, setSelectedHeight] = useState<string>("");

  const heightRanges = [
    { range: "4'10\" - 5'2\" (147-157cm)", size: "Small (14\"-16\")", bikes: ["Fiido D4S", "DYU models"] },
    { range: "5'2\" - 5'6\" (157-168cm)", size: "Small/Medium (16\"-18\")", bikes: ["Most folding e-bikes", "Eleglide M1 Plus"] },
    { range: "5'6\" - 5'10\" (168-178cm)", size: "Medium (18\"-20\")", bikes: ["Eleglide M2", "ENGWE Engine Pro", "Touroll H7"] },
    { range: "5'10\" - 6'2\" (178-188cm)", size: "Large (20\"-22\")", bikes: ["ENGWE EP-2 Pro", "Duotts models"] },
    { range: "6'2\" + (188cm+)", size: "Extra Large (22\"+)", bikes: ["ENGWE L20", "Fat tire models"] },
  ];

  const tips = [
    "Stand-over height: You should have 1-2 inches clearance when standing over the frame",
    "Saddle adjustment: Most e-bikes have adjustable seat posts for 4-6 inches of range",
    "Handlebar reach: You should be able to reach handlebars with a slight bend in elbows",
    "Test ride: If possible, test ride before purchasing to ensure comfort",
    "Folding bikes: Generally more size-flexible due to adjustable components",
  ];

  const getRecommendation = (height: string) => {
    const match = heightRanges.find(range => range.range === height);
    return match;
  };

  const recommendation = getRecommendation(selectedHeight);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary text-primary-foreground">
              <Ruler className="h-3 w-3 mr-1" />
              Sizing Guide
            </Badge>
            <h1 className="text-4xl font-display font-bold mb-4" data-testid="text-guide-title">
              Electric Bike Size & Fit Guide
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect Electric bike size for your height. Our interactive guide helps you choose the right frame size for maximum comfort and performance.
            </p>
          </div>

          {/* Interactive Height Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Select Your Height
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {heightRanges.map((range) => (
                  <Button
                    key={range.range}
                    variant={selectedHeight === range.range ? "default" : "outline"}
                    className="h-auto py-4 px-4 justify-start text-left"
                    onClick={() => setSelectedHeight(range.range)}
                    data-testid={`button-height-${range.range}`}
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="font-semibold">{range.range}</span>
                      <span className="text-sm opacity-80">{range.size}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {recommendation && (
                <div className="mt-6 p-6 bg-primary/10 border border-primary/20 rounded-lg" data-testid="recommendation-box">
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Recommended Frame Size</h3>
                      <p className="text-muted-foreground mb-3">
                        For your height ({recommendation.range}), we recommend: <strong className="text-foreground">{recommendation.size}</strong>
                      </p>
                      <div>
                        <p className="text-sm font-medium mb-2">Best E-Bike Models:</p>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.bikes.map((bike, index) => (
                            <Badge key={index} variant="secondary">{bike}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Size Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Complete Size Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Rider Height</th>
                      <th className="text-left py-3 px-4">Frame Size</th>
                      <th className="text-left py-3 px-4">Wheel Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heightRanges.map((range, index) => (
                      <tr key={index} className="border-b hover-elevate" data-testid={`row-size-${index}`}>
                        <td className="py-3 px-4 font-medium">{range.range}</td>
                        <td className="py-3 px-4">{range.size}</td>
                        <td className="py-3 px-4">
                          {index < 2 ? "20\" or smaller" : index < 4 ? "20\"-26\"" : "26\" or Fat tire"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Fitting Tips */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Fitting Tips for Electric Bikes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3" data-testid={`tip-${index}`}>
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Need Help Choosing?
                  </h3>
                  <p className="text-orange-800 dark:text-orange-200 text-sm mb-3">
                    These are general guidelines. Individual body proportions can vary. If you're between sizes or have questions about specific models, our team is here to help!
                  </p>
                  <p className="text-orange-800 dark:text-orange-200 text-sm">
                    <strong>Contact us:</strong> support@ozeco.co.uk or +44 7446 610660
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
