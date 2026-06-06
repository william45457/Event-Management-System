import React, { useState } from 'react';

const EventsTab = ({ events, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || event.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'Upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-full md:w-1/3">
                    <input 
                        type="text" 
                        placeholder="Search events by name or location..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Upcoming', 'Ongoing', 'Completed'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-white shadow-soft' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Event Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => {
                        const dateObj = new Date(event.date);
                        const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                        const day = dateObj.getDate();

                        return (
                            <div key={event._id || event.id} className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 hover:border-primary/50 transition-colors flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary flex flex-col items-center justify-center border border-primary/20">
                                                <span className="text-xs font-bold">{month}</span>
                                                <span className="text-xl font-bold">{day}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-dark dark:text-white leading-tight">{event.title}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-2 mb-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(event.status || 'Upcoming')}`}>
                                            {event.status || 'Upcoming'}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-secondary/10 text-secondary dark:bg-secondary/20">
                                            {event.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2 flex justify-between items-center">
                                    <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Price: </span>
                                        <span className="font-bold text-dark dark:text-white">${event.price}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => onEdit(event)} className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary font-medium px-2 py-1">Edit</button>
                                        <button onClick={() => onDelete(event._id || event.id)} className="text-sm text-red-400 hover:text-red-600 font-medium px-2 py-1">Delete</button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No events found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsTab;
