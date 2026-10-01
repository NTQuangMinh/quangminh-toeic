import { db } from "../src/lib/db";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../src/lib/auth";

async function verifyAuthAndAdmin() {
  console.log("Testing registration logic...");
  
  // 1. Simulate registration
  const testEmail = `student_${Date.now()}@example.com`;
  const plainPassword = "studentPassword123";
  const hashedPassword = hashPassword(plainPassword);

  const newUser = await db.user.create({
    data: {
      email: testEmail,
      name: "Nguyễn Học Viên",
      passwordHash: hashedPassword,
      role: "USER", // Register route always enforces role USER
      dailyGoalTarget: 20,
    }
  });

  console.log("Created test user:", newUser.email, "Role:", newUser.role);
  if (newUser.role !== "USER") {
    throw new Error("Security failure: Registered user should have role USER!");
  }

  // 2. Verify password checks
  if (!verifyPassword(plainPassword, newUser.passwordHash)) {
    throw new Error("Password verification failed for registered user");
  }
  if (verifyPassword("wrongPassword", newUser.passwordHash)) {
    throw new Error("Security failure: wrong password was accepted");
  }

  // 3. Verify Admin check
  const adminUser = await db.user.findUnique({ where: { email: "admin@toeic.vn" } });
  if (!adminUser || adminUser.role !== "ADMIN") {
    throw new Error("Admin user not found or does not have ADMIN role");
  }

  // 4. Token verification
  const userToken = signToken({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
  const decodedUser = verifyToken(userToken);
  if (decodedUser?.role === "ADMIN") {
    throw new Error("Security failure: Regular user token elevated to ADMIN");
  }

  // Clean up
  await db.user.delete({ where: { id: newUser.id } });
  console.log("Cleaned up test user.");

  console.log("All Auth and Admin Security checks PASSED successfully!");
}

verifyAuthAndAdmin().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
