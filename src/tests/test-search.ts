import axios from 'axios';
import { Priority, Status } from '@prisma/client';
import colors from 'colors';

const API_URL = 'http://localhost:3000/api';
let token: string;

interface TestIssue {
    title: string;
    description: string;
    priority: Priority;
    labels: string[];
    projectId: string;
}

const testIssues: TestIssue[] = [
    {
        title: "High Priority Bug",
        description: "Critical bug in login system",
        priority: Priority.HIGH,
        status: Status.OPEN,
        labels: ["bug", "urgent"]
    },
    {
        title: "Feature Enhancement",
        description: "Add dark mode support",
        priority: Priority.MEDIUM,
        status: Status.IN_PROGRESS,
        labels: ["feature", "ui"]
    },
    {
        title: "Low Priority Bug",
        description: "Minor styling issue",
        priority: Priority.LOW,
        status: Status.OPEN,
        labels: ["bug", "ui"]
    }
];

async function testSearchFunctionality() {
    try {
        console.log(colors.cyan('\nStarting Search Functionality Tests...\n'));

        // 1. Login
        console.log(colors.yellow('1. Logging in...'));
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: "test@example.com",
            password: "password123"
        });
        token = loginResponse.data.token;
        console.log(colors.green('✓ Login successful\n'));

        // 2. Create test team and project
        console.log(colors.yellow('2. Creating test team and project...'));
        const teamResponse = await axios.post(
            `${API_URL}/teams`,
            {
                name: "Search Test Team",
                description: "Team for testing search functionality"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const teamId = teamResponse.data.id;

        const projectResponse = await axios.post(
            `${API_URL}/projects`,
            {
                name: "Search Test Project",
                description: "Project for testing search",
                teamId
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const projectId = projectResponse.data.id;
        console.log(colors.green('✓ Team and project created\n'));

        // 3. Create test issues
         // Create test issues
         console.log(colors.yellow('3. Creating test issues...'));
         const testIssues: TestIssue[] = [
             {
                 title: "High Priority Bug",
                 description: "Critical bug in login system",
                 priority: Priority.HIGH,
                 labels: ["bug", "urgent"],
                 projectId: projectResponse.data.id
             },
             {
                 title: "Feature Enhancement",
                 description: "Add dark mode support",
                 priority: Priority.MEDIUM,
                 labels: ["feature", "ui"],
                 projectId: projectResponse.data.id
             },
             {
                 title: "Low Priority Bug",
                 description: "Minor styling issue",
                 priority: Priority.LOW,
                 labels: ["bug", "ui"],
                 projectId: projectResponse.data.id
             }
         ];
 
         for (const issueData of testIssues) {
             await axios.post(
                 `${API_URL}/issues`,
                 issueData,
                 { headers: { Authorization: `Bearer ${token}` } }
             );
         }
         console.log(colors.green('✓ Test issues created\n'));

        // 4. Test different search scenarios
        console.log(colors.yellow('4. Testing search scenarios...'));

        // 4.1 Search by text
        console.log(colors.blue('  4.1. Testing text search...'));
        const textSearchResult = await axios.get(
            `${API_URL}/search/issues?search=bug`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(colors.gray(`    Found ${textSearchResult.data.issues.length} issues containing "bug"`));

        // 4.2 Filter by priority
        console.log(colors.blue('  4.2. Testing priority filter...'));
        const prioritySearchResult = await axios.get(
            `${API_URL}/search/issues?priority=HIGH`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(colors.gray(`    Found ${prioritySearchResult.data.issues.length} high priority issues`));

        // 4.3 Filter by status
        console.log(colors.blue('  4.3. Testing status filter...'));
        const statusSearchResult = await axios.get(
            `${API_URL}/search/issues?status=OPEN`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(colors.gray(`    Found ${statusSearchResult.data.issues.length} open issues`));

        // 4.4 Filter by labels
        console.log(colors.blue('  4.4. Testing label filter...'));
        const labelSearchResult = await axios.get(
            `${API_URL}/search/issues?labels=bug,urgent`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(colors.gray(`    Found ${labelSearchResult.data.issues.length} issues with bug or urgent labels`));

        // 4.5 Complex search
        console.log(colors.blue('  4.5. Testing complex search...'));
        const complexSearchResult = await axios.get(
            `${API_URL}/search/issues?search=bug&priority=HIGH&status=OPEN&labels=urgent`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(colors.gray(`    Found ${complexSearchResult.data.issues.length} issues matching complex criteria`));

        // 5. Test saved filters
        console.log(colors.yellow('\n5. Testing saved filters...'));

        // 5.1 Save a filter
        console.log(colors.blue('  5.1. Saving a search filter...'));
        const savedFilter = await axios.post(
            `${API_URL}/search/filters`,
            {
                name: "High Priority Bugs",
                filter: {
                    search: "bug",
                    priority: ["HIGH"],
                    status: ["OPEN"],
                    labels: ["urgent"]
                }
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(colors.gray('    Filter saved successfully'));

        // 5.2 Get saved filters
        console.log(colors.blue('  5.2. Getting saved filters...'));
        const savedFilters = await axios.get(
            `${API_URL}/search/filters`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(colors.gray(`    Retrieved ${savedFilters.data.length} saved filters`));

        console.log(colors.green('\n✓ All search tests completed successfully! 🎉\n'));

    } catch (error) {
        console.error(colors.red('\nTest failed:'));
        console.error(colors.red(error.response?.data?.error || error.message));
    }
}

// Install required packages
// npm install colors axios @types/colors

// Run the test
testSearchFunctionality();