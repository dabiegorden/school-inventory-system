import React from 'react'

const Navbar = () => {
  return (
    <nav>
        <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className={`flex justify-between items-center py-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="flex items-center group">
                      <div className="relative">
                        <BookOpen className="h-8 w-8 text-blue-600 mr-3 transition-all duration-300 group-hover:text-blue-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          SIM
                        </h1>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {["Home", "About", "Contact"].map((item, index) => (
                        <Link 
                          key={item}
                          href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                          className={`text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium relative group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                          style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                        >
                          {item}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                      ))}
                      <Link href="/login">
                        <Button 
                          variant="outline" 
                          className={`border-2 border-blue-200 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:border-transparent hover:shadow-lg hover:scale-105 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                          style={{ transitionDelay: '400ms' }}
                        >
                          Login
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
        </header>
    </nav>
  )
}

export default Navbar