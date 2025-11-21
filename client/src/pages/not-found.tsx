import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 shadow-2xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
        
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
          
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            The page you are looking for doesn't exist or has been moved. <br/>
            Check the URL or go back to the dashboard.
          </p>

          <Link href="/">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 rounded-lg transition-all active:scale-95">
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}