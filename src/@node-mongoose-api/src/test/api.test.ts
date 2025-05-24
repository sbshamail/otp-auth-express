import mongoose from "mongoose";
import { NodeMongooseApi } from "..";
import { message } from "../helpers/Messages";
import { handleAsync } from "../helpers/handleAsync";

// Define a test schema and model
const testSchema = new mongoose.Schema({
  name: String,
});
const testUniqueSchema = new mongoose.Schema({
  name: { type: String, unique: true },
});
const TestModel = mongoose.model("TestModel", testSchema);
const TestUniqueModel = mongoose.model("TestUniqueModel", testUniqueSchema);

const { createOp, updateOp, deleteOp } = NodeMongooseApi(TestModel);
const UniqueModel = NodeMongooseApi(TestUniqueModel);

describe("API Controllers Tests", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await TestModel.deleteMany({});
  });
  // ## Create
  test("create should create a new document", async () => {
    const data = { name: "testing" };
    const createdDoc = await createOp.create({ data });
    expect(createdDoc).toBeDefined();
    expect(createdDoc.name).toBe("testing");
  });
  test("create should handle unique field violation", async () => {
    const data1 = { name: "testing" };
    const data2 = { name: "testing" };

    // Create the first document
    await UniqueModel.createOp.create({ data: data1 });

    // Attempt to create a document with a duplicate unique field
    try {
      await UniqueModel.createOp.create({ data: data2 });
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toContain("E11000 duplicate key error collection");
    }
  });
  // test("should return a unique constraint error message", async () => {
  //   // Define an async function to create a document
  //   const createDoc = async () => {
  //     await UniqueModel.createOp.create({ data: { name: "UniqueName" } });
  //     await UniqueModel.createOp.create({ data: { name: "UniqueName" } }); // This should trigger a unique constraint error
  //   };

  //   // Wrap the function with handleAsync
  //   const handler = handleAsync(createDoc, "TestUniqueModel");

  //   // Mock the response and next function
  //   const res: any = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn(),
  //   };

  //   const next = jest.fn();

  //   // Call the handler function
  //   await handler({} as any, res, next);

  //   // Check if the response contains the correct error message
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.json).toHaveBeenCalledWith({
  //     status: "ERROR",
  //     message: expect.stringContaining("already exists"),
  //   });
  //   // expect(next).not.toHaveBeenCalled(); // Ensure `next` is not called with an error
  // });
  // ## Update
  test("updateById should update an existing document", async () => {
    const data = { name: "testing" };
    const createdDoc = await createOp.create({ data });
    const updateData = { name: "updated" };
    const updatedDoc = await updateOp.findByIdAndUpdate({
      id: createdDoc._id,
      data: updateData,
    });

    expect(updatedDoc).toBeDefined();
    expect(updatedDoc.name).toBe("updated");
  });

  test("updateMany should update multiple documents", async () => {
    const docs = await TestModel.insertMany([
      { name: "one" },
      { name: "two" },
      { name: "three" },
    ]);
    const ids: string[] = docs.map((doc) => doc._id.toString()); // Ensure correct type
    const updateData = { name: "updated" };
    const result = await updateOp.updateMany({
      ids,
      data: updateData,
    });

    expect(result.result.modifiedCount).toBe(3);
    expect(result.success).toBe(message.UPDATED_SUCCESS);
    const updatedDocs = await TestModel.find({ _id: { $in: ids } });
    updatedDocs.forEach((doc) => {
      expect(doc.name).toBe("updated");
    });
  });
  test("updateMany should handle empty IDs array", async () => {
    const result = await updateOp.updateMany({
      ids: [], // Empty IDs array
      data: { name: "updated" },
    });

    expect(result.error).toBeDefined();
  });

  // ## Delete
  test("deleteOne should delete an existing document", async () => {
    const data = { name: "testing" };
    const createdDoc = await createOp.create({ data });
    const deleteDoc = await deleteOp.deleteOne({
      id: createdDoc._id,
    });
    expect(deleteDoc).toBeDefined();
    expect(deleteDoc.success).toBe(message.DELETE_SUCCESS);
  });

  test("deleteMany should delete multiple documents", async () => {
    const docs = await TestModel.insertMany([
      { name: "one" },
      { name: "two" },
      { name: "three" },
    ]);
    const ids: string[] = docs.map((doc) => doc._id.toString()); // Ensure correct type

    const result = await deleteOp.deleteMany({
      ids,
    });
    expect(result.success).toBe(message.DELETE_SUCCESS);
  });
  test("deleteMany should handle empty IDs array", async () => {
    const result = await deleteOp.deleteMany({
      ids: [], // Empty IDs array
    });

    expect(result.error).toBeDefined();
  });
});
