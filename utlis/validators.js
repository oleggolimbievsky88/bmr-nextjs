// This function validates that the parameters are provided and that the years are valid numbers
export function validatePlatformParams(name, startYear, endYear) {
    // Check if name is provided and if the years are valid numbers
    if (!name || isNaN(startYear) || isNaN(endYear)) {
      return false;
    }
  
    // If all validations pass, return true
    return true;
  }
  