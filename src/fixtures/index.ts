import { expect, mergeTests } from "@playwright/test";
import { sauceDemoPage } from "./saucedemo.fixture";
import { todoPage } from "./todo.fixture";

const test = mergeTests(todoPage, sauceDemoPage);
export { test, expect };
