import { expect, mergeTests } from "@playwright/test";
import { authPage } from "./auth.fixture";
import { todoPage } from "./todo.fixture";
import { sauceDemoPage } from "./saucedemo.fixture";
import { apiTest } from "./api.fixture";

const test = mergeTests(apiTest, todoPage, sauceDemoPage, authPage);
export { test, expect };
