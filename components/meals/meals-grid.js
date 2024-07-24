import MealItem from "./meal-item";
import classes from "./meals-grid.module.css";

export default function MealsGrid({ meals }) {
  console.log("qq");
  return (
    <ul className={classes.meals}>
      {meals.map((meal) => {
        return (
          <li key={meal.id}>
            <MealItem {...meal} />
          </li>
        );
      })}
    </ul>
  );
}
