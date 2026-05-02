"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("./db.js");
const seedDatabase = async () => {
    console.log('Seeding database...');
    const financialData = [
        { date: '2023-01-15', revenue: 5000, expenses: 1500 },
        { date: '2023-02-10', revenue: 5500, expenses: 1700 },
        { date: '2023-03-20', revenue: 6000, expenses: 1800 },
        { date: '2023-04-15', revenue: 6200, expenses: 1900 },
        { date: '2023-05-10', revenue: 6500, expenses: 2000 },
        { date: '2023-06-20', revenue: 6800, expenses: 2100 },
        { date: '2023-07-15', revenue: 7000, expenses: 2200 },
        { date: '2023-08-10', revenue: 7200, expenses: 2300 },
        { date: '2023-09-20', revenue: 7500, expenses: 2400 },
        { date: '2023-10-15', revenue: 7800, expenses: 2500 },
        { date: '2023-11-10', revenue: 8000, expenses: 2600 },
        { date: '2023-12-20', revenue: 8200, expenses: 2700 },
    ];
    const promises = financialData.map(data => db_js_1.db.collection('financialData').add(data));
    await Promise.all(promises);
    console.log('Database seeded successfully!');
};
(async () => {
    try {
        await seedDatabase();
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
})();
