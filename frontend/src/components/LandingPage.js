import React from 'react';

const LandingPage = ({ onLoginClick, onGetStartedClick }) => {
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
              <button onClick={onLoginClick} className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">Log In</button>
              <button onClick={onGetStartedClick} className="px-6 py-2.5 bg-primary text-background-dark text-sm font-bold rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                Get Started
              </button>
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
                <button onClick={onGetStartedClick} className="px-8 py-4 bg-primary text-background-dark font-bold rounded-xl hover:scale-105 transition-transform shadow-xl shadow-primary/25">
                  Start Assessment
                </button>
                <button className="glass px-8 py-4 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span>
                  Watch Demo
                </button>
              </div>
              <div className="pt-10 space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em]">Trusted by 50,000+ Travelers</p>
                <div className="flex -space-x-3">
                  <img className="w-12 h-12 rounded-full border-4 border-background-dark object-cover" alt="User portrait smiling digital nomad" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeN3NRhc_cCxD6zVJRp--UesQdG2FAgdve4OPoJvOX00Hf6Ayo7VUH1ZzNkrQ-9qwRsBHigyph3clKbLJw3y44SQ2hD1D4n2mPnx8U706a2-dqehyCLoZ7F3sHGThgmNdJ-VGTHnI7Wml77FbBoGLXAA3KGkav4_cny-ZFmdEp9zJ_xK3c8oqjuqz66CzuB223wQ3-X0bwP7VO7wR4GbGIa3wwbTOdSD0afbacdBj5x8RAcwjfyrPSq0Js0jTfV8UuHuYLjehNxQlw" />
                  <img className="w-12 h-12 rounded-full border-4 border-background-dark object-cover" alt="User portrait professional business traveler" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdXl61DeyaPU1RjS2_jLSqYje5a9tuo3HN4r4AzjUIn09Yu9LgLIsAsCyKY_S6ZGxJVOD0FEqMy83Ou55sf6GJBHt4M_i5hpc7YcqJiWlOrWT88zq1wJcOGoZyTYwizIV4qZ1VQU17WigwfXiApBfaUmU-QmjYsOlBm3aSsUviIsCvJlWanpB5NFC2_bZzoGkuLYdWl6DfxISD_QVEaCV83SNf7oK7cWlV6rv597S8zukXKgVE1Zge7RLhEb9Hmqv07aZNPxohcsgj" />
                  <img className="w-12 h-12 rounded-full border-4 border-background-dark object-cover" alt="User portrait happy world traveler" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFrkYJAz0YkGug02Zv02hp9IGxv_1SWOLFUuTlMsqS8wIx7JqIIR9PaNZB1B4wkTDroCR8ixTJ7dSykWILJHampaHArNRGGHjb4dtgVB_tNR0mGRESp_6EilNTQwKZarMywhnvjiIugLkhAc2SblSepB2GfKYO2_pe1y6oDLjfuPdT-r8Z7Fkkg9Rxo8yw50jQHli92VdwZ0Wul-OOez2zarK7m2pz8Heb3eXUTKwWmDVkqSpBHWPQYVd4-_QxiV1ZM_t0MvXfPhdP" />
                  <img className="w-12 h-12 rounded-full border-4 border-background-dark object-cover" alt="User portrait young male traveler" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzItVoeyL8FWQcDiIXWwsVBk-q4kc06RIDMqcXF7bKmVzaNDpholFm5EFJvYS47sQ9aGg3osZydDECySzaEFsNAzB5QqVsJdwzKjJYDK6iwSf-D4-WkUskKysOmVfGuGKC5W9MMn501Pzte7ZS5aunxM8afKLlRjkQkjMJKG8F2DV0GAx8fSzXFswYyPvVMg-2S_6eik9WKPeCL5EiowiFTPRHEDJgaHlIFAK8-wOZJTSYPKSi9gSs6dZG1YRiGZ7zXwhiY0ZuizaX" />
                  <div className="w-12 h-12 rounded-full border-4 border-background-dark bg-slate-800 flex items-center justify-center text-xs font-bold text-white">+12k</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl rounded-full"></div>
              <div className="relative glass rounded-3xl p-4 glow-accent">
                <img className="rounded-2xl w-full h-[500px] object-cover opacity-80 mix-blend-luminosity" alt="Airplane window view" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARL1R5N7tNlRyoEmxsbmiKP-C9fqlo5IjBBFbg6ydgxPEbZTT3LUbKS0uQ30JJV5evCQzNTqrHR2T8bP9CZCxpVDqEBeBGeJc2g9Nt-FAXxjrZSc-Wt304Ak3bxTbzH5T_f3jdx2b4aoW9YMBUm2jumxCNr_ssHjhkN1tMrxlhXA-nMdekDguCaZr6uxvlvL9KHPu5aoX9pRUPjGAOH65bSwjyafpy4Cs8r-MD_u7oEbmCNf-50YMCVKqul8ZfYCZwiGxWxyZXi69O" />
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
                  <a className="mt-auto flex items-center gap-2 text-primary font-bold text-sm hover:gap-4 transition-all" href="#features">
                    Explore Feature <span className="material-symbols-outlined">arrow_forward</span>
                  </a>
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
                  <a className="mt-auto flex items-center gap-2 text-secondary font-bold text-sm hover:gap-4 transition-all" href="#features">
                    Explore Feature <span className="material-symbols-outlined">arrow_forward</span>
                  </a>
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
                  <a className="mt-auto flex items-center gap-2 text-primary font-bold text-sm hover:gap-4 transition-all" href="#features">
                    Explore Feature <span className="material-symbols-outlined">arrow_forward</span>
                  </a>
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
                <button className="w-full sm:w-auto px-10 py-5 bg-white text-background-dark font-black rounded-2xl hover:bg-primary transition-all shadow-2xl">
                  Get Early Access
                </button>
                <button className="w-full sm:w-auto px-10 py-5 glass text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                  Talk to Sales
                </button>
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
              <p>© 2024 VisaFlow AI Inc. All rights reserved.</p>
              <div className="flex gap-8">
                <a className="hover:text-slate-400" href="/">Security</a>
                <a className="hover:text-slate-400" href="/">Status</a>
                <a className="hover:text-slate-400" href="/">Contact Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
