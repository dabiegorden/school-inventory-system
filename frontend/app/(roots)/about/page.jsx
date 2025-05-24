"use client";
import React from 'react';

import { Package, Users, BarChart3, Shield, Clock, CheckCircle, Target, Zap, Database, Globe, Settings, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Package,
      title: "Real-time Inventory Tracking",
      description: "Monitor stock levels, track item locations, and get instant updates on inventory changes across your school.",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Multi-User Access Control",
      description: "Role-based access for administrators, teachers, and students with customized permissions and secure authentication.",
      color: "green",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Comprehensive Reporting",
      description: "Generate detailed reports for inventory analysis, usage patterns, and decision-making support.",
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Request Management",
      description: "Students and staff can easily request items through the system with approval workflows and tracking.",
      color: "orange",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Built with enterprise-grade security measures including encrypted data storage and secure user authentication.",
      color: "indigo",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: CheckCircle,
      title: "Automated Alerts",
      description: "Get notified when stock runs low, items need maintenance, or requests require approval.",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Cost Reduction",
      description: "Minimize waste, reduce overstocking, and optimize procurement through data-driven insights.",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Improved Efficiency",
      description: "Streamline inventory processes, reduce manual work, and save valuable time for staff.",
      color: "green",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Target,
      title: "Better Decision Making",
      description: "Access real-time data and analytics to make informed inventory and budget decisions.",
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "Enhanced Transparency",
      description: "Provide stakeholders with clear visibility into inventory status and usage patterns.",
      color: "orange",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const capabilities = [
    "Track and manage all school inventory items",
    "Monitor stock levels with automatic low-stock alerts",
    "Handle student and staff item requests efficiently",
    "Generate comprehensive inventory reports",
    "Manage user access with role-based permissions",
    "Track item distributions and returns",
    "Maintain detailed audit trails",
    "Support for multiple item categories and locations"
  ];

  const problems = [
    {
      icon: "!",
      title: "Stock Shortages",
      description: "Prevent lost sales and disappointed users due to unexpected stockouts.",
      color: "red"
    },
    {
      icon: "⚠",
      title: "Manual Errors",
      description: "Eliminate time-consuming, error-prone manual tracking processes.",
      color: "orange"
    },
    {
      icon: "📊",
      title: "Data Inaccuracy",
      description: "Ensure accurate tracking and prevent losses from theft or damage.",
      color: "yellow"
    },
    {
      icon: "🔍",
      title: "Poor Visibility",
      description: "Know exactly where equipment is, who's using it, and its condition.",
      color: "blue"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800/90 via-gray-800/80 to-gray-900/90 backdrop-blur-lg border-b border-gray-700 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-gray-700">
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-blue-300 font-medium text-sm">About Our System</span>
            </div>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg scale-110"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
                  <Package className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-100 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Smart Inventory Management
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-300">
              A comprehensive digital solution designed specifically for educational institutions 
              to streamline inventory management, reduce costs, and improve operational efficiency.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {["Real-time Tracking", "Automated Reporting", "Multi-user Access", "Secure & Reliable"].map((tag, index) => (
                <span 
                  key={tag}
                  className={`bg-gray-800/60 backdrop-blur-sm border border-gray-600 px-4 py-2 rounded-full text-gray-300 hover:bg-gray-700/60 hover:text-blue-300 transition-all duration-300 hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* What We Solve */}
        <section className="py-16">
          <div className={`text-center mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-100 to-blue-300 bg-clip-text text-transparent">
                What Problems We Solve
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Traditional inventory management in schools faces numerous challenges. Our system addresses these core issues.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, index) => (
              <div 
                key={problem.title}
                className={`bg-gray-800/70 backdrop-blur-sm border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-800/90 hover:scale-105 hover:-translate-y-2 transition-all duration-500 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  problem.color === 'red' ? 'bg-red-500/20 border border-red-500/30' :
                  problem.color === 'orange' ? 'bg-orange-500/20 border border-orange-500/30' :
                  problem.color === 'yellow' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                  'bg-blue-500/20 border border-blue-500/30'
                }`}>
                  <span className={`font-bold text-xl ${
                    problem.color === 'red' ? 'text-red-400' :
                    problem.color === 'orange' ? 'text-orange-400' :
                    problem.color === 'yellow' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {problem.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-200 mb-2 group-hover:text-gray-100 transition-colors duration-300">{problem.title}</h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">{problem.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16">
          <div className={`text-center mb-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-100 to-purple-300 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our system is packed with features designed to make inventory management effortless and efficient.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className={`bg-gray-800/70 backdrop-blur-sm border border-gray-700 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-800/90 hover:scale-105 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    <div className="relative w-16 h-16 mb-6">
                      <Icon className={`h-16 w-16 transition-all duration-500 group-hover:scale-110 ${
                        feature.color === 'blue' ? 'text-blue-400 group-hover:text-blue-300' :
                        feature.color === 'green' ? 'text-green-400 group-hover:text-green-300' :
                        feature.color === 'purple' ? 'text-purple-400 group-hover:text-purple-300' :
                        feature.color === 'orange' ? 'text-orange-400 group-hover:text-orange-300' :
                        feature.color === 'indigo' ? 'text-indigo-400 group-hover:text-indigo-300' :
                        'text-emerald-400 group-hover:text-emerald-300'
                      }`} />
                      <div className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500 ${
                        feature.color === 'blue' ? 'bg-blue-400' :
                        feature.color === 'green' ? 'bg-green-400' :
                        feature.color === 'purple' ? 'bg-purple-400' :
                        feature.color === 'orange' ? 'bg-orange-400' :
                        feature.color === 'indigo' ? 'bg-indigo-400' :
                        'bg-emerald-400'
                      }`}></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4 group-hover:text-gray-100 transition-colors duration-300">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
                  </div>
                  {hoveredFeature === index && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                      <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* System Capabilities */}
        <section className="py-16">
          <div className={`bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700 rounded-2xl p-12 relative overflow-hidden transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="text-center mb-12">
                <div className="relative inline-block mb-6">
                  <Database className="h-16 w-16 mx-auto text-blue-400" />
                  <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 blur-xl scale-110"></div>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    System Capabilities
                  </span>
                </h2>
                <p className="text-xl text-blue-200">
                  Comprehensive inventory management tailored for educational institutions
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0 group-hover:text-green-300 transition-colors duration-300" />
                    <p className="text-blue-100 group-hover:text-blue-50 transition-colors duration-300">{capability}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className={`text-center mb-12 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-100 to-green-300 bg-clip-text text-transparent">
                Why Choose Our System
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience tangible benefits that improve your school's operations and bottom line.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={benefit.title}
                  className={`bg-gray-800/70 backdrop-blur-sm border border-gray-700 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-800/90 hover:scale-105 transition-all duration-500 group relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${1200 + index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Icon className={`h-16 w-16 transition-all duration-500 group-hover:scale-110 ${
                        benefit.color === 'blue' ? 'text-blue-400 group-hover:text-blue-300' :
                        benefit.color === 'green' ? 'text-green-400 group-hover:text-green-300' :
                        benefit.color === 'purple' ? 'text-purple-400 group-hover:text-purple-300' :
                        'text-orange-400 group-hover:text-orange-300'
                      }`} />
                      <div className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500 ${
                        benefit.color === 'blue' ? 'bg-blue-400' :
                        benefit.color === 'green' ? 'bg-green-400' :
                        benefit.color === 'purple' ? 'bg-purple-400' :
                        'bg-orange-400'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-200 mb-3 group-hover:text-gray-100 transition-colors duration-300">{benefit.title}</h3>
                      <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Technology & Security */}
        <section className="py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className={`bg-gray-800/70 backdrop-blur-sm border border-gray-700 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-800/90 transition-all duration-500 group relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                 style={{ transitionDelay: '1600ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <Settings className="h-8 w-8 text-blue-400 mr-3 group-hover:text-blue-300 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-200 group-hover:text-gray-100 transition-colors duration-300">Built with Modern Technology</h2>
                </div>
                <div className="space-y-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  <p>
                    Our system is built using cutting-edge technologies and frameworks to ensure 
                    reliability, scalability, and performance. We leverage modern programming 
                    languages and robust databases to deliver a seamless user experience.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {[
                      { title: "Frontend", desc: "Modern, responsive user interface", color: "blue" },
                      { title: "Backend", desc: "Robust server architecture", color: "green" },
                      { title: "Database", desc: "Secure data management", color: "purple" },
                      { title: "Security", desc: "Enterprise-grade protection", color: "orange" }
                    ].map((tech, index) => (
                      <div 
                        key={tech.title}
                        className={`bg-gray-700/50 border border-gray-600 p-4 rounded-lg hover:bg-gray-700/70 hover:scale-105 transition-all duration-300 group/tech ${
                          tech.color === 'blue' ? 'hover:border-blue-500/50' :
                          tech.color === 'green' ? 'hover:border-green-500/50' :
                          tech.color === 'purple' ? 'hover:border-purple-500/50' :
                          'hover:border-orange-500/50'
                        }`}
                      >
                        <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                          tech.color === 'blue' ? 'text-blue-300 group-hover/tech:text-blue-200' :
                          tech.color === 'green' ? 'text-green-300 group-hover/tech:text-green-200' :
                          tech.color === 'purple' ? 'text-purple-300 group-hover/tech:text-purple-200' :
                          'text-orange-300 group-hover/tech:text-orange-200'
                        }`}>{tech.title}</h4>
                        <p className="text-sm text-gray-400 group-hover/tech:text-gray-300 transition-colors duration-300">{tech.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-gray-800/70 backdrop-blur-sm border border-gray-700 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-800/90 transition-all duration-500 group relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                 style={{ transitionDelay: '1700ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <Shield className="h-8 w-8 text-green-400 mr-3 group-hover:text-green-300 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-200 group-hover:text-gray-100 transition-colors duration-300">Security & Reliability</h2>
                </div>
                <div className="space-y-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  <p>
                    Security is at the core of our system design. We implement multiple layers 
                    of protection to ensure your data is safe and your operations remain secure.
                  </p>
                  <div className="space-y-3 mt-6">
                    {[
                      "Encrypted password storage with bcrypt",
                      "Role-based access control",
                      "Secure session management",
                      "Protection against common vulnerabilities",
                      "Regular security testing"
                    ].map((security, index) => (
                      <div key={index} className="flex items-center space-x-3 group/item hover:translate-x-2 transition-transform duration-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full group-hover/item:bg-green-300 transition-colors duration-300"></div>
                        <span className="text-sm text-gray-400 group-hover/item:text-gray-300 transition-colors duration-300">{security}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className={`py-16 transition-all duration-1000 delay-1800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700 rounded-2xl p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  Ready to Transform Your Inventory Management?
                </span>
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
                Join educational institutions that have already improved their operations with our 
                comprehensive inventory management system.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 group/btn relative overflow-hidden">
                  <Link href="/register" className="relative z-10 flex items-center gap-2">
                    Get Started Today
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}