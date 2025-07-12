import React, { useState, useEffect } from 'react';
import { Star, Package, RefreshCw, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import swapService from '../services/swapService';

const SwapHistory = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [swapHistory, setSwapHistory] = useState([]);
  const [stats, setStats] = useState({
    totalSwaps: 0,
    pointsEarned: 0,
    itemsSaved: 0,
    averageRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSwapHistory = async () => {
      try {
        setIsLoading(true);
        const response = await swapService.getUserSwapHistory();
        
        if (response.success) {
          setSwapHistory(response.data);
          setStats(response.stats);
        } else {
          toast.error('Failed to load swap history');
        }
      } catch (error) {
        console.error('Error fetching swap history:', error);
        toast.error('Failed to load swap history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSwapHistory();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <div className="bg-green-100 p-2 rounded-full"><RefreshCw className="h-5 w-5 text-green-600" /></div>;
      case 'pending':
        return <div className="bg-yellow-100 p-2 rounded-full"><Package className="h-5 w-5 text-yellow-600" /></div>;
      case 'rejected':
        return <div className="bg-red-100 p-2 rounded-full"><UserCheck className="h-5 w-5 text-red-600" /></div>;
      default:
        return <div className="bg-gray-100 p-2 rounded-full"><Package className="h-5 w-5 text-gray-600" /></div>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    return type === 'swap' 
      ? 'bg-purple-100 text-purple-800 border-purple-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-500">Not rated</span>;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const filteredHistory = swapHistory.filter(swap => {
    if (filterStatus !== 'all' && swap.status !== filterStatus) return false;
    if (filterType !== 'all' && swap.type !== filterType) return false;
    return true;
  });

  // Handle rating a swap
  const handleRateSwap = async (id, rating) => {
    try {
      const response = await swapService.rateSwap(id, rating);
      if (response.success) {
        toast.success('Rating submitted successfully');
        // Update the local state with the new rating
        setSwapHistory(prevHistory => 
          prevHistory.map(swap => 
            swap.id === id ? { ...swap, rating } : swap
          )
        );
      } else {
        toast.error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error rating swap:', error);
      toast.error('Failed to submit rating');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container-padding max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">Your Swap History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track all your fashion swaps and redemptions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-purple-100 dark:border-purple-900/30">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Swaps</h3>
            <p className="text-2xl font-bold mt-1 text-gradient">{stats.totalSwaps}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-purple-100 dark:border-purple-900/30">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Points Earned</h3>
            <p className="text-2xl font-bold mt-1 text-gradient">{stats.pointsEarned}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-purple-100 dark:border-purple-900/30">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Items Saved</h3>
            <p className="text-2xl font-bold mt-1 text-gradient">{stats.itemsSaved}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-purple-100 dark:border-purple-900/30">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Rating</h3>
            <div className="flex items-center mt-1">
              <p className="text-2xl font-bold text-gradient mr-2">{stats.averageRating}</p>
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Status Filter
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Type Filter
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="swap">Swaps</option>
              <option value="redeem">Redemptions</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Swap History List */}
            {filteredHistory.length > 0 ? (
              <div className="space-y-4">
                {filteredHistory.map((swap) => (
                  <div 
                    key={swap.id} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-purple-100 dark:border-purple-900/30"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {getStatusIcon(swap.status)}
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-grow">
                        {/* Status & Type Badges */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusColor(swap.status)}`}>
                            {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getTypeColor(swap.type)}`}>
                            {swap.type === 'swap' ? 'Swap' : 'Redemption'}
                          </span>
                        </div>
                        
                        {/* Swap Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {swap.itemGiven && (
                            <div className="flex gap-3 items-center">
                              <img 
                                src={swap.itemGiven.image} 
                                alt={swap.itemGiven.title} 
                                className="w-16 h-16 rounded-md object-cover bg-gray-100 dark:bg-gray-700"
                              />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">You gave</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{swap.itemGiven.title}</p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">{swap.itemGiven.points} points</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-3 items-center">
                            <img 
                              src={swap.itemReceived.image} 
                              alt={swap.itemReceived.title} 
                              className="w-16 h-16 rounded-md object-cover bg-gray-100 dark:bg-gray-700"
                            />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">You received</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{swap.itemReceived.title}</p>
                              <p className="text-sm text-purple-600 dark:text-purple-400">{swap.itemReceived.points} points</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{swap.partner}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(swap.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Rating */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                              {renderStars(swap.rating)}
                            </div>
                            
                            {swap.status === 'completed' && !swap.rating && (
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(r => (
                                  <button 
                                    key={r} 
                                    onClick={() => handleRateSwap(swap.id, r)}
                                    className="p-1 hover:text-yellow-400"
                                  >
                                    <Star className="h-5 w-5" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-purple-100 dark:border-purple-900/30">
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No swap history found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {filterStatus !== 'all' || filterType !== 'all' 
                    ? 'Try changing your filters to see more results' 
                    : 'Start swapping items to build your history'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SwapHistory;