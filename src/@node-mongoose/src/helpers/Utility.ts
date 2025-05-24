import { parseISO, parse, isValid } from "date-fns";
// import { fromZonedTime } from "date-fns-tz";
import { dateFormats } from "./lib";

// ## Convert date to UTC ##
// function convertToUTC(dateStr: string, formatStr: string, timeZone: string) {
//   // Parse the input date string
//   const parsedDate = parse(dateStr, formatStr, new Date());

//   // Convert the parsed date to UTC
//   const utcDate = fromZonedTime(parsedDate, timeZone);
//   console.log(utcDate.toISOString());
//   // Return the UTC date in ISO format
//   return utcDate.toISOString();
// }
export class Utility {
  static removeUndefined(data: Record<string, any>) {
    for (let key in data) {
      if (
        data[key] === undefined ||
        data[key] === null ||
        data[key] === "" ||
        data[key] === "null" ||
        data[key] === "undefined"
      ) {
        delete data[key];
      }
    }
  }
  static capitalizeFirstLetter(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  // exampleCamelCaseString to 'Example Camel Case String'
  static capitalizeCamelSpace(name: string) {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    return capitalized.replace(/([A-Z])/g, " $1").trim();
  }
  //send array and check all is same
  static isAllSameinArray(dataArray: any[], name: string | number) {
    if (dataArray.length === 0) return false; // or true, based on how you want to treat an empty array

    const firstElementName = name ?? dataArray[0];
    return dataArray.every((item) => item === firstElementName);
  }
  // let input = "   Hello   world!   This is    a test.  ";
  // "Hello world! This is a test."
  static trimNameLower(name: string) {
    if (typeof name !== "string") {
      throw new Error("Invalid type, expected string");
    }
    const trimmedName = name
      .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
    return trimmedName;
  }
  // const data = pick(req.body, [
  //   'title',
  //   'description',
  //   'date'
  // ]);
  static pickObj(obj: Record<string, any>, keys: any[]) {
    return keys.reduce((acc, key) => {
      if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
        acc[key] = obj[key];
      }
      return acc;
    }, {} as Record<string, any>);
  }

  static extractArrayItems(data: Record<string, any[]>) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value[0]])
    );
  }

  // static fromZonetoUtc(dateStr: string, timeZone: "America/New_York") {
  //   let utcDateStr;

  //   for (const formatStr of dateFormats) {
  //     try {
  //       // Attempt to parse the date string with the current format
  //       utcDateStr = convertToUTC(dateStr, formatStr, timeZone);
  //       break; // Break out of the loop if parsing is successful
  //     } catch (error) {
  //       // Continue with the next format if parsing fails
  //       continue;
  //     }
  //   }
  //   // If no valid format was found, throw an error
  //   if (!utcDateStr) {
  //     throw new Error("Unable to parse date with provided formats");
  //   }

  //   return utcDateStr;
  // }
  // ## Parse Date ##
  static parseDate(dateString: string): Date | null {
    if (!dateString) return null; // Handle null or undefined

    // Try parsing using ISO 8601 format first
    let parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) {
      return parsedDate;
    }
    // Try parsing with each format
    for (const formatString of dateFormats) {
      parsedDate = parse(dateString, formatString, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
    console.log("Invalid Date Format:", dateString);
    return null;
  }
}

// Define a type alias for the static methods of the `Operation` class
export type UtilityType = typeof Utility;
