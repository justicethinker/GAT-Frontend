import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-900 border-gray-800 shadow-2xl relative overflow-hidden">
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900 opacity-75"></div>
          
          <CardContent className="pt-10 pb-8 text-center px-6">
            
            {/* Icon Circle */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
            </div>

            {/* Text Content */}
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">404</h1>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
            
            <p className="text-gray-500 mb-8 text-sm leading-relaxed max-w-xs mx-auto">
              The page you are looking for doesn't exist, has been moved, or you do not have permission to view it.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link href="/">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 h-11 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}