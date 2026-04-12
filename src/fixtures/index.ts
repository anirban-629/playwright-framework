import { expect, mergeTests } from "@playwright/test";
import { todoPage } from "./todo.fixture";

const test = mergeTests(todoPage);
export { test, expect };
