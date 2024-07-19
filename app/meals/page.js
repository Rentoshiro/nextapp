import Link from "next/link";

export default function MealsPage() {
  return (
    <main>
      <p>Meals</p>
      <Link href="/meals/meal">Meal Page</Link>
    </main>
  );
}
