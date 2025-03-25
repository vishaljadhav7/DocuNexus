import { ArrowRight, Sparkles, Mail, Phone, Twitter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export default function Home() {
  const features = [
    { title: "Smart Analysis", desc: "AI-powered review in seconds", color: "from-blue-500 to-blue-600" },
    { title: "Risk Spotter", desc: "Find risks instantly", color: "from-green-500 to-green-600" },
    { title: "Time Saver", desc: "Cut review time by 90%", color: "from-purple-500 to-purple-600" },
  ];

  const stats = [
    { value: "10x", label: "Faster Reviews" },
    { value: "90%", label: "Time Saved" },
    { value: "5k+", label: "Happy Users" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <section className="py-16 md:py-24 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="container px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm mb-6 animate-in fade-in zoom-in-95">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">AI Contract Revolution</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            Transform Your Contracts <br /> with AI Magic
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Simplify reviews, spot risks, and save time with cutting-edge AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all">
              Start Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-all">
              See Demo
            </Button>
          </div>
        </div>
      </section>

     
      <section className="py-12 bg-white border-t border-b border-gray-100">
        <div className="container px-4 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    
      <section className="py-16 bg-white">
        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group relative overflow-hidden rounded-xl p-6 bg-white shadow-md hover:shadow-xl transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 relative z-10">{feature.title}</h3>
                <p className="text-gray-600 relative z-10">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section className="py-16 bg-gray-50">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">What Our Users Say</h2>
          <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
            <p className="text-gray-600 italic mb-4">This AI tool cut our contract review time in half and saved us thousands in legal fees!</p>
            <div className="font-semibold text-gray-900">Sarah M.</div>
            <div className="text-sm text-gray-500">Legal Operations Lead</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Simplify Your Contracts?</h2>
          <p className="text-lg opacity-90 mb-6">Join thousands of teams revolutionizing their workflow</p>
          <Link
           href={"/signup"}
          >
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-all">
            Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-300">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">AI Contracts</h3>
              <p className="text-sm">Revolutionizing contract management with AI technology.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> <span>support@aicontracts.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" /> <span>@AIContracts</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            &copy; {new Date().getFullYear()} AI Contracts. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}