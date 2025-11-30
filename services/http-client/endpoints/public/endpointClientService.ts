import { EndpointService } from "../../services/EndpointService";
import endpointHttpClient from "./endpointHttpClient";

const endpointService = new EndpointService(endpointHttpClient);
export default endpointService;