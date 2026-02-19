import { setBrandDbFetcher, getBrandConfig } from "@bmr/core/brand";
import { getBrandByKey } from "./brandQueries";

setBrandDbFetcher(getBrandByKey);

export { getBrandConfig };
