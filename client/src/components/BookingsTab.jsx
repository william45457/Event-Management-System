import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const BookingsTab = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [visibleCount, setVisibleCount] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchBookings = async () => {
        try {
            setFetching(true);
            const url = user.role === 'User' ? '/api/bookings/mybookings' : '/api/bookings';
            const res = await axios.get(url);
            setBookings(res.data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const handleLoadMore = () => {
        setIsLoading(true);
        setTimeout(() => {
            setVisibleCount(prev => prev + 5);
            setIsLoading(false);
        }, 600); // Simulate network delay
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Completed':
            case 'Confirmed': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Confirmed</span>;
            case 'Pending': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Pending</span>;
            case 'Failed':
            case 'Cancelled': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Cancelled</span>;
            default: return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{status}</span>;
        }
    };

    if (fetching) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading bookings...</div>;
    }

    return (
        <>
            <div className="glass-panel p-0 dark:bg-gray-800/70 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-dark dark:text-white">Recent Bookings</h2>
                    <button onClick={fetchBookings} className="text-sm text-primary hover:underline font-medium">Refresh</button>
                </div>
                
                <div className="overflow-x-auto">
                    {bookings.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                                    <th className="p-4 font-medium">Booking ID</th>
                                    <th className="p-4 font-medium">Attendee</th>
                                    <th className="p-4 font-medium">Event</th>
                                    <th className="p-4 font-medium">Date Purchased</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {bookings.slice(0, visibleCount).map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 text-sm font-semibold text-dark dark:text-white" title={booking._id}>
                                            BKG-{booking._id.substring(18).toUpperCase()}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-dark dark:text-white">{booking.userId?.name || user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{booking.userId?.email || 'N/A'}</p>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            {booking.eventId?.title || 'Removed Event'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-dark dark:text-white">
                                            ${booking.eventId?.price !== undefined ? booking.eventId.price : '0'}
                                        </td>
                                        <td className="p-4">{getStatusBadge(booking.paymentStatus)}</td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => setSelectedBooking(booking)}
                                                className="text-sm font-medium text-primary hover:text-indigo-700 dark:hover:text-indigo-400 mr-3"
                                            >
                                                View Ticket
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No bookings found.
                        </div>
                    )}
                </div>
                
                {visibleCount < bookings.length && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                        <button 
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </>
                            ) : (
                                "Load More Bookings"
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* View Booking Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-dark dark:text-white">Ticket details</h2>
                            <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
                                    <p className="font-bold text-dark dark:text-white">BKG-{selectedBooking._id.toUpperCase()}</p>
                                </div>
                                <div>{getStatusBadge(selectedBooking.paymentStatus)}</div>
                            </div>
                            
                            {selectedBooking.qrCodeUrl && (
                                <div className="text-center py-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Scan QR Code for Entry</p>
                                    <img src={selectedBooking.qrCodeUrl} alt="Booking QR Code" className="mx-auto w-40 h-40 border border-gray-100 dark:border-gray-700 rounded-xl p-2 bg-white" />
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Attendee Information</p>
                                <p className="font-bold text-dark dark:text-white text-lg">{selectedBooking.userId?.name || user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBooking.userId?.email || 'N/A'}</p>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Event</p>
                                <p className="font-bold text-dark dark:text-white">{selectedBooking.eventId?.title || 'Removed Event'}</p>
                            </div>
                            
                            <div className="flex justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Date Purchased</p>
                                    <p className="font-bold text-dark dark:text-white">{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Amount Paid</p>
                                    <p className="font-bold text-primary text-xl">${selectedBooking.eventId?.price !== undefined ? selectedBooking.eventId.price : '0'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-6 flex justify-end">
                            <button onClick={() => setSelectedBooking(null)} className="px-5 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingsTab;
