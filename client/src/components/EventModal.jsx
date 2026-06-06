import React, { useState, useEffect } from 'react';

const EventModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Tech');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDate(initialData.date ? initialData.date.substring(0, 10) : '');
            setTime(initialData.time || '');
            setLocation(initialData.location || '');
            setDescription(initialData.description || '');
            setCategory(initialData.category || 'Tech');
            setPrice(initialData.price || 0);
        } else {
            setTitle('');
            setDate('');
            setTime('');
            setLocation('');
            setDescription('');
            setCategory('Tech');
            setPrice(0);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            _id: initialData ? initialData._id : undefined,
            title, 
            date, 
            time,
            location,
            description,
            category,
            price: Number(price)
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-dark dark:text-white">
                        {initialData ? 'Edit Event' : 'Create New Event'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
                        <input 
                            type="text" 
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" 
                            placeholder="e.g., Tech Innovators Summit"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                            <input 
                                type="date" 
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                            <input 
                                type="time" 
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                        <input 
                            type="text" 
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" 
                            placeholder="e.g., San Francisco, CA or Online"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea 
                            required
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700 resize-none" 
                            placeholder="Provide a description of the event..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            >
                                <option value="Tech">Tech</option>
                                <option value="Business">Business</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                            <input 
                                type="number" 
                                min="0"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" 
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium">Cancel</button>
                        <button type="submit" className="btn-primary">
                            {initialData ? 'Save Changes' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;
