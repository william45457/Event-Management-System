const bcrypt = require('bcrypt');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

const seedDatabase = async () => {
    try {
        console.log('Checking database status for seeding...');

        const salt = await bcrypt.genSalt(10);
        const defaultPasswordHash = await bcrypt.hash('password123', salt);

        // 1. Ensure default demo accounts exist
        let demoAdmin = await User.findOne({ email: 'admin@ems.com' });
        if (!demoAdmin) {
            demoAdmin = await User.create({
                name: 'System Admin (Demo)',
                email: 'admin@ems.com',
                password: defaultPasswordHash,
                role: 'Admin'
            });
            console.log('Created demo admin account: admin@ems.com');
        }

        let demoOrganizer = await User.findOne({ email: 'organizer@ems.com' });
        if (!demoOrganizer) {
            demoOrganizer = await User.create({
                name: 'Tech Events Organizer (Demo)',
                email: 'organizer@ems.com',
                password: defaultPasswordHash,
                role: 'Organizer'
            });
            console.log('Created demo organizer account: organizer@ems.com');
        }

        let demoUser = await User.findOne({ email: 'user@ems.com' });
        if (!demoUser) {
            demoUser = await User.create({
                name: 'Rahul Sharma (Demo)',
                email: 'user@ems.com',
                password: defaultPasswordHash,
                role: 'User'
            });
            console.log('Created demo attendee account: user@ems.com');
        }

        // 2. Ensure general database events exist
        const totalEvents = await Event.countDocuments();
        if (totalEvents === 0) {
            const seedEvents = [
                {
                    title: 'Global Tech Innovators Summit 2026',
                    description: 'The premier conference for tech innovators and startups.',
                    date: new Date('2026-08-15T09:00:00Z'),
                    time: '09:00',
                    location: 'Silicon Valley Center, CA',
                    category: 'Tech',
                    price: 299,
                    organizerId: demoOrganizer._id
                },
                {
                    title: 'React Developers Masterclass',
                    description: 'A hands-on coding workshop exploring React 19 and Server Components.',
                    date: new Date('2026-07-20T14:00:00Z'),
                    time: '14:00',
                    location: 'Online Workshop',
                    category: 'Tech',
                    price: 99,
                    organizerId: demoOrganizer._id
                },
                {
                    title: 'International Music & Arts Festival',
                    description: 'A weekend celebration of music, culture, and arts.',
                    date: new Date('2026-09-05T12:00:00Z'),
                    time: '12:00',
                    location: 'Golden Gate Park, San Francisco',
                    category: 'Entertainment',
                    price: 150,
                    organizerId: demoOrganizer._id
                }
            ];
            await Event.insertMany(seedEvents);
            console.log('Seeded default events.');
        }

        // 3. For ALL organizers (including existing ones like Abhishek), make sure they have at least some events
        const organizers = await User.find({ role: 'Organizer' });
        for (const org of organizers) {
            const orgEventCount = await Event.countDocuments({ organizerId: org._id });
            if (orgEventCount === 0) {
                console.log(`Seeding events for organizer: ${org.name}`);
                const orgSeedEvents = [
                    {
                        title: `${org.name.split(' ')[0]}'s Tech Summit`,
                        description: 'A premium summit exploring artificial intelligence, blockchain, and next-gen cloud computing.',
                        date: new Date('2026-07-10T10:00:00Z'),
                        time: '10:00',
                        location: 'Convention Hall A, NY',
                        category: 'Tech',
                        price: 199,
                        organizerId: org._id
                    },
                    {
                        title: `${org.name.split(' ')[0]}'s Startup Meetup`,
                        description: 'Connect with local startup founders, angels, and venture capitalists to pitch ideas.',
                        date: new Date('2026-08-25T17:00:00Z'),
                        time: '17:00',
                        location: 'Innovation Hub, Austin',
                        category: 'Business',
                        price: 49,
                        organizerId: org._id
                    }
                ];
                await Event.insertMany(orgSeedEvents);
            }
        }

        // 4. Ensure EVERY event has bookings so Organizers and Admins can see stats & revenue
        const allEvents = await Event.find();
        const attendees = await User.find({ role: 'User' });
        
        if (attendees.length > 0) {
            for (const event of allEvents) {
                const eventBookingsCount = await Booking.countDocuments({ eventId: event._id });
                if (eventBookingsCount === 0) {
                    console.log(`Seeding bookings for event: ${event.title}`);
                    // Let the first attendee book this event
                    const attendee = attendees[0];
                    await Booking.create({
                        eventId: event._id,
                        userId: attendee._id,
                        paymentStatus: 'Completed',
                        qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                    });
                    
                    // If there is another attendee, let them book it too
                    if (attendees.length > 1) {
                        const attendee2 = attendees[1];
                        await Booking.create({
                            eventId: event._id,
                            userId: attendee2._id,
                            paymentStatus: 'Completed',
                            qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                        });
                    }
                }
            }
        }

        // 5. Ensure EVERY attendee (including existing ones like Abhishek) has at least 1 booking
        for (const attendee of attendees) {
            const attendeeBookingsCount = await Booking.countDocuments({ userId: attendee._id });
            if (attendeeBookingsCount === 0 && allEvents.length > 0) {
                console.log(`Seeding a booking for attendee: ${attendee.name}`);
                // Find an event not organized by this attendee (events aren't organized by users anyway, but just in case)
                const eventToBook = allEvents[0];
                await Booking.create({
                    eventId: eventToBook._id,
                    userId: attendee._id,
                    paymentStatus: 'Completed',
                    qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                });
            }
        }

        console.log('Seeding process complete!');
    } catch (err) {
        console.error('Error seeding database:', err);
    }
};

module.exports = seedDatabase;
