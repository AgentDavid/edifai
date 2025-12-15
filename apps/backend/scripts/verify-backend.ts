const API_URL = "http://localhost:4000/api";

const runVerification = async () => {
  try {
    console.log("--- Starting Backend Verification ---");

    // 1. Register Super Admin
    console.log("\n1. Registering Super Admin...");
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test_admin_2@edifai.com", // Changed email to avoid collision if testing repeatedly
        password: "password123",
        role: "super_admin",
        profile: {
          first_name: "Test",
          last_name: "Admin",
          phone: "+0000000002",
        },
        preferences: { notifications_channel: "EMAIL" },
      }),
    });

    // 2. Login
    console.log("\n2. Logging in...");
    // Login with the seeded user (Super Admin from seed-db.ts) to be safe and consistent
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "superadmin@edifai.com", // Using the seeded Super Admin
        password: "password123",
      }),
    });

    if (!loginResponse.ok)
      throw new Error(
        `Login failed: ${loginResponse.statusText} ${await loginResponse.text()}`
      );
    const loginData = (await loginResponse.json()) as any;
    const token = loginData.token;
    console.log("Login Successful. Token received.");

    // 4. Get a Condominium
    console.log("\n4. Fetching Condos...");
    const condosResponse = await fetch(`${API_URL}/condo`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!condosResponse.ok)
      throw new Error(
        `Fetch Condos failed: ${condosResponse.statusText} ${await condosResponse.text()}`
      );
    const condos = (await condosResponse.json()) as any[];

    if (condos.length === 0) throw new Error("No condos found. Seed DB first.");
    const condoId = condos[0]._id;
    console.log(`Found Condo: ${condos[0].name} (ID: ${condoId})`);

    // 5. Create Expense
    console.log("\n5. Creating Expense...");
    const expenseResponse = await fetch(`${API_URL}/condo/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        condominium_id: condoId,
        type: "FIXED",
        category: "Test Category",
        description: "Test Expense Description",
        amount: 100.0,
        status: "active",
      }),
    });

    if (!expenseResponse.ok)
      throw new Error(
        `Create Expense failed: ${expenseResponse.statusText} ${await expenseResponse.text()}`
      );
    console.log("Expense Created.");

    // 6. Calculate Fees (Closing Month)
    console.log("\n6. Calculating Fees...");
    const calcResponse = await fetch(`${API_URL}/condo/calculate-fees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        condominium_id: condoId,
        billing_period: "2025-12",
      }),
    });

    if (!calcResponse.ok)
      throw new Error(
        `Calculate Fees failed: ${calcResponse.statusText} ${await calcResponse.text()}`
      );
    const calcData = await calcResponse.json();
    console.log("Fees Calculated:", calcData);

    // 7. Create Ticket via API
    console.log("\n7. Creating Ticket...");
    const ticketResponse = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        condominium_id: condoId,
        type: "MAINTENANCE_REPORT",
        details: { description: "API Test Ticket" },
      }),
    });

    if (!ticketResponse.ok)
      throw new Error(
        `Create Ticket failed: ${ticketResponse.statusText} ${await ticketResponse.text()}`
      );
    const ticket = (await ticketResponse.json()) as any;
    console.log(`Ticket Created (ID: ${ticket._id})`);

    console.log("\n--- Backend Verification Complete: SUCCESS ---");
    process.exit(0);
  } catch (error) {
    console.error("Verification Failed:", error);
    process.exit(1);
  }
};

runVerification();
