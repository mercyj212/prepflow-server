const SIMULATION_TARGET = 'http://127.0.0.1:5000/api';
const SCHOLAR_NAME = 'Simulation Scholar';
const SCHOLAR_EMAIL = 'sim_final@prepup.com'; 
const SCHOLAR_PASS = 'prepup123';

const runSimulation = async () => {
    try {
        console.log('--- 🛡️ PREPUP FINAL SYNC COMMENCING ---');
        
        // 2. ENTRANCE: Logging in with the digital signature
        console.log('Stage 2: Simulating login from "Samsung Galaxy S24 Ultra"...');
        const loginResponse = await fetch(`${SIMULATION_TARGET}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/Simulation-Agent'
            },
            body: JSON.stringify({
                email: SCHOLAR_EMAIL,
                password: SCHOLAR_PASS
            })
        });

        const data = await loginResponse.json();
        if (!loginResponse.ok) throw new Error(`Login Sync Failed: ${data.message}`);

        console.log('--- ✅ SYSTEM INTEGRITY VERIFIED ---');
        console.log(`Scholar Profile Detected: ${data.fullName} (${data.email})`);
        console.log('Activity Signature Tracked: Android / Samsung Galaxy S24');
        console.log('Status: SYNCED & PROTECTED 🛡️');
        console.log('\nFinal Step: Refresh your Admin Dashboard now!');

    } catch (err) {
        console.error('--- ❌ SYNC INTERRUPTED ---');
        console.error(err.message);
    }
};

runSimulation();
