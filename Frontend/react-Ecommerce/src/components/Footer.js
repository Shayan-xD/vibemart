import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    // Add your newsletter subscription logic here
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left animate-fadeIn">
              <h3 className="text-2xl font-bold text-white mb-2">
                Join Our Newsletter
              </h3>
              <p className="text-gray-400">
                Stay up to date with our latest products and deals!
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full md:w-auto animate-fadeUp">
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto md:mx-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="px-6 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-[#4B0082] transition-all duration-500"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-[#4B0082] text-white font-semibold
                    hover:bg-[#3B0062] transition-colors duration-500 hover:shadow-lg"
                >
                  Subscribe
                </button>
              </div>
              {subscribed && (
                <p className="text-green-400 text-sm mt-2 text-center sm:text-left animate-fadeIn">
                  Thank you for subscribing! 🎉
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="animate-fadeLeft">
            <h4 className="text-xl font-bold text-white mb-6">About Us</h4>
            <p className="text-gray-400 mb-6">
              We're dedicated to providing the best shopping experience with quality products 
              and exceptional customer service.
            </p>
            <div className="flex gap-4">
              {/* Social Icons */}
              {[
                { href: "#", svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                { href: "#", svg: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" },
                { href: "#", svg: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.535.223l.19-2.712 4.94-4.465c.215-.19-.047-.297-.332-.107l-6.107 3.844-2.625-.916c-.57-.182-.582-.57.12-.842l10.257-3.96c.474-.176.887.106.723.842z" },
                { href: "#", svg: "M12 0C5.374 0 0 5.374 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.626-5.374-12-12-12z" }
              ].map((icon, i) => (
                <a key={i} href={icon.href} className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-y-[-2px]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={icon.svg}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fadeRight">
            <h4 className="text-xl font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {["About Us","Contact","Terms & Conditions","Privacy Policy","FAQs"].map((link,i)=>(
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover:underline">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="animate-fadeUp">
            <h4 className="text-xl font-bold text-white mb-6">Customer Service</h4>
            <ul className="space-y-4">
              {["My Account","Track Order","Shipping Info","Returns","Help Center"].map((link,i)=>(
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover:underline">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fadeDown">
            <h4 className="text-xl font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#4B0082]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>123 Shopping Street, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#4B0082]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>support@example.com</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#4B0082]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>+1 234 567 890</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Your Company Name. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Payment Icons */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-8 object-contain"/>
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" className="h-8 object-contain"/>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8 object-contain"/>
          </div>
        </div>
      </div>

      {/* Tailwind Animations */}
      <style jsx>{`
        @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
        @keyframes fadeUp { from {opacity: 0; transform: translateY(20px);} to {opacity: 1; transform: translateY(0);} }
        @keyframes fadeDown { from {opacity: 0; transform: translateY(-20px);} to {opacity: 1; transform: translateY(0);} }
        @keyframes fadeLeft { from {opacity: 0; transform: translateX(-20px);} to {opacity: 1; transform: translateX(0);} }
        @keyframes fadeRight { from {opacity: 0; transform: translateX(20px);} to {opacity: 1; transform: translateX(0);} }

        .animate-fadeIn { animation: fadeIn 0.8s ease forwards; }
        .animate-fadeUp { animation: fadeUp 0.8s ease forwards; }
        .animate-fadeDown { animation: fadeDown 0.8s ease forwards; }
        .animate-fadeLeft { animation: fadeLeft 0.8s ease forwards; }
        .animate-fadeRight { animation: fadeRight 0.8s ease forwards; }
      `}</style>
    </footer>
  );
}
