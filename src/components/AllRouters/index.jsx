import { useRoutes } from "react-router-dom";
import { routers } from "../../routers";

function AllRouters (){
    const element = useRoutes(routers);
    return element;
}

export default AllRouters;