import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3000/api';
let token: string;
let socket: Socket;

async function testNotifications() {
    try {
        console.log('Starting notification tests...\n');

        // 1. Login to get token
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        token = loginResponse.data.token;
        console.log('✓ Login successful\n');

        // 2. Setup WebSocket connection
        console.log('2. Setting up WebSocket connection...');
        socket = io('http://localhost:3000', {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log('✓ WebSocket connected\n');
        });

        socket.on('NOTIFICATION', (notification) => {
            console.log('Received notification:', notification);
        });

        // 3. Create a test team
        console.log('3. Creating test team...');
        const teamResponse = await axios.post(
            `${API_URL}/teams`,
            {
                name: 'Test Team',
                description: 'Team for testing notifications'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const teamId = teamResponse.data.id;
        console.log('✓ Team created\n');

        // 4. Create a test project
        console.log('4. Creating test project...');
        const projectResponse = await axios.post(
            `${API_URL}/projects`,
            {
                name: 'Test Project',
                description: 'Project for testing notifications',
                teamId
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const projectId = projectResponse.data.id;
        console.log('✓ Project created\n');

        // 5. Create an issue
        console.log('5. Creating test issue...');
        const issueResponse = await axios.post(
            `${API_URL}/issues`,
            {
                title: 'Test Issue',
                description: 'Issue for testing notifications',
                priority: 'HIGH',
                projectId
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const issueId = issueResponse.data.id;
        console.log('✓ Issue created\n');

        // 6. Add a comment with mention
        console.log('6. Adding comment with mention...');
        await axios.post(
            `${API_URL}/issues/${issueId}/comments`,
            {
                content: 'Testing notifications with @TestUser mention'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✓ Comment added\n');

        // 7. Update issue status
        console.log('7. Updating issue status...');
        await axios.patch(
            `${API_URL}/issues/${issueId}/status`,
            {
                status: 'IN_PROGRESS'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✓ Status updated\n');

        // 8. Get notifications
        console.log('8. Getting notifications...');
        const notificationsResponse = await axios.get(
            `${API_URL}/notifications`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Notifications:', notificationsResponse.data);
        console.log('✓ Notifications retrieved\n');

        // 9. Get notification stats
        console.log('9. Getting notification stats...');
        const statsResponse = await axios.get(
            `${API_URL}/notifications/stats`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Notification stats:', statsResponse.data);
        console.log('✓ Stats retrieved\n');

        // 10. Mark a notification as read
        if (notificationsResponse.data.length > 0) {
            console.log('10. Marking notification as read...');
            const notificationId = notificationsResponse.data[0].id;
            await axios.post(
                `${API_URL}/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('✓ Notification marked as read\n');
        }

        // 11. Mark all notifications as read
        console.log('11. Marking all notifications as read...');
        await axios.post(
            `${API_URL}/notifications/mark-all-read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✓ All notifications marked as read\n');

        console.log('All tests completed successfully! 🎉');

    } catch (error: any) {
        console.error('Test failed:', error.response?.data || error.message);
    } finally {
        if (socket) {
            socket.disconnect();
        }
    }
}

// Run the tests
testNotifications();