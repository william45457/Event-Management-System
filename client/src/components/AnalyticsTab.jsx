import React, { useState } from 'react';

const AnalyticsTab = ({ events = [], bookings = [], userRole }) => {
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    // Dynamic calculations
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.eventId?.price || 0), 0);
    const ticketsSold = bookings.length;
    const totalEvents = events.length;
    
    // Generate dynamic activity list from real data
    const dynamicActivities = [];
    
    // Sort bookings and events by date to merge into activity stream
    const sortedBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const sortedEvents = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    sortedBookings.slice(0, 5).forEach(b => {
        dynamicActivities.push({
            time: new Date(b.createdAt).toLocaleTimeString() + ' ' + new Date(b.createdAt).toLocaleDateString(),
            text: `${b.userId?.name || 'A user'} booked ticket for "${b.eventId?.title || 'Event'}"`,
            type: 'booking'
        });
    });

    sortedEvents.slice(0, 5).forEach(e => {
        dynamicActivities.push({
            time: new Date(e.createdAt).toLocaleTimeString() + ' ' + new Date(e.createdAt).toLocaleDateString(),
            text: `Event "${e.title}" was created.`,
            type: 'event'
        });
    });

    // Default mock activities if no real database activities exist yet
    const displayActivities = dynamicActivities.length > 0 ? dynamicActivities : [
        { time: 'Just now', text: 'No live bookings or events recorded yet.', type: 'alert' }
    ];

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">${totalRevenue}</p>
                    <p className="text-xs text-green-500 mt-2 flex items-center">
                        <span className="font-bold mr-1">Live Database</span> revenue
                    </p>
                </div>
                <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tickets Sold</p>
                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">{ticketsSold}</p>
                    <p className="text-xs text-green-500 mt-2 flex items-center">
                        <span className="font-bold mr-1">Live Database</span> bookings
                    </p>
                </div>
                <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Events</p>
                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">{totalEvents}</p>
                    <p className="text-xs text-green-500 mt-2 flex items-center">
                        <span className="font-bold mr-1">Live Database</span> events
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CSS Bar Chart */}
                <div className="lg:col-span-2 glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-dark dark:text-white mb-6">Event Categories Distribution</h2>
                    <div className="flex items-end justify-between h-64 space-x-2 pt-6">
                        {['Tech', 'Business', 'Entertainment', 'General'].map((cat, i) => {
                            const count = events.filter(e => e.category === cat).length;
                            const percentage = events.length > 0 ? (count / events.length) * 100 : 25;
                            return (
                                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                    <div className="w-full h-full relative flex justify-center items-end group-hover:opacity-80 transition-opacity">
                                        <div 
                                            className="w-full max-w-[40px] bg-primary rounded-t-md relative transition-all duration-500 flex items-center justify-center text-xs font-bold text-white pb-2" 
                                            style={{ height: `${Math.max(percentage, 10)}%` }}
                                        >
                                            {count}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-semibold">{cat}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700 flex flex-col">
                    <h2 className="text-lg font-bold text-dark dark:text-white mb-6">Recent Activity</h2>
                    <div className="space-y-6 flex-1">
                        {displayActivities.slice(0, 4).map((activity, i) => (
                            <div key={i} className="flex space-x-4">
                                <div className="mt-1">
                                    {activity.type === 'booking' && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
                                    {activity.type === 'event' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                    {activity.type === 'cancel' && <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>}
                                    {activity.type === 'alert' && <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-dark dark:text-gray-200 leading-snug">{activity.text}</p>
                                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsActivityModalOpen(true)}
                        className="w-full mt-6 py-2.5 text-sm text-primary font-bold hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 hover:border-primary/40"
                    >
                        View All Activity
                    </button>
                </div>
            </div>

            {/* View All Activity Modal */}
            {isActivityModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-dark dark:text-white">All System Activity</h2>
                            <button onClick={() => setIsActivityModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
                        </div>
                        
                        <div className="overflow-y-auto pr-2 space-y-6 flex-1">
                            {displayActivities.map((activity, i) => (
                                <div key={i} className="flex space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                    <div className="mt-1">
                                        {activity.type === 'booking' && <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>}
                                        {activity.type === 'event' && <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>}
                                        {activity.type === 'cancel' && <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></div>}
                                        {activity.type === 'alert' && <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-dark dark:text-gray-200">{activity.text}</p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-6 mt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button onClick={() => setIsActivityModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsTab;
