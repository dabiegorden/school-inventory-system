"use client";

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, User, MessageSquare, Send, Clock, Building2, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    contactType: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        contactType: 'general'
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 2000);
  };

  const teamMembers = [
    {
      name: "Richard Ntori",
      id: "UGW 0202110330",
      role: "Project Lead & Backend Developer",
      email: "richard.ntori@student.cug.edu.gh",
      specialization: "Database Design & System Architecture",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Benieh Fordjour Nana",
      id: "UGW-0402111280",
      role: "Frontend Developer & UI/UX Designer",
      email: "benieh.fordjour@student.cug.edu.gh",
      specialization: "User Interface & Experience Design",
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Ramos Danso Gomez",
      id: "UGW-0202110326",
      role: "Systems Analyst & QA Engineer",
      email: "ramos.gomez@student.cug.edu.gh",
      specialization: "Testing & Quality Assurance",
      color: "green",
      gradient: "from-green-500 to-emerald-500"
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
              <span className="text-blue-300 font-medium text-sm">Get In Touch</span>
            </div>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg scale-110"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
                  <MessageSquare className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-100 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-300">
              Get in touch with our development team for the Inventory Management System for Amoaya Senior High School
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {["Catholic University of Ghana", "Sunyani-Fiapre", "Active Development", "Q2 2025 Launch"].map((tag, index) => (
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className={`bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:bg-gray-800/90 transition-all duration-500 group relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
               style={{ transitionDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <Send className="h-8 w-8 text-blue-400 mr-3 group-hover:text-blue-300 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-200 group-hover:text-gray-100 transition-colors duration-300">Send us a Message</h2>
                </div>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Have questions about our inventory management system? We'd love to hear from you.</p>
              </div>

              {submitted && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <p className="text-green-300 font-medium">Message sent successfully! We'll get back to you soon.</p>
                  </div>
                </div>
              )}
              <form>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-200 placeholder-gray-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-200 placeholder-gray-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Contact Type
                  </label>
                  <select
                    name="contactType"
                    value={formData.contactType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-200"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="collaboration">Project Collaboration</option>
                    <option value="demo">Request Demo</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-200 placeholder-gray-500"
                    placeholder="Brief subject of your message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Message *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical text-gray-200 placeholder-gray-500"
                      placeholder="Describe your inquiry in detail..."
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-semibold focus:ring-4 focus:ring-blue-200/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group/btn hover:scale-105 hover:shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        Send Message
                      </>
                    )}
                  </div>
                </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Institution Info */}
            <div className={`bg-gradient-to-br  bg-gray-700/50 border border-gray-600 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-semibold focus:ring-4 focus:ring-blue-200/20 duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:scale-105  group relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                 style={{ transitionDelay: '400ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <GraduationCap className="w-8 h-8 mr-3" />
                    <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
                  </div>
                  <h3 className="text-2xl font-bold">Institution Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start group/item hover:translate-x-2 transition-transform duration-300">
                    <Building2 className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Catholic University of Ghana</p>
                      <p className="text-blue-100">Sunyani-Fiapre Campus</p>
                    </div>
                  </div>
                  <div className="flex items-start group/item hover:translate-x-2 transition-transform duration-300">
                    <MapPin className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Project Location</p>
                      <p className="text-blue-100">Amoaya Senior High School</p>
                    </div>
                  </div>
                  <div className="flex items-start group/item hover:translate-x-2 transition-transform duration-300">
                    <Clock className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Response Time</p>
                      <p className="text-blue-100">Within 24-48 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className={`bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:bg-gray-800/90 transition-all duration-500 group relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                 style={{ transitionDelay: '500ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-200 mb-6 group-hover:text-gray-100 transition-colors duration-300">Alternative Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 hover:scale-105 transition-all duration-300 group/contact">
                    <Mail className="w-6 h-6 text-blue-400 mr-4 group-hover/contact:text-blue-300 transition-colors duration-300" />
                    <div>
                      <p className="font-semibold text-gray-200 group-hover/contact:text-gray-100 transition-colors duration-300">Project Email</p>
                      <p className="text-gray-400 group-hover/contact:text-gray-300 transition-colors duration-300">inventory.project@cug.edu.gh</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 hover:scale-105 transition-all duration-300 group/contact">
                    <Phone className="w-6 h-6 text-blue-400 mr-4 group-hover/contact:text-blue-300 transition-colors duration-300" />
                    <div>
                      <p className="font-semibold text-gray-200 group-hover/contact:text-gray-100 transition-colors duration-300">University Contact</p>
                      <p className="text-gray-400 group-hover/contact:text-gray-300 transition-colors duration-300">+233 (0) 352 093 104</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Status */}
            <div className={`bg-gradient-to-br bg-gray-700/50 border border-gray-600 backdrop-blur-sm text-white rounded-2xl p-8 shadow-xl  hover:shadow-2xl hover:scale-105 transition-all duration-500 group relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                 style={{ transitionDelay: '600ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Project Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center group/status hover:translate-x-2 transition-transform duration-300">
                    <span>Development Phase</span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">Active</span>
                  </div>
                  <div className="flex justify-between items-center group/status hover:translate-x-2 transition-transform duration-300">
                    <span>Testing Phase</span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">In Progress</span>
                  </div>
                  <div className="flex justify-between items-center group/status hover:translate-x-2 transition-transform duration-300">
                    <span>Expected Completion</span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">Q2 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="mt-20">
          <div className={`text-center mb-12 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-100 to-purple-300 bg-clip-text text-transparent">
                Development Team
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Meet the talented students behind the Inventory Management System project
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className={`bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:bg-gray-800/90 hover:scale-105 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                   style={{ transitionDelay: `${1000 + index * 100}ms` }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                      <div className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500 ${
                        member.color === 'blue' ? 'bg-blue-400' :
                        member.color === 'purple' ? 'bg-purple-400' :
                        'bg-green-400'
                      }`}></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-200 mb-2 group-hover:text-gray-100 transition-colors duration-300">{member.name}</h3>
                    <p className={`font-semibold mb-1 transition-colors duration-300 ${
                      member.color === 'blue' ? 'text-blue-400 group-hover:text-blue-300' :
                      member.color === 'purple' ? 'text-purple-400 group-hover:text-purple-300' :
                      'text-green-400 group-hover:text-green-300'
                    }`}>{member.role}</p>
                    <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-300">{member.id}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-center group/email hover:translate-x-2 transition-transform duration-300">
                      <Mail className="w-4 h-4 text-gray-500 mr-2 group-hover/email:text-gray-400 transition-colors duration-300" />
                      <a href={`mailto:${member.email}`} className={`text-sm hover:underline transition-colors duration-300 ${
                        member.color === 'blue' ? 'text-blue-400 hover:text-blue-300' :
                        member.color === 'purple' ? 'text-purple-400 hover:text-purple-300' :
                        'text-green-400 hover:text-green-300'
                      }`}>
                        {member.email}
                      </a>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-400 mb-1 group-hover:text-gray-300 transition-colors duration-300">Specialization:</p>
                      <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">{member.specialization}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                  <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700 rounded-2xl p-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-200 mb-4 group-hover:text-gray-100 transition-colors duration-300">About This Project</h3>
              <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                This Inventory Management System is being developed as part of our academic project at Catholic University of Ghana. 
                The system aims to streamline inventory processes for Amoaya Senior High School, ensuring efficient stock management 
                and improved educational resource allocation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}