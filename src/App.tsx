import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";
import Loading from "./components/ui/loading";

export default function App() {
  return (
    <>
      <Loading />
      <RouterProvider router={router} />
    </>
  );
}
