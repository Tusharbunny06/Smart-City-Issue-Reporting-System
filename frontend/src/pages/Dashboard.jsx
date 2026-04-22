import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchIssues = async () => {
      try {
        const { data } = await api.get('/issues');
        setIssues(data);
      } catch (error) {
        console.error('Failed to fetch issues', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [navigate]);

  if (loading) return <div className="text-center mt-20 text-xl font-semibold">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Role: <span className="uppercase font-semibold text-blue-600">{user?.role}</span></p>
        </div>
        {user?.role === 'citizen' && (
           <button 
             onClick={() => navigate('/report')}
             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium shadow-md transition-colors"
           >
             + Report New Issue
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.length === 0 ? (
          <p className="text-gray-500 italic col-span-full">No issues found.</p>
        ) : (
          issues.map(issue => (
            <div key={issue._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              {issue.imageUrl && (
                <div className="h-48 w-full bg-gray-100 overflow-hidden">
                  <img 
                    src={`http://localhost:5000${issue.imageUrl}`} 
                    alt={issue.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.status}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium capitalize">
                    {issue.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{issue.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{issue.description}</p>
                
                <div className="text-xs text-gray-500 flex flex-col space-y-1">
                  <span>Reported by: {issue.userId?.name || 'Unknown'}</span>
                  <span>Location: {issue.location?.lat ? `${issue.location.lat}, ${issue.location.lng}` : 'N/A'}</span>
                </div>
                
                {user?.role !== 'citizen' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                    <button className="text-sm bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded hover:bg-blue-100">Update Status</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
