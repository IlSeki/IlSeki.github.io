import { redirect } from "next/navigation";

/**
 * Root home page. Redirects users straight to the lobby setup menu.
 */
export default function HomePage() {
  redirect("/lobby");
}
