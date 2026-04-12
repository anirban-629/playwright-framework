// biome-ignore assist/source/organizeImports: < >
import { expect, mergeTests } from "@playwright/test";
import { authPage } from "./auth.fixture";
import { todoPage } from "./todo.fixture";
import { sauceDemoPage } from "./saucedemo.fixture";

const test = mergeTests(todoPage, sauceDemoPage, authPage);
export { test, expect };
