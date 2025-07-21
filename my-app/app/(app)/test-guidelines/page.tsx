import { getCurrentUser } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw } from "lucide-react";
import { CustomGuidelinesService } from "@/lib/ai/customGuidelines";

export default async function TestGuidelinesPage() {
  const user = await getCurrentUser();
  if (user.role !== 'admin' && user.role !== 'teacher') {
    redirect('/unauthorized');
  }

  // Reset and reinitialize guidelines for testing
  CustomGuidelinesService.resetGuidelines();
  CustomGuidelinesService.initializeDefaultGuidelines();

  const guidelines = CustomGuidelinesService.getActiveGuidelines();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guidelines Test Page</h1>
          <p className="text-gray-600 mt-2">
            Testing the guidelines system to ensure no duplicate keys.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Guidelines Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Guideline IDs:</h3>
                <div className="space-y-1">
                  {guidelines.map((guideline, index) => (
                    <div key={`${guideline._id}_${index}`} className="text-sm">
                      {index + 1}. {guideline.name} - ID: {guideline._id}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Unique IDs Check:</h3>
                <div className="text-sm">
                  {(() => {
                    const ids = guidelines.map(g => g._id);
                    const uniqueIds = new Set(ids);
                    const isUnique = ids.length === uniqueIds.size;
                    return (
                      <div className={`p-2 rounded ${isUnique ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isUnique ? '✅ All IDs are unique' : '❌ Duplicate IDs found'}
                        <br />
                        Total guidelines: {ids.length}
                        <br />
                        Unique IDs: {uniqueIds.size}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Test Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 