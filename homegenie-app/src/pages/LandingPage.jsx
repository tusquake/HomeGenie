import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Zap, Shield, BarChart3, Users, Clock, Heart, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { API_BASE_USER } from '../utils/constants';
import EfficiencyMetrics from '../components/EfficiencyMetrics';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [metrics, setMetrics] = useState({ users: 0, requests: 0, resolved: 0, time: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // fetch real metrics (unique visitors) periodically
    const fetchMetrics = async () => {
      try {
        // record this visit (server will dedupe by IP)
        await fetch(`${API_BASE_USER}/visits`, { method: 'POST' });
        const res = await fetch(`${API_BASE_USER}/visits/unique`);
        if (!res.ok) return;
        const data = await res.json();
        setMetrics(prev => ({ ...prev, users: data.uniqueVisitors || prev.users }));
      } catch (err) {
        // keep previous values
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const solutions = [
    { icon: Zap, title: 'Smart Automation', desc: 'Automate home devices with AI-powered controls' },
    { icon: Shield, title: 'Security First', desc: 'Advanced security monitoring and alerts' },
    { icon: BarChart3, title: 'Analytics', desc: 'Real-time insights and performance metrics' },
    { icon: Users, title: 'Multi-User', desc: 'Manage multiple residents and technicians' },
    { icon: Clock, title: '24/7 Support', desc: 'Continuous monitoring and support system' },
    { icon: Heart, title: 'Health Tracking', desc: 'Monitor resident wellness and safety' }
  ];

  const features = [
    { title: 'For Administrators', desc: 'Manage the entire system with comprehensive dashboards and controls' },
    { title: 'For Residents', desc: 'Control your home environment and request maintenance easily' },
    { title: 'For Technicians', desc: 'Track, manage and complete service requests efficiently' }
  ];

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300 relative">
        <div className="relative z-10">
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/logo_homeginie.png" alt="HomeGenie" className="w-10 h-10 rounded-lg shadow-sm object-contain" onClick={() => navigate('/')} />
                <span className="hidden sm:inline font-bold text-xl text-gray-900 dark:text-white">HomeGenie</span>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden z-0 pt-24 sm:pt-32">
            {/* Smooth Zooming Background Image */}
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.35 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 -z-20 pointer-events-none w-full h-full"
            >
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url('/background.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900 dark:from-slate-950/80 dark:to-slate-950" />
            </motion.div>

            {/* Content Container */}
            <div className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/10 border border-slate-200/20 backdrop-blur-md mb-8">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Intelligent Living Evolved</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-8"
              >
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-500">HomeGenie</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl sm:text-2xl text-slate-700 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
              >
                Transform your living space into an intelligent, responsive home that seamlessly learns and adapts to your lifestyle.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <button
                  onClick={() => navigate('/login')}
                  className="group relative inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Create Request</span>
                  <div className="absolute inset-0 h-full w-full scale-0 rounded-full bg-blue-500 transition-all duration-300 group-hover:scale-100 dark:group-hover:bg-blue-500/50"></div>
                </button>
              </motion.div>

            </div>
          </section>

          {/* Solutions Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-blue-50/50 dark:via-slate-900/50 to-transparent">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                What We Provide
              </h2>
              <p className="text-center text-gray-700 dark:text-gray-300 mb-12 text-lg max-w-2xl mx-auto">
                Comprehensive smart home solutions designed for modern living
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solutions.map((solution, idx) => {
                  const Icon = solution.icon;
                  return (
                    <div
                      key={idx}
                      className="group bg-white dark:bg-slate-800 p-8 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-yellow-500 hover:shadow-lg dark:hover:shadow-yellow-500/20 transition-all duration-300 hover:-translate-y-2"
                    >
                      <div className="inline-block p-3 bg-gradient-to-br from-blue-100 dark:from-blue-900/30 to-yellow-100 dark:to-yellow-900/30 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{solution.title}</h3>
                      <p className="text-gray-700 dark:text-gray-400">{solution.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Efficiency Metrics */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                Automating the Future
              </h2>
              <EfficiencyMetrics />
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                Why Choose HomeGenie?
              </h2>
              <p className="text-center text-gray-700 dark:text-gray-300 mb-12 text-lg">
                Experience the future of smart living today
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="relative p-8 bg-gradient-to-br from-blue-50 dark:from-slate-800 to-yellow-50 dark:to-slate-900 rounded-xl border border-blue-200 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-blue-500/10 transition-all">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-yellow-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {idx + 1}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white mt-4">{feature.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Metrics Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-blue-500 to-yellow-400 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
              <h2 className="text-4xl font-bold text-center mb-4 text-white">
                Our Impact
              </h2>
              <p className="text-center text-blue-100 mb-12 text-lg">
                Real-time metrics of how we're transforming smart homes
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-8 hover:bg-white/30 transition-all">
                    <Users className="w-12 h-12 text-white mx-auto mb-4" />
                    <p className="text-5xl font-bold text-white mb-2">{metrics.users.toLocaleString()}</p>
                    <p className="text-blue-100 text-lg font-semibold">Active Users</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-8 hover:bg-white/30 transition-all">
                    <Zap className="w-12 h-12 text-white mx-auto mb-4" />
                    <p className="text-5xl font-bold text-white mb-2">{metrics.requests.toLocaleString()}</p>
                    <p className="text-blue-100 text-lg font-semibold">Total Requests</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-8 hover:bg-white/30 transition-all">
                    <Shield className="w-12 h-12 text-white mx-auto mb-4" />
                    <p className="text-5xl font-bold text-white mb-2">{metrics.resolved.toLocaleString()}</p>
                    <p className="text-blue-100 text-lg font-semibold">Resolved Issues</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-8 hover:bg-white/30 transition-all">
                    <Clock className="w-12 h-12 text-white mx-auto mb-4" />
                    <p className="text-5xl font-bold text-white mb-2">{metrics.time}</p>
                    <p className="text-blue-100 text-lg font-semibold">Hours of Service</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Our Story Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                Our Story
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="text-lg leading-relaxed">
                    HomeGenie was born from a simple idea: <span className="font-semibold text-blue-600 dark:text-blue-400">everyone deserves a smart, safe, and comfortable home</span>.
                  </p>
                  <p className="text-lg leading-relaxed">
                    We started by understanding the challenges faced by residents, administrators, and technicians in managing smart home systems. Our mission is to bridge the gap between complex technology and everyday living.
                  </p>
                  <p className="text-lg leading-relaxed font-semibold text-blue-600 dark:text-blue-400">
                    Join us in building the future of smart living.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 dark:from-slate-800 to-yellow-50 dark:to-slate-900 rounded-2xl p-8 border border-blue-200 dark:border-slate-700">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Heart className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Our Mission</h4>
                        <p className="text-gray-700 dark:text-gray-300">Empower every household with intelligent, accessible smart home technology</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Our Vision</h4>
                        <p className="text-gray-700 dark:text-gray-300">A world where technology enhances quality of life for residents and simplifies operations for administrators</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Zap className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Our Passion</h4>
                        <p className="text-gray-700 dark:text-gray-300">Innovation, reliability, and customer satisfaction in every interaction</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Book a Demo Section */}
          <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-blue-50/50 dark:via-slate-900/50 to-transparent">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                Book a Demo
              </h2>
              <p className="text-center text-gray-700 dark:text-gray-300 mb-12 text-lg max-w-2xl mx-auto">
                Discover how HomeGenie can transform your property management experience. Schedule a personalized walkthrough with our team.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Tailored Walkthrough</h3>
                      <p className="text-gray-700 dark:text-gray-400">
                        Get a detailed 30-minute demonstration tailored exactly to your property scale and resident needs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Q&A Session</h3>
                      <p className="text-gray-700 dark:text-gray-400">
                        Chat directly with our product experts to ask specific operational questions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-gray-200 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-6 text-xl">Schedule Your Demo</h3>
                  <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const name = form.name.value.trim();
                    const email = form.email.value.trim();
                    const datetime = form.datetime.value.trim();
                    const message = form.message.value.trim();
                    if (!name || !email || !datetime) return toast.error('Please fill required fields (Name, Email, Date/Time)');

                    try {
                      const response = await fetch(`${API_BASE_USER}/notifications/demo`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, datetime, message })
                      });

                      if (!response.ok) {
                        toast.error('Failed to schedule demo. Please try again later.');
                        return;
                      }

                      toast.success('Demo scheduled successfully! Check your email for confirmation.');
                      form.reset();
                    } catch (err) {
                      toast.error('A network error occurred.');
                    }
                  }}>
                    <div className="space-y-4">
                      <input name="name" type="text" placeholder="Your Name *" required className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input name="email" type="email" placeholder="Work Email *" required className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input name="datetime" type="datetime-local" required className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <textarea name="message" placeholder="Tell us about your property (optional)" rows="3" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg mt-2">Book Demo</button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-700 dark:text-gray-400">
                © 2026 HomeGenie. All rights reserved. Transforming homes, enhancing lives.
              </p>
              <div className="flex gap-6">
                <button onClick={() => navigate('/privacy')} className="text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</button>
                <button onClick={() => navigate('/terms')} className="text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</button>
                {/* <a href="#" className="text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support</a> */}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
