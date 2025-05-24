import { Utility } from "../helpers/Utility";

describe("Utility Class Tests", () => {
  // ## Test convertToUTC ##
  //   test('convertToUTC should correctly convert date string to UTC', () => {
  //     const dateStr = '2024-08-27 10:00:00';
  //     const formatStr = 'yyyy-MM-dd HH:mm:ss';
  //     const timeZone = 'America/New_York'; // Example time zone
  //     const result = Utility.convertToUTC(dateStr, formatStr, timeZone);
  //     expect(result).toBe('2024-08-27T14:00:00.000Z'); // Adjust expected value based on actual conversion
  //   });

  // ## Test removeUndefined ##
  test("removeUndefined should remove undefined, null, empty, and invalid values", () => {
    const data = {
      name: "John",
      age: undefined,
      address: null,
      email: "",
      phone: "123-456-7890",
      unknown: "undefined",
    };
    const expected = {
      name: "John",
      phone: "123-456-7890",
    };
    Utility.removeUndefined(data);
    expect(data).toEqual(expected);
  });

  // ## Test capitalizeFirstLetter ##
  test("capitalizeFirstLetter should capitalize the first letter of a string", () => {
    const input = "example";
    const result = Utility.capitalizeFirstLetter(input);
    expect(result).toBe("Example");
  });

  // ## Test capitalizeCamelSpace ##
  test("capitalizeCamelSpace should convert camelCase to spaced words", () => {
    const input = "exampleCamelCaseString";
    const result = Utility.capitalizeCamelSpace(input);
    expect(result).toBe("Example Camel Case String");
  });

  // ## Test isAllSameinArray ##
  test("isAllSameinArray should return true if all elements are the same", () => {
    const dataArray = [1, 1, 1];
    const result = Utility.isAllSameinArray(dataArray, 1);
    expect(result).toBe(true);
  });

  test("isAllSameinArray should return false if elements are not the same", () => {
    const dataArray = [1, 2, 3];
    const result = Utility.isAllSameinArray(dataArray, 1);
    expect(result).toBe(false);
  });

  // ## Test trimNameLower ##
  test("trimNameLower should trim and lowercase the input string", () => {
    const input = "   Hello   world!   This is    a test.  ";
    const result = Utility.trimNameLower(input);
    expect(result).toBe("hello world! this is a test.");
  });

  // ## Test pickObj ##
  test("pickObj should pick specified keys from an object", () => {
    const obj = {
      title: "Test",
      description: "Description",
      date: "2024-08-27",
    };
    const keys = ["title", "date"];
    const result = Utility.pickObj(obj, keys);
    expect(result).toEqual({ title: "Test", date: "2024-08-27" });
  });

  // ## Test extractArrayItems ##
  test("extractArrayItems should extract the first item from each array in the object", () => {
    const data = { a: ["texta"], b: ["textb"] };
    const result = Utility.extractArrayItems(data);
    expect(result).toEqual({ a: "texta", b: "textb" });
  });

  // ## Test fromZonetoUtc ##
  //   test("fromZonetoUtc should convert zoned date to UTC", () => {
  //     const dateStr = "2024-08-27 10:00:00";
  //     const timeZone = "America/New_York"; // Example time zone
  //     const result = Utility.fromZonetoUtc(dateStr, timeZone);
  //     expect(result).toBe("2024-08-27T14:00:00.000Z"); // Adjust expected value based on actual conversion
  //   });

  // ## Test parseDate ##
  test("parseDate should parse ISO 8601 and custom formatted dates", () => {
    const isoDate = "2024-08-27T00:00:00Z";
    const customDate = "27-08-2024";
    const invalidDate = "invalid-date";

    // Assuming dateFormats includes 'MM/dd/yyyy'
    const resultIso = Utility.parseDate(isoDate);
    expect(resultIso).toBeInstanceOf(Date);
    expect(resultIso?.toISOString()).toBe(new Date(isoDate).toISOString());

    const resultCustom = Utility.parseDate(customDate);
    expect(resultCustom).toBeInstanceOf(Date);

    const resultInvalid = Utility.parseDate(invalidDate);
    expect(resultInvalid).toBeNull();
  });
});
