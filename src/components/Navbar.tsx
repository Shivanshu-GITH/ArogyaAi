import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, User, Heart } from 'lucide-react';
import LoginModal from './LoginModal';
import { useLanguage, type Language } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown } from 'lucide-react';
import { getTranslation, languageNames } from '../utils/translations';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'nav.home', href: '/' },
    { name: 'nav.chatbots', href: '/chatbots' },
    { name: 'nav.findDoctors', href: '/find-doctors' },
    { name: 'nav.vaccination', href: '/vaccination' },
    { name: 'nav.whatsapp', href: '/whatsapp-sms' },
    { name: 'nav.about', href: '/about' },
    { name: 'nav.contact', href: '/contact' },
  ];

  const languageOptions: Array<{ code: Language; name: string }> = [
    { code: 'en', name: languageNames.en },
    { code: 'hi', name: languageNames.hi },
    { code: 'bn', name: languageNames.bn },
    { code: 'ta', name: languageNames.ta },
    { code: 'te', name: languageNames.te },
    { code: 'gu', name: languageNames.gu },
    { code: 'kn', name: languageNames.kn },
    { code: 'ml', name: languageNames.ml },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ArogyaAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {getTranslation(language, item.name)}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <Globe className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Auth Area */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[160px] truncate">{user?.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <div className="pb-3 mb-3 border-b">
                      <div className="text-sm font-semibold">{getTranslation(language, 'common.signedIn')}</div>
                      <div className="text-sm text-gray-600 break-all">{user?.email}</div>
                    </div>
                    <button onClick={logout} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">{getTranslation(language, 'common.logout')}</button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>{getTranslation(language, 'common.login')}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {getTranslation(language, item.name)}
              </Link>
            ))}
            
            <div className="px-3 py-2 space-y-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full appearance-none bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-semibold">{getTranslation(language, 'common.signedIn')}</div>
                    <div className="text-gray-600 break-all">{user?.email}</div>
                  </div>
                  <button onClick={logout} className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">{getTranslation(language, 'common.logout')}</button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>{getTranslation(language, 'common.login')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;