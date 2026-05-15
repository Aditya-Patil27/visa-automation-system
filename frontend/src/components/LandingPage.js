import React, { useState } from 'react';
import Button from './ui/Button';
import { L } from '../config/labels';

const LandingPage = ({ onLoginClick, onGetStartedClick }) => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 selection:bg-primary/30">
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Glow Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full -z-10"></div>
        <nav className="sticky top-0 z-50 border-b border-slate-200/10 bg-background-dark/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-background-dark font-bold">flight_takeoff</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">VisaFlow AI</span>
            </div>
            <div className="hidden md:flex items-center gap-10">
              <a className="text-sm font-medium text-slate-400 hover:text-primary transition-colors" href="#features">Features</a>
              <a className="text-sm font-medium text-slate-400 hover:text-primary transition-colors" href="#solutions">Solutions</a>
              <a className="text-sm font-medium text-slate-400 hover:text-primary transition-colors" href="#pricing">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onLoginClick}>{L.LOGIN}</Button>
              <Button onClick={onGetStartedClick}>{L.SIGNUP}</Button>
            </div>
          </div>
        </nav>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">v2.0 Now Live</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
                Automate Your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Global Journey</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                AI-powered visa eligibility, document automation, and embassy tracking for the modern traveler. Skip the paperwork, embrace the adventure.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" onClick={onGetStartedClick}>{L.START_ASSESSMENT}</Button>
                <Button variant="secondary" size="lg" icon="play_circle" onClick={() => setShowDemo(true)}>{L.WATCH_DEMO}</Button>
              </div>
              <div className="pt-10 space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em]">Trusted by 50,000+ Travelers</p>
                <div className="flex -space-x-3">
                  <img className="w-12 h-12 rounded-full border-4 border-background-dark object-cover" alt="User portrait" src="https://randomuser.me/api/portraits/women/44.jpg" />
                  <img className="w-12 h-12 rounded-full border-4 border-background-dark object-cover" alt="User portrait" src="https://randomuser.me/api/portraits/men/32.jpg" />
                  <img className="w-12 h-12 rounded-full border-4 border-background-dark object-cover" alt="User portrait" src="https://randomuser.me/api/portraits/women/68.jpg" />
                  <img className="w-12 h-12 rounded-full border-4 border-background-dark object-cover" alt="User portrait" src="https://randomuser.me/api/portraits/men/75.jpg" />
                  <div className="w-12 h-12 rounded-full border-4 border-background-dark bg-slate-800 flex items-center justify-center text-xs font-bold text-white">+12k</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl rounded-full"></div>
              <div className="relative glass rounded-3xl p-4 glow-accent">
                <img className="rounded-2xl w-full h-[500px] object-cover" alt="Airplane window view" src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=500&fit=crop&q=80" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent rounded-2xl"></div>
                <div className="absolute bottom-10 left-10 right-10 glass p-6 rounded-2xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-primary">Schengen Visa Status</span>
                    <span className="text-xs text-slate-400">Processing: 85%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[85%] rounded-full shadow-[0_0_10px_#0dccf2]"></div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-400 text-sm">verified</span>
                    <span className="text-xs text-slate-300">Biometric appointments confirmed for Berlin Embassy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="py-32 px-6" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-sm">Powerful Engine</h2>
              <p className="text-4xl lg:text-5xl font-black text-white leading-tight">Everything you need for seamless relocation</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="gradient-border group">
                <div className="gradient-border-inner p-8 flex flex-col h-full hover:bg-slate-900/40 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">AI Chatbot Assistant</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Instant answers to complex visa questions. Our AI is trained on thousands of embassy regulations worldwide.
                  </p>
                  <Button variant="ghost" href="#features" icon="arrow_forward" className="mt-auto">{L.EXPLORE_FEATURE}</Button>
                </div>
              </div>
              <div className="gradient-border group">
                <div className="gradient-border-inner p-8 flex flex-col h-full hover:bg-slate-900/40 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-secondary text-3xl">document_scanner</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Smart Document OCR</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Extract data from passports and IDs with 99.9% accuracy. Auto-fills your application forms in seconds.
                  </p>
                  <Button variant="ghost" href="#features" icon="arrow_forward" className="mt-auto">{L.EXPLORE_FEATURE}</Button>
                </div>
              </div>
              <div className="gradient-border group">
                <div className="gradient-border-inner p-8 flex flex-col h-full hover:bg-slate-900/40 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Real-time Tracking</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Live updates on your application status directly from embassy sources. Never miss a notification again.
                  </p>
                  <Button variant="ghost" href="#features" icon="arrow_forward" className="mt-auto">{L.EXPLORE_FEATURE}</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Stats Section */}
        <section className="py-20 border-y border-slate-200/5 bg-slate-900/20" id="solutions">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              <div>
                <p className="text-4xl font-black text-white mb-2">50k+</p>
                <p className="text-slate-500 font-medium">Global Travelers</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white mb-2">120+</p>
                <p className="text-slate-500 font-medium">Countries Supported</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white mb-2">99%</p>
                <p className="text-slate-500 font-medium">Accuracy Rate</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white mb-2">4.9/5</p>
                <p className="text-slate-500 font-medium">User Rating</p>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-32 px-6 overflow-hidden" id="pricing">
          <div className="max-w-7xl mx-auto">
            <div className="relative glass p-12 lg:p-20 rounded-[3rem] text-center space-y-8 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary/20 blur-[100px] rounded-full"></div>
              <h2 className="text-4xl lg:text-6xl font-black text-white max-w-3xl mx-auto leading-tight">
                Ready to start your <span className="text-primary italic">frictionless</span> journey?
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Join thousands of travelers who have streamlined their global mobility with VisaFlow AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button variant="primary" size="lg" onClick={onGetStartedClick} className="bg-white !text-background-dark hover:!bg-primary !shadow-2xl">{L.GET_EARLY_ACCESS}</Button>
                <Button variant="secondary" size="lg" onClick={() => window.location.href = 'mailto:support@visaflow.ai?subject=Sales%20Inquiry'}>{L.TALK_TO_SALES}</Button>
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="py-20 px-6 border-t border-slate-200/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-1 rounded-lg">
                    <span className="material-symbols-outlined text-background-dark text-sm font-bold">flight_takeoff</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">VisaFlow AI</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Making global borders invisible through the power of artificial intelligence.
                </p>
                <div className="flex gap-4">
                  <a className="text-slate-400 hover:text-primary transition-colors" href="/"><span className="material-symbols-outlined">public</span></a>
                  <a className="text-slate-400 hover:text-primary transition-colors" href="/"><span className="material-symbols-outlined">share</span></a>
                  <a className="text-slate-400 hover:text-primary transition-colors" href="/"><span className="material-symbols-outlined">alternate_email</span></a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Product</h4>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li><a className="hover:text-primary transition-colors" href="#features">Features</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#pricing">Pricing</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#solutions">Solutions</a></li>
                  <li><a className="hover:text-primary transition-colors" href="/">Documentation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Company</h4>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li><a className="hover:text-primary transition-colors" href="/">About Us</a></li>
                  <li><a className="hover:text-primary transition-colors" href="/">Blog</a></li>
                  <li><a className="hover:text-primary transition-colors" href="/">Careers</a></li>
                  <li><a className="hover:text-primary transition-colors" href="/">Press Kit</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Legal</h4>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li><a className="hover:text-primary transition-colors" href="/">Privacy Policy</a></li>
                  <li><a className="hover:text-primary transition-colors" href="/">Terms of Service</a></li>
                  <li><a className="hover:text-primary transition-colors" href="/">Cookie Policy</a></li>
                  <li><a className="hover:text-primary transition-colors" href="/">GDPR</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-200/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-600">
              <p>&copy; 2024 VisaFlow AI Inc. All rights reserved.</p>
              <div className="flex gap-8">
                <a className="hover:text-slate-400" href="/">Security</a>
                <a className="hover:text-slate-400" href="/">Status</a>
                <a className="hover:text-slate-400" href="/">Contact Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Demo Video Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowDemo(false)}>
          <div className="relative w-full max-w-4xl mx-4 bg-background-dark rounded-3xl border border-primary/20 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">play_circle</span>
                <h3 className="text-lg font-bold text-white">VisaFlow AI Demo</h3>
              </div>
              <Button variant="icon" icon="close" onClick={() => setShowDemo(false)} />
            </div>
            <div className="p-6">
              <video
                className="w-full rounded-xl border border-primary/10"
                controls
                autoPlay
                src="/demo-video.webm"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' fill='%231e293b'%3E%3Crect width='640' height='360'/%3E%3Ctext x='50%25' y='50%25' fill='%2364748b' text-anchor='middle' dy='.1em' font-family='sans-serif' font-size='20'%3EVisaFlow AI Demo%3C/text%3E%3C/svg%3E"
              >
                <source src="/demo-video.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
              <p className="text-center text-xs text-slate-500 mt-4">Watch how VisaFlow AI streamlines your entire visa application process.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
