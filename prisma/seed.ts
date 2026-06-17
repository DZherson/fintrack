import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subMonths, subDays, format } from "date-fns";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Alimentación", icon: "🍔", color: "#f97316" },
  { name: "Transporte", icon: "🚗", color: "#3b82f6" },
  { name: "Salud", icon: "🏥", color: "#ef4444" },
  { name: "Entretenimiento", icon: "🎬", color: "#8b5cf6" },
  { name: "Trabajo", icon: "💼", color: "#10b981" },
  { name: "Ahorro", icon: "🏦", color: "#06b6d4" },
  { name: "Educación", icon: "📚", color: "#f59e0b" },
  { name: "Hogar", icon: "🏠", color: "#6366f1" },
  { name: "Otros", icon: "📦", color: "#6b7280" },
];

async function main() {
  console.log("🌱 Iniciando seed...");

  // Crear categorías predeterminadas (sin usuario)
  await prisma.category.deleteMany({ where: { isDefault: true } });
  const defaultCategories = await Promise.all(
    DEFAULT_CATEGORIES.map((cat) =>
      prisma.category.create({
        data: { ...cat, isDefault: true },
      }),
    ),
  );
  console.log(`✅ ${defaultCategories.length} categorías predeterminadas creadas`);

  // Crear usuario demo
  await prisma.user.deleteMany({ where: { email: "demo@fintrack.app" } });
  const hashedPassword = await bcrypt.hash("demo1234", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Usuario Demo",
      email: "demo@fintrack.app",
      password: hashedPassword,
    },
  });
  console.log(`✅ Usuario demo creado: demo@fintrack.app / demo1234`);

  // Usar categorías predeterminadas para el demo
  const cats = Object.fromEntries(defaultCategories.map((c) => [c.name, c.id]));

  // Generar transacciones para los últimos 6 meses
  const now = new Date();
  const transactions = [];

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const baseDate = subMonths(now, monthOffset);

    // Ingresos
    transactions.push({
      amount: 15000,
      type: TransactionType.INCOME,
      description: "Salario mensual",
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
      categoryId: cats["Trabajo"],
      userId: demoUser.id,
    });

    if (monthOffset % 2 === 0) {
      transactions.push({
        amount: 2500,
        type: TransactionType.INCOME,
        description: "Proyecto freelance",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 15),
        categoryId: cats["Trabajo"],
        userId: demoUser.id,
      });
    }

    // Gastos recurrentes
    transactions.push(
      {
        amount: 3500,
        type: TransactionType.EXPENSE,
        description: "Renta",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 5),
        categoryId: cats["Hogar"],
        userId: demoUser.id,
      },
      {
        amount: 1200,
        type: TransactionType.EXPENSE,
        description: "Supermercado semana 1",
        date: subDays(new Date(baseDate.getFullYear(), baseDate.getMonth(), 7), 0),
        categoryId: cats["Alimentación"],
        userId: demoUser.id,
      },
      {
        amount: 950,
        type: TransactionType.EXPENSE,
        description: "Supermercado semana 3",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 21),
        categoryId: cats["Alimentación"],
        userId: demoUser.id,
      },
      {
        amount: 600,
        type: TransactionType.EXPENSE,
        description: "Gasolina",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 10),
        categoryId: cats["Transporte"],
        userId: demoUser.id,
      },
      {
        amount: 400,
        type: TransactionType.EXPENSE,
        description: "Suscripciones (Netflix, Spotify)",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 3),
        categoryId: cats["Entretenimiento"],
        userId: demoUser.id,
      },
      {
        amount: 500,
        type: TransactionType.EXPENSE,
        description: "Ahorro mensual",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 28),
        categoryId: cats["Ahorro"],
        userId: demoUser.id,
      },
    );

    // Gastos variables
    if (monthOffset % 3 === 0) {
      transactions.push({
        amount: 1500,
        type: TransactionType.EXPENSE,
        description: "Consulta médica y medicamentos",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 18),
        categoryId: cats["Salud"],
        userId: demoUser.id,
      });
    }

    transactions.push({
      amount: 350,
      type: TransactionType.EXPENSE,
      description: "Restaurante con familia",
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 14),
      categoryId: cats["Alimentación"],
      userId: demoUser.id,
    });
  }

  await prisma.transaction.createMany({ data: transactions });
  console.log(`✅ ${transactions.length} transacciones creadas`);

  // Meta de ahorro: Vacaciones
  const vacationGoal = await prisma.savingGoal.create({
    data: {
      name: "Vacaciones de verano 2025",
      targetAmount: 20000,
      deadline: new Date(2025, 6, 1),
      userId: demoUser.id,
    },
  });

  await prisma.savingContribution.createMany({
    data: [
      { amount: 2000, note: "Primer aporte", date: subMonths(now, 4), savingGoalId: vacationGoal.id },
      { amount: 1500, note: "Bono de trabajo", date: subMonths(now, 3), savingGoalId: vacationGoal.id },
      { amount: 2500, date: subMonths(now, 2), savingGoalId: vacationGoal.id },
      { amount: 1800, date: subMonths(now, 1), savingGoalId: vacationGoal.id },
    ],
  });

  // Meta de ahorro: Laptop
  const laptopGoal = await prisma.savingGoal.create({
    data: {
      name: "Laptop nueva",
      targetAmount: 35000,
      deadline: new Date(2025, 11, 31),
      userId: demoUser.id,
    },
  });

  await prisma.savingContribution.createMany({
    data: [
      { amount: 5000, note: "Ahorro inicial", date: subMonths(now, 2), savingGoalId: laptopGoal.id },
      { amount: 3000, date: subMonths(now, 1), savingGoalId: laptopGoal.id },
    ],
  });

  console.log(`✅ 2 metas de ahorro creadas`);
  console.log(`\n🎉 Seed completado. Datos de acceso:`);
  console.log(`   Email: demo@fintrack.app`);
  console.log(`   Contraseña: demo1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
