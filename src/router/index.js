import { createBrowserRouter } from "react-router-dom";
import App from '../App';
import Common ,{loader as commonStaffLoader}from "../component/staff";
import Project,{loader as projectLoader} from "../component/project";
import Holiday ,{loader as holidayLoader}from "../component/holiday"
import Dispath,{loader as disLoader} from "../component/dispatch"
import Report from "../component/report"


const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "common",
        element: <Common />,
        loader:commonStaffLoader
      },
      {
        path: "project",
        element: <Project />,
        loader:projectLoader
      },
      {
        path: "holiday",
        element: <Holiday />,
          loader:holidayLoader
      },
      {
        path: "dispatch",
        element: <Dispath />,
        loader:disLoader
      },
      {
        path: "report",
        element: <Report />,
      },
    ],
  },
]);

export default Router;
