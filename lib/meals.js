import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
import fs from "fs";

const db = sql("meals.db");

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return db.prepare("SELECT * FROM meals").all();
}

export async function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  let existingMeal = db
    .prepare("SELECT slug FROM meals WHERE slug = ?")
    .get(meal.slug);
  let slugSuffix = 1;

  while (existingMeal) {
    meal.slug = slugify(`${meal.title}-${slugSuffix}`, { lower: true });
    existingMeal = db
      .prepare("SELECT slug FROM meals WHERE slug = ?")
      .get(meal.slug);
    slugSuffix++;
  }

  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;

  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();

  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error("Saving image failed!");
    }
  });

  meal.image = `/images/${fileName}`;

  db.prepare(
    `
    INSERT INTO meals 
    (title, summary, instructions, creator, creator_email, image, slug)
    VALUES (
      @title,
      @summary, 
      @instructions, 
      @creator, 
      @creator_email,
      @image, 
      @slug
    )
    `
  ).run(meal);
}

export async function deleteMeal(slug) {
  const meal = db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);

  if (!meal) {
    throw new Error("Meal not found");
  }

  const imagePath = `public${meal.image}`;
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error("Failed to delete image:", err);
    }
  });

  db.prepare("DELETE FROM meals WHERE slug = ?").run(slug);
}
