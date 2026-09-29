import { redirect } from "next/navigation";

/** Favourites and Saved are the same list now. */
export default function FavouritesPage() {
  redirect("/saved");
}
