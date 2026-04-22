import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, CheckCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-center max-w-3xl mt-12 bg-white rounded-2xl shadow-xl p-10 transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Report City Issues with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">SmartCity Fix</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Help us keep our city clean and safe. Report potholes, garbage dumping, broken streetlights, or water issues instantly. Track your reports and see them resolved by the city authorities.
        </p>
        <Link to="/login" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
          Get Started Now
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl">
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
          <AlertTriangle className="text-yellow-500 w-16 h-16 mb-4" />
          <h3 className="text-xl font-bold mb-2">1. Spot an Issue</h3>
          <p className="text-gray-600">Find something that needs fixing? Take a photo and get ready to post.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
          <MapPin className="text-blue-500 w-16 h-16 mb-4" />
          <h3 className="text-xl font-bold mb-2">2. Pin the Location</h3>
          <p className="text-gray-600">Provide the details and the exact spot so our workers can find it easily.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
          <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
          <h3 className="text-xl font-bold mb-2">3. See it Resolved</h3>
          <p className="text-gray-600">Track the progress of your issue from 'Pending' to 'Resolved'.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
